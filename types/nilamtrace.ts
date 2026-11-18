export type DiscrepancyType =
  | 'AREA_SHRINKAGE_UNRECORDED_SUBDIVISION'
  | 'MISSING_INHERITANCE_MUTATION'
  | 'RESOLVED_UDR_SURVEY_LINK'
  | 'CRITICAL_RED_ZONE_BLOCK'
  | 'NAME_SPELLING_VARIATION'
  | 'ENCUMBRANCE_FOUND'
  | 'MATCHED';

export type DiscrepancySeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';

export type DocumentStatus = 'AVAILABLE' | 'MISSING_TO_OBTAIN' | 'UPLOADED';

export interface DocumentInventoryItem {
  doc_type: string;
  doc_name: string;
  doc_name_ta: string;
  status: DocumentStatus;
  how_to_obtain_en: string;
  how_to_obtain_ta: string;
  official_fee_inr: number;
  mandatory_for_patta: boolean;
  uploaded_filename?: string;
  verification_notes?: string;
}

export interface VerifiedField {
  field_name: string;
  extracted_value: string | number | boolean;
  confidence: number;
  page_num: number;
  bbox?: [number, number, number, number];
  human_verified: boolean;
  verified_by_operator: boolean;
  corrected_value?: string | number | boolean;
  operator_notes?: string;
  requires_manual_correction: boolean;
}

export interface VoluntaryHeirStatement {
  heir_name: string;
  heir_name_ta?: string;
  relation: string;
  relation_ta?: string;
  age?: number;
  attributed_to: string;
  disclaimer_acknowledged: boolean;
  legal_disclaimer: string;
}

export type InheritancePath = 'JOINT_PATTA' | 'REGISTERED_RELEASE_DEED' | 'UNDECIDED';

export interface PersonNode {
  id?: string;
  name: string;
  father_or_husband_name: string;
  relationship: string;
  is_deceased: boolean;
  share_percentage?: number;
  legal_heir_status?: string;
  normalized_key?: string;
}

export interface ExtractedField {
  field_name: string;
  value: string | number | boolean;
  raw_text?: string;
  confidence: number;
  doc_type: 'SALE_DEED' | 'PATTA' | 'CHITTA' | 'EC' | 'FMB' | 'LEGAL_HEIR';
  bbox?: [number, number, number, number];
  page: number;
}

export interface Discrepancy {
  id: string;
  type: DiscrepancyType;
  severity: DiscrepancySeverity;
  title: string;
  title_ta?: string;
  description: string;
  description_ta?: string;
  source_doc?: string;
  target_doc?: string;
  deed_value?: string | number;
  patta_value?: string | number;
  delta?: string;
  resolved: boolean;
  resolution_note?: string;
  resolution_note_ta?: string;
  action_required?: string;
  action_required_ta?: string;
}

export interface UnitConversionResult {
  original_value: number;
  original_unit: string;
  cents: number;
  sq_feet: number;
  breakdown_formula: string;
}

export interface ShrinkageResult {
  deed_cents: number;
  patta_cents: number;
  delta_cents: number;
  percentage_loss: number;
  threshold_epsilon: number;
  is_shrinkage: boolean;
  discrepancy_type?: DiscrepancyType;
  explanation: string;
  explanation_ta?: string;
}

export interface FamilyShare {
  person_id: string;
  name: string;
  name_ta: string;
  relationship: string;
  legal_heir_certificate_ref?: string;
  share_percentage: number;
  share_cents: number;
  consent_status: 'CONSENTED' | 'PENDING' | 'DECLINED';
  consent_timestamp?: string;
  phone_last4?: string;
}

export interface SqueezeResult {
  original_bytes: number;
  compressed_bytes: number;
  target_max_bytes: number;
  compression_ratio: number;
  pass_used: number;
  num_parts: number;
  compliant: boolean;
  details: string;
  part_files?: string[];
}

export interface HITLApprovalRequest {
  case_id: string;
  officer_name?: string;
  otp: string;
  comments?: string;
  voice_consent_confirmed: boolean;
}

export interface HITLApprovalResponse {
  success: boolean;
  case_id: string;
  status: string;
  stamp_signature: string;
  approved_at: string;
  dossier_download_url: string;
}

export interface IntakeVoiceRequest {
  audio_text?: string;
  language?: string;
  caller_phone?: string;
  case_id?: string;
  district?: string;
  taluk?: string;
  village?: string;
  survey_no?: string;
  deceased_name?: string;
}

export interface TimelineEntry {
  step?: string;
  timestamp?: string;
  time?: string;
  event?: string;
  desc?: string;
  desc_ta?: string;
  actor?: string;
  status?: 'DONE' | 'IN_PROGRESS' | 'PENDING';
}

export interface CaseState {
  case_id: string;
  case_title: string;
  case_title_ta: string;
  applicant_name: string;
  applicant_name_ta: string;
  phone: string;
  district: string;
  taluk: string;
  village: string;
  old_survey_no?: string;
  new_survey_no?: string;
  patta_no?: string;
  deceased_name: string;
  deceased_name_ta: string;
  date_of_death?: string;
  deed_area_raw?: string;
  deed_area_cents: number;
  patta_area_raw?: string;
  patta_area_cents: number;
  area_delta_cents: number;
  land_classification?: string;
  is_red_zone?: boolean;
  red_zone_reason?: string;
  red_zone_reason_ta?: string;
  status: 'INTAKE' | 'SCANNING' | 'MISSING_DOCS_PENDING' | 'HUMAN_VERIFICATION_PENDING' | 'READY_FOR_FILING' | 'DOSSIER_ISSUED' | 'APPROVED' | 'ANALYZED' | 'RESOLVING' | 'REJECTED';
  chosen_path: InheritancePath;
  rev114_available: boolean;
  death_certificate_available: boolean;
  critical_fields_verified: boolean;
  ready_for_patta_transfer: boolean;
  inventory: DocumentInventoryItem[];
  verified_fields: Record<string, VerifiedField>;
  heir_statements: VoluntaryHeirStatement[];
  area_consistency?: ShrinkageResult;
  pilot_metrics?: {
    official_fees_inr: number;
    operator_minutes_spent: number;
    family_willingness_to_pay_inr: number;
    est_broker_avoided_cost_inr: number;
  };
  loan_eligibility?: string;
  loan_eligibility_ta?: string;
  discrepancies?: Discrepancy[];
  family_shares?: FamilyShare[];
  extracted_fields?: ExtractedField[];
  hitl_approved: boolean;
  hitl_approval_details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  timeline: TimelineEntry[];
}

export type PersonaMode = 'farmer' | 'cafe' | 'guide';
export type Language = 'en' | 'ta' | 'hi';
