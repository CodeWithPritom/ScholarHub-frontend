import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  User, Mail, CreditCard, Activity, ArrowRight, Zap, 
  Database, Lock, Loader2, Sparkles, ChevronLeft, Check, 
  X, AlertCircle, Calendar, ShieldCheck, HelpCircle, GraduationCap,
  Globe, FileDown, Eye, Gauge, Compass, MessageCircle
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import Footer from '../Footer'
import { motion, AnimatePresence } from 'framer-motion'

const Profile = ({ user }) => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [tierData, setTierData] = useState({ tier: 'free', valid_until: null, isExpired: false })
  const [usageStats, setUsageStats] = useState({ aiSummaries: 0 })
  const [profileData, setProfileData] = useState({ full_name: '', academic_field: 'Genetic Eng. & Biotech (GEB)', unlocked_portal: 'geb' })
  const [devices, setDevices] = useState([])

  const limits = {
    free: { ai: 3, portals: 1, name: 'Free Plan', searchDelay: '5s delay', papers: '20 papers' },
    starter: { ai: 30, portals: 1, name: 'Starter Plan', searchDelay: '1s debounce', papers: 'Unlimited' },
    pro: { ai: 300, portals: 4, name: 'Pro Plan', searchDelay: 'Instant', papers: 'Unlimited' }
  }

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    const fetchProfileAndSubscription = async () => {
      try {
        // Fetch devices
        try {
          const { data: deviceData } = await supabase
            .from('user_devices')
            .select('*')
            .eq('user_id', user.id)
          if (deviceData) setDevices(deviceData)
        } catch (e) {
          console.error("Error fetching devices:", e)
        }

        // 1. Fetch Profile (Full Name, Academic Field, user_tier, unlocked_portal)
        let fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        let academicField = 'Genetic Eng. & Biotech (GEB)'
        let currentTier = 'free'
        let unlockedPortal = 'geb'
        
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, academic_field, user_tier, unlocked_portal')
            .eq('id', user.id)
            .single()
            
          if (profile) {
            if (profile.full_name) fullName = profile.full_name
            if (profile.academic_field) academicField = profile.academic_field
            if (profile.user_tier) currentTier = profile.user_tier.toLowerCase()
            if (profile.unlocked_portal) unlockedPortal = profile.unlocked_portal
          }
        } catch (e) {
           console.error("Error loading profile details:", e)
        }
        setProfileData({ 
          full_name: fullName, 
          academic_field: academicField, 
          unlocked_portal: unlockedPortal 
        })

        // 2. Fetch Subscription expiry
        let validUntil = null
        let isExpired = false
        try {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('tier, expires_at')
            .eq('user_id', user.id)
            .maybeSingle()
            
          if (sub) {
            validUntil = sub.expires_at
            // If subscription has expired, revert locally to free tier
            if (validUntil && new Date() > new Date(validUntil)) {
              currentTier = 'free'
              isExpired = true
            }
          }
        } catch (e) { 
          console.error("Error loading active subscription info:", e)
        }
        
        setTierData({ tier: currentTier, valid_until: validUntil, isExpired })

        // 3. Fetch Today's AI Usage Logs Count
        try {
          const todayStr = new Date().toISOString().split('T')[0]
          const { count, error } = await supabase
            .from('usage_logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('action', 'ai_summary')
            .eq('usage_date', todayStr)
            
          if (!error && count !== null) {
            setUsageStats({ aiSummaries: count })
          }
        } catch (e) {
          console.error("Error fetching usage logs:", e)
        }

      } catch (err) {
        console.error("Profile view initialization error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndSubscription()

    // 4. Realtime Usage Logs Tracking
    const usageChannel = supabase.channel('realtime_usage')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'usage_logs', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        if (payload.new.action === 'ai_summary') {
          setUsageStats(prev => ({ ...prev, aiSummaries: prev.aiSummaries + 1 }))
        }
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(usageChannel)
    }
  }, [user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Loading Profile...</span>
      </div>
    )
  }

  const currentLimit = limits[tierData.tier] || limits.free
  const aiProgress = Math.min((usageStats.aiSummaries / currentLimit.ai) * 100, 100)
  
  // Calculate validation period info
  const expiryDate = tierData.valid_until ? new Date(tierData.valid_until) : null
  const daysRemaining = expiryDate 
    ? Math.max(0, Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  const getPortalLabel = (id) => {
    switch (id) {
      case 'geb': return 'Genetic Eng. & Biotech (GEB)'
      case 'pharma': return 'Pharmacy'
      case 'eng': return 'Engineering & Tech'
      case 'social': return 'Social Sciences'
      case 'physics': return 'Physics'
      case 'math': return 'Mathematics'
      case 'chem': return 'Chemical Sciences'
      case 'law': return 'Law & Legal Studies'
      default: return 'GEB'
    }
  }

  const featureChecklist = [
    { name: `GEB Portal Access`, free: true, starter: true, pro: true },
    { name: `Assigned Field Portal (${getPortalLabel(profileData.unlocked_portal)})`, free: true, starter: true, pro: true },
    { name: `Multi-Portal Department Switcher`, free: false, starter: false, pro: true },
    { name: `AI Summarize Capacity (${currentLimit.ai} summaries/day)`, free: true, starter: true, pro: true },
    { name: `Advanced Search Filters (By Date & Sorting)`, free: false, starter: true, pro: true },
    { name: `High-speed Search Debouncing (1s delay)`, free: false, starter: true, pro: true },
    { name: `PDF Export Integration`, free: false, starter: true, pro: true },
    { name: `Unlimited Saved Papers in Library`, free: false, starter: true, pro: true },
    { name: `Automated Literature Reviews Synthesis`, free: false, starter: false, pro: true },
    { name: `AI Research Gap Detection Mode`, free: false, starter: false, pro: true }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles size={20} />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
              ScholarHub <span className="text-blue-600">AI</span>
            </span>
          </div>
          
          <button 
            onClick={() => navigate('/research')}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Hub
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/30">
            {profileData.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <h1 className="text-4xl font-black tracking-tight">{profileData.full_name || 'Academic User'}</h1>
              <span className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-md ${
                tierData.isExpired 
                  ? 'bg-red-500 text-white border-red-400' 
                  : tierData.tier === 'pro' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : tierData.tier === 'starter' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                      : 'bg-white/10 text-slate-300'
              }`}>
                {tierData.isExpired ? 'Plan Expired' : tierData.tier}
              </span>
            </div>
            
            <p className="text-slate-400 font-semibold mb-6 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} className="text-slate-500" />
              {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs font-bold text-slate-300 shadow-sm">
                <GraduationCap size={14} className="text-blue-400" />
                Niche: {profileData.academic_field}
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs font-bold text-slate-300 shadow-sm">
                <Compass size={14} className="text-indigo-400" />
                Base Portal: {getPortalLabel(profileData.unlocked_portal)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Dashboard Cards ─── */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Columns (Billing & Limits) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Subscription & Billing Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <CreditCard size={100} className="text-slate-600" />
              </div>
              
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-500" />
                Subscription Status
              </h2>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                    {currentLimit.name}
                  </div>
                  
                  <div className="mt-4 space-y-1 text-sm font-semibold text-slate-500">
                    <div>
                      Validation Expiry: <strong className="text-slate-800">
                        {tierData.isExpired ? (
                          <span className="text-red-500">Expired</span>
                        ) : expiryDate 
                          ? expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Lifetime Access (Basic)'}
                      </strong>
                    </div>
                    {expiryDate && !tierData.isExpired && (
                      <div className="text-xs text-blue-600 font-bold">
                        Days remaining: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/pricing')}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 shrink-0 group"
                >
                  Manage Subscription 
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Unlocked Features Checklist */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40"
            >
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                Your Unlocked Features
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {featureChecklist.map((feat, idx) => {
                  const isUnlocked = 
                    tierData.tier === 'pro' ? feat.pro : 
                    tierData.tier === 'starter' ? feat.starter : feat.free
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                        isUnlocked 
                          ? 'bg-emerald-50/20 border-emerald-100/60 text-slate-700' 
                          : 'bg-slate-50/50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                        isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {isUnlocked ? <Check size={12} /> : <Lock size={10} />}
                      </div>
                      <span className="text-xs font-semibold leading-relaxed">{feat.name}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Support Center */}
            <motion.div 
              id="support"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.15 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden"
            >
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MessageCircle size={16} className="text-blue-500" />
                Support Center
              </h2>

              {tierData.tier === 'free' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mb-2">Support is a Premium Feature</h3>
                  <p className="text-xs font-medium text-slate-500 mb-6 max-w-sm">
                    Upgrade to Starter or Pro to access our private Discord support channel.
                  </p>
                  <button onClick={() => navigate('/pricing')} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md">
                    Upgrade to Unlock Support
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#5865F2]/20 rounded-full flex items-center justify-center text-[#5865F2] mb-4 shadow-sm shadow-[#5865F2]/20">
                    <MessageCircle size={20} />
                  </div>
                  <h3 className="text-sm font-black text-blue-900 mb-2">You have active Premium Support</h3>
                  <p className="text-xs font-medium text-blue-700/80 mb-6 max-w-sm">
                    Join our private Discord for instant help, bug reports, and priority feature requests.
                  </p>
                  <a href="https://discord.com/channels/1487496436391346208/1506872889276895343" target="_blank" rel="noreferrer" className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5865F2]/30 flex items-center gap-2">
                    <MessageCircle size={14} /> Join Private Discord
                  </a>
                </div>
              )}
            </motion.div>

          </div>

          {/* Right Column (Usage Statistics) */}
          <div className="space-y-10">
            
            {/* Realtime Usage Tracking */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-2xl shadow-slate-900/30 text-white relative overflow-hidden"
            >
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Activity size={16} className="text-blue-400 animate-pulse" />
                Real-Time Limits
              </h2>

              <div className="flex flex-col items-center justify-center py-6 mb-8 relative">
                {/* Circular Progress SVG */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      className="text-slate-800" 
                      strokeWidth="8" 
                      stroke="currentColor" 
                      fill="transparent" 
                    />
                    {/* Glowing Progress Circle */}
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      className="text-blue-500" 
                      strokeWidth="8" 
                      strokeDasharray="264" 
                      strokeDashoffset={264 - (264 * aiProgress) / 100}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent"
                      initial={{ strokeDashoffset: 264 }}
                      animate={{ strokeDashoffset: 264 - (264 * aiProgress) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  
                  {/* Central Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black leading-none">{usageStats.aiSummaries}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">/ {currentLimit.ai} used</span>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Summaries (Today)</div>
                  <div className="text-xs text-slate-300 font-semibold">
                    {currentLimit.ai - usageStats.aiSummaries} daily summaries remaining
                  </div>
                </div>
              </div>

              {/* Detail list limits */}
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Gauge size={14} className="text-indigo-400" /> Search Speed
                  </span>
                  <span className="font-black text-slate-200">{currentLimit.searchDelay}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Database size={14} className="text-emerald-400" /> Library Limit
                  </span>
                  <span className="font-black text-slate-200">{currentLimit.papers}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe size={14} className="text-amber-400" /> Unlocked Portals
                  </span>
                  <span className="font-black text-slate-200">
                    {tierData.tier === 'pro' ? 'All 4 Portals' : '1 (Base niche)'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Connected Devices Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="mt-8 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden"
          >
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">
              Your Connected Devices
            </h2>
            <p className="text-xs font-semibold text-slate-500 mb-6">
              You can connect up to 2 devices to your ScholarHub account. If you reach your limit, remove an old device here.
            </p>
            
            <div className="space-y-4">
              {devices.map((device) => {
                const isCurrent = device.device_id === localStorage.getItem('scholarhub_device_id')
                return (
                  <div key={device.device_id} className={`flex items-center justify-between p-5 rounded-2xl border ${isCurrent ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'} transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-500'}`}>
                        {device.device_name?.includes('Mobi') ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> : <Database size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 tracking-tight flex items-center">
                          {device.device_name || 'Unknown Device'}
                          {isCurrent && <span className="ml-3 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Current</span>}
                        </div>
                        <div className="text-xs font-semibold text-slate-400 mt-1">
                          Device ID: {device.device_id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrent && (
                      <button
                        onClick={async () => {
                          const { error } = await supabase.from('user_devices').delete().eq('device_id', device.device_id).eq('user_id', user.id)
                          if (!error) setDevices(devices.filter(d => d.device_id !== device.device_id))
                        }}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                        title="Remove Device"
                      >
                        <X size={18} className="group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                )
              })}
              
              {devices.length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No devices connected</span>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Profile
