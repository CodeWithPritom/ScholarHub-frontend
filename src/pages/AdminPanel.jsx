import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Ticket, Calendar as CalIcon, Loader2, Check, UserCheck, AlertCircle, Ban, Trash2, CreditCard, ToggleLeft, ToggleRight, Users, Zap, Radio, Bell, Megaphone, X, Key, Activity, Clock, FileText, RefreshCcw } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { BASE_URL, fireSessionExpired } from '../utils/api'

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colors = { active: 'bg-green-50 text-green-600 border-green-100', suspended: 'bg-amber-50 text-amber-600 border-amber-100', blocked: 'bg-red-50 text-red-600 border-red-100' }
  return <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${colors[status] || colors.active}`}>{status || 'active'}</span>
}

const Toast = ({ msg }) => {
  if (!msg) return null
  return (
    <div className={`p-3 text-xs font-bold rounded-lg border flex items-center gap-2 mt-3 ${msg.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
      {msg.type === 'success' ? <Check size={14}/> : <AlertCircle size={14}/>}
      {msg.text}
    </div>
  )
}

const SystemHealthMonitor = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'api_key=ur3554743-623e350478067b26cb96f10a&format=json&custom_uptime_ratios=1&logs=1',
        });
        
        const data = await response.json();
        if (data.stat === 'ok') {
          setMonitors(data.monitors);
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> External Server Health
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time UptimeRobot Monitors (24H)</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Feed
        </span>
      </div>

      {loading && !monitors.length ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-slate-300" size={24} /></div>
      ) : error ? (
        <div className="text-xs text-red-500 font-bold text-center py-4 bg-red-50 rounded-xl">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitors.map(m => {
            const isUp = m.status === 2;
            const lastIncidentLog = m.logs?.find(log => log.type === 1);
            const lastIncidentDate = lastIncidentLog ? new Date(lastIncidentLog.datetime * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No recent incidents';
            
            return (
              <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 gap-4 transition-all hover:border-blue-100 hover:shadow-md">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${isUp ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-800 flex items-center gap-2 truncate">
                      {m.url.includes('render.com') ? 'Primary Cloud (Render)' : m.url.includes('ts.net') ? 'Home Backup (Tailscale)' : m.friendly_name}
                      {!isUp && <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider bg-red-100 text-red-600 shrink-0">Down</span>}
                    </div>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 font-bold hover:text-blue-500 transition-colors truncate block">{m.url}</a>
                    <div className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock size={10} className="text-slate-300" />
                      Last Incident: <span className="font-bold text-slate-500">{lastIncidentDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className={`text-xl font-black ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {parseFloat(m.custom_uptime_ratio).toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">24H Uptime</div>
                </div>
              </div>
            );
          })}
          {monitors.length === 0 && (
            <div className="text-xs text-slate-500 font-bold col-span-1 md:col-span-2 text-center py-4 bg-slate-50 rounded-xl">No monitors found.</div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminPanel = ({ user, profile, liveUsersCount }) => {
  const navigate = useNavigate()
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [authToken, setAuthToken] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Stats
  const [stats, setStats] = useState({ total_users: 0, active_subs: 0, total_ai_summaries: 0, daily_growth: [], activity_grid: [] })
  const [latency, setLatency] = useState(null)
  
  // Announcements
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' })
  const [announcementMsg, setAnnouncementMsg] = useState(null)
  const [creatingAnnounce, setCreatingAnnounce] = useState(false)

  // Users Directory
  const [usersList, setUsersList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // User Modal
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserDeepDive, setSelectedUserDeepDive] = useState(null)
  const [loadingDeepDive, setLoadingDeepDive] = useState(false)

  // Tier Activator
  const [selectedTier, setSelectedTier] = useState('starter')
  const [durationMonths, setDurationMonths] = useState(1)
  const [updatingTier, setUpdatingTier] = useState(false)
  const [tierMessage, setTierMessage] = useState(null)

  // Account Actions
  const [actionLoading, setActionLoading] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  // Subscriptions & Payments
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentAction, setPaymentAction] = useState(null)
  
  // Coupons
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(100)
  const [maxUses, setMaxUses] = useState(1)
  const [couponExpiry, setCouponExpiry] = useState('')
  const [applicableTier, setApplicableTier] = useState('both')
  const [creatingCoupon, setCreatingCoupon] = useState(false)
  const [couponMessage, setCouponMessage] = useState(null)
  const [coupons, setCoupons] = useState([])
  const [couponsLoading, setCouponsLoading] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { navigate('/'); return }
      
      if (user.email === 'arupbhowmikpritom@gmail.com') {
        const { data } = await supabase.auth.getSession()
        setAuthToken(data.session?.access_token)
        setLoadingAccess(false)
        return
      }

      // Wait for profile to fetch in App.jsx
      if (profile === null) return

      if (profile.role !== 'admin') { navigate('/'); return }
      
      const { data } = await supabase.auth.getSession()
      setAuthToken(data.session?.access_token)
      setLoadingAccess(false)
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

  // ─── Fetch Stats & Announcements ───
  const fetchStats = async () => {
    const start = performance.now()
    try {
      const data = await apiFetch('/api/admin/stats', { method: 'GET' })
      const duration = Math.round(performance.now() - start)
      setLatency(duration)
      setStats(data)
    } catch (err) { console.error(err) }
  }

  const fetchAnnouncements = async () => {
    try {
      const data = await apiFetch('/api/admin/announcements', { method: 'GET' })
      setAnnouncements(data)
    } catch (err) { console.error(err) }
  }

  // ─── Users ───
  const fetchAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await apiFetch('/api/admin/users/all', { method: 'GET' })
      setUsersList(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // ─── Persistent Data Flags ───
  // Track which tabs have already been loaded to avoid re-fetching on every tab switch.
  // Data persists in state until the admin manually clicks "Refresh" or navigates away.
  const [loadedTabs, setLoadedTabs] = useState(new Set())

  const markTabLoaded = (tabId) => {
    setLoadedTabs(prev => {
      const next = new Set(prev)
      next.add(tabId)
      return next
    })
  }

  // Manual refresh: clears the "loaded" flag for the current tab, forcing a re-fetch
  const handleManualRefresh = () => {
    setLoadedTabs(prev => {
      const next = new Set(prev)
      next.delete(activeTab)
      return next
    })
  }

  // Effect manager — only fetches when a tab hasn't been loaded yet
  useEffect(() => {
    if (!authToken) return
    if (loadedTabs.has(activeTab)) return // Already loaded — don't re-fetch

    if (activeTab === 'overview') {
      fetchStats()
      fetchAnnouncements()
    } else if (activeTab === 'users' || activeTab === 'expiry') {
      if (!loadedTabs.has('users')) fetchAllUsers()
    } else if (activeTab === 'payments') {
      fetchPayments()
    } else if (activeTab === 'coupons') {
      fetchCoupons()
    }

    markTabLoaded(activeTab)
    // Also mark 'expiry' when 'users' loads (they share usersList)
    if (activeTab === 'users') markTabLoaded('expiry')
    if (activeTab === 'expiry') markTabLoaded('users')
  }, [activeTab, authToken, loadedTabs])

  // ─── Announcements Actions ───
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

  // ─── Deep Dive Modal ───
  const handleOpenUserModal = async (u) => {
    setSelectedUser(u)
    setSelectedUserDeepDive(null)
    setShowUserModal(true)
    setLoadingDeepDive(true)
    setTierMessage(null)
    setActionMessage(null)
    try {
      const data = await apiFetch(`/api/admin/users/search?email=${encodeURIComponent(u.email)}`, { method: 'GET' })
      setSelectedUserDeepDive(data)
      setSelectedTier(data.current_tier || 'starter')
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDeepDive(false)
    }
  }

  // ─── Tier Activator ───
  const handleActivatePlan = async () => {
    if (!selectedUserDeepDive) return
    setUpdatingTier(true); setTierMessage(null)
    try {
      const data = await apiFetch('/api/admin/users/tier', {
        method: 'POST',
        body: JSON.stringify({ user_id: selectedUserDeepDive.id, tier: selectedTier, duration_months: durationMonths })
      })
      setTierMessage({ type: 'success', text: data.message })
      // Update local deep dive
      setSelectedUserDeepDive(prev => ({ ...prev, current_tier: selectedTier }))
      fetchAllUsers()
    } catch (err) { setTierMessage({ type: 'error', text: err.message }) }
    finally { setUpdatingTier(false) }
  }

  // ─── Account Actions ───
  const handleUserAction = async (action) => {
    if (!selectedUserDeepDive) return
    setActionLoading(action); setActionMessage(null)
    try {
      if (action === 'reset_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(selectedUserDeepDive.email)
        if (error) throw error
        setActionMessage({ type: 'success', text: 'Password reset link sent.' })
      } else {
        const data = await apiFetch(`/api/admin/users/${action}`, {
          method: 'POST',
          body: JSON.stringify({ user_id: selectedUserDeepDive.id })
        })
        setActionMessage({ type: 'success', text: data.message })
        if (action === 'delete') { 
          setShowUserModal(false)
          fetchAllUsers()
        } else { 
          const newStatus = action === 'suspend' ? 'suspended' : 'active'
          setSelectedUserDeepDive(prev => ({ ...prev, status: newStatus }))
          fetchAllUsers()
        }
      }
    } catch (err) { setActionMessage({ type: 'error', text: err.message }) }
    finally { setActionLoading(null) }
  }

  const handleExportCSV = () => {
    if (!usersList || usersList.length === 0) {
      alert("No users available to export.")
      return
    }
    
    // Header
    const headers = ["Email", "Full Name", "Tier", "Status", "Expiry Date"]
    
    // Rows
    const rows = usersList.map(u => [
      u.email || "",
      u.full_name || "",
      u.user_tier || "free",
      u.status || "active",
      u.expires_at || "lifetime"
    ])
    
    // Combine to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n")
    
    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `scholarhub_users_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── Expiry Watchlist ───
  const expiryWatchlist = usersList.filter(u => {
    if (!u.expires_at) return false
    const diffDays = (new Date(u.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  })

  // ─── Payments & Coupons Logic (reused) ───
  const fetchPayments = async () => {
    setPaymentsLoading(true)
    try { const data = await apiFetch('/api/admin/payments/pending', { method: 'GET' }); setPayments(data) }
    catch { setPayments([]) }
    finally { setPaymentsLoading(false) }
  }
  const handlePaymentAction = async (requestId, action) => {
    setPaymentAction(requestId)
    try {
      await apiFetch('/api/admin/payments/action', { method: 'POST', body: JSON.stringify({ request_id: requestId, action }) })
      setPayments(prev => prev.filter(p => p.id !== requestId))
    } catch { /* silent */ }
    finally { setPaymentAction(null) }
  }
  const fetchCoupons = async () => {
    setCouponsLoading(true)
    try { const data = await apiFetch('/api/admin/coupons', { method: 'GET' }); setCoupons(data) }
    catch { setCoupons([]) }
    finally { setCouponsLoading(false) }
  }
  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setCreatingCoupon(true); setCouponMessage(null)
    try {
      await apiFetch('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({ 
          code: couponCode.trim(), 
          discount_percent: parseInt(discountPercent), 
          max_uses: parseInt(maxUses),
          expires_at: couponExpiry || null,
          applicable_tier: applicableTier
        })
      })
      setCouponMessage({ type: 'success', text: `Coupon ${couponCode} created!` })
      setCouponCode('')
      setMaxUses(1)
      setCouponExpiry('')
      fetchCoupons()
    } catch (err) { setCouponMessage({ type: 'error', text: err.message }) }
    finally { setCreatingCoupon(false) }
  }
  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to permanently delete this coupon? Users will no longer be able to use it.")) return;
    try {
      await apiFetch(`/api/admin/coupons/${couponId}`, { method: 'DELETE' })
      setCoupons(prev => prev.filter(c => c.id !== couponId))
      setCouponMessage({ type: 'success', text: 'Coupon deleted permanently.' })
    } catch (err) {
      setCouponMessage({ type: 'error', text: err.message })
    }
  }

  if (loadingAccess) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { id: 'users', label: 'Directory', icon: <Users size={14} /> },
    { id: 'expiry', label: 'Watchlist', icon: <Clock size={14} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket size={14} /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-blue-100 selection:text-blue-700">
      {/* Enterprise Header */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Enterprise Console</h1>
              <p className="text-slate-400 font-medium">Platform Infrastructure & User Control</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
            Exit Console
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 flex items-center gap-3">
        <div className="flex overflow-x-auto gap-2 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-lg w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >{t.icon} {t.label}</button>
          ))}
        </div>
        <button
          onClick={handleManualRefresh}
          title="Refresh current tab data"
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors shadow-sm"
        >
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">

        {/* ═══ TAB: OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Big Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl"></div>
                <Users size={20} className="text-blue-500 mb-4" />
                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{stats.total_users}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users</div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl"></div>
                <CreditCard size={20} className="text-amber-500 mb-4" />
                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{stats.active_subs}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Subscriptions</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl"></div>
                <Zap size={20} className="text-purple-500 mb-4" />
                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{stats.total_ai_summaries}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total AI Credits Used</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl"></div>
                <Radio size={20} className="text-emerald-500 mb-4 animate-pulse" />
                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{liveUsersCount || 1}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Now</div>
              </div>
            </div>

            {/* Visual Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily User Growth Bar Chart */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Users size={16} className="text-blue-500" /> Daily Growth Chart
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">New registration trend (Last 7 days)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">Live Feed</span>
                </div>
                
                <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
                  {stats.daily_growth && stats.daily_growth.length > 0 ? (
                    stats.daily_growth.map((day, idx) => {
                      const maxVal = Math.max(...stats.daily_growth.map(d => d.new_users), 1)
                      const percentage = (day.new_users / maxVal) * 100
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                          <div className="relative w-full flex justify-center">
                            {/* Tooltip */}
                            <span className="absolute -top-8 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-10">
                              {day.new_users} New Users
                            </span>
                            {/* Bar */}
                            <div 
                              style={{ height: `${percentage}%` }}
                              className="w-full sm:w-8 bg-gradient-to-t from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-t-lg transition-all duration-500 shadow-lg shadow-blue-500/20"
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-2 truncate max-w-full">{day.date}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">No growth data available.</div>
                  )}
                </div>
              </div>

              {/* System Health / Activity Heatmap */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500" /> Platform Health
                  </h3>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>API Response Time</span>
                    <span className="text-slate-800">45ms</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        !latency ? 'w-0' :
                        latency <= 50 ? 'bg-emerald-500 w-[100%]' :
                        latency <= 150 ? 'bg-emerald-500 w-[85%]' :
                        latency <= 300 ? 'bg-amber-500 w-[60%]' : 'bg-red-500 w-[30%]'
                      }`}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span className="cursor-help border-b border-dotted border-slate-300 text-slate-500 hover:text-slate-700" title="Time taken by the backend to fetch all analytics counters from Supabase.">DB Query Latency</span>
                    <span className="text-slate-800">{stats.db_latency !== undefined ? `${stats.db_latency}ms` : 'Measuring...'}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        stats.db_latency === undefined ? 'w-0' :
                        stats.db_latency <= 15 ? 'bg-emerald-500 w-[100%]' :
                        stats.db_latency <= 50 ? 'bg-emerald-500 w-[80%]' :
                        stats.db_latency <= 150 ? 'bg-amber-500 w-[50%]' : 'bg-red-500 w-[25%]'
                      }`}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>Inference Key Rotation</span>
                    <span className="text-blue-500">Active (GROQ)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[100%]"></div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                      <span>Activity Grid</span>
                      <span className="text-[9px] font-bold text-slate-400 normal-case">(Last 28 Days)</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(stats.activity_grid && stats.activity_grid.length > 0 ? stats.activity_grid : Array.from({ length: 30 }).map((_, i) => ({
                        date: `Day ${30 - i}`,
                        count: 0
                      }))).slice(-28).map((day, i) => {
                        const count = day.count || 0
                        const shade = 
                          count === 0 ? 'bg-slate-100' :
                          count <= 3 ? 'bg-emerald-100' :
                          count <= 7 ? 'bg-emerald-200' :
                          count <= 15 ? 'bg-emerald-300' :
                          count <= 30 ? 'bg-emerald-400' : 'bg-emerald-500'
                        return (
                          <div 
                            key={i} 
                            className={`aspect-square rounded-sm ${shade} transition-all duration-300 hover:scale-110 cursor-help`}
                            title={`${day.date}: ${count} AI Summaries`}
                          ></div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Real-time Server Health */}
            <SystemHealthMonitor />

            {/* Announcement Center */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Megaphone size={16} className="text-indigo-500" /> Announcement Center
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Create Form */}
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <input type="text" placeholder="Announcement Title" required value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500" />
                  <textarea placeholder="Write your broadcast message here..." required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500" />
                  <div className="flex gap-4">
                    <select value={newAnnouncement.type} onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 flex-1">
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="success">Success (Green)</option>
                    </select>
                    <button type="submit" disabled={creatingAnnounce}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2 transition-colors disabled:opacity-50">
                      {creatingAnnounce ? <Loader2 size={16} className="animate-spin" /> : 'Broadcast'}
                    </button>
                  </div>
                  <Toast msg={announcementMsg} />
                </form>

                {/* Active Announcements */}
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Broadcasts</h3>
                  <div className="space-y-3">
                    {announcements.length === 0 ? (
                      <div className="text-sm font-bold text-slate-400">No active announcements.</div>
                    ) : (
                      announcements.map(a => (
                        <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                          <button onClick={() => handleDeleteAnnouncement(a.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={16} />
                          </button>
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${a.type === 'warning' ? 'text-amber-600' : a.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>{a.type}</div>
                          <h4 className="text-sm font-bold text-slate-800">{a.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: DIRECTORY ═══ */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> Deep-Dive User Directory
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-md shadow-slate-900/10 whitespace-nowrap"
                >
                  📥 Export to CSV
                </button>
                <div className="relative w-full md:w-72">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-400" />
                  </div>
                  <input type="text" placeholder="Search users by email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-xl">User</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => {
                      const expiryDate = u.expires_at ? new Date(u.expires_at) : null
                      const daysRemaining = expiryDate ? Math.max(0, Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))) : 0
                      return (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="text-xs font-bold text-slate-800">{u.email}</div>
                          {u.full_name && <div className="text-[10px] font-medium text-slate-500">{u.full_name}</div>}
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={u.status} /></td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${u.user_tier === 'pro' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : u.user_tier === 'starter' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {u.user_tier}
                          </span>
                          {u.user_tier !== 'free' && expiryDate && (
                            <div className={`text-[9px] font-bold mt-1.5 ${daysRemaining <= 7 ? 'text-red-500' : 'text-slate-500'}`}>
                              {daysRemaining === 0 ? 'Expired' : `${daysRemaining} days left`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => handleOpenUserModal(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
                            <Activity size={12} /> Details
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: EXPIRY WATCHLIST ═══ */}
        {activeTab === 'expiry' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Clock size={16} className="text-amber-500" /> 7-Day Expiry Watchlist
            </h2>
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryWatchlist.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-xs font-bold text-slate-400">No subscriptions expiring within 7 days.</td>
                    </tr>
                  ) : (
                    expiryWatchlist.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-4 text-xs font-bold text-slate-800">{u.email}</td>
                        <td className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.user_tier}</td>
                        <td className="px-4 py-4 text-xs font-bold text-amber-600">{new Date(u.expires_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => alert(`Placeholder: Notified ${u.email} about upcoming expiry.`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                            <Bell size={12} /> Notify User
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB: PAYMENTS (Reused) ═══ */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
              <CreditCard size={16} className="text-emerald-500" /> Pending Manual Payments
            </h2>
            {paymentsLoading ? (
              <div className="py-12 text-center"><Loader2 size={24} className="animate-spin text-slate-300 mx-auto" /></div>
            ) : payments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-bold">No pending payment requests.</div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 truncate">{p.user_email || p.user_id}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {p.package} &middot; TxID: {p.transaction_id || 'N/A'} &middot; {p.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handlePaymentAction(p.id, 'approve')} disabled={paymentAction === p.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50">
                        {paymentAction === p.id ? <Loader2 size={12} className="animate-spin"/> : 'Approve'}
                      </button>
                      <button onClick={() => handlePaymentAction(p.id, 'reject')} disabled={paymentAction === p.id}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-200 transition-colors disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: COUPONS (Reused) ═══ */}
        {activeTab === 'coupons' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Ticket size={16} className="text-amber-500" /> Create Coupon
              </h2>
              <form onSubmit={handleCreateCoupon} className="space-y-5">
                <input type="text" placeholder="Coupon Code (e.g. STUDENT100)" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 uppercase" />
                <select value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500">
                  <option value={100}>100% (Free Access)</option>
                  <option value={50}>50% Off</option>
                  <option value={20}>20% Off</option>
                </select>
                <select value={applicableTier} onChange={e => setApplicableTier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500">
                  <option value="both">Both Plans</option>
                  <option value="starter">Starter Only</option>
                  <option value="pro">Pro Only</option>
                </select>
                <input type="number" placeholder="Max Uses (e.g. 100)" value={maxUses} onChange={e => setMaxUses(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" min="1" />
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><CalIcon size={16} className="text-slate-400" /></div>
                  <input type="date" value={couponExpiry} onChange={e => setCouponExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" />
                </div>
                <button type="submit" disabled={creatingCoupon || !couponCode.trim()}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50">
                  {creatingCoupon ? <Loader2 size={16} className="animate-spin inline" /> : 'Generate Coupon'}
                </button>
                <Toast msg={couponMessage} />
              </form>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Ticket size={16} className="text-blue-500" /> Active Coupons
              </h2>
              {couponsLoading ? (
                <div className="py-12 text-center"><Loader2 size={24} className="animate-spin text-slate-300 mx-auto" /></div>
              ) : (
                <div className="space-y-3">
                  {coupons.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="text-sm font-black text-slate-800">{c.code}</div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          {c.discount_percent}% off {c.expires_at ? `· Until ${new Date(c.expires_at).toLocaleDateString()}` : ''}
                        </div>
                        <div className="text-[10px] text-indigo-500 font-bold mt-0.5">
                          Used: {c.current_uses || 0}/{c.max_uses || '∞'}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c.id)}
                        className="p-2 rounded-lg transition-colors text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={24}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ DEEP DIVE MODAL ═══ */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full h-full md:w-full md:max-w-3xl md:h-auto md:max-h-[90vh] rounded-none md:rounded-[2rem] shadow-2xl overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
              <X size={20} />
            </button>
            
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedUser?.email}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={selectedUserDeepDive?.status || selectedUser?.status} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {selectedUser?.id}</span>
                  </div>
                </div>
              </div>

              {loadingDeepDive || !selectedUserDeepDive ? (
                <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-slate-300" /></div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Data */}
                  <div className="space-y-8">
                    
                    {/* Activity Section */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Activity size={12}/> Recent Activity</h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Last Active</div>
                          <div className="text-sm font-black text-slate-800">{selectedUserDeepDive.last_active ? new Date(selectedUserDeepDive.last_active).toLocaleString() : 'Never'}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <div className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1"><Zap size={10} /> AI Credits Used (Today)</div>
                          <div className="text-sm font-black text-blue-900">{selectedUser?.ai_usage_today || 0} Summaries</div>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100/50">Last 5 Searches</div>
                        <div className="p-4 space-y-3">
                          {selectedUserDeepDive.recent_searches?.length > 0 ? (
                            selectedUserDeepDive.recent_searches.map((search, i) => (
                              <div key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                                <Search size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                <span className="truncate">{search}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs font-bold text-slate-400">No recent searches recorded.</div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Actions */}
                  <div className="space-y-8">
                    
                    {/* Tier Control */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><ShieldCheck size={12}/> Force Tier Update</h3>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex gap-2">
                          <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 flex-1">
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                          </select>
                          {selectedTier !== 'free' && (
                            <select value={durationMonths} onChange={e => setDurationMonths(Number(e.target.value))}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 flex-1 animate-in fade-in slide-in-from-top-1 duration-150">
                              <option value={1}>1 Mo</option>
                              <option value={12}>1 Yr</option>
                            </select>
                          )}
                        </div>
                        <button onClick={handleActivatePlan} disabled={updatingTier}
                          className="w-full py-3 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-colors disabled:opacity-50">
                          {updatingTier ? <Loader2 size={14} className="animate-spin inline" /> : 'Apply Tier Update'}
                        </button>
                        <Toast msg={tierMessage} />
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><AlertCircle size={12}/> Administrative Actions</h3>
                      <div className="space-y-3">
                        <button onClick={() => handleUserAction('reset_password')} disabled={!!actionLoading}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition-colors disabled:opacity-50">
                          <span className="flex items-center gap-2"><Key size={16} className="text-slate-400" /> Send Password Reset</span>
                          {actionLoading === 'reset_password' ? <Loader2 size={14} className="animate-spin text-slate-400"/> : <span className="text-[10px] text-slate-400 uppercase tracking-widest">Email</span>}
                        </button>

                        {selectedUserDeepDive.status !== 'suspended' ? (
                          <button onClick={() => handleUserAction('suspend')} disabled={!!actionLoading}
                            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-sm font-bold text-amber-700 transition-colors disabled:opacity-50">
                            <span className="flex items-center gap-2"><Ban size={16} className="text-amber-500" /> Suspend Instantly</span>
                            {actionLoading === 'suspend' && <Loader2 size={14} className="animate-spin"/>}
                          </button>
                        ) : (
                          <button onClick={() => handleUserAction('unsuspend')} disabled={!!actionLoading}
                            className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 text-sm font-bold text-green-700 transition-colors disabled:opacity-50">
                            <span className="flex items-center gap-2"><UserCheck size={16} className="text-green-500" /> Unsuspend User</span>
                            {actionLoading === 'unsuspend' && <Loader2 size={14} className="animate-spin"/>}
                          </button>
                        )}
                      </div>
                      <Toast msg={actionMessage} />
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminPanel
