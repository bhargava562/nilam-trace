"""NilamTrace v2 Thread-Safe In-Memory Store
Pre-hydrates canonical test cases #4821 and #9012 on cold boot.
"""
from copy import deepcopy
from datetime import datetime
import threading
from typing import Any, Dict, List, Optional
from api.models.schemas import (
    CaseState,
    DocumentInventoryItem,
    DocumentStatus,
    InheritancePath,
    ShrinkageResult,
    VerifiedField,
    VoluntaryHeirStatement,
)
from api.services.inheritance_rules import (
    check_field_confidence,
    evaluate_case_readiness,
)


class MemoryStore:
    """Thread-safe state repository for active multi-visit inheritance cases."""

    def __init__(self):
        self._lock = threading.Lock()
        self._cases: Dict[str, CaseState] = {}
        self._hydrate_canonical_cases()

    def _hydrate_canonical_cases(self):
        """Pre-seeds canonical demo cases #4821 and #9012 for instant evaluation."""
        now_iso = datetime.now().isoformat()

        # Case #4821: Thiruvallur Inheritance Case (Late father Subramaniam)
        # Demonstrates: Missing REV-114 Legal Heir Certificate + Unverified OCR Fields + -4.76 Cents Math Check
        case_4821_inventory = [
            DocumentInventoryItem(
                doc_type="DEATH_CERTIFICATE",
                doc_name="Municipality Death Certificate",
                doc_name_ta="இறப்புச் சான்றிதழ்",
                status=DocumentStatus.AVAILABLE,
                how_to_obtain_en="Issued by Municipal / Town Panchayat Registrar of Births and Deaths.",
                how_to_obtain_ta="நகராட்சி / பேரூராட்சி பிறப்பு இறப்பு பதிவாளரால் வழங்கப்பட்டது.",
                official_fee_inr=0.0,
                mandatory_for_patta=True,
                uploaded_filename="case_4821_death_cert.pdf",
            ),
            DocumentInventoryItem(
                doc_type="SALE_DEED",
                doc_name="1994 Registered Parent Sale Deed (Doc No: 1420/1994)",
                doc_name_ta="1994 கிரையப் பத்திரம் (ஆவண எண்: 1420/1994)",
                status=DocumentStatus.AVAILABLE,
                how_to_obtain_en="Retrieved from family records or certified copy from Sub-Registrar Office via TNREGINET.",
                how_to_obtain_ta="சார்பதிவாளர் அலுவலக நகல் அல்லது குடும்ப மூல ஆவணம்.",
                official_fee_inr=0.0,
                mandatory_for_patta=True,
                uploaded_filename="case_4821_sale_deed_1994.pdf",
            ),
            DocumentInventoryItem(
                doc_type="PATTA",
                doc_name="Current Integrated Land Record / Patta (Old S.No 45/2 -> New S.No 114/2B)",
                doc_name_ta="தற்போதைய தமிழ்நில கணினிப் பட்டா",
                status=DocumentStatus.AVAILABLE,
                how_to_obtain_en="Downloaded from eservices.tn.gov.in using citizen mobile OTP.",
                how_to_obtain_ta="eservices.tn.gov.in தளத்தில் பதிவிறக்கம் செய்யப்பட்டது.",
                official_fee_inr=0.0,
                mandatory_for_patta=True,
                uploaded_filename="case_4821_patta_2024.pdf",
            ),
            DocumentInventoryItem(
                doc_type="LEGAL_HEIR_REV114",
                doc_name="Tahsildar Legal Heirship Certificate (e-Sevai REV-114)",
                doc_name_ta="வட்டாட்சியர் வாரிசுச் சான்றிதழ் (REV-114)",
                status=DocumentStatus.MISSING_TO_OBTAIN,
                how_to_obtain_en="Apply at nearest e-Sevai centre with Death Cert, Ration Card, Aadhaar, and Marriage Proof.",
                how_to_obtain_ta="இறப்புச் சான்றிதழ், குடும்ப அட்டை, ஆதார் அட்டையுடன் அருகில் உள்ள இ-சேவை மையத்தில் விண்ணப்பிக்கவும்.",
                official_fee_inr=60.0,
                mandatory_for_patta=True,
                uploaded_filename=None,
            ),
        ]

        raw_fields_4821 = {
            "deceased_owner": VerifiedField(
                field_name="deceased_owner",
                extracted_value="A. Subramaniam",
                confidence=0.94,
                page_num=1,
                bbox=[72.0, 140.0, 280.0, 160.0],
                human_verified=False,
            ),
            "applicant_name": VerifiedField(
                field_name="applicant_name",
                extracted_value="S. Selvaraj",
                confidence=0.91,
                page_num=1,
                bbox=[72.0, 170.0, 250.0, 190.0],
                human_verified=False,
            ),
            "survey_no": VerifiedField(
                field_name="survey_no",
                extracted_value="114/2B",
                confidence=0.96,
                page_num=1,
                bbox=[72.0, 210.0, 200.0, 230.0],
                human_verified=False,
            ),
            "subdivision": VerifiedField(
                field_name="subdivision",
                extracted_value="2B",
                confidence=0.81,  # < 0.85 threshold! Requires operator manual check
                page_num=1,
                bbox=[205.0, 210.0, 240.0, 230.0],
                human_verified=False,
            ),
            "doc_date": VerifiedField(
                field_name="doc_date",
                extracted_value="1994-08-14",
                confidence=0.89,
                page_num=2,
                bbox=[300.0, 700.0, 450.0, 720.0],
                human_verified=False,
            ),
            "extent": VerifiedField(
                field_name="extent",
                extracted_value="0.17.5 Ha (43.24 Cents)",
                confidence=0.93,
                page_num=1,
                bbox=[72.0, 250.0, 320.0, 270.0],
                human_verified=False,
            ),
        }
        # Run confidence checks
        case_4821_fields = {k: check_field_confidence(v) for k, v in raw_fields_4821.items()}

        case_4821_heirs = [
            VoluntaryHeirStatement(
                heir_name="S. Murugan",
                heir_name_ta="எஸ். முருகன்",
                relation="Son (Elder Brother)",
                relation_ta="மகன் (மூத்த சகோதரர்)",
                age=62,
                attributed_to="Applicant voluntary oral statement",
                disclaimer_acknowledged=True,
            ),
            VoluntaryHeirStatement(
                heir_name="S. Selvi",
                heir_name_ta="எஸ். செல்வி",
                relation="Daughter (Sister)",
                relation_ta="மகள் (சகோதரி)",
                age=55,
                attributed_to="Applicant voluntary oral statement",
                disclaimer_acknowledged=True,
            ),
            VoluntaryHeirStatement(
                heir_name="S. Selvaraj",
                heir_name_ta="எஸ். செல்வராஜ்",
                relation="Son (Applicant)",
                relation_ta="மகன் (விண்ணப்பதாரர்)",
                age=58,
                attributed_to="Applicant voluntary oral statement",
                disclaimer_acknowledged=True,
            ),
        ]

        case_4821 = CaseState(
            case_id="4821",
            case_title="Thiruvallur Inherited Land Case (Late father Subramaniam)",
            case_title_ta="திருவள்ளூர் பரம்பரை நில உரிமை (மறைந்த தந்தை சுப்பிரமணியம்)",
            applicant_name="S. Selvaraj",
            applicant_name_ta="எஸ். செல்வராஜ்",
            phone="9840124821",
            district="Thiruvallur",
            taluk="Thiruvallur",
            village="Pakkam",
            old_survey_no="45/2",
            new_survey_no="114/2B",
            patta_no="382",
            deceased_name="A. Subramaniam",
            deceased_name_ta="ஏ. சுப்பிரமணியம்",
            date_of_death="2018-06-12",
            status="MISSING_DOCS_PENDING",
            chosen_path=InheritancePath.UNDECIDED,
            rev114_available=False,
            death_certificate_available=True,
            critical_fields_verified=False,
            ready_for_patta_transfer=False,
            inventory=case_4821_inventory,
            verified_fields=case_4821_fields,
            heir_statements=case_4821_heirs,
            deed_area_cents=48.0,
            patta_area_cents=43.24,
            area_delta_cents=-4.76,
            area_consistency=ShrinkageResult(
                deed_cents=48.0,
                patta_cents=43.24,
                delta_cents=-4.76,
                percentage_loss=9.92,
                threshold_epsilon=0.48,
                is_shrinkage=True,
                explanation="4.76 Cents reduction between 1994 Sale Deed and 2024 Patta. Likely unrecorded family subdivision or road widening buffer.",
                explanation_ta="1994 கிரையப் பத்திரத்திற்கும் 2024 பட்டாவிற்கும் இடையே 4.76 சென்ட் குறைபாடு உள்ளது.",
            ),
            pilot_metrics={
                "official_fees_inr": 60.0,
                "operator_minutes_spent": 12,
                "family_willingness_to_pay_inr": 300,
                "est_broker_avoided_cost_inr": 15000,
            },
            hitl_approved=False,
            created_at=now_iso,
            updated_at=now_iso,
            timeline=[
                {"timestamp": now_iso, "event": "Missed Call Received from 9840124821", "actor": "Farmer S. Selvaraj"},
                {"timestamp": now_iso, "event": "Pocket Code 4821 Generated with REV-114 Checklist", "actor": "NilamTrace Voice Engine"},
            ],
        )

        # Case #9012: Poramboke / Restricted Land Case
        case_9012 = CaseState(
            case_id="9012",
            case_title="Pakkam Village Meikkal Poramboke Restriction",
            case_title_ta="பாக்கம் கிராம மேய்ச்சல் புறம்போக்கு நிலம்",
            applicant_name="K. Arumugam",
            applicant_name_ta="கே. ஆறுமுகம்",
            phone="9444009012",
            district="Thiruvallur",
            taluk="Thiruvallur",
            village="Pakkam",
            old_survey_no="88/1",
            new_survey_no="204/1A",
            patta_no=None,
            deceased_name="Late K. Kuppusamy",
            deceased_name_ta="மறைந்த கே. குப்புசாமி",
            date_of_death="2012-04-10",
            status="MISSING_DOCS_PENDING",
            chosen_path=InheritancePath.UNDECIDED,
            rev114_available=False,
            death_certificate_available=False,
            critical_fields_verified=False,
            ready_for_patta_transfer=False,
            inventory=[
                DocumentInventoryItem(
                    doc_type="A_REGISTER",
                    doc_name="Village A-Register Extract (Meikkal Poramboke)",
                    doc_name_ta="கிராம ‘அ’ பதிவேடு (மேய்ச்சல் புறம்போக்கு)",
                    status=DocumentStatus.AVAILABLE,
                    how_to_obtain_en="A-Register extract obtained from Taluk Record Room.",
                    how_to_obtain_ta="வட்டாட்சியர் அலுவலக ஆவணக் காப்பக நகல்.",
                    official_fee_inr=0.0,
                    mandatory_for_patta=True,
                    uploaded_filename="case_9012_aregister_meikkal.pdf",
                ),
                DocumentInventoryItem(
                    doc_type="LEGAL_HEIR_REV114",
                    doc_name="Legal Heir Certificate",
                    doc_name_ta="வாரிசுச் சான்றிதழ்",
                    status=DocumentStatus.MISSING_TO_OBTAIN,
                    how_to_obtain_en="Apply at e-Sevai first.",
                    how_to_obtain_ta="முதலில் இ-சேவை மையத்தில் விண்ணப்பிக்கவும்.",
                    official_fee_inr=60.0,
                    mandatory_for_patta=True,
                ),
            ],
            verified_fields={
                "deceased_owner": VerifiedField(
                    field_name="deceased_owner",
                    extracted_value="Late K. Kuppusamy",
                    confidence=0.88,
                    human_verified=False,
                ),
                "survey_no": VerifiedField(
                    field_name="survey_no",
                    extracted_value="204/1A",
                    confidence=0.95,
                    human_verified=False,
                ),
            },
            heir_statements=[],
            deed_area_cents=100.0,
            patta_area_cents=0.0,
            area_delta_cents=-100.0,
            pilot_metrics={"official_fees_inr": 60.0, "operator_minutes_spent": 8},
            hitl_approved=False,
            created_at=now_iso,
            updated_at=now_iso,
            timeline=[
                {"timestamp": now_iso, "event": "A-Register Scan uploaded. Restricted Meikkal tenure identified.", "actor": "JanAI Operator"},
            ],
        )

        self._cases["4821"] = case_4821
        self._cases["9012"] = case_9012

    def get_case(self, case_id: str) -> Optional[CaseState]:
        with self._lock:
            case = self._cases.get(case_id)
            return deepcopy(case) if case else None

    def save_case(self, case: CaseState) -> CaseState:
        with self._lock:
            case.updated_at = datetime.now().isoformat()
            # Re-evaluate case readiness status
            evaluate_case_readiness(case)
            self._cases[case.case_id] = deepcopy(case)
            return deepcopy(case)

    def list_cases(self) -> List[CaseState]:
        with self._lock:
            return [deepcopy(c) for c in self._cases.values()]

    def verify_field(
        self,
        case_id: str,
        field_name: str,
        is_verified: bool = True,
        corrected_value: Optional[Any] = None,
        notes: Optional[str] = None,
    ) -> Optional[CaseState]:
        """Operator explicitly verifies or corrects an extracted field."""
        with self._lock:
            case = self._cases.get(case_id)
            if not case:
                return None

            field = case.verified_fields.get(field_name)
            if not field:
                field = VerifiedField(field_name=field_name, extracted_value=corrected_value or "")

            field.human_verified = is_verified
            field.verified_by_operator = is_verified
            if corrected_value is not None:
                field.corrected_value = corrected_value
            if notes:
                field.operator_notes = notes

            case.verified_fields[field_name] = field
            case.timeline.append({
                "timestamp": datetime.now().isoformat(),
                "event": f"Field '{field_name}' verified by operator (value: {corrected_value or field.extracted_value})",
                "actor": "JanAI Operator",
            })
            evaluate_case_readiness(case)
            self._cases[case_id] = deepcopy(case)
            return deepcopy(case)

    def update_document_status(
        self,
        case_id: str,
        doc_type: str,
        status: DocumentStatus,
    ) -> Optional[CaseState]:
        """Updates document availability in the multi-visit inventory."""
        with self._lock:
            case = self._cases.get(case_id)
            if not case:
                return None

            found = False
            for item in case.inventory:
                if item.doc_type == doc_type:
                    item.status = status
                    found = True
                    break

            if not found:
                case.inventory.append(
                    DocumentInventoryItem(
                        doc_type=doc_type,
                        doc_name=doc_type,
                        doc_name_ta=doc_type,
                        status=status,
                        how_to_obtain_en="Uploaded by operator",
                        how_to_obtain_ta="பதிவேற்றம் செய்யப்பட்டது",
                    )
                )

            case.timeline.append({
                "timestamp": datetime.now().isoformat(),
                "event": f"Document '{doc_type}' status updated to {status.value}",
                "actor": "JanAI Operator",
            })
            evaluate_case_readiness(case)
            self._cases[case_id] = deepcopy(case)
            return deepcopy(case)

    def select_path(self, case_id: str, path: InheritancePath) -> Optional[CaseState]:
        """Records family's chosen administrative path (Joint Patta vs Release Deed)."""
        with self._lock:
            case = self._cases.get(case_id)
            if not case:
                return None

            case.chosen_path = path
            case.timeline.append({
                "timestamp": datetime.now().isoformat(),
                "event": f"Inheritance path chosen: {path.value}",
                "actor": "Family / JanAI Operator",
            })
            evaluate_case_readiness(case)
            self._cases[case_id] = deepcopy(case)
            return deepcopy(case)


# Global singleton
store = MemoryStore()
case_store = store
