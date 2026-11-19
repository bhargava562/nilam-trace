'use client';

import React from 'react';
import { Language } from '@/types/nilamtrace';
import {
  ShieldCheck,
  PhoneCall,
  FileSearch,
  CheckCheck,
  Sparkles,
  Languages,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

export type ActiveStep = 1 | 2 | 3;

interface TopNavBarProps {
  activeStep: ActiveStep;
  onSelectStep: (step: ActiveStep) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onRunQuickDemo: () => void;
  isQuickDemoRunning: boolean;
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onReset: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeStep,
  onSelectStep,
  language,
  onSelectLanguage,
  onRunQuickDemo,
  isQuickDemoRunning,
  selectedCaseId,
  onSelectCase,
  onReset,
}) => {
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  return (
    <header className="h-14 sticky top-0 z-50 bg-[#0B6E4F] text-white border-b border-[#08523B] shadow-sm select-none">
      <div className="h-full max-w-full px-3 sm:px-4 flex items-center justify-between gap-2">
        {/* LEFT: Brand + Compact Case Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <svg viewBox="0 0 100 100" className="w-5 h-5 fill-emerald-100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5 L65 30 L60 30 L70 50 L63 50 L75 75 L25 75 L37 50 L30 50 L40 30 L35 30 Z" />
                <rect x="42" y="75" width="16" height="20" rx="1" />
                <circle cx="50" cy="45" r="4" fill="#0B6E4F" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm tracking-tight text-white">
                  {isTa ? 'நிலம்தடம்' : isHi ? 'नीलमट्रेस' : 'NilamTrace'}
                </span>
                <span className="text-emerald-300 text-xs font-light">|</span>
                <span className="text-xs font-semibold text-emerald-100 hidden sm:inline">
                  {isTa ? 'NilamTrace' : isHi ? 'NilamTrace' : 'நிலம்தடம்'}
                </span>
                <span className="hidden xl:inline-flex text-[10px] font-semibold bg-emerald-700/80 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-500/40">
                  v2
                </span>
              </div>
            </div>
          </div>

          {/* Compact Case Switcher Pill */}
          <div className="flex items-center bg-[#074733] p-0.5 rounded-lg border border-emerald-500/30 text-[11px]">
            <button
              onClick={() => onSelectCase('4821')}
              className={`px-2 py-0.5 rounded font-mono font-medium transition ${
                selectedCaseId === '4821'
                  ? 'bg-emerald-500 text-white font-bold shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Case #4821: Subramaniam Heir Transfer"
            >
              #4821
            </button>
            <button
              onClick={() => onSelectCase('9012')}
              className={`px-2 py-0.5 rounded font-mono font-medium transition ${
                selectedCaseId === '9012'
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Case #9012: Poramboke Restriction"
            >
              #9012
            </button>
          </div>
        </div>

        {/* CENTER: Unified 3-Step Stepper (Replaces duplicate sub-bars!) */}
        <nav aria-label="Workflow Stepper" className="flex items-center bg-[#08523B] p-0.5 rounded-xl border border-emerald-500/40 shadow-inner">
          <button
            onClick={() => onSelectStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeStep === 1
                ? 'bg-white text-[#0B6E4F] shadow-sm font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isTa ? '1. விவசாயி குரல்' : isHi ? '1. किसान आवाज़' : '1. Farmer Call'}</span>
          </button>

          <span className="text-emerald-500/60 text-xs px-0.5">➔</span>

          <button
            onClick={() => onSelectStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeStep === 2
                ? 'bg-white text-[#0B6E4F] shadow-sm font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>{isTa ? '2. ஆவண ஊடுகதிர்' : isHi ? '2. दस्तावेज़ एक्स-रे' : '2. Document X-Ray'}</span>
          </button>

          <span className="text-emerald-500/60 text-xs px-0.5">➔</span>

          <button
            onClick={() => onSelectStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeStep === 3
                ? 'bg-white text-[#0B6E4F] shadow-sm font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{isTa ? '3. சரிபார்ப்பு & மனு' : isHi ? '3. सत्यापन एवं निर्यात' : '3. Verify & Export'}</span>
          </button>
        </nav>

        {/* RIGHT: Quick Demo + 3-Language Segmented Switch + Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Demo Runner */}
          <button
            onClick={onRunQuickDemo}
            disabled={isQuickDemoRunning}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#111827] text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
            title="Automate 60s live walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            <span className="hidden md:inline">
              {isQuickDemoRunning
                ? isTa
                  ? 'இயங்குகிறது...'
                  : isHi
                  ? 'चल रहा है...'
                  : 'Running...'
                : isTa
                ? '▶ நேரலை டெமோ'
                : isHi
                ? '▶ 60s लाइव केस'
                : '▶ 60s Demo'}
            </span>
          </button>

          {/* 3-Language Segmented Switch: [English, Tamil, Hindi] */}
          <div
            className="flex items-center bg-[#074733] p-0.5 rounded-lg border border-emerald-500/40"
            role="group"
            aria-label="Language"
          >
            <Languages className="w-3 h-3 text-emerald-300 ml-1 mr-0.5 hidden sm:inline" />
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                language === 'en'
                  ? 'bg-white text-[#0B6E4F] font-bold shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="English (Default)"
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('ta')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                language === 'ta'
                  ? 'bg-white text-[#0B6E4F] font-bold shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="தமிழ்"
            >
              தமிழ்
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                language === 'hi'
                  ? 'bg-white text-[#0B6E4F] font-bold shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="हिन्दी"
            >
              हिन्दी
            </button>
          </div>

          {/* Reset Demo */}
          <button
            onClick={onReset}
            className="p-1 rounded-lg bg-[#074733] hover:bg-[#053828] text-emerald-200 hover:text-white border border-emerald-500/30 transition"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
