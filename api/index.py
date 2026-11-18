"""NilamTrace v2 Serverless FastAPI Backend

Assisted Inheritance Documentation & Case-Preparation Companion
- Act 1: Low-Literacy Tamil Voice Intake & Multi-Visit Pocket Code (#4821)
- Act 2: JanAI Café Assisted Scanning, Document X-Ray & Mandatory Field Verification
- Act 3: Voluntary Family Statement Log, Path Selection (Joint Patta vs Release Deed), & HITL Gate
"""
import io
import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

from api.config import settings
from api.models.schemas import (
    AddHeirStatementRequest,
    CaseState,
    DocumentStatus,
    HITLApprovalRequest,
    HITLApprovalResponse,
    InheritancePath,
    IntakeVoiceRequest,
    SelectPathRequest,
    SqueezeResult,
    VerifyFieldRequest,
)
from api.store.memory_store import store
from api.services.inheritance_rules import (
    compare_inheritance_paths,
    create_voluntary_heir_statement,
    evaluate_case_readiness,
)
from api.services.unit_math import (
    convert_units,
    calculate_shrinkage,
    hectare_to_cents,
    acre_to_cents,
    kuzhi_to_cents,
    ground_to_cents,
    parse_tamil_hectare_notation,
)
from api.services.pdf_compressor import squeeze_pdf, TARGET_MAX_BYTES
from api.services.dossier_generator import generate_dossier_pdf
from api.services.ai_extractor import extract_land_record_data

app = FastAPI(
    title="NilamTrace v2 API",
    version="2.0.0",
    description="Tamil Nadu Assisted Inheritance Documentation & Case-Preparation Companion",
)

# Robust CORS Configuration: supports localhost, local LAN IPs, Vercel preview/production domains, and mobile simulators
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length"],
)


@app.middleware("http")
async def add_cors_headers_middleware(request: Request, call_next):
    """Ensure CORS headers are attached to every single HTTP response, including exceptions."""
    if request.method == "OPTIONS":
        response = Response(status_code=200)
    else:
        response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Clean HTTP exception handler with CORS guarantees."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "success": False, "status_code": exc.status_code},
        headers={"Access-Control-Allow-Origin": "*"},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean validation error handler with CORS guarantees."""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "success": False, "message": "Request payload validation error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Global unhandled exception safety net with CORS guarantees."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server processing error", "error": str(exc), "success": False},
        headers={"Access-Control-Allow-Origin": "*"},
    )


@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    """Explicit OPTIONS preflight endpoint for complex browser fetch headers."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH",
            "Access-Control-Allow-Headers": "*",
        },
    )


@app.get("/api/health")
def health_check():
    """Healthcheck verifying server, store, and Groq fallback readiness."""
    return {
        "status": "healthy",
        "app": "NilamTrace v2",
        "version": "2.0.0",
        "groq_enabled": bool(settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 5),
        "groq_model": settings.GROQ_MODEL,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.get("/api/cases")
def list_cases():
    """List all registered multi-visit inheritance cases."""
    return [c.model_dump() for c in store.list_cases()]


@app.get("/api/cases/{case_id}")
def get_case_state(case_id: str):
    """Retrieve full canonical state of a case by 4-digit pocket code."""
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case #{case_id} not found in in-memory repository.",
        )
    return case.model_dump()


