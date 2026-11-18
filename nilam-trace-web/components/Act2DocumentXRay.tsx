'use client';

import React, { useState } from 'react';
import { CaseState, Discrepancy, Language } from '@/types/nilamtrace';
import {
  FileText,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Eye,
  Layers,
  ArrowRight,
  Maximize2,
  ShieldAlert,
} from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

interface Act2DocumentXRayProps {
  caseData: CaseState;
  language: Language;
}

export const Act2DocumentXRay: React.FC<Act2DocumentXRayProps> = ({ caseData, language }) => {
  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  const [activeTab, setActiveTab] = useState<'dual' | 'deed' | 'patta'>('dual');
  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState<string>('DISC-002');
  const [showOverlayMask, setShowOverlayMask] = useState<boolean>(true);

  const selectedDiscrepancy = caseData.discrepancies.find((d) => d.id === selectedDiscrepancyId);

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
              {isTa ? 'இரு ஆவண ஒப்பீடு' : 'Dual Ledger (1998 vs 2024)'}
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
            onClick={() => setShowOverlayMask((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              showOverlayMask
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
            <span>{dict.xray.toggleOverlay}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Living Paper Surface Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-[#D1DBD5] bg-[#0F172A] p-4 sm:p-6">
        {/* Dimmed PDF Mask Overlay when active */}
        {showOverlayMask && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)' }}
          />
        )}

        {/* SVG Laser Connector Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Laser beam connecting Deed Survey 45/2 to Patta Survey 114/2B */}
          {selectedDiscrepancyId === 'DISC-003' && (
            <line
              x1="28%"
              y1="34%"
              x2="72%"
              y2="34%"
              stroke="#10B981"
              strokeWidth="2.5"
              className="laser-connector"
            />
          )}

          {/* Laser beam connecting Area 48 Cents to 0.17.5 Ha */}
          {selectedDiscrepancyId === 'DISC-002' && (
            <line
              x1="28%"
              y1="56%"
              x2="72%"
              y2="56%"
              stroke="#F59E0B"
              strokeWidth="2.5"
              className="laser-connector"
            />
          )}

          {/* Laser beam connecting Pattadhar Shanmugam deceased */}
          {selectedDiscrepancyId === 'DISC-001' && (
            <line
              x1="28%"
              y1="22%"
              x2="72%"
              y2="22%"
              stroke="#EF4444"
              strokeWidth="2.5"
              className="laser-connector"
            />
          )}
        </svg>

        {/* Paper Container Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
          {/* Paper 1: Sale Deed 1420/1998 (Historical Deed Ledger) */}
          {(activeTab === 'dual' || activeTab === 'deed') && (
            <div className="paper-surface rounded-xl p-5 bg-[#FCFDFD] text-[#111827] shadow-xl relative border-t-4 border-amber-600">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold font-mono uppercase text-amber-900">
                    {isTa ? 'பதிவு ஆவணம் எண் 1420/1998' : 'Registered Sale Deed No. 1420/1998'}
                  </span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                  SRO Uthukottai (12-Oct-1998)
                </span>
              </div>

              {/* Deed Content Fields with Spotlight Highlights */}
              <div className="space-y-4 text-xs font-mono">
                {/* Person Field */}
                <div
                  className={`p-2.5 rounded-lg transition-all ${
                    selectedDiscrepancyId === 'DISC-001'
                      ? 'bg-amber-100/90 ring-2 ring-red-500 shadow-md scale-101'
                      : 'bg-amber-50/50'
                  }`}
                >
                  <span className="text-[10px] text-amber-800 uppercase block font-semibold">
                    1. Purchaser / வாங்குபவர்
                  </span>
                  <div className="text-slate-900 font-bold text-sm">
                    {isTa ? 'சண்முகம் த/பெ ராமன்' : 'Shanmugam S/o Raman'}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Aged 42, Agriculturist, Periyapalayam Village
                  </span>
                </div>

                {/* Old Survey Field */}
                <div
                  className={`p-2.5 rounded-lg transition-all ${
                    selectedDiscrepancyId === 'DISC-003'
                      ? 'bg-emerald-100/90 ring-2 ring-emerald-500 shadow-md scale-101'
                      : 'bg-amber-50/50'
                  }`}
                >
                  <span className="text-[10px] text-emerald-800 uppercase block font-semibold">
                    2. Old Survey Number / பழைய சர்வே எண்
                  </span>
                  <div className="text-slate-900 font-bold text-base">
                    S.No: <span className="bg-emerald-200 px-1 rounded text-emerald-900">45/2</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Original Pre-UDR Re-survey Cadastral Map #12
                  </span>
                </div>

                {/* Extent in Cents Field */}
                <div
                  className={`p-2.5 rounded-lg transition-all ${
                    selectedDiscrepancyId === 'DISC-002'
                      ? 'bg-amber-100/90 ring-2 ring-amber-500 shadow-md scale-101'
                      : 'bg-amber-50/50'
                  }`}
                >
                  <span className="text-[10px] text-amber-800 uppercase block font-semibold">
                    3. Registered Extent / கிரையப் பரப்பு
                  </span>
                  <div className="text-slate-900 font-bold text-base">
                    Extent: <span className="bg-amber-200 px-1 rounded text-amber-950 font-bold">48 Cents</span> (0.48 Acre)
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Square Feet: 20,908.80 sq.ft (கெஜம் / குழி முறைப்படி)
                  </span>
                </div>

                {/* Encumbrance & Boundary */}
                <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    4. Boundaries / நான்கு எல்லைகள்
                  </span>
                  <div>North: Govindasamy Land | South: PWD Irrigation Channel</div>
                  <div>East: Village Cart Track | West: Munusamy Field</div>
                </div>
              </div>
            </div>
          )}

          {/* Paper 2: Patta #2041 (Anyam Rayathwari Patta 2024) */}
          {(activeTab === 'dual' || activeTab === 'patta') && (
            <div className="paper-surface rounded-xl p-5 bg-[#FCFDFD] text-[#111827] shadow-xl relative border-t-4 border-[#0B6E4F]">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0B6E4F]" />
                  <span className="text-xs font-bold font-mono uppercase text-[#08523B]">
                    {isTa ? 'தமிழ் நிலம் கம்ப்யூட்டர் பட்டா எண் 2041' : 'Tamil Nilam Computer Patta #2041'}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  Anyam Rayathwari (2024 Record)
                </span>
              </div>

              {/* Patta Content Fields with Spotlight Highlights */}
              <div className="space-y-4 text-xs font-mono">
                {/* Pattadhar Field (Deceased Flagged) */}
                <div
                  className={`p-2.5 rounded-lg transition-all ${
                    selectedDiscrepancyId === 'DISC-001'
                      ? 'bg-red-50 ring-2 ring-red-500 shadow-md scale-101'
                      : 'bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-800 uppercase font-semibold">
                      1. Registered Pattadhar / பட்டாதாரர்
                    </span>
                    <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                      DECEASED / மறைவு
                    </span>
                  </div>
                  <div className="text-slate-900 font-bold text-sm">
                    {isTa ? 'சண்முகம் த/பெ ராமன்' : 'Shanmugam S/o Raman'}
                  </div>
                  <span className="text-[10px] text-red-600 font-semibold">
                    {dict.xray.deceasedNotice}
                  </span>
                </div>

                {/* New UDR Survey Field */}
                <div
                  className={`p-2.5 rounded-lg transition-all ${
                    selectedDiscrepancyId === 'DISC-003'
                      ? 'bg-emerald-100/90 ring-2 ring-emerald-500 shadow-md scale-101'
                      : 'bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                      2. New UDR Survey No / புதிய சர்வே எண்
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.2 rounded">
                      UDR RESOLVED
                    </span>
                  </div>
                  <div className="text-slate-900 font-bold text-base">
                    S.No: <span className="bg-emerald-200 px-1 rounded text-emerald-900">114/2B</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {dict.xray.udrCorrelation}
                  </span>
                </div>

                {/* Metric Area Field (0.17.5 Hectares) */}
                <div
                  className={`p-2.5 rounded-lg transition-all ${
                    selectedDiscrepancyId === 'DISC-002'
                      ? 'bg-amber-100/90 ring-2 ring-amber-500 shadow-md scale-101'
                      : 'bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-900 uppercase font-semibold">
                      3. Patta Extent (Metric) / பட்டா பரப்பு
                    </span>
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-1.5 py-0.2 rounded">
                      -4.76 CENTS DELTA
                    </span>
                  </div>
                  <div className="text-slate-900 font-bold text-base">
                    Extent:{' '}
                    <span className="bg-amber-200 px-1 rounded text-amber-950 font-bold">
                      0.17.5 Hectares
                    </span>{' '}
                    (= 43.24 Cents)
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    17.5 Ares • 18,836.8 sq.ft (Difference: -4.76 Cents)
                  </span>
                </div>

                {/* Land Classification */}
                <div className="p-2.5 rounded-lg bg-emerald-50 text-[11px] text-slate-700">
                  <span className="text-[10px] text-[#0B6E4F] uppercase block font-semibold">
                    4. Classification / வகைப்பாடு
                  </span>
                  <div className="font-semibold text-emerald-950">
                    Ayan Nanjai (Rayathwari Wetland) • Assessment: ₹4.82
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discrepancy Cards & Selector */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
          {dict.xray.legendTitle} ({caseData.discrepancies.length} Findings)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {caseData.discrepancies.map((disc: Discrepancy) => {
            const isSelected = disc.id === selectedDiscrepancyId;
            const isCritical = disc.severity === 'CRITICAL';
            const isWarning = disc.severity === 'WARNING';
            const isResolved = disc.severity === 'RESOLVED' || disc.resolved;

            return (
              <button
                key={disc.id}
                onClick={() => setSelectedDiscrepancyId(disc.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? isCritical
                      ? 'border-red-500 bg-red-50/80 ring-2 ring-red-400'
                      : isWarning
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                      : 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400'
                    : 'border-[#D1DBD5] bg-white hover:bg-[#F4F7F5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isCritical
                        ? 'bg-red-100 text-red-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {disc.severity}
                  </span>
                  {isResolved ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle
                      className={`w-4 h-4 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}
                    />
                  )}
                </div>

                <div className="font-bold text-xs text-[#111827] line-clamp-1">
                  {isTa && disc.title_ta ? disc.title_ta : disc.title}
                </div>

                <div className="text-[11px] text-[#4B5563] mt-1 line-clamp-2">
                  {isTa && disc.description_ta ? disc.description_ta : disc.description}
                </div>

                {disc.delta && (
                  <div className="mt-2 text-[10px] font-mono font-bold text-slate-800 bg-white/70 px-2 py-0.5 rounded border border-slate-200 inline-block">
                    Delta: {disc.delta}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deterministic Unit Math Breakdown Card */}
      <div className="bg-[#F4F7F5] border border-[#D1DBD5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 border-b border-[#D1DBD5] pb-2">
          <Calculator className="w-4 h-4 text-[#0B6E4F]" />
          <h4 className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wide">
            {dict.xray.unitMathTitle}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-white p-3 rounded-lg border border-[#D1DBD5]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">
              1. Deed Extent (Imperial)
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">48.00 Cents</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              = 0.48 Acre = 20,908.80 sq.ft
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#D1DBD5]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">
              2. Patta Extent (Metric Conversion)
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">0.17.5 Hectares (17.5 Ares)</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              17.5 × 2.471054 = 43.2434 Cents
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#D1DBD5]">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">
              3. Deterministic Shrinkage Delta
            </span>
            <div className="text-sm font-bold text-amber-700 mt-1">
              43.24 - 48.00 = -4.7566 Cents (-9.92%)
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {dict.xray.shrinkageNote}
            </div>
          </div>
        </div>

        {caseData.is_red_zone && (
          <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-xs flex items-start gap-2 text-red-900 font-sans">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {isTa ? 'அபாயகர சிவப்பு மண்டல தடை!' : 'CRITICAL RED-ZONE VIOLATION DETECTED!'}
              </span>
              <p>{isTa ? caseData.red_zone_reason_ta : caseData.red_zone_reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
