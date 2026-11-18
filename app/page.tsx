'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PersonaMode, Language, CaseState } from '@/types/nilamtrace';
import { TopNavBar } from '@/components/TopNavBar';
import { Act1MissedCallPhone } from '@/components/Act1MissedCallPhone';
import { Act2DocumentXRay } from '@/components/Act2DocumentXRay';
import { Act3ActionDrawer } from '@/components/Act3ActionDrawer';
import { InheritanceGuideView } from '@/components/InheritanceGuideView';
import { api, MOCK_CASE_4821 } from '@/lib/apiClient';
import { ChevronRight, Sparkles } from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';
import hiDict from '@/i18n/hi.json';

export default function Home() {
  const [currentPersona, setCurrentPersona] = useState<PersonaMode>('cafe');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('4821');
  const [caseData, setCaseData] = useState<CaseState>(MOCK_CASE_4821);
  const [isQuickDemoRunning, setIsQuickDemoRunning] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<'all' | 'act1' | 'act2' | 'act3'>('all');

  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const refreshCase = useCallback(() => {
    api.getCase(selectedCaseId).then((data) => {
      if (data) setCaseData(data);
    });
  }, [selectedCaseId]);

  // Load case when case ID changes
  useEffect(() => {
    refreshCase();
  }, [refreshCase]);

  // Handle language switch
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ta' : prev === 'ta' ? 'hi' : 'en'));
  };

  // Reset demo state
  const handleReset = () => {
    setIsQuickDemoRunning(false);
    setSelectedCaseId('4821');
    setCaseData({ ...MOCK_CASE_4821, hitl_approved: false });
    setCurrentPersona('cafe');
    setActiveStepTab('all');
  };

  // Run 60-Second Live Case Workflow
  const handleRunQuickDemo = () => {
    setIsQuickDemoRunning(true);
    setSelectedCaseId('4821');
    setCaseData({ ...MOCK_CASE_4821, hitl_approved: false });

    // Step 1: Switch to Farmer Call persona
    setCurrentPersona('farmer');
    setActiveStepTab('act1');

    // Step 2: At 14s switch to Act 2 in JanAI Cafe Desk
    setTimeout(() => {
      setCurrentPersona('cafe');
      setActiveStepTab('act2');
    }, 14000);

    // Step 3: At 30s switch to Act 3 Action Drawer
    setTimeout(() => {
      setActiveStepTab('act3');
    }, 30000);

    // Step 4: At 45s auto-approve HITL stamp & show Inheritance Guide
    setTimeout(() => {
      setCaseData((prev) => ({ ...prev, hitl_approved: true }));
      setCurrentPersona('guide');
      setIsQuickDemoRunning(false);
    }, 45000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7F5]">
      {/* Top Navigation Bar with 3-Persona Pill & Statutory e-Sevai Fee Notice */}
      <TopNavBar
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onSelectLanguage={handleSelectLanguage}
        onRunQuickDemo={handleRunQuickDemo}
        isQuickDemoRunning={isQuickDemoRunning}
        selectedCaseId={selectedCaseId}
        onSelectCase={setSelectedCaseId}
        onReset={handleReset}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Demo Active Notice */}
        {isQuickDemoRunning && (
          <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="font-bold">
                {isTa
                  ? '60 விநாடி நேரலை முன்னோட்டம்: தமிழ் குரல் பதிவு ➔ ஆவண ஊடுகதிர் ➔ மனித சரிபார்ப்பு ➔ வாரிசுப் பாதை ➔ இ-சேவை மனு'
                  : isHi
                  ? '60 सेकंड लाइव केस पूर्वावलोकन: वॉयस इंटेक ➔ दस्तावेज़ एक्स-रे ➔ मानवीय सत्यापन ➔ उत्तराधिकार मार्ग ➔ ई-सेवा आवेदन'
                  : '60s Live Case Walkthrough Active: Tamil Voice Intake ➔ Document X-Ray ➔ Human Verification ➔ Inheritance Path ➔ e-Sevai Dossier'}
              </span>
            </div>
            <span className="font-mono font-bold text-[11px] bg-amber-200 px-2 py-0.5 rounded">
              Auto-Advancing
            </span>
          </div>
        )}

        {/* Persona Mode 1: Farmer View */}
        {currentPersona === 'farmer' && (
          <div className="space-y-6">
            <Act1MissedCallPhone
              language={language}
              caseId={selectedCaseId}
              onReceiptGenerated={() => {}}
            />

            {/* Hint to jump to Act 2 */}
            <div className="bg-white border border-[#D1DBD5] rounded-xl p-4 flex items-center justify-between text-xs shadow-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  {isTa
                    ? 'பாக்கெட் ரசீது #4821 கிடைத்துவிட்டதா?'
                    : isHi
                    ? 'क्या आपको पॉकेट टोकन #4821 मिल गया?'
                    : 'Have you received Pocket Token #4821?'}
                </span>
                <span className="text-slate-600">
                  {isTa
                    ? 'இ-சேவை மையத்திற்குச் சென்று ஆவணங்களை ஸ்கேன் செய்து சரிபார்க்கவும்.'
                    : isHi
                    ? 'जीवंत दस्तावेज़ एक्स-रे और मिसिंग-डॉक ट्रैकर का निरीक्षण करने के लिए जनएआई कैफ़े डेस्क पर स्विच करें।'
                    : 'Switch to JanAI Café Desk to inspect the living paper X-Ray & missing-doc tracker.'}
                </span>
              </div>
              <button
                onClick={() => setCurrentPersona('cafe')}
                className="px-4 py-2 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <span>
                  {isTa
                    ? '2. இ-சேவை மேசைக்கு செல்க'
                    : isHi
                    ? '2. जनएआई डेस्क पर जाएं'
                    : 'Go to JanAI Café Desk'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Persona Mode 2: JanAI Café Desk (The full 3-Act Assisted Mission Control) */}
        {currentPersona === 'cafe' && (
          <div className="space-y-6">
            {/* Act Step Tabs */}
            <div className="flex items-center gap-2 border-b border-[#D1DBD5] pb-3 text-xs font-semibold">
              <span className="text-[#4B5563] uppercase mr-2">
                {isTa ? 'நிலைகள்:' : isHi ? 'चरण:' : 'Workflow Stages:'}
              </span>
              <button
                onClick={() => setActiveStepTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStepTab === 'all'
                    ? 'bg-[#0B6E4F] text-white font-bold'
                    : 'text-slate-600 bg-white border border-[#D1DBD5]'
                }`}
              >
                {isTa ? 'அனைத்து 3 நிலைகளும்' : isHi ? 'सभी 3 चरण' : 'All 3 Acts'}
              </button>
              <button
                onClick={() => setActiveStepTab('act1')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStepTab === 'act1'
                    ? 'bg-[#0B6E4F] text-white font-bold'
                    : 'text-slate-600 bg-white border border-[#D1DBD5]'
                }`}
              >
                Act 1: Voice & Token
              </button>
              <button
                onClick={() => setActiveStepTab('act2')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStepTab === 'act2'
                    ? 'bg-[#0B6E4F] text-white font-bold'
                    : 'text-slate-600 bg-white border border-[#D1DBD5]'
                }`}
              >
                Act 2: Document X-Ray & Verification
              </button>
              <button
                onClick={() => setActiveStepTab('act3')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStepTab === 'act3'
                    ? 'bg-[#0B6E4F] text-white font-bold'
                    : 'text-slate-600 bg-white border border-[#D1DBD5]'
                }`}
              >
                Act 3: Path & Safety Gate
              </button>
            </div>

            {/* Act 1 Component */}
            {(activeStepTab === 'all' || activeStepTab === 'act1') && (
              <Act1MissedCallPhone
                language={language}
                caseId={selectedCaseId}
                onReceiptGenerated={() => {}}
              />
            )}

            {/* Act 2 Component */}
            {(activeStepTab === 'all' || activeStepTab === 'act2') && (
              <Act2DocumentXRay caseData={caseData} language={language} onRefreshCase={refreshCase} />
            )}

            {/* Act 3 Component */}
            {(activeStepTab === 'all' || activeStepTab === 'act3') && (
              <Act3ActionDrawer
                caseData={caseData}
                language={language}
                onApproveSuccess={() => {
                  setCaseData((prev) => ({ ...prev, hitl_approved: true }));
                  refreshCase();
                }}
              />
            )}
          </div>
        )}

        {/* Persona Mode 3: Inheritance Guide & Pilot Tracker */}
        {(currentPersona === 'guide' || (currentPersona as string) === 'bank') && (
          <div className="space-y-6">
            <InheritanceGuideView caseData={caseData} language={language} />

            {/* Underlying Document Evidence */}
            <div className="mt-8">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  {isTa ? 'ஆதார ஊடுகதிர் மற்றும் சரிபார்ப்பு பதிவு' : 'Underlying Document Evidence & Field Verification Log'}
                </h3>
                <p className="text-xs text-slate-600">
                  {isTa
                    ? 'பணியாளரால் சரிபார்க்கப்பட்ட மூல ஆவணங்கள் மற்றும் விடுபட்ட ஆவண கண்காணிப்பு.'
                    : 'Operator-verified source documents with page citations and missing REV-114 status.'}
                </p>
              </div>
              <Act2DocumentXRay caseData={caseData} language={language} onRefreshCase={refreshCase} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D1DBD5] py-4 text-center text-xs text-[#4B5563] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>
            © 2026 NilamTrace • Assisted Inheritance Documentation & Case-Preparation Companion
          </span>
          <span className="font-mono text-[11px] text-[#0B6E4F]">
            Tamil Nadu Revenue Administration · e-Sevai / JanAI Café Model
          </span>
        </div>
      </footer>
    </div>
  );
}
