import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { apiUrl } from '../utils/api';
import {
  Award,
  CheckCircle2,
  Printer,
  Share2,
  Search,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const CertificateView: React.FC = () => {
  const {
    certificates,
    selectedCertificateId,
    language,
    setCurrentView,
  } = useApp();

  const currentCert =
    certificates.find((c) => c.id === selectedCertificateId) ||
    certificates[0] || {
      id: 'cert_default',
      certificateCode: 'PH-2026-CERT-8842',
      studentName: 'Thiri Myint',
      courseTitle: 'Professional English Communication & Academic Writing',
      courseTitleMy: 'လုပ်ငန်းခွင်နှင့် ပညာသင်ဆုများအတွက် အင်္ဂလိပ်စာ အဆင့်မြင့် ရေးသားပြောဆိုခြင်း',
      instructorName: 'Sarah Mitchell, MA',
      completionDate: 'February 14, 2026',
      verificationHash: '8f7a93c4e12d',
      gradeAchieved: 'High Distinction (96%)',
      approvedByAdmin: true,
    };

  const [verifySearchCode, setVerifySearchCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySearchCode.trim()) return;

    setIsSearching(true);
    setVerificationResult(null);

    try {
      const response = await fetch(apiUrl(`/api/certificates/verify/${encodeURIComponent(verifySearchCode.trim())}`));
      const data = await response.json();
      if (response.ok && data.found) {
        setVerificationResult({ found: true, cert: data.certificate });
      } else {
        setVerificationResult({ found: false, message: data.message || 'Certificate not found.' });
      }
    } catch (err) {
      setVerificationResult({
        found: false,
        message: 'Could not connect to verification server. Please retry.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Bar with actions */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => setCurrentView('mylearning')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#14243A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'my' ? 'ကျွန်ုပ်သင်ယူမှုသို့ ပြန်သွားမည်' : 'Back to My Learning'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>{t('cert.download_pdf', language)}</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Card Formatted for Printing / Viewing */}
      <div className="bg-[#FAF8F5] border-8 border-double border-[#14243A] p-6 sm:p-12 rounded-2xl relative shadow-lg text-center overflow-hidden">
        {/* Subtle Decorative Gold Corner Lines */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#C7A66A]" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#C7A66A]" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#C7A66A]" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#C7A66A]" />

        {/* Institution Brand Lockup */}
        <div className="space-y-1 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#14243A] text-[#C7A66A] flex items-center justify-center font-black text-xl mx-auto shadow-sm">
            P
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#14243A] tracking-wider uppercase">
            PYINNYAR HUB
          </h2>
          <p className="text-xs font-semibold tracking-widest text-[#A9874B] uppercase">
            Digital Learning Platform · Learn Without Limits
          </p>
        </div>

        {/* Certificate Title */}
        <div className="space-y-1 my-6">
          <h1 className="text-xl sm:text-3xl font-serif text-[#14243A] font-bold">
            {t('cert.official_header', language)}
          </h1>
          <p className="text-xs text-stone-500 italic">
            Certificate ID: <span className="font-mono font-bold text-stone-800">{currentCert.certificateCode}</span>
          </p>
        </div>

        {/* Recipient Name */}
        <div className="my-6">
          <p className="text-xs text-stone-600 mb-2">
            {t('cert.issued_to', language)}:
          </p>
          <div className="text-2xl sm:text-4xl font-serif font-black text-[#14243A] border-b-2 border-[#C7A66A] pb-2 max-w-md mx-auto">
            {currentCert.studentName}
          </div>
        </div>

        {/* Course Description */}
        <div className="my-6 max-w-xl mx-auto space-y-2">
          <p className="text-xs text-stone-600 leading-relaxed">
            {t('cert.for_course', language)}:
          </p>
          <h3 className="text-base sm:text-xl font-bold text-[#14243A]">
            {currentCert.courseTitle}
          </h3>
          <p className="text-xs font-medium text-[#A9874B]">
            Grade Awarded: {currentCert.gradeAchieved} · Completed on {currentCert.completionDate}
          </p>
        </div>

        {/* Signatures & Seal */}
        <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-center">
          <div>
            <div className="font-serif italic text-base text-stone-800 font-bold border-b border-stone-300 pb-1">
              {currentCert.instructorName}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 uppercase font-semibold">
              Course Lead Instructor
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#C7A66A] flex items-center justify-center text-[#14243A]">
              <ShieldCheck className="w-8 h-8 text-[#C7A66A]" />
            </div>
            <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider">
              Official Digital Seal
            </p>
          </div>

          <div>
            <div className="font-serif italic text-base text-stone-800 font-bold border-b border-stone-300 pb-1">
              Daw Khin Sandar
            </div>
            <p className="text-[10px] text-stone-500 mt-1 uppercase font-semibold">
              Academic Operations Director
            </p>
          </div>
        </div>

        {/* Clear Mandatory Disclaimer */}
        <div className="mt-8 pt-4 border-t border-stone-200/60 text-[10px] text-stone-500 leading-tight">
          {t('cert.disclaimer', language)} Verification Code: <span className="font-mono text-stone-700">{currentCert.verificationHash}</span>
        </div>
      </div>

      {/* Public Certificate Verification Tool */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4 no-print">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C7A66A]" />
          <div>
            <h3 className="font-bold text-base text-[#14243A]">
              {t('cert.verify_btn', language)}
            </h3>
            <p className="text-xs text-stone-500">
              Enter any PYINNYAR HUB certificate ID to authenticate record validity against academic registries.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            type="text"
            value={verifySearchCode}
            onChange={(e) => setVerifySearchCode(e.target.value)}
            placeholder="e.g. PH-2026-CERT-8842"
            className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#C7A66A] focus:outline-none uppercase"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>Verify</span>
          </button>
        </form>

        {verificationResult && (
          <div className={`p-4 rounded-xl border text-xs ${
            verificationResult.found
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {verificationResult.found ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Valid & Authenticated Certificate</span>
                </div>
                <p>Student: <strong>{verificationResult.cert.studentName}</strong></p>
                <p>Program: <strong>{verificationResult.cert.courseTitle}</strong></p>
                <p>Completed: {verificationResult.cert.completionDate} ({verificationResult.cert.gradeAchieved})</p>
                <p className="text-[11px] text-emerald-700">Issued by: {verificationResult.cert.issuer}</p>
              </div>
            ) : (
              <p>{verificationResult.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
