import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, Lock, Eye, Key, FileText, 
  Database, Server, Cpu, RefreshCw, UserCheck, ShieldAlert, 
  Mail, Sparkles, Globe, Trash2, CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../Footer';

const PrivacyPolicy = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717] font-sans selection:bg-blue-500/30 relative flex flex-col">
      <Navbar user={user} profile={profile} transparent={false} liveUsersCount={liveUsersCount} onLogout={onLogout} />

      {/* Hero Header */}
      <section className="bg-white border-b border-[#E5E5DF] pt-28 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 rounded-full bg-[#F3F3EF] hover:bg-[#E5E5DF] px-4 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck size={13} />
              <span>Privacy & Security</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0F172A]">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              This Privacy Policy explains how ScholarHub AI collects, uses, protects, and handles your personal information, search queries, uploaded research documents, and account data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-500 border-t border-slate-100">
            <div>Last Updated: <span className="text-slate-900">August 2026</span></div>
            <div>Zero-Training: <span className="text-emerald-700 font-semibold">Active</span></div>
            <div>Official Domain: <span className="text-blue-600 font-semibold">scholarhub-ai.com</span></div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >

          {/* Section 1 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">1. Overview & Privacy Commitment</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI is built specifically for researchers, educators, students, and academic professionals. We treat the confidentiality of your scientific research, unpublished manuscripts, and personal information as top priorities.
            </p>
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs sm:text-sm text-emerald-950 space-y-1.5 font-medium">
              <p>• <strong>Zero AI Model Training:</strong> Your private uploaded manuscripts and search questions are never used to train public AI foundation models.</p>
              <p>• <strong>Zero Data Brokering:</strong> We never sell, rent, or trade your research data or personal information to third parties or advertisers.</p>
              <p>• <strong>End-to-End Encryption:</strong> Your data is secured with industry-standard encryption in transit (TLS 1.3) and at rest (AES-256).</p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Eye size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">2. Information We Collect</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We collect only the information necessary to provide you with search and research synthesis services:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">A. Account Information</span>
                <p>Email address, display name, academic field of study, and login authentication details.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">B. Research Inputs & Uploads</span>
                <p>Search queries, research prompts, PDF manuscripts uploaded for analysis, and saved bookmarks.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">C. Device & Usage Telemetry</span>
                <p>Browser type, device ID token, and IP address for rate-limiting, security, and the 2-device policy.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">D. Billing Metadata</span>
                <p>Transaction reference IDs, plan tier, and validity dates (we never store banking credentials).</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Database size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">3. How We Use Your Information</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We process your data strictly to fulfill academic research workflows and ensure service quality:
            </p>
            <ul className="list-disc pl-6 text-sm sm:text-base text-slate-700 space-y-2">
              <li>Executing literature searches across open-access databases (PubMed, arXiv, OpenAlex, etc.).</li>
              <li>Generating AI summaries, comparative synthesis matrixes, and citation references.</li>
              <li>Managing your account status, monthly compute credits (Zaps), and subscription validity.</li>
              <li>Sending essential service notifications (such as plan upgrade confirmations and expiry reminders).</li>
              <li>Preventing unauthorized access, fraudulent activity, and cyber attacks.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">4. AI Model Privacy & Zero-Training Guarantee</h2>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl text-xs sm:text-sm text-indigo-950 space-y-2 font-medium">
              <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                <CheckCircle2 size={16} className="text-indigo-600" />
                <span>Strict Confidentiality in AI Processing</span>
              </div>
              <p>When you use ScholarHub AI to summarize or query research documents:</p>
              <p>1. Your text and prompts are processed ephemerally solely to return your answers.</p>
              <p>2. Underlying AI model providers do not retain, store, or train on your private research inputs.</p>
              <p>3. Your unpublished research findings and private notes remain strictly yours.</p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">5. Data Storage, Isolation & Security</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We employ strict multi-tenant security architecture. Each user account's data and uploaded documents are isolated in private database partitions. No user can ever view, query, or access another user's private library. All stored information is protected by industry-standard encryption at rest and in transit.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Server size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">6. Third-Party Service Providers</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We work with trusted enterprise cloud infrastructure providers to run ScholarHub AI:
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p>• <strong>Database & Authentication:</strong> Securely managed via Supabase with row-level security.</p>
              <p>• <strong>Fast In-Memory Cache:</strong> Ephemeral query acceleration managed via Upstash.</p>
              <p>• <strong>Transactional Email:</strong> Notification emails dispatched securely via Resend API (<code className="text-slate-800">admin@scholarhub-ai.com</code>).</p>
              <p>• <strong>Cloud Hosting:</strong> Web interface and API hosted on enterprise edge networks.</p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Trash2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">7. Data Retention & Deletion Policy</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We retain your data only for as long as your account remains active. Routine system logs are automatically purged on a 90-day rolling cycle. When you choose to delete your account, your personal information, uploaded documents, and saved library items are permanently purged from our active systems.
            </p>
          </div>

          {/* Section 8 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">8. Your Rights & Data Portability</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              You have full control over your research data on ScholarHub AI:
            </p>
            <ul className="list-disc pl-6 text-sm sm:text-base text-slate-700 space-y-2">
              <li><strong>Access & View:</strong> You can review all your saved papers, history, and profile data in your dashboard.</li>
              <li><strong>Export:</strong> You can export your research citations and literature matrixes into BibTeX, JSON, Excel, and PDF formats.</li>
              <li><strong>Update or Correct:</strong> You can update your profile and research preferences anytime.</li>
              <li><strong>Delete:</strong> You can request complete deletion of your account and data by emailing <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-semibold">admin@scholarhub-ai.com</code>.</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Key size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">9. Cookies & Local Storage</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI uses browser LocalStorage strictly for essential functions, such as remembering your logged-in session, active device token for the 2-device policy, and UI display preferences. We do <strong>not</strong> use third-party advertising cookies, cross-site trackers, or commercial tracking pixels.
            </p>
          </div>

          {/* Section 10 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">10. Academic Privacy & Compliance</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Our privacy safeguards align with international research and educational standards, including the EU General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and educational research privacy practices (FERPA).
            </p>
          </div>

          {/* Section 11 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">11. Children's Privacy</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI is designed for students, researchers, and academic professionals. We do not knowingly collect personal information from children under 13 years of age. If you believe a minor has created an account without authorization, please contact us for immediate deletion.
            </p>
          </div>

          {/* Section 12 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Mail size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">12. Contact & Privacy Inquiries</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              If you have any questions, requests, or privacy concerns regarding this Privacy Policy, please contact our team:
            </p>
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1.5">
              <p><strong>ScholarHub AI Privacy Team</strong></p>
              <p>Official Email: <a href="mailto:admin@scholarhub-ai.com" className="text-emerald-600 font-bold hover:underline">admin@scholarhub-ai.com</a></p>
              <p>Website: <a href="https://scholarhub-ai.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">https://scholarhub-ai.com</a></p>
            </div>
          </div>

        </motion.div>
      </main>

      <Footer user={user} onAuthRequired={() => navigate('/pricing')} />
    </div>
  );
};

export default PrivacyPolicy;
