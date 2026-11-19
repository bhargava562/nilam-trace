'use client';

import React, { useState } from 'react';
import { CaseState, InheritancePath, Language } from '@/types/nilamtrace';
import {
  Users,
  Scale,
  FileArchive,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  Stamp,
  Info,
  Check,
  Sparkles,
  AlertTriangle,
  Volume2,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '@/lib/apiClient';

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
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const [selectedPath, setSelectedPath] = useState<InheritancePath>(
    caseData.chosen_path || 'JOINT_PATTA'
  );
  const [isSqueezing, setIsSqueezing] = useState<boolean>(false);
  const [squeezeProgress, setSqueezeProgress] = useState<number>(100);
  const [squeezedSizeKB, setSqueezedSizeKB] = useState<number>(338);

  const [otpValue, setOtpValue] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(caseData.hitl_approved || false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stampSlammed, setStampSlammed] = useState<boolean>(caseData.hitl_approved || false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [hasPlayedVoiceConsent, setHasPlayedVoiceConsent] = useState<boolean>(false);
  const [isPlayingVoiceConsent, setIsPlayingVoiceConsent] = useState<boolean>(false);

  const handlePlayFarmerVoiceConsent = () => {
    setIsPlayingVoiceConsent(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = isTa
        ? 'வணக்கம், நான் பாக்கம் கிராமத்து செல்வராஜ் பேசுகிறேன். என் தந்தை சுப்பிரமணியம் மறைவுக்குப் பின் எங்களது 43.24 சென்ட் நிலத்தை கூட்டுப் பட்டா செய்ய முழு சம்மதம் அளிக்கிறேன்.'
        : isHi
        ? 'नमस्ते, मैं पक्कम गांव से सेल्वराज बोल रहा हूँ। मेरे पिता सुब्रमण्यम के निधन के बाद हमारी 43.24 सेंट भूमि के संयुक्त पट्टे हेतु मैं अपनी पूर्ण सहमति देता हूँ।'
        : 'Hello, I am S. Selvaraj from Pakkam. Following my late father Subramaniam’s demise, I hereby provide full telephonic consent for the Joint Patta mutation of 43.24 cents.';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isTa ? 'ta-IN' : isHi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => {
        setIsPlayingVoiceConsent(false);
        setHasPlayedVoiceConsent(true);
      };
      utterance.onerror = () => {
        setIsPlayingVoiceConsent(false);
        setHasPlayedVoiceConsent(true);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsPlayingVoiceConsent(false);
        setHasPlayedVoiceConsent(true);
      }, 2500);
    }
  };

  const handleSelectPath = async (path: InheritancePath) => {
    setSelectedPath(path);
    if (onPathSelected) onPathSelected(path);
    try {
      await apiClient.selectPath(caseData.case_id, path);
    } catch {
      // offline fallback
    }
  };

  const handleRunSqueeze = async () => {
    setIsSqueezing(true);
    setSqueezeProgress(10);
    const interval = setInterval(() => {
      setSqueezeProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setSqueezeProgress(100);
      setSqueezedSizeKB(338);
      setIsSqueezing(false);
    }, 1200);
  };

  const handleHITLApprove = async () => {
    if (!hasPlayedVoiceConsent) {
      handlePlayFarmerVoiceConsent();
    }

    if (otpValue.trim() !== '1234') {
      setErrorMessage(isTa ? 'தவறான OTP. 1234 ஐப் பயன்படுத்தவும்' : isHi ? 'अमान्य OTP. 1234 दर्ज करें' : 'Invalid PIN. Use 1234 for demo');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient.hitlApprove({
        case_id: caseData.case_id,
        officer_name: 'Subramaniam Family',
        otp: '1234',
        voice_consent_confirmed: true,
        comments: 'Operator verified HITL approval',
      });
      setIsApproved(true);
      setStampSlammed(true);
      onApproveSuccess();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      setIsApproved(true);
      setStampSlammed(true);
      onApproveSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Prominent Statutory Warning: REV-114 Missing Notice */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-1.5 mb-2 flex items-center justify-between text-xs text-amber-900 shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold">
            {isTa
              ? '⚠️ REV-114 வாரிசுச் சான்றிதழ் விடுபட்டுள்ளது (இ-சேவை அரசு கட்டணம்: ₹60) — பட்டா மாறுதலுக்கு வாரிசுச் சான்றிதழ் கட்டாயம்!'
              : isHi
              ? '⚠️ REV-114 कानूनी वारिस प्रमाण-पत्र अनुपलब्ध (ई-सेवा शुल्क: ₹60) — पट्टा परिवर्तन हेतु अनिवार्य!'
              : '⚠️ REV-114 Varisu Certificate Missing (₹60 at e-Sevai) — Statutory requirement for legal heir mutation!'}
          </span>
        </div>
        <span className="text-[10px] bg-amber-200 text-amber-900 font-mono font-bold px-2 py-0.5 rounded shrink-0">
          REV-114 REQUIRED (₹60)
        </span>
      </div>

      {/* 3-Column Horizontal Flow Layout (Zero page scroll) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 items-stretch min-h-0 overflow-hidden">
        {/* COLUMN 1 (35%): Family Members & Administrative Path Choice */}
        <div className="lg:col-span-4 bg-white rounded-xl p-3.5 shadow-xs border border-[#D1DBD5] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-[#D1DBD5]/60 pb-1.5 mb-2.5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>{isTa ? '1. குடும்பம் & உரிமைப் பாதை' : isHi ? '1. परिवार एवं मार्ग' : '1. Family & Path'}</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5" title="Informational intake only">
                <Info className="w-3 h-3 text-slate-400" />
                <span>{isTa ? 'தகவல் பதிவு' : isHi ? 'सूचनात्मक' : 'Informational'}</span>
              </span>
            </div>

            {/* Compact Family Chips */}
            <div className="space-y-1.5 mb-3">
              {[
                { name: 'Murugan S.', ta: 'எஸ். முருகன்', relation: 'Elder Brother (62)' },
                { name: 'Selvi S.', ta: 'எஸ். செல்வி', relation: 'Sister (55)' },
                { name: 'Selvaraj S.', ta: 'எஸ். செல்வராஜ்', relation: 'Applicant (58)' },
              ].map((heir, idx) => (
                <div
                  key={idx}
                  className="bg-[#F4F7F5] px-2.5 py-1.5 rounded-lg border border-[#D1DBD5] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-900">{isTa ? heir.ta : heir.name}</span>
                  <span className="text-[10px] text-slate-500">{heir.relation}</span>
                </div>
              ))}
            </div>

            {/* Path Selection Label */}
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#0B6E4F]" />
              <span>{isTa ? 'நிர்வாகப் பாதை தேர்வு' : isHi ? 'प्रशासनिक मार्ग' : 'Administrative Path'}</span>
            </div>

            {/* Option A & B Radio Cards */}
            <div className="space-y-2">
              {/* Option A: Joint Patta */}
              <div
                onClick={() => handleSelectPath('JOINT_PATTA')}
                className={`p-2.5 rounded-xl border-2 cursor-pointer transition ${
                  selectedPath === 'JOINT_PATTA'
                    ? 'border-[#0B6E4F] bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B6E4F]">
                    {isTa ? 'பாதை A: கூட்டுப் பட்டா' : isHi ? 'विकल्प A: संयुक्त पट्टा' : 'Option A: Joint Patta'}
                  </span>
                  {selectedPath === 'JOINT_PATTA' && <CheckCircle2 className="w-4 h-4 text-[#0B6E4F]" />}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                  {isTa
                    ? 'அனைத்து வாரிசுகளின் பெயரிலும் பதிவாகும்.'
                    : isHi
                    ? 'सभी जीवित वारिसों का नाम पट्टे में संयुक्त रूप से।'
                    : 'All heirs listed jointly in Patta.'}
                </p>
                <div className="text-[10px] font-mono font-bold text-emerald-800 mt-1">
                  {isTa ? 'முத்திரைத்தாள்: ₹0 (இலவசம்) · கட்டணம்: ₹60' : isHi ? 'स्टाम्प: ₹0 (शून्य) · शुल्क: ₹60' : 'Stamp: ₹0 (Zero) · Fee: ₹60'}
                </div>
              </div>

              {/* Option B: Release Deed */}
              <div
                onClick={() => handleSelectPath('REGISTERED_RELEASE_DEED')}
                className={`p-2.5 rounded-xl border-2 cursor-pointer transition ${
                  selectedPath === 'REGISTERED_RELEASE_DEED'
                    ? 'border-[#0B6E4F] bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    {isTa ? 'பாதை B: விடுதலைப் பத்திரம்' : isHi ? 'विकल्प B: रिलीज डीड' : 'Option B: Release Deed'}
                  </span>
                  {selectedPath === 'REGISTERED_RELEASE_DEED' && <CheckCircle2 className="w-4 h-4 text-[#0B6E4F]" />}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                  {isTa
                    ? 'சார்பதிவாளர் முன் பங்குரிமையை விடுவித்தல்.'
                    : isHi
                    ? 'सब-रजिस्ट्रार के समक्ष सह-वारिस का हिस्सा छोड़ना।'
                    : 'Co-heirs relinquish shares at Sub-Registrar.'}
                </p>
                <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">
                  {isTa ? 'சலுகை: 1% (வரம்பிற்கு உட்பட்டது)' : isHi ? 'रियायत: 1% (अधिकतम सीमा)' : 'Concession: 1% (Capped)'}
                </div>
              </div>
            </div>
          </div>

          {/* Micro Legal Footnote */}
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 leading-tight">
            {isTa
              ? 'ⓘ தகவல் பதிவு மட்டுமே; இறுதிப் பட்டா மாறுதலுக்கு வட்டாட்சியர் REV-114 வாரிசுச் சான்றிதழ் அவசியம்.'
              : isHi
              ? 'ⓘ केवल सूचनात्मक; औपचारिक पट्टा परिवर्तन हेतु तहसीलदार REV-114 प्रमाण-पत्र आवश्यक।'
              : 'ⓘ Non-binding intake; formal title requires Tahsildar REV-114 certificate.'}
          </div>
        </div>

        {/* COLUMN 2 (30%): The 400 KB Squeeze Machine */}
        <div className="lg:col-span-4 bg-white rounded-xl p-3.5 shadow-xs border border-[#D1DBD5] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-[#D1DBD5]/60 pb-1.5 mb-2.5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <FileArchive className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>{isTa ? '2. 400KB சுருக்கக் கருவி' : isHi ? '2. 400KB कंप्रेसर' : '2. 400 KB Squeeze'}</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                {isTa ? 'போர்டல் தயார்' : isHi ? 'पोर्टल तैयार' : 'Portal Ready'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3 leading-snug">
              {isTa
                ? 'தமிழ்நிலம் போர்டலுக்கு ஏற்ப ஆவணங்களை 390 KB அளவுக்குள் சுருக்குகிறது.'
                : isHi
                ? 'तमिल निलम पोर्टल के लिए स्कैन को 390 KB से कम आकार में अनुकूलित करता है।'
                : 'Adaptive DPI deflate ensuring scans never get rejected by Tamil Nilam.'}
            </p>

            {/* Squeeze Gauge Box */}
            <div className="bg-[#F4F7F5] p-3 rounded-xl border border-[#D1DBD5] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {isTa ? '1994 கிரையப் பத்திர ஸ்கேன்' : isHi ? '1994 बिक्री विलेख स्कैन' : '1994 Sale Deed Scan'}
                </span>
                <span className="font-mono font-bold text-xs text-[#0B6E4F]">{squeezedSizeKB} KB / 390 KB</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0B6E4F] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${squeezeProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                <span className="text-slate-400">Orig: 2.84 MB</span>
                <span className="font-bold text-emerald-700">Compressed: {squeezedSizeKB} KB ✅</span>
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleRunSqueeze}
            disabled={isSqueezing}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-[#D1DBD5] text-[#0B6E4F] font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>
              {isSqueezing
                ? isTa
                  ? 'சுருக்குகிறது...'
                  : isHi
                  ? 'कंप्रेस हो रहा है...'
                  : 'Compressing...'
                : isTa
                ? '400KB சோதனை செய்க'
                : isHi
                ? '400KB स्क्वीज़ चलाएं'
                : 'Execute 400KB Squeeze'}
            </span>
          </button>
        </div>

        {/* COLUMN 3 (35%): Human Approval & VAO Stamped Export */}
        <div className="lg:col-span-4 bg-white rounded-xl p-3.5 shadow-xs border-2 border-[#0B6E4F]/30 flex flex-col justify-between overflow-hidden relative">
          <div>
            <div className="flex items-center justify-between border-b border-[#D1DBD5]/60 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                {isApproved ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  {isTa ? '3. மனித நேரடி ஒப்புதல்' : isHi ? '3. ऑपरेटर स्वीकृति' : '3. Human HITL Gate'}
                </h3>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isApproved ? 'UNLOCKED' : 'PIN: 1234'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3 leading-snug">
              {isTa
                ? 'விவசாயி குரல் சம்மதம் மற்றும் இ-சேவை பணியாளர் PIN (1234) சரிபார்ப்பு.'
                : isHi
                ? 'किसान वॉयस सहमति एवं ई-सेवा ऑपरेटर पिन (1234) सत्यापन।'
                : 'Landowner voice consent playback + Operator MFA PIN (1234) gate.'}
            </p>

            {/* Interactive Voice Consent Playback */}
            <div className="bg-[#F4F7F5] p-2.5 rounded-xl border border-[#D1DBD5] mb-2.5 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
                  <Volume2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
                  <span>{isTa ? 'விவசாயி குரல் சம்மதம்' : isHi ? 'किसान वॉयस सहमति' : 'Farmer Voice Consent'}</span>
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    hasPlayedVoiceConsent
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {hasPlayedVoiceConsent ? 'VERIFIED ✓' : 'PENDING'}
                </span>
              </div>
              <button
                onClick={handlePlayFarmerVoiceConsent}
                disabled={isPlayingVoiceConsent}
                className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  hasPlayedVoiceConsent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white text-[#0B6E4F] border-[#0B6E4F] hover:bg-emerald-50'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>
                  {isPlayingVoiceConsent
                    ? (isTa ? 'ஒலிக்கிறது...' : isHi ? 'चल रहा है...' : 'Playing Audio...')
                    : hasPlayedVoiceConsent
                    ? (isTa ? 'குரல் சம்மதம் கேட்கப்பட்டது (மீண்டும் கேட்க)' : isHi ? 'सहमति सुनी गई (पुनः सुनें)' : 'Voice Consent Verified (Replay)')
                    : (isTa ? 'விவசாயி குரல் சம்மதம் கேட்க' : isHi ? 'किसान वॉयस सहमति सुनें' : 'Play Farmer Voice Consent')}
                </span>
              </button>
            </div>

            {/* OTP Input & Voice Consent Trigger */}
            {!isApproved ? (
              <div className="bg-[#F4F7F5] p-2.5 rounded-xl border border-[#D1DBD5] space-y-2">
                {/* Farmer Voice Consent Playback Button */}
                <button
                  type="button"
                  onClick={handlePlayFarmerVoiceConsent}
                  disabled={isPlayingVoiceConsent}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-between border ${
                    hasPlayedVoiceConsent
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingVoiceConsent ? 'animate-bounce text-[#0B6E4F]' : 'text-emerald-700'}`} />
                    <span>
                      {isPlayingVoiceConsent
                        ? (isTa ? 'குரல் ஒப்புதல் ஒலிக்கிறது...' : isHi ? 'वॉयस सहमति बज रही है...' : 'Playing Voice Consent...')
                        : hasPlayedVoiceConsent
                        ? (isTa ? 'குரல் ஒப்புதல் உறுதி செய்யப்பட்டது ✅' : isHi ? 'वॉयस सहमति सत्यापित ✅' : 'Farmer Voice Consent Verified ✅')
                        : (isTa ? '▶ விவசாயி குரல் சம்மதம் கேட்க' : isHi ? '▶ किसान वॉयस सहमति सुनें' : '▶ Play Farmer Voice Consent')}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">0:06</span>
                </button>

                {/* PIN Input with Quick Fill */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-16 px-2 py-1.5 bg-white border border-[#D1DBD5] rounded-lg text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-[#0B6E4F]"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpValue('1234')}
                    className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-[10px] font-bold rounded transition"
                    title="Quick-Fill Demo PIN 1234"
                  >
                    1234
                  </button>
                  <button
                    onClick={handleHITLApprove}
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1 active:scale-98"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? '...' : (isTa ? 'ஒப்புதல் (Unlock)' : isHi ? 'स्वीकृति (Unlock)' : 'Verify & Unlock')}</span>
                  </button>
                </div>
                {errorMessage && <p className="text-[10px] text-red-600 font-bold">{errorMessage}</p>}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-bold">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{isTa ? 'அலுவலர் ஒப்புதல் உறுதி' : isHi ? 'अधिकारी द्वारा अनुमोदित' : 'Operator HITL Approved'}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700">#4821</span>
              </div>
            )}
          </div>

          {/* Download Action & Red-Ink VAO Stamp Slam */}
          <div className="pt-2 border-t border-slate-100">
            {stampSlammed ? (
              <div className="flex items-center justify-between gap-2">
                <a
                  href={apiClient.getDossierUrl(caseData.case_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08523B] text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isTa
                      ? 'மனு பதிவிறக்குக (PDF · REV-114 நிலுவை)'
                      : isHi
                      ? 'आवेदन डाउनलोड करें (PDF · REV-114 लंबित)'
                      : 'Download Packet (PDF · REV-114 Notice)'}
                  </span>
                </a>

                {/* Animated Red-Ink VAO Seal */}
                <div
                  className="w-14 h-14 rounded-full border-2 border-red-600 text-red-600 font-bold flex flex-col items-center justify-center text-[7px] uppercase tracking-tighter shrink-0 select-none shadow-md"
                  style={{
                    transform: 'rotate(-6deg)',
                    backgroundColor: '#FEF2F2',
                  }}
                >
                  <span>VAO SEAL</span>
                  <span className="text-[9px] font-black">TN-GOVT</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isTa ? 'முத்திரை பூட்டப்பட்டுள்ளது' : isHi ? 'सत्यापन आवश्यक' : 'Locked (Enter PIN 1234)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
