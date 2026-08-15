import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Play, BookOpen, CheckCircle2, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../Footer';

const HubFeature = ({ user, profile, onLogout, liveUsersCount }) => {
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
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-xs font-bold text-purple-700 uppercase tracking-wider mx-auto"
          >
            <GraduationCap size={14} />
            <span>Opportunities & News</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#171717] tracking-tight leading-none max-w-4xl mx-auto"
          >
            Scholarship & Literature Hub
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl sm:text-2xl text-slate-650 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Stay updated on funding opportunities and emerging literature. The intelligence engine maps your interests against global scholarship directories (DAAD, Erasmus, and EURAXESS).
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="pt-4"
          >
            <button
              onClick={() => navigate('/opportunities')}
              className="px-8 py-4 bg-[#315CFF] hover:bg-[#2547d0] text-white rounded-lg text-base font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Browse Open Funding</span>
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
              src="/gif/scholarship_literature_hub.gif" 
              alt="Scholarship & literature hub demonstration" 
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
            <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">Monitoring Global Funding Databases</h2>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Securing funding is a key requirement for scientific career paths. Yet, PhD positions and fellowship notices are scattered across hundreds of university websites, EURAXESS, FindAPhD, and government directories. The Scholarship & Literature Hub monitors these pages, indexing, summarizing, and matching them to your research background.
            </p>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              The engine automatically calculates compatibility scores, highlights deadlines, and sends personalized alerts based on active user profiles.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6 bg-white border border-[#E5E5DF] rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
              <Zap className="text-purple-600" size={20} />
              <span>Full Capability Matrix</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Dynamic Scrapers</h5>
                  <p className="text-xs text-slate-600">Hourly crawls of FindAPhD, EURAXESS, and regional funding portals.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Interest Matcher</h5>
                  <p className="text-xs text-slate-600">Calculates alignment scores based on target degree levels and subject tags.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">AI Digest Summary</h5>
                  <p className="text-xs text-slate-600">Generates 3-sentence summaries of literature news, saving hours of reading time.</p>
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
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">How Researchers Use the Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-purple-650 uppercase tracking-widest block">Step 01</span>
              <h4 className="text-lg font-bold text-[#171717]">Define Interests</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Save your academic field keywords and degree levels inside your Profile settings.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-purple-650 uppercase tracking-widest block">Step 02</span>
              <h4 className="text-lg font-bold text-[#171717]">Open Portals</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Navigate to the 'News' or 'Opportunities' sections in the workspace navigation sidebar.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-purple-650 uppercase tracking-widest block">Step 03</span>
              <h4 className="text-lg font-bold text-[#171717]">Track Opportunities</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Review funding options with live countdown clocks and apply directly to institutions.</p>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default HubFeature;
