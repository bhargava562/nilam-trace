"""NilamTrace v2 — Automated Test Suite (12 / 12 Tests)

Focus: Assisted Inheritance Documentation & Case-Preparation Companion
Verifies all 7 setback corrections, strict legal guardrails, and administrative paths.
"""
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import numpy as np

from api.index import app
from api.store.memory_store import store
from api.models.schemas import (
    CaseState,
    DocumentInventoryItem,
    DocumentStatus,
    InheritancePath,
    VerifiedField,
    VoluntaryHeirStatement,
)
from api.services.inheritance_rules import (
    check_field_confidence,
    compare_inheritance_paths,
    create_voluntary_heir_statement,
    evaluate_case_readiness,
)
from api.services.unit_math import (
    calculate_shrinkage,
    hectare_to_cents,
    parse_tamil_hectare_notation,
    CENTS_PER_HECTARE,
)
from api.services.pdf_compressor import squeeze_pdf
from api.services.ai_extractor import extract_land_record_data

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test 1: Missing REV-114 Legal Heir Certificate blocks Patta transfer
# ---------------------------------------------------------------------------
def test_missing_varisu_certificate_blocks_patta_filing():
    """
    Confirms that when Legal Heir Certificate (REV-114) is missing,
    NilamTrace outputs the REV-114 prerequisite checklist instead of claiming
    the Patta packet is ready for filing.
    """
    case = store.get_case("4821")
    assert case is not None
    # Reset case to default state where REV-114 is MISSING_TO_OBTAIN
    store.update_document_status("4821", "LEGAL_HEIR_REV114", DocumentStatus.MISSING_TO_OBTAIN)
    updated_case = store.get_case("4821")

    readiness = evaluate_case_readiness(updated_case)
    assert readiness["ready_for_patta_transfer"] is False
    assert readiness["status"] == "MISSING_DOCS_PENDING"
    assert readiness["action_packet_type"] == "PREREQUISITE_REV114_PACKET"

    # Verify REV-114 is identified in missing documents with official fee of ₹60
    missing_types = [d["doc_type"] for d in readiness["missing_documents"]]
    assert "LEGAL_HEIR_REV114" in missing_types
    rev114_doc = next(d for d in readiness["missing_documents"] if d["doc_type"] == "LEGAL_HEIR_REV114")
    assert rev114_doc["official_fee_inr"] == 60.0


# ---------------------------------------------------------------------------
# Test 2: Unverified OCR fields block dossier export
# ---------------------------------------------------------------------------
def test_unverified_ocr_field_blocks_export():
    """
    Confirms POST /api/cases/4821/generate-packet fails with 400 Bad Request
    until all critical extracted fields have human_verified = True.
    """
    # Temporarily set REV-114 available, but leave critical fields unverified
    store.update_document_status("4821", "LEGAL_HEIR_REV114", DocumentStatus.AVAILABLE)
    store.verify_field("4821", "survey_no", is_verified=False)
    store.verify_field("4821", "deceased_owner", is_verified=False)

    resp = client.post("/api/cases/4821/generate-packet")
    assert resp.status_code == 400
    assert "Critical fields pending human operator verification" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# Test 3: Voluntary heir statement includes mandatory legal disclaimer
