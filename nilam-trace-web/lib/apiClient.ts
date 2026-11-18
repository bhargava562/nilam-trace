import {
  CaseState,
  Discrepancy,
  ExtractedField,
  FamilyShare,
  HITLApprovalRequest,
  HITLApprovalResponse,
  IntakeVoiceRequest,
  SqueezeResult,
} from '@/types/nilamtrace';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const MOCK_CASE_4821: CaseState = {
  case_id: '4821',
  case_title: 'Thiruvallur Agricultural Loan Title Rescue',
  case_title_ta: 'திருவள்ளூர் விவசாயக் கடன் நில உரிமை மீட்பு',
  applicant_name: 'Murugan Shanmugam',
  applicant_name_ta: 'முருகன் சண்முகம்',
  phone: '+91 98402 71829',
  district: 'Thiruvallur',
  taluk: 'Uthukottai',
  village: 'Periyapalayam',
  old_survey_no: '45/2',
  new_survey_no: '114/2B',
  patta_no: '2041',
  deed_area_raw: '48.00 Cents',
  deed_area_cents: 48.0,
  patta_area_raw: '0.17.5 Hectares (0.175 Ha)',
  patta_area_cents: 43.2434,
  area_delta_cents: -4.7566,
  land_classification: 'Ayan Nanjai (Wetland Rayathwari)',
  is_red_zone: false,
  status: 'ANALYZED',
  loan_eligibility: 'CONDITIONALLY_ELIGIBLE_PENDING_VAO_STAMP',
  loan_eligibility_ta: 'VAO முத்திரைக்குப் பின் கடன் பெற முழுத் தகுதியானது',
  created_at: '2026-11-18T09:30:00Z',
  updated_at: '2026-11-18T09:35:00Z',
  extracted_fields: [
    {
      field_name: 'Pattadhar Name',
      value: 'Late Shanmugam S/o Raman',
      raw_text: 'சண்முகம் த/பெ ராமன் (மறைவு)',
      confidence: 0.98,
      doc_type: 'PATTA',
      page: 1,
      bbox: [45, 120, 240, 145],
    },
    {
      field_name: 'Old Survey Number',
      value: '45/2',
      raw_text: 'பழைய சர்வே எண் 45/2',
      confidence: 0.99,
      doc_type: 'SALE_DEED',
      page: 2,
      bbox: [50, 180, 210, 205],
    },
    {
      field_name: 'New UDR Survey Number',
      value: '114/2B',
      raw_text: 'புதிய சர்வே எண் 114/2B (உ.தி.ரா திருத்தம்)',
      confidence: 0.99,
      doc_type: 'PATTA',
      page: 1,
      bbox: [45, 180, 220, 205],
    },
    {
      field_name: 'Deed Registered Extent',
      value: '48 Cents (0.48 Acre)',
      raw_text: 'பரப்பளவு 48 சென்ட்',
      confidence: 0.97,
      doc_type: 'SALE_DEED',
      page: 2,
      bbox: [50, 240, 260, 265],
    },
    {
      field_name: 'Patta Metric Extent',
      value: '0.17.5 Hectare (17.5 Ares)',
      raw_text: '0.17.5 ஹெக் (17.5 ஏர்ஸ்)',
      confidence: 0.98,
      doc_type: 'PATTA',
      page: 1,
      bbox: [45, 240, 270, 265],
    },
    {
      field_name: 'Encumbrance Certificate (EC)',
      value: 'Nil Encumbrance (Clean 30-Year Search)',
      raw_text: 'வில்லங்கச் சான்றிதழ்: வில்லங்கம் ஏதுமில்லை',
      confidence: 0.99,
      doc_type: 'EC',
      page: 1,
      bbox: [50, 310, 290, 335],
    },
  ],
  discrepancies: [
    {
      id: 'DISC-001',
      type: 'MISSING_INHERITANCE_MUTATION',
      severity: 'CRITICAL',
      title: 'Pattadhar Deceased • Missing Inheritance Mutation',
      title_ta: 'பட்டாதாரர் காலமானார் • வாரிசுரிமை பட்டா மாற்றம் விடுபட்டுள்ளது',
      description:
        'Registered owner Shanmugam passed away in 2021. Land currently stands in deceased name. Under Section 8 of Hindu Succession Act, legal heir certificate and co-parcener consent are required before mortgage.',
      description_ta:
        'பதிவு பெற்ற நில உரிமையாளர் சண்முகம் 2021-ல் காலமானார். பட்டா இன்னும் மறைந்தவர் பெயரிலேயே உள்ளது. வங்கி அடமானத்திற்கு வாரிசு சான்றிதழ் மற்றும் வாரிசுதாரர் ஒப்புதல் அவசியம்.',
      source_doc: 'Legal Heir Certificate W/2024/0912',
      target_doc: 'Patta #2041',
      deed_value: 'Shanmugam (Father)',
      patta_value: 'Shanmugam (Deceased)',
      delta: 'Requires Co-parcener Mutation',
      resolved: false,
      action_required: 'Record telephonic consent with co-heir Selvi and obtain VAO sign-off.',
      action_required_ta: 'உடன் வாரிசு செல்வியிடம் தொலைபேசி ஒப்புதல் பெற்று VAO ஒப்புதல் பெறவும்.',
    },
    {
      id: 'DISC-002',
      type: 'AREA_SHRINKAGE_UNRECORDED_SUBDIVISION',
      severity: 'WARNING',
      title: 'Subdivision Shrinkage (-4.76 Cents Unrecorded Acquisition)',
      title_ta: 'உட்பிரிவு நிலக் குறைவு (-4.76 சென்ட் அரசு வாய்க்கால் நில எடுப்பு)',
      description:
        'Deed conveys 48.00 Cents, but Patta 0.17.5 Hectares converts deterministically to 43.24 Cents. Delta of -4.76 Cents correlates with 1999 PWD irrigation feeder channel lawful acquisition.',
      description_ta:
        '1998 பத்திரத்தில் 48 சென்ட் உள்ளது, ஆனால் பட்டாவில் 0.17.5 ஹெக்டேர் (43.24 சென்ட்) மட்டுமே உள்ளது. 4.76 சென்ட் குறைவு என்பது 1999 பொதுப்பணித்துறை பாசன வாய்க்கால் நில எடுப்புடன் பொருந்துகிறது.',
      source_doc: 'Sale Deed 1420/1998',
      target_doc: 'Patta 2041 (Ayan Rayathwari)',
      deed_value: '48.00 Cents',
      patta_value: '43.24 Cents (0.17.5 Ha)',
      delta: '-4.76 Cents (-9.92%)',
      resolved: true,
      resolution_note: 'Validated against TN Revenue Board Standing Order 31. Remaining 43.24 Cents is 100% unencumbered title.',
      resolution_note_ta: 'வருவாய் நிலை ஆணை 31-ன் கீழ் சரிபார்க்கப்பட்டது. மீதமுள்ள 43.24 சென்ட் நிலம் 100% சுத்தமான உரிமை.',
    },
    {
      id: 'DISC-003',
      type: 'RESOLVED_UDR_SURVEY_LINK',
      severity: 'RESOLVED',
      title: 'Old vs New Survey Correlation Verified (UDR Scheme)',
      title_ta: 'பழைய மற்றும் புதிய சர்வே எண் பொருத்தம் உறுதி செய்யப்பட்டது (உ.தி.ரா)',
      description:
        'Old Survey 45/2 automatically mapped to New UDR Survey 114/2B via Village Field Measurement Book (FMB) cross-reference ledger G.O. Ms 311.',
      description_ta:
        'பழைய சர்வே எண் 45/2, கிராம நில வரைபட (FMB) அரசாணை 311-ன் படி புதிய உ.தி.ரா சர்வே எண் 114/2B உடன் 100% துல்லியமாக பொருந்துகிறது.',
      source_doc: 'Old S.No 45/2 (1998)',
      target_doc: 'New S.No 114/2B (2024)',
      deed_value: '45/2',
      patta_value: '114/2B',
      delta: '100% Matched',
      resolved: true,
      resolution_note: 'Cross-century chain unbroken. Confirmed by computerized Tamil Nilam ledger.',
      resolution_note_ta: 'நூற்றாண்டுத் தொடர்ச்சி உறுதிப்படுத்தப்பட்டது. தமிழ் நிலம் பதிவேடு சரிபார்க்கப்பட்டது.',
    },
  ],
  family_shares: [
    {
      person_id: 'P-01',
      name: 'Murugan Shanmugam',
      name_ta: 'முருகன் சண்முகம்',
      relationship: 'Son (Applicant)',
      legal_heir_certificate_ref: 'W/2024/0912/01',
      share_percentage: 50.0,
      share_cents: 21.6217,
      consent_status: 'CONSENTED',
      phone_last4: '1829',
      consent_timestamp: '2026-11-18 09:31:00',
    },
    {
      person_id: 'P-02',
      name: 'Selvi M. (w/o Muthuvel)',
      name_ta: 'செல்வி மு. (க/பெ முத்துவேல்)',
      relationship: 'Married Daughter (Co-parcener)',
      legal_heir_certificate_ref: 'W/2024/0912/02',
      share_percentage: 50.0,
      share_cents: 21.6217,
      consent_status: 'PENDING',
      phone_last4: '9481',
    },
  ],
  hitl_approved: false,
  timeline: [
    {
      step: 'FARMER_VOICE_INTAKE',
      time: '09:30 AM',
      desc: 'Toll-free missed call received from +91 98402 71829. Tamil speech transcribed.',
      desc_ta: 'கட்டணமில்லா குரல் வழி அழைப்பு பெறப்பட்டது. தமிழ் உரை பதிவு செய்யப்பட்டது.',
      status: 'DONE',
    },
    {
      step: 'THERMAL_POCKET_CODE',
      time: '09:31 AM',
      desc: 'Pocket Code #4821 dispatched via SMS to applicant.',
      desc_ta: 'பாக்கெட் குறியீடு #4821 விண்ணப்பதாரருக்கு SMS மூலம் அனுப்பப்பட்டது.',
      status: 'DONE',
    },
    {
      step: 'DOCUMENT_XRAY_AUDIT',
      time: '09:32 AM',
      desc: 'Multi-modal audit completed. UDR Survey matched, -4.76 cents shrinkage analyzed.',
      desc_ta: 'ஆவண ஊடுகதிர் தணிக்கை முடிந்தது. உ.தி.ரா பொருத்தம் மற்றும் 4.76 சென்ட் குறைவு பகுப்பாய்வு செய்யப்பட்டது.',
      status: 'DONE',
    },
    {
      step: 'SPEAKERPHONE_CONSENT',
      time: '09:34 AM',
      desc: 'Co-parcener Selvi telephonic consent pending.',
      desc_ta: 'வாரிசுதாரர் செல்வியின் தொலைபேசி குரல் ஒப்புதல் நிலுவையில் உள்ளது.',
      status: 'IN_PROGRESS',
    },
    {
      step: 'VAO_STAMP_SLAM',
      time: '09:35 AM',
      desc: 'Padlocked HITL gate waiting for VAO OTP authorization.',
      desc_ta: 'VAO அதிகாரியின் OTP அங்கீகாரத்திற்காக முத்திரை வாயில் காத்திருக்கிறது.',
      status: 'PENDING',
    },
  ],
};