@app.post("/api/intake/voice")
def voice_intake(payload: IntakeVoiceRequest):
    """
    Act 1: Voice intake simulator.
    Maps spoken Tamil request to revenue village and assigns or resumes 4-digit pocket code.
    """
    case_id = payload.case_id or "4821"
    existing_case = store.get_case(case_id)

    if existing_case:
        if payload.survey_no:
            existing_case.new_survey_no = payload.survey_no
        if payload.deceased_name:
            existing_case.deceased_name = payload.deceased_name
        existing_case.timeline.append({
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "event": f"Voice intake interaction recorded ({payload.language.upper()} speech)",
            "actor": "Farmer / Phone Simulator",
        })
        updated = store.save_case(existing_case)
        return {
            "success": True,
            "case_id": case_id,
            "message": "Voice intake linked to persistent case.",
            "checklist": [item.model_dump() for item in updated.inventory],
            "case": updated.model_dump(),
        }

    # If new case requested
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_case = CaseState(
        case_id=case_id,
        case_title=f"Inherited Land Inquiry - {payload.village or 'Pakkam'}",
        case_title_ta=f"வாரிசு நில உரிமை விசாரணை - {payload.village or 'பாக்கம்'}",
        applicant_name="S. Selvaraj",
        applicant_name_ta="எஸ். செல்வராஜ்",
        phone=payload.caller_phone or "9840124821",
        district=payload.district or "Thiruvallur",
        taluk=payload.taluk or "Thiruvallur",
        village=payload.village or "Pakkam",
        new_survey_no=payload.survey_no or "114/2B",
        deceased_name=payload.deceased_name or "A. Subramaniam",
        deceased_name_ta="ஏ. சுப்பிரமணியம்",
        status="INTAKE",
        created_at=now_iso,
        updated_at=now_iso,
    )
    saved = store.save_case(new_case)
    return {
        "success": True,
        "case_id": case_id,
        "message": "New case initiated via voice intake.",
        "checklist": [item.model_dump() for item in saved.inventory],
        "case": saved.model_dump(),
    }


@app.post("/api/cases/{case_id}/verify-field")
def verify_field(case_id: str, payload: VerifyFieldRequest):
    """
    Act 2: Mandatory human operator verification of an extracted OCR field.
    Prevents silent acceptance of hallucinated or erroneous values.
    """
    updated = store.verify_field(
        case_id=case_id,
        field_name=payload.field_name,
        is_verified=payload.is_verified,
        corrected_value=payload.corrected_value,
        notes=payload.notes,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case #{case_id} not found.",
        )
    return {
        "success": True,
        "case_id": case_id,
        "verified_fields": {k: v.model_dump() for k, v in updated.verified_fields.items()},
        "critical_fields_verified": updated.critical_fields_verified,
        "status": updated.status,
    }


@app.post("/api/cases/{case_id}/inventory")
def update_inventory_doc(case_id: str, doc_type: str = Form(...), status_val: str = Form(...)):
    """Act 2: Updates document status in the multi-visit inventory."""
    try:
        doc_status = DocumentStatus(status_val)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid document status: {status_val}")

    updated = store.update_document_status(case_id, doc_type, doc_status)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    return {
        "success": True,
        "case_id": case_id,
        "inventory": [item.model_dump() for item in updated.inventory],
        "rev114_available": updated.rev114_available,
        "status": updated.status,
    }


@app.post("/api/cases/{case_id}/heirs")
def add_heir_statement(case_id: str, payload: AddHeirStatementRequest):
    """
    Act 3: Logs voluntary family structure with mandatory non-binding legal disclaimer.
    """
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    statement = create_voluntary_heir_statement(
        heir_name=payload.heir_name,
        relation=payload.relation,
        heir_name_ta=payload.heir_name_ta,
        relation_ta=payload.relation_ta,
        age=payload.age,
        attributed_to=payload.attributed_to,
    )
    case.heir_statements.append(statement)
    case.timeline.append({
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "event": f"Voluntary heir statement added: {payload.heir_name} ({payload.relation})",
        "actor": "JanAI Operator / Family",
    })
    saved = store.save_case(case)
    return {
        "success": True,
        "case_id": case_id,
        "heir_statements": [h.model_dump() for h in saved.heir_statements],
        "legal_disclaimer": statement.legal_disclaimer,
    }


@app.get("/api/cases/{case_id}/path-comparison")
def get_path_comparison(case_id: str):
    """Returns statutory comparison between Joint Patta vs Registered Release Deed."""
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    comparison = compare_inheritance_paths(
        heirs_count=len(case.heir_statements) or 3,
        estimated_guideline_value=1286390.0,
    )
    return {
        "case_id": case_id,
        "chosen_path": case.chosen_path.value,
        "comparison": comparison,
    }


