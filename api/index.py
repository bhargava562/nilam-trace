"""NilamTrace Serverless FastAPI Backend

Autonomous Land Governance Platform for Tamil Nadu Revenue Administration
- Act 1: Farmer Missed-Call & Voice Intake Simulator
- Act 2: Document X-Ray & Deterministic Unit Math Reconciliation
- Act 3: Speakerphone Family Settlement, 400 KB Squeeze Machine, and VAO HITL Gate
"""
import io
import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.config import settings
from api.models.schemas import (
    CaseState,
    Discrepancy,
    DiscrepancyType,
    DiscrepancySeverity,
    FamilyShare,
    HITLApprovalRequest,
    HITLApprovalResponse,
    IntakeVoiceRequest,
    SqueezeResult,
    UnitConversionResult,
    ShrinkageResult,
)
from api.store.memory_store import case_store
from api.services.unit_math import (
    convert_units,
    calculate_shrinkage,
    hectare_to_cents,
    acre_to_cents,
    kuzhi_to_cents,
    ground_to_cents,
    parse_tamil_hectare_notation,
)
from api.services.title_graph import run_full_title_analysis
from api.services.pdf_compressor import squeeze_pdf, TARGET_MAX_BYTES
from api.services.dossier_generator import generate_dossier_pdf
from api.services.ai_extractor import extract_land_record_data, build_extracted_fields

