import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Shield, AlertTriangle, BookOpen, 
  FileText, Scale, Lock, RefreshCw, Cpu, Layers, 
  Mail, UserCheck, ShieldAlert, Sparkles, Globe
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../Footer';

const TermsOfService = ({ user, profile, onLogout, liveUsersCount }) => {
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Scale size={13} />
              <span>Official Terms</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0F172A]">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              These Terms of Service govern your access to and use of ScholarHub AI's research discovery platform, literature search engines, and artificial intelligence synthesis tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-500 border-t border-slate-100">
            <div>Last Updated: <span className="text-slate-900">August 2026</span></div>
            <div>Platform: <span className="text-slate-900">ScholarHub AI</span></div>
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
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">1. Agreement & Acceptance</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              By accessing, browsing, creating an account, or utilizing any services provided by ScholarHub AI (accessible at <strong>https://scholarhub-ai.com</strong>), you agree to be bound by these Terms of Service and our Privacy Policy. If you are using ScholarHub AI on behalf of an educational institution, laboratory, university, or company, you represent that you have the authority to bind that entity to these terms.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">2. Eligibility & Account Security</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              You must be at least 13 years of age (or the minimum legal age in your country) to create an account. You agree to provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Please notify us immediately at <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-semibold">admin@scholarhub-ai.com</code> if you suspect unauthorized access.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Cpu size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">3. Description of Platform Services</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI provides researchers, students, and academics with tools to discover, organize, analyze, and synthesize scientific literature across multiple disciplines. Our features include federated search across open-access academic databases, AI-assisted summaries, PRISMA extraction tables, citation generators, and document analysis tools.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">4. User Content & Full Ownership</h2>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs sm:text-sm text-emerald-950 font-medium">
              <strong>🛡️ 100% User Ownership Guarantee:</strong> You retain complete and exclusive intellectual property ownership of all manuscripts, research notes, search prompts, and PDF documents you submit or upload to ScholarHub AI.
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI claims no ownership rights over your research work. We use your uploaded files solely to perform the search, indexing, and summarization tasks requested by you. ScholarHub AI does not sell, license, or distribute your private research content to third parties or advertisers.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">5. AI Research Assistant & Output Disclaimer</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI utilizes advanced artificial intelligence models to assist with research. Because AI models generate outputs based on probabilistic patterns:
            </p>
            <ul className="list-disc pl-6 text-sm sm:text-base text-slate-700 space-y-2">
              <li><strong>Research Assistance:</strong> Generated summaries, synthesis matrixes, and extracted data are designed as research aids and should not be treated as final peer-reviewed scientific findings.</li>
              <li><strong>Author Verification:</strong> Researchers are responsible for independently verifying all citations, quantitative numbers, and conclusions before publishing or relying upon them.</li>
              <li><strong>No Medical or Legal Advice:</strong> Content generated across biomedical or specialized fields is for academic research only and does not constitute certified clinical guidelines, medical diagnoses, or formal legal advice.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">6. Subscriptions, Credits & Billing</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI offers both Free access and paid subscription tiers (such as Starter and Pro plans).
            </p>
            <div className="space-y-3 text-sm sm:text-base text-slate-700">
              <p>• <strong>Compute Credits (Zaps):</strong> Plans allocate monthly compute credits for heavy AI workflows. Unused credits expire at the end of the active billing cycle.</p>
              <p>• <strong>Renewals & Cancellations:</strong> Paid plans are billed on a recurring monthly or annual basis. You can manage or cancel your subscription at any time via your <Link to="/profile" className="text-blue-600 font-bold hover:underline">Profile</Link>.</p>
              <p>• <strong>Manual & Local Payments:</strong> Subscriptions activated via local channels (such as bKash, Nagad, bank transfer, or card) are confirmed via email upon verification.</p>
              <p>• <strong>Refunds:</strong> If you encounter technical defects preventing usage within 7 days of activation, you may contact support for a refund or credit adjustment.</p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">7. Fair Use & 2-Device Concurrency Policy</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              To protect platform stability and ensure fair use of cloud compute:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
              <p>• Each individual account is permitted a maximum of <strong>two (2) concurrent active device sessions</strong> (e.g., your laptop and your mobile/tablet).</p>
              <p>• Logging into a third device will prompt you to manage and disconnect an older session.</p>
              <p>• Sharing account credentials or reselling access is strictly prohibited and may result in account suspension.</p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">8. Acceptable Use Policy</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              You agree to use ScholarHub AI strictly for lawful academic and professional research. You agree not to:
            </p>
            <ul className="list-disc pl-6 text-sm sm:text-base text-slate-700 space-y-2">
              <li>Deploy automated bots, scrapers, or scripts to overload our servers or harvest raw database catalogs.</li>
              <li>Attempt to reverse-engineer, decompile, or copy the platform's software or AI pipelines.</li>
              <li>Bypass rate limits, payment gateways, or subscription access controls.</li>
              <li>Upload malicious code, viruses, or prompt-injection payloads.</li>
              <li>Upload content that violates copyright laws or unconsented personal medical records.</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">9. Open-Access Academic Data Sources</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ScholarHub AI queries public and open-access academic repositories, including PubMed/NCBI, arXiv, OpenAlex, Crossref, Europe PMC, and Unpaywall. External papers, abstracts, and metadata remain the property of their respective authors and publishers and are surfaced under educational fair-use principles.
            </p>
          </div>

          {/* Section 10 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">10. Data Protection & Confidentiality</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We apply industry-standard security protocols to protect your account and research data, including encryption in transit (TLS 1.3) and encryption at rest (AES-256). For full details on how we protect your information, please review our <Link to="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          {/* Section 11 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Scale size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">11. Termination & Cancellation</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              You may stop using our services and delete your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraud, or abuse system resources. Upon deletion, your personal data and private uploads will be permanently removed in accordance with our data retention schedule.
            </p>
          </div>

          {/* Section 12 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">12. Disclaimers & Limitation of Liability</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed uppercase font-semibold">
              ScholarHub AI is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, ScholarHub AI shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform, including data loss or publication delays.
            </p>
          </div>

          {/* Section 13 */}
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-3xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Mail size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">13. Contact & Support</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              If you have questions, feedback, or legal inquiries regarding these Terms of Service, please contact our team:
            </p>
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1.5">
              <p><strong>ScholarHub AI Operations</strong></p>
              <p>Official Email: <a href="mailto:admin@scholarhub-ai.com" className="text-blue-600 font-bold hover:underline">admin@scholarhub-ai.com</a></p>
              <p>Website: <a href="https://scholarhub-ai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">https://scholarhub-ai.com</a></p>
            </div>
          </div>

        </motion.div>
      </main>

      <Footer user={user} onAuthRequired={() => navigate('/pricing')} />
    </div>
  );
};

export default TermsOfService;
