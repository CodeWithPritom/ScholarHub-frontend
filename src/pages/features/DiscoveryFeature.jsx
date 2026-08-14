import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Play, BookOpen, CheckCircle2, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../Footer';

const DiscoveryFeature = ({ user, profile, onLogout, liveUsersCount }) => {
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
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 uppercase tracking-wider mx-auto"
          >
            <Database size={14} />
            <span>Universal Search</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#171717] tracking-tight leading-none max-w-4xl mx-auto"
          >
            Multi-Source Literature Discovery
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl sm:text-2xl text-slate-650 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Access the world's academic literature in one search. We query NCBI, PubMed, arXiv, and OpenAlex simultaneously, filtering preprints and duplicates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="pt-4"
          >
            <button
              onClick={() => navigate(user ? '/research' : '/auth')}
              className="px-8 py-4 bg-[#315CFF] hover:bg-[#2547d0] text-white rounded-lg text-base font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Start Searching Papers</span>
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
              src="/gif/Grounded in 138M+ papers.gif" 
              alt="Grounded in 138M+ papers demonstration" 
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
            <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">The Challenge of Fragmented Libraries</h2>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Academics waste hours running separate searches on arXiv for preprints, PubMed for biomedical papers, and OpenAlex for general citations. This setup risks missing connections between different disciplines. ScholarHub resolves this by querying all indices simultaneously and returning a single feed.
            </p>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Our backend dispatch brokers translate search queries into native parameters for each provider API, de-duplicating matches based on DOI signatures and filtering out predatory journals instantly.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6 bg-white border border-[#E5E5DF] rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
              <Zap className="text-emerald-600" size={20} />
              <span>Full Capability Matrix</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Federated Aggregation</h5>
                  <p className="text-xs text-slate-600">Dispatches parallel requests to 12+ search libraries in milliseconds.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Deduplication Filters</h5>
                  <p className="text-xs text-slate-600">Automatically recognizes and merges duplicate source listings based on DOI signatures.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Influence Scoring</h5>
                  <p className="text-xs text-slate-600">Ranks search results by citation weights, journal ranking metrics, and peer-review status.</p>
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
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">How Researchers Use Discovery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">Step 01</span>
              <h4 className="text-lg font-bold text-[#171717]">Input Keywords</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Type your core academic query, authors list, or subject keywords inside the main bar.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">Step 02</span>
              <h4 className="text-lg font-bold text-[#171717]">Select Repositories</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Choose target directories (e.g. arXiv, PubMed, NCBI) or select 'Universal Query' to search all.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">Step 03</span>
              <h4 className="text-lg font-bold text-[#171717]">Save to Library</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Select matching records and hit 'Save to Library' to index PDFs in your personal workspace.</p>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default DiscoveryFeature;
