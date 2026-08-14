import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle, Shield, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../Footer';

const TermsOfService = ({ user, profile, onLogout, liveUsersCount }) => {
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
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171717]">Terms of Service</h1>
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
              <CheckCircle className="text-[#315CFF]" size={20} />
              <span>1. Agreement & Acceptance</span>
            </h3>
            <p className="text-sm sm:text-base">
              By accessing, browsing, or utilizing the ScholarHub AI web portal, desktop layouts, or database crawlers, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please stop using our services immediately.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <Shield className="text-[#315CFF]" size={20} />
              <span>2. Acceptable Use Policy</span>
            </h3>
            <p className="text-sm sm:text-base">
              Our platform is designed strictly for educational, scientific, and industrial research. Users agree to:
            </p>
            <ul className="list-disc pl-6 text-sm space-y-2">
              <li>Upload only documents (PDFs) for which they own copyright permissions or hold license rights for research/fair use.</li>
              <li>Refrain from dispatching automated scripts or DDOS tools designed to scrape our database gateways or overload API connections.</li>
              <li>Not bypass payment walls, subscription credits, or active device slots tracking.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={20} />
              <span>3. Active Session Limits (Fair Use)</span>
            </h3>
            <p className="text-sm sm:text-base">
              To guarantee service stability, each registered researcher account is restricted to a maximum of 2 concurrent device sessions. Sharing logins is prohibited. If you exceed this device slot count, the platform will display a session alert, requiring you to revoke one device from your workspace.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <BookOpen className="text-[#315CFF]" size={20} />
              <span>4. Subscriptions & Payments</span>
            </h3>
            <p className="text-sm sm:text-base">
              Payments for Starter and Pro plans are processed securely via local gateway networks. Subscriptions are billed monthly on a recurring schedule. You can downgrade your subscription or cancel renewal at any time.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <FileText className="text-[#315CFF]" size={20} />
              <span>5. Intellectual Property Rights</span>
            </h3>
            <p className="text-sm sm:text-base">
              The ScholarHub AI name, logo, ROS-10 autonomous routing scripts, and all layout components are the property of ScholarHub AI. Users retain full intellectual property rights to the academic texts they write inside the Guided Research Academy or the summaries they compile from vector storage.
            </p>
          </div>

          {/* Contact Details */}
          <div className="pt-6 border-t border-[#E5E5DF] text-xs text-slate-500">
            <p>For questions regarding terms, copyrights, or institutional licensing packages, please reach out to <a href="mailto:legal@scholarhub.ai" className="text-[#315CFF] hover:underline font-bold">legal@scholarhub.ai</a>.</p>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
