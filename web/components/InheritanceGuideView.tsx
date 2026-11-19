'use client';

import React from 'react';
import { CaseState, Language } from '@/types/nilamtrace';
import {
  Scale,
  Clock,
  Coins,
  ShieldCheck,
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Building,
} from 'lucide-react';
import enDict from '@/i18n/en.json';
import taDict from '@/i18n/ta.json';
import hiDict from '@/i18n/hi.json';

interface InheritanceGuideViewProps {
  caseData: CaseState;
  language: Language;
}

export const InheritanceGuideView: React.FC<InheritanceGuideViewProps> = ({ caseData, language }) => {
  const dict = language === 'ta' ? taDict : language === 'hi' ? hiDict : enDict;
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  return (
    <div className="space-y-6">
      {/* Top Banner: Pilot Cost & Ground Truth Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-[#D1DBD5] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D1DBD5]/60 pb-4">
          <div>
            <span className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {isTa
                ? 'முன்னோடி ஆய்வு & கட்டண விவரம்'
                : isHi
                ? 'पायलट सर्वेक्षण एवं वैधानिक सरकारी शुल्क'
                : 'Field Pilot & Official Statutory Fee Tracker'}
            </span>
            <h2 className="text-lg font-bold text-[#111827] mt-1.5 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#0B6E4F]" />
              <span>
                {isTa
                  ? 'உண்மையான அரசு கட்டணங்கள் & நேர சேமிப்பு'
                  : isHi
                  ? 'पारदर्शी सरकारी शुल्क एवं पायलट सर्वेक्षण'
                  : 'Transparent Government Fees & Pilot Survey'}
              </span>
            </h2>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {isTa
                ? 'பொய்யான தரகர் சேமிப்பு கோரிக்கைகள் இன்றி, உண்மையான அரசு கட்டணங்கள் மற்றும் இ-சேவை நேர விரயத்தை அளவிடுகிறது.'
                : isHi
                ? 'बिना किसी असत्यापित दलाल के दावे के, आधिकारिक ई-सेवा शुल्क एवं मापे गए समय की बचत को ट्रैक करता है।'
                : 'Zero unverified broker claims. Tracks official statutory e-Sevai fees and measured operator turnaround time.'}
            </p>
          </div>

          <div className="bg-[#F4F7F5] px-4 py-2 rounded-xl border border-[#D1DBD5] text-right font-mono">
            <span className="text-[10px] text-[#4B5563] block uppercase tracking-wider">
              {isTa ? 'அரசு சேவை கட்டணம்' : isHi ? 'ई-सेवा सरकारी शुल्क' : 'Statutory e-Sevai Fee'}
            </span>
            <span className="text-base font-bold text-[#0B6E4F]">₹60.00 / Service</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
            <span className="text-xs text-[#4B5563] block font-medium">
              {isTa ? 'REV-114 வாரிசு மனு கட்டணம்' : isHi ? 'REV-114 कानूनी वारिस शुल्क' : 'REV-114 Legal Heir Fee'}
            </span>
            <span className="text-xl font-bold font-mono text-[#111827] mt-1 block">₹60.00</span>
            <span className="text-[11px] text-[#0B6E4F] font-semibold mt-0.5 block">
              {isTa ? 'இ-சேவை அரசு கட்டணம்' : isHi ? 'नियत ई-सेवा सेवा प्रभार' : 'Fixed e-Sevai Service Charge'}
            </span>
          </div>

          <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
            <span className="text-xs text-[#4B5563] block font-medium">
              {isTa ? 'கூட்டுப் பட்டா முத்திரைத்தாள்' : isHi ? 'संयुक्त पट्टा स्टांप ड्यूटी' : 'Joint Patta Stamp Duty'}
            </span>
            <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">₹0 (Zero)</span>
            <span className="text-[11px] text-[#4B5563] mt-0.5 block">
              {isTa ? 'முத்திரைக் கட்டணம் இல்லை' : isHi ? 'परिवार के लिए स्टांप शुल्क छूट' : 'Statutory Exemption for Family'}
            </span>
          </div>

          <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
            <span className="text-xs text-[#4B5563] block font-medium">
              {isTa ? 'இ-சேவை பணியாளர் நேரம்' : isHi ? 'ऑपरेटर समय व्यय' : 'Operator Time Spent'}
            </span>
            <span className="text-xl font-bold font-mono text-[#111827] mt-1 block">12 Minutes</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
              {isTa ? '45 நிமிடத்தில் இருந்து குறைப்பு' : isHi ? '45 मिनट से घटकर 12 मिनट' : 'Down from ~45m manual triage'}
            </span>
          </div>

          <div className="bg-[#F4F7F5] p-4 rounded-xl border border-[#D1DBD5]">
            <span className="text-xs text-[#4B5563] block font-medium">
              {isTa ? 'குடும்ப கட்டண விருப்பம்' : isHi ? 'सहायता प्राप्त कैफ़े भुगतान इच्छा' : 'Assisted Café Willingness-To-Pay'}
            </span>
            <span className="text-xl font-bold font-mono text-[#0B6E4F] mt-1 block">₹200 - ₹300</span>
            <span className="text-[11px] text-[#4B5563] mt-0.5 block">
              {isTa ? 'முழு ஆவண உதவிக்கு' : isHi ? 'पायलट सर्वेक्षण बेंचमार्क' : 'Pilot Survey Benchmark Range'}
            </span>
          </div>
        </div>
      </div>

      {/* The Strict Tamil Nadu Administrative Ladder */}
      <div className="bg-white rounded-2xl p-6 border border-[#D1DBD5] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#0B6E4F]" />
          <span>
            {isTa
              ? 'தமிழ்நாடு வாரிசு உரிமை நிர்வாகப் படிகள் (Administrative Ladder)'
              : isHi
              ? 'तमिलनाडु उत्तराधिकार प्रशासनिक सोपान (Administrative Ladder)'
              : 'The Tamil Nadu Inheritance Administrative Ladder'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B6E4F]">Step 1</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">
              {isTa ? 'இறப்புச் சான்றிதழ்' : isHi ? 'मृत्यु प्रमाण पत्र' : 'Death Certificate'}
            </h4>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              {isTa
                ? 'நகராட்சி அல்லது பேரூராட்சி பிறப்பு இறப்பு பதிவாளரிடம் இருந்து பெறுதல்.'
                : isHi
                ? 'जन्म और मृत्यु रजिस्ट्रार (नगर पालिका/पंचायत) द्वारा जारी।'
                : 'Issued by Registrar of Births & Deaths (Municipality/Panchayat).'}
            </p>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block">
              {isTa ? 'கைவசம் உள்ளது ✅' : isHi ? 'केस 4821 में उपलब्ध ✅' : 'Available in Case 4821 ✅'}
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-red-300 bg-red-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700">Step 2 (Prerequisite)</span>
              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                MISSING ❌
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#111827]">
              {isTa ? 'வட்டாட்சியர் வாரிசுச் சான்றிதழ் (REV-114)' : isHi ? 'तहसीलदार कानूनी वारिस (REV-114)' : 'Tahsildar Legal Heir (REV-114)'}
            </h4>
            <p className="text-[11px] text-red-800 leading-relaxed">
              {isTa
                ? 'இ-சேவை மையத்தில் ₹60 செலுத்தி விண்ணப்பிக்க வேண்டும். இது இல்லாமல் பட்டா மாறுதல் செய்ய முடியாது.'
                : isHi
                ? 'अनिवार्य पूर्व-आवश्यकता! ₹60 शुल्क देकर ई-सेवा में आवेदन करें। इसके बिना पट्टा स्थानांतरण अवरुद्ध है।'
                : 'Mandatory prerequisite! Apply at e-Sevai with ₹60 fee. Patta transfer is blocked without it.'}
            </p>
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded inline-block">
              {isTa ? 'படி 1 வழிகாட்டி தயார்' : isHi ? 'चरण 1 गाइड तैयार' : 'Step 1 Guide Generated'}
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-gray-200 bg-[#F4F7F5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B5563]">Step 3</span>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">
              {isTa ? 'உரிமைப் பாதை தேர்வு' : isHi ? 'मार्ग चयन (संयुक्त बनाम रिलीज)' : 'Path Choice (Joint vs Release)'}
            </h4>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              {isTa
                ? 'கூட்டுப் பட்டா (கட்டணம் இல்லை) அல்லது சார்பதிவாளர் விடுதலைப் பத்திரம் (1% சலுகைக் கட்டணம்).'
                : isHi
                ? 'विकल्प A: संयुक्त पट्टा (कोई स्टांप शुल्क नहीं) बनाम विकल्प B: पंजीकृत रिलीज डीड (1% रियायती पारिवारिक शुल्क)।'
                : 'Option A: Joint Patta (No stamp duty) vs Option B: Registered Release Deed (1% family duty).'}
            </p>
            <span className="text-[10px] font-mono text-[#0B6E4F]">
              {isTa ? 'குடும்ப விருப்பம்' : isHi ? 'परिवार तय करता है' : 'Family Decides'}
            </span>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl border border-gray-200 bg-[#F4F7F5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B5563]">Step 4</span>
              <Building className="w-4 h-4 text-gray-400" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">
              {isTa ? 'தமிழ்நிலம் பட்டா மாறுதல்' : isHi ? 'तमिल निलम पट्टा स्थानांतरण' : 'Tamil Nilam Patta Maruthal'}
            </h4>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              {isTa
                ? 'சரிபார்க்கப்பட்ட <400 KB ஆவணக் கட்டை இ-சேவை மூலம் வட்டாட்சியருக்கு சமர்ப்பித்தல்.'
                : isHi
                ? 'ई-सेवा के माध्यम से तालुक तहसीलदार / ग्राम प्रशासनिक अधिकारी (VAO) को सत्यापित <400 KB दस्तावेज़ बंडल जमा करें।'
                : 'Submit verified <400 KB scan bundle via e-Sevai to the Taluk Tahsildar / VAO.'}
            </p>
            <span className="text-[10px] font-mono text-[#0B6E4F]">
              {isTa ? 'இறுதி இலக்கு' : isHi ? 'अंतिम ई-सेवा दाखिला' : 'Final e-Sevai Filing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export as BankScorecardView for backward compatibility
export const BankScorecardView = InheritanceGuideView;
