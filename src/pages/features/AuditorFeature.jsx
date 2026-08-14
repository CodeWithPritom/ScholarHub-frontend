import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Play, BookOpen, CheckCircle2, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../Footer';

const AuditorFeature = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717] font-sans selection:bg-blue-500/30 relative flex flex-col">
      <Navbar user={user} profile={profile} transparent={false} liveUsersCount={liveUsersCount} onLogout={onLogout} />

      <main className="flex-1 w-full space-y-24 pb-28 pt-12">
        
        {/* Header Block (Hero) */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 pt-20 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-700 uppercase tracking-wider mx-auto"
          >
            <Shield size={14} />
            <span>Research Auditing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#171717] tracking-tight leading-none max-w-4xl mx-auto"
          >
            Research Auditor & Shareable Audits
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl sm:text-2xl text-slate-650 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Verify paper assertions, analyze calculation logic, and share interactive audit logs publicly with peer researchers or academic journals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="pt-4"
          >
            <button
              onClick={() => navigate(user ? '/auditor' : '/auth')}
              className="px-8 py-4 bg-[#315CFF] hover:bg-[#2547d0] text-white rounded-lg text-base font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Launch Auditor Page</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </section>

        {/* Hero Visual Showcase */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="w-full aspect-[2186/1080] rounded-2xl overflow-hidden shadow-2xl border border-[#E5E5DF] bg-white relative group"
          >
            <img 
              src="/gif/Verify and share research audits.gif" 
              alt="Verify and share research audits demonstration" 
              className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
              fetchpriority="high"
              decoding="async"
            />
          </motion.div>
        </section>

        {/* Detailed Information & Capabilities */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">The Need for Verifiable Science</h2>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Scientific papers are often cited without checking the calculations or equations. The Research Auditor addresses this by validating document data, verifying references, and listing inconsistencies automatically.
            </p>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Once an audit is finished, researchers can compile an interactive verification page and share its URL publicly, ensuring peer review transparency.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6 bg-white border border-[#E5E5DF] rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
              <Zap className="text-amber-600" size={20} />
              <span>Full Capability Matrix</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Factual Verification</h5>
                  <p className="text-xs text-slate-600">Cross-checks calculations, reference lists, and claims in PDFs.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Public Audit Links</h5>
                  <p className="text-xs text-slate-600">Generate shareable URLs displaying verification status and logs to peer researchers.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Verification Badges</h5>
                  <p className="text-xs text-slate-600">Showcases verification passes, alerts, and inconsistencies on shared audit logs.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        {/* How to use Step-by-Step */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto px-6 sm:px-12 space-y-8"
        >
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">How Researchers Use Auditor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Step 01</span>
              <h4 className="text-lg font-bold text-[#171717]">Trigger Audit</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Select an uploaded PDF and click 'Run Audit' in the Auditor page.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Step 02</span>
              <h4 className="text-lg font-bold text-[#171717]">Review Warnings</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Check verification checkmarks, statistical corrections, and source discrepancies.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Step 03</span>
              <h4 className="text-lg font-bold text-[#171717]">Share Link</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Click 'Generate Share Link' to get a public URL for peers to view verification logs.</p>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default AuditorFeature;
