"""NilamTrace v2 — Inheritance Rules & Administrative Path Engine
Enforces Tamil Nadu Patta Maruthal (Inheritance Transfer) statutory guidelines.
"""
from typing import Any, Dict, List, Tuple
from api.models.schemas import (
    CaseState,
    DocumentStatus,
    InheritancePath,
    VerifiedField,
    VoluntaryHeirStatement,
)

CRITICAL_FIELDS = ["survey_no", "deceased_owner", "applicant_name"]
CONFIDENCE_THRESHOLD = 0.85


def check_field_confidence(field: VerifiedField) -> VerifiedField:
    """Flag any field with confidence < 0.85 as requiring manual operator correction."""
    if field.confidence < CONFIDENCE_THRESHOLD:
        field.requires_manual_correction = True
    else:
        field.requires_manual_correction = False
    return field


def evaluate_document_inventory(case: CaseState) -> Tuple[bool, bool, List[Dict[str, Any]]]:
    """
    Evaluates whether statutory prerequisites for Patta Maruthal are met:
    1. Death Certificate (இறப்புச் சான்றிதழ்)
    2. Tahsildar Legal Heir Certificate REV-114 (வாரிசுச் சான்றிதழ்)
    Returns: (death_cert_available, rev114_available, missing_prerequisites)
    """
    death_cert_available = False
    rev114_available = False
    missing_prerequisites = []

    for item in case.inventory:
        is_ready = item.status in [DocumentStatus.AVAILABLE, DocumentStatus.UPLOADED]
        if item.doc_type == "DEATH_CERTIFICATE":
            death_cert_available = is_ready
        elif item.doc_type == "LEGAL_HEIR_REV114":
            rev114_available = is_ready

        if item.mandatory_for_patta and not is_ready:
            missing_prerequisites.append({
                "doc_type": item.doc_type,
                "doc_name": item.doc_name,
                "doc_name_ta": item.doc_name_ta,
                "how_to_obtain_en": item.how_to_obtain_en,
                "how_to_obtain_ta": item.how_to_obtain_ta,
                "official_fee_inr": item.official_fee_inr,
            })

    return death_cert_available, rev114_available, missing_prerequisites


def evaluate_human_verification(case: CaseState) -> Tuple[bool, List[str]]:
    """
    Verifies that all critical extracted fields have been explicitly reviewed
    and confirmed by a human operator before application export.
    Returns: (all_critical_verified, list_of_unverified_critical_fields)
    """
    unverified = []
    for field_name in CRITICAL_FIELDS:
        field = case.verified_fields.get(field_name)
        if not field or not field.human_verified:
            unverified.append(field_name)

    all_verified = len(unverified) == 0
    return all_verified, unverified


def evaluate_case_readiness(case: CaseState) -> Dict[str, Any]:
    """
    Comprehensive rule evaluation:
    - If REV-114 or Death Cert is missing -> Blocks filing, generates REV-114 prerequisite packet.
    - If any critical field is unverified -> Blocks filing, requires human review.
    - If all documents and fields are verified -> Unlocks READY_FOR_FILING.
    """
    death_avail, rev114_avail, missing_docs = evaluate_document_inventory(case)
    human_verified, unverified_fields = evaluate_human_verification(case)

    case.death_certificate_available = death_avail
    case.rev114_available = rev114_avail
    case.critical_fields_verified = human_verified

    if not rev114_avail or not death_avail:
        case.status = "MISSING_DOCS_PENDING"
        case.ready_for_patta_transfer = False
        action_packet_type = "PREREQUISITE_REV114_PACKET"
        message_en = "Patta transfer cannot proceed without Legal Heir Certificate (REV-114). Complete Step 1 at e-Sevai first."
        message_ta = "வாரிசுச் சான்றிதழ் (REV-114) இல்லாமல் பட்டா மாறுதல் செய்ய இயலாது. முதலில் இ-சேவை மையத்தில் விண்ணப்பிக்கவும்."
    elif not human_verified:
        case.status = "HUMAN_VERIFICATION_PENDING"
        case.ready_for_patta_transfer = False
        action_packet_type = "OPERATOR_VERIFICATION_REQUIRED"
        message_en = f"Critical fields pending human operator verification: {', '.join(unverified_fields)}."
        message_ta = f"ஆய்வு செய்ய வேண்டிய முக்கிய ஆவணப் புலங்கள்: {', '.join(unverified_fields)}."
    else:
        case.status = "READY_FOR_FILING"
        case.ready_for_patta_transfer = True
        action_packet_type = "PATTA_TRANSFER_DOSSIER"
        message_en = "All statutory documents and extracted fields verified. Ready for e-Sevai / Tamil Nilam filing."
        message_ta = "அனைத்து ஆவணங்களும் சரிபார்க்கப்பட்டன. இ-சேவை / தமிழ்நிலம் மூலம் விண்ணப்பிக்கத் தயார்."

    return {
        "status": case.status,
        "ready_for_patta_transfer": case.ready_for_patta_transfer,
        "action_packet_type": action_packet_type,
        "missing_documents": missing_docs,
        "unverified_fields": unverified_fields,
        "message_en": message_en,
        "message_ta": message_ta,
    }