@app.post("/api/cases/{case_id}/select-path")
def select_inheritance_path(case_id: str, payload: SelectPathRequest):
    """Act 3: Records family's chosen administrative path."""
    updated = store.select_path(case_id, payload.chosen_path)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    return {
        "success": True,
        "case_id": case_id,
        "chosen_path": updated.chosen_path.value,
        "status": updated.status,
    }


@app.post("/api/cases/{case_id}/generate-packet")
def generate_packet_check(case_id: str):
    """
    Validates readiness before generating application dossier.
    Enforces that all critical OCR fields are human-verified.
    """
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    readiness = evaluate_case_readiness(case)

    # Hard safety check: unverified critical fields fail with 400 Bad Request
    if not readiness["ready_for_patta_transfer"] and readiness["action_packet_type"] == "OPERATOR_VERIFICATION_REQUIRED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot export packet. Critical fields pending human operator verification: {', '.join(readiness['unverified_fields'])}.",
        )

    return {
        "success": True,
        "case_id": case_id,
        "readiness": readiness,
    }


@app.post("/api/cases/{case_id}/hitl-approve")
def hitl_approve(case_id: str, payload: HITLApprovalRequest):
    """
    Mandatory Human-in-the-Loop Gate.
    Verifies landowner voice consent + MFA OTP (demo accepts 1234).
    """
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    if payload.otp != "1234":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA OTP. Please enter 1234.",
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    case.hitl_approved = True
    case.hitl_approval_details = {
        "officer": payload.officer_name,
        "approved_at": now_iso,
        "voice_consent_confirmed": payload.voice_consent_confirmed,
        "token": f"HITL-TOKEN-{case_id}-{int(datetime.datetime.now().timestamp())}",
    }
    case.status = "DOSSIER_ISSUED"
    case.timeline.append({
        "timestamp": now_iso,
        "event": f"Human-in-the-Loop Approval Gate unlocked by {payload.officer_name}",
        "actor": "JanAI Operator / VAO Desk",
    })
    store.save_case(case)

    return HITLApprovalResponse(
        success=True,
        case_id=case_id,
        status="APPROVED",
        stamp_signature=f"TN-REV-{case_id}-APPROVED",
        approved_at=now_iso,
        dossier_download_url=f"/api/cases/{case_id}/dossier.pdf",
    )


@app.get("/api/cases/{case_id}/dossier.pdf")
def get_dossier_pdf(case_id: str):
    """
    Streams the verified ReportLab PDF application dossier.
    Strictly locked behind HITL approval (returns 403 Forbidden if not approved).
    """
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    if not case.hitl_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Human-in-the-loop approval and landowner voice confirmation required before dossier export.",
        )

    pdf_bytes = generate_dossier_pdf(case)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=NilamTrace_Inheritance_Packet_{case_id}.pdf"
        },
    )


@app.post("/api/squeeze-pdf")
async def run_squeeze_pdf(file: UploadFile = File(...)):
    """The 400 KB Squeeze Machine endpoint."""
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty PDF file uploaded.")

    compressed_bytes, result = squeeze_pdf(contents, original_filename=file.filename)
    return {
        "success": True,
        "result": result.model_dump(),
        "compressed_size_kb": round(len(compressed_bytes) / 1024, 2),
        "is_compliant": len(compressed_bytes) <= TARGET_MAX_BYTES,
    }


# Backward-compatible endpoints for prior flows
@app.post("/api/cases/{case_id}/analyze")
def analyze_case(case_id: str):
    """Triggers analysis and returns current case status."""
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")
    readiness = evaluate_case_readiness(case)
    return {
        "success": True,
        "case_id": case_id,
        "case": case.model_dump(),
        "readiness": readiness,
    }


@app.post("/api/cases/{case_id}/family-shares")
def family_shares(case_id: str, shares: List[Dict[str, Any]]):
    """Records family shares and returns updated state."""
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")
    return {"success": True, "case_id": case_id, "case": case.model_dump()}
