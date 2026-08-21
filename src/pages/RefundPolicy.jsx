import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, Clock, Mail, MessageSquare, AlertCircle, 
  HelpCircle, RefreshCw, FileText, CheckCircle2, ChevronRight 
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../Footer'
import SEOHead from '../components/SEOHead'

const RefundPolicy = ({ user, profile, liveUsersCount, onLogout }) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717] font-sans selection:bg-indigo-500/30 relative flex flex-col">
      <SEOHead
        title="Refund Policy | ScholarHub AI"
        description="ScholarHub AI academic subscription refund and cancellation policy. 3-day accidental purchase guarantee and direct admin contact details."
        canonicalPath="/refund"
      />

      <Navbar user={user} profile={profile} transparent={false} liveUsersCount={liveUsersCount} onLogout={onLogout} />

      {/* Hero Header */}
      <section className="bg-white border-b border-[#E5E5DF] pt-28 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>3-Day Accidental Purchase Guarantee</span>
            </div>
            <span className="text-xs font-bold text-slate-400">Effective Date: August 2026</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0F172A]">
              Refund & Cancellation Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              At ScholarHub AI, we strive to empower researchers worldwide. If you made an accidental purchase or selected the wrong subscription tier, we provide a streamlined, transparent refund process.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-indigo-600" />
              <span>3-Day Full Refund Window</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-emerald-600" />
              <span>24–48h Processing via bKash/Nagad/Bank</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-600" />
              <span>Direct Admin WhatsApp Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-12 flex-1 w-full space-y-12">

        {/* 1. The 3-Day Policy */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-indigo-600">
            <Clock size={22} />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              1. 3-Day Accidental Purchase Window
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            If you accidentally purchased or upgraded to a <strong>Starter Scholar</strong> or <strong>PRO Scholar</strong> subscription tier, you are entitled to request a <strong>100% full refund</strong> or a plan tier adjustment within <strong>3 calendar days (72 hours)</strong> from the exact timestamp of transaction completion.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>No long bureaucratic delays: Once verified by the administrator, your refund is approved immediately.</span>
          </div>
        </section>

        {/* 2. Eligibility & Usage Thresholds */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-indigo-600">
            <FileText size={22} />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              2. Refund Eligibility Criteria
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            To prevent compute exploitation while protecting genuine researchers, refund requests must meet the following fair-use conditions:
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
              <span>The request is submitted within <strong>72 hours (3 days)</strong> of the payment date.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
              <span>The account has utilized less than <strong>15% of the allocated monthly compute credit quota (Zaps)</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
              <span>The account is in good standing and has not engaged in programmatic API abuse or data scraping violations.</span>
            </li>
          </ul>
        </section>

        {/* 3. Direct Admin Contact Details */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <MessageSquare size={22} />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              3. How to Request a Refund & Admin Contact Details
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            To initiate a refund, simply reach out to the platform administration with your registered email and transaction reference ID through any of the official channels below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp Official Support */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Fastest Resolution</div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-600" /> WhatsApp Direct Support
              </div>
              <div className="text-xs font-bold text-slate-700">+880 1853-343176</div>
              <p className="text-[11px] text-slate-500 font-medium">Average reply time: Under 15 minutes.</p>
              <a
                href="https://wa.me/8801853343176?text=Hi%20Pritom,%20I%20would%20like%20to%20request%20a%20subscription%20refund."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Chat on WhatsApp →
              </a>
            </div>

            {/* Email Support */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Written Inquiries</div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Mail size={16} className="text-indigo-600" /> Official Email Support
              </div>
              <div className="text-xs font-bold text-slate-700">support@scholarhub-ai.com</div>
              <div className="text-xs font-bold text-slate-700">pritombhowmik360@gmail.com</div>
              <p className="text-[11px] text-slate-500 font-medium">Average reply time: 2–6 hours.</p>
            </div>
          </div>
        </section>

        {/* 4. Processing Time */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-indigo-600">
            <RefreshCw size={22} />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              4. Processing Timeline & Payout Methods
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Upon administrative verification, the refund amount will be credited back via your original method of payment:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium list-disc pl-5">
            <li><strong>bKash / Nagad / Upay:</strong> 12 to 24 business hours.</li>
            <li><strong>Bank Transfer / Cards:</strong> 24 to 48 business hours depending on the receiving bank.</li>
          </ul>
        </section>

      </main>

      <Footer user={user} onAuthRequired={() => {}} />
    </div>
  )
}

export default RefundPolicy
