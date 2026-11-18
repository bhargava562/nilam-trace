'use client';

import React, { useState } from 'react';
import { CaseState, Language, FamilyShare } from '@/types/nilamtrace';
import {
  Users,
  FileArchive,
  Lock,
  Unlock,
  Stamp,
  Download,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

interface Act3ActionDrawerProps {
  caseData: CaseState;
  language: Language;
  onApproveSuccess: () => void;
}

export const Act3ActionDrawer: React.FC<Act3ActionDrawerProps> = ({
  caseData,
  language,
  onApproveSuccess,
}) => {
  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  // State 1: Family Consent Gate
  const [selviConsent, setSelviConsent] = useState<boolean>(true);
  const [playingConsentAudio, setPlayingConsentAudio] = useState<boolean>(false);

  // State 2: Squeeze Machine
  const [isSqueezing, setIsSqueezing] = useState<boolean>(false);
  const [squeezeProgress, setSqueezeProgress] = useState<number>(100);
  const [squeezedSizeKB, setSqueezedSizeKB] = useState<number>(338);

  // State 3: HITL Padlock & Stamp Slam
  const [otpValue, setOtpValue] = useState<string>('1234');
  const [isApproved, setIsApproved] = useState<boolean>(caseData.hitl_approved);
  const [stampSlammed, setStampSlammed] = useState<boolean>(caseData.hitl_approved);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger Squeeze Machine test
  const handleRunSqueeze = () => {
    setIsSqueezing(true);
    setSqueezeProgress(10);
    setSqueezedSizeKB(2840);

    const interval = setInterval(() => {
      setSqueezeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSqueezing(false);
          setSqueezedSizeKB(338);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // Play audio for Selvi's telephone consent
  const handlePlaySelviConsent = () => {
    setPlayingConsentAudio(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = dict.actionDrawer.consentAudioTranscript;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isTa ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingConsentAudio(false);
      utterance.onerror = () => setPlayingConsentAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingConsentAudio(false), 3000);
    }
  };

  // Slam VAO Red-Ink Stamp with spring physics & confetti
  const handleSlamStamp = () => {
    if (otpValue.trim() !== '1234') {
      setErrorMessage(isTa ? 'தவறான OTP! மாதிரி குறியீடு: 1234' : 'Invalid OTP code! Demo code is 1234');
      return;
    }
    setErrorMessage(null);
    setIsApproved(true);
    setStampSlammed(true);

    // Trigger canvas confetti celebration
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#0B6E4F', '#15803D', '#DC2626', '#F59E0B'],
      });
    } catch {
      // ignore
    }

    onApproveSuccess();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1DBD5] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D1DBD5]/60 pb-3">
        <div>
          <span className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {dict.acts.act3Title}
          </span>
          <h2 className="text-lg font-bold text-[#111827] mt-1.5 flex items-center gap-2">
            <Stamp className="w-5 h-5 text-[#0B6E4F]" />
            <span>{isTa ? 'செயல் திட்ட மேடை' : 'Resolution Action Drawer & Sovereign Gate'}</span>
          </h2>
        </div>
        <p className="text-xs text-[#4B5563] max-w-md">
          {dict.acts.act3Desc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Speakerphone Family Tree Gate */}
        <div className="bg-[#F4F7F5] rounded-xl p-5 border border-[#D1DBD5] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#0B6E4F]" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#0B6E4F]">
                {dict.actionDrawer.familyTitle}
              </h3>
            </div>
            <p className="text-[11px] text-[#4B5563] mb-4">
              {dict.actionDrawer.familyDesc}
            </p>

            <div className="space-y-3">
              {/* Murugan (Applicant) */}
              <div className="bg-white p-3 rounded-lg border border-[#D1DBD5] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {dict.actionDrawer.heirMurugan}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    50% SHARE
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Legal Heir Ref: W/2024/0912/01
                </span>
              </div>

              {/* Selvi (Co-parcener sister) */}
              <div
                className={`p-3 rounded-lg border text-xs transition ${
                  selviConsent
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-white border-[#D1DBD5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {dict.actionDrawer.heirSelvi}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    50% SHARE
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <button
                    onClick={handlePlaySelviConsent}
                    disabled={playingConsentAudio}
                    className="text-[11px] font-semibold text-[#0B6E4F] bg-white border border-emerald-300 px-2.5 py-1 rounded-md hover:bg-emerald-50 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{playingConsentAudio ? (isTa ? 'ஒலிக்கிறது...' : 'Playing...') : dict.actionDrawer.recordConsent}</span>
                  </button>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {dict.actionDrawer.consentGranted}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D1DBD5] text-[11px] text-slate-600 italic">
            "{dict.actionDrawer.consentAudioTranscript}"
          </div>
        </div>

        {/* Step 2: TN e-District <400 KB Squeeze Machine */}
        <div className="bg-[#F4F7F5] rounded-xl p-5 border border-[#D1DBD5] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileArchive className="w-4 h-4 text-[#0B6E4F]" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#0B6E4F]">
                {dict.actionDrawer.squeezeTitle}
              </h3>
            </div>
            <p className="text-[11px] text-[#4B5563] mb-4">
              {dict.actionDrawer.squeezeDesc}
            </p>

            {/* Live Compression Metrics */}
            <div className="space-y-3 text-xs font-mono">
              <div className="bg-white p-3 rounded-lg border border-[#D1DBD5]">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Input Bundle (300 DPI Raw)</span>
                  <span className="text-red-700 font-bold">2.84 MB (2,840 KB)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (squeezedSizeKB / 2840) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-emerald-900 font-bold">Squeezed Output (Pass 2)</span>
                  <span className="text-sm font-bold text-[#0B6E4F]">
                    {squeezedSizeKB} KB
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 block font-sans font-bold">
                  ✓ {dict.actionDrawer.squeezeStatus}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  120 DPI • Lossless Stream Deflate • 0 Text Artifacts
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D1DBD5]">
            <button
              onClick={handleRunSqueeze}
              disabled={isSqueezing}
              className="w-full py-2 px-3 text-xs font-bold bg-white hover:bg-emerald-50 text-[#0B6E4F] border border-[#0B6E4F] rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSqueezing ? (isTa ? 'அமுக்கப்படுகிறது...' : 'Squeezing...') : dict.actionDrawer.squeezeAction}</span>
            </button>
          </div>
        </div>

        {/* Step 3: Sovereign VAO Stamp Gate (Padlocked HITL Gate) */}
        <div className="bg-[#F4F7F5] rounded-xl p-5 border border-[#D1DBD5] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-red-700">
                  {dict.actionDrawer.hitlTitle}
                </h3>
              </div>
              {isApproved ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className="text-[11px] text-[#4B5563] mb-4">
              {dict.actionDrawer.hitlDesc}
            </p>

            {/* Stamp Stage Area */}
            <div className="bg-white rounded-xl p-4 border border-[#D1DBD5] min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
              {stampSlammed ? (
                /* Authentic Red-Ink Circular Stamp */
                <div className="stamp-slam-effect border-4 border-red-700 rounded-full w-36 h-36 flex flex-col items-center justify-center text-center p-2 text-red-700 shadow-md select-none bg-red-50/40">
                  <div className="text-[9px] font-bold uppercase tracking-widest border-b border-red-400 pb-0.5">
                    Govt of Tamil Nadu
                  </div>
                  <div className="text-xs font-extrabold my-0.5 uppercase tracking-wider">
                    ★ VAO MUTATION ★
                  </div>
                  <div className="text-[8px] font-mono font-bold leading-tight">
                    UTHUKOTTAI TALUK<br />
                    TN-4821-APPROVED
                  </div>
                  <div className="text-[7px] text-red-600 font-mono mt-0.5">
                    18-NOV-2026 • SEAL
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 block">
                    HITL Gate Locked
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {dict.actionDrawer.hitlPrompt}
                  </span>
                </div>
              )}
            </div>

            {/* OTP Input & Submission */}
            {!stampSlammed && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder={dict.actionDrawer.hitlPlaceholder}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-center border border-[#D1DBD5] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                  <button
                    onClick={handleSlamStamp}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-xs whitespace-nowrap active:scale-98"
                  >
                    {dict.actionDrawer.hitlSubmit}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-[11px] text-red-600 font-bold text-center">
                    {errorMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Download Action Links */}
          {isApproved && (
            <div className="mt-4 pt-3 border-t border-[#D1DBD5] space-y-2">
              <a
                href={`/api/cases/${caseData.case_id}/dossier.pdf`}
                target="_blank"
                rel="noreferrer"
                download={`NilamTrace_${caseData.case_id}_Bank_Dossier.pdf`}
                className="w-full py-2 px-3 text-xs font-bold bg-[#0B6E4F] hover:bg-[#08523B] text-white rounded-lg transition shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{dict.actionDrawer.downloadDossier}</span>
              </a>
              <a
                href={`/api/cases/${caseData.case_id}/dossier.pdf`}
                target="_blank"
                rel="noreferrer"
                download={`NilamTrace_${caseData.case_id}_VAO_Petition.pdf`}
                className="w-full py-1.5 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-[#D1DBD5] rounded-lg transition flex items-center justify-center gap-1.5 text-center"
              >
                <Download className="w-3 h-3 text-[#0B6E4F]" />
                <span>{dict.actionDrawer.downloadVaoPetition}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
