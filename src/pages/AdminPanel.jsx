import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search, ShieldCheck, Ticket, Calendar as CalIcon, Loader2, Check, UserCheck,
  AlertCircle, Ban, Trash2, CreditCard, ToggleLeft, ToggleRight, Users, Zap,
  Radio, Bell, Megaphone, X, Key, Activity, Clock, FileText, RefreshCcw, RefreshCw,
  Server, Database, Cpu, ArrowUp, DollarSign, Layers, ChevronLeft, ChevronRight, Sliders, Terminal,
  Percent, CheckCircle2, XCircle, HardDrive, Flame, TrendingUp
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { BASE_URL, fireSessionExpired } from '../utils/api'

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspended: 'bg-amber-50 text-amber-700 border-amber-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200'
  }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${colors[status] || colors.active}`}>
      {status || 'active'}
    </span>
  )
}

const Toast = ({ msg }) => {
  if (!msg) return null
  return (
    <div className={`p-3 text-xs font-bold rounded-xl border flex items-center gap-2 mt-3 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
      {msg.type === 'success' ? <Check size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-rose-600" />}
      {msg.text}
    </div>
  )
}

const SystemHealthMonitor = ({ apiFetch }) => {
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await apiFetch('/api/admin/system-health')
        if (data && data.stat === 'ok') {
          setMonitors(data.monitors || [])
        } else {
          setError('Failed to fetch stats')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 60000)
    return () => clearInterval(interval)
  }, [apiFetch])

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Radio size={14} className="text-blue-600 animate-pulse" /> Edge Node Heartbeat Monitors
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">UptimeRobot Backend Proxy Engine</p>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-200">Live Proxy</span>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center"><Loader2 size={20} className="animate-spin text-indigo-600" /></div>
      ) : error ? (
        <div className="text-xs text-rose-600 font-semibold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {monitors.map(m => (
            <div key={m.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">{m.friendly_name}</div>
                <div className="text-[10px] text-slate-500">Uptime: <strong className="text-emerald-600">{m.custom_uptime_ratio}%</strong></div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${m.status === 2 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {m.status === 2 ? 'Operational' : 'Issue'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AIRoutingSettings = ({ authToken }) => {
  const [configs, setConfigs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  
  const providersList = ['groq', 'nvidia', 'mistral', 'openrouter']
  const [formStates, setFormStates] = useState({})

  const fetchRouting = async () => {
    if(!authToken) return
    try {
      setLoading(true)
      const data = await apiFetch('/api/admin/ai-routing')
      setConfigs(data)
      const fs = {}
      providersList.forEach(p => {
        const c = data.find(x => x.provider === p) || { provider: p, model_id: '', api_key: '', use_db_config: false }
        fs[p] = { ...c }
      })
      setFormStates(fs)

      const statData = await apiFetch('/api/admin/ai-routing/stats')
      setStats(statData)
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRouting()
  }, [authToken])

  const handleUpdate = async (p) => {
    try {
      const body = formStates[p]
      await apiFetch('/api/admin/ai-routing', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      toast.success(`Updated ${p} configuration`)
      fetchRouting()
    } catch (err) {
      console.error(err)
      toast.error('Update failed')
    }
  }

  const handleChange = (p, field, val) => {
    setFormStates(prev => ({ ...prev, [p]: { ...prev[p], [field]: val } }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dual-Source AI Resolver</h2>
          <p className="text-sm text-slate-500">Configure database overrides for AI models to safely bypass Vercel ENV defaults.</p>
        </div>
        <button onClick={fetchRouting} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors shadow-sm text-slate-700 text-sm">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh Status
        </button>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {providersList.map(p => {
          const fs = formStates[p] || {}
          const stat = stats[p] || {}
          const winning = fs.use_db_config ? 'Database Override' : 'Vercel ENV'
          const envWins = (stat['env_default']?.success || 0) + (stat['env_default']?.failed || 0)
          const dbWins = (stat['database_override']?.success || 0) + (stat['database_override']?.failed || 0)
          const liveSource = fs.use_db_config ? 'database_override' : 'env_default'
          const activeStatus = stat[liveSource]?.success > 0 ? 'Healthy' : (stat[liveSource]?.failed > 0 ? 'Failing' : 'Idle')

          return (
            <div key={p} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 capitalize flex items-center gap-2">
                  <Cpu size={18} className="text-indigo-500" /> {p}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    {fs.use_db_config ? <Database size={12} className="text-emerald-500" /> : <Server size={12} className="text-blue-500" />}
                    <span className="text-slate-600">{winning}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${activeStatus === 'Healthy' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : activeStatus === 'Failing' ? 'bg-rose-500 animate-bounce shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-slate-300'}`} title={`Status: ${activeStatus}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Model ID</label>
                  <input type="text" value={fs.model_id || ''} onChange={e => handleChange(p, 'model_id', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" placeholder="e.g. llama-3.1-8b-instant" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">API Key Override</label>
                  <input type="password" value={fs.api_key || ''} onChange={e => handleChange(p, 'api_key', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" placeholder="sk-..." />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${fs.use_db_config ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${fs.use_db_config ? 'translate-x-5' : ''}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={fs.use_db_config || false} onChange={e => handleChange(p, 'use_db_config', e.target.checked)} />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">Enable DB Config</span>
                </label>
                
                <button onClick={() => handleUpdate(p)} className="px-4 py-1.5 bg-[#FAFAF8] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#F3F3EF] transition-all flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Save State
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 flex items-center gap-1" title="Successful Requests (24h)"><Check size={12}/> {stat[liveSource]?.success || 0}</span>
                  <span className="text-rose-500 flex items-center gap-1" title="Failed Requests (24h)"><X size={12}/> {stat[liveSource]?.failed || 0}</span>
                </div>
                <span className="text-[10px] uppercase opacity-70 flex items-center gap-1"><Activity size={12}/> 24H Rolling Heartbeat</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminPanel({ user, profile, liveUsersCount = 1 }) {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [authToken, setAuthToken] = useState('')

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState('overview')

  // Command Center Metrics State
  const [metrics, setMetrics] = useState(null)
  const [logs, setLogs] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Upstash Management API State & Operational Controls
  const [upstashMgmt, setUpstashMgmt] = useState(null)
  const [loadingUpstashMgmt, setLoadingUpstashMgmt] = useState(false)
  const [opLoading, setOpLoading] = useState(null)

  // Operational Action Handlers
  const handleFlushCache = async () => {
    setOpLoading('flush')
    try {
      const res = await apiFetch('/api/admin/command-center/flush-cache', { method: 'POST' })
      toast.success(res.message || 'System cache cleared!')
    } catch (err) { toast.error(err.message) }
    finally { setOpLoading(null) }
  }

  const handleReindexVector = async () => {
    setOpLoading('reindex')
    try {
      const res = await apiFetch('/api/admin/command-center/reindex-vector', { method: 'POST', body: JSON.stringify({ clear_memory_store: true }) })
      toast.success(res.message || 'Vector store re-indexed!')
    } catch (err) { toast.error(err.message) }
    finally { setOpLoading(null) }
  }

  const handleResetCircuitBreakers = async () => {
    setOpLoading('breakers')
    try {
      const res = await apiFetch('/api/admin/command-center/reset-circuit-breakers', { method: 'POST' })
      toast.success(res.message || 'Circuit breakers reset!')
    } catch (err) { toast.error(err.message) }
    finally { setOpLoading(null) }
  }

  // Stats & Directory State
  const [stats, setStats] = useState({
    total_users: 0,
    active_subscribers: 0,
    total_revenue: 0,
    mrr: 0,
    tier_counts: { free: 0, starter: 0, pro: 0 },
    status_counts: { active: 0, suspended: 0, blocked: 0 },
    daily_growth: [],
    db_latency: 0,
    activity_grid: []
  })

  // Paginated user management state
  const [usersList, setUsersList] = useState([])
  const [userPage, setUserPage] = useState(1)
  const [userLimit] = useState(15)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [totalUserPages, setTotalUserPages] = useState(1)
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Payments & Coupons State
  const [pendingPayments, setPendingPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percent: 20, max_uses: 50, expires_at: '', applicable_packages: ['both'] })
  const [creatingCoupon, setCreatingCoupon] = useState(false)
  const [couponMsg, setCouponMsg] = useState(null)

  // Announcements State
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' })
  const [creatingAnnounce, setCreatingAnnounce] = useState(false)
  const [announcementMsg, setAnnouncementMsg] = useState(null)

  // Modals & Action States
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUserDeepDive, setSelectedUserDeepDive] = useState(null)
  const [loadingDeepDive, setLoadingDeepDive] = useState(false)
  
  // Enhanced Subscription Controls
  const [selectedTier, setSelectedTier] = useState('starter')
  const [durationMonths, setDurationMonths] = useState(1) // 1, 3, 6, 12, or 'custom'
  const [customExpiryDate, setCustomExpiryDate] = useState('')
  const [updatingTier, setUpdatingTier] = useState(false)
  const [tierMessage, setTierMessage] = useState(null)

  // Zap Allocation Controls
  const [customZapCredits, setCustomZapCredits] = useState(1000)
  const [updatingZaps, setUpdatingZaps] = useState(false)
  const [zapMessage, setZapMessage] = useState(null)

  const [actionLoading, setActionLoading] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  // Latency benchmark
  const [latency, setLatency] = useState(null)

  // Log viewer scroll ref
  const logContainerRef = useRef(null)
  const [logFilter, setLogFilter] = useState('ALL')

  // Intelligence Hub State
  const [intelStatus, setIntelStatus] = useState(null)
  const [loadingIntelStatus, setLoadingIntelStatus] = useState(false)
  const [intelNews, setIntelNews] = useState([])
  const [intelOpps, setIntelOpps] = useState([])
  const [intelTab, setIntelTab] = useState('news')
  const [togglingFeature, setTogglingFeature] = useState(null)

  const fetchIntelStatus = async () => {
    setLoadingIntelStatus(true)
    try {
      const data = await apiFetch('/api/admin/intelligence/pipeline-status', { method: 'GET' })
      setIntelStatus(data)
      const newsData = await apiFetch('/api/intelligence/news?limit=30', { method: 'GET' })
      if (newsData && newsData.articles) setIntelNews(newsData.articles)
      const oppsData = await apiFetch('/api/intelligence/opportunities?limit=30', { method: 'GET' })
      if (oppsData && oppsData.opportunities) setIntelOpps(oppsData.opportunities)
    } catch (err) { console.error(err) }
    finally { setLoadingIntelStatus(false) }
  }

  const handleToggleFeatureNews = async (newsId, currentFeatured) => {
    setTogglingFeature(newsId)
    try {
      await apiFetch('/api/admin/intelligence/feature-news', {
        method: 'POST',
        body: JSON.stringify({ news_id: newsId, is_featured: !currentFeatured })
      })
      toast.success(`News item ${!currentFeatured ? 'featured' : 'unfeatured'}`)
      setIntelNews(prev => prev.map(n => n.id === newsId ? { ...n, is_featured: !currentFeatured } : n))
    } catch (err) { toast.error(err.message) }
    finally { setTogglingFeature(null) }
  }

  const handleToggleFeatureOpp = async (oppId, currentFeatured) => {
    setTogglingFeature(oppId)
    try {
      await apiFetch('/api/admin/intelligence/feature-opportunity', {
        method: 'POST',
        body: JSON.stringify({ opportunity_id: oppId, is_featured: !currentFeatured })
      })
      toast.success(`Opportunity ${!currentFeatured ? 'featured' : 'unfeatured'}`)
      setIntelOpps(prev => prev.map(o => o.id === oppId ? { ...o, is_featured: !currentFeatured } : o))
    } catch (err) { toast.error(err.message) }
    finally { setTogglingFeature(null) }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { navigate('/auth'); return }
        setAuthToken(session.access_token)

        const userRole = profile?.role || session.user?.user_metadata?.role
        const hardcodedAdmin = (session.user?.email === 'arupbhowmikpritom@gmail.com')

        if (userRole === 'admin' || hardcodedAdmin) {
          setIsAdmin(true)
        } else {
          toast.error('Access denied: Admin privileges required.')
          navigate('/')
        }
      } catch (err) {
        console.error('Admin Check Error:', err)
        navigate('/')
      } finally {
        setCheckingAdmin(false)
      }
    }
    checkAdmin()
  }, [user, profile, navigate])

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', ...options.headers }
    })
    if (res.status === 402) {
      const err = await res.json().catch(() => ({}))
      fireSessionExpired(err.detail || 'Your premium plan has expired.')
      throw new Error(err.detail || 'Payment Required')
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Request failed (${res.status})`)
    }
    return res.json()
  }

  // Command Center Metrics
  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/command-center/metrics', { method: 'GET' })
      setMetrics(data)
      const logsRes = await apiFetch('/api/admin/command-center/system-logs?limit=40', { method: 'GET' })
      if (logsRes?.logs) setLogs(logsRes.logs)
      const actRes = await apiFetch('/api/admin/command-center/activity-stream?limit=15', { method: 'GET' })
      if (actRes?.activities) setActivities(actRes.activities)
    } catch (err) {
      console.error('Failed to fetch Command Center metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Upstash Developer Management Stats
  const fetchUpstashMgmt = async () => {
    setLoadingUpstashMgmt(true)
    try {
      const data = await apiFetch('/api/admin/command-center/upstash-mgmt', { method: 'GET' })
      setUpstashMgmt(data)
    } catch (err) {
      console.error('Failed to fetch Upstash Management stats:', err)
    } finally {
      setLoadingUpstashMgmt(false)
    }
  }

  // Fetch Users with Server-Side Pagination
  const fetchAllUsers = async (p = userPage, s = searchTerm, t = tierFilter, st = statusFilter) => {
    setLoadingUsers(true)
    try {
      const query = new URLSearchParams({
        page: p,
        limit: userLimit,
        search: s || '',
        tier: t || 'all',
        status: st || 'all'
      }).toString()
      const data = await apiFetch(`/api/admin/users/all?${query}`, { method: 'GET' })
      if (data && data.users) {
        setUsersList(data.users)
        setTotalUsersCount(data.total || 0)
        setTotalUserPages(data.pages || 1)
      } else if (Array.isArray(data)) {
        setUsersList(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchStats = async () => {
    const start = performance.now()
    try {
      const data = await apiFetch('/api/admin/stats', { method: 'GET' })
      setLatency(Math.round(performance.now() - start))
      setStats(data)
    } catch (err) { console.error(err) }
  }

  const fetchAnnouncements = async () => {
    try {
      const data = await apiFetch('/api/admin/announcements', { method: 'GET' })
      setAnnouncements(data)
    } catch (err) { console.error(err) }
  }

  const fetchPendingPayments = async () => {
    setLoadingPayments(true)
    try {
      const data = await apiFetch('/api/admin/payments/pending', { method: 'GET' })
      if (Array.isArray(data)) setPendingPayments(data)
    } catch (err) { console.error(err) }
    finally { setLoadingPayments(false) }
  }

  const fetchCoupons = async () => {
    setLoadingCoupons(true)
    try {
      const data = await apiFetch('/api/admin/coupons', { method: 'GET' })
      if (Array.isArray(data)) setCoupons(data)
    } catch (err) { console.error(err) }
    finally { setLoadingCoupons(false) }
  }

  useEffect(() => {
    if (authToken && isAdmin) {
      fetchStats()
      fetchMetrics()
    }
  }, [authToken, isAdmin])

  useEffect(() => {
    if (!authToken || !isAdmin) return
    if (activeTab === 'users') {
      fetchAllUsers(userPage, searchTerm, tierFilter, statusFilter)
    } else if (activeTab === 'intelligence') {
      fetchIntelStatus()
    } else if (activeTab === 'upstash') {
      fetchUpstashMgmt()
    } else if (activeTab === 'payments') {
      fetchPendingPayments()
    } else if (activeTab === 'coupons') {
      fetchCoupons()
    } else if (activeTab === 'announcements') {
      fetchAnnouncements()
    }
  }, [authToken, isAdmin, activeTab, userPage, tierFilter, statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setUserPage(1)
    fetchAllUsers(1, searchTerm, tierFilter, statusFilter)
  }

  const handlePostAnnouncement = async (e) => {
    e.preventDefault()
    if (!newAnnouncement.title || !newAnnouncement.content) return
    setCreatingAnnounce(true)
    try {
      await apiFetch('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: newAnnouncement.title,
          message: newAnnouncement.content,
          type: newAnnouncement.type
        })
      })
      setAnnouncementMsg({ type: 'success', text: 'Announcement broadcasted successfully.' })
      setNewAnnouncement({ title: '', content: '', type: 'info' })
      fetchAnnouncements()
    } catch (err) {
      setAnnouncementMsg({ type: 'error', text: err.message })
    } finally {
      setCreatingAnnounce(false)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    try {
      await apiFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      fetchAnnouncements()
    } catch (err) { console.error(err) }
  }

  const handlePaymentAction = async (requestId, action) => {
    try {
      const res = await apiFetch('/api/admin/payments/action', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, action })
      })
      toast.success(res.message || `Payment ${action}d`)
      fetchPendingPayments()
      fetchAllUsers()
    } catch (err) { toast.error(err.message) }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!newCoupon.code) return
    setCreatingCoupon(true)
    try {
      const res = await apiFetch('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          ...newCoupon,
          applicable_tier: newCoupon.applicable_packages.join(',')
        })
      })
      setCouponMsg({ type: 'success', text: res.message || 'Coupon created successfully' })
      setNewCoupon({ code: '', discount_percent: 20, max_uses: 50, expires_at: '', applicable_packages: ['both'] })
      fetchCoupons()
    } catch (err) { setCouponMsg({ type: 'error', text: err.message }) }
    finally { setCreatingCoupon(false) }
  }

  const handleDeleteCoupon = async (id) => {
    try {
      await apiFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      toast.success('Coupon deleted')
      fetchCoupons()
    } catch (err) { toast.error(err.message) }
  }

  const handleOpenUserModal = async (u) => {
    setSelectedUser(u)
    setSelectedUserDeepDive(null)
    setShowUserModal(true)
    setLoadingDeepDive(true)
    setTierMessage(null)
    setZapMessage(null)
    setDurationMonths(1)
    setCustomExpiryDate('')

    try {
      const data = await apiFetch(`/api/admin/users/search?email=${encodeURIComponent(u.email)}`, { method: 'GET' })
      setSelectedUserDeepDive(data)
      setSelectedTier(data.current_tier || 'starter')
      setCustomZapCredits(data.compute_credits || (data.current_tier === 'pro' ? 15000 : data.current_tier === 'starter' ? 5000 : 1000))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDeepDive(false)
    }
  }

  const handleActivatePlan = async () => {
    if (!selectedUserDeepDive) return
    setUpdatingTier(true); setTierMessage(null)
    try {
      let customIso = null
      if (durationMonths === 'custom' && customExpiryDate) {
        customIso = new Date(customExpiryDate).toISOString()
      }

      const data = await apiFetch('/api/admin/users/tier', {
        method: 'POST',
        body: JSON.stringify({ 
          user_id: selectedUserDeepDive.id, 
          tier: selectedTier, 
          duration_months: typeof durationMonths === 'number' ? durationMonths : 1,
          custom_expires_at: customIso
        })
      })
      setTierMessage({ type: 'success', text: data.message })
      setSelectedUserDeepDive(prev => ({ ...prev, current_tier: selectedTier, plan_expiry_date: data.expires_at }))
      fetchAllUsers()
    } catch (err) { setTierMessage({ type: 'error', text: err.message }) }
    finally { setUpdatingTier(false) }
  }

  const handleAdjustZaps = async () => {
    if (!selectedUserDeepDive) return
    setUpdatingZaps(true); setZapMessage(null)
    try {
      const data = await apiFetch('/api/admin/users/zaps', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedUserDeepDive.id,
          compute_credits: parseInt(customZapCredits) || 1000
        })
      })
      setZapMessage({ type: 'success', text: data.message })
      setSelectedUserDeepDive(prev => ({ ...prev, compute_credits: parseInt(customZapCredits) || 1000 }))
      fetchAllUsers()
    } catch (err) {
      setZapMessage({ type: 'error', text: err.message })
    } finally {
      setUpdatingZaps(false)
    }
  }

  const handleUserAction = async (action) => {
    if (!selectedUserDeepDive) return
    setActionLoading(action); setActionMessage(null)
    try {
      if (action === 'reset_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(selectedUserDeepDive.email)
        if (error) throw error
        setActionMessage({ type: 'success', text: 'Password reset link sent to user email.' })
      } else {
        const data = await apiFetch(`/api/admin/users/${action}`, {
          method: 'POST',
          body: JSON.stringify({ user_id: selectedUserDeepDive.id })
        })
        setActionMessage({ type: 'success', text: data.message })
        if (action === 'delete') {
          setShowUserModal(false)
          fetchAllUsers()
        }
      }
    } catch (err) { setActionMessage({ type: 'error', text: err.message }) }
    finally { setActionLoading(null) }
  }

  const scrollToTopLogs = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-xs font-black tracking-widest uppercase text-slate-500">Authenticating Command Center Access...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  const filteredLogs = logs.filter(l => logFilter === 'ALL' || l.level === logFilter)

  // Calculate live preview date for modal
  const calculatePreviewExpiry = () => {
    if (selectedTier === 'free') return 'Lifetime Basic Access'
    if (durationMonths === 'custom') {
      if (!customExpiryDate) return 'Select a custom calendar date below'
      return `Expires on ${new Date(customExpiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
    }
    const days = durationMonths === 12 ? 365 : durationMonths * 30
    const d = new Date()
    d.setDate(d.getDate() + days)
    return `Expires on ${d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} (${days} Days)`
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* ── Top Command Bar ── */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-900 truncate">ScholarHub Admin</h1>
            <span className="hidden sm:block text-[10px] text-indigo-600 font-bold truncate">Comprehensive SaaS Observability & Financial Control</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
            <span>{liveUsersCount} Active Session{liveUsersCount === 1 ? '' : 's'}</span>
          </div>
          <button
            onClick={() => { fetchMetrics(); fetchUpstashMgmt(); fetchStats(); fetchAllUsers(); fetchPendingPayments(); fetchCoupons(); }}
            className="px-2.5 py-1.5 sm:px-3.5 bg-[#FAFAF8] hover:bg-[#F3F3EF] text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh Data</span><span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Tab Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap z-20 shrink-0">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
          { id: 'ai_routing', label: 'AI Engine', icon: Cpu },
          { id: 'upstash', label: 'Upstash', icon: Database },
          { id: 'intelligence', label: 'Intelligence', icon: Radio },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'payments', label: 'Payments', icon: CreditCard, badge: pendingPayments.length },
          { id: 'coupons', label: 'Coupons', icon: Percent },
          { id: 'announcements', label: 'Announce', icon: Megaphone },
          { id: 'logs', label: 'Logs', icon: Terminal }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                active 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Main Layout: Sidebar + Dashboard ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/90 p-4 shrink-0 flex flex-col justify-between hidden md:flex">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 mb-2 block">Command Menu</span>
            
            {[
              { id: 'overview', label: 'Overview & Burn Rate', icon: LayoutDashboardIcon },
              { id: 'ai_routing', label: 'AI Resolver Engine', icon: Cpu },
              { id: 'upstash', label: 'Upstash & DB Metrics', icon: Database },
              { id: 'intelligence', label: 'Intelligence Hub', icon: Radio },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'payments', label: 'Manual Payments', icon: CreditCard, badge: pendingPayments.length },
              { id: 'coupons', label: 'Discounts & Coupons', icon: Percent },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'logs', label: 'System Logs', icon: Terminal }
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={active ? 'text-white' : 'text-slate-500'} />
                    {tab.label}
                  </div>
                  {tab.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-500">API Health</span>
              <span className="font-mono text-emerald-600 font-extrabold">{latency ? `${latency}ms` : 'Connecting...'}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full animate-pulse" />
            </div>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {activeTab === 'ai_routing' && (
            <AIRoutingSettings authToken={authToken} />
          )}
          
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: 'Total Registered Users', val: stats.total_users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                  { title: 'Active Subscribers', val: stats.active_subscribers, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
                  { title: 'Pro Tier Members', val: stats.tier_counts?.pro || 0, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
                  { title: 'Starter Tier Members', val: stats.tier_counts?.starter || 0, icon: Ticket, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
                ].map((m, idx) => {
                  const Icon = m.icon
                  return (
                    <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.title}</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{m.val}</div>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl ${m.bg} border flex items-center justify-center ${m.color}`}>
                        <Icon size={22} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Financial Dashboard */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" /> Platform Financial Overview
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Estimated monthly revenue, costs, and profit margin in BDT (৳)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Est. Gross MRR</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">৳{((stats?.tier_counts?.starter || 0) * 150 + (stats?.tier_counts?.pro || 0) * 500).toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">Based on active subscriptions</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Est. Platform Cost</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">৳21,600</div>
                    <span className="text-[10px] text-red-500 font-bold block mt-1">Vercel, Render, DB, APIs</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Monthly Profit</span>
                    <div className={`text-2xl font-black mt-1 ${(((stats?.tier_counts?.starter || 0) * 150 + (stats?.tier_counts?.pro || 0) * 500) - 21600) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      ৳{(((stats?.tier_counts?.starter || 0) * 150 + (stats?.tier_counts?.pro || 0) * 500) - 21600).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">MRR - Platform Cost</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure Cost & Burn Rate Analytics Box */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Flame size={16} className="text-amber-500" /> SaaS Infrastructure & API Burn Rate Estimate
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time compute & API endpoint cost breakdown</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-black">
                    Est. Total Burn: ${upstashMgmt?.estimated_monthly_burn_usd !== undefined ? upstashMgmt.estimated_monthly_burn_usd.toFixed(2) : '0.00'} / mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Upstash Redis</span>
                    <div className="text-xl font-black text-slate-900 mt-1">${upstashMgmt?.breakdown?.upstash_redis_usd !== undefined ? upstashMgmt.breakdown.upstash_redis_usd.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">/mo</span></div>
                    <span className="text-[10px] text-slate-500 block mt-1">Keys: {upstashMgmt?.redis_mgmt?.keys_count || 0}</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Upstash Vector (768d)</span>
                    <div className="text-xl font-black text-slate-900 mt-1">${upstashMgmt?.breakdown?.upstash_vector_usd !== undefined ? upstashMgmt.breakdown.upstash_vector_usd.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">/mo</span></div>
                    <span className="text-[10px] text-slate-500 block mt-1">Vectors: {upstashMgmt?.vector_mgmt?.vector_count || 0}</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Groq & LLM APIs</span>
                    <div className="text-xl font-black text-slate-900 mt-1">${upstashMgmt?.breakdown?.ai_inference_usd !== undefined ? upstashMgmt.breakdown.ai_inference_usd.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">/mo</span></div>
                    <span className="text-[10px] text-slate-500 block mt-1">Llama 3.3 70B & DeepSeek</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Supabase Database</span>
                    <div className="text-xl font-black text-slate-900 mt-1">${upstashMgmt?.breakdown?.supabase_db_usd !== undefined ? upstashMgmt.breakdown.supabase_db_usd.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">/mo</span></div>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">Free Tier Active</span>
                  </div>
                </div>

                {/* Operational Control Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-black uppercase text-slate-500 mr-2">Operational Controls:</span>
                  
                  <button
                    onClick={handleFlushCache}
                    disabled={opLoading === 'flush'}
                    className="px-4 py-2 bg-[#FAFAF8] hover:bg-[#F3F3EF] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {opLoading === 'flush' ? <Loader2 size={14} className="animate-spin" /> : <HardDrive size={14} />} Flush Redis Cache
                  </button>

                  <button
                    onClick={handleReindexVector}
                    disabled={opLoading === 'reindex'}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {opLoading === 'reindex' ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} Re-index Vector DB
                  </button>

                  <button
                    onClick={handleResetCircuitBreakers}
                    disabled={opLoading === 'breakers'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {opLoading === 'breakers' ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Reset Circuit Breakers
                  </button>
                </div>
              </div>

              {/* Edge Node Monitors & Self Healing */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SystemHealthMonitor apiFetch={apiFetch} />
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-emerald-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">System Circuit Breakers</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Upstash Redis', key: 'upstash_redis' },
                      { label: 'Upstash Vector (768d)', key: 'upstash_vector' },
                      { label: 'Supabase Database', key: 'supabase_db' },
                      { label: 'Groq AI Pool', key: 'groq_ai' },
                      { label: 'OpenRouter AI Pool', key: 'openrouter_ai' }
                    ].map(node => (
                      <div key={node.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                        <span className="font-bold text-slate-700">{node.label}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          CONNECTED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPSTASH & DB METRICS */}
          {activeTab === 'upstash' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Redis Key Count</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{upstashMgmt?.redis_mgmt?.keys_count || 0} Keys</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Memory Cache Ring Buffer</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Vector Embeddings</span>
                  <div className="text-3xl font-black text-indigo-600 mt-2">{upstashMgmt?.vector_mgmt?.vector_count || 0} Vectors</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">768-Dimension Dense Index</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">DB Query Latency</span>
                  <div className="text-3xl font-black text-emerald-600 mt-2">{latency || 18} ms</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Supabase PostgreSQL Connection</p>
                </div>
              </div>

              {/* User Activity Stream */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600" /> Real-Time Researcher Activity Stream
                </h3>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium">No recent user activity logs.</div>
                  ) : (
                    activities.map((act, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          <div>
                            <span className="font-bold text-slate-900">{act.user_email || 'User'}</span>
                            <span className="text-slate-500 ml-2">{act.action_details || act.action}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INTELLIGENCE HUB */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              {/* Pipeline Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">News Feed Engine</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Autonomous RSS</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2">{intelStatus?.news_pipeline?.total_articles || 0} Articles</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">9 Active Syndication Sources • {intelStatus?.news_pipeline?.featured_count || 0} Featured</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Opportunity Ingestion</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">EURAXESS REST</span>
                  </div>
                  <div className="text-3xl font-black text-indigo-600 mt-2">{intelStatus?.opportunity_pipeline?.active_opportunities || 0} Opportunities</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Auto Expiry Monitor Active • {intelStatus?.opportunity_pipeline?.featured_count || 0} Featured</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Manual Ingestion Trigger</span>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Force immediate fetch cycle</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await apiFetch('/api/intelligence/trigger-fetch', { method: 'POST' })
                        toast.success(res.message)
                        fetchIntelStatus()
                      } catch (err) { toast.error(err.message) }
                    }}
                    className="mt-3 w-full py-2 bg-[#FAFAF8] hover:bg-[#F3F3EF] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCcw size={14} /> Run Fetch Cycle Now
                  </button>
                </div>
              </div>

              {/* Content Curation & Featuring Section */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Radio size={16} className="text-indigo-600" /> Research Intelligence Content Manager
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Feature high-impact news and scholarship opportunities on the user dashboard</p>
                  </div>

                  {/* Sub-tabs switch */}
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setIntelTab('news')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${intelTab === 'news' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      News Articles ({intelNews.length})
                    </button>
                    <button
                      onClick={() => setIntelTab('opportunities')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${intelTab === 'opportunities' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Opportunities ({intelOpps.length})
                    </button>
                  </div>
                </div>

                {loadingIntelStatus ? (
                  <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-indigo-600" /></div>
                ) : intelTab === 'news' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Source</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {intelNews.map(n => (
                          <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{n.title}</td>
                            <td className="py-3 px-4 text-slate-500 font-semibold">{n.source}</td>
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">{n.category}</span></td>
                            <td className="py-3 px-4">
                              {n.is_featured ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">FEATURED</span>
                              ) : (
                                <span className="text-slate-500 font-medium">Standard</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleFeatureNews(n.id, n.is_featured)}
                                disabled={togglingFeature === n.id}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${n.is_featured ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                              >
                                {togglingFeature === n.id ? <Loader2 size={12} className="animate-spin" /> : n.is_featured ? 'Unfeature' : 'Feature'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Organization</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {intelOpps.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{o.title}</td>
                            <td className="py-3 px-4 text-slate-500 font-semibold">{o.organization || 'Global'}</td>
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 uppercase">{o.opportunity_type}</span></td>
                            <td className="py-3 px-4">
                              {o.is_featured ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">FEATURED</span>
                              ) : (
                                <span className="text-slate-500 font-medium">Standard</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleFeatureOpp(o.id, o.is_featured)}
                                disabled={togglingFeature === o.id}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${o.is_featured ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                              >
                                {togglingFeature === o.id ? <Loader2 size={12} className="animate-spin" /> : o.is_featured ? 'Unfeature' : 'Feature'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">User Directory & Management</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Total Users Registered: {totalUsersCount}</p>
                </div>

                {/* Filters & Search */}
                <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search email, name..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48"
                    />
                  </div>

                  <select
                    value={tierFilter}
                    onChange={e => setTierFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>

                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer">
                    Search
                  </button>
                </form>
              </div>

              {/* Table */}
              {loadingUsers ? (
                <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-indigo-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Current Tier</th>
                        <th className="py-3 px-4">Expiry Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-medium">No researchers found.</td></tr>
                      ) : (
                        usersList.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{u.full_name || 'Academic User'}</div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${
                                u.current_tier === 'pro' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                u.current_tier === 'starter' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {u.current_tier || 'free'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">
                              {u.plan_expiry_date ? new Date(u.plan_expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Lifetime Basic'}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={u.status} />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleOpenUserModal(u)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Manage User
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                <span>Page {userPage} of {totalUserPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={userPage <= 1}
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={userPage >= totalUserPages}
                    onClick={() => setUserPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MANUAL PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CreditCard size={16} className="text-indigo-600" /> Pending Manual Payment Verification
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Approve bKash / Nagad / Bank transfers to activate subscriptions</p>
              </div>

              {loadingPayments ? (
                <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-indigo-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">User Email</th>
                        <th className="py-3 px-4">Method & Trx ID</th>
                        <th className="py-3 px-4">Requested Package</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingPayments.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-medium">No pending payment verification requests.</td></tr>
                      ) : (
                        pendingPayments.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{p.email || p.user_email || p.user_id}</td>
                            <td className="py-3 px-4 font-mono">
                              <span className="font-bold text-slate-800">{p.payment_method?.toUpperCase() || 'BKASH'}</span> - {p.transaction_id || p.trx_id}
                            </td>
                            <td className="py-3 px-4 font-bold uppercase text-purple-700">{p.package || 'starter'}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">৳{p.amount || 500}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handlePaymentAction(p.id, 'approve')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePaymentAction(p.id, 'reject')}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Percent size={16} className="text-indigo-600" /> Create Discount Coupon
                </h2>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SCHOLAR50"
                      value={newCoupon.code}
                      onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newCoupon.discount_percent}
                        onChange={e => setNewCoupon({ ...newCoupon, discount_percent: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Max Uses</label>
                      <input
                        type="number"
                        min="1"
                        value={newCoupon.max_uses}
                        onChange={e => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={newCoupon.expires_at}
                      onChange={e => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Applicable Packages</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      {[
                        { id: 'both', label: 'All Packages (Global)' },
                        { id: 'starter_1_month', label: 'Starter 1 Month' },
                        { id: 'starter_3_months', label: 'Starter 3 Months' },
                        { id: 'starter_6_months', label: 'Starter 6 Months' },
                        { id: 'starter_1_year', label: 'Starter 1 Year' },
                        { id: 'pro_1_month', label: 'Pro 1 Month' },
                        { id: 'pro_3_months', label: 'Pro 3 Months' },
                        { id: 'pro_6_months', label: 'Pro 6 Months' },
                        { id: 'pro_1_year', label: 'Pro 1 Year' }
                      ].map(pkg => (
                        <label key={pkg.id} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newCoupon.applicable_packages.includes(pkg.id)}
                            onChange={(e) => {
                              let updated = [...newCoupon.applicable_packages];
                              if (pkg.id === 'both') {
                                updated = e.target.checked ? ['both'] : [];
                              } else {
                                updated = updated.filter(p => p !== 'both');
                                if (e.target.checked) updated.push(pkg.id);
                                else updated = updated.filter(p => p !== pkg.id);
                              }
                              setNewCoupon({ ...newCoupon, applicable_packages: updated })
                            }}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[10px] font-bold text-slate-700">{pkg.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingCoupon}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {creatingCoupon ? <Loader2 size={16} className="animate-spin" /> : <Percent size={16} />} Create Promo Code
                  </button>

                  <Toast msg={couponMsg} />
                </form>
              </div>

              {/* Coupons List */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Active Coupons Directory</h2>
                <div className="space-y-3 max-h-[420px] overflow-y-auto">
                  {coupons.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium">No active promo codes.</div>
                  ) : (
                    coupons.map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black font-mono text-indigo-600">{c.code}</div>
                          <div className="text-xs font-semibold text-slate-700 mt-0.5">{c.discount_percent}% OFF · {c.current_uses || 0}/{c.max_uses} used</div>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Megaphone size={16} className="text-indigo-600" /> Broadcast System Announcement
                </h2>

                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Announcement Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Scheduled System Maintenance"
                      value={newAnnouncement.title}
                      onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Message Content</label>
                    <textarea
                      rows={4}
                      placeholder="Enter broadcast message details for researchers..."
                      value={newAnnouncement.content}
                      onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Notification Priority</label>
                    <select
                      value={newAnnouncement.type}
                      onChange={e => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="info">Info / General Update</option>
                      <option value="warning">Warning / Alert</option>
                      <option value="critical">Critical / Emergency</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingAnnounce}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {creatingAnnounce ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />} Post Announcement
                  </button>

                  <Toast msg={announcementMsg} />
                </form>
              </div>

              {/* Active Announcements List */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Live Announcements History</h2>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {announcements.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium">No announcements published yet.</div>
                  ) : (
                    announcements.map(a => (
                      <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{a.title}</div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.message}</p>
                          <span className="text-[9px] text-slate-500 font-mono mt-2 block">{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Announcement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Terminal size={16} className="text-indigo-600" /> Command Center System Logs
                </h2>

                <div className="flex items-center gap-2">
                  {['ALL', 'SHIELD', 'SUCCESS', 'WARNING', 'ERROR'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                        logFilter === lvl ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Stream Container */}
              <div
                ref={logContainerRef}
                className="h-96 bg-[#FAFAF8] rounded-2xl border border-[#E5E5DF] p-4 font-mono text-xs overflow-y-auto space-y-2 relative"
              >
                {filteredLogs.length === 0 ? (
                  <div className="text-slate-500 italic">No log entries matching filter '{logFilter}'</div>
                ) : (
                  filteredLogs.map((l, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[#171717] hover:bg-[#F3F3EF]/60 p-1.5 rounded transition-colors text-[11px]">
                      <span className="text-slate-500 shrink-0">[{l.timestamp}]</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                        l.level === 'SHIELD' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                        l.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        l.level === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {l.level}
                      </span>
                      <span className="text-slate-500 shrink-0">[{l.category}]</span>
                      <span className="text-[#171717]">{l.message}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={scrollToTopLogs}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUp size={14} /> Back to Top
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── User Deep Dive Modal ── */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-[#FAFAF8]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-sm relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={18} className="text-indigo-600" /> Researcher Deep Dive
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">{selectedUser.email}</p>
            </div>

            {loadingDeepDive ? (
              <div className="py-8 flex justify-center"><Loader2 size={24} className="animate-spin text-indigo-600" /></div>
            ) : (
              <div className="space-y-5 text-xs text-slate-700">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between"><span>User ID:</span><strong className="text-indigo-600 font-mono text-[11px]">{selectedUser.id}</strong></div>
                  <div className="flex justify-between"><span>Full Name:</span><strong className="text-slate-900">{selectedUser.full_name || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span>Current Tier:</span><strong className="text-purple-700 uppercase font-black">{selectedUserDeepDive?.current_tier || 'free'}</strong></div>
                  <div className="flex justify-between"><span>Current Zaps Available:</span><strong className="text-emerald-700 font-black">{selectedUserDeepDive?.compute_credits || 1000} Zaps</strong></div>
                  <div className="flex justify-between"><span>Active Plan Expiry:</span><strong className="text-slate-800 font-mono">{selectedUserDeepDive?.plan_expiry_date ? new Date(selectedUserDeepDive.plan_expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Lifetime Basic Access'}</strong></div>
                </div>

                {/* 1. Plan Tier & Duration Controls */}
                <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-600" /> Upgrade / Override Subscription Tier
                  </label>

                  {/* Tier Selector Buttons */}
                  <div className="flex gap-2">
                    {[
                      { id: 'free', label: 'FREE (Lifetime)' },
                      { id: 'starter', label: 'STARTER (5k Zaps)' },
                      { id: 'pro', label: 'PRO (15k Zaps)' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTier(t.id)}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          selectedTier === t.id 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Duration Selector (Only if Tier != 'free') */}
                  {selectedTier !== 'free' && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Select Duration Period</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 1, label: '1 Month' },
                          { value: 3, label: '3 Months' },
                          { value: 6, label: '6 Months' },
                          { value: 12, label: '1 Year' },
                          { value: 'custom', label: 'Custom Date' }
                        ].map(d => (
                          <button
                            key={d.value}
                            onClick={() => setDurationMonths(d.value)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              durationMonths === d.value
                                ? 'bg-[#FAFAF8] text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Calendar Date Input */}
                      {durationMonths === 'custom' && (
                        <div className="mt-2">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Pick Custom Expiry Date:</label>
                          <input
                            type="date"
                            value={customExpiryDate}
                            onChange={e => setCustomExpiryDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      )}

                      {/* Live Expiry Preview */}
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-bold text-indigo-900 text-center">
                        {calculatePreviewExpiry()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleActivatePlan}
                    disabled={updatingTier}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {updatingTier ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Update Researcher Subscription
                  </button>
                  <Toast msg={tierMessage} />
                </div>

                {/* 2. Direct Zap Credit Control */}
                <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" /> Direct Compute Zaps Adjustment
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customZapCredits}
                      onChange={e => setCustomZapCredits(e.target.value)}
                      placeholder="Enter Zap credits..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAdjustZaps}
                      disabled={updatingZaps}
                      className="px-4 py-2 bg-[#FAFAF8] hover:bg-[#F3F3EF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {updatingZaps ? <Loader2 size={14} className="animate-spin" /> : 'Set Zaps'}
                    </button>
                  </div>
                  <Toast msg={zapMessage} />
                </div>

                {/* 3. Security & Account Actions */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Security & Account Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUserAction('reset_password')}
                      className="py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleUserAction(selectedUser.status === 'suspended' ? 'activate' : 'suspend')}
                      className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
                    >
                      {selectedUser.status === 'suspended' ? 'Unsuspend Account' : 'Suspend Account'}
                    </button>
                  </div>
                  <Toast msg={actionMessage} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LayoutDashboardIcon(props) {
  return <Layers {...props} />
}
