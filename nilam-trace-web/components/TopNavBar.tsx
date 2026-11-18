'use client';

import React from 'react';
import { PersonaMode, Language } from '@/types/nilamtrace';
import { ShieldCheck, PhoneCall, Monitor, Scale, Sparkles, Languages, RotateCcw } from 'lucide-react';

interface TopNavBarProps {
  currentPersona: PersonaMode;
  onSelectPersona: (persona: PersonaMode) => void;
  language: Language;
  onToggleLanguage: () => void;
  onRunQuickDemo: () => void;
  isQuickDemoRunning: boolean;
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onReset: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentPersona,
  onSelectPersona,
  language,
  onToggleLanguage,
  onRunQuickDemo,
  isQuickDemoRunning,
  selectedCaseId,
  onSelectCase,
  onReset,
}) => {
  const isTa = language === 'ta';

  return (
    <header className="sticky top-0 z-50 bg-[#0B6E4F] text-white shadow-md border-b border-[#08523B]">
      {/* Top micro banner: Statutory e-Sevai Fee Banner & Case Switcher */}
      <div className="bg-[#08523B] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-[#0B6E4F]/40 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-100">
            {isTa
              ? 'தமிழ்நாடு அரசு வருவாய்த் துறை • இ-சேவை மையம் / JanAI Café'
              : 'Govt of Tamil Nadu • Dept of Revenue Administration • JanAI Café Console'}
          </span>
        </div>

        {/* Official Statutory Fee & Pilot Benchmarks */}
        <div className="flex items-center gap-3 bg-[#053828] px-3 py-0.5 rounded-full border border-emerald-400/30 text-[11px]">
          <span className="text-emerald-300 font-semibold uppercase tracking-wider">
            {isTa ? 'அரசு சேவைக் கட்டணம்:' : 'Statutory e-Sevai Fee:'}
          </span>
          <span className="text-emerald-200 font-mono font-bold">₹60.00 (REV-114 / Patta)</span>
          <span className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
            {isTa ? 'நேர சேமிப்பு: 45நிமி ➔ 12நிமி' : 'Turnaround: 45m ➔ 12m'}
          </span>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-emerald-200">{isTa ? 'வழக்கு:' : 'Active Case:'}</span>
          <button
            onClick={() => onSelectCase('4821')}
            className={`px-2 py-0.5 rounded transition ${
              selectedCaseId === '4821'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-emerald-200 hover:bg-[#0B6E4F]'
            }`}
          >
            #4821 (Inheritance)
          </button>
          <button
            onClick={() => onSelectCase('9012')}
            className={`px-2 py-0.5 rounded transition ${
              selectedCaseId === '9012'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-emerald-200 hover:bg-[#0B6E4F]'
            }`}
          >
            #9012 (Poramboke Alert)
          </button>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Tamil Nadu Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 p-1 flex items-center justify-center border border-white/20 shadow-inner">
            <svg
              viewBox="0 0 100 100"
              className="w-8 h-8 fill-emerald-100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50 5 L65 30 L60 30 L70 50 L63 50 L75 75 L25 75 L37 50 L30 50 L40 30 L35 30 Z" />
              <rect x="42" y="75" width="16" height="20" rx="1" />
              <circle cx="50" cy="45" r="4" fill="#0B6E4F" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>நிலம்தடம்</span>
                <span className="text-emerald-300 font-light">|</span>
                <span className="font-semibold text-emerald-100">NilamTrace</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-md border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                v2 Assisted Inheritance
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 font-medium hidden sm:block">
              {isTa
                ? 'கிராமப்புற வாரிசு நில ஆவண வழிகாட்டி மற்றும் விண்ணப்பத் தயாரிப்புத் தளம்'
                : 'Assisted Inheritance Documentation & Case-Preparation Companion'}
            </p>
          </div>
        </div>

        {/* 3-Persona Morph Pill */}
        <nav aria-label="Persona Selector" className="bg-[#08523B] p-1 rounded-xl flex items-center border border-emerald-500/30 shadow-inner">
          <button
            onClick={() => onSelectPersona('farmer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentPersona === 'farmer'
                ? 'bg-white text-[#0B6E4F] shadow-md scale-102 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
            title="Act 1: Zero-Literacy Voice Intake"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isTa ? '1. விவசாயி குரல்' : '1. Farmer Call'}</span>
          </button>

          <button
            onClick={() => onSelectPersona('cafe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentPersona === 'cafe'
                ? 'bg-white text-[#0B6E4F] shadow-md scale-102 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
            title="Act 2 & 3: JanAI Café Desk / Document X-Ray"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isTa ? '2. இ-சேவை மேசை' : '2. JanAI Café Desk'}</span>
          </button>

          <button
            onClick={() => onSelectPersona('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentPersona === 'guide'
                ? 'bg-white text-[#0B6E4F] shadow-md scale-102 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
            title="Inheritance Path Guide & Official Pilot Tracker"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isTa ? '3. வாரிசுப் பாதை & கட்டணம்' : '3. Inheritance Guide'}</span>
          </button>
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Runner Button */}
          <button
            onClick={onRunQuickDemo}
            disabled={isQuickDemoRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#111827] text-xs font-bold shadow-md transition transform active:scale-95 disabled:opacity-50"
            title="Automate the complete 60s walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            <span>{isQuickDemoRunning ? (isTa ? 'இயங்குகிறது...' : 'Running 60s...') : (isTa ? '▶ நேரலை டெமோ' : '▶ Run 60s Live Case')}</span>
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#08523B] hover:bg-[#053828] text-white text-xs font-bold border border-emerald-500/40 transition shadow-inner"
            title="Switch Language / மொழியை மாற்றுக"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isTa ? 'English' : 'தமிழ்'}</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-[#08523B] hover:bg-[#053828] text-emerald-200 hover:text-white border border-emerald-500/40 transition"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
