'use client';

import React, { useState, useEffect } from 'react';
import { PersonaMode, Language, CaseState } from '@/types/nilamtrace';
import { TopNavBar } from '@/components/TopNavBar';
import { Act1MissedCallPhone } from '@/components/Act1MissedCallPhone';
import { Act2DocumentXRay } from '@/components/Act2DocumentXRay';
import { Act3ActionDrawer } from '@/components/Act3ActionDrawer';
import { BankScorecardView } from '@/components/BankScorecardView';
import { api, MOCK_CASE_4821, MOCK_CASE_9012 } from '@/lib/apiClient';
import { CheckCircle2, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';

export default function Home() {
  const [currentPersona, setCurrentPersona] = useState<PersonaMode>('cafe');
  const [language, setLanguage] = useState<Language>('ta');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('4821');
  const [caseData, setCaseData] = useState<CaseState>(MOCK_CASE_4821);
  const [isQuickDemoRunning, setIsQuickDemoRunning] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<'all' | 'act1' | 'act2' | 'act3'>('all');

  const dict = language === 'ta' ? taDict : enDict;
  const isTa = language === 'ta';

  // Load case when case ID changes
  useEffect(() => {
    let isMounted = true;
    api.getCase(selectedCaseId).then((data) => {
      if (isMounted) setCaseData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedCaseId]);

  // Handle language toggle
  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'ta' ? 'en' : 'ta'));
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

    // Step 2: At 15s switch to Act 2 in JanAI Cafe Desk
    setTimeout(() => {
      setCurrentPersona('cafe');
      setActiveStepTab('act2');
    }, 15000);

    // Step 3: At 32s switch to Act 3 Action Drawer
    setTimeout(() => {
      setActiveStepTab('act3');
    }, 32000);

    // Step 4: At 48s auto-approve HITL stamp & show Bank Scorecard
    setTimeout(() => {
      setCaseData((prev) => ({ ...prev, hitl_approved: true }));
      setCurrentPersona('bank');
      setIsQuickDemoRunning(false);
    }, 48000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7F5]">
      {/* Top Navigation Bar with 3-Persona Pill & Savings Ticker */}
      <TopNavBar
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        language={language}
        onToggleLanguage={handleToggleLanguage}
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
                  ? '60 வினாடி நேரலை முன்னோட்டம் இயங்குகிறது: குரல் பதிவு ➔ ஊடுகதிர் ➔ வாரிசு ஒப்புதல் ➔ VAO முத்திரை ➔ வங்கி அறிக்கை'
                  : '60s Live Case Walkthrough Active: Voice Intake ➔ X-Ray Audit ➔ Family Consent ➔ VAO Stamp ➔ Bank Scorecard'}
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
              onReceiptGenerated={() => {
                // When receipt is generated, offer transition to JanAI Cafe desk
              }}
            />

            {/* Hint to jump to Act 2 */}
            <div className="bg-white border border-[#D1DBD5] rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  {isTa ? 'பாக்கெட் ரசீது #4821 கிடைத்துவிட்டதா?' : 'Have you received Pocket Token #4821?'}
                </span>
                <span className="text-slate-600">
                  {isTa
                    ? 'இ-சேவை மையத்திற்குச் சென்று ஆவண ஊடுகதிர் மற்றும் பட்டா திருத்தத்தை முடிக்கவும்.'
                    : 'Switch to JanAI Café Desk to inspect the living paper X-Ray & title audit.'}
                </span>
              </div>
              <button
                onClick={() => setCurrentPersona('cafe')}
                className="px-4 py-2 bg-[#0B6E4F] hover:bg-[#08523B] text-white font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <span>{isTa ? '2. இ-சேவை மேஜைக்கு செல்க' : 'Go to JanAI Café Desk'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Persona Mode 2: JanAI Café Desk (The full 3-Act Sovereign Mission Control) */}
        {currentPersona === 'cafe' && (
          <div className="space-y-6">
            {/* Act Step Tabs */}
            <div className="flex items-center gap-2 border-b border-[#D1DBD5] pb-3 text-xs font-semibold">
              <span className="text-[#4B5563] uppercase mr-2">{isTa ? 'நிலைகள்:' : 'Workflow Stages:'}</span>
              <button
                onClick={() => setActiveStepTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStepTab === 'all'
                    ? 'bg-[#0B6E4F] text-white font-bold'
                    : 'text-slate-600 bg-white border border-[#D1DBD5]'
                }`}
              >
                {isTa ? 'அனைத்து 3 நிலைகளும்' : 'All 3 Acts'}
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
                Act 2: Document X-Ray
              </button>
              <button
                onClick={() => setActiveStepTab('act3')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStepTab === 'act3'
                    ? 'bg-[#0B6E4F] text-white font-bold'
                    : 'text-slate-600 bg-white border border-[#D1DBD5]'
                }`}
              >
                Act 3: Stamp & Resolution
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
              <Act2DocumentXRay caseData={caseData} language={language} />
            )}

            {/* Act 3 Component */}
            {(activeStepTab === 'all' || activeStepTab === 'act3') && (
              <Act3ActionDrawer
                caseData={caseData}
                language={language}
                onApproveSuccess={() => {
                  setCaseData((prev) => ({ ...prev, hitl_approved: true }));
                }}
              />
            )}
          </div>
        )}

        {/* Persona Mode 3: Bank Officer View */}
        {currentPersona === 'bank' && (
          <div className="space-y-6">
            <BankScorecardView caseData={caseData} language={language} />

            {/* Deep Dive into Evidence Trail (X-Ray preview) */}
            <div className="mt-8">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  {isTa ? 'ஆதார ஊடுகதிர் தணிக்கை' : 'Underlying Title Audit Evidence (Document X-Ray)'}
                </h3>
                <p className="text-xs text-slate-600">
                  {isTa
                    ? 'கடன் அதிகாரிக்கான நேரடி ஆவண ஒப்பீடு மற்றும் நிலக் குறைவு சான்றுகள்.'
                    : 'Direct cross-century comparison between Deed and Patta validating the 21.62 Cents mortgageable title.'}
                </p>
              </div>
              <Act2DocumentXRay caseData={caseData} language={language} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D1DBD5] py-4 text-center text-xs text-[#4B5563] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>
            © 2026 NilamTrace • Department of Survey & Settlement, Government of Tamil Nadu
          </span>
          <span className="font-mono text-[11px] text-[#0B6E4F]">
            Section 9 Cadastral Reconciliation Engine • UDR Resolution Verified
          </span>
        </div>
      </footer>
    </div>
  );
}
