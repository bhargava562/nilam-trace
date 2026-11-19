'use client';

import React, { useState } from 'react';
import { CaseState, Language } from '@/types/nilamtrace';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface Act2DocumentXRayProps {
  caseData: CaseState;
  language: Language;
  onRefreshCase?: () => void;
  onGoToAct3?: () => void;
}

export const Act2DocumentXRay: React.FC<Act2DocumentXRayProps> = ({
  caseData,
  language,
  onRefreshCase,
  onGoToAct3,
}) => {
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const [activeDocTab, setActiveDocTab] = useState<'patta' | 'deed'>('patta');
  const [selectedSpotlight, setSelectedSpotlight] = useState<string>('deceased_owner');
  const [showMathBar, setShowMathBar] = useState<boolean>(true);
  const [showRev114Help, setShowRev114Help] = useState<boolean>(false);

  const [localVerified, setLocalVerified] = useState<Record<string, boolean>>({
    deceased_owner: caseData.verified_fields?.deceased_owner?.human_verified || false,
    applicant_name: caseData.verified_fields?.applicant_name?.human_verified || false,
    survey_no: caseData.verified_fields?.survey_no?.human_verified || false,
    subdivision: caseData.verified_fields?.subdivision?.human_verified || false,
    extent: caseData.verified_fields?.extent?.human_verified || false,
  });

  const [verifyingKey, setVerifyingKey] = useState<string | null>(null);

  const handleVerifyField = async (key: string) => {
    setVerifyingKey(key);
    const newStatus = !localVerified[key];
    setLocalVerified((prev) => ({ ...prev, [key]: newStatus }));
    setSelectedSpotlight(key);

    try {
      await apiClient.verifyField(caseData.case_id, key, newStatus, 'JanAI Cafe Operator #104');
      if (onRefreshCase) onRefreshCase();
    } catch {
      // offline/optimistic fallback
    } finally {
      setVerifyingKey(null);
    }
  };

  const allCriticalVerified =
    localVerified['deceased_owner'] &&
    localVerified['survey_no'] &&
    localVerified['extent'];

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2">
      {/* 1. TOP STRIP: Sleek Horizontal 1-Line Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#D1DBD5] shadow-2xs shrink-0 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            {isTa ? 'ஆவணங்கள்:' : isHi ? 'दस्तावेज़:' : 'Documents:'}
          </span>

          {/* Pill 1: Death Cert */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium shrink-0">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{isTa ? 'இறப்புச் சான்றிதழ்' : isHi ? 'मृत्यु प्रमाण पत्र' : 'Death Cert'}</span>
          </span>

          {/* Pill 2: 1994 Sale Deed */}
          <button
            onClick={() => setActiveDocTab('deed')}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium shrink-0 transition ${
              activeDocTab === 'deed'
                ? 'bg-[#0B6E4F] text-white border-[#08523B] font-bold'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className={`w-3 h-3 ${activeDocTab === 'deed' ? 'text-white' : 'text-emerald-600'}`} />
            <span>{isTa ? '1994 கிரையப் பத்திரம்' : isHi ? '1994 बिक्री विलेख' : '1994 Sale Deed'}</span>
          </button>

          {/* Pill 3: 2024 Patta */}
          <button
            onClick={() => setActiveDocTab('patta')}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium shrink-0 transition ${
              activeDocTab === 'patta'
                ? 'bg-[#0B6E4F] text-white border-[#08523B] font-bold'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className={`w-3 h-3 ${activeDocTab === 'patta' ? 'text-white' : 'text-emerald-600'}`} />
            <span>{isTa ? '2024 கணினி பட்டா' : isHi ? '2024 पट्टा' : '2024 Patta Schedule'}</span>
          </button>

          {/* Pill 4: REV-114 Missing Warning */}
          <button
            onClick={() => setShowRev114Help(!showRev114Help)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold hover:bg-amber-100 transition shrink-0 animate-pulse"
            title="Click for instructions to obtain REV-114"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{isTa ? 'REV-114 வாரிசுச் சான்றிதழ் (இல்லை — ₹60)' : isHi ? 'REV-114 वारिस प्रमाण पत्र (प्राप्त करें — ₹60)' : 'REV-114 Legal Heir (Missing — ₹60)'}</span>
            <Info className="w-2.5 h-2.5 text-amber-700 ml-0.5" />
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#0B6E4F] font-semibold hidden md:inline">
          {isTa ? 'வழக்கு: #4821 · திருத்தப்பட்ட UDR' : isHi ? 'केस: #4821 · UDR सर्वे' : 'Case #4821 · UDR Verified'}
        </span>
      </div>

      {/* REV-114 Info Help Popover Banner */}
      {showRev114Help && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-between shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {isTa
                ? 'வட்டாட்சியர் வாரிசுச் சான்றிதழ் (REV-114) இ-சேவை மையத்தில் ₹60 செலுத்தி குடும்ப அட்டை & ஆதாரை வைத்து உடனடியாகப் பெறலாம்.'
                : isHi
                ? 'तहसीलदार कानूनी वारिस प्रमाण-पत्र (REV-114) निकटतम ई-सेवा केंद्र पर ₹60 देकर राशन कार्ड और आधार कार्ड से प्राप्त करें।'
                : 'Tahsildar Legal Heir Certificate (REV-114) must be obtained at e-Sevai with ₹60 fee using family Aadhaar & Ration card.'}
            </span>
          </div>
          <button
            onClick={() => setShowRev114Help(false)}
            className="text-amber-800 hover:text-black font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. MAIN SPLIT WORKSPACE: 58% Document Sheet + 42% Compact Verification Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* LEFT COLUMN (58% width): Real Visual Tamil Nadu Paper Document Canvas */}
        <div className="lg:col-span-7 bg-[#212b25] rounded-xl p-3 shadow-inner flex flex-col justify-between overflow-hidden relative border border-slate-700">
          {/* Paper Canvas Header */}
          <div className="flex justify-between items-center text-xs text-slate-300 pb-1.5 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white tracking-wide">
                {activeDocTab === 'patta'
                  ? (isTa ? 'தமிழ்நாடு நிலப்பட்டா நகல் (2024)' : isHi ? 'तमिलनाडु पट्टा पत्र (2024)' : 'Tamil Nadu Computer Patta Schedule (2024)')
                  : (isTa ? '1994 பதிவு செய்யப்பட்ட கிரையப் பத்திரம்' : isHi ? '1994 पंजीकृत विक्रय विलेख' : '1994 Registered Sale Deed (Doc #1420)')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              {isTa ? '85% வெளிச்சக் குவிப்பு' : 'Spotlight Active'}
            </span>
          </div>

          {/* Authentic Paper Document Simulation with 85% Dimmed Overlay and Glowing Spotlights */}
          <div className="relative flex-1 my-2 bg-[#FDFCF7] rounded-lg p-4 font-serif text-slate-800 shadow-md border border-[#E2DFD2] overflow-y-auto leading-relaxed text-xs select-none">
            {/* Tamil Nadu Govt Emblem & Watermark */}
            <div className="text-center border-b-2 border-emerald-900/30 pb-2 mb-3">
              <div className="text-[11px] font-bold text-[#0B6E4F] tracking-wider uppercase font-sans">
                தமிழ்நாடு அரசு • வருவாய்த் துறை (Govt of Tamil Nadu)
              </div>
              <div className="text-[13px] font-bold text-slate-900 mt-0.5">
                {activeDocTab === 'patta' ? 'படிவம் 11 • பட்டா நகல் (Computerized Patta)' : 'கிரையப் பத்திரம் • ஆவண எண்: 1420/1994'}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                மாவட்டம்: திருவள்ளூர் · வட்டம்: ஊத்துக்கோட்டை · கிராமம்: பாக்கம் (Pakkam)
              </div>
            </div>

            {/* Document Body with Glowing Spotlight Bounding Boxes */}
            <div className="space-y-3 font-sans text-xs">
              {/* SPOTLIGHT ZONE 1: Deceased Owner */}
              <div
                onClick={() => setSelectedSpotlight('deceased_owner')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  selectedSpotlight === 'deceased_owner'
                    ? 'ring-2 ring-amber-400 bg-amber-50/90 shadow-xs border-amber-500'
                    : 'bg-white/90 border-slate-300 hover:border-emerald-600'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-bold text-[#0B6E4F] uppercase">
                    [Box A] பட்டாதாரர் பெயர் / Registered Owner
                  </span>
                  <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">
                    Confidence: 96%
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>சுப்பிரமணியம் சண்முகம் (Subramaniam S.)</span>
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-1.5 rounded">
                    {isTa ? 'மறைவு (2018)' : 'Deceased'}
                  </span>
                </div>
              </div>

              {/* SPOTLIGHT ZONE 2: Survey & Subdivision */}
              <div
                onClick={() => setSelectedSpotlight('survey_no')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  selectedSpotlight === 'survey_no' || selectedSpotlight === 'subdivision'
                    ? 'ring-2 ring-amber-400 bg-amber-50/90 shadow-xs border-amber-500'
                    : 'bg-white/90 border-slate-300 hover:border-emerald-600'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-bold text-[#0B6E4F] uppercase">
                    [Box B] சர்வே எண் & உட்பிரிவு / Survey & Subdivision
                  </span>
                  <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">
                    Confidence: 94%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-0.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">புதிய UDR சர்வே:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">114/2B</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">1994 பழைய சர்வே:</span>
                    <span className="font-bold font-mono text-slate-700 text-sm">45/2 (Verified Link)</span>
                  </div>
                </div>
              </div>

              {/* SPOTLIGHT ZONE 3: Extent / Area Calculation */}
              <div
                onClick={() => setSelectedSpotlight('extent')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  selectedSpotlight === 'extent'
                    ? 'ring-2 ring-amber-400 bg-amber-50/90 shadow-xs border-amber-500'
                    : 'bg-white/90 border-slate-300 hover:border-emerald-600'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-bold text-[#0B6E4F] uppercase">
                    [Box C] பரப்பளவு / Extent of Agricultural Land
                  </span>
                  <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">
                    Confidence: 92%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <div>
                    <span className="text-base font-bold font-mono text-[#0B6E4F]">
                      0.17.5 Hectare
                    </span>
                    <span className="text-xs text-slate-600 ml-2 font-medium">
                      (= 43.24 Cents / 18,835 Sq.Ft)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                    Δ -4.76 Cents
                  </span>
                </div>
              </div>
            </div>

            {/* Official Footer Stamp Seal */}
            <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-sans">
              <span>வட்டாட்சியர் அலுவலகம், ஊத்துக்கோட்டை</span>
              <span className="font-mono text-emerald-800 font-bold">TN-REVENUE-DIGITAL-SIGN #4821</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (42% width): Compact 5-Row Verification Table + Collapsible Unit Math */}
        <div className="lg:col-span-5 bg-white rounded-xl p-3 shadow-xs border border-[#D1DBD5] flex flex-col justify-between overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-[#D1DBD5]/60 pb-1.5 shrink-0">
            <div>
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>{isTa ? 'மனித கள சரிபார்ப்பு' : isHi ? 'मानवीय सत्यापन' : 'Human Field Verification'}</span>
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                allCriticalVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {allCriticalVerified ? 'VERIFIED ✅' : 'ACTION REQUIRED ⚠️'}
            </span>
          </div>

          {/* 5-Row Compact Human Verification Table (70% text reduction) */}
          <div className="my-1 space-y-1.5 overflow-y-auto pr-0.5">
            {[
              {
                key: 'deceased_owner',
                label: isTa ? 'மறைந்த உரிமையாளர்' : isHi ? 'दिवंगत स्वामी' : 'Deceased Owner',
                val: 'Subramaniam S.',
                conf: '96%',
              },
              {
                key: 'applicant_name',
                label: isTa ? 'விண்ணப்பதாரர்' : isHi ? 'आवेदक' : 'Applicant Heir',
                val: 'Murugan S.',
                conf: '95%',
              },
              {
                key: 'survey_no',
                label: isTa ? 'சர்வே எண்' : isHi ? 'सर्वे नं' : 'Survey No',
                val: '114/2B (Old: 45/2)',
                conf: '94%',
              },
              {
                key: 'subdivision',
                label: isTa ? 'உட்பிரிவு' : isHi ? 'उप-विभाजन' : 'Subdivision',
                val: '2B · UDR Resurvey',
                conf: '91%',
              },
              {
                key: 'extent',
                label: isTa ? 'பரப்பளவு' : isHi ? 'क्षेत्रफल' : 'Extent',
                val: '0.17.5 Ha (43.24 Cents)',
                conf: '92%',
              },
            ].map((row) => {
              const isChecked = localVerified[row.key] || false;
              const isSelected = selectedSpotlight === row.key;

              return (
                <div
                  key={row.key}
                  onClick={() => setSelectedSpotlight(row.key)}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'border-[#0B6E4F] bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800 truncate">{row.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({row.conf})</span>
                    </div>
                    <div className="font-mono font-bold text-xs text-[#0B6E4F] truncate mt-0.5">
                      {row.val}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerifyField(row.key);
                    }}
                    disabled={verifyingKey === row.key}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md border transition shrink-0 flex items-center gap-1 ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-[#0B6E4F]'
                    }`}
                  >
                    {isChecked ? <Check className="w-3 h-3" /> : null}
                    <span>{isChecked ? 'Verified' : 'Verify'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Slim Collapsible Unit Math Bar */}
          <div className="bg-[#F4F7F5] border border-[#D1DBD5] rounded-lg p-2 shrink-0">
            <button
              onClick={() => setShowMathBar(!showMathBar)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-700"
            >
              <span className="flex items-center gap-1">
                <span>{isTa ? 'வருவாய்த்துறை பரப்பளவு கணக்கீடு' : isHi ? 'राजस्व इकाई गणित' : 'Deterministic Unit Math'}</span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">(0.17.5 Ha = 43.24 Cents)</span>
              </span>
              {showMathBar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMathBar && (
              <div className="grid grid-cols-3 gap-1.5 pt-1.5 mt-1 border-t border-slate-200 text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 block">1994 Deed</span>
                  <span className="font-bold text-slate-800">48.00 Cents</span>
                </div>
                <div>
                  <span className="text-slate-400 block">2024 Patta</span>
                  <span className="font-bold text-slate-800">43.24 Cents</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Delta</span>
                  <span className="font-bold text-amber-700">-4.76 Cents</span>
                </div>
              </div>
            )}
          </div>

          {/* Next CTA Button to Step 3 */}
          <button
            onClick={onGoToAct3}
            className="w-full mt-2 py-2.5 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 active:scale-98 shrink-0"
          >
            <span>
              {isTa
                ? 'படி 3க்கு செல்க: உரிமைப் பாதை & மனு ➔'
                : isHi
                ? 'चरण 3 पर जाएं: उत्तराधिकार मार्ग एवं आवेदन ➔'
                : 'Proceed to Act 3: Verify & Export ➔'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
