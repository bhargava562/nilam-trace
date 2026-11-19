'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '@/types/nilamtrace';
import { Phone, PhoneOff, Mic, Volume2, Sparkles, CheckCircle2, Ticket, QrCode, ArrowRight } from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';
import hiDict from '@/i18n/hi.json';

interface Act1MissedCallPhoneProps {
  language: Language;
  onReceiptGenerated: (code: string) => void;
  caseId: string;
  onGoToAct2?: () => void;
}

export const Act1MissedCallPhone: React.FC<Act1MissedCallPhoneProps> = ({
  language,
  onReceiptGenerated,
  caseId,
  onGoToAct2,
}) => {
  const dict = language === 'ta' ? taDict : language === 'hi' ? hiDict : enDict;
  const isTa = language === 'ta';
  const isHi = language === 'hi';

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

    // Ringing state -> connect after 1.2s
    setTimeout(() => {
      setCallStatus('connected');

      // Farmer speaks
      const farmerWords = dict.phone.sampleFarmerSpeech;
      setDisplayedTranscript(farmerWords);
      speakText(farmerWords, isTa ? 'ta-IN' : isHi ? 'hi-IN' : 'en-IN');

      // Agent speaks after farmer finishes
      setTimeout(() => {
        const agentWords = dict.phone.agentResponse;
        setAgentResponseText(agentWords);
        speakText(agentWords, isTa ? 'ta-IN' : isHi ? 'hi-IN' : 'en-IN');

        // Call concludes & thermal pocket-receipt is issued
        setTimeout(() => {
          setCallStatus('ended');
          const code = `#${caseId}`;
          setPocketCode(code);
          onReceiptGenerated(code);
        }, 4500);
      }, 4500);
    }, 1200);
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallStatus('ended');
    setIsSpeaking(false);
    const code = `#${caseId}`;
    setPocketCode(code);
    onReceiptGenerated(code);
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* 2-Column Side-by-Side Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full items-center">
        {/* LEFT PANE (40% width): Compact Phone Simulator (max-h-[480px]) */}
        <div className="lg:col-span-5 flex justify-center items-center h-full">
          <div className="w-[280px] sm:w-[290px] h-[460px] bg-slate-900 rounded-[38px] p-3 shadow-xl border-4 border-slate-700 flex flex-col justify-between relative shrink-0">
            {/* Phone Speaker & Notch */}
            <div className="w-24 h-3.5 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <div className="w-6 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Inner Phone Screen */}
            <div className="bg-gradient-to-b from-[#052e20] to-[#0d1f18] rounded-[28px] p-3.5 text-white flex-1 flex flex-col justify-between border border-emerald-900/50 overflow-hidden">
              {/* Carrier Header */}
              <div className="flex justify-between items-center text-[10px] text-emerald-200 font-mono shrink-0">
                <span>Jio 5G</span>
                <span>09:30 AM</span>
                <span>84%</span>
              </div>

              {/* Central Display */}
              <div className="my-auto flex flex-col items-center justify-center text-center">
                {callStatus === 'idle' && (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center mb-2.5 text-emerald-300">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">1800-NILAM-TR</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      {isTa ? 'தமிழ்நாடு அரசு நில குரல் AI' : isHi ? 'तमिलनाडु सरकार भूमि वॉयस एआई' : 'Tamil Nadu Govt Land Voice AI'}
                    </p>
                    <span className="mt-2 text-[10px] bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                      {dict.phone.statusIdle}
                    </span>
                  </div>
                )}

                {(callStatus === 'calling' || callStatus === 'connected') && (
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-3">
                      <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                      <div className="w-16 h-16 rounded-full bg-[#0B6E4F] border-2 border-emerald-300 flex items-center justify-center text-white shadow-lg z-10">
                        {isSpeaking ? (
                          <Volume2 className="w-6 h-6 text-emerald-200 animate-pulse" />
                        ) : (
                          <Mic className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-white">
                      {callStatus === 'calling' ? dict.phone.statusCalling : dict.phone.statusConnected}
                    </h3>
                    <div className="text-[11px] text-emerald-300 font-mono mt-0.5 font-bold">
                      {formatTime(callDuration)}
                    </div>

                    {isSpeaking && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="w-1 h-4 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1 h-5 bg-emerald-200 rounded-full animate-bounce [animation-delay:0.45s]" />
                      </div>
                    )}
                  </div>
                )}

                {callStatus === 'ended' && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-2 text-emerald-300">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xs font-bold text-white">{dict.phone.statusEnded}</h3>
                    <p className="text-[10px] text-emerald-300/80 mt-0.5">
                      {isTa ? 'SMS ரசீது அனுப்பப்பட்டது' : isHi ? 'एसएमएस टोकन रसीद भेजी गई' : 'Token dispatched via SMS'}
                    </p>
                    <div className="mt-2.5 bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-center">
                      <span className="text-[9px] text-emerald-400 block uppercase font-mono">
                        {isTa ? 'பாக்கெட் டோக்கன்' : isHi ? 'पॉकेट टोकन' : 'Pocket Token'}
                      </span>
                      <span className="text-lg font-mono font-bold text-white tracking-widest">
                        {pocketCode || `#${caseId}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Action Button */}
              <div className="shrink-0 pt-2">
                {callStatus === 'idle' || callStatus === 'ended' ? (
                  <button
                    onClick={handleStartCall}
                    className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>{dict.phone.callButton}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEndCall}
                    className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
                  >
                    <PhoneOff className="w-3.5 h-3.5 fill-current" />
                    <span>{dict.phone.endButton}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE (60% width): Speech Bubble + Thermal Pocket Receipt + 1-Click CTA */}
        <div className="lg:col-span-7 flex flex-col justify-between h-[460px] space-y-3">
          {/* Top Half: Clean Speech Bubble (Max 2 short lines) */}
          <div className="bg-white border border-[#D1DBD5] rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#D1DBD5]/60 pb-1.5">
              <span className="text-xs font-bold text-[#0B6E4F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {dict.phone.transcriptLabel}
              </span>
              {callStatus === 'connected' && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Audio
                </span>
              )}
            </div>

            <div className="my-auto py-2">
              {displayedTranscript || agentResponseText ? (
                <div className="space-y-2 text-xs">
                  {displayedTranscript && (
                    <div className="bg-amber-50/80 p-2.5 rounded-lg border-l-3 border-amber-500">
                      <span className="text-[10px] font-bold text-amber-800 block">
                        {isTa ? '🗣 விவசாயி எஸ். செல்வராஜ்:' : isHi ? '🗣 किसान एस. सेल्वराज:' : '🗣 Farmer S. Selvaraj:'}
                      </span>
                      <p className="text-slate-800 line-clamp-2 italic font-medium">"{displayedTranscript}"</p>
                    </div>
                  )}
                  {agentResponseText && (
                    <div className="bg-emerald-50/80 p-2.5 rounded-lg border-l-3 border-[#0B6E4F]">
                      <span className="text-[10px] font-bold text-[#0B6E4F] block">
                        {isTa ? '🤖 நிலம் AI:' : isHi ? '🤖 नीलमट्रेस AI:' : '🤖 NilamTrace AI:'}
                      </span>
                      <p className="text-[#08523B] line-clamp-2 font-medium">{agentResponseText}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-[#4B5563]">
                  <Volume2 className="w-6 h-6 mx-auto text-[#0B6E4F]/40 mb-1" />
                  <p className="text-xs font-medium">
                    {isTa
                      ? 'தொலைபேசி அழைப்பைத் தொடங்கி 4 இலக்க குறியீடு பெறவும்.'
                      : isHi
                      ? 'कॉल शुरू करें और 4-अंकीय पॉकेट कोड प्राप्त करें।'
                      : 'Start the call to experience zero-literacy Tamil voice intake.'}
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 border-t border-[#D1DBD5]/40 pt-1.5 flex justify-between">
              <span>{isTa ? 'கட்டணமில்லா எண்: 1800-NILAM-TR' : isHi ? 'टोल-फ्री हेल्पलाइन: 1800-NILAM-TR' : 'Toll-Free Helpline: 1800-NILAM-TR'}</span>
              <button onClick={handleStartCall} className="text-[#0B6E4F] font-bold hover:underline">
                {dict.phone.playSample} ➔
              </button>
            </div>
          </div>

          {/* Bottom Half: Compact Pocket Code Receipt Slip + Primary CTA Button */}
          <div className="bg-white border border-[#D1DBD5] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#0B6E4F]" />
                <span className="font-bold text-xs text-[#0B6E4F]">
                  {isTa
                    ? 'தமிழ்நாடு அரசு · வருவாய்த்துறை ரசீது'
                    : isHi
                    ? 'तमिलनाडु सरकार · राजस्व रसीद'
                    : 'GOVT OF TAMIL NADU · REVENUE RECEIPT'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">18-Nov-2026</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">
                  {isTa ? 'விண்ணப்பதாரர்' : isHi ? 'आवेदक' : 'Applicant'}
                </span>
                <span className="font-bold text-slate-900">
                  {isTa ? 'எஸ். செல்வராஜ்' : isHi ? 'एस. सेल्वराज' : 'S. Selvaraj'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">
                  {isTa ? 'கிராமம் · மாவட்டம்' : isHi ? 'गांव · जिला' : 'Village · Dist'}
                </span>
                <span className="font-bold text-slate-900">
                  {isTa ? 'பாக்கம் · திருவள்ளூர்' : isHi ? 'पक्कम · तिरुवल्लूर' : 'Pakkam · Thiruvallur'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">
                  {isTa ? 'பாக்கெட் குறியீடு' : isHi ? 'पॉकेट टोकन' : 'Pocket Token'}
                </span>
                <span className="font-mono font-bold text-emerald-700 text-xs">
                  {pocketCode || `#${caseId}`}
                </span>
              </div>
            </div>

            {/* 1-Click Primary CTA Button to Step 2 */}
            <button
              onClick={onGoToAct2}
              className="w-full py-2.5 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
            >
              <span>
                {isTa
                  ? `இ-சேவை மேசையில் திறக்கவும் (#${caseId}) ➔`
                  : isHi
                  ? `जनएआई डेस्क पर केस #${caseId} खोलें ➔`
                  : `Open Case #${caseId} in Café Desk ➔`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
