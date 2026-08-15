import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, ArrowRight, Activity, Users, Database, Globe, Megaphone, X, Play, Brain, CheckCircle2, Server, MessageSquare, Smartphone, Monitor, Zap, ChevronLeft, ChevronRight, ChevronDown, Book, Atom, Sparkles, Shield, Timer, GraduationCap, AlertTriangle, Eye, BookOpen, Layers, Cpu } from 'lucide-react'
import { supabase } from '../supabaseClient'
import logo from '../assets/images/logo.png'
import Footer from '../Footer'
import Navbar from '../components/Navbar'
import Testimonials from '../components/Testimonials'
import CookieBanner from '../components/CookieBanner'

const LandingPage = ({ user, profile, liveUsersCount, totalMembersCount, onLogout }) => {
  const navigate = useNavigate()

  const handleLaunch = () => {
    if (!user) {
      navigate('/auth')
    } else if (profile) {
      navigate('/research')
    }
  }

  const [announcement, setAnnouncement] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const FAQ_ITEMS = [
    { 
      q: 'How is ScholarHub AI different from generic AI search engines?', 
      a: 'Unlike generic models that guess answers from training weights, ScholarHub AI dispatchers query actual databases (NCBI, arXiv, OpenAlex) in real-time. Our ROS-10 pipeline reads the text segments of source PDFs and links every sentence of the synthesized response to verified DOI sources and page numbers.' 
    },
    { 
      q: 'Are my uploaded PDF papers and search history private?', 
      a: 'Absolutely. All uploaded documents are parsed and stored in private, isolated vector storage blocks encrypted at rest. Your uploads, search keywords, and chat histories are never shared publicly or used to train open LLM models.' 
    },
    { 
      q: 'Does the platform guarantee zero hallucinations in summaries?', 
      a: 'Yes. Our Autonomous Agent uses active Chain-of-Thought critique checks. It extracts direct text snippets from papers and verifies each claim against the retrieved snippet before outputting the report, ensuring 100% citation grounding.' 
    },
    { 
      q: 'How does the Opportunities Matcher find funding and jobs?', 
      a: 'Our crawler scripts scrape international university boards, Erasmus directories, DAAD databases, and EURAXESS portals daily. It matches deadline dates, research focus keys, and degree criteria against your profile to score compatibility.' 
    },
    { 
      q: 'Can I share my research audit reports publicly?', 
      a: 'Yes. The Research Auditor verifies calculations and claims inside PDFs. You can generate a public, read-only link for completed audits to share with publishers, university advisors, or peer review panels.' 
    },
    { 
      q: 'What is the active device limit and how do I manage it?', 
      a: 'To prevent security breaches, each user account is limited to a maximum of 2 active device sessions. You can review active sessions and revoke device access anytime inside your Account Settings panel.' 
    }
  ];

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!error && data && data.length > 0) {
          const ann = data[0];
          const dismissedId = sessionStorage.getItem('dismissed_announcement');
          if (dismissedId !== ann.id.toString()) {
            setAnnouncement(ann);
            const hasSeenPopup = sessionStorage.getItem(`has_seen_popup_${ann.id}`);
            if (!hasSeenPopup) {
              setShowPopup(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };
    fetchAnnouncement();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.4, ease: "easeOut" } 
    }
  }

  const renderTextWithLinks = (text, type) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    let linkClass = 'underline hover:opacity-85 transition-opacity font-bold break-all ';
    if (type === 'warning') linkClass += 'text-amber-700';
    else if (type === 'success') linkClass += 'text-green-700';
    else linkClass += 'text-[#315CFF]';

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass} onClick={(e) => e.stopPropagation()}>{part}</a>;
      }
      
      // Parse markdown double asterisks to bold tag
      if (part && part.includes('**')) {
        const boldParts = part.split(/\*\*([^*]+)\*\*/g);
        return boldParts.map((subPart, j) => {
          if (j % 2 === 1) {
            return <strong key={j} className="font-bold text-[#171717]">{subPart}</strong>;
          }
          return subPart;
        });
      }
      
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717] font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px]  rounded-full pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px]  rounded-full pointer-events-none" />
      
      {/* Global Responsive Navbar */}
      <Navbar 
        user={user} 
        profile={profile} 
        liveUsersCount={liveUsersCount} 
        onLogout={onLogout} 
        transparent={true} 
      />

      {/* Global Announcement Banner */}
      <AnimatePresence>
        {announcement && !showPopup && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => setShowPopup(true)}
            className={`cursor-pointer absolute top-24 left-0 w-full z-40 py-3 px-6 flex items-center justify-between gap-3 text-sm font-bold shadow-md border-b backdrop-blur-md overflow-hidden transition-colors hover:opacity-50 ${
              announcement.type === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' :
              announcement.type === 'success' ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' :
              'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              <Megaphone size={16} className="animate-bounce shrink-0" />
              <span className="truncate">{announcement.title ? <><strong className="mr-2">{announcement.title} -</strong>{renderTextWithLinks(announcement.message, announcement.type)}</> : renderTextWithLinks(announcement.message, announcement.type)}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                sessionStorage.setItem('dismissed_announcement', announcement.id.toString())
                setAnnouncement(null)
              }} 
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Dismiss permanently"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-up Announcement Modal */}
      <AnimatePresence>
        {announcement && showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sds-bg/60 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem(`has_seen_popup_${announcement.id}`, 'true');
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative rounded-[12px] w-full max-w-lg p-8 shadow-sm overflow-hidden ${
                announcement.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                announcement.type === 'success' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <button 
                onClick={() => {
                  setShowPopup(false);
                  sessionStorage.setItem(`has_seen_popup_${announcement.id}`, 'true');
                }}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                  announcement.type === 'warning' ? 'text-amber-500 hover:bg-amber-100' :
                  announcement.type === 'success' ? 'text-green-500 hover:bg-green-100' :
                  'text-blue-500 hover:bg-blue-100'
                }`}
              >
                <X size={20} />
              </button>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                announcement.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                announcement.type === 'success' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Megaphone size={40} />
              </div>
              
              <h3 className={`text-2xl font-black mb-4 ${
                announcement.type === 'warning' ? 'text-amber-900' :
                announcement.type === 'success' ? 'text-green-900' :
                'text-blue-900'
              }`}>{announcement.title || 'Announcement'}</h3>
              
              <div className={`text-sm font-medium mb-8 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar ${
                announcement.type === 'warning' ? 'text-amber-800' :
                announcement.type === 'success' ? 'text-green-800' :
                'text-blue-800'
              }`}>
                {renderTextWithLinks(announcement.message, announcement.type)}
              </div>

              <button
                onClick={() => {
                  setShowPopup(false);
                  sessionStorage.setItem(`has_seen_popup_${announcement.id}`, 'true');
                }}
                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                  announcement.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-sds-text shadow-amber-200' :
                  announcement.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-sds-text shadow-green-200' :
                  'bg-blue-600 hover:bg-blue-700 text-sds-text shadow-blue-200'
                }`}
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className={`relative z-10 ${announcement ? 'pt-56' : 'pt-48'} pb-32 px-6 flex flex-col items-center justify-center min-h-[85vh] max-w-[1400px] mx-auto`}>
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="w-full max-w-7xl mx-auto px-6 text-center"
        >
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Globe size={14} /> Phase 5 Deployment Active
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Zap size={14} /> From the creator of Catalyst Smart Classroom
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-[#171717] mb-6 leading-[1.1] font-sds-content">
            AI for Scientific Research
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-800 font-bold mb-12 max-w-3xl mx-auto leading-relaxed">
            ScholarHub AI unifies NCBI, arXiv, and OpenAlex. Synthesize hundreds of peer-reviewed papers in seconds with Meta Llama 3.1 &amp; Groq LPU.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
            <button 
              onClick={handleLaunch}
              disabled={false}
              className={`group px-8 py-5 w-full sm:w-auto bg-[#315CFF] text-white hover:bg-[#2547d0] hover:bg-blue-50 rounded-2xl text-base font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-sm hover:shadow-sm hover:scale-105`}
            >
              {user ? "Go to Workspace" : "🚀 Start Researching for Free"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full sm:w-auto">
              <a 
                href="https://github.com/CodeWithPritom/ScholarHub-frontend/releases/download/v1.0.0/ScholarHub.AI.Setup.1.0.0.exe"
                className="group px-7 py-5 w-full sm:w-auto bg-[#F3F3EF] text-sds-text hover:bg-slate-700 border border-[#E5E5DF] rounded-2xl text-sm font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:scale-105"
              >
                <Monitor size={16} className="text-blue-400 group-hover:-translate-y-1 transition-transform" />
                Download for Windows
              </a>
              <a 
                href="https://github.com/CodeWithPritom/ScholarHub-frontend/releases/download/v1.0.0/ScholarHub.AI.apk"
                className="group px-7 py-5 w-full sm:w-auto bg-[#F3F3EF] text-sds-text hover:bg-slate-700 border border-[#E5E5DF] rounded-2xl text-sm font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:scale-105"
              >
                <Smartphone size={16} className="text-blue-400 group-hover:-translate-y-1 transition-transform" />
                Download for Android
              </a>
            </div>
          </motion.div>

          {/* USP Trust Badges */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide backdrop-blur-md">
              <Shield size={14} /> Verified Sources Only — No AI-generated fake citations
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide backdrop-blur-md">
              <Timer size={14} /> 800+ Tokens/Sec — Fastest synthesis on the market
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide backdrop-blur-md">
              <GraduationCap size={14} /> Mentorship Hub — Connect directly with global professors
            </div>
          </motion.div>
          
          {/* Demo Video */}
          <motion.div variants={itemVariants} className="mt-24 w-full max-w-7xl mx-auto px-6">
            <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-[12px] overflow-hidden border border-[#E5E5DF]/60 shadow-sm shadow-blue-500/10">
              <iframe 
                src="https://www.youtube.com/embed/uA6XPPecG5k?autoplay=0&controls=1&rel=0" 
                title="ScholarHub AI Demo" 
                className="absolute inset-0 w-full h-full object-cover bg-sds-bg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Live Intelligence Stats */}
      <section className="relative z-10 border-t border-[#E5E5DF] bg-sds-bg/50 backdrop-blur-xl py-12">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-white border border-[#E5E5DF] rounded-[12px] p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center relative">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-3xl font-black flex items-center gap-3">
                  {liveUsersCount}
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">Active Researchers</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white border border-[#E5E5DF] rounded-[12px] p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <div className="text-3xl font-black">{totalMembersCount.toLocaleString()}+</div>
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">Total Members</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white border border-[#E5E5DF] rounded-[12px] p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                <Database size={24} />
              </div>
              <div>
                <div className="text-3xl font-black">230M+</div>
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">Global Papers Indexed</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Not ChatGPT? — Competitive Comparison */}
      <section className="py-24 relative z-10 border-t border-[#E5E5DF]">
        <div className="w-full max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Why Not Just Use <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">ChatGPT</span>?</h2>
            <p className="text-slate-700 font-medium max-w-xl mx-auto">Generic AI tools aren't built for academic research. Here's the difference.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            {/* Generic AI Column */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-[12px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center"><AlertTriangle size={20} /></div>
                <h3 className="text-xl font-black text-red-400">Generic AI (ChatGPT, etc.)</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-slate-700">
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> Hallucinates citations & fabricates sources</li>
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> Training data cutoff — no real-time papers</li>
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> No direct access to NCBI, arXiv, or OpenAlex</li>
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> Cannot verify or cross-reference claims</li>
              </ul>
            </div>
            {/* ScholarHub AI Column */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[12px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                <h3 className="text-xl font-black text-emerald-400">ScholarHub AI</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-slate-600">
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Grounded answers from real peer-reviewed papers</li>
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Real-time access to live academic databases</li>
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Unified search across NCBI, arXiv & OpenAlex</li>
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Every claim linked to its source with DOI</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Manual Searching is Obsolete */}
      <section className="py-24 relative z-10 border-t border-[#E5E5DF] bg-sds-bg/50">
        <div className="w-full max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Why use this instead of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">manual searching</span>?</h2>
            <p className="text-slate-700 font-medium max-w-xl mx-auto">Manual verification takes hours. ScholarHub AI automates credibility checking instantly.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-[12px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                <h3 className="text-xl font-black text-blue-400">Unmatched Authority</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">Integrated with a 32,000+ Global Journal Database to instantly identify Q1-Q4 high-impact papers. Know exactly what you're citing at a glance.</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[12px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                <h3 className="text-xl font-black text-emerald-400">Guaranteed Accuracy</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">Stop reading low-quality preprints. Our engine cross-references Scimago (SJR) data to highlight verified peer-reviewed research effortlessly.</p>
            </div>
          </motion.div>
        </div>
      </section>

                        {/* Core Features / Visual Catalog of Capabilities */}
      <section className="py-24 relative z-10 border-t border-[#E5E5DF]">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#315CFF] block mb-3">
              Capabilities Catalog
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sds-content text-[#171717] tracking-tight mb-6">
              Research takes many forms
            </h2>
            <p className="text-slate-700 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Whether you need a quick answer or are planning a multi-month comprehensive review, ScholarHub AI can support you from beginning to end.
            </p>
          </div>

          {/* Metrics of Excellence Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 border border-[#E5E5DF] rounded-[12px] bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center md:items-start p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Compute Capacity</span>
              <span className="text-3xl md:text-4xl font-bold text-[#171717] font-sds-content">1,280+ req/sec</span>
              <span className="text-xs text-slate-600 mt-1">High-Throughput Node Scaler</span>
            </div>
            <div className="flex flex-col items-center md:items-start p-4 border-y md:border-y-0 md:border-x border-[#E5E5DF]">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Platform Stability</span>
              <span className="text-3xl md:text-4xl font-bold text-[#171717] font-sds-content">99.9% Uptime</span>
              <span className="text-xs text-slate-600 mt-1">Resilience Shield Architecture</span>
            </div>
            <div className="flex flex-col items-center md:items-start p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Intelligence Layer</span>
              <span className="text-3xl md:text-4xl font-bold text-[#171717] font-sds-content">Sub-second Cache</span>
              <span className="text-xs text-slate-600 mt-1">Redis Zero-Latency Memory</span>
            </div>
          </div>

          {/* Feature Rows */}
          <div className="space-y-24">

            {/* Feature 1: Autonomous Research Agent */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 border-b border-[#E5E5DF]">
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold font-sds-content text-[#171717] tracking-tight">Research agent</h3>
                <ul className="space-y-4 text-xl sm:text-2xl text-slate-900 list-disc pl-6 font-semibold leading-relaxed">
                  <li>Built for high-stakes decisions and rigorous academic workflows.</li>
                  <li>Executes a multi-step ROS pipeline with active Chain-of-Thought (CoT) reasoning.</li>
                  <li>Creates fully cited, zero-hallucination syntheses grounded directly in literature.</li>
                </ul>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate('/features/agent')}
                    className="inline-flex items-center gap-2 text-[#315CFF] hover:text-[#2547d0] font-black text-base transition-colors cursor-pointer"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7 w-full aspect-[2186/1080] rounded-[16px] overflow-hidden shadow-md border border-[#E5E5DF] bg-white group hover:border-[#315CFF] hover:shadow-lg transition-all relative">
                <img 
                  src="/gif/research_agent.gif" 
                  alt="Research agent demonstration" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 2: Vision RAG - See What's Hidden in PDFs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 border-b border-[#E5E5DF]">
              <div className="lg:col-span-5 space-y-6 lg:order-last">
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sds-content text-[#171717] tracking-tight">See what's hidden in PDFs</h3>
                <ul className="space-y-4 text-xl sm:text-2xl text-slate-900 list-disc pl-6 font-semibold leading-relaxed">
                  <li>Automatically extracts charts, figures, and sequence diagrams directly from source PDFs.</li>
                  <li>Makes visual evidence queryable inside your research chat session.</li>
                  <li>Deep-links citations to specific visual positions in the documents.</li>
                </ul>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate('/features/vision-rag')}
                    className="inline-flex items-center gap-2 text-[#315CFF] hover:text-[#2547d0] font-black text-base transition-colors cursor-pointer"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7 w-full aspect-[2186/1080] rounded-[16px] overflow-hidden shadow-md border border-[#E5E5DF] bg-white group hover:border-[#315CFF] hover:shadow-lg transition-all relative">
                <img 
                  src="/gif/see_whats_hidden_in_pdfs.gif" 
                  alt="See what's hidden in PDFs demonstration" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 3: Multi-Source Discovery */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 border-b border-[#E5E5DF]">
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sds-content text-[#171717] tracking-tight">Grounded in 138M+ papers</h3>
                <ul className="space-y-4 text-xl sm:text-2xl text-slate-900 list-disc pl-6 font-semibold leading-relaxed">
                  <li>Queries NCBI, PubMed, arXiv, and OpenAlex simultaneously in one search.</li>
                  <li>Cascades results into a clean, unified waterfall feed ranked by academic weight.</li>
                  <li>Filters out low-quality preprints and highlights peer-reviewed status.</li>
                </ul>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate('/features/discovery')}
                    className="inline-flex items-center gap-2 text-[#315CFF] hover:text-[#2547d0] font-black text-base transition-colors cursor-pointer"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7 w-full aspect-[2186/1080] rounded-[16px] overflow-hidden shadow-md border border-[#E5E5DF] bg-white group hover:border-[#315CFF] hover:shadow-lg transition-all relative">
                <img 
                  src="/gif/grounded_in_138m_papers.gif" 
                  alt="Grounded in 138M+ papers demonstration" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 4: Scholarship & News Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 border-b border-[#E5E5DF]">
              <div className="lg:col-span-5 space-y-6 lg:order-last">
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sds-content text-[#171717] tracking-tight">Scholarship & literature hub</h3>
                <ul className="space-y-4 text-xl sm:text-2xl text-slate-900 list-disc pl-6 font-semibold leading-relaxed">
                  <li>Matches your academic profile against global funding like DAAD and Erasmus.</li>
                  <li>Delivers daily, AI-summarized literature news personalized to your domain interests.</li>
                  <li>Keeps you updated on breakthroughs with domain-specific smart alerts.</li>
                </ul>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate('/features/hub')}
                    className="inline-flex items-center gap-2 text-[#315CFF] hover:text-[#2547d0] font-black text-base transition-colors cursor-pointer"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7 w-full aspect-[2186/1080] rounded-[16px] overflow-hidden shadow-md border border-[#E5E5DF] bg-white group hover:border-[#315CFF] hover:shadow-lg transition-all relative">
                <img 
                  src="/gif/scholarship_literature_hub.gif" 
                  alt="Scholarship & literature hub demonstration" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 5: Guided Research Academy */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 border-b border-[#E5E5DF]">
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sds-content text-[#171717] tracking-tight">Guided research academy</h3>
                <ul className="space-y-4 text-xl sm:text-2xl text-slate-900 list-disc pl-6 font-semibold leading-relaxed">
                  <li>Learn systematic research methodologies, paper writing, and meta-analyses.</li>
                  <li>Go through interactive modules with real-time feedback from an AI Mentor.</li>
                  <li>Build academic masteries and verify your scientific credentials.</li>
                </ul>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate('/features/academy')}
                    className="inline-flex items-center gap-2 text-[#315CFF] hover:text-[#2547d0] font-black text-base transition-colors cursor-pointer"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7 w-full aspect-[2186/1080] rounded-[16px] overflow-hidden shadow-md border border-[#E5E5DF] bg-white group hover:border-[#315CFF] hover:shadow-lg transition-all relative">
                <img 
                  src="/gif/guided_research_academy.gif" 
                  alt="Guided research academy demonstration" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 6: Auditor & Shareable Audits */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16">
              <div className="lg:col-span-5 space-y-6 lg:order-last">
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sds-content text-[#171717] tracking-tight">Verify and share research audits</h3>
                <ul className="space-y-4 text-xl sm:text-2xl text-slate-900 list-disc pl-6 font-semibold leading-relaxed">
                  <li>Run detailed, verification-backed audits on paper claims, calculations, and data consistency.</li>
                  <li>Share completed audit links publicly with other researchers, publishers, or journals.</li>
                  <li>Transparent audit logs showing verification passes or discrepancies.</li>
                </ul>
                <div className="pt-2">
                  <button 
                    onClick={() => navigate('/features/auditor')}
                    className="inline-flex items-center gap-2 text-[#315CFF] hover:text-[#2547d0] font-black text-base transition-colors cursor-pointer"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7 w-full aspect-[2186/1080] rounded-[16px] overflow-hidden shadow-md border border-[#E5E5DF] bg-white group hover:border-[#315CFF] hover:shadow-lg transition-all relative">
                <img 
                  src="/gif/verify_and_share_research_audits.gif" 
                  alt="Verify and share research audits demonstration" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Available Everywhere */}
      <section className="py-32 relative z-10 border-t border-[#E5E5DF] bg-sds-bg/50">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Research on Any Device</h2>
            <p className="text-slate-700 font-medium max-w-2xl mx-auto">ScholarHub AI is built to seamlessly sync across all your devices, giving you access to your library wherever you go.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-[#F3F3EF]/40 border border-[#E5E5DF] rounded-[12px] p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={40} />
              </div>
              <h3 className="text-2xl font-black mb-4">Web</h3>
              <p className="text-slate-700 font-medium leading-relaxed">Access instantly via any browser. No installation required for immediate discovery.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#F3F3EF]/40 border border-[#E5E5DF] rounded-[12px] p-8 text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">New</span>
              </div>
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <Monitor size={40} />
              </div>
              <h3 className="text-2xl font-black mb-4">Desktop App</h3>
              <p className="text-slate-700 font-medium leading-relaxed">Full-screen focus mode for deep research. Optimized for Windows.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#F3F3EF]/40 border border-[#E5E5DF] rounded-[12px] p-8 text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">New</span>
              </div>
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone size={40} />
              </div>
              <h3 className="text-2xl font-black mb-4">Mobile App</h3>
              <p className="text-slate-700 font-medium leading-relaxed">Carry your library in your pocket. Seamless research on the go.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section C: How It Works */}
      <section id="tutorial" className="py-32 bg-sds-bg/80 relative z-10 border-t border-[#E5E5DF]">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
              <img src="/gif.gif" alt="App Demo Workflow" className="rounded-[12px] shadow-sm border border-[#E5E5DF] relative z-10 w-full object-cover aspect-[4/3] bg-[#F3F3EF]" onError={(e) => e.target.src='https://placehold.co/800x600/1e293b/3b82f6?text=Demo+GIF+Placeholder'} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-10">How It Works</h2>
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Search Your Niche</h4>
                    <p className="text-slate-700 font-medium">Input your core topic. Our semantic engine retrieves the most relevant, peer-reviewed global papers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">AI Synthesis & Analysis</h4>
                    <p className="text-slate-700 font-medium">Llama 3.1 reads through the PDFs, extracting methodologies, results, and critical insights automatically.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Generate Literature Review</h4>
                    <p className="text-slate-700 font-medium">Export a formatted, properly cited literature review or identify distinct research gaps with one click.</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#E5E5DF] shadow-sm">
                <iframe 
                  src="https://www.youtube.com/embed/7RjTeYbRYfI?rel=0" 
                  title="Full Tutorial" 
                  className="w-full h-full object-cover bg-sds-bg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section Component */}
      <Testimonials />

      {/* 3D Success Hall Entry */}
      <section className="relative z-20 w-full mt-20 mb-20 py-24 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent border-y border-indigo-500/10 overflow-hidden">
        <div className="w-full 2xl:px-12 mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-sds-text tracking-tight">Explore Researcher Activities & Success</h2>
          <p className="text-slate-700 font-medium mb-14 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Step inside our immersive 3D dimension to see real-time updates, community breakthroughs, and success stories from researchers using ScholarHub AI.
          </p>
          
          <div className="relative inline-flex items-center justify-center w-full md:w-auto">
            {/* Left Decorative Element (Desktop) */}
            <motion.div 
              animate={{ y: [10, -10, 10], rotate: [-5, 5, -5] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:flex absolute -left-32 top-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl items-center justify-center text-blue-400 shadow-sm shadow-blue-500/20"
            >
              <Book size={28} />
            </motion.div>

            {/* The Breathing Hero CTA */}
            <div className="relative w-full md:w-auto inline-block group">
              {/* Continuous Breathing Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-[25px] opacity-50 animate-pulse rounded-full group-hover:opacity-50 transition-opacity: 0y duration-500"></div>
              
              <button 
                onClick={() => navigate('/success-stories')} 
                className="relative w-full md:w-auto px-10 md:px-12 py-5 bg-blue-600 hover:bg-blue-700 text-sds-text rounded-full font-black uppercase tracking-widest text-sm md:text-base shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-3 border border-white/20"
              >
                <Sparkles className="text-blue-200" size={24} />
                <span>🌐 ENTER THE 3D ACTIVITY HUB</span>
              </button>
            </div>

            {/* Right Decorative Element (Desktop) */}
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [5, -5, 5] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:flex absolute -right-32 top-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/20"
            >
              <Atom size={28} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section D: Pricing Preview */}
      <section className="py-32 relative z-10 border-t border-[#E5E5DF]">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-slate-700 font-medium max-w-2xl mx-auto">No hidden fees. Upgrade when your research demands it.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16 w-full max-w-7xl mx-auto px-6">
            <div className="bg-[#F3F3EF]/40 border border-[#E5E5DF] rounded-[12px] p-8 text-center flex flex-col">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-700 mb-2">Free</h3>
              <div className="text-4xl font-black mb-6">৳0<span className="text-sm text-slate-700 font-medium">/forever</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-600 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 3 AI Power-Uses / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> All databases access</li>
              </ul>
            </div>
            <div className="bg-gradient-to-b from-blue-50 to-blue-100/50 border-2 border-blue-300 rounded-[12px] p-8 text-center flex flex-col relative transform md:-translate-y-4 shadow-sm shadow-blue-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-sds-text text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Most Popular</div>
              <h3 className="text-lg font-black uppercase tracking-widest text-blue-700 mb-2 mt-2">Starter</h3>
              <div className="text-4xl font-black mb-6">৳150<span className="text-sm text-slate-700 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-600 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 50 AI Power-Uses / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> Advanced Filters & Customization</li>
              </ul>
            </div>
            <div className="bg-[#F3F3EF]/40 border border-[#E5E5DF] rounded-[12px] p-8 text-center flex flex-col">
              <h3 className="text-lg font-black uppercase tracking-widest text-amber-400 mb-2">Pro</h3>
              <div className="text-4xl font-black mb-6">৳500<span className="text-sm text-slate-700 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-600 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> 100 AI Power-Uses / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> Full Research IDE Workspace</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <button onClick={() => navigate('/pricing')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-[#E5E5DF] rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:scale-105 inline-flex items-center gap-3">
              See Full Pricing <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Section: Public Portals Gateway */}
      <section className="py-24 relative z-10 border-t border-[#E5E5DF] bg-[#FAFAF8]">
        <style>{`
          @keyframes clickPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.35); opacity: 1; }
          }
          .click-pulsar {
            animation: clickPulse 1.6s infinite ease-in-out;
          }
        `}</style>
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Open Research Portals</h2>
            <p className="text-slate-800 font-semibold max-w-3xl mx-auto text-lg leading-relaxed">
              Explore our publicly accessible portals designed to empower global scientific collaborations and career advancement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* news portal */}
            <div className="bg-white border border-[#E5E5DF] rounded-2xl p-8 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-2xs relative group">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 text-[#315CFF] rounded-xl w-fit">
                  <Megaphone size={24} />
                </div>
                <h3 className="text-3xl font-black text-[#171717]">Scientific News Digest</h3>
                <p className="text-base text-slate-700 leading-relaxed font-semibold">
                  Stay updated with daily, AI-summarized literature releases, publisher breakthroughs, and domain-specific alerts.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5DF]/60 flex items-center justify-between">
                <button
                  onClick={() => navigate('/news')}
                  className="px-6 py-3 bg-[#315CFF] text-white rounded-lg text-sm font-extrabold transition-all shadow-xs hover:bg-[#2547d0] cursor-pointer inline-flex items-center gap-2 relative overflow-visible"
                >
                  <span>Access News Feed</span>
                  <ArrowRight size={14} />
                  {/* Clicking Indicator pointer */}
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-[#E5E5DF] shadow-sm">
                    <span className="click-pulsar absolute inline-flex h-3.5 w-3.5 rounded-full bg-[#315CFF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#315CFF]"></span>
                  </span>
                </button>
              </div>
            </div>

            {/* opportunities portal */}
            <div className="bg-white border border-[#E5E5DF] rounded-2xl p-8 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-2xs relative group">
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl w-fit">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-3xl font-black text-[#171717]">Opportunities Matcher</h3>
                <p className="text-base text-slate-700 leading-relaxed font-semibold">
                  Scrapes global institutions (DAAD, Erasmus, EURAXESS) to match researcher profiles against live PhD and Postdoc positions.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5DF]/60 flex items-center justify-between">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="px-6 py-3 bg-[#315CFF] text-white rounded-lg text-sm font-extrabold transition-all shadow-xs hover:bg-[#2547d0] cursor-pointer inline-flex items-center gap-2 relative overflow-visible"
                >
                  <span>Browse Opportunities</span>
                  <ArrowRight size={14} />
                  {/* Clicking Indicator pointer */}
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-[#E5E5DF] shadow-sm">
                    <span className="click-pulsar absolute inline-flex h-3.5 w-3.5 rounded-full bg-[#315CFF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#315CFF]"></span>
                  </span>
                </button>
              </div>
            </div>

            {/* academy portal */}
            <div className="bg-white border border-[#E5E5DF] rounded-2xl p-8 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-2xs relative group">
              <div className="space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl w-fit">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-3xl font-black text-[#171717]">Guided Research Academy</h3>
                <p className="text-base text-slate-700 leading-relaxed font-semibold">
                  Interactive curricula covering meta-analyses, proposal composition, and writing steps guided by our AI Mentor.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5DF]/60 flex items-center justify-between">
                <button
                  onClick={() => navigate('/academy')}
                  className="px-6 py-3 bg-[#315CFF] text-white rounded-lg text-sm font-extrabold transition-all shadow-xs hover:bg-[#2547d0] cursor-pointer inline-flex items-center gap-2 relative overflow-visible"
                >
                  <span>Enter Academy Workspace</span>
                  <ArrowRight size={14} />
                  {/* Clicking Indicator pointer */}
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-[#E5E5DF] shadow-sm">
                    <span className="click-pulsar absolute inline-flex h-3.5 w-3.5 rounded-full bg-[#315CFF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#315CFF]"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section E: Community Integration */}
      <section className="py-32 relative z-10 border-t border-[#E5E5DF] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-[#5865F2]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2]/10 text-[#5865F2] text-xs font-black uppercase tracking-widest mb-6 border border-[#5865F2]/20">
                <MessageSquare size={14} /> Join Discord
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Join Our Research Community</h2>
              <p className="text-slate-700 font-medium mb-10 text-lg">Connect with global peers, get direct support from the developers, and stay updated on the latest AI capabilities added to ScholarHub.</p>
              <a 
                href="https://discord.gg/6p2zTMNK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-5 bg-[#5865F2] hover:bg-[#4752C4] text-sds-text rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm shadow-[#5865F2]/20 hover:scale-105 hover:-translate-y-1"
              >
                Accept Invite <ArrowRight size={18} />
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-center lg:justify-end">
              <div className="p-4 bg-sds-bg/50 backdrop-blur-xl border border-[#E5E5DF] rounded-[12px] shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#5865F2]/20 to-transparent opacity-50 group-hover:opacity-50 transition-opacity: 0y duration-500 pointer-events-none"></div>
                <iframe src="https://discord.com/widget?id=1487496436391346208&theme=dark" width="350" height="500" allowtransparency="true" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" className="rounded-xl relative z-10 w-full max-w-[350px]"></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative z-10 border-t border-[#E5E5DF]">
        <div className="w-full max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-700 font-medium">Quick answers to common questions about ScholarHub AI.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white border border-[#E5E5DF] rounded-2xl overflow-hidden transition-colors hover:border-slate-600/60">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span className="text-base font-bold text-sds-text">{item.q}</span>
                  <ChevronDown size={18} className={`text-slate-700 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm text-slate-700 font-medium leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
      <CookieBanner />
    </div>
  )
}

export default LandingPage
