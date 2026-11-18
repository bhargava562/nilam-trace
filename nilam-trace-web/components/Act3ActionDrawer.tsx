'use client';

import React, { useState } from 'react';
import { CaseState, Language, InheritancePath } from '@/types/nilamtrace';
import { apiClient } from '@/lib/apiClient';
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
  ShieldAlert,
  AlertTriangle,
  Scale,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

interface Act3ActionDrawerProps {
  caseData: CaseState;
  language: Language;
  onApproveSuccess: () => void;
  onPathSelected?: (path: InheritancePath) => void;
}

export const Act3ActionDrawer: React.FC<Act3ActionDrawerProps> = ({
  caseData,
  language,
  onApproveSuccess,
  onPathSelected,
}) => {
  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  // State 1: Inheritance Path Choice
  const [selectedPath, setSelectedPath] = useState<InheritancePath>(
    caseData.chosen_path || 'JOINT_PATTA'
  );

  // State 2: 400 KB Squeeze Machine
  const [isSqueezing, setIsSqueezing] = useState<boolean>(false);
  const [squeezeProgress, setSqueezeProgress] = useState<number>(100);
  const [squeezedSizeKB, setSqueezedSizeKB] = useState<number>(338);

  // State 3: HITL Padlock & Stamp Slam
  const [otpValue, setOtpValue] = useState<string>('1234');
  const [isApproved, setIsApproved] = useState<boolean>(caseData.hitl_approved);
  const [stampSlammed, setStampSlammed] = useState<boolean>(caseData.hitl_approved);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle path selection
  const handleSelectPath = async (path: InheritancePath) => {
    setSelectedPath(path);
    try {
      await apiClient.selectPath(caseData.case_id, path);
      if (onPathSelected) onPathSelected(path);
    } catch (e) {
      console.error('Error selecting path:', e);
    }
  };

  // Run 400 KB Squeeze Machine simulation
  const handleRunSqueeze = () => {
    setIsSqueezing(true);
    setSqueezeProgress(15);
    setSqueezedSizeKB(2840);

    const interval = setInterval(() => {
      setSqueezeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSqueezing(false);
          setSqueezedSizeKB(338);
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  // Human-In-The-Loop Approval with Spring Physics & Confetti
  const handleHITLApprove = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.hitlApprove({
        case_id: caseData.case_id,
        officer_name: 'JanAI Operator / VAO Desk',
        otp: otpValue,
        voice_consent_confirmed: true,
      });

      if (res.success) {
        setIsApproved(true);
        setStampSlammed(true);

        // Confetti burst
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0B6E4F', '#D97706', '#15803D'],
          });
        }
        onApproveSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid MFA OTP. Please enter 1234.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRev114Available = caseData.rev114_available;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1DBD5] space-y-6">
      {/* Header */}
      <div className="border-b border-[#D1DBD5]/60 pb-4">
        <span className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          {dict.acts.act3Title}
        </span>
        <h2 className="text-lg font-bold text-[#111827] mt-1.5 flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#0B6E4F]" />
          <span>{isTa ? 'வாரிசு உரிமைப் பாதை தேர்வு & பாதுகாப்பு வாயில்' : 'Inheritance Path Selection & Hard Safety Gate'}</span>
        </h2>
        <p className="text-xs text-[#4B5563] mt-0.5">{dict.acts.act3Desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Voluntary Family Info + Administrative Path Choice */}
        <div className="space-y-6">
          {/* Section 1: Voluntary Family Structure Log */}
          <div className="bg-[#F4F7F5] rounded-xl p-4 border border-[#D1DBD5] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0B6E4F]" />
                <span>{dict.actionDrawer.familyTitle}</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                {isTa ? 'தகவல் பதிவு மட்டுமே' : 'Informational Log'}
              </span>
            </div>

            <p className="text-xs text-[#4B5563]">{dict.actionDrawer.familyDesc}</p>

            {/* Heir Cards */}
            <div className="space-y-2">
              {caseData.heir_statements?.map((heir, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-lg border border-[#D1DBD5] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#111827]">
                      {isTa ? heir.heir_name_ta || heir.heir_name : heir.heir_name}
                    </span>
                    <span className="text-[#4B5563] ml-2 font-medium">
                      ({isTa ? heir.relation_ta || heir.relation : heir.relation})
                    </span>
                    {heir.age && <span className="text-gray-400 text-[10px] ml-1">· Age {heir.age}</span>}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {isTa ? 'வாக்குமூலம்' : 'Self-Reported'}
                  </span>
                </div>
              ))}
            </div>

            {/* Mandatory Non-Binding Legal Disclaimer Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-[10px] text-red-700 leading-normal">
              <strong>{isTa ? 'சட்ட அறிவிப்பு:' : 'STATUTORY DISCLAIMER:'}</strong>{' '}
              {dict.actionDrawer.disclaimerText}
            </div>
          </div>

          {/* Section 2: Administrative Path Choice (Joint Patta vs Release Deed) */}
          <div className="bg-white rounded-xl p-4 border border-[#D1DBD5] space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#0B6E4F]" />
              <span>{dict.actionDrawer.pathTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Joint Patta */}
              <div
                onClick={() => handleSelectPath('JOINT_PATTA')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                  selectedPath === 'JOINT_PATTA'
                    ? 'border-[#0B6E4F] bg-emerald-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B6E4F]">Option A</span>
                  {selectedPath === 'JOINT_PATTA' && (
                    <CheckCircle2 className="w-4 h-4 text-[#0B6E4F]" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-[#111827] mt-1">
                  {isTa ? 'கூட்டுப் பட்டா' : 'Joint Patta'}
                </h4>
                <p className="text-[11px] text-[#4B5563] mt-1 leading-snug">
                  {dict.actionDrawer.pathJointDesc}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] font-mono text-[#0B6E4F]">
                  Stamp Duty: <strong>₹0 (Zero)</strong> · e-Sevai: ₹60
                </div>
              </div>

              {/* Option B: Registered Release Deed */}
              <div
                onClick={() => handleSelectPath('REGISTERED_RELEASE_DEED')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                  selectedPath === 'REGISTERED_RELEASE_DEED'
                    ? 'border-[#0B6E4F] bg-emerald-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B6E4F]">Option B</span>
                  {selectedPath === 'REGISTERED_RELEASE_DEED' && (
                    <CheckCircle2 className="w-4 h-4 text-[#0B6E4F]" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-[#111827] mt-1">
                  {isTa ? 'விடுதலைப் பத்திரம்' : 'Release Deed'}
                </h4>
                <p className="text-[11px] text-[#4B5563] mt-1 leading-snug">
                  {dict.actionDrawer.pathReleaseDesc}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] font-mono text-[#0B6E4F]">
                  Concessional Duty: <strong>1% (Capped)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 400 KB Squeeze Machine + Hard HITL Gate */}
        <div className="space-y-6">
          {/* Section 3: 400 KB Squeeze Machine */}
          <div className="bg-[#F4F7F5] rounded-xl p-4 border border-[#D1DBD5] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <FileArchive className="w-4 h-4 text-[#0B6E4F]" />
                <span>{dict.actionDrawer.squeezeTitle}</span>
              </h3>
              <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-[#D1DBD5]">
                Ceiling: &lt; 400 KB
              </span>
            </div>

            <p className="text-xs text-[#4B5563]">{dict.actionDrawer.squeezeDesc}</p>

            <div className="bg-white p-3.5 rounded-lg border border-[#D1DBD5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111827]">
                  {isTa ? '1994 மூலப் பத்திரம் (1420/1994)' : '1994 Sale Deed Scan (24 Pages)'}
                </span>
                <span className="font-mono font-bold text-xs text-[#0B6E4F]">
                  {squeezedSizeKB} KB / 390 KB Limit
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0B6E4F] h-full transition-all duration-300"
                  style={{ width: `${squeezeProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#4B5563] pt-1">
                <span>
                  {isTa ? 'தொடக்க அளவு: 2.84 MB' : 'Original Scan: 2.84 MB'}
                </span>
                <span className="text-emerald-700 font-bold">
                  {isTa ? 'உகப்பாக்கப்பட்டது: 338 KB (ஏற்புடையது ✅)' : 'Optimized: 338 KB (Compliant ✅)'}
                </span>
              </div>
            </div>

            <button
              onClick={handleRunSqueeze}
              disabled={isSqueezing}
              className="w-full py-2 bg-white hover:bg-gray-50 border border-[#D1DBD5] rounded-lg text-xs font-bold text-[#0B6E4F] transition flex items-center justify-center gap-1.5"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>{isSqueezing ? (isTa ? 'சுருக்குகிறது...' : 'Compressing Scan...') : (isTa ? '400KB சோதனை செய்க' : 'Execute 400KB Squeeze')}</span>
            </button>
          </div>

          {/* Section 4: Mandatory HITL Approval Gate & Stamp Slam */}
          <div className="bg-white rounded-xl p-5 border-2 border-[#0B6E4F]/30 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isApproved ? (
                  <Unlock className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-600" />
                )}
                <h3 className="text-sm font-bold text-[#111827]">
                  {dict.actionDrawer.hitlTitle}
                </h3>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isApproved ? 'UNLOCKED / VERIFIED' : 'HARD SAFETY LOCK'}
              </span>
            </div>

            <p className="text-xs text-[#4B5563]">{dict.actionDrawer.hitlDesc}</p>

            {/* Missing REV-114 Notice: Explains Prerequisite status */}
            {!isRev114Available && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {isTa
                    ? 'வாரிசுச் சான்றிதழ் (REV-114) இல்லாததால், படி 1 க்கான விண்ணப்ப வழிகாட்டி மட்டுமே பதிவிறக்க முடியும்.'
                    : 'REV-114 Legal Heir Certificate is pending. You can generate the Step 1 Prerequisite Packet to apply at e-Sevai.'}
                </span>
              </div>
            )}

            {/* OTP Form */}
            {!isApproved ? (
              <div className="bg-[#F4F7F5] p-3.5 rounded-xl border border-[#D1DBD5] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                  <span>{isTa ? 'அலுவலர் OTP குறியீடு (டெமோ: 1234)' : 'Operator OTP Pin (Demo: 1234)'}</span>
                  <span className="font-mono text-emerald-700">MFA Protected</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-[#D1DBD5] rounded-lg text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-[#0B6E4F]"
                  />
                  <button
                    onClick={handleHITLApprove}
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting
                        ? (isTa ? 'சரிபார்க்கிறது...' : 'Verifying...')
                        : (isTa ? 'குரல் உறுதி + OTP 1234' : 'Voice Consent + Verify OTP')}
                    </span>
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-[11px] font-bold text-red-600">{errorMessage}</p>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isTa ? 'அலுவலர் ஒப்புதல் பெறப்பட்டது' : 'Officer HITL Approved'}</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700">TN-REV-4821-STAMP</span>
              </div>
            )}

            {/* Red-Ink VAO Stamp Slam Simulation (Framer/CSS Spring Animation) */}
            {stampSlammed && (
              <div className="relative border border-emerald-200 bg-white rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#111827]">
                    {isRev114Available
                      ? dict.actionDrawer.downloadDossier
                      : dict.actionDrawer.downloadPrerequisite}
                  </h4>
                  <p className="text-[11px] text-[#4B5563] mt-0.5">
                    {isTa
                      ? 'அதிகாரப்பூர்வ QR முத்திரையுடன் தயார் செய்யப்பட்ட ஆவணம்'
                      : 'Generated via ReportLab with embedded provenance QR code'}
                  </p>
                </div>

                <a
                  href={apiClient.getDossierUrl(caseData.case_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08523B] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isTa ? 'பதிவிறக்குக' : 'Download PDF'}</span>
                </a>

                {/* Animated Visual Seal */}
                <div
                  className="w-16 h-16 rounded-full border-2 border-red-600 text-red-600 font-bold flex flex-col items-center justify-center text-[8px] uppercase tracking-tighter shrink-0 select-none shadow-md"
                  style={{
                    transform: 'rotate(-6deg)',
                    backgroundColor: '#FEF2F2',
                  }}
                >
                  <span>VAO SEAL</span>
                  <span className="text-[10px] font-black">TN-GOVT</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
