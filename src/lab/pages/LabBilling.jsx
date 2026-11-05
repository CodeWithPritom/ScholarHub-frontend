import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { 
  Coins, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  AlertCircle, 
  CalendarClock, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Send,
  Zap,
  Lock,
  Unlock,
  FileText,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { openPaddleCheckout } from '../../utils/paddle';

export default function LabBilling() {
  const { quota, currentLab, userRole, refreshCurrentLab } = useLab();
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const percentUsed = quota.allocated > 0
    ? Math.min(100, Math.round((quota.consumed / quota.allocated) * 100))
    : 0;

  const sub = currentLab?.subscription || {};
  const planName = sub.plan || 'Institutional Enterprise';
  const priceUsd = sub.price_usd !== undefined ? sub.price_usd : (currentLab?.price_usd !== undefined ? currentLab.price_usd : 499);
  const billingCycle = sub.billing_cycle || 'annual';
  const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
  const daysRemaining = sub.days_remaining !== undefined ? sub.days_remaining : 365;
  const isExpired = sub.is_expired || currentLab?.is_locked || (currentLab?.is_active === false);

  const adminSupportEmail = 'arupbhowmikpritom@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminSupportEmail);
    setCopiedEmail(true);
    toast.success('Admin email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getWhatsAppUrl = () => {
    const text = `Hello ScholarHub AI Admin, I would like to renew the subscription for Lab: ${currentLab?.name || 'Lab'} (ID: ${currentLab?.id || ''}). Current Plan: ${planName} ($${priceUsd} USD).`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getMailtoUrl = () => {
    const subject = `Lab Subscription Renewal Request - ${currentLab?.name || 'Lab'}`;
    const body = `Hello ScholarHub AI Team,

I would like to request subscription renewal / payment details for our research laboratory:
- Lab Name: ${currentLab?.name || ''}
- Lab ID: ${currentLab?.id || ''}
- Assigned Plan: ${planName}
- Configured Rate: $${priceUsd} USD (${billingCycle})
- Allocated Quota: ${quota.allocated?.toLocaleString() || '1,000,000'} Tokens

Please send us the renewal invoice and bank transfer / payment gateway instructions.

Thank you!`;
    return `mailto:${adminSupportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleOpenRenewal = () => {
    setShowRenewalModal(true);
  };

  const handleDownloadInvoice = (invId) => {
    const text = `
============================================================
              SCHOLARHUB AI — LAB INVOICE RECEIPT
============================================================
Invoice ID      : ${invId || 'INV-2026-LAB-001'}
Lab Name        : ${currentLab?.name || 'Institutional Lab'}
Institution     : ${currentLab?.institution || 'Academic Consortium'}
Plan            : ${planName} (${billingCycle.toUpperCase()})
Amount Billed   : $${priceUsd}.00 USD
Payment Status  : PAID / AUTHORIZED
Valid Until     : ${expiresAt ? expiresAt.toLocaleDateString() : 'Active'}
Token Quota     : ${quota.allocated?.toLocaleString() || '1,000,000'} Shared Tokens
Compute Access  : Dedicated AI Compute Node (Groq / OpenRouter / Upstash)
============================================================
Thank you for accelerating open research with ScholarHub AI.
Support & Billing: billing@scholarhub-ai.com
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invId || 'invoice'}_ScholarHub_Lab.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice receipt downloaded.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-black text-[#171717] tracking-tight">
          Institutional Billing & Subscription Management
        </h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Real-time database validity tracking, Redis-cached compute quotas, and automated license renewal.
        </p>
      </div>

      {/* Subscription Validity & Renewal Status Card */}
      <div className={`rounded-3xl p-6 border shadow-xs transition-all ${
        isExpired 
          ? 'bg-rose-50/60 border-rose-200' 
          : (daysRemaining <= 15 ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-[#E5E5DF]')
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs ${
              isExpired 
                ? 'bg-rose-600 text-white' 
                : (daysRemaining <= 15 ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white')
            }`}>
              <CalendarClock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#171717]">
                  {planName}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isExpired 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : (daysRemaining <= 15 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                }`}>
                  {isExpired ? 'Subscription Expired / Locked' : (daysRemaining <= 15 ? 'Renewal Due Soon' : 'Active Subscription')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lab Node: <strong className="text-slate-800">{currentLab?.name}</strong> • ${priceUsd} / {billingCycle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenRenewal}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                isExpired 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                  : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
              }`}
            >
              <Send size={13} />
              <span>{isExpired ? 'Renew & Unlock Lab' : 'Request Early Renewal'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics: Days Left, Next Renewal, Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Days Remaining
            </span>
            <div className={`text-2xl font-black mt-1 flex items-baseline gap-1.5 ${
              isExpired 
                ? 'text-rose-600' 
                : (daysRemaining <= 15 ? 'text-amber-600' : 'text-emerald-600')
            }`}>
              <span>{daysRemaining > 0 ? daysRemaining : 0}</span>
              <span className="text-xs font-bold text-slate-500">Days</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {daysRemaining > 0 ? 'Full collaborative workspace enabled' : 'Auto-lock active for all members'}
            </p>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Renewal Date
            </span>
            <div className="text-base font-bold text-slate-900 mt-2">
              {expiresAt ? expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Never'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Automatic notice sent 14 days prior
            </p>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Institutional Rate
            </span>
            <div className="text-2xl font-black text-indigo-700 mt-1">
              ${priceUsd} <span className="text-xs font-bold text-slate-500">USD</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Includes dedicated Redis rate limits & vector DB
            </p>
          </div>
        </div>
      </div>

      {/* Quota Overview Card */}
      <div className="bg-white border border-[#E5E5DF] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-amber-600" />
            <h3 className="text-sm font-bold text-[#171717]">Lab Shared Compute Tokens</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Atomic PostgreSQL Locked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#E5E5DF]">
            <span className="text-xs font-semibold text-[#737373]">Allocated Budget</span>
            <div className="text-2xl font-black text-[#171717] mt-1">
              {quota.allocated?.toLocaleString() || 0}
            </div>
          </div>

          <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#E5E5DF]">
            <span className="text-xs font-semibold text-[#737373]">Consumed Tokens</span>
            <div className="text-2xl font-black text-[#171717] mt-1">
              {quota.consumed?.toLocaleString() || 0}
            </div>
          </div>

          <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#E5E5DF]">
            <span className="text-xs font-semibold text-[#737373]">Remaining Available</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {quota.available?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-[#737373] mb-1.5">
            <span>Quota Velocity</span>
            <span className="font-bold text-[#171717]">{percentUsed}%</span>
          </div>
          <div className="w-full bg-[#E5E5DF] h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${percentUsed > 80 ? 'bg-red-500' : 'bg-emerald-600'}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>

      {/* Invoice Records */}
      <div className="bg-white border border-[#E5E5DF] rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
            <CreditCard size={16} className="text-purple-600" />
            Verified Institutional Receipts & PO Invoices
          </h3>
          <span className="text-xs text-slate-400 font-medium">Database Synchronized</span>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-[#FAFAF8] border border-[#E5E5DF] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#171717]">INV-{currentLab?.id?.slice(0, 8).toUpperCase() || '2026'}-001</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-black uppercase">
                  Paid
                </span>
              </div>
              <span className="text-[#737373] mt-1 block">
                {planName} • Annual Institutional Access • 1,000,000 Lab Tokens
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-slate-900">${priceUsd}.00</span>
              <button 
                onClick={() => handleDownloadInvoice(`INV-${currentLab?.id?.slice(0, 8).toUpperCase() || '2026'}-001`)}
                className="p-2 hover:bg-[#E5E5DF] rounded-xl text-[#525252] flex items-center gap-1.5 font-bold transition-colors cursor-pointer border border-slate-200"
                title="Download Official PDF Receipt"
              >
                <Download size={13} />
                <span>Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Renewal & WhatsApp Concierge Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRenewalModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
                <CalendarClock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Institutional License Renewal
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Direct concierge for invoice issuance, bank PO &amp; license extension.
                </p>
              </div>
            </div>

            {/* Lab Context Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Laboratory Node:</span>
                <strong className="text-slate-900 font-bold">{currentLab?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Tier:</span>
                <span className="font-bold text-indigo-700">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Configured Rate:</span>
                <strong className="text-slate-900 font-bold">${priceUsd} USD / {billingCycle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isExpired ? 'Expired / Locked' : `${daysRemaining} Days Remaining`}
                </span>
              </div>
            </div>

            {/* Dual Payment Actions: Paddle (International) & WhatsApp/bKash (Local) */}
            <div className="space-y-3">
              {/* Option 1: Paddle International Payment */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await openPaddleCheckout({
                      tier: 'lab',
                      duration: '1_year',
                      user: { email: currentLab?.contact_email || '' },
                      onSuccess: () => {
                        toast.success('Paddle payment received! Lab subscription renewing...');
                        if (refreshCurrentLab) refreshCurrentLab();
                        setShowRenewalModal(false);
                      },
                      onError: (err) => {
                        toast.error(err.message || 'Paddle checkout could not be opened.');
                      }
                    });
                  } catch (e) {
                    toast.error('Failed to launch Paddle checkout.');
                  }
                }}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <CreditCard size={18} />
                <span>Pay $499 via Paddle (Credit Card / Apple Pay / PayPal)</span>
              </button>

              {/* Option 2: Direct WhatsApp Redirect (Local / bKash) */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>bKash / Local Transfer (Redirect to WhatsApp)</span>
                <ExternalLink size={14} className="opacity-80" />
              </a>

              {/* Action 2: Email Alternative (arupbhowmikpritom@gmail.com) */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">
                      WhatsApp not available? Email Support:
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      If WhatsApp redirect is not accessible, mail directly to{' '}
                      <strong className="font-mono text-slate-900">{adminSupportEmail}</strong> with your Lab ID.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={getMailtoUrl()}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-amber-300 text-slate-800 rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Mail size={13} className="text-amber-700" />
                    <span>Open Mail App</span>
                  </a>

                  <button
                    onClick={handleCopyEmail}
                    className="py-2 px-3 bg-white hover:bg-slate-50 border border-amber-300 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5">
              <button
                onClick={() => setShowRenewalModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
