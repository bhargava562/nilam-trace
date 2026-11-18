"""NilamTrace Strict Pydantic v2 Models and Schemas"""
from enum import Enum
from typing import Any, Optional
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
    """Severity level indicating loan risk."""
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"
    RESOLVED = "RESOLVED"


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


class UnitConversionResult(BaseModel):
    """Result of deterministic Tamil revenue unit arithmetic."""
    original_value: float
    original_unit: str
    cents: float
    sq_feet: float
    breakdown_formula: str


class ShrinkageResult(BaseModel):
    """Area shrinkage and tolerance assessment."""
    deed_cents: float
    patta_cents: float
    delta_cents: float
    percentage_loss: float
    threshold_epsilon: float
    is_shrinkage: bool
    discrepancy_type: Optional[DiscrepancyType] = None
    explanation: str
    explanation_ta: Optional[str] = None


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
    officer_name: str = "VAO T. Ramanathan"
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


class CaseState(BaseModel):
    """Full canonical state of an active land title audit case."""
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
    deed_area_raw: str
    deed_area_cents: float
    patta_area_raw: str
    patta_area_cents: float
    area_delta_cents: float
    land_classification: str
    is_red_zone: bool = False
    red_zone_reason: Optional[str] = None
    red_zone_reason_ta: Optional[str] = None
    status: str = "INTAKE"
    loan_eligibility: str = "PENDING_AUDIT"
    loan_eligibility_ta: Optional[str] = None
    discrepancies: list[Discrepancy] = []
    family_shares: list[FamilyShare] = []
    extracted_fields: list[ExtractedField] = []
    hitl_approved: bool = False
    hitl_approval_details: Optional[dict[str, Any]] = None
    created_at: str
    updated_at: str
    timeline: list[dict[str, str]] = []