def compare_inheritance_paths(heirs_count: int = 3, estimated_guideline_value: float = 1200000.0) -> Dict[str, Any]:
    """
    Transparent comparison between Joint Patta vs. Registered Release Deed
    under Tamil Nadu Revenue and Registration statutory rules.
    """
    concessional_stamp_rate = 0.01  # 1% for family members (TN Stamp Act Schedule 1 Article 55)
    stamp_duty_cap = 25000.0
    calculated_stamp = min(estimated_guideline_value * concessional_stamp_rate, stamp_duty_cap)

    reg_fee_rate = 0.01  # 1% registration fee
    reg_fee_cap = 4000.0
    calculated_reg_fee = min(estimated_guideline_value * reg_fee_rate, reg_fee_cap)

    return {
        "paths": {
            "JOINT_PATTA": {
                "name": "Option A: Joint Patta (கூட்டுப் பட்டா)",
                "tamil_name": "கூட்டுப் பட்டா",
                "description_en": "All surviving legal heirs listed jointly in the revenue Patta.",
                "description_ta": "அனைத்து நேரடி வாரிசுகளின் பெயர்களும் பட்டாவில் கூட்டாகப் பதியப்படும்.",
                "stamp_duty_inr": 0.0,
                "registration_fee_inr": 0.0,
                "esevai_filing_fee_inr": 60.0,
                "total_statutory_cost_inr": 60.0,
                "subdivision_required": False,
                "bank_loan_feasibility": "Requires all co-heirs to sign as co-borrowers/guarantors.",
                "bank_loan_feasibility_ta": "அனைத்து வாரிசுகளும் வங்கிக் கடனுக்கு கையொப்பமிட வேண்டும்.",
                "legal_complexity": "Low (No Sub-Registrar visit required)",
            },
            "REGISTERED_RELEASE_DEED": {
                "name": "Option B: Registered Release / Partition Deed (விடுதலை / பாகப்பிரிவினை பத்திரம்)",
                "tamil_name": "விடுதலைப் பத்திரம் / பாகப்பிரிவினை",
                "description_en": "Co-heirs relinquish their undivided shares in favour of applicant before Sub-Registrar.",
                "description_ta": "மற்ற வாரிசுகள் சார்பதிவாளர் அலுவலகத்தில் தங்களின் பங்கை விண்ணப்பதாரருக்கு எழுதித் தருதல்.",
                "stamp_duty_inr": calculated_stamp,
                "registration_fee_inr": calculated_reg_fee,
                "esevai_filing_fee_inr": 60.0,
                "subdivision_fee_inr": 400.0,
                "total_statutory_cost_inr": calculated_stamp + calculated_reg_fee + 60.0 + 400.0,
                "subdivision_required": True,
                "bank_loan_feasibility": "Clean individual Patta allows unencumbered sole mortgage/loan.",
                "bank_loan_feasibility_ta": "தனிநபர் பெயரில் தனிப் பட்டா பெறுவதால் வங்கிக் கடன் எளிதில் கிடைக்கும்.",
                "legal_complexity": "Medium (Requires Sub-Registrar appointment & document drafting)",
            }
        },
        "recommendation": (
            "If co-heirs are on good terms and cannot afford stamp duty right now, file for Joint Patta first. "
            "If sole title is required for a bank mortgage or sale, prepare a Registered Family Release Deed."
        ),
        "recommendation_ta": (
            "உடனடிச் செலவு இன்றி பட்டா பெற கூட்டுப் பட்டா தேர்ந்தெடுக்கவும். "
            "வங்கிக் கடன் பெற தனிப் பட்டா தேவைப்பட்டால் விடுதலைப் பத்திரம் பதிவு செய்யவும்."
        )
    }


def create_voluntary_heir_statement(
    heir_name: str,
    relation: str,
    heir_name_ta: str = None,
    relation_ta: str = None,
    age: int = None,
    attributed_to: str = "Applicant voluntary oral statement",
) -> VoluntaryHeirStatement:
    """Creates a strictly non-binding, voluntary family statement with mandatory legal disclaimer."""
    return VoluntaryHeirStatement(
        heir_name=heir_name,
        heir_name_ta=heir_name_ta or heir_name,
        relation=relation,
        relation_ta=relation_ta or relation,
        age=age,
        attributed_to=attributed_to,
        disclaimer_acknowledged=True,
    )
