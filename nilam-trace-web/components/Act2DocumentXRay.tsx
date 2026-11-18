'use client';

import React, { useState } from 'react';
import { CaseState, Language, DocumentStatus } from '@/types/nilamtrace';
import { apiClient } from '@/lib/apiClient';
import {
  FileText,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Eye,
  Layers,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

interface Act2DocumentXRayProps {
  caseData: CaseState;
  language: Language;
  onRefreshCase?: () => void;
}

export const Act2DocumentXRay: React.FC<Act2DocumentXRayProps> = ({ caseData, language, onRefreshCase }) => {
  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  const [activeTab, setActiveTab] = useState<'dual' | 'deed' | 'patta'>('dual');
  const [showOverlayMask, setShowOverlayMask] = useState<boolean>(true);
  const [localVerified, setLocalVerified] = useState<Record<string, boolean>>({
    deceased_owner: caseData.verified_fields?.deceased_owner?.human_verified || false,
    applicant_name: caseData.verified_fields?.applicant_name?.human_verified || false,
    survey_no: caseData.verified_fields?.survey_no?.human_verified || false,
    subdivision: caseData.verified_fields?.subdivision?.human_verified || false,
    doc_date: caseData.verified_fields?.doc_date?.human_verified || false,
    extent: caseData.verified_fields?.extent?.human_verified || false,
  });
  const [verifyingField, setVerifyingField] = useState<string | null>(null);

  const handleVerifyField = async (fieldName: string) => {
    setVerifyingField(fieldName);
    const newStatus = !localVerified[fieldName];
    try {
      await apiClient.verifyField(caseData.case_id, fieldName, newStatus);
      setLocalVerified((prev) => ({ ...prev, [fieldName]: newStatus }));
      if (onRefreshCase) onRefreshCase();
    } catch (e) {
      console.error('Field verify error:', e);
    } finally {
      setVerifyingField(null);
    }
  };

  const allCriticalVerified =
    localVerified['deceased_owner'] && localVerified['applicant_name'] && localVerified['survey_no'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1DBD5] space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D1DBD5]/60 pb-4">
        <div>
          <span className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {dict.acts.act2Title}
          </span>
          <h2 className="text-lg font-bold text-[#111827] mt-1.5 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0B6E4F]" />
            <span>{dict.xray.title}</span>
          </h2>
          <p className="text-xs text-[#4B5563] mt-0.5">
            {dict.xray.humanVerifyNotice}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F4F7F5] p-1 rounded-xl flex items-center border border-[#D1DBD5] text-xs font-medium">
            <button
              onClick={() => setActiveTab('dual')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'dual'
                  ? 'bg-[#0B6E4F] text-white font-bold shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              {isTa ? 'இரு ஆவண ஒப்பீடு' : 'Dual Ledger (1994 vs 2024)'}
            </button>
            <button
              onClick={() => setActiveTab('deed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'deed'
                  ? 'bg-[#0B6E4F] text-white font-bold shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              {dict.xray.toggleDeed}
            </button>
            <button
              onClick={() => setActiveTab('patta')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'patta'
                  ? 'bg-[#0B6E4F] text-white font-bold shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              {dict.xray.togglePatta}
            </button>
          </div>

          <button
            onClick={() => setShowOverlayMask(!showOverlayMask)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${
              showOverlayMask
                ? 'bg-emerald-50 text-[#0B6E4F] border-emerald-300'
                : 'bg-white text-[#4B5563] border-[#D1DBD5]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{dict.xray.toggleOverlay}</span>
          </button>
        </div>
      </div>

      {/* MISSING DOCUMENT TRACKER BANNER (Setback 2 & 7) */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#92400E]">
                {isTa ? 'ஆவணங்கள் நிலை அறிக்கை (Document Inventory)' : 'Multi-Visit Document Inventory Tracker'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {isTa ? 'வாரிசுச் சான்றிதழ் தேவை' : 'REV-114 Action Needed'}
              </span>
            </div>
            <p className="text-xs text-[#B45309] mt-1">
              {dict.xray.missingVarisuWarning}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mt-3">
              {caseData.inventory?.map((doc, idx) => {
                const isAvail = doc.status === 'AVAILABLE' || doc.status === 'UPLOADED';
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                      isAvail ? 'bg-white border-emerald-200' : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111827] line-clamp-1">
                          {isTa ? doc.doc_name_ta : doc.doc_name}
                        </span>
                        {isAvail ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#4B5563] mt-1 line-clamp-2">
                        {isTa ? doc.how_to_obtain_ta : doc.how_to_obtain_en}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#0B6E4F]">Fee: ₹{doc.official_fee_inr}</span>
                      <span className={`font-bold ${isAvail ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isAvail ? (isTa ? 'கைவசம் உள்ளது ✅' : 'AVAILABLE ✅') : (isTa ? 'பெற வேண்டும் ❌' : 'MISSING ❌')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Center Stage: Document X-Ray Spotlight + Field Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Living Paper Mock with 90% Dimmed Spotlight (7 Cols) */}
        <div className="lg:col-span-7 bg-[#F4F7F5] rounded-xl p-4 border border-[#D1DBD5] space-y-4">
          <div className="flex items-center justify-between text-xs text-[#4B5563] border-b border-[#D1DBD5]/50 pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0B6E4F]" />
              {isTa ? '1994 கிரையப் பத்திரம் & 2024 பட்டா பக்கம் 1' : '1994 Registered Deed & 2024 Patta Schedule'}
            </span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#D1DBD5]">
              Doc No: 1420/1994 · Patta: 382
            </span>
          </div>

          {/* Living Paper Container with Dimmed Mask */}
          <div className="relative bg-white rounded-lg p-5 border border-gray-300 shadow-inner font-mono text-[11px] text-gray-800 leading-relaxed overflow-hidden">
            {/* The 90% Dimming Overlay Mask */}
            {showOverlayMask && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)' }}
              />
            )}

            {/* Document Header Text */}
            <div className="relative z-0 text-center border-b border-gray-200 pb-2 mb-3">
              <p className="font-bold text-gray-700 text-xs">
                GOVERNMENT OF TAMIL NADU · REVENUE DEPARTMENT
              </p>
              <p className="text-[10px] text-gray-500">
                DISTRICT: THIRUVALLUR · TALUK: THIRUVALLUR · VILLAGE: PAKKAM
              </p>
            </div>

            {/* Paragraph with Spotlights (Z-index 20 shines through mask!) */}
            <div className="space-y-3">
              <p className="relative z-0">
                Schedule of Property conveyed under registered instrument Doc No. 1420 of 1994. All that piece and parcel of
                agricultural land situated at Pakkam Village.
              </p>

              {/* Spotlight 1: Deceased Pattadhar */}
              <div className="relative z-20 bg-white p-2.5 rounded-lg border-2 border-red-500 shadow-lg shadow-red-500/20">
                <div className="flex items-center justify-between text-xs font-bold text-red-700">
                  <span>[Spotlight A] Registered Pattadhar: A. Subramaniam</span>
                  <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded">
                    DECEASED (2018)
                  </span>
                </div>
                <p className="text-[11px] text-gray-800 mt-1">
                  Owner passed away on 12-06-2018. Patta still remains in father&apos;s name. Requires REV-114 Legal Heirship.
                </p>
              </div>

              {/* Spotlight 2: Survey Correlation (Old 45/2 -> New 114/2B) */}
              <div className="relative z-20 bg-white p-2.5 rounded-lg border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>[Spotlight B] Survey Number: New 114/2B (Old 45/2)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded">
                    UDR LINK RESOLVED
                  </span>
                </div>
                <p className="text-[11px] text-gray-800 mt-1">
                  1984 UDR Resurvey matched Old Survey 45/2 to New Survey 114/2B. Continuity verified.
                </p>
              </div>

              {/* Spotlight 3: Area Extent Consistency Check */}
              <div className="relative z-20 bg-white p-2.5 rounded-lg border-2 border-amber-500 shadow-lg shadow-amber-500/20">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>[Spotlight C] Area Extent: 0.17.5 Hectares (43.24 Cents)</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded">
                    -4.76 Cents Variance
                  </span>
                </div>
                <p className="text-[11px] text-gray-800 mt-1">
                  1994 Sale Deed: 48.00 Cents vs. 2024 Patta: 43.24 Cents. Supporting check flags 4.76 Cents unrecorded subdivision.
                </p>
              </div>

              <p className="relative z-0 text-[10px] text-gray-500 pt-2 border-t border-gray-100">
                Extracted via PyMuPDF with page-level bounding box citations [Page 1, Box 72-140-280-160].
              </p>
            </div>
          </div>

          {/* Unit Math Breakdown Box */}
          <div className="bg-white p-3.5 rounded-lg border border-[#D1DBD5] text-xs">
            <div className="flex items-center gap-2 text-[#0B6E4F] font-bold">
              <Calculator className="w-4 h-4" />
              <span>{dict.xray.unitMathTitle}</span>
            </div>
            <p className="text-[11px] text-[#4B5563] mt-1 font-mono">
              0.17.5 Ha = 0.175 × 247.105381 = 43.2434 Cents. Delta vs 48.0 Deed = -4.76 Cents (Threshold ε = 0.48 Cents).
            </p>
          </div>
        </div>

        {/* Right: Mandatory Field-by-Field Human Verification Gate (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 border border-[#D1DBD5] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D1DBD5]/60 pb-2">
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#0B6E4F]" />
              <span>{dict.xray.legendTitle}</span>
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                allCriticalVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {allCriticalVerified ? (isTa ? 'சரிபார்க்கப்பட்டது ✅' : 'Verified ✅') : (isTa ? 'சரிபார்ப்பு தேவை ⚠️' : 'Action Required ⚠️')}
            </span>
          </div>

          <p className="text-xs text-[#4B5563]">
            {isTa
              ? 'கணினி தானாக ஏற்றுமதி செய்யாது. ஒவ்வொரு முக்கிய புலத்தையும் பணியாளர் நேரடியாக சரிபார்க்க வேண்டும்.'
              : 'Zero black-box AI acceptance. Operator must verify each extracted field before dossier can be generated.'}
          </p>

          {/* Verification Cards */}
          <div className="space-y-2.5">
            {Object.entries(caseData.verified_fields || {}).map(([key, field]) => {
              const isVerified = localVerified[key] || false;
              const isLowConf = field.confidence < 0.85;

              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg border transition ${
                    isVerified
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : isLowConf
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#111827] capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        {isLowConf && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                            {isTa ? 'குறைந்த நம்பிக்கை' : 'Low Conf'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-[#0B6E4F] mt-0.5">
                        {String(field.corrected_value || field.extracted_value)}
                      </p>
                      <span className="text-[10px] text-[#4B5563]">
                        Confidence: {(field.confidence * 100).toFixed(0)}% · Page {field.page_num}
                      </span>
                    </div>

                    <button
                      onClick={() => handleVerifyField(key)}
                      disabled={verifyingField === key}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition shrink-0 ${
                        isVerified
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-[#111827] border-gray-300 hover:border-[#0B6E4F]'
                      }`}
                    >
                      {isVerified ? (isTa ? 'சரிபார்க்கப்பட்டது ✓' : 'Verified ✓') : (isTa ? 'சரிபார்க்க' : 'Verify')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification Status Summary */}
          <div
            className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
              allCriticalVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {allCriticalVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isTa
                    ? 'அனைத்து முக்கிய புலங்களும் சரிபார்க்கப்பட்டன. படி 3க்கு செல்லலாம்.'
                    : 'All critical fields verified by human operator. Ready for Act 3.'}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isTa
                    ? 'முக்கிய புலங்களை (தந்தை பெயர், சர்வே எண்) சரிபார்க்கவும்.'
                    : 'Please verify critical fields (Deceased Name, Survey No) to proceed.'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
