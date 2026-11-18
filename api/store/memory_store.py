"""Thread-Safe In-Memory Store with Canonical Tamil Nadu Demo Cases

Hydrates on boot:
- Case #4821: Thiruvallur Loan Rescue (Deceased Father + -4.76 Cents Shrinkage + UDR Survey Link)
- Case #9012: Poramboke Red-Zone Trap (Meikkal Poramboke Communal Land)
"""
import copy
import threading
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

from api.models.schemas import (
    CaseState,
    Discrepancy,
    DiscrepancyType,
    DiscrepancySeverity,
    FamilyShare,
)


def _get_utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_canonical_cases() -> Dict[str, CaseState]:
    """Factory creating pristine canonical demo cases."""
    now = _get_utc_now()
    
    # Case #4821: Thiruvallur Loan Rescue
    case_4821 = CaseState(
        case_id="4821",
        case_title="Thiruvallur Loan Rescue: Deceased Father + -4.76 Cents Shrinkage + UDR Survey Link",
        case_title_ta="திருவள்ளூர் கடன் மீட்பு: மறைந்த தந்தை + -4.76 சென்ட் குறைவு + UDR சர்வே இணைப்பு",
        applicant_name="S. Murugan",
        applicant_name_ta="எஸ். முருகன்",
        phone="+91 98401 23456",
        district="Thiruvallur",
        taluk="Ponneri",
        village="Perumbedu",
        old_survey_no="45/2",
        new_survey_no="114/2B",
        patta_no="1042",
        deed_area_raw="48 Cents",
        deed_area_cents=48.0,
        patta_area_raw="0.17.5 Hectares",
        patta_area_cents=43.24,
        area_delta_cents=-4.76,
        land_classification="Ryotwari Manai",
        is_red_zone=False,
        status="ANALYZED",
        loan_eligibility="ELIGIBLE_POST_MUTATION",
        loan_eligibility_ta="வாரிசு பட்டா மாறுதலுக்குப் பின் கடன் பெற தகுதி உண்டு",
        hitl_approved=False,
        created_at=now,
        updated_at=now,
        discrepancies=[
            Discrepancy(
                id="DISC-4821-01",
                type=DiscrepancyType.AREA_SHRINKAGE_UNRECORDED_SUBDIVISION,
                severity=DiscrepancySeverity.WARNING,
                title="Area Shrinkage: -4.76 Cents Unrecorded Subdivision",
                title_ta="பரப்பளவு குறைவு: -4.76 சென்ட் பதிவு செய்யப்படாத உட்பிரிவு",
                description=(
                    "Sale Deed (1994) conveys 48.00 Cents, but Tamil Nilam Patta (2024) records "
                    "0.17.5 Hectares (43.24 Cents). Net shrinkage of -4.76 Cents exceeds ±0.48 Cents "
                    "survey conversion tolerance. Likely unrecorded subdivision or village road expansion."
                ),
                description_ta=(
                    "1994 கிரையப் பத்திரத்தில் 48.00 சென்ட் உள்ளது, ஆனால் 2024 பட்டாவில் 0.17.5 ஹெக்டேர் "
                    "(43.24 சென்ட்) மட்டுமே உள்ளது. -4.76 சென்ட் குறைவு அனுமதிக்கப்பட்ட விலக்குக்கு மேல் உள்ளது. "
                    "பதிவு செய்யப்படாத உட்பிரிவு அல்லது சாலை விரிவாக்கம் காரணமாக இருக்கலாம்."
                ),
                source_doc="Sale Deed 1994 (Doc No. 142/1994)",
                target_doc="Tamil Nilam Patta No. 1042",
                deed_value="48.00 Cents",
                patta_value="43.24 Cents (0.17.5 Ha)",
                delta="-4.76 Cents",
                resolved=False,
                action_required="Sanction bank mortgage strictly on net verified 43.24 Cents, protecting collateral risk.",
                action_required_ta="வங்கி கடன் மதிப்பீட்டை 43.24 சென்ட் அளவிற்கு கட்டுப்படுத்தி பாதுகாப்பு உறுதி செய்யவும்.",
            ),
            Discrepancy(
                id="DISC-4821-02",
                type=DiscrepancyType.MISSING_INHERITANCE_MUTATION,
                severity=DiscrepancySeverity.WARNING,
                title="Missing Inheritance Mutation: Registered Pattadhar Deceased",
                title_ta="வாரிசுரிமை பட்டா மாறுதல் நிலுவை: பட்டாதாரர் இறந்துவிட்டார்",
                description=(
                    "Registered pattadhar K. Subramanian deceased in 2021. Patta remains in deceased father's name. "
                    "Applicant S. Murugan and sister S. Selvi are co-parceners. Under Hindu Succession Act, "
                    "single signature mortgage is defective without co-heir consent or formal mutation."
                ),
                description_ta=(
                    "பட்டாதாரர் கே. சுப்பிரமணியன் 2021 இல் மறைந்தார். பட்டா இன்னமும் தந்தை பெயரிலேயே உள்ளது. "
                    "விண்ணப்பதாரர் எஸ். முருகன் மற்றும் சகோதரி எஸ். செல்வி கூட்டு வாரிசுதாரர்கள். "
                    "இருவரின் ஒப்புதல் அல்லது வாரிசு பட்டா மாறுதல் அவசியம்."
                ),
                source_doc="Patta Passbook No. 1042",
                target_doc="Legal Heir Certificate (TN-LH-2022-891)",
                resolved=False,
                action_required="Complete Speakerphone Legal Heir verification and execute Joint Consent / VAO attestation.",
                action_required_ta="வாரிசுதாரர் தொலைபேசி ஒப்புதல் பெற்று கிராம நிர்வாக அலுவலர் (VAO) சான்றொப்பம் பெறவும்.",
            ),
            Discrepancy(
                id="DISC-4821-03",
                type=DiscrepancyType.RESOLVED_UDR_SURVEY_LINK,
                severity=DiscrepancySeverity.RESOLVED,
                title="Resolved UDR Survey Link: Old S.No 45/2 -> New S.No 114/2B",
                title_ta="தீர்க்கப்பட்ட UDR சர்வே எண்: பழைய சர்வே எண் 45/2 -> புதிய சர்வே எண் 114/2B",
                description=(
                    "Sale Deed references Old Survey No. 45/2. Verified official correlation to Post-UDR "
                    "Survey No. 114/2B in Perumbedu Village Field Correlation Register (FCR 1984)."
                ),
                description_ta=(
                    "கிரையப் பத்திரம் பழைய சர்வே எண் 45/2-ஐக் குறிப்பிடுகிறது. பெரும்பேடு கிராம UDR புல ஒப்புமைப் "
                    "பதிவேட்டின்படி புதிய சர்வே எண் 114/2B உடன் துல்லியமாகப் பொருந்துகிறது."
                ),
                source_doc="Pre-UDR Sale Deed (1994)",
                target_doc="Post-UDR Patta (2024)",
                deed_value="45/2",
                patta_value="114/2B",
                resolved=True,
                resolution_note="Chain-of-title survey continuity verified with zero mismatch.",
                resolution_note_ta="நில உரிமை சங்கிலி தொடர்ச்சி உறுதி செய்யப்பட்டது.",
            ),
        ],
        family_shares=[
            FamilyShare(
                person_id="P1",
                name="S. Murugan",
                name_ta="எஸ். முருகன்",
                relationship="Son",
                legal_heir_certificate_ref="TN-LH-2022-891",
                share_percentage=50.0,
                share_cents=21.62,
                consent_status="CONSENTED",
                consent_timestamp="2026-11-18T10:30:00Z",
                phone_last4="2345",
            ),
            FamilyShare(
                person_id="P2",
                name="S. Selvi",
                name_ta="எஸ். செல்வி",
                relationship="Daughter",
                legal_heir_certificate_ref="TN-LH-2022-891",
                share_percentage=50.0,
                share_cents=21.62,
                consent_status="PENDING",
                consent_timestamp=None,
                phone_last4="9812",
            ),
        ],
        timeline=[
            {"step": "INTAKE_CALL", "time": now, "note": "Farmer voice intake via missed call / Web Speech"},
            {"step": "AI_EXTRACT", "time": now, "note": "Extracted 1994 Sale Deed & 2024 Patta records"},
            {"step": "SHRINKAGE_AUDIT", "time": now, "note": "Flagged -4.76 Cents delta (48.0 -> 43.24 Cents)"},
            {"step": "UDR_LINK", "time": now, "note": "Old S.No 45/2 mapped to New S.No 114/2B"},
            {"step": "HEIR_CHECK", "time": now, "note": "Deceased pattadhar flagged; Murugan 50%, Selvi 50%"},
        ],
    )

    # Case #9012: Poramboke Red-Zone Trap
    case_9012 = CaseState(
        case_id="9012",
        case_title="Poramboke Red-Zone Trap: Meikkal Poramboke Grazing Land",
        case_title_ta="புறம்போக்கு சிவப்பு மண்டல பொறி: மேய்க்கால் புறம்போக்கு நிலம்",
        applicant_name="R. Kathirvel",
        applicant_name_ta="ஆர். கதிர்வேல்",
        phone="+91 97890 54321",
        district="Chengalpattu",
        taluk="Thiruporur",
        village="Illalur",
        old_survey_no="88/1",
        new_survey_no="88/1",
        patta_no="N/A (Prohibited)",
        deed_area_raw="2.50 Acres",
        deed_area_cents=250.0,
        patta_area_raw="0.00 (Government Poramboke)",
        patta_area_cents=0.0,
        area_delta_cents=-250.0,
        land_classification="Meikkal Poramboke (Government Grazing Ground)",
        is_red_zone=True,
        red_zone_reason=(
            "Land is classified as Meikkal Poramboke (Communal Grazing Reserve). "
            "Under Section 2 of TN Land Encroachment Act 1905 & Madras High Court rulings, "
            "private mortgage and alienation are strictly prohibited."
        ),
        red_zone_reason_ta=(
            "நில வகைப்பாடு மேய்க்கால் புறம்போக்கு (அரசு மேய்ச்சல் தரை) என வகைப்படுத்தப்பட்டுள்ளது. "
            "தமிழ்நாடு நில ஆக்கிரமிப்பு சட்டம் 1905 பிரிவு 2 மற்றும் உயர்நீதிமன்ற தீர்ப்பின்படி, "
            "இதன் மீது கடன் வழங்கவோ விற்கவோ சட்டப்படி அனுமதியில்லை."
        ),
        status="REJECTED_RED_ZONE",
        loan_eligibility="CRITICAL_RED_ZONE_BLOCKED",
        loan_eligibility_ta="கடன் பெற தகுதியற்றது - அரசு புறம்போக்கு / மேய்க்கால் நிலம்",
        hitl_approved=False,
        created_at=now,
        updated_at=now,
        discrepancies=[
            Discrepancy(
                id="DISC-9012-01",
                type=DiscrepancyType.CRITICAL_RED_ZONE_BLOCK,
                severity=DiscrepancySeverity.CRITICAL,
                title="CRITICAL RED-ZONE: Meikkal Poramboke Communal Land",
                title_ta="ஆபத்தான சிவப்பு மண்டலம்: மேய்க்கால் புறம்போக்கு நிலம்",
                description=(
                    "Village A-Register confirms Survey No. 88/1 is Meikkal Poramboke (Communal Grazing Ground). "
                    "Unscrupulous sellers attempted private deed registration. Commercial lending legally prohibited. "
                    "Application must be immediately rejected to prevent non-performing asset (NPA) foreclosure failure."
                ),
                description_ta=(
                    "கிராம 'அ' பதிவேட்டின்படி சர்வே எண் 88/1 மேய்க்கால் புறம்போக்கு நிலமாகும். "
                    "இதை தனிநபர் கிரையம் செய்தது செல்லாது. வங்கி கடன் வழங்க முற்றிலும் தடை விதிக்கப்பட்டுள்ளது."
                ),
                source_doc="A-Register / Settlement Record",
                target_doc="Mortgage Loan Application",
                resolved=False,
                action_required="IMMEDIATE REJECTION: Prohibited government land. Alert District Collectorate.",
                action_required_ta="விண்ணப்பத்தை உடனடியாக நிராகரிக்கவும்: அரசு புறம்போக்கு நிலம்.",
            )
        ],
        family_shares=[],
        timeline=[
            {"step": "INTAKE_CALL", "time": now, "note": "Loan application received for Survey No. 88/1"},
            {"step": "RED_ZONE_GATE", "time": now, "note": "Halted: Classified as Meikkal Poramboke"},
        ],
    )

    return {
        "4821": case_4821,
        "9012": case_9012,
    }


