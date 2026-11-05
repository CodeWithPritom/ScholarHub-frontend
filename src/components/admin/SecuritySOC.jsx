import React, { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, AlertOctagon, Lock, Unlock,
  RefreshCw, Ban, CheckCircle2, XCircle, Search, Filter, Radio, Eye, Copy,
  Trash2, Globe, Terminal, Activity, Zap, Cpu, ArrowUpRight, Flame, Layers
} from 'lucide-react'

export function SecuritySOC({ apiFetch }) {
  const [socData, setSocData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15)

  // Filters
  const [severityFilter, setSeverityFilter] = useState('all')
  const [threatTypeFilter, setThreatTypeFilter] = useState('all')
  const [searchIP, setSearchIP] = useState('')

  // Modals & Action States
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [manualIPInput, setManualIPInput] = useState('')
  const [manualReasonInput, setManualReasonInput] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [lockdownConfirmOpen, setLockdownConfirmOpen] = useState(false)
  const [selectedLogPayload, setSelectedLogPayload] = useState(null)

  // Fetch telemetry
  const fetchSOC = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const data = await apiFetch('/api/admin/security/soc-stats')
      if (data) {
        setSocData(data)
      }
    } catch (err) {
      toast.error('Failed to update SOC telemetry: ' + err.message)
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
      setSecondsUntilRefresh(15)
    }
  }, [apiFetch])

  useEffect(() => {
    fetchSOC()
  }, [fetchSOC])

  // 15s Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          fetchSOC()
          return 15
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [autoRefresh, fetchSOC])

  // Toggle Emergency Lockdown
  const handleToggleLockdown = async (enable) => {
    setActionLoading('lockdown')
    try {
      await apiFetch('/api/admin/security/settings', {
        method: 'POST',
        body: JSON.stringify({ is_lockdown_enabled: enable })
      })
      toast.success(enable ? 'Emergency Lockdown ACTIVATED across all edge nodes' : 'Emergency Lockdown deactivated')
      setLockdownConfirmOpen(false)
      fetchSOC(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Toggle WAF Engine
  const handleToggleWAF = async (enable) => {
    setActionLoading('waf')
    try {
      await apiFetch('/api/admin/security/settings', {
        method: 'POST',
        body: JSON.stringify({ is_waf_enabled: enable })
      })
      toast.success(enable ? 'WAF Engine Activated' : 'WAF Engine placed in Bypass Mode')
      fetchSOC(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Block IP
  const handleBlockIP = async (ip, reason = 'Administrative Block') => {
    if (!ip) return
    setActionLoading(`block-${ip}`)
    try {
      const res = await apiFetch('/api/admin/security/block-ip', {
        method: 'POST',
        body: JSON.stringify({ ip, reason })
      })
      toast.success(res.message || `IP ${ip} blocked`)
      setBlockModalOpen(false)
      setManualIPInput('')
      setManualReasonInput('')
      fetchSOC(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Unblock IP
  const handleUnblockIP = async (ip) => {
    if (!ip) return
    setActionLoading(`unblock-${ip}`)
    try {
      const res = await apiFetch('/api/admin/security/unblock-ip', {
        method: 'POST',
        body: JSON.stringify({ ip })
      })
      toast.success(res.message || `IP ${ip} unblocked`)
      fetchSOC(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Rotate Logs
  const handleClearLogs = async () => {
    if (!window.confirm('Rotate and archive security intrusion logs?')) return
    try {
      await apiFetch('/api/admin/security/clear-logs', { method: 'POST' })
      toast.success('Intrusion audit logs rotated')
      fetchSOC(true)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)
    toast.success('Copied: ' + text)
  }

  // Filter logs
  const logs = socData?.recent_logs || []
  const filteredLogs = logs.filter(log => {
    if (severityFilter !== 'all' && log.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false
    if (threatTypeFilter !== 'all' && log.threat_type?.toLowerCase() !== threatTypeFilter.toLowerCase()) return false
    if (searchIP && !log.ip_address?.toLowerCase().includes(searchIP.toLowerCase())) return false
    return true
  })

  const isLockdown = socData?.is_lockdown_enabled
  const isWAFActive = socData?.is_waf_enabled
  const blockedIPs = socData?.active_blocked_ips || []

  return (
    <div className="space-y-6">
      {/* ── Top SOC Header & Command Bar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow Ambient Accent */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${isLockdown ? 'bg-rose-500' : 'bg-emerald-500'}`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Defense SOC
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.2 DeepPacket</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className={isLockdown ? 'text-rose-500 animate-bounce' : 'text-indigo-400'} size={28} />
              Intrusion Defense &amp; Web Application Firewall (WAF)
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Real-time threat inspection engine mitigating SQL Injection, XSS signatures, path traversal, hostile vulnerability scanners, and automated DoS flood vectors.
            </p>
          </div>

          {/* Master Controls & Telemetry Heartbeat */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Lockdown Button */}
            <button
              onClick={() => {
                if (isLockdown) handleToggleLockdown(false)
                else setLockdownConfirmOpen(true)
              }}
              disabled={actionLoading === 'lockdown'}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                isLockdown
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/50 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isLockdown ? <Lock size={15} /> : <Unlock size={15} />}
              {isLockdown ? 'Lockdown ACTIVE' : 'Emergency Lockdown'}
            </button>

            {/* WAF Switch */}
            <button
              onClick={() => handleToggleWAF(!isWAFActive)}
              disabled={actionLoading === 'waf'}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isWAFActive
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-950/60'
              }`}
            >
              <Cpu size={15} />
              WAF: {isWAFActive ? 'Active' : 'Bypass'}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchSOC(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Manual SOC Refresh"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
              <span className="hidden sm:inline">{secondsUntilRefresh}s</span>
            </button>

            {/* Add Blocked IP */}
            <button
              onClick={() => setBlockModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Ban size={15} /> Block IP
            </button>
          </div>
        </div>
      </div>

      {/* ── Security Status Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Threats Today</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {socData?.threats_today || 0}
            </div>
            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
              <Flame size={12} /> Edge Mitigated
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertOctagon size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active IP Blacklist</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {blockedIPs.length}
            </div>
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-1">
              <Ban size={12} /> Sub-ms Drop Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Globe size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Rate Limit Ceiling</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {socData?.rate_limit_per_minute || 120} <span className="text-xs text-slate-400 font-normal">/min</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <Zap size={12} /> Sliding Window Guard
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Threat Defense Level</span>
            <div className="text-xl font-black mt-1 text-slate-900">
              {isLockdown ? (
                <span className="text-rose-600 uppercase">LOCKDOWN</span>
              ) : isWAFActive ? (
                <span className="text-emerald-600 uppercase">SECURE DEFCON 5</span>
              ) : (
                <span className="text-amber-600 uppercase">BYPASS MODE</span>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-1">
              <Cpu size={12} /> 0.01ms Lookup Time
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
            isLockdown ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* ── Active Blocked IPs Section ── */}
      {blockedIPs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Ban size={16} className="text-rose-600" /> Active Edge IP Blacklist ({blockedIPs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">These IP addresses are dropped at layer 7 with zero CPU overhead.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockedIPs.map(ip => (
              <div key={ip} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-mono font-bold">
                <span>{ip}</span>
                <button
                  onClick={() => handleUnblockIP(ip)}
                  disabled={actionLoading === `unblock-${ip}`}
                  className="text-rose-600 hover:text-rose-800 transition-colors p-0.5 rounded cursor-pointer"
                  title="Unblock IP"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Real-Time Intrusion Activity Feed ── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Terminal size={18} className="text-indigo-600" /> Real-Time Threat Activity Feed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live telemetry of mitigated injection attempts and hostile probes.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search IP */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search IP..."
                value={searchIP}
                onChange={e => setSearchIP(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Threat Type Filter */}
            <select
              value={threatTypeFilter}
              onChange={e => setThreatTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">All Threat Types</option>
              <option value="sqli">SQL Injection</option>
              <option value="xss">Cross-Site Scripting</option>
              <option value="path_traversal">Path Traversal</option>
              <option value="vuln_scanner">Vulnerability Scanner</option>
              <option value="brute_force">Brute Force</option>
            </select>

            {/* Rotate Logs Button */}
            <button
              onClick={handleClearLogs}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Rotate and purge old logs"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Threat Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Threat Type</th>
                <th className="py-3 px-4">Attacker IP</th>
                <th className="py-3 px-4">Target Endpoint</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    <ShieldCheck size={32} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                    No threats detected matching the selected criteria. Perimeter secure.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const sev = (log.severity || 'LOW').toUpperCase()
                  const isBlocked = blockedIPs.includes(log.ip_address)
                  const sevColor = {
                    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
                    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
                    MEDIUM: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    LOW: 'bg-slate-50 text-slate-700 border-slate-200'
                  }[sev] || 'bg-slate-50 text-slate-700 border-slate-200'

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${sevColor}`}>
                          {sev}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {log.threat_type || 'SUSPICIOUS_PAYLOAD'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{log.ip_address}</span>
                          <button
                            onClick={() => copyToClipboard(log.ip_address)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy IP"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-slate-600" title={log.target_url}>
                        <span className="font-bold text-slate-800 mr-1">{log.method || 'GET'}</span>
                        {log.target_url}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
                          <XCircle size={10} /> {log.action_taken || 'BLOCKED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isBlocked ? (
                          <button
                            onClick={() => handleUnblockIP(log.ip_address)}
                            disabled={actionLoading === `unblock-${log.ip_address}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockIP(log.ip_address, `Threat: ${log.threat_type}`)}
                            disabled={actionLoading === `block-${log.ip_address}`}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Block IP
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Manual Block IP Modal ── */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Ban size={18} className="text-rose-600" /> Manually Block Attacker IP
              </h3>
              <button onClick={() => setBlockModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Any IP added to this blacklist will immediately be dropped at the edge across all incoming routes.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">IP Address</label>
                <input
                  type="text"
                  placeholder="e.g. 185.220.101.5"
                  value={manualIPInput}
                  onChange={e => setManualIPInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Hostile directory brute-forcer"
                  value={manualReasonInput}
                  onChange={e => setManualReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBlockIP(manualIPInput, manualReasonInput)}
                disabled={!manualIPInput.trim() || actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                Confirm Blacklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Emergency Lockdown Confirmation Modal ── */}
      {lockdownConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Enable Emergency Lockdown?</h3>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mt-0.5">Severe Cyber Defense Measure</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When Emergency Lockdown is active, <strong>ALL incoming non-whitelisted requests</strong> will be dropped immediately with HTTP 403 Forbidden. Only platform administrators and local health monitors will have access.
            </p>
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-mono">
              Action: Instant Layer 7 Traffic Quarantine
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLockdownConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleLockdown(true)}
                disabled={actionLoading === 'lockdown'}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-600/40 cursor-pointer"
              >
                Activate Lockdown Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
