import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, ArrowRight, Activity, Users, Database, Globe, Megaphone, X, Play, Brain, CheckCircle2, Server, MessageSquare, Smartphone, Monitor, Zap, ChevronLeft, ChevronRight, ChevronDown, Book, Atom, Sparkles, Shield, Timer, GraduationCap, AlertTriangle } from 'lucide-react'
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
    { q: 'How is ScholarHub AI different from ChatGPT?', a: 'Unlike generic AI chatbots, ScholarHub AI is grounded in real academic data. Every answer is synthesized directly from peer-reviewed papers retrieved in real time from NCBI, arXiv, and OpenAlex — so you never get hallucinated citations or fabricated sources.' },
    { q: 'What sources do you use?', a: 'We aggregate results from three of the world\'s largest academic databases: NCBI (PubMed/PMC) for biomedical literature, arXiv for preprints in STEM fields, and OpenAlex for broad interdisciplinary coverage spanning 230M+ scholarly works.' },
    { q: 'Is there a device limit?', a: 'Yes. For security and fair-use purposes, each account can be active on a maximum of 2 devices simultaneously. You can log out of one device to free up a slot at any time.' },
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  const renderTextWithLinks = (text, type) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    let linkClass = 'underline hover:opacity-80 transition-opacity font-bold break-all ';
    if (type === 'warning') linkClass += 'text-amber-700';
    else if (type === 'success') linkClass += 'text-green-700';
    else linkClass += 'text-blue-600';

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass} onClick={(e) => e.stopPropagation()}>{part}</a>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
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
            className={`cursor-pointer absolute top-24 left-0 w-full z-40 py-3 px-6 flex items-center justify-between gap-3 text-sm font-bold shadow-md border-b backdrop-blur-md overflow-hidden transition-colors hover:opacity-90 ${
              announcement.type === 'warning' ? 'bg-amber-900/50 text-amber-300 border-amber-800 hover:bg-amber-900/70' :
              announcement.type === 'success' ? 'bg-green-900/50 text-green-300 border-green-800 hover:bg-green-900/70' :
              'bg-blue-900/50 text-blue-300 border-blue-800 hover:bg-blue-900/70'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              <Megaphone size={16} className="animate-bounce shrink-0" />
              <span className="truncate">{announcement.title ? `${announcement.title} - ${announcement.message}` : announcement.message}</span>
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem(`has_seen_popup_${announcement.id}`, 'true');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative rounded-[2rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden ${
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
                <Megaphone size={32} />
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
                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${
                  announcement.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' :
                  announcement.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' :
                  'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }`}
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className={`relative z-10 ${announcement ? 'pt-56' : 'pt-48'} pb-32 px-6 flex flex-col items-center justify-center min-h-[85vh]`}>
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Globe size={14} /> Phase 5 Deployment Active
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Zap size={14} /> From the creator of Catalyst Smart Classroom
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8">
            Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">10x Faster.</span><br/>Zero Hallucinations.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            ScholarHub AI unifies NCBI, arXiv, and OpenAlex. Synthesize hundreds of peer-reviewed papers in seconds with Meta Llama 3.1 &amp; Groq LPU.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
            <button 
              onClick={handleLaunch}
              disabled={user && !profile}
              className={`group px-8 py-5 w-full sm:w-auto bg-white text-slate-900 hover:bg-blue-50 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] ${user && !profile ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105'}`}
            >
              {user ? (profile ? "Go to Workspace" : "Syncing Profile...") : "🚀 Start Researching for Free"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full sm:w-auto">
              <a 
                href="https://github.com/CodeWithPritom/ScholarHub-frontend/releases/download/v1.0.0/ScholarHub.AI.Setup.1.0.0.exe"
                className="group px-6 py-4 w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 rounded-2xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:scale-105"
              >
                <Monitor size={16} className="text-blue-400 group-hover:-translate-y-1 transition-transform" />
                Download for Windows
              </a>
              <a 
                href="https://github.com/CodeWithPritom/ScholarHub-frontend/releases/download/v1.0.0/ScholarHub.AI.apk"
                className="group px-6 py-4 w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 rounded-2xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:scale-105"
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
          <motion.div variants={itemVariants} className="mt-24 w-full max-w-5xl mx-auto">
            <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-slate-700/60 shadow-2xl shadow-blue-500/10">
              <iframe 
                src="https://www.youtube.com/embed/uA6XPPecG5k?autoplay=0&controls=1&rel=0" 
                title="ScholarHub AI Demo" 
                className="absolute inset-0 w-full h-full object-cover bg-slate-900"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Live Intelligence Stats */}
      <section className="relative z-10 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center relative">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-3xl font-black flex items-center gap-3">
                  {liveUsersCount}
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Researchers</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <div className="text-3xl font-black">{totalMembersCount.toLocaleString()}+</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Members</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                <Database size={24} />
              </div>
              <div>
                <div className="text-3xl font-black">230M+</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Papers Indexed</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Not ChatGPT? — Competitive Comparison */}
      <section className="py-24 relative z-10 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Why Not Just Use <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">ChatGPT</span>?</h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">Generic AI tools aren't built for academic research. Here's the difference.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            {/* Generic AI Column */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center"><AlertTriangle size={20} /></div>
                <h3 className="text-xl font-black text-red-400">Generic AI (ChatGPT, etc.)</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> Hallucinates citations & fabricates sources</li>
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> Training data cutoff — no real-time papers</li>
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> No direct access to NCBI, arXiv, or OpenAlex</li>
                <li className="flex gap-3 items-start"><X size={16} className="text-red-400 shrink-0 mt-0.5" /> Cannot verify or cross-reference claims</li>
              </ul>
            </div>
            {/* ScholarHub AI Column */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                <h3 className="text-xl font-black text-emerald-400">ScholarHub AI</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-slate-300">
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Grounded answers from real peer-reviewed papers</li>
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Real-time access to live academic databases</li>
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Unified search across NCBI, arXiv & OpenAlex</li>
                <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> Every claim linked to its source with DOI</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-32 relative z-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Core Features</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Engineered for zero-hallucination academic synthesis, powered by world-class models.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 mb-10">
            {/* Multi-source Waterfall */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 group hover:border-blue-500/30 transition-colors">
              <Database className="text-blue-400 mb-5" size={36} />
              <h3 className="text-xl font-black mb-3">Multi-Source Waterfall</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Query NCBI, arXiv & OpenAlex simultaneously. Results cascade in a unified waterfall feed, ranked by relevance and recency.</p>
            </motion.div>
            {/* AI Outreach */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 group hover:border-indigo-500/30 transition-colors">
              <Megaphone className="text-indigo-400 mb-5" size={36} />
              <h3 className="text-xl font-black mb-3">AI Outreach</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Generate professional outreach emails to paper authors with one click. Connect with researchers and potential mentors globally.</p>
            </motion.div>
            {/* Smart Truncation */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 group hover:border-emerald-500/30 transition-colors">
              <Zap className="text-emerald-400 mb-5" size={36} />
              <h3 className="text-xl font-black mb-3">Smart Truncation</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Intelligent context windowing extracts the most relevant sections from lengthy papers, maximizing synthesis quality within token limits.</p>
            </motion.div>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Unified Knowledge Portals */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10">
              <Server className="text-blue-500 mb-6" size={40} />
              <h3 className="text-2xl font-black mb-4">Unified Knowledge Portals</h3>
              <p className="text-slate-400 mb-8 font-medium leading-relaxed">We aggregate and connect 8 specialized academic databases into a single queryable source.</p>
              <div className="flex flex-wrap gap-3">
                {['GEB', 'PHARMACY', 'ENGINEERING', 'PHYSICS', 'MATHEMATICS', 'SOCIAL SCIENCE', 'LAW', 'CHEMISTRY'].map(portal => (
                  <span key={portal} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-full text-xs font-bold uppercase tracking-wider text-slate-300">
                    {portal}
                  </span>
                ))}
              </div>
            </motion.div>
            {/* Powered by Llama */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500 pointer-events-none"><Brain size={250} /></div>
              <Brain className="text-indigo-400 mb-6 relative z-10" size={40} />
              <h3 className="text-2xl font-black mb-4 relative z-10">Powered by Llama 3.1 <span className="text-indigo-400">(8B Instruct)</span></h3>
              <p className="text-slate-400 mb-8 font-medium leading-relaxed relative z-10">We utilize the latest state-of-the-art open models. Llama 3.1 provides a massive context window with zero-hallucination guardrails—meaning it answers strictly based on the provided papers at lightning-fast inference speeds.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Available Everywhere */}
      <section className="py-32 relative z-10 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Research on Any Device</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">ScholarHub AI is built to seamlessly sync across all your devices, giving you access to your library wherever you go.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Web</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Access instantly via any browser. No installation required for immediate discovery.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">New</span>
              </div>
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <Monitor size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Desktop App</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Full-screen focus mode for deep research. Optimized for Windows.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">New</span>
              </div>
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Mobile App</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Carry your library in your pocket. Seamless research on the go.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section C: How It Works */}
      <section id="tutorial" className="py-32 bg-slate-900/80 relative z-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
              <img src="/gif.gif" alt="App Demo Workflow" className="rounded-[2rem] shadow-2xl border border-slate-800 relative z-10 w-full object-cover aspect-[4/3] bg-slate-800" onError={(e) => e.target.src='https://placehold.co/800x600/1e293b/3b82f6?text=Demo+GIF+Placeholder'} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-10">How It Works</h2>
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Search Your Niche</h4>
                    <p className="text-slate-400 font-medium">Input your core topic. Our semantic engine retrieves the most relevant, peer-reviewed global papers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">AI Synthesis & Analysis</h4>
                    <p className="text-slate-400 font-medium">Llama 3.1 reads through the PDFs, extracting methodologies, results, and critical insights automatically.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Generate Literature Review</h4>
                    <p className="text-slate-400 font-medium">Export a formatted, properly cited literature review or identify distinct research gaps with one click.</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <iframe 
                  src="https://www.youtube.com/embed/7RjTeYbRYfI?rel=0" 
                  title="Full Tutorial" 
                  className="w-full h-full object-cover bg-slate-900"
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
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">Explore Researcher Activities & Success</h2>
          <p className="text-slate-400 font-medium mb-14 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Step inside our immersive 3D dimension to see real-time updates, community breakthroughs, and success stories from researchers using ScholarHub AI.
          </p>
          
          <div className="relative inline-flex items-center justify-center w-full md:w-auto">
            {/* Left Decorative Element (Desktop) */}
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:flex absolute -left-32 top-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl items-center justify-center text-blue-400 shadow-xl shadow-blue-500/20"
            >
              <Book size={28} />
            </motion.div>

            {/* The Breathing Hero CTA */}
            <div className="relative w-full md:w-auto inline-block group">
              {/* Continuous Breathing Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-[25px] opacity-60 animate-pulse rounded-full group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <button 
                onClick={() => navigate('/success-stories')} 
                className="relative w-full md:w-auto px-10 md:px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full font-black uppercase tracking-widest text-sm md:text-base shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-3 border border-white/20"
              >
                <Sparkles className="text-blue-200" size={24} />
                <span>🌐 ENTER THE 3D ACTIVITY HUB</span>
              </button>
            </div>

            {/* Right Decorative Element (Desktop) */}
            <motion.div 
              animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:flex absolute -right-32 top-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/20"
            >
              <Atom size={28} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section D: Pricing Preview */}
      <section className="py-32 relative z-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">No hidden fees. Upgrade when your research demands it.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 text-center flex flex-col">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-2">Free</h3>
              <div className="text-4xl font-black mb-6">৳0<span className="text-sm text-slate-500 font-medium">/forever</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-300 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> Access to 1 Specialized Portal</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 3 AI Power-Uses / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 20 Saved Papers Limit</li>
              </ul>
            </div>
            <div className="bg-gradient-to-b from-blue-600/20 to-slate-800/40 border-2 border-blue-500/50 rounded-3xl p-8 text-center flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Most Popular</div>
              <h3 className="text-lg font-black uppercase tracking-widest text-blue-400 mb-2 mt-2">Starter</h3>
              <div className="text-4xl font-black mb-6">৳150<span className="text-sm text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-300 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> Enhanced Power for Your Portal</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 50 AI Power-Uses / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> Zero Search Delay</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 text-center flex flex-col">
              <h3 className="text-lg font-black uppercase tracking-widest text-amber-400 mb-2">Pro</h3>
              <div className="text-4xl font-black mb-6">৳500<span className="text-sm text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-300 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> ALL Portals Unlocked</li>
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> 100 AI Power-Uses / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> Priority Discord Support</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <button onClick={() => navigate('/pricing')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:scale-105 inline-flex items-center gap-3">
              See Full Pricing <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Section E: Community Integration */}
      <section className="py-32 relative z-10 border-t border-slate-800 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-[#5865F2]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2]/10 text-[#5865F2] text-xs font-black uppercase tracking-widest mb-6 border border-[#5865F2]/20">
                <MessageSquare size={14} /> Join Discord
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Join Our Research Community</h2>
              <p className="text-slate-400 font-medium mb-10 text-lg">Connect with global peers, get direct support from the developers, and stay updated on the latest AI capabilities added to ScholarHub.</p>
              <a 
                href="https://discord.gg/6p2zTMNK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-[#5865F2]/20 hover:scale-105 hover:-translate-y-1"
              >
                Accept Invite <ArrowRight size={18} />
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-center lg:justify-end">
              <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#5865F2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <iframe src="https://discord.com/widget?id=1487496436391346208&theme=dark" width="350" height="500" allowtransparency="true" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" className="rounded-xl relative z-10 w-full max-w-[350px]"></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative z-10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 font-medium">Quick answers to common questions about ScholarHub AI.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden transition-colors hover:border-slate-600/60">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span className="text-base font-bold text-white">{item.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
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
                      <p className="px-6 pb-6 text-sm text-slate-400 font-medium leading-relaxed">{item.a}</p>
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