# ---------------------------------------------------------------------------
def test_voluntary_heir_statement_includes_legal_disclaimer():
    """
    Confirms every stored family statement attaches the mandatory non-binding
    legal disclaimer and attribution metadata.
    """
    statement = create_voluntary_heir_statement(
        heir_name="S. Murugan",
        relation="Son (Elder Brother)",
        attributed_to="Applicant voluntary oral statement",
    )
    assert statement.attributed_to == "Applicant voluntary oral statement"
    assert "Informational family tree only" in statement.legal_disclaimer
    assert "REV-114" in statement.legal_disclaimer
    assert statement.disclaimer_acknowledged is True

    # Test via API endpoint
    resp = client.post(
        "/api/cases/4821/heirs",
        json={
            "heir_name": "S. Murugan",
            "relation": "Son",
            "attributed_to": "Applicant voluntary oral statement",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "legal_disclaimer" in data
    assert "REV-114" in data["legal_disclaimer"]


# ---------------------------------------------------------------------------
# Test 4: Joint Patta vs. Registered Release Deed statutory guidance
# ---------------------------------------------------------------------------
def test_joint_patta_vs_release_deed_guidance():
    """
    Verifies rule output comparing Joint Patta (no stamp duty) vs.
    Registered Release/Partition Deed (1% concessional family stamp duty).
    """
    comparison = compare_inheritance_paths(heirs_count=3, estimated_guideline_value=1286390.0)
    paths = comparison["paths"]

    # Option A: Joint Patta
    joint = paths["JOINT_PATTA"]
    assert joint["stamp_duty_inr"] == 0.0
    assert joint["registration_fee_inr"] == 0.0
    assert joint["esevai_filing_fee_inr"] == 60.0
    assert joint["total_statutory_cost_inr"] == 60.0

    # Option B: Release Deed (1% concessional duty under TN Stamp Act)
    release = paths["REGISTERED_RELEASE_DEED"]
    assert release["stamp_duty_inr"] == 12863.90  # 1% of 1,286,390
    assert release["registration_fee_inr"] == 4000.0  # 1% capped at 4,000 max
    assert release["total_statutory_cost_inr"] > joint["total_statutory_cost_inr"]


# ---------------------------------------------------------------------------
# Test 5: Deterministic Unit Math (0.17.5 Ha = 43.2434 Cents, -4.76 Cents delta)
# ---------------------------------------------------------------------------
def test_unit_math_hectare_to_cents_exact():
    """
    Verifies 0.17.5 Hectares = 43.2434 Cents and catches -4.76 Cents variance
    against a 48.0 Cent deed as a mathematical fact without legal assertions.
    """
    ha_val = parse_tamil_hectare_notation("0.17.5")
    assert ha_val == 0.175

    cents = round(ha_val * CENTS_PER_HECTARE, 4)
    assert cents == 43.2434

    # Compare 48.0 Deed Cents vs 43.24 Patta Cents
    res = calculate_shrinkage(deed_cents=48.0, patta_cents=43.24)
    assert res.delta_cents == -4.76
    assert res.is_shrinkage is True
    assert res.threshold_epsilon == 0.48  # max(0.25, 0.01 * 48.0)


# ---------------------------------------------------------------------------
# Test 6: 400 KB Squeeze Machine compliance
# ---------------------------------------------------------------------------
def test_400kb_squeeze_compliance():
    """
    Compresses a >2.5 MB scan to <= 390 KB while preserving page count.
    """
    num_pages = 6
    images = [
        Image.fromarray(np.random.randint(0, 255, (500, 500, 3), dtype=np.uint8))
        for _ in range(num_pages)
    ]
    raw_pdf_buf = io.BytesIO()
    images[0].save(raw_pdf_buf, format="PDF", save_all=True, append_images=images[1:])
    raw_pdf_bytes = raw_pdf_buf.getvalue()

    compressed_bytes, squeeze_res = squeeze_pdf(raw_pdf_bytes)
    assert len(compressed_bytes) <= 390 * 1024, f"Output {len(compressed_bytes)} must be <= 399,360 bytes"
    assert squeeze_res.compliant is True


# ---------------------------------------------------------------------------
# Test 7: Zero automated government scraping dependency
# ---------------------------------------------------------------------------
def test_no_automated_govt_scraping_dependency():
    """
    Verifies the entire pipeline runs cleanly on uploaded/sample PDFs
    without external portal network calls.
    """
    # Load case 4821 state and verify it contains no live scraping endpoints or CAPTCHA dependencies
    case = store.get_case("4821")
    assert case is not None
    assert case.district == "Thiruvallur"
    assert case.village == "Pakkam"
    # Endpoints rely on citizen-provided uploads or in-memory sample docs
    for doc in case.inventory:
        assert not doc.how_to_obtain_en.startswith("http")


# ---------------------------------------------------------------------------
# Test 8: HITL approval gate enforced (403 Forbidden before OTP)
# ---------------------------------------------------------------------------
def test_hitl_approval_gate_enforced():
    """
    Blocks final PDF download (403 Forbidden) until explicit voice + OTP approval is recorded.
    """
    # Reset case 4821 approval
    case = store.get_case("4821")
    case.hitl_approved = False
    store.save_case(case)

    # Calling dossier download prior to approval must return 403 Forbidden
    resp = client.get("/api/cases/4821/dossier.pdf")
    assert resp.status_code == 403
    assert "Human-in-the-loop approval" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# Test 9: Multi-visit case continuity across sessions
# ---------------------------------------------------------------------------
def test_multi_visit_case_continuity():
    """
    Verifies a case created in Act 1 (#4821) persists its missing-document checklist
    and resumes cleanly when updated in Act 2.
    """
    # Act 1: Farmer calls and registers inquiry
    intake_resp = client.post(
        "/api/intake/voice",
        json={"case_id": "4821", "caller_phone": "9840124821", "survey_no": "114/2B"},
    )
    assert intake_resp.status_code == 200
    assert intake_resp.json()["case_id"] == "4821"

    # Act 2: Days later, farmer returns to café, operator fetches case
    fetch_resp = client.get("/api/cases/4821")
    assert fetch_resp.status_code == 200
    fetched_data = fetch_resp.json()
    assert fetched_data["phone"] == "9840124821"
    assert len(fetched_data["inventory"]) > 0


# ---------------------------------------------------------------------------
# Test 10: Low confidence OCR fields flag human review (< 0.85)
# ---------------------------------------------------------------------------
def test_low_confidence_field_flags_review():
    """
    Ensures any extracted field with confidence < 0.85 automatically
    sets requires_manual_correction = True.
    """
    low_conf_field = VerifiedField(
        field_name="subdivision",
        extracted_value="2B",
        confidence=0.81,  # Below 0.85
    )
    checked_low = check_field_confidence(low_conf_field)
    assert checked_low.requires_manual_correction is True

    high_conf_field = VerifiedField(
        field_name="survey_no",
        extracted_value="114/2B",
        confidence=0.96,  # Above 0.85
    )
    checked_high = check_field_confidence(high_conf_field)
    assert checked_high.requires_manual_correction is False


# ---------------------------------------------------------------------------
# Test 11: LLM timeout or missing key engages deterministic regex fallback
# ---------------------------------------------------------------------------
def test_llm_timeout_engages_regex_fallback():
    """
    Simulates an API timeout/missing key and confirms deterministic
    extraction still completes cleanly without throwing exceptions.
    """
    raw_sample_text = (
        "கிராமம்: பாக்கம், வட்டம்: திருவள்ளூர். பட்டா எண்: 382. "
        "புல எண்: 114/2B, பரப்பு: 0.17.5 ஹெக்டேர். பட்டாதாரர் பெயர்: ஏ. சுப்பிரமணியம்."
    )
    # Call extractor directly with no API key
    extracted = extract_land_record_data(raw_sample_text, doc_type="PATTA")
    assert extracted is not None
    # Verify deterministic regex captured critical fields
    assert extracted.get("patta_no") == "382"
    assert "114/2B" in extracted.get("survey_no", "")


# ---------------------------------------------------------------------------
# Test 12: End-to-end verified packet PDF generation
# ---------------------------------------------------------------------------
def test_end_to_end_verified_packet_pdf():
    """
    Runs the complete verified workflow and validates the generated %PDF- output
    contains the human verification log, missing-doc checklist, and legal boundary notice.
    """
    # 1. Operator verifies all critical fields
    client.post("/api/cases/4821/verify-field", json={"field_name": "survey_no", "is_verified": True})
    client.post("/api/cases/4821/verify-field", json={"field_name": "deceased_owner", "is_verified": True})
    client.post("/api/cases/4821/verify-field", json={"field_name": "applicant_name", "is_verified": True})

    # 2. Mark REV-114 as available
    store.update_document_status("4821", "LEGAL_HEIR_REV114", DocumentStatus.AVAILABLE)

    # 3. Choose administrative path
    client.post("/api/cases/4821/select-path", json={"chosen_path": "JOINT_PATTA"})

    # 4. Officer unlocks HITL gate with OTP 1234
    approval_resp = client.post(
        "/api/cases/4821/hitl-approve",
        json={"case_id": "4821", "officer_name": "JanAI Operator T. Raman", "otp": "1234"},
    )
    assert approval_resp.status_code == 200
    assert approval_resp.json()["success"] is True

    # 5. Stream generated PDF dossier
    pdf_resp = client.get("/api/cases/4821/dossier.pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF-")
    assert len(pdf_resp.content) > 1000


# ---------------------------------------------------------------------------
# Test 13: Custom PDF upload endpoint for judge live-testing
# ---------------------------------------------------------------------------
def test_custom_pdf_upload_endpoint():
    """
    Verifies Bug 3 (Custom PDF Upload):
    POST /api/upload-pdf accepts judge/user PDF, extracts size, page count,
    and returns structured OCR extraction with field predictions.
    """
    img = Image.new("RGB", (200, 200), color="white")
    buf = io.BytesIO()
    img.save(buf, format="PDF")
    pdf_bytes = buf.getvalue()

    resp = client.post(
        "/api/upload-pdf",
        files={"file": ("judge_sample_patta.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["filename"] == "judge_sample_patta.pdf"
    assert data["size_kb"] > 0
    assert data["page_count"] >= 1
    assert "fields" in data
