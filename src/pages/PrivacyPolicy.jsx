import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, Eye, Key, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../Footer';

const PrivacyPolicy = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717] font-sans selection:bg-blue-500/30 relative flex flex-col">
      <Navbar user={user} profile={profile} transparent={false} liveUsersCount={liveUsersCount} onLogout={onLogout} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-24 space-y-12">
        
        {/* Sleek Minimal Arrow Back Button */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center justify-center rounded-full bg-white border border-[#E5E5DF] hover:bg-[#F3F3EF] p-2.5 transition-all shadow-2xs cursor-pointer"
            title="Return Home"
          >
            <ArrowLeft size={16} className="text-[#171717]/80 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Page Title Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171717]">Privacy Policy</h1>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Last updated: August 14, 2026</p>
          <div className="w-20 h-1 bg-[#315CFF] rounded-full"></div>
        </motion.div>

        {/* Content Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-[#E5E5DF] rounded-2xl p-8 sm:p-12 space-y-10 shadow-3xs text-slate-800 leading-relaxed text-justify"
        >
          {/* Section 1 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <ShieldCheck className="text-[#315CFF]" size={20} />
              <span>1. Overview & Commitment</span>
            </h3>
            <p className="text-sm sm:text-base">
              At ScholarHub AI, we recognize the critical importance of privacy for researchers, students, and academic professionals. This Privacy Policy details how we collect, store, isolate, and protect your personal information, PDF uploads, research keywords, and log files. We commit to transparency and safety in handling data.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <Eye className="text-[#315CFF]" size={20} />
              <span>2. Data Collection Practices</span>
            </h3>
            <p className="text-sm sm:text-base">
              We collect data to provide vector-grounded search and profile-matching tools:
            </p>
            <ul className="list-disc pl-6 text-sm space-y-2">
              <li><strong>Account Credentials:</strong> Email addresses and profiles details required to manage active device slots.</li>
              <li><strong>Uploaded Papers:</strong> PDFs uploaded to the research workspace are parsed for layout segments. They are kept in private vector indexes unique to your user account.</li>
              <li><strong>Search & Chat History:</strong> Academic search inputs and AI Mentor logs are retained to enable personal library searches.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <Lock className="text-[#315CFF]" size={20} />
              <span>3. Data Storage & Isolation</span>
            </h3>
            <p className="text-sm sm:text-base">
              All academic papers, vectors, and query logs are stored in private database slots encrypted at rest using AES-256 standards. We enforce strict multi-tenant isolation, meaning your vectorized documents are completely invisible to other accounts. ScholarHub AI never sells user data or files to third-party advertisers.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <Key className="text-[#315CFF]" size={20} />
              <span>4. AI Models & Safety Boundaries</span>
            </h3>
            <p className="text-sm sm:text-base">
              We send text segments to LLMs dynamically to compile literature review summaries. Your private PDFs are never shared with general model providers to train foundation layers. All models are broker-routed, meaning your inquiries remain anonymous and securely shielded behind our backend proxies.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <FileText className="text-[#315CFF]" size={20} />
              <span>5. Cookies & Browser Telemetry</span>
            </h3>
            <p className="text-sm sm:text-base">
              We use secure cookies to remember your login session across devices. You can configure cookie permissions via our Cookie Consent banner. Telemetry logs are strictly confined to system-health statistics and real-time active slots tracking.
            </p>
          </div>

          {/* Contact Details */}
          <div className="pt-6 border-t border-[#E5E5DF] text-xs text-slate-500">
            <p>If you have any questions regarding data isolation or wish to purge your account records, please contact our support team at <a href="mailto:support@scholarhub.ai" className="text-[#315CFF] hover:underline font-bold">support@scholarhub.ai</a>.</p>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
