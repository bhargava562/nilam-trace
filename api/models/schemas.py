"""NilamTrace v2 Strict Pydantic v2 Models and Schemas
Focus: Assisted Inheritance Documentation & Case-Preparation Companion
"""
from enum import Enum
from typing import Any, Optional, List, Dict
from pydantic import BaseModel, Field


class DiscrepancyType(str, Enum):
    """Categorical classification of title/revenue record discrepancies."""
    AREA_SHRINKAGE_UNRECORDED_SUBDIVISION = "AREA_SHRINKAGE_UNRECORDED_SUBDIVISION"
    MISSING_INHERITANCE_MUTATION = "MISSING_INHERITANCE_MUTATION"
    RESOLVED_UDR_SURVEY_LINK = "RESOLVED_UDR_SURVEY_LINK"
    CRITICAL_RED_ZONE_BLOCK = "CRITICAL_RED_ZONE_BLOCK"
    NAME_SPELLING_VARIATION = "NAME_SPELLING_VARIATION"
    ENCUMBRANCE_FOUND = "ENCUMBRANCE_FOUND"
    MATCHED = "MATCHED"


class DiscrepancySeverity(str, Enum):
    """Severity level indicating loan or title risk."""
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"
    RESOLVED = "RESOLVED"


class Discrepancy(BaseModel):
    """Detailed audit finding between Deed and Revenue Records."""
    id: str
    type: DiscrepancyType
    severity: DiscrepancySeverity = DiscrepancySeverity.WARNING
    title: str
    title_ta: Optional[str] = None
    description: str
    description_ta: Optional[str] = None
    source_doc: Optional[str] = None
    target_doc: Optional[str] = None
    deed_value: Optional[Any] = None
    patta_value: Optional[Any] = None
    delta: Optional[str] = None
    resolved: bool = False
    resolution_note: Optional[str] = None
    resolution_note_ta: Optional[str] = None
    action_required: Optional[str] = None
    action_required_ta: Optional[str] = None


class PersonNode(BaseModel):
    """Entity representation for Chain-of-Title person matching."""
    id: Optional[str] = None
    name: str = Field(..., description="Full legal name")
    father_or_husband_name: str = Field(..., description="Father or husband name for disambiguation")
    relationship: str = Field(default="S/o", description="S/o, D/o, W/o, H/o")
    is_deceased: bool = Field(default=False, description="Flag indicating if person is deceased")
    share_percentage: Optional[float] = Field(default=None, description="Legal inheritance share percentage")
    legal_heir_status: Optional[str] = Field(default=None, description="PATTADHAR, LEGAL_HEIR, CO_PARCENER")
    normalized_key: Optional[str] = Field(default=None, description="Normalized name#relative matching key")


class ExtractedField(BaseModel):
    """Normalized field extracted from land record PDFs."""
    field_name: str
    value: Any
    raw_text: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    doc_type: str = Field(..., description="SALE_DEED, PATTA, CHITTA, EC, FMB, LEGAL_HEIR")
    bbox: Optional[list[float]] = Field(default=None, description="[x0, y0, x1, y1] coordinates")
    page: int = Field(default=1, ge=1)


class FamilyShare(BaseModel):
    """Co-parcener / legal heir ownership split."""
    person_id: str
    name: str
    name_ta: str
    relationship: str
    legal_heir_certificate_ref: Optional[str] = None
    share_percentage: float
    share_cents: float
    consent_status: str = Field(default="PENDING", description="CONSENTED, PENDING, DECLINED")
    consent_timestamp: Optional[str] = None
    phone_last4: Optional[str] = None


class DocumentStatus(str, Enum):
    """Status of physical documents required for inheritance patta transfer."""
    AVAILABLE = "AVAILABLE"
    MISSING_TO_OBTAIN = "MISSING_TO_OBTAIN"
    UPLOADED = "UPLOADED"


class DocumentInventoryItem(BaseModel):
    """Tracks physical and digital documentation needed for Tamil Nadu inheritance transfer."""
    doc_type: str = Field(..., description="DEATH_CERTIFICATE, LEGAL_HEIR_REV114, SALE_DEED, PATTA, EC, AADHAAR")
    doc_name: str
    doc_name_ta: str
    status: DocumentStatus = DocumentStatus.MISSING_TO_OBTAIN
    how_to_obtain_en: str
    how_to_obtain_ta: str
    official_fee_inr: float = 0.0
    mandatory_for_patta: bool = True
    uploaded_filename: Optional[str] = None
    verification_notes: Optional[str] = None


class VerifiedField(BaseModel):
    """Field extracted via OCR/LLM requiring explicit human operator verification."""
    field_name: str
    extracted_value: Any
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    page_num: int = 1
    bbox: Optional[list[float]] = None
    human_verified: bool = False
    verified_by_operator: bool = False
    corrected_value: Optional[Any] = None
    operator_notes: Optional[str] = None
    requires_manual_correction: bool = False


