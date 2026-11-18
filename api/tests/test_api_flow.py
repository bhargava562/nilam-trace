"""Test Suite 3: End-to-End API Flow, Cold Start Hydration, Squeeze Machine & HITL Gate

Covers:
1. test_cold_start_sample_cases_exist: GET /api/cases/4821 and GET /api/cases/9012 return 200 OK
2. test_400kb_squeeze_compliance: Compresses a >2.5 MB sample PDF and asserts output <= 409,600 bytes (400 KB)
3. test_hitl_gate_enforces_lock: Calling GET /api/cases/4821/dossier.pdf before hitl approval returns 403 Forbidden
4. test_full_e2e_approval_and_pdf_generation: Completes voice intake -> analysis -> family split -> HITL OTP 1234 -> asserts valid %PDF- binary stream returned from /api/cases/4821/dossier.pdf
"""
import io
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from api.index import app
from api.services.pdf_compressor import squeeze_pdf, TARGET_MAX_BYTES

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store_state():
    """Reset store back to canonical pristine state before each test."""
    client.post("/api/reset")
    yield


def test_cold_start_sample_cases_exist():
    """
    Test 1: Verify cold-start hydration of canonical Tamil demo cases:
    - Case #4821 (Thiruvallur Loan Rescue: Deceased Father + -4.76 Cents Shrinkage + UDR Survey Link)
    - Case #9012 (Meikkal Poramboke Red-Zone Trap)
    Both return 200 OK and match canonical revenue attributes.
    """
    # Case #4821: Thiruvallur Loan Rescue
    resp_4821 = client.get("/api/cases/4821")
    assert resp_4821.status_code == 200, f"Expected 200 OK for case 4821, got {resp_4821.status_code}"
    data_4821 = resp_4821.json()
    assert data_4821["case_id"] == "4821"
    assert data_4821["applicant_name"] == "S. Murugan"
    assert data_4821["district"] == "Thiruvallur"
    assert data_4821["old_survey_no"] == "45/2"
    assert data_4821["new_survey_no"] == "114/2B"
    assert data_4821["deed_area_cents"] == 48.0
    assert data_4821["patta_area_cents"] == 43.24
    assert data_4821["area_delta_cents"] == -4.76
    assert data_4821["is_red_zone"] is False
    assert len(data_4821["discrepancies"]) >= 2
    assert len(data_4821["family_shares"]) == 2

    # Case #9012: Poramboke Red-Zone Trap
    resp_9012 = client.get("/api/cases/9012")
    assert resp_9012.status_code == 200, f"Expected 200 OK for case 9012, got {resp_9012.status_code}"
    data_9012 = resp_9012.json()
    assert data_9012["case_id"] == "9012"
    assert data_9012["is_red_zone"] is True
    assert "poramboke" in data_9012["land_classification"].lower()
    assert data_9012["status"] == "REJECTED_RED_ZONE"
    assert data_9012["loan_eligibility"] == "CRITICAL_RED_ZONE_BLOCKED"


def test_400kb_squeeze_compliance():
    """
    Test 2: Compresses a >2.5 MB sample PDF and asserts output <= 409,600 bytes (400 KB).
    Tamil Nadu Revenue Portals strictly reject any document exceeding 400 KB with gateway timeouts.
    The Squeeze Machine must compress or auto-split so output conforms to <= 409,600 bytes.
    """
    # Synthesize a multi-page PDF with high-entropy scans exceeding 2.5 MB (2,621,440 bytes)
    num_pages = 10
    images = [
        Image.fromarray(np.random.randint(0, 255, (700, 700, 3), dtype=np.uint8))
        for _ in range(num_pages)
    ]
    raw_pdf_buf = io.BytesIO()
    images[0].save(raw_pdf_buf, format="PDF", save_all=True, append_images=images[1:])
    raw_pdf_bytes = raw_pdf_buf.getvalue()

    original_size = len(raw_pdf_bytes)
    assert original_size > 2.5 * 1024 * 1024, (
        f"Synthetic PDF must be > 2.5 MB, got {original_size / 1024 / 1024:.2f} MB"
    )

    # Test compression service directly
    compressed_bytes, squeeze_res = squeeze_pdf(raw_pdf_bytes)
    assert len(compressed_bytes) <= TARGET_MAX_BYTES, (
        f"Compressed output must be <= 409,600 bytes, got {len(compressed_bytes)}"
    )
    assert squeeze_res.compliant is True
    assert squeeze_res.compressed_bytes <= 409600

    # Test via FastAPI endpoint /api/squeeze-pdf
    upload_file = io.BytesIO(raw_pdf_bytes)
    resp = client.post(
        "/api/squeeze-pdf",
        files={"file": ("oversized_deed_scan.pdf", upload_file, "application/pdf")},
    )
    assert resp.status_code == 200
    assert len(resp.content) <= TARGET_MAX_BYTES
    assert resp.headers.get("X-Compliant") == "True"
    assert int(resp.headers.get("X-Compressed-Bytes", 0)) <= 409600


