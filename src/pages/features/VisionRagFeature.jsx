import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Play, BookOpen, CheckCircle2, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../Footer';

const VisionRagFeature = ({ user, profile, onLogout, liveUsersCount }) => {
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
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-wider mx-auto"
          >
            <Eye size={14} />
            <span>Visual Extraction</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#171717] tracking-tight leading-none max-w-4xl mx-auto"
          >
            Vision RAG (The Eye)
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl sm:text-2xl text-slate-650 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Extract data trapped inside tables, charts, and diagrams. The Eye vectorizes visual assets in academic PDFs, making them instantly queryable.
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
              <span>Analyze Your PDFs</span>
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
              src="/gif/see_whats_hidden_in_pdfs.gif" 
              alt="See what's hidden in PDFs demonstration" 
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
            <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">Accessing Trapped Visual Data</h2>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Scientific papers express crucial data through visual channels (e.g. survival curve charts, chemical sequence diagrams, and flow structures). Standard search engines treat PDFs as raw text strings, neglecting these diagrams. Vision RAG resolves this mismatch by executing layouts analysis to separate visual blocks from text bounds.
            </p>
            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-normal">
              Our Multi-Modal parser processes visual components through an image describer model, indexing coordinates and summaries so you can query or isolate any figure inside your research workflow.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6 bg-white border border-[#E5E5DF] rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
              <Zap className="text-indigo-600" size={20} />
              <span>Full Capability Matrix</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Layout Bounds Isolation</h5>
                  <p className="text-xs text-slate-600">Splits paper layouts, preserving original coordinates of tables and figures.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Multi-Modal Indexing</h5>
                  <p className="text-xs text-slate-600">Indexes image summaries and boundaries alongside original paper text blocks.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h5 className="text-sm font-bold text-[#171717]">Deep-Link Navigation</h5>
                  <p className="text-xs text-slate-600">Highlighting or clicking a visual citation jumps the reader directly to the page coordinate target.</p>
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
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">How Researchers Use Vision RAG</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">Step 01</span>
              <h4 className="text-lg font-bold text-[#171717]">Upload PDF</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Drop your research document PDF into the upload dashboard. Document segmentation kicks off instantly.</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">Step 02</span>
              <h4 className="text-lg font-bold text-[#171717]">Ask Visual Queries</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Ask details about diagrams or tables inside the chat box, e.g., 'What are the value levels in table 2?'</p>
            </div>
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 space-y-3 hover:border-slate-350 transition-colors shadow-2xs">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">Step 03</span>
              <h4 className="text-lg font-bold text-[#171717]">Isolate Figures</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">Select extracted image tabs on your viewer panel to open full-scale overlays alongside text summaries.</p>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default VisionRagFeature;
