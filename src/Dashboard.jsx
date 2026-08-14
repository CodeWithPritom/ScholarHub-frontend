import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  Database, 
  Search,
  Sparkles,
  FolderPlus,
  Dna,
  ArrowUpRight,
  Globe,
  BookOpen,
  Zap,
  Shield,
  ExternalLink,
  Heart,
  Code2,
  ChevronRight,
  RefreshCcw,
  Clock
} from 'lucide-react'
import { supabase } from './supabaseClient'
import AuthModal from './AuthModal'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
}

const Dashboard = ({ liveUsersCount, user, profile }) => {
  const navigate = useNavigate()
  const [totalUsers, setTotalUsers] = useState(0)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userName, setUserName] = useState('')
  const [academicField, setAcademicField] = useState(profile?.academic_field || 'Genetic Eng. & Biotech (GEB)')

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchTotalUsers()
  }, [])

  useEffect(() => {
    if (profile?.academic_field) {
      setAcademicField(profile.academic_field);
    }
  }, [profile])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, academic_field')
            .eq('id', user.id)
            .maybeSingle()
          if (!error && data) {
            if (data.full_name) setUserName(data.full_name)
            if (data.academic_field) setAcademicField(data.academic_field)
          } else {
            setUserName(user.email?.split('@')[0])
          }
        } catch (err) {
          setUserName(user.email?.split('@')[0])
        }
      }
    }
    fetchUserProfile()
  }, [user])

 const fetchTotalUsers = async () => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }); // 'id' এর বদলে '*' দিতে পারেন

    if (error) throw error;
    
    // যদি count ০ হয় তবে ০ ই দেখাবে, নাল হলে ০ দেখাবে
    setTotalUsers(count ?? 0); 
  } catch (err) {
    console.error('Error fetching total users:', err);
    setTotalUsers('—');
  } finally {
    setLoadingUsers(false);
  }
}

  const getSuggestedQueries = (field) => {
    const norm = (field || '').toLowerCase();
    if (norm.includes('biotech') || norm.includes('genetic') || norm.includes('geb')) {
      return [
        { title: 'CRISPR Gene Editing', desc: 'Efficiency of in vivo CRISPR gene editing therapies.', query: 'CRISPR gene editing efficiency in vivo' },
        { title: 'Synthetic Biology', desc: 'Pathway optimization in synthetic biology.', query: 'Synthetic biology pathway optimization' },
        { title: 'RNA Sequencing', desc: 'Single-cell RNA sequencing methodology advancements.', query: 'Single-cell RNA sequencing methods' },
        { title: 'mRNA Vaccines', desc: 'Development and trials of new mRNA vaccines.', query: 'Latest mRNA Vaccine Trials' }
      ];
    }
    if (norm.includes('medicine') || norm.includes('medical') || norm.includes('health')) {
      return [
        { title: 'mRNA Vaccine Trials', desc: 'Latest clinical trials for mRNA vaccines.', query: 'Latest mRNA Vaccine Trials' },
        { title: 'CAR-T Cell Therapy', desc: 'Recent breakthroughs in CAR-T cell cancer therapies.', query: 'CAR-T cell therapy clinical trials' },
        { title: 'Clinical AI Diagnosis', desc: 'Artificial intelligence performance in clinical settings.', query: 'Artificial intelligence in clinical diagnosis' },
        { title: 'Oncology Immunotherapy', desc: 'Recent trials in oncology immunotherapy.', query: 'Immunotherapy breakthroughs in oncology' }
      ];
    }
    if (norm.includes('pharm')) {
      return [
        { title: 'Nanoparticle Drug Delivery', desc: 'Targeted drug delivery using nanoparticles.', query: 'Targeted drug delivery nanoparticles' },
        { title: 'Pharmacogenomics', desc: 'Role of genomics in personalized medicine.', query: 'Pharmacogenomics in personalized medicine' },
        { title: 'Small Molecule Inhibitors', desc: 'Novel small molecule inhibitors for oncology.', query: 'Novel small molecule inhibitors for oncology' },
        { title: 'Monoclonal Antibodies', desc: 'Monoclonal antibody developments approved recently.', query: 'FDA approved monoclonal antibodies' }
      ];
    }
    if (norm.includes('physic')) {
      return [
        { title: 'Quantum Computing', desc: 'Quantum entanglement and computing scalability.', query: 'Quantum entanglement and computing scalability' },
        { title: 'Superconductivity', desc: 'High-temperature superconductivity mechanisms.', query: 'High-temperature superconductivity mechanisms' },
        { title: 'Dark Matter Detection', desc: 'Status of experimental dark matter detection.', query: 'Dark matter detection experiments' },
        { title: 'Fusion Confinement', desc: 'Plasma confinement in thermonuclear fusion.', query: 'Thermonuclear fusion plasma confinement' }
      ];
    }
    if (norm.includes('math')) {
      return [
        { title: 'Category Theory in CS', desc: 'Applications of category theory in CS.', query: 'Applications of category theory in computer science' },
        { title: 'Riemann Hypothesis', desc: 'Numerical verifications of Riemann hypothesis.', query: 'Riemann hypothesis numerical verifications' },
        { title: 'Mathematical Deep Learning', desc: 'Foundational mathematics of deep learning.', query: 'Deep learning mathematical foundations' },
        { title: 'Topology in Quantum ECC', desc: 'Topology in quantum error correction.', query: 'Topology in quantum error correction' }
      ];
    }
    if (norm.includes('engineer') || norm.includes('computer') || norm.includes('cs')) {
      return [
        { title: 'Neuromorphic Hardware', desc: 'Neuromorphic chips for edge computing.', query: 'Neuromorphic hardware for edge computing' },
        { title: 'Solid-State Batteries', desc: 'Energy density of solid-state batteries.', query: 'Solid-state battery energy density' },
        { title: 'Autonomous Path Planning', desc: 'Path planning algorithms in autonomous systems.', query: 'Autonomous vehicle path planning algorithms' },
        { title: 'LLM Inference Acceleration', desc: 'Accelerating large language model inference.', query: 'Large language model inference acceleration' }
      ];
    }
    if (norm.includes('chem')) {
      return [
        { title: 'Green Chemistry Catalysts', desc: 'Catalytic plastic recycling methods.', query: 'Green chemistry catalysts for plastic recycling' },
        { title: 'Perovskite Solar Cells', desc: 'Degradation mechanisms in perovskites.', query: 'Perovskite solar cell degradation mechanisms' },
        { title: 'Metal-Organic Frameworks', desc: 'Carbon capture utilizing MOFs.', query: 'Metal-organic frameworks for carbon capture' },
        { title: 'Automated Synthesis', desc: 'Robotic automated chemical synthesis.', query: 'Automated chemical synthesis using robotics' }
      ];
    }
    if (norm.includes('law') || norm.includes('legal')) {
      return [
        { title: 'AI & Copyright Fair Use', desc: 'Legal cases regarding AI and copyright.', query: 'Generative AI copyright fair use cases' },
        { title: 'LLM Data Privacy', desc: 'Data privacy regulations and LLM training.', query: 'Data privacy regulations in the LLM era' },
        { title: 'Smart Contract Enforcement', desc: 'Legal frameworks for smart contracts.', query: 'Smart contracts legal enforcement frameworks' },
        { title: 'Digital Market Antitrust', desc: 'Antitrust laws in modern tech platforms.', query: 'Antitrust regulations in digital markets' }
      ];
    }
    if (norm.includes('social')) {
      return [
        { title: 'Algorithmic Polarization', desc: 'Effect of algorithms on political polarization.', query: 'Impact of social media algorithms on polarization' },
        { title: 'Post-Pandemic Inequality', desc: 'Trends in economic inequality post-pandemic.', query: 'Economic inequality post-pandemic trends' },
        { title: 'Remote Work Psychology', desc: 'Psychological impacts of remote team structures.', query: 'Remote work psychological effects on teams' },
        { title: 'Nudges in Public Health', desc: 'Behavioral economics nudges in healthcare.', query: 'Behavioral economics nudges in public health' }
      ];
    }
    return [
      { title: 'mRNA Vaccine Trials', desc: 'Latest clinical trials for mRNA vaccines.', query: 'Latest mRNA Vaccine Trials' },
      { title: 'LLM Inference Acceleration', desc: 'Accelerating large language model inference.', query: 'Large language model inference acceleration' },
      { title: 'Quantum Computing Scaling', desc: 'Quantum entanglement and computing scalability.', query: 'Quantum entanglement and computing scalability' },
      { title: 'CRISPR Gene Editing', desc: 'Efficiency of in vivo CRISPR gene editing therapies.', query: 'CRISPR gene editing efficiency in vivo' }
    ];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100/80">
        <div className="w-full 2xl:px-12 mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Dna size={20} />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
              ScholarHub <span className="text-blue-600">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/resources" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Resources</Link>
            {user ? (
              <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest">
                Welcome, {userName || 'User'}
              </span>
            ) : (
              <Link to="/auth" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Login</Link>
            )}
            <button 
              onClick={() => navigate('/research')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Launch App
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        {/* Ambient background decorations */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-[200px] h-[200px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full 2xl:px-12 mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Next-Generation Research Platform
              </span>
            </div>
          </motion.div>

          <motion.h1 
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8"
          >
            SCHOLARHUB AI:
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Advanced Research Hub
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium mb-12"
          >
            Real-time PubMed synchronization, AI-powered synthesis, and intelligent library management — 
            built for the modern biomedical researcher.
          </motion.p>

          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/research')}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-[0.15em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 group"
            >
              <Zap size={18} className="group-hover:rotate-12 transition-transform" />
              Start Research Now
              <ArrowUpRight size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Link 
              to="/resources"
              className="px-8 py-5 bg-white text-slate-600 rounded-2xl text-sm font-black uppercase tracking-[0.15em] border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-3"
            >
              <Globe size={18} />
              Explore Resources
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex flex-wrap items-center justify-center gap-6 mt-16"
          >
            {[
              { icon: <Shield size={14} />, text: 'Globally Verified' },
              { icon: <Database size={14} />, text: '35M+ Papers' },
              { icon: <Sparkles size={14} />, text: 'AI-Powered' },
              { icon: <Activity size={14} className="text-green-500" />, text: 'DB Operational (RLS Active)', border: 'border-green-100', bg: 'bg-green-50', textColor: 'text-green-600' },
            ].map((badge, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${badge.bg || 'bg-white'} ${badge.border || 'border-slate-100'}`}>
                <span className={badge.textColor || 'text-blue-500'}>{badge.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${badge.textColor || 'text-slate-500'}`}>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. STATS SECTION — 3 Cards
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="w-full 2xl:px-12 mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-slate-900 text-white uppercase tracking-widest mb-4">
              <Activity size={12} /> Platform Metrics
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Live System <span className="text-blue-600">Intelligence</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Card 1: Live Researchers */}
            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 p-10 rounded-[12px] shadow-sm overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.2em]">Real-Time</span>
                </div>
                <h3 className="text-6xl font-black text-white mb-3 tracking-tight">{liveUsersCount}</h3>
                <p className="text-sm font-bold text-emerald-200 uppercase tracking-widest">Live Researchers</p>
              </div>
            </motion.div>

            {/* Card 2: Total Members */}
            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="relative bg-white p-10 rounded-[12px] border border-[#E5E5DF] shadow-sm overflow-hidden group hover:border-[#315CFF]/30 transition-colors"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users size={80} className="text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Registered</span>
                </div>
                <h3 className="text-6xl font-black text-slate-900 mb-3 tracking-tight">
                  {loadingUsers ? <span className="text-slate-200 animate-pulse">...</span> : totalUsers}
                </h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Members</p>
              </div>
            </motion.div>

            {/* Card 3: Global Papers Indexed */}
            <motion.div 
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
              className="relative bg-white p-10 rounded-[12px] border border-[#E5E5DF] shadow-sm overflow-hidden group hover:border-[#315CFF]/30 transition-colors"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Database size={80} className="text-indigo-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">PubMed Sync</span>
                </div>
                <h3 className="text-6xl font-black text-[#171717] mb-3 tracking-tight">35M<span className="text-indigo-600">+</span></h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Papers Indexed</p>
              </div>
            </motion.div>

          </div>

          {/* Live Intelligence — Suggested Queries based on Academic Field */}
          <div className="mt-16 pt-16 border-t border-[#E5E5DF]">
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              Live Intelligence Suggestions for <span className="text-blue-400 font-extrabold">{academicField}</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getSuggestedQueries(academicField).map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate(`/research?q=${encodeURIComponent(item.query)}`)}
                  className="bg-white p-6 rounded-[12px] border border-[#E5E5DF] hover:border-[#315CFF]/30 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-base font-bold text-[#171717] group-hover:text-[#315CFF] transition-colors mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Search Now <ArrowUpRight size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. GUIDE SECTION — 1-2-3 Steps
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="w-full 2xl:px-12 mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest mb-4">
              <BookOpen size={12} /> Platform Workflow Guide
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Mastering Your <span className="text-blue-600">Research</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              We've designed a powerful 4-step workflow to maximize your productivity. Follow this guide to fully utilize caching, AI, and library management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 relative">
            
            {/* Step 1 */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="relative bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Search size={24} className="text-white" />
              </div>
              <div className="absolute top-10 right-10 text-7xl font-black text-slate-100 group-hover:text-blue-100 transition-colors select-none">1</div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Search & Smart Caching</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Enter any biomedical keyword. Your search results are instantly securely cached in your session. This means if you re-visit the same query, it loads instantly without any API calls, ensuring lightning-fast performance.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="relative bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-400/25 group-hover:rotate-180 transition-transform duration-700">
                <RefreshCcw size={24} className="text-white" />
              </div>
              <div className="absolute top-10 right-10 text-7xl font-black text-blue-100 group-hover:text-blue-200 transition-colors select-none">2</div>
              <h3 className="text-xl font-black text-blue-900 mb-3 tracking-tight">Refresh for Latest Data</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Since results are cached, you might miss newer publications. To fetch the absolute latest global releases, click the <strong className="text-blue-700">"Refresh for Latest Data"</strong> button in the search bar. This clears your local cache and securely pulls fresh data directly from global databases.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
              className="relative bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="absolute top-10 right-10 text-7xl font-black text-slate-100 group-hover:text-indigo-100 transition-colors select-none">3</div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">AI & Advanced Filtering</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Once your data is loaded, utilize our LLM intelligence to generate executive summaries. Apply clinical filters, sort by date/relevance, and chat with the AI chatbot to get synthesized insights instantly.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}
              className="relative bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <FolderPlus size={24} className="text-white" />
              </div>
              <div className="absolute top-10 right-10 text-7xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors select-none">4</div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Curate Your Library</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Save and organize your favorite papers into custom database albums. From your library, you can auto-generate APA, MLA, or Harvard citations and export your collections seamlessly.
              </p>
            </motion.div>
          </div>

          {/* CTA below guide */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} className="text-center mt-16">
            <button 
              onClick={() => navigate('/research')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 group"
            >
              Try It Now
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. MULTI-COLUMN FOOTER
      ═══════════════════════════════════════════════ */}
      <footer className="bg-[#F3F3EF] text-[#171717] border-t border-[#E5E5DF] pt-20 pb-10 px-6">
        <div className="w-full 2xl:px-12 mx-auto">
          <div className="grid md:grid-cols-3 gap-16 mb-16">

            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Dna size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-bold tracking-tight leading-none text-[#171717]">ScholarHub <span className="text-[#315CFF]">AI</span></h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Advanced Research Hub</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6">
                A next-generation bioinformatics portal bridging PubMed's 35M+ paper database with AI-powered synthesis, 
                built to accelerate scientific discovery for university researchers worldwide.
              </p>
              <div className="flex items-center gap-3 text-slate-500">
                <span className="text-[9px] font-black uppercase tracking-widest">Tech Stack:</span>
                <div className="flex items-center gap-2">
                  {['React', 'FastAPI', 'Supabase'].map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-slate-700 text-[9px] font-bold rounded border border-[#E5E5DF]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Quick Links</h4>
              <nav className="space-y-3">
                {[
                  { label: 'Research Hub', path: '/research', icon: <Search size={14} /> },
                  { label: 'My Library', path: '/library', icon: <BookOpen size={14} /> },
                  { label: 'Session Archive', path: '/archive', icon: <Database size={14} /> },
                  { label: 'Resources', path: '/resources', icon: <Globe size={14} /> },
                ].map((link, i) => {
                  if (link.label === 'My Library' && !user) {
                    return (
                      <button 
                        key={i} 
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center gap-3 text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors group w-full text-left"
                      >
                        <span className="text-slate-600 group-hover:text-blue-500 transition-colors">{link.icon}</span>
                        {link.label}
                        <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400" />
                      </button>
                    )
                  }
                  
                  return (
                    <Link 
                      key={i} 
                      to={link.path}
                      className="flex items-center gap-3 text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors group"
                    >
                      <span className="text-slate-600 group-hover:text-blue-500 transition-colors">{link.icon}</span>
                      {link.label}
                      <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400" />
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">External</h5>
                <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink size={12} /> PubMed Official
                </a>
              </div>
            </div>

            {/* Column 3: Founder */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Founder & Developer</h4>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                    A
                  </div>
                  <div>
                    <h5 className="text-base font-black text-white tracking-tight">Arup Bhowmik Pritom</h5>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Full-Stack Engineer</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Engineering the intersection of bioinformatics and modern web technology to make scientific literature review intuitive, 
                  rapid, and accessible for researchers everywhere.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Heart size={12} className="text-red-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Built for University Researchers
                </span>
              </div>
            </div>

          </div>

          {/* Footer bottom */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} ScholarHub AI — All Rights Reserved
            </p>
            <div className="flex items-center gap-3">
              <Code2 size={14} className="text-slate-700" />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                React · Vite · FastAPI · Supabase · Framer Motion
              </span>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default Dashboard