def test_hitl_gate_enforces_lock():
    """
    Test 3: Calling GET /api/cases/4821/dossier.pdf before HITL approval returns 403 Forbidden.
    Guarantees unverified drafts cannot be exported to commercial banks.
    """
    # Ensure fresh reset case 4821 is NOT approved
    case_resp = client.get("/api/cases/4821")
    assert case_resp.json()["hitl_approved"] is False

    # Attempt to download bank collateral dossier without VAO officer approval
    dossier_resp = client.get("/api/cases/4821/dossier.pdf")
    assert dossier_resp.status_code == 403, (
        f"Expected 403 Forbidden prior to HITL approval, got {dossier_resp.status_code}"
    )
    assert "HITL Gate Locked" in dossier_resp.json()["detail"]


def test_full_e2e_approval_and_pdf_generation():
    """
    Test 4: Complete end-to-end autonomous audit flow:
    1. Voice Intake (Act 1: Missed-Call & Tamil Voice) -> 200 OK
    2. Deep Analysis (Act 2: Title Graph & Unit Math) -> 200 OK
    3. Family Split Consent (Act 3: Speakerphone Heir Consent) -> 200 OK
    4. HITL Approval with Officer OTP 1234 -> 200 OK
    5. Dossier Download -> Valid %PDF- binary stream
    """
    case_id = "4821"

    # Step 1: Voice Intake Call Simulator
    voice_resp = client.post(
        "/api/intake/voice",
        json={
            "case_id": case_id,
            "language": "ta",
            "audio_text": "வணக்கம், என் பெயர் முருகன். திருவள்ளூர் பொன்னேரி பெரும்பேடு நில கடன் தேவை.",
            "caller_phone": "+91 98401 23456",
        },
    )
    assert voice_resp.status_code == 200
    assert voice_resp.json()["status"] == "CONNECTED"
    assert voice_resp.json()["case_id"] == case_id

    # Step 2: Run Full Title Analysis (Area Shrinkage, UDR, Inheritance)
    ana_resp = client.post(f"/api/cases/{case_id}/analyze")
    assert ana_resp.status_code == 200
    ana_data = ana_resp.json()
    assert ana_data["case_id"] == case_id
    assert any(d["type"] == "AREA_SHRINKAGE_UNRECORDED_SUBDIVISION" for d in ana_data["discrepancies"])
    assert any(d["type"] == "RESOLVED_UDR_SURVEY_LINK" for d in ana_data["discrepancies"])

    # Step 3: Record Speakerphone Heir Consent (Sister Selvi 50% consent)
    share_resp = client.post(
        f"/api/cases/{case_id}/family-shares",
        json={
            "person_id": "HEIR-002",
            "consent": True,
            "phone_last4": "9812",
        },
    )
    assert share_resp.status_code == 200
    share_data = share_resp.json()
    assert any(
        ("selvi" in s["name"].lower() or s["person_id"] in ("HEIR-002", "P2"))
        and s["consent_status"] == "CONSENTED"
        for s in share_data["family_shares"]
    )

    # Step 4: Officer HITL Approval with Demo OTP 1234
    # Test invalid OTP first
    invalid_hitl = client.post(
        f"/api/cases/{case_id}/hitl-approve",
        json={
            "case_id": case_id,
            "officer_name": "VAO T. Ramanathan",
            "otp": "9999",
            "comments": "Invalid test PIN",
        },
    )
    assert invalid_hitl.status_code == 400

    # Valid OTP 1234
    hitl_resp = client.post(
        f"/api/cases/{case_id}/hitl-approve",
        json={
            "case_id": case_id,
            "officer_name": "VAO T. Ramanathan",
            "otp": "1234",
            "comments": "Inspected FMB stone boundaries. Co-parcener consent confirmed on speakerphone.",
            "voice_consent_confirmed": True,
        },
    )
    assert hitl_resp.status_code == 200
    hitl_data = hitl_resp.json()
    assert hitl_data["success"] is True
    assert hitl_data["status"] == "APPROVED"
    assert "VAO-STAMP" in hitl_data["stamp_signature"]

    # Step 5: Export Final Stamped Collateral Dossier & Assert %PDF- binary header
    dossier_resp = client.get(f"/api/cases/{case_id}/dossier.pdf")
    assert dossier_resp.status_code == 200, (
        f"Expected 200 OK after HITL approval, got {dossier_resp.status_code}"
    )
    assert dossier_resp.headers.get("content-type") == "application/pdf"
    assert dossier_resp.content.startswith(b"%PDF-"), "Response content must be a valid PDF binary stream"
    assert len(dossier_resp.content) > 1000
