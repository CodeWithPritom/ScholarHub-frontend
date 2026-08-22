import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  User, Mail, CreditCard, Activity, ArrowRight, Zap, 
  Database, Lock, Loader2, Sparkles, ChevronLeft, Check, 
  X, AlertCircle, Calendar, ShieldCheck, HelpCircle, GraduationCap,
  Globe, FileDown, Eye, Gauge, Compass, MessageCircle, RefreshCw, Clock,
  Smartphone, Laptop, Shield, ExternalLink, Settings as SettingsIcon, Award
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import { BASE_URL } from '../utils/api'
import { getQuotaResetInfo } from '../utils/quotaUtils'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import ResearchDNA from '../components/ResearchDNA'

const Profile = ({ user }) => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [tierData, setTierData] = useState({ tier: 'free', valid_until: null, isExpired: false })
  const [profileData, setProfileData] = useState({ 
    full_name: '', 
    academic_field: '', 
    academic_status: '',
    compute_credits: 500, 
    total_credits: 500, 
    export_count: 0, 
    user_tier: 'free', 
    saved_papers_count: 0, 
    audit_sessions_count: 0,
    last_reset_date: null,
    days_until_refresh: 7,
    next_refresh_date_iso: null
  })
  const [devices, setDevices] = useState([])

  // Fetch Connected Devices
  const fetchDevices = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data && !error) setDevices(data)
    } catch (e) {
      console.error("Error fetching devices:", e)
    }
  }, [user])

  // Fetch full live profile & subscription details
  const fetchProfileAndSubscription = useCallback(async (isManualSync = false) => {
    if (!user?.id) return
    if (isManualSync) setSyncing(true)
    
    try {
      await fetchDevices()

      let fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
      let academicField = user.user_metadata?.academic_field || ''
      let academicStatus = user.user_metadata?.academic_status || ''
      let currentTier = 'free'
      let computeCredits = 500
      let totalCredits = 500
      let exportCount = 0
      let lastResetDate = null

      // 1. Fetch Profile from Supabase
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, academic_field, academic_status, user_tier, compute_credits, total_credits, export_count, last_reset_date')
          .eq('id', user.id)
          .maybeSingle()
          
        if (profile) {
          if (profile.full_name) fullName = profile.full_name
          if (profile.academic_field) academicField = profile.academic_field
          if (profile.academic_status) academicStatus = profile.academic_status
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

      // 2. Forced Profile Synchronization & Jump-Forward Reset Call
      let daysUntilRefreshBackend = 7
      let nextRefreshIsoBackend = null
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
              lastResetDate = syncData.last_reset_date_iso || lastResetDate
              nextRefreshIsoBackend = syncData.next_refresh_date_iso
              daysUntilRefreshBackend = syncData.days_until_refresh ?? 7
            }
          }
        }
      } catch (syncErr) {
        console.error("[Profile Sync] Backend sync failed, falling back to client fetch:", syncErr)
      }

      // 3. Fetch real Saved Bookmarks Count
      let savedPapersCount = 0
      try {
        const { count, error } = await supabase
          .from('bookmarks')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .limit(1)
        if (!error && count !== null) savedPapersCount = count
      } catch (e) {
        console.error("Error loading bookmarks count:", e)
      }

      // 4. Fetch real Audit History Sessions Count
      let auditSessionsCount = 0
      try {
        const { count: auditCount, error: auditError } = await supabase
          .from('audit_history')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .limit(1)
        if (!auditError && auditCount !== null) auditSessionsCount = auditCount
      } catch (e) {
        console.error("Error loading audit history count:", e)
      }

      // 5. Fetch Subscription Expiry
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
            if (currentTier !== 'pro' && currentTier !== 'starter') {
              currentTier = 'free'
              isExpired = true
            }
          } else if (sub.tier && sub.tier !== 'free') {
            if (currentTier !== 'pro') {
              currentTier = sub.tier.toLowerCase()
            }
          }
        }
      } catch (e) { 
        console.error("Error loading active subscription info:", e)
      }

      setProfileData({ 
        full_name: fullName, 
        academic_field: academicField || '',
        academic_status: academicStatus || '',
        compute_credits: computeCredits,
        total_credits: totalCredits,
        export_count: exportCount,
        user_tier: currentTier,
        saved_papers_count: savedPapersCount,
        audit_sessions_count: auditSessionsCount,
        last_reset_date: lastResetDate,
        days_until_refresh: daysUntilRefreshBackend,
        next_refresh_date_iso: nextRefreshIsoBackend
      })
      
      setTierData({ tier: currentTier, valid_until: validUntil, isExpired })

      if (isManualSync) {
        toast.success("Profile & credits synchronized with live server.")
      }

    } catch (err) {
      console.error("Profile view initialization error:", err)
      if (isManualSync) toast.error("Failed to sync profile.")
    } finally {
      setLoading(false)
      if (isManualSync) setSyncing(false)
    }
  }, [user, fetchDevices])

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    fetchProfileAndSubscription()

    // Listen to global credit and profile updates
    const handleCreditsUpdate = () => {
      fetchProfileAndSubscription()
    }
    window.addEventListener('credits_updated', handleCreditsUpdate)
    window.addEventListener('credits_sync', handleCreditsUpdate)
    window.addEventListener('profileUpdated', handleCreditsUpdate)

    // Realtime Supabase Channels
    const devicesChannel = supabase.channel('realtime_profile_devices')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_devices',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchDevices()
      })
      .subscribe()

    const bookmarksChannel = supabase.channel('realtime_profile_bookmarks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchProfileAndSubscription()
      })
      .subscribe()

    return () => {
      window.removeEventListener('credits_updated', handleCreditsUpdate)
      window.removeEventListener('credits_sync', handleCreditsUpdate)
      window.removeEventListener('profileUpdated', handleCreditsUpdate)
      supabase.removeChannel(devicesChannel)
      supabase.removeChannel(bookmarksChannel)
    }
  }, [user, navigate, fetchProfileAndSubscription, fetchDevices])

  // Helper date calculations
  const expiryDate = tierData.valid_until ? new Date(tierData.valid_until) : null
  const daysRemaining = expiryDate 
    ? Math.max(0, Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  const parseUtcDate = (dateStr) => {
    if (!dateStr) return null
    let s = String(dateStr).trim()
    if (!s.endsWith('Z') && !s.includes('+') && !s.includes('-', 10)) {
      s += 'Z'
    }
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }

  const quotaCalculated = getQuotaResetInfo(profileData.last_reset_date || user?.created_at)
  const nextResetDate = quotaCalculated.nextRefreshDate
  const daysUntilRefresh = quotaCalculated.daysLeft
  const refreshLabel = quotaCalculated.label

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Scholar'

  // 10 Pillars Feature Checklist aligned with real tier access
  const featureChecklist = [
    { name: 'Multi-Source Discovery Engine (NCBI, PubMed, EuropePMC, arXiv, Semantic Scholar)', free: true, starter: true, pro: true },
    { name: `Weekly Compute Capacity (${profileData.total_credits || 500} Zaps / week)`, free: true, starter: true, pro: true },
    { name: 'Unified Library Storage (Save up to 200 papers)', free: true, starter: true, pro: true },
    { name: 'AI Supervisor & Professor Outreach Architect (Skill #7)', free: true, starter: true, pro: true },
    { name: 'AI Disclosure Statement Generator (Skill #9)', free: true, starter: true, pro: true },
    { name: '3MT & Scientific Pitch Suite (Skill #8)', free: true, starter: true, pro: true },
    { name: 'Statistical Methodology Advisor (Skill #6)', free: true, starter: true, pro: true },
    { name: 'PDF & BibTeX Citation Export Integration (Skill #5)', free: false, starter: true, pro: true },
    { name: 'Deep Multi-Paper Literature Review Synthesis (Skill #1)', free: false, starter: false, pro: true },
    { name: 'Research Gap Analysis & Deep Reasoning Engine (Skill #2)', free: false, starter: false, pro: true }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFC] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
        </div>
        <span className="text-xs font-black text-slate-600 uppercase tracking-[0.25em] animate-pulse">Loading Profile...</span>
      </div>
    )
  }

  const exportLimit = profileData.user_tier === 'pro' ? 100 : profileData.user_tier === 'starter' ? 50 : 10
  const storageLimit = 200

  return (
    <WorkspaceLayout user={user}>
      <div className="max-w-7xl mx-auto w-full space-y-8 pb-12">
        
        {/* ─── Hero Profile Identity Header ─── */}
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs"
        >
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 sm:gap-8">
            
            {/* Left: Avatar + Identity Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
              
              {/* Dynamic Avatar */}
              <div className="relative shrink-0">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg ${
                  tierData.tier === 'pro'
                    ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-violet-600 shadow-amber-500/20'
                    : tierData.tier === 'starter'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20'
                      : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-900/20'
                }`}>
                  {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1 rounded-full shadow-xs border border-slate-100">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Online & Verified" />
                </div>
              </div>

              {/* Identity Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profileData.full_name || 'Academic Scholar'}
                  </h1>
                  
                  {/* Tier Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                    tierData.isExpired
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : tierData.tier === 'pro'
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 font-black'
                        : tierData.tier === 'starter'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {tierData.isExpired ? 'Plan Expired' : `${tierData.tier} Scholar`}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate max-w-xs sm:max-w-md">{user.email}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md ml-1">
                    Verified ✓
                  </span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
                    <GraduationCap size={13} className="text-indigo-600" />
                    {profileData.academic_status}
                  </span>
                  
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
                    <Compass size={13} className="text-blue-600" />
                    {profileData.academic_field}
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-xl text-[11px] font-semibold text-slate-500">
                    <Calendar size={12} className="text-slate-400" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>

            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2.5 shrink-0 w-full sm:w-auto justify-center">
              <button
                onClick={() => fetchProfileAndSubscription(true)}
                disabled={syncing}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                title="Sync Live Data with Server"
              >
                <RefreshCw size={13} className={syncing ? 'animate-spin text-blue-600' : ''} />
                <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
              </button>

              <Link
                to="/settings"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <SettingsIcon size={14} />
                <span>Edit Settings</span>
              </Link>
            </div>

          </div>
        </motion.div>

        {/* ─── Main 12-Column Responsive Dashboard Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* ═══════════ Left Column (Subscription, Features, Support) ═══════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 w-full min-w-0">
            
            {/* 1. Subscription & Billing Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Subscription & Plan Status
                    </h2>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  tierData.tier === 'pro' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : tierData.tier === 'starter' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {tierData.tier.toUpperCase()} TIER
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {tierData.tier === 'pro' ? 'Pro Scholar Plan' : tierData.tier === 'starter' ? 'Starter Scholar Plan' : 'Free Scholar Plan'}
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    {tierData.isExpired ? (
                      <span className="text-red-600 font-bold">Your subscription has expired. Renew to regain deep compute.</span>
                    ) : expiryDate ? (
                      <span>
                        Valid until <strong className="text-slate-900 font-bold">{expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    ) : (
                      <span className="text-slate-700">Permanent Free Access (Standard compute quota refreshed weekly)</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/pricing')}
                  className="px-5 py-3 bg-[#315CFF] hover:bg-[#2547d0] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
                >
                  <span>{tierData.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* 2. Unlocked 10 Pillars Feature Matrix */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      10 Pillars of Academic Research Matrix
                    </h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureChecklist.map((feat, idx) => {
                  const isUnlocked = 
                    tierData.tier === 'pro' ? feat.pro : 
                    tierData.tier === 'starter' ? feat.starter : feat.free
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isUnlocked 
                          ? 'bg-emerald-50/25 border-emerald-200/70 text-slate-800' 
                          : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                        isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isUnlocked ? <Check size={12} /> : <Lock size={10} />}
                      </div>
                      <span className="text-xs font-bold leading-relaxed">{feat.name}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* 3. Connected Devices & Session Security Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <Laptop size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Active Device Sessions
                    </h2>
                  </div>
                </div>

                <span className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full self-start sm:self-auto">
                  {devices.length} / 2 Connected Devices
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-5">
                To prevent account sharing and unauthorized access, your account allows up to 2 simultaneous registered devices. You can revoke older sessions below.
              </p>

              <div className="space-y-3">
                {devices.map((device) => {
                  const isCurrent = device.device_id === localStorage.getItem('scholarhub_device_id')
                  const isMobile = device.device_name?.toLowerCase().includes('mobile') || device.device_name?.toLowerCase().includes('phone')

                  return (
                    <div 
                      key={device.device_id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isCurrent ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-blue-600 text-white shadow-xs shadow-blue-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2 truncate">
                            <span>{device.device_name || 'Unknown Device'}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                                Current Device
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                            ID: {device.device_id.substring(0, 12)}...
                          </div>
                        </div>
                      </div>
                      
                      {!isCurrent && (
                        <button
                          onClick={async () => {
                            const { error } = await supabase.from('user_devices').delete().eq('device_id', device.device_id).eq('user_id', user.id)
                            if (!error) {
                              setDevices(devices.filter(d => d.device_id !== device.device_id))
                              toast.success("Device session revoked.")
                            } else {
                              toast.error("Failed to remove device.")
                            }
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                          title="Revoke device access"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  )
                })}

                {devices.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-xs font-semibold text-slate-400">
                    No connected devices found. Current session will register automatically.
                  </div>
                )}
              </div>
            </motion.div>

            {/* 4. Support & Academic Community Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Academic Assistance & Support Hub
                  </h2>
                </div>
              </div>

              {tierData.tier === 'free' ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 mb-3">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1">Priority Support is unlocked on Starter & Pro</h3>
                  <p className="text-xs font-medium text-slate-500 mb-5 max-w-md">
                    Upgrade your plan to access our direct WhatsApp emergency channel and private Discord researcher community.
                  </p>
                  <button 
                    onClick={() => navigate('/pricing')} 
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    View Pricing Plans
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 rounded-2xl p-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#5865F2]/15 text-[#5865F2] rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                    <MessageCircle size={22} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1">Active Premium Research Support</h3>
                  <p className="text-xs font-medium text-slate-600 mb-5 max-w-md">
                    Join our private Discord channel for direct authoring assistance, feature priority requests, and bug reports.
                  </p>
                  <a 
                    href="https://discord.com/channels/1487496436391346208/1506872889276895343" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Join Private Discord</span>
                  </a>
                </div>
              )}
            </motion.div>

          </div>

          {/* ═══════════ Right Column (Compute Hub, Research DNA) ═══════════ */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 w-full min-w-0">
            
            {/* 1. Compute Infrastructure Hub (Realtime Gauges) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Activity size={16} className="animate-pulse" />
                  </div>
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Compute & Quotas
                  </h2>
                </div>
              </div>

              {/* 3 Circular SVG Gauges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2">
                
                {/* Ring 1: Compute Zaps */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="text-slate-100" strokeWidth="9" stroke="currentColor" fill="transparent" />
                      <motion.circle 
                        cx="50" cy="50" r="40" className="text-indigo-600" strokeWidth="9" strokeDasharray="251.2" 
                        strokeDashoffset={251.2 - (251.2 * (Math.min(profileData.total_credits, profileData.compute_credits) / Math.max(1, profileData.total_credits)))} 
                        strokeLinecap="round" stroke="currentColor" fill="transparent"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * (Math.min(profileData.total_credits, profileData.compute_credits) / Math.max(1, profileData.total_credits))) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm sm:text-base font-black text-slate-900 leading-none">{profileData.compute_credits}</span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ {profileData.total_credits}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider mt-2.5 text-center">Zaps</span>
                </div>

                {/* Ring 2: Export Quota */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="text-slate-100" strokeWidth="9" stroke="currentColor" fill="transparent" />
                      <motion.circle 
                        cx="50" cy="50" r="40" className="text-emerald-500" strokeWidth="9" strokeDasharray="251.2" 
                        strokeDashoffset={251.2 - (251.2 * (Math.min(exportLimit, profileData.export_count) / exportLimit))} 
                        strokeLinecap="round" stroke="currentColor" fill="transparent"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * (Math.min(exportLimit, profileData.export_count) / exportLimit)) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm sm:text-base font-black text-slate-900 leading-none">{profileData.export_count}</span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ {exportLimit}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider mt-2.5 text-center">Exports</span>
                </div>

                {/* Ring 3: Library Storage */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="text-slate-100" strokeWidth="9" stroke="currentColor" fill="transparent" />
                      <motion.circle 
                        cx="50" cy="50" r="40" className="text-amber-500" strokeWidth="9" strokeDasharray="251.2" 
                        strokeDashoffset={251.2 - (251.2 * (Math.min(storageLimit, profileData.saved_papers_count) / storageLimit))} 
                        strokeLinecap="round" stroke="currentColor" fill="transparent"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * (Math.min(storageLimit, profileData.saved_papers_count) / storageLimit)) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm sm:text-base font-black text-slate-900 leading-none">{profileData.saved_papers_count}</span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ {storageLimit}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider mt-2.5 text-center">Saved</span>
                </div>

              </div>

              {/* Weekly Refresh Countdown Banner */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-emerald-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Weekly Jump-Forward Reset</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    daysUntilRefresh === 0
                      ? 'bg-emerald-500 text-white'
                      : daysUntilRefresh <= 2
                        ? 'bg-amber-500 text-white'
                        : 'bg-indigo-600 text-white'
                  }`}>
                    {refreshLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/60">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Auto-Reset</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">
                      {nextResetDate ? nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '7 days from sync'}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/60">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quota Allocation</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">
                      +{profileData.total_credits || 500} Zaps / week
                    </div>
                  </div>
                </div>
              </div>

              {/* Zap Consumption Rate Card */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Tool Zap Rates</span>
                  <span className="text-[10px] font-bold text-slate-400 normal-case">Redis Cache = Free (0z)</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Literature Search & Discovery
                    </span>
                    <span className="font-black text-slate-800">0 Zaps (Free)</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> AI Outreach & Disclosure
                    </span>
                    <span className="font-black text-slate-800">10 Zaps</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> 3MT Scientific Pitch Suite
                    </span>
                    <span className="font-black text-slate-800">20 Zaps</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Standard Research Synthesis
                    </span>
                    <span className="font-black text-slate-800">50 Zaps</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Advanced Auditing
                    </span>
                    <span className="font-black text-slate-800">100 Zaps</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Deep Reasoning Manuscript
                    </span>
                    <span className="font-black text-slate-800">200 Zaps</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Research DNA Fingerprint Summary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <Award size={16} />
                  </div>
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Research DNA Fingerprint
                  </h2>
                </div>
                <Link 
                  to="/research-dna"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Full DNA <ArrowRight size={12} />
                </Link>
              </div>

              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Your algorithmic research vectors are mapped to <strong className="text-slate-900 font-bold">{profileData.academic_field}</strong>.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Audit History Logged</span>
                  <span className="text-indigo-600 font-black">{profileData.audit_sessions_count} Sessions</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Library Papers Bookmarked</span>
                  <span className="text-indigo-600 font-black">{profileData.saved_papers_count} Papers</span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </WorkspaceLayout>
  )
}

export default Profile
