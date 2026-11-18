'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Language, CaseState } from '@/types/nilamtrace';
import { TopNavBar, ActiveStep } from '@/components/TopNavBar';
import { Act1MissedCallPhone } from '@/components/Act1MissedCallPhone';
import { Act2DocumentXRay } from '@/components/Act2DocumentXRay';
import { Act3ActionDrawer } from '@/components/Act3ActionDrawer';
import { api, MOCK_CASE_4821 } from '@/lib/apiClient';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [activeStep, setActiveStep] = useState<ActiveStep>(1);
  const [language, setLanguage] = useState<Language>('en');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('4821');
  const [caseData, setCaseData] = useState<CaseState>(MOCK_CASE_4821);
  const [isQuickDemoRunning, setIsQuickDemoRunning] = useState<boolean>(false);

  const isTa = language === 'ta';
  const isHi = language === 'hi';

  const refreshCase = useCallback(() => {
    api.getCase(selectedCaseId).then((data) => {
      if (data) setCaseData(data);
    });
  }, [selectedCaseId]);

  useEffect(() => {
    refreshCase();
  }, [refreshCase]);

  const handleReset = () => {
    setIsQuickDemoRunning(false);
    setSelectedCaseId('4821');
    setCaseData({ ...MOCK_CASE_4821, hitl_approved: false });
    setActiveStep(1);
  };

  // Run 60-Second Live Case Workflow
  const handleRunQuickDemo = () => {
    setIsQuickDemoRunning(true);
    setSelectedCaseId('4821');
    setCaseData({ ...MOCK_CASE_4821, hitl_approved: false });
    setActiveStep(1);

    // Step 1 to Step 2 transition
    setTimeout(() => {
      setActiveStep(2);
    }, 3500);

    // Step 2 to Step 3 transition
    setTimeout(() => {
      setActiveStep(3);
      setIsQuickDemoRunning(false);
    }, 7000);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F4F7F5] overflow-hidden select-none">
      {/* 1. COMPACT 56px HEADER (Single unified navigation bar) */}
      <TopNavBar
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        language={language}
        onSelectLanguage={setLanguage}
        onRunQuickDemo={handleRunQuickDemo}
        isQuickDemoRunning={isQuickDemoRunning}
        selectedCaseId={selectedCaseId}
        onSelectCase={(id) => {
          setSelectedCaseId(id);
          refreshCase();
        }}
        onReset={handleReset}
      />

      {/* 2. STRICT 100vh WORKSPACE (Zero outer page scrolling) */}
      <main className="flex-1 h-[calc(100vh-56px)] overflow-hidden p-3 sm:p-4 max-w-7xl w-full mx-auto flex flex-col justify-between">
        {/* Quick Demo Active Notice (Slim floating toast) */}
        {isQuickDemoRunning && (
          <div className="mb-2 bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between shrink-0 shadow-xs animate-pulse">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {isTa
                  ? 'நேரலை டெமோ இயங்குகிறது: படி 1 ➔ படி 2 ➔ படி 3'
                  : isHi
                  ? 'लाइव डेमो सक्रिय: चरण 1 ➔ चरण 2 ➔ चरण 3'
                  : 'Live Walkthrough: Act 1 (Call) ➔ Act 2 (X-Ray) ➔ Act 3 (Export)'}
              </span>
            </div>
            <span className="font-mono text-[10px] bg-amber-200 px-2 py-0.5 rounded font-bold">
              Auto-Advancing
            </span>
          </div>
        )}

        {/* Dynamic Step Viewports */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeStep === 1 && (
            <Act1MissedCallPhone
              language={language}
              caseId={selectedCaseId}
              onReceiptGenerated={() => {}}
              onGoToAct2={() => setActiveStep(2)}
            />
          )}

          {activeStep === 2 && (
            <Act2DocumentXRay
              caseData={caseData}
              language={language}
              onRefreshCase={refreshCase}
              onGoToAct3={() => setActiveStep(3)}
            />
          )}

          {activeStep === 3 && (
            <Act3ActionDrawer
              caseData={caseData}
              language={language}
              onApproveSuccess={refreshCase}
            />
          )}
        </div>
      </main>
    </div>
  );
}