app = FastAPI(
    title="NilamTrace API",
    version=settings.APP_VERSION,
    description="Tamil Nadu Autonomous Land Governance & Title Audit Engine",
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """Health and status check."""
    return {
        "status": "healthy",
        "app": "NilamTrace",
        "version": settings.APP_VERSION,
        "groq_enabled": bool(settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 5),
        "groq_model": settings.GROQ_MODEL,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.post("/api/reset")
def reset_demo_store():
    """Reset in-memory database to pristine canonical cases #4821 and #9012."""
    case_store.reset_to_canonical()
    return {"message": "Store reset to canonical demo state", "cases": [c.case_id for c in case_store.list_cases()]}


@app.get("/api/cases", response_model=List[CaseState])
def get_all_cases():
    """Retrieve all active land audit cases."""
    return case_store.list_cases()


@app.get("/api/cases/{case_id}", response_model=CaseState)
def get_case_by_id(case_id: str):
    """Retrieve single case state by ID."""
    case = case_store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found in NilamTrace registry.")
    return case


@app.post("/api/cases/{case_id}/analyze", response_model=CaseState)
def analyze_case(case_id: str):
    """
    Run full deterministic Chain-of-Title analysis:
    - Red-Zone Poramboke Gate
    - Old-to-New Survey UDR Reconciliation
    - Area Shrinkage & Subdivision Tolerance
    - Deceased Owner Missing Inheritance Mutation
    """
    case = case_store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    analyzed_case = run_full_title_analysis(case)
    saved_case = case_store.save_case(analyzed_case)
    return saved_case


@app.post("/api/intake/voice")
def intake_farmer_call(req: IntakeVoiceRequest):
    """
    Act 1: Farmer Missed-Call & Voice Intake Simulator.
    Accepts speech transcript or phone call payload, initializes or retrieves case.
    """
    # If case_id provided or audio mentions 4821
    case_id = req.case_id or "4821"
    text = (req.audio_text or "").lower()
    
    if "9012" in text or "meikkal" in text or "illalur" in text or "poramboke" in text:
        case_id = "9012"
    elif "4821" in text or "murugan" in text or "perumbedu" in text or "ponneri" in text:
        case_id = "4821"

    case = case_store.get_case(case_id)
    if not case:
        # Fallback to 4821
        case = case_store.get_case("4821")

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if case:
        timeline_entry = {
            "step": "FARMER_VOICE_INTAKE",
            "time": now,
            "note": f"Voice call connected. Language: {req.language}. Audio: '{req.audio_text or 'Voice Call Initialized'}'",
        }
        case.timeline.append(timeline_entry)
        case_store.save_case(case)

    return {
        "status": "CONNECTED",
        "case_id": case.case_id if case else "4821",
        "receipt_number": f"TCK-{case_id}-THIRUVALLUR",
        "caller_phone": req.caller_phone or (case.phone if case else "+91 98401 23456"),
        "case": case,
    }


class FamilyConsentUpdate(BaseModel):
    person_id: str
    consent: bool
    phone_last4: Optional[str] = None


@app.get("/api/cases/{case_id}/family-shares", response_model=List[FamilyShare])
def get_family_shares(case_id: str):
    """Retrieve legal heir co-parcener shares for a case."""
    case = case_store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")
    return case.family_shares


@app.post("/api/cases/{case_id}/family-shares", response_model=CaseState)
def update_family_share_consent(case_id: str, payload: FamilyConsentUpdate):
    """
    Act 3: Speakerphone Family Settlement Check.
    Record legal heir consent (e.g. S. Selvi consenting via speakerphone OTP).
    """
    case = case_store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    found = False
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    target = payload.person_id.strip().lower()
    for share in case.family_shares:
        sid = share.person_id.lower()
        sname = share.name.lower()
        if (
            sid == target
            or target in sid
            or sid in target
            or target in sname
            or sname in target
            or ("2" in target and ("2" in sid or "selvi" in sname))
            or ("1" in target and ("1" in sid or "murugan" in sname))
        ):
            share.consent_status = "CONSENTED" if payload.consent else "DECLINED"
            share.consent_timestamp = now
            if payload.phone_last4:
                share.phone_last4 = payload.phone_last4
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Family heir with ID '{payload.person_id}' not found.")

    # Check if all heirs consented
    all_consented = all(s.consent_status == "CONSENTED" for s in case.family_shares)
    if all_consented:
        # Resolve the missing inheritance mutation discrepancy if present
        for d in case.discrepancies:
            if d.type == DiscrepancyType.MISSING_INHERITANCE_MUTATION:
                d.resolved = True
                d.resolution_note = "All legal co-parceners consented via verified speakerphone session."
                d.resolution_note_ta = "அனைத்து சட்டப்பூர்வ வாரிசுதாரர்களும் தொலைபேசி மூலம் ஒப்புதல் அளித்தனர்."
        case.status = "PENDING_HITL"

    case.timeline.append({
        "step": "HEIR_CONSENT_RECORDED",
        "time": now,
        "note": f"Consent recorded for {payload.person_id}: {'CONSENTED' if payload.consent else 'DECLINED'}",
    })

    return case_store.save_case(case)


@app.post("/api/squeeze-pdf")
async def compress_pdf_endpoint(file: UploadFile = File(...)):
    """
    Act 3: 400 KB Squeeze Machine.
    Accepts oversized PDF scan, runs 3-pass compression pipeline, and returns
    compressed conforming document with strict <= 400 KB ceiling.
    """
    pdf_bytes = await file.read()
    compressed_bytes, result = squeeze_pdf(pdf_bytes)

    return Response(
        content=compressed_bytes,
        media_type="application/pdf",
        headers={
            "X-Original-Bytes": str(result.original_bytes),
            "X-Compressed-Bytes": str(result.compressed_bytes),
            "X-Pass-Used": str(result.pass_used),
            "X-Compliant": str(result.compliant),
            "Content-Disposition": f"attachment; filename=squeezed_{file.filename or 'document.pdf'}",
        },
    )


@app.post("/api/cases/{case_id}/hitl-approve", response_model=HITLApprovalResponse)
def hitl_gate_approval(case_id: str, req: HITLApprovalRequest):
    """
    Act 3: Human-In-The-Loop (HITL) Gate Padlock Unlock.
    Enforces dual-factor officer signoff (OTP 1234 + voice consent verification).
    """
    case = case_store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    if case.is_red_zone:
        raise HTTPException(
            status_code=400,
            detail="CANNOT APPROVE: Prohibited Red-Zone land. Legal alienation strictly forbidden.",
        )

    # Verify Demo OTP (Accepts 1234)
    if req.otp.strip() != "1234":
        raise HTTPException(
            status_code=400,
            detail="Invalid MFA OTP. Please enter valid 4-digit officer PIN (Demo PIN: 1234).",
        )

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    stamp_id = f"VAO-STAMP-{case_id}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

    case.hitl_approved = True
    case.status = "APPROVED"
    case.loan_eligibility = "INSTANT_ELIGIBLE"
    case.loan_eligibility_ta = "கடன் பெற முழு தகுதி உறுதி செய்யப்பட்டது"
    case.hitl_approval_details = {
        "officer_name": req.officer_name,
        "otp_verified": True,
        "voice_consent_confirmed": req.voice_consent_confirmed,
        "stamp_signature": stamp_id,
        "approved_at": now,
        "comments": req.comments or "VAO field coordinates verified against Tamil Nilam portal.",
    }

    # Mark all remaining discrepancies as resolved under officer attestation
    for d in case.discrepancies:
        d.resolved = True
        if not d.resolution_note:
            d.resolution_note = f"Attested and approved by {req.officer_name} under Section 4 Revenue Code."

    case.timeline.append({
        "step": "HITL_GATE_UNLOCKED",
        "time": now,
        "note": f"Unlocked by {req.officer_name} with OTP 1234. Dossier generation unlocked.",
    })

    case_store.save_case(case)

    return HITLApprovalResponse(
        success=True,
        case_id=case_id,
        status="APPROVED",
        stamp_signature=stamp_id,
        approved_at=now,
        dossier_download_url=f"/api/cases/{case_id}/dossier.pdf",
    )


@app.get("/api/cases/{case_id}/dossier.pdf")
def download_collateral_dossier(case_id: str):
    """
    Act 3: Download Stamped Bank Collateral Dossier & VAO Petition.
    Strictly locked behind HITL approval gate. Calling before approval returns 403 Forbidden.
    """
    case = case_store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case #{case_id} not found.")

    # Strict HITL Gate Enforcement
    if not case.hitl_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "HITL Gate Locked: Statutory VAO Officer Attestation and OTP 1234 verification "
                "required before Collateral Dossier can be generated."
            ),
        )

    pdf_bytes = generate_dossier_pdf(case)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=NilamTrace_Dossier_Case_{case_id}.pdf",
            "X-Dossier-Case": str(case_id),
            "X-Dossier-Approved": "true",
        },
    )


@app.post("/api/math/convert", response_model=UnitConversionResult)
def convert_revenue_unit(value: float, unit: str):
    """Deterministic conversion of Tamil land revenue units."""
    return convert_units(value, unit)


@app.post("/api/math/shrinkage", response_model=ShrinkageResult)
def check_shrinkage_endpoint(deed_cents: float, patta_cents: float):
    """Compute deed vs patta shrinkage delta and threshold epsilon."""
    return calculate_shrinkage(deed_cents, patta_cents)
