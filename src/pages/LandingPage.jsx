import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, ArrowRight, Activity, Users, Database, Globe, Megaphone, X, Play, Brain, CheckCircle2, Server, MessageSquare, Smartphone, Monitor, Zap } from 'lucide-react'
import { supabase } from '../supabaseClient'
import logo from '../assets/images/logo.png'
import Footer from '../Footer'
import Navbar from '../components/Navbar'

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
        {announcement && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`absolute top-24 left-0 w-full z-40 py-3 px-6 flex items-center justify-between gap-3 text-sm font-bold shadow-md border-b backdrop-blur-md overflow-hidden ${
              announcement.type === 'warning' ? 'bg-amber-900/50 text-amber-300 border-amber-800' :
              announcement.type === 'success' ? 'bg-green-900/50 text-green-300 border-green-800' :
              'bg-blue-900/50 text-blue-300 border-blue-800'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              <Megaphone size={16} className="animate-bounce shrink-0" />
              <span className="truncate">{announcement.message}</span>
            </div>
            <button 
              onClick={() => {
                sessionStorage.setItem('dismissed_announcement', announcement.id.toString())
                setAnnouncement(null)
              }} 
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
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
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
            ScholarHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">AI</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            The AI-Powered Discovery Hub for Global Researchers. Whether you call it ScholarHub or a Hub for Scholars, we provide the ultimate intelligent platform unifying GEB, Pharmacy, Engineering, and General Literature.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
            <button 
              onClick={handleLaunch}
              disabled={user && !profile}
              className={`group px-8 py-5 w-full sm:w-auto bg-white text-slate-900 hover:bg-blue-50 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] ${user && !profile ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105'}`}
            >
              {user ? (profile ? "Go to Workspace" : "Syncing Profile...") : "Start Your Discovery"}
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
          
          <motion.div variants={itemVariants} className="mt-24 w-full max-w-5xl mx-auto">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Welcome to ScholarHub AI - Watch the Demo</h3>
            <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl shadow-blue-500/10">
              <iframe 
                src="https://www.youtube.com/embed/7RjTeYbRYfI?autoplay=0&controls=1&rel=0" 
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

      {/* Section B: The Intelligence Engine */}
      <section className="py-32 relative z-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">The Intelligence Engine</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Powered by world-class APIs and models, specifically engineered for zero-hallucination academic synthesis.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Feature 1 */}
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
            {/* Feature 2 */}
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
              <img src="/demo.gif" alt="App Demo Workflow" className="rounded-[2rem] shadow-2xl border border-slate-800 relative z-10 w-full object-cover aspect-[4/3] bg-slate-800" onError={(e) => e.target.src='https://placehold.co/800x600/1e293b/3b82f6?text=Demo+GIF+Placeholder'} />
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

      {/* Section: Academic Feedback */}
      <section className="py-32 relative z-10 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl text-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 md:p-8">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full border border-blue-100">
                Dean's Recognition
              </span>
            </div>
            <div className="mb-6 mt-8 md:mt-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-blue-600 font-serif text-3xl leading-none pt-2">"</span>
              </div>
              <p className="text-xl md:text-2xl font-serif italic text-slate-700 leading-relaxed">
                The platform looks very promising... I am truly happy to see your progress and would like to congratulate you on this impressive achievement. Your dedication and innovation are clearly reflected in the platform.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
              <div>
                <h4 className="font-black text-slate-900 text-lg">Prof. Dr. Ahmed Wasif Reza</h4>
                <p className="text-sm font-medium text-slate-500">Dean, Faculty of Sciences and Engineering, East West University</p>
              </div>
            </div>
          </motion.div>
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
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 3 AI Summaries / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 20 Saved Papers Limit</li>
              </ul>
            </div>
            <div className="bg-gradient-to-b from-blue-600/20 to-slate-800/40 border-2 border-blue-500/50 rounded-3xl p-8 text-center flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Most Popular</div>
              <h3 className="text-lg font-black uppercase tracking-widest text-blue-400 mb-2 mt-2">Starter</h3>
              <div className="text-4xl font-black mb-6">৳250<span className="text-sm text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-300 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> Enhanced Power for Your Portal</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> 30 AI Summaries / day</li>
                <li className="flex gap-3"><CheckCircle2 className="text-blue-400 shrink-0" size={18} /> Zero Search Delay</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 text-center flex flex-col">
              <h3 className="text-lg font-black uppercase tracking-widest text-amber-400 mb-2">Pro</h3>
              <div className="text-4xl font-black mb-6">৳1000<span className="text-sm text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-slate-300 text-left">
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> ALL Portals Unlocked</li>
                <li className="flex gap-3"><CheckCircle2 className="text-amber-400 shrink-0" size={18} /> 300+ AI Summaries / day</li>
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

      <Footer />
    </div>
  )
}

export default LandingPage
