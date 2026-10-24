import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    openPaymentModal,
    pendingPaymentCourseId,
    courses,
    enrollInCourse,
    language,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'kpay' | 'wave' | 'ayapay' | 'bank_transfer'>('kpay');
  const [transactionRef, setTransactionRef] = useState('');
  const [slipFileUploaded, setSlipFileUploaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isPaymentModalOpen || !pendingPaymentCourseId) return null;

  const course = courses.find((c) => c.id === pendingPaymentCourseId);
  if (!course) return null;

  const accounts = {
    kpay: { name: 'PYINNYAR HUB Academic Services', number: '09798441234', title: 'KBZPay' },
    wave: { name: 'PYINNYAR HUB Services', number: '09798441234', title: 'WavePay' },
    ayapay: { name: 'PYINNYAR HUB Education', number: '09798441234', title: 'AYA Pay' },
    bank_transfer: { name: 'PYINNYAR HUB Co., Ltd.', number: '0123-4567-8901-2345 (KBZ Bank)', title: 'Bank Transfer' },
  };

  const currentAcc = accounts[paymentMethod];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollInCourse(course.id, paymentMethod, transactionRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#A9874B] uppercase">
              Secure Course Access
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#14243A]">
              {t('pay.title', language)}
            </h2>
          </div>
          <button
            onClick={() => openPaymentModal(null)}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Course Summary */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={course.thumbnail}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-14 h-11 rounded-lg object-cover shrink-0"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-[#14243A] block truncate">
                {language === 'my' && course.titleMy ? course.titleMy : course.title}
              </span>
              <span className="text-[11px] text-stone-500">
                {course.duration} · {course.level}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-base font-extrabold text-[#14243A] tabular-nums block">
              {course.priceMMK.toLocaleString()} MMK
            </span>
            <span className="text-[11px] text-stone-400">(${course.priceUSD} USD)</span>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700">
            Select Preferred Payment Method:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'kpay' as const, label: 'KBZPay' },
              { id: 'wave' as const, label: 'WavePay' },
              { id: 'ayapay' as const, label: 'AYA Pay' },
              { id: 'bank_transfer' as const, label: 'Bank Transfer' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === method.id
                    ? 'border-[#14243A] bg-[#F5F0E6] font-bold text-[#14243A] ring-1 ring-[#14243A]'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Instructions Box */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between text-stone-600">
            <span>Account Title:</span>
            <span className="font-semibold text-stone-900">{currentAcc.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600">Phone / Account:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-[#14243A]">
              <span>{currentAcc.number}</span>
              <button
                type="button"
                onClick={() => handleCopy(currentAcc.number)}
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Copy Number"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {t('pay.slip_label', language)}
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. 202602150048123 (or simulated reference ID)"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Upload Screenshot Slip (Simulated)
            </label>
            <div
              onClick={() => setSlipFileUploaded(true)}
              className="border-2 border-dashed border-stone-300 rounded-xl p-3 text-center cursor-pointer hover:border-[#C7A66A] transition-colors"
            >
              {slipFileUploaded ? (
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Slip Attached: transfer_receipt_feb2026.jpg</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-stone-500">
                  <Upload className="w-4 h-4 text-stone-400" />
                  <span>Tap to attach payment slip image</span>
                </div>
              )}
            </div>
          </div>

          {/* Compliance note */}
          <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500 leading-tight">
            <strong>System Disclosure:</strong> Live direct merchant API gateways for KBZPay/WavePay will be configured on production host with commercial merchant credentials. In this demo, access unlocks immediately upon submission.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => openPaymentModal(null)}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] font-bold shadow-xs transition-transform active:scale-95"
            >
              {t('pay.confirm_btn', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
