'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '@/types/nilamtrace';
import { Phone, PhoneOff, Mic, Volume2, Sparkles, CheckCircle2, Ticket, QrCode } from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

interface Act1MissedCallPhoneProps {
  language: Language;
  onReceiptGenerated: (code: string) => void;
  caseId: string;
}

export const Act1MissedCallPhone: React.FC<Act1MissedCallPhoneProps> = ({
  language,
  onReceiptGenerated,
  caseId,
}) => {
  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedTranscript, setDisplayedTranscript] = useState<string>('');
  const [agentResponseText, setAgentResponseText] = useState<string>('');
  const [pocketCode, setPocketCode] = useState<string | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Call duration counter
  useEffect(() => {
    if (callStatus === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callStatus]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Web Speech API Voice synthesis helper
  const speakText = (text: string, langCode: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Initiate call flow
  const handleStartCall = () => {
    setCallStatus('calling');
    setDisplayedTranscript('');
    setAgentResponseText('');
    setPocketCode(null);

    // Ringing state -> connect after 1.5s
    setTimeout(() => {
      setCallStatus('connected');

      // Farmer speaks
      const farmerWords = dict.phone.sampleFarmerSpeech;
      setDisplayedTranscript(farmerWords);
      speakText(farmerWords, isTa ? 'ta-IN' : 'en-IN');

      // Agent speaks after farmer finishes (simulated 4.5s)
      setTimeout(() => {
        const agentWords = dict.phone.agentResponse;
        setAgentResponseText(agentWords);
        speakText(agentWords, isTa ? 'ta-IN' : 'en-IN');

        // Call concludes & thermal pocket-receipt is issued
        setTimeout(() => {
          setCallStatus('ended');
          const code = caseId === '9012' ? '#9012' : '#4821';
          setPocketCode(code);
          onReceiptGenerated(code);
        }, 5000);
      }, 5500);
    }, 1500);
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallStatus('ended');
    setIsSpeaking(false);
    const code = caseId === '9012' ? '#9012' : '#4821';
    setPocketCode(code);
    onReceiptGenerated(code);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1DBD5]">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-[#D1DBD5]/60 pb-3">
        <div>
          <span className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {dict.acts.act1Title}
          </span>
          <h2 className="text-lg font-bold text-[#111827] mt-1.5 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#0B6E4F]" />
            <span>{dict.phone.tollFree}</span>
          </h2>
        </div>
        <p className="text-xs text-[#4B5563] max-w-md">
          {dict.acts.act1Desc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Mobile Phone Chassis Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-[300px] sm:w-[320px] bg-slate-900 rounded-[44px] p-4 shadow-2xl border-4 border-slate-700 relative">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Phone Inner Display */}
            <div className="bg-gradient-to-b from-[#052e20] to-[#0d1f18] rounded-[32px] p-5 text-white min-h-[460px] flex flex-col justify-between relative overflow-hidden border border-emerald-900/50">
              {/* Carrier & Time Header */}
              <div className="flex justify-between items-center text-[11px] text-emerald-200 font-mono">
                <span>Jio TN • 5G</span>
                <span>09:30 AM</span>
                <span>84%</span>
              </div>

              {/* Central Dynamic Call Stage */}
              <div className="flex flex-col items-center justify-center my-auto text-center py-4 relative">
                {callStatus === 'idle' && (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center mb-4 text-emerald-300">
                      <Phone className="w-9 h-9" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-wide">1800-NILAM-TR</h3>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      {isTa ? 'தமிழ்நாடு அரசு நில குரல் AI' : 'Tamil Nadu Govt Land Voice AI'}
                    </p>
                    <span className="mt-3 text-[11px] bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-600/40">
                      {dict.phone.statusIdle}
                    </span>
                  </div>
                )}

                {(callStatus === 'calling' || callStatus === 'connected') && (
                  <div className="flex flex-col items-center relative">
                    {/* Concentric Emerald Ring Pulse */}
                    <div className="relative flex items-center justify-center mb-5">
                      <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-ring-2 pointer-events-none" />
                      <div className="absolute w-24 h-24 rounded-full bg-emerald-400/30 animate-ring-1 pointer-events-none" />
                      <div className="w-20 h-20 rounded-full bg-[#0B6E4F] border-2 border-emerald-300 flex items-center justify-center text-white shadow-lg z-10">
                        {isSpeaking ? (
                          <Volume2 className="w-8 h-8 text-emerald-200 animate-pulse" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {callStatus === 'calling' ? dict.phone.statusCalling : dict.phone.statusConnected}
                    </h3>

                    <div className="text-xs text-emerald-300 font-mono mt-1 font-semibold">
                      {formatTime(callDuration)}
                    </div>

                    {isSpeaking && (
                      <div className="flex items-center gap-1 mt-3">
                        <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-5 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1.5 h-6 bg-emerald-200 rounded-full animate-bounce [animation-delay:0.45s]" />
                      </div>
                    )}
                  </div>
                )}

                {callStatus === 'ended' && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-3 text-emerald-300">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{dict.phone.statusEnded}</h3>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      {isTa ? 'SMS ரசீது அனுப்பப்பட்டது' : 'Token dispatched via SMS'}
                    </p>
                    <div className="mt-4 bg-emerald-950/90 border border-emerald-500/50 px-4 py-2 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-400 block uppercase font-mono">Token</span>
                      <span className="text-xl font-mono font-bold text-white tracking-widest">
                        {pocketCode || '#4821'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Controls at bottom of phone */}
              <div className="pt-2">
                {callStatus === 'idle' || callStatus === 'ended' ? (
                  <button
                    onClick={handleStartCall}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    <span>{dict.phone.callButton}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEndCall}
                    className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
                  >
                    <PhoneOff className="w-4 h-4 fill-current" />
                    <span>{dict.phone.endButton}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Voice Audio Transcript & Thermal Pocket-Code Receipt */}
        <div className="lg:col-span-7 space-y-6">
          {/* Transcript Box */}
          <div className="bg-[#F4F7F5] border border-[#D1DBD5] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#D1DBD5] pb-2">
              <span className="text-xs font-bold text-[#0B6E4F] flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                {dict.phone.transcriptLabel}
              </span>
              {callStatus === 'connected' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  Live Web Speech Audio Stream
                </span>
              )}
            </div>

            {displayedTranscript || agentResponseText ? (
              <div className="space-y-4 text-xs leading-relaxed">
                {displayedTranscript && (
                  <div className="bg-white p-3.5 rounded-lg border-l-4 border-amber-500 shadow-xs">
                    <span className="font-bold text-amber-800 block mb-1">
                      {isTa ? '🗣 விவசாயி முருகன் (குரல் பதிவு):' : '🗣 Farmer Murugan (Applicant Voice):'}
                    </span>
                    <p className="text-[#111827] italic font-medium">"{displayedTranscript}"</p>
                  </div>
                )}

                {agentResponseText && (
                  <div className="bg-emerald-50/80 p-3.5 rounded-lg border-l-4 border-[#0B6E4F] shadow-xs">
                    <span className="font-bold text-[#0B6E4F] block mb-1">
                      {isTa ? '🤖 நிலம் AI குரல் பதில்:' : '🤖 NilamTrace Land AI Response:'}
                    </span>
                    <p className="text-[#08523B] font-medium">{agentResponseText}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-[#4B5563]">
                <Volume2 className="w-8 h-8 mx-auto text-[#0B6E4F]/40 mb-2" />
                <p className="text-xs font-medium">
                  {isTa
                    ? '1800-NILAM-TR எண்ணை அழைக்கவும் அல்லது மாதிரி குரல் பொத்தானை அழுத்தவும்.'
                    : 'Click "Call 1800-NILAM-TR" on the phone to experience zero-literacy Tamil voice intake.'}
                </p>
                <button
                  onClick={handleStartCall}
                  className="mt-3 text-xs font-bold text-[#0B6E4F] hover:underline"
                >
                  {dict.phone.playSample} ➔
                </button>
              </div>
            )}
          </div>

          {/* Thermal Pocket-Code Receipt */}
          <div className="thermal-receipt border border-[#D1DBD5] rounded-xl p-5 font-mono text-slate-800 bg-white">
            <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Ticket className="w-5 h-5 text-[#0B6E4F]" />
                <span className="font-bold text-sm tracking-wide text-[#0B6E4F]">
                  GOVERNMENT OF TAMIL NADU • REVENUE PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dict.phone.smsReceiptTitle} • {dict.phone.receiptDate}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Applicant / விவசாயி</span>
                <span className="font-bold text-slate-900">{isTa ? 'முருகன் சண்முகம்' : 'Murugan Shanmugam'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Phone / தொலைபேசி</span>
                <span className="font-bold text-slate-900">+91 98402 71829</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Village / Taluk</span>
                <span className="font-bold text-slate-900">Periyapalayam / Uthukottai</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">District / மாவட்டம்</span>
                <span className="font-bold text-slate-900">Thiruvallur (திருவள்ளூர்)</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                  {dict.phone.receiptCode}
                </span>
                <span className="text-2xl font-bold tracking-widest text-[#0B6E4F]">
                  {pocketCode || '#4821'}
                </span>
              </div>
              <div className="w-14 h-14 bg-white border border-emerald-300 rounded p-1 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-[#0B6E4F]" />
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-tight border-t border-dashed border-slate-300 pt-2 text-center">
              {dict.phone.receiptSmsNotice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