class CaseMemoryStore:
    """Thread-safe in-memory case store."""

    def __init__(self):
        self._lock = threading.Lock()
        self._cases: Dict[str, CaseState] = {}
        self.reset_to_canonical()

    def reset_to_canonical(self) -> None:
        """Reset cases back to default pristine canonical demo records."""
        with self._lock:
            self._cases = build_canonical_cases()

    def get_case(self, case_id: str) -> Optional[CaseState]:
        """Fetch case by ID (returns a deep copy to prevent race conditions)."""
        with self._lock:
            case = self._cases.get(str(case_id))
            return copy.deepcopy(case) if case else None

    def list_cases(self) -> List[CaseState]:
        """List all active cases."""
        with self._lock:
            return [copy.deepcopy(c) for c in self._cases.values()]

    def save_case(self, case: CaseState) -> CaseState:
        """Save or overwrite a case state."""
        with self._lock:
            case.updated_at = _get_utc_now()
            self._cases[case.case_id] = copy.deepcopy(case)
            return copy.deepcopy(case)

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> Optional[CaseState]:
        """Partially update case fields."""
        with self._lock:
            if case_id not in self._cases:
                return None
            case = self._cases[case_id]
            case_data = case.model_dump()
            case_data.update(updates)
            case_data["updated_at"] = _get_utc_now()
            updated_case = CaseState.model_validate(case_data)
            self._cases[case_id] = updated_case
            return copy.deepcopy(updated_case)


# Global singleton instance
case_store = CaseMemoryStore()
