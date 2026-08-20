import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  User, Mail, CreditCard, Activity, ArrowRight, Zap, 
  Database, Lock, Loader2, Sparkles, ChevronLeft, Check, 
  X, AlertCircle, Calendar, ShieldCheck, HelpCircle, GraduationCap,
  Globe, FileDown, Eye, Gauge, Compass, MessageCircle, RefreshCw, Clock
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import { BASE_URL } from '../utils/api'
import Footer from '../Footer'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import ResearchDNA from '../components/ResearchDNA'

const Profile = ({ user }) => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [tierData, setTierData] = useState({ tier: 'free', valid_until: null, isExpired: false })
  const [usageStats, setUsageStats] = useState({ aiSummaries: 0 })
  const [profileData, setProfileData] = useState({ full_name: '', academic_field: user?.user_metadata?.academic_field || '', compute_credits: 500, total_credits: 500, export_count: 0, user_tier: 'free', saved_papers_count: 0, last_reset_date: null })
  const [devices, setDevices] = useState([])

  const fetchDevices = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
      if (data) setDevices(data)
    } catch (e) {
      console.error("Error fetching devices:", e)
    }
  }, [user])


  const limits = {
    free: { ai: 3, portals: 1, name: 'Free Plan', searchDelay: '5s delay', papers: '20 papers' },
    starter: { ai: 50, portals: 1, name: 'Starter Plan', searchDelay: '1s debounce', papers: 'Unlimited' },
    pro: { ai: 100, portals: 4, name: 'Pro Plan', searchDelay: 'Instant', papers: 'Unlimited' }
  }

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    const fetchProfileAndSubscription = async () => {
      try {
        // Fetch devices
        await fetchDevices();


        // 1. Fetch Profile (Full Name, Academic Field, user_tier)
        let fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        let academicField = user?.user_metadata?.academic_field || ''
        let currentTier = 'free'
        let computeCredits = 500
        let totalCredits = 500
        let exportCount = 0
        let lastResetDate = null
        
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, academic_field, user_tier, compute_credits, total_credits, export_count, last_reset_date')
            .eq('id', user.id)
            .maybeSingle()

            
          if (profile) {
            if (profile.full_name) fullName = profile.full_name
            if (profile.academic_field) academicField = profile.academic_field
            if (profile.user_tier) currentTier = profile.user_tier.toLowerCase()
            if (profile.compute_credits !== null && profile.compute_credits !== undefined) {
               computeCredits = profile.compute_credits
            }
            if (profile.total_credits !== null && profile.total_credits !== undefined) {
               totalCredits = profile.total_credits
            }
            if (profile.export_count !== null && profile.export_count !== undefined) {
               exportCount = profile.export_count
            }
            if (profile.last_reset_date) lastResetDate = profile.last_reset_date
          }
        } catch (e) {
          console.error("Error loading profile details:", e)
        }

        // Forced Profile Synchronization & Self-Healing Jump-Forward Reset Call
        let daysUntilRefreshBackend = 7
        let nextRefreshIsoBackend = null
        let lastResetDateSync = null
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            const syncRes = await fetch(`${BASE_URL}/api/auth/sync-profile`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            })
            if (syncRes.ok) {
              const syncData = await syncRes.json()
              if (syncData) {
                currentTier = syncData.user_tier || currentTier
                computeCredits = syncData.compute_credits ?? computeCredits
                totalCredits = syncData.total_credits ?? totalCredits
                exportCount = syncData.export_count ?? exportCount
                lastResetDateSync = syncData.last_reset_date_iso
                nextRefreshIsoBackend = syncData.next_refresh_date_iso
                daysUntilRefreshBackend = syncData.days_until_refresh
              }
            }
          }
        } catch (syncErr) {
          console.error("[Profile Sync] Backend sync failed, falling back to client fetch:", syncErr)
        }

        let savedPapersCount = 0
        try {
          const { count } = await supabase
            .from('bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          if (count !== null) savedPapersCount = count
        } catch (e) {
          console.error("Error loading bookmarks count:", e)
        }

        // 2. Fetch Subscription expiry & Tier Fallback
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
            if (validUntil && new Date() > new Date(validUntil)) {
              currentTier = 'free'
              isExpired = true
            } else if (sub.tier && sub.tier !== 'free') {
              currentTier = sub.tier.toLowerCase()
            }
          }
        } catch (e) { 
          console.error("Error loading active subscription info:", e)
        }

        setProfileData({ 
          full_name: fullName, 
          academic_field: academicField,
          compute_credits: computeCredits,
          total_credits: totalCredits,
          export_count: exportCount,
          user_tier: currentTier,
          saved_papers_count: savedPapersCount,
          last_reset_date: lastResetDate || null,
          days_until_refresh: daysUntilRefreshBackend,
          next_refresh_date_iso: nextRefreshIsoBackend
        })
        
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

    // 5. Realtime Devices Tracking (instantly updates UI when device is registered in background)
    const devicesChannel = supabase.channel('realtime_devices')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_devices',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchDevices();
      })
      .subscribe()

    return () => {
      supabase.removeChannel(usageChannel)
      supabase.removeChannel(devicesChannel)
    }
  }, [user, navigate, fetchDevices])


  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
        </div>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] animate-pulse">Loading Profile...</span>
      </div>
    )
  }

  const currentLimit = limits[tierData.tier] || limits.free
  const aiProgress = Math.min(((profileData.compute_credits || 0) / (profileData.total_credits || 500)) * 100, 100)
  
  const expiryDate = tierData.valid_until ? new Date(tierData.valid_until) : null
  const daysRemaining = expiryDate 
    ? Math.max(0, Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  // Robust UTC-Safe Weekly Refresh Countdown
  const parseUtcDate = (dateStr) => {
    if (!dateStr) return null;
    let s = String(dateStr).trim();
    if (!s.endsWith('Z') && !s.includes('+') && !s.includes('-', 10)) {
      s += 'Z';
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const lastResetDate = parseUtcDate(profileData.last_reset_date)
  const nextResetDate = profileData.next_refresh_date_iso 
    ? parseUtcDate(profileData.next_refresh_date_iso) 
    : (lastResetDate ? new Date(lastResetDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null)
  const daysUntilRefresh = profileData.days_until_refresh !== undefined ? profileData.days_until_refresh : 7
  const refreshPending = daysUntilRefresh === 0
  const refreshLabel = refreshPending
    ? 'Refreshing Now...'
    : daysUntilRefresh === 1
      ? 'Refreshes tomorrow'
      : `Refreshes in ${daysUntilRefresh} days`

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
    { name: `All Academic Sources Access`, free: true, starter: true, pro: true },
    { name: `Compute Capacity (${profileData.total_credits || 500} Zaps / week)`, free: true, starter: true, pro: true },
    { name: `Advanced Search Filters (By Date & Sorting)`, free: false, starter: true, pro: true },
    { name: `High-speed Search Debouncing (1s delay)`, free: false, starter: true, pro: true },
    { name: `PDF & Manuscript Export Integration`, free: false, starter: true, pro: true },
    { name: `Unlimited Saved Papers in Library`, free: false, starter: true, pro: true },
    { name: `Automated Literature Reviews Synthesis`, free: false, starter: false, pro: true },
    { name: `AI Research Gap & Vision RAG Mode`, free: false, starter: false, pro: true }
  ]

  return (
    <WorkspaceLayout user={user}>

      {/* ─── Hero Section ─── */}
      <div className="relative py-12 px-10 overflow-hidden bg-white border border-[#E5E5DF] text-[#171717] rounded-[12px] shadow-sm w-full">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full 2xl:px-12 mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-sm shadow-blue-500/30">
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
                      : 'bg-white/10 text-[#171717]'
              }`}>
                {tierData.isExpired ? 'Plan Expired' : tierData.tier}
              </span>
            </div>
            
            <p className="text-slate-700 font-semibold mb-6 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} className="text-slate-700" />
              {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-[#F3F3EF] border border-[#E5E5DF] rounded-[8px] px-4 py-2 text-xs font-bold text-[#171717] shadow-xs">
                <GraduationCap size={14} className="text-blue-400" />
                Niche: {profileData.academic_field}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Dashboard Cards ─── */}
      <div className="w-full mt-10">
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Columns (Billing & Limits) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Subscription & Billing Card */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E5E5DF] shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <CreditCard size={100} className="text-slate-600" />
              </div>
              
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-500" />
                Subscription Status
              </h2>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="text-3xl font-black text-[#171717] tracking-tight uppercase flex items-center gap-2">
                    {currentLimit.name}
                  </div>
                  
                  <div className="mt-4 space-y-1 text-sm font-semibold text-slate-700">
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
                  className="px-5 py-2.5 bg-[#315CFF] hover:bg-[#2547d0] text-white text-xs font-semibold rounded-[8px] transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
                >
                  Manage Subscription 
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Unlocked Features Checklist */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E5E5DF] shadow-sm"
            >
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2">
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
                          : 'bg-slate-50/50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                        isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
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
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.15 }}
              className="bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E5E5DF] shadow-sm relative overflow-hidden"
            >
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MessageCircle size={16} className="text-blue-500" />
                Support Center
              </h2>

              {tierData.tier === 'free' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 mb-4">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mb-2">Support is a Premium Feature</h3>
                  <p className="text-xs font-medium text-slate-700 mb-6 max-w-sm">
                    Upgrade to Starter or Pro to access our private Discord support channel.
                  </p>
                  <button onClick={() => navigate('/pricing')} className="px-5 py-2.5 bg-[#315CFF] hover:bg-[#2547d0] text-white text-[10px] font-bold uppercase tracking-widest rounded-[8px] transition-all shadow-xs">
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
                  <a href="https://discord.com/channels/1487496436391346208/1506872889276895343" target="_blank" rel="noreferrer" className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-[#5865F2]/30 flex items-center gap-2">
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
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="bg-[#FAFAF8] rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E5E5DF] shadow-sm text-[#171717] relative overflow-hidden"
            >
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Activity size={16} className="text-blue-400 animate-pulse" />
                Compute Infrastructure Hub
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 py-6 mb-8 relative">
                {/* Ring 1: Compute Zaps */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-28 sm:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background Track */}
                      <circle cx="50" cy="50" r="42" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                      {/* Glowing Progress Circle */}
                      <motion.circle 
                        cx="50" cy="50" r="42" className="text-indigo-500" strokeWidth="8" strokeDasharray="264" 
                        strokeDashoffset={264 - (264 * (Math.min(profileData.total_credits, profileData.compute_credits) / Math.max(1, profileData.total_credits)))} 
                        strokeLinecap="round" stroke="currentColor" fill="transparent"
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * (Math.min(profileData.total_credits, profileData.compute_credits) / Math.max(1, profileData.total_credits))) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    
                    {/* Central Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl sm:text-lg lg:text-2xl font-black leading-none text-[#171717]">{profileData.compute_credits}</span>
                      <span className="text-[10px] sm:text-[8px] lg:text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">/ {profileData.total_credits}</span>
                    </div>
                  </div>
                  <div className="text-center mt-5">
                    <div className="text-xs font-black text-[#171717] uppercase tracking-widest">Compute Zaps</div>
                    <div className={`flex items-center justify-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      daysUntilRefresh === 0 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : daysUntilRefresh <= 2 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                    }`} title={nextResetDate ? `Next refresh: ${nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}>
                      <RefreshCw size={10} className={daysUntilRefresh === 0 ? 'animate-spin' : ''} />
                      {refreshLabel}
                    </div>
                  </div>
                </div>

                {/* Ring 2: Export Quota */}
                {(() => {
                  const exportLimit = profileData.user_tier === 'pro' ? 100 : profileData.user_tier === 'starter' ? 50 : 10;
                  const exportCount = profileData.export_count || 0;
                  return (
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-36 h-36 sm:w-28 sm:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background Track */}
                          <circle cx="50" cy="50" r="42" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                          {/* Glowing Progress Circle */}
                          <motion.circle 
                            cx="50" cy="50" r="42" className="text-emerald-500" strokeWidth="8" strokeDasharray="264" 
                            strokeDashoffset={264 - (264 * (Math.min(exportLimit, exportCount) / exportLimit))} 
                            strokeLinecap="round" stroke="currentColor" fill="transparent"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * (Math.min(exportLimit, exportCount) / exportLimit)) }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                        </svg>
                        
                        {/* Central Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl sm:text-lg lg:text-2xl font-black leading-none text-[#171717]">{exportCount}</span>
                          <span className="text-[10px] sm:text-[8px] lg:text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">/ {exportLimit}</span>
                        </div>
                      </div>
                      <div className="text-center mt-5">
                        <div className="text-xs font-black text-[#171717] uppercase tracking-widest">Export Quota</div>
                        <div className={`flex items-center justify-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          daysUntilRefresh === 0 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : daysUntilRefresh <= 2 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        }`} title={nextResetDate ? `Next refresh: ${nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}>
                          <RefreshCw size={10} className={daysUntilRefresh === 0 ? 'animate-spin' : ''} />
                          {refreshLabel}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Ring 3: Library Storage */}
                {(() => {
                  const storageLimit = 200;
                  const storageCount = profileData.saved_papers_count || 0;
                  return (
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-36 h-36 sm:w-28 sm:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background Track */}
                          <circle cx="50" cy="50" r="42" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                          {/* Glowing Progress Circle */}
                          <motion.circle 
                            cx="50" cy="50" r="42" className="text-amber-500" strokeWidth="8" strokeDasharray="264" 
                            strokeDashoffset={264 - (264 * (Math.min(storageLimit, storageCount) / storageLimit))} 
                            strokeLinecap="round" stroke="currentColor" fill="transparent"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * (Math.min(storageLimit, storageCount) / storageLimit)) }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                        </svg>
                        
                        {/* Central Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl sm:text-lg lg:text-2xl font-black leading-none text-[#171717]">{storageCount}</span>
                          <span className="text-[10px] sm:text-[8px] lg:text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">/ {storageLimit}</span>
                        </div>
                      </div>
                      <div className="text-center mt-5">
                        <div className="text-xs font-black text-[#171717] uppercase tracking-widest">Library Storage</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Weekly Refresh Schedule Banner */}
              <div className="mt-8 mb-2 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    daysUntilRefresh === 0 
                      ? 'bg-emerald-500/30 text-emerald-400' 
                      : 'bg-indigo-500/30 text-indigo-400'
                  }`}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#171717] uppercase tracking-widest">Weekly Refresh Schedule</div>
                    <div className="text-[10px] font-bold text-slate-700 mt-0.5">Compute Zaps & Export Quota reset every 7 days</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAFAF8]/50 rounded-xl p-3 border border-[#E5E5DF]/50">
                    <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Next Refresh</div>
                    <div className="text-sm font-black text-[#171717]">
                      {nextResetDate 
                        ? nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : 'Not set'}
                    </div>
                  </div>
                  <div className="bg-[#FAFAF8]/50 rounded-xl p-3 border border-[#E5E5DF]/50">
                    <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Days Remaining</div>
                    <div className={`text-sm font-black ${
                      daysUntilRefresh === 0 ? 'text-emerald-600' : daysUntilRefresh <= 2 ? 'text-amber-600' : 'text-[#171717]'
                    }`}>
                      {daysUntilRefresh === 0 ? '🎉 Today!' : `${daysUntilRefresh} ${daysUntilRefresh === 1 ? 'day' : 'days'}`}
                    </div>
                  </div>
                </div>
                {lastResetDate && (
                  <div className="mt-3 text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Calendar size={10} />
                    Last reset: {lastResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {/* Detail list limits */}
              <div className="space-y-4 pt-6 border-t border-[#E5E5DF]">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]" /> 📚 Library Capacity
                  </span>
                  <span className="font-black text-[#171717]">200 Papers Total (Unified Access)</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600" /> Search Synchronizations
                  </span>
                  <span className="font-black text-slate-700">0 Zaps</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]" /> Standard Synthesis
                  </span>
                  <span className="font-black text-[#171717]">10 Zaps / req</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]" /> Advanced Auditing
                  </span>
                  <span className="font-black text-[#171717]">50 Zaps / req</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 drop-shadow-[0_0_2px_rgba(244,63,94,0.8)]" /> Deep Manuscript Writing
                  </span>
                  <span className="font-black text-[#171717]">200 Zaps / req</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Research DNA Dashboard Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            className="mt-8"
          >
            <ResearchDNA profile={profileData} user={user} />
          </motion.div>

          {/* Connected Devices Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="mt-8 bg-white rounded-[12px] p-8 md:p-10 border border-[#E5E5DF] shadow-sm relative overflow-hidden"
          >
            <h2 className="text-xl font-black text-[#171717] tracking-tight mb-8">
              Your Connected Devices
            </h2>
            <p className="text-xs font-semibold text-slate-700 mb-6">
              You can connect up to 2 devices to your ScholarHub account. If you reach your limit, remove an old device here.
            </p>
            
            <div className="space-y-4">
              {devices.map((device) => {
                const isCurrent = device.device_id === localStorage.getItem('scholarhub_device_id')
                return (
                  <div key={device.device_id} className={`flex items-center justify-between p-5 rounded-2xl border ${isCurrent ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'} transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'bg-slate-200 text-slate-700'}`}>
                        {device.device_name?.includes('Mobi') ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> : <Database size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#171717] tracking-tight flex items-center">
                          {device.device_name || 'Unknown Device'}
                          {isCurrent && <span className="ml-3 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Current</span>}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">
                          Device ID: {device.device_id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrent && (
                      <button
                        onClick={async () => {
                          const { error } = await supabase.from('user_devices').delete().eq('device_id', device.device_id).eq('user_id', user.id)
                          if (!error) {
                            setDevices(devices.filter(d => d.device_id !== device.device_id))
                            toast.success("Device removed successfully.")
                          } else {
                            toast.error("Failed to remove device.")
                          }
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
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">No devices connected</span>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </WorkspaceLayout>
  )
}

export default Profile
