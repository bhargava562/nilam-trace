'use client';

import React from 'react';
import { CaseState, Language } from '@/types/nilamtrace';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Download,
  AlertCircle,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

interface BankScorecardViewProps {
  caseData: CaseState;
  language: Language;
}

export const BankScorecardView: React.FC<BankScorecardViewProps> = ({ caseData, language }) => {
  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  const isRedZone = caseData.is_red_zone;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#D1DBD5] space-y-6">
      {/* Top Bank Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-emerald-800 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5" />
            {dict.bankScorecard.badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {dict.bankScorecard.title}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {dict.bankScorecard.subtitle} • Case #{caseData.case_id}
          </p>
        </div>

        {/* Health Score Pill */}
        <div
          className={`p-4 rounded-xl border text-center min-w-[200px] ${
            isRedZone
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-500">
            {dict.bankScorecard.scoreLabel}
          </span>
          <div className="text-3xl font-extrabold tracking-tight mt-1">
            {isRedZone ? '0 / 100' : dict.bankScorecard.scoreValue}
          </div>
          <span
            className={`text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded ${
              isRedZone ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {isRedZone ? 'CRITICAL RISK • REJECT' : dict.bankScorecard.scoreVerdict}
          </span>
        </div>
      </div>

      {/* Primary Key Figures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
          <span className="text-[10px] text-slate-500 uppercase block font-medium">Applicant</span>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {isTa ? caseData.applicant_name_ta : caseData.applicant_name}
          </div>
          <span className="text-[11px] text-slate-600 mt-0.5 block">{caseData.phone}</span>
        </div>

        <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
          <span className="text-[10px] text-slate-500 uppercase block font-medium">Clear Title Area</span>
          <div className="text-sm font-bold text-emerald-800 mt-1">
            {isRedZone ? '0.00 Cents' : '21.62 Cents (50% Undivided)'}
          </div>
          <span className="text-[11px] text-slate-600 mt-0.5 block">
            Net of lawful canal deduction
          </span>
        </div>

        <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
          <span className="text-[10px] text-slate-500 uppercase block font-medium">Guideline Valuation</span>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {isRedZone ? '₹0' : '₹18,37,700'}
          </div>
          <span className="text-[11px] text-slate-600 mt-0.5 block">
            @ ₹85,000 / Cent (Govt Guideline)
          </span>
        </div>

        <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
          <span className="text-[10px] text-slate-500 uppercase block font-medium">Sanctionable Loan Limit</span>
          <div className="text-sm font-bold text-[#0B6E4F] mt-1">
            {isRedZone ? '₹0' : '₹12,86,390 (70% LTV)'}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
            Eligible for SBI KCC Loan
          </span>
        </div>
      </div>

      {/* Citations & Evidence Trail */}
      <div className="bg-[#FCFDFD] border border-[#D1DBD5] rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-[#0B6E4F]" />
          <span>{dict.bankScorecard.citationsTitle}</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F4F7F5]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-slate-900">
                {dict.bankScorecard.citation1}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                30-Year prior unbroken title deed chain registered at SRO Uthukottai. Zero encumbrance recorded on TN Inspector General of Registration (TNREGINET).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F4F7F5]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-slate-900">
                {dict.bankScorecard.citation2}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Patta #2041 confirmed on Tamil Nilam database. Old Survey 45/2 correlated to New Survey 114/2B under Section 9 Cadastral Reconciliation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F4F7F5]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-slate-900">
                {dict.bankScorecard.citation3}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Legal heir certificate verified with Tamil Nadu e-District QR watermark. Co-heir Selvi verified via telephonic voice consent recorded in NilamTrace audit log.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F4F7F5]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-slate-900">
                {dict.bankScorecard.citation4}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Checked against High Court & Supreme Court red-zone list: Zero waterbody, grazing poramboke, or waqf/temple property overlap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Signature & Bank Download Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50 border border-emerald-300 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg border border-emerald-300 p-1 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-[#0B6E4F]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
              <span>Cryptographically Certified Dossier #4821</span>
            </div>
            <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
              SHA256: 9e4f7a1b...882c • VAO Stamp: TN-4821-APPROVED
            </p>
          </div>
        </div>

        <a
          href={`/api/cases/${caseData.case_id}/dossier.pdf`}
          target="_blank"
          rel="noreferrer"
          download={`NilamTrace_${caseData.case_id}_Bank_Dossier.pdf`}
          className="px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{dict.actionDrawer.downloadDossier}</span>
        </a>
      </div>
    </div>
  );
};