class VoluntaryHeirStatement(BaseModel):
    """Voluntary self-reported family structure for informational guidance only."""
    heir_name: str
    heir_name_ta: Optional[str] = None
    relation: str
    relation_ta: Optional[str] = None
    age: Optional[int] = None
    attributed_to: str = Field(default="Applicant voluntary oral statement", description="Source attribution")
    disclaimer_acknowledged: bool = True
    legal_disclaimer: str = (
        "Informational family tree only — does not establish legal title or partition; "
        "formal transfer requires Varisu Certificate (REV-114) and, if relinquishing shares, a Registered Release/Partition Deed."
    )


class InheritancePath(str, Enum):
    """Administrative path for inherited land transfer."""
    JOINT_PATTA = "JOINT_PATTA"  # கூட்டுப் பட்டா (Zero stamp duty, all heirs named)
    REGISTERED_RELEASE_DEED = "REGISTERED_RELEASE_DEED"  # விடுதலைப் பத்திரம் (1% concessional stamp duty)
    UNDECIDED = "UNDECIDED"


class UnitConversionResult(BaseModel):
    """Deterministic Tamil revenue unit conversion."""
    original_value: float
    original_unit: str
    cents: float
    sq_feet: float
    breakdown_formula: str


class ShrinkageResult(BaseModel):
    """Consistent area assessment between historical deed and current patta."""
    deed_cents: float
    patta_cents: float
    delta_cents: float
    percentage_loss: float
    threshold_epsilon: float
    is_shrinkage: bool
    discrepancy_type: Optional[DiscrepancyType] = None
    explanation: str
    explanation_ta: Optional[str] = None


class SqueezeResult(BaseModel):
    """Result from 400 KB Squeeze Machine compression."""
    original_bytes: int
    compressed_bytes: int
    target_max_bytes: int = 409600
    compression_ratio: float
    pass_used: int = Field(..., description="1 = Lossless Deflate, 2 = Adaptive DPI/JPEG, 3 = Splitter")
    num_parts: int = 1
    compliant: bool = True
    details: str
    part_files: Optional[list[str]] = None


class HITLApprovalRequest(BaseModel):
    """Officer Human-In-The-Loop gate approval payload."""
    case_id: str
    officer_name: str = "JanAI Operator / VAO Desk"
    otp: str = Field(..., description="MFA OTP code (demo accepts 1234)")
    comments: Optional[str] = None
    voice_consent_confirmed: bool = True


class HITLApprovalResponse(BaseModel):
    """Response returned upon successful HITL gate unlocking."""
    success: bool
    case_id: str
    status: str
    stamp_signature: str
    approved_at: str
    dossier_download_url: str


class IntakeVoiceRequest(BaseModel):
    """Farmer voice/call intake payload."""
    audio_text: Optional[str] = None
    language: str = "ta"
    caller_phone: Optional[str] = None
    case_id: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    survey_no: Optional[str] = None
    deceased_name: Optional[str] = None


class VerifyFieldRequest(BaseModel):
    """Request by JanAI Café operator to verify or correct an OCR field."""
    field_name: str
    is_verified: bool = True
    corrected_value: Optional[Any] = None
    notes: Optional[str] = None


class SelectPathRequest(BaseModel):
    """Request to record chosen inheritance path."""
    chosen_path: InheritancePath


class AddHeirStatementRequest(BaseModel):
    """Request to log voluntary heir statement."""
    heir_name: str
    heir_name_ta: Optional[str] = None
    relation: str
    relation_ta: Optional[str] = None
    age: Optional[int] = None
    attributed_to: str = "Applicant voluntary oral statement"
    disclaimer_acknowledged: bool = True


class CaseState(BaseModel):
    """Canonical multi-visit state of an inherited land case."""
    case_id: str
    case_title: str
    case_title_ta: str
    applicant_name: str
    applicant_name_ta: str
    phone: str
    district: str
    taluk: str
    village: str
    old_survey_no: Optional[str] = None
    new_survey_no: Optional[str] = None
    patta_no: Optional[str] = None
    deceased_name: str
    deceased_name_ta: str
    date_of_death: Optional[str] = None
    status: str = "INTAKE"  # INTAKE, SCANNING, MISSING_DOCS_PENDING, HUMAN_VERIFICATION_PENDING, READY_FOR_FILING, DOSSIER_ISSUED
    chosen_path: InheritancePath = InheritancePath.UNDECIDED
    rev114_available: bool = False
    death_certificate_available: bool = False
    critical_fields_verified: bool = False
    ready_for_patta_transfer: bool = False
    inventory: list[DocumentInventoryItem] = []
    verified_fields: dict[str, VerifiedField] = {}
    heir_statements: list[VoluntaryHeirStatement] = []
    deed_area_cents: float = 0.0
    patta_area_cents: float = 0.0
    area_delta_cents: float = 0.0
    area_consistency: Optional[ShrinkageResult] = None
    discrepancies: list[Discrepancy] = []
    family_shares: list[FamilyShare] = []
    extracted_fields: list[ExtractedField] = []
    pilot_metrics: dict[str, Any] = {
        "official_fees_inr": 60.0,
        "operator_minutes_spent": 12,
        "family_willingness_to_pay_inr": 300,
        "est_broker_avoided_cost_inr": 0
    }
    hitl_approved: bool = False
    hitl_approval_details: Optional[dict[str, Any]] = None
    created_at: str
    updated_at: str
    timeline: list[dict[str, str]] = []