export const MOCK_CASE_9012: CaseState = {
  case_id: '9012',
  case_title: 'Sriperumbudur Meikkal Poramboke Red-Zone Trap',
  case_title_ta: 'ஸ்ரீபெரும்புதூர் மேய்க்கால் புறம்போக்கு சிவப்பு மண்டல பொறி',
  applicant_name: 'Palanisamy K.',
  applicant_name_ta: 'பழனிசாமி கே.',
  phone: '+91 94441 90123',
  district: 'Kanchipuram',
  taluk: 'Sriperumbudur',
  village: 'Pillaippakkam',
  old_survey_no: '88/1',
  new_survey_no: '204/A',
  patta_no: 'FAKE-991',
  deed_area_raw: '1.20 Acres (120 Cents)',
  deed_area_cents: 120.0,
  patta_area_raw: '0.00 Hectares (Government Classified)',
  patta_area_cents: 0.0,
  area_delta_cents: -120.0,
  land_classification: 'Meikkal Poramboke (Communal Grazing Reserve)',
  is_red_zone: true,
  red_zone_reason: 'SUPREME COURT MANDATE: Meikkal Poramboke (Grazing Land) cannot be alienated or mutated into private patta.',
  red_zone_reason_ta: 'உச்ச நீதிமன்ற ஆணை: மேய்க்கால் புறம்போக்கு நிலத்தை எக்காரணம் கொண்டும் தனியார் பட்டாவாக மாற்ற முடியாது.',
  status: 'REJECTED',
  loan_eligibility: 'PERMANENTLY_BLOCKED_CRITICAL_RED_ZONE',
  loan_eligibility_ta: 'அரசு புறம்போக்கு நிலம் - கடன் வழங்க நிரந்தரத் தடை',
  created_at: '2026-11-18T10:00:00Z',
  updated_at: '2026-11-18T10:02:00Z',
  extracted_fields: [
    {
      field_name: 'Land Classification',
      value: 'Meikkal Poramboke',
      raw_text: 'வகைப்பாடு: மேய்க்கால் புறம்போக்கு (கிராம பொது நிலம்)',
      confidence: 1.0,
      doc_type: 'PATTA',
      page: 1,
      bbox: [40, 100, 280, 130],
    },
  ],
  discrepancies: [
    {
      id: 'DISC-RED-01',
      type: 'CRITICAL_RED_ZONE_BLOCK',
      severity: 'CRITICAL',
      title: 'CRITICAL RED-ZONE BLOCK: Meikkal Poramboke',
      title_ta: 'சிவப்பு மண்டல தடை: மேய்க்கால் புறம்போக்கு நிலம்',
      description:
        'Survey 204/A is gazetted as communal grazing poramboke under Village Settlement Register. Unscrupulous broker attempted fraudulent deed creation.',
      description_ta:
        'சர்வே எண் 204/A கிராம மேய்க்கால் புறம்போக்கு என அரசு ஏடுகளில் பதிவாகியுள்ளது. போலி பத்திர முயற்சி முறியடிக்கப்பட்டது.',
      source_doc: 'Forged Deed 331/2012',
      target_doc: 'Village A-Register 1984',
      deed_value: 'Private Freehold',
      patta_value: 'Govt Meikkal Poramboke',
      delta: 'Illegal Alienation',
      resolved: false,
      action_required: 'Immediate rejection. FIR referral under TN Land Encroachment Act 1905.',
      action_required_ta: 'உடனடி நிராகரிப்பு. தமிழ்நாடு நில ஆக்கிரமிப்பு தடுப்புச் சட்டத்தின் கீழ் நடவடிக்கை.',
    },
  ],
  family_shares: [],
  hitl_approved: false,
  timeline: [
    {
      step: 'FARMER_VOICE_INTAKE',
      time: '10:00 AM',
      desc: 'Call received. S.No 204/A Pillaippakkam reported.',
      desc_ta: 'அழைப்பு பெறப்பட்டது. சர்வே 204/A பதிவு செய்யப்பட்டது.',
      status: 'DONE',
    },
    {
      step: 'RED_ZONE_INTERCEPT',
      time: '10:01 AM',
      desc: 'Automatic halt: Meikkal Poramboke detected. Title loan halted.',
      desc_ta: 'மேய்க்கால் புறம்போக்கு கண்டறியப்பட்டு உடனடி கடன் அனுமதி தடுக்கப்பட்டது.',
      status: 'DONE',
    },
  ],
};

export const api = {
  async getCase(caseId: string = '4821'): Promise<CaseState> {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Fallback to rich mock data
      return caseId === '9012' ? { ...MOCK_CASE_9012 } : { ...MOCK_CASE_4821 };
    }
  },

  async postVoiceIntake(req: IntakeVoiceRequest): Promise<{ case_id: string; receipt_code: string; transcript: string; reply: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/voice-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        case_id: '4821',
        receipt_code: '#4821',
        transcript: req.audio_text || 'முருகன் பேசுகிறேன். 1998 பத்திரத்துல 48 சென்ட், பட்டாவுல 0.17.5 ஹெக்டேர். கடன் கிடைக்கல.',
        reply: 'வணக்கம் முருகன் அய்யா. பழைய சர்வே 45/2 புதிய உ.தி.ரா சர்வே 114/2B உடன் இணைக்கப்பட்டது. 0.17.5 ஹெக்டேர் = 43.24 சென்ட். உங்கள் பாக்கெட் எண் #4821.',
      };
    }
  },

  async analyzeCase(caseId: string): Promise<CaseState> {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/analyze`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return caseId === '9012' ? { ...MOCK_CASE_9012 } : { ...MOCK_CASE_4821 };
    }
  },

  async splitFamilyShares(caseId: string): Promise<FamilyShare[]> {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/family-shares`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [
        {
          person_id: 'P-01',
          name: 'Murugan Shanmugam',
          name_ta: 'முருகன் சண்முகம்',
          relationship: 'Son (Applicant)',
          legal_heir_certificate_ref: 'W/2024/0912/01',
          share_percentage: 50.0,
          share_cents: 21.6217,
          consent_status: 'CONSENTED',
          phone_last4: '1829',
          consent_timestamp: '2026-11-18 09:31:00',
        },
        {
          person_id: 'P-02',
          name: 'Selvi M. (w/o Muthuvel)',
          name_ta: 'செல்வி மு. (க/பெ முத்துவேல்)',
          relationship: 'Married Daughter (Co-parcener)',
          legal_heir_certificate_ref: 'W/2024/0912/02',
          share_percentage: 50.0,
          share_cents: 21.6217,
          consent_status: 'CONSENTED',
          phone_last4: '9481',
          consent_timestamp: '2026-11-18 09:34:12',
        },
      ];
    }
  },

  async squeezePdf(caseId: string): Promise<SqueezeResult> {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/squeeze-pdf`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        original_bytes: 2977955, // 2.84 MB
        compressed_bytes: 346112, // 338 KB
        target_max_bytes: 409600, // 400 KB
        compression_ratio: 8.6,
        pass_used: 2,
        num_parts: 1,
        compliant: true,
        details: 'Pass 2: Adaptive DPI (120 DPI) + JPEG 60% with lossless stream deflation.',
        part_files: ['nilamtrace_4821_squeezed_338kb.pdf'],
      };
    }
  },

  async approveHITL(req: HITLApprovalRequest): Promise<HITLApprovalResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${req.case_id}/hitl-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        success: true,
        case_id: req.case_id,
        status: 'APPROVED',
        stamp_signature: 'VAO-UTHUKOTTAI-2026-TN-4821-SIG',
        approved_at: new Date().toISOString(),
        dossier_download_url: `/api/cases/${req.case_id}/dossier.pdf`,
      };
    }
  },

  getDossierUrl(caseId: string): string {
    return `${API_BASE}/api/cases/${caseId}/dossier.pdf`;
  },
};
