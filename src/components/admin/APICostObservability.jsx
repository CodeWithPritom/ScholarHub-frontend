import React, { useState, useEffect } from 'react'
import {
  DollarSign, Activity, Zap, Cpu, Server, Database, ShieldCheck,
  AlertTriangle, RefreshCcw, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Layers, Sliders, Clock, Search, ExternalLink, HelpCircle
} from 'lucide-react'

export const APICostObservability = ({ apiFetch }) => {
  const [summary, setSummary] = useState(null)
  const [providers, setProviders] = useState([])
  const [budget, setBudget] = useState(null)
  const [fallbackEvents, setFallbackEvents] = useState([])
  const [featuresBreakdown, setFeaturesBreakdown] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all') // 'all' | 'ai' | 'search' | 'infrastructure'
  const [safetyBufferPct, setSafetyBufferPct] = useState(20)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const [sumData, provData, budData, fbData, featData] = await Promise.all([
        apiFetch('/api/admin/api-monitoring/summary').catch(() => null),
        apiFetch('/api/admin/api-monitoring/providers').catch(() => ({ providers: [] })),
        apiFetch('/api/admin/api-monitoring/budget-estimator').catch(() => null),
        apiFetch('/api/admin/api-monitoring/fallback-events?limit=40').catch(() => ({ events: [] })),
        apiFetch('/api/admin/api-monitoring/breakdown').catch(() => ({ features: [] }))
      ])

      if (sumData) setSummary(sumData)
      if (provData?.providers) setProviders(provData.providers)
      if (budData) setBudget(budData)
      if (fbData?.events) setFallbackEvents(fbData.events)
      if (featData?.features) setFeaturesBreakdown(featData.features)
    } catch (err) {
      console.error('Failed to load API monitoring metrics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    if (!autoRefresh) return
    const interval = setInterval(() => loadData(false), 20000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const filteredProviders = providers.filter(p => {
    if (categoryFilter === 'all') return true
    return p.category === categoryFilter
  })

  // Dynamic budget calculation based on user selected safety buffer
  const calculatedRecommendedDeposit = budget?.projected_30d_usd
    ? Number((budget.projected_30d_usd * (1 + safetyBufferPct / 100)).toFixed(2))
    : 0.0

  if (loading && !summary) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCcw size={32} className="animate-spin text-indigo-600" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Aggregating Real-Time Telemetry & Financial Observability...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── Top Control Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                AI & API Financial Command Center
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Unified multi-provider cost calculation, balance synchronization, and failover waterfall telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            {autoRefresh ? 'Live Sync (20s)' : 'Sync Paused'}
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* ─── Financial & Consumption KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Spend */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Today's API Cost</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              ${summary?.today_cost_usd?.toFixed(4) || '0.0000'}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-slate-500">
              <span className="text-indigo-600 font-bold">{(summary?.today_tokens || 0).toLocaleString()} tokens</span>
              <span>•</span>
              <span>{(summary?.today_requests || 0).toLocaleString()} calls</span>
            </div>
          </div>
        </div>

        {/* Month to Date */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Month-To-Date Spend</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              ${summary?.month_cost_usd?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-slate-500">
              <span>Rolling 7-day Avg:</span>
              <strong className="text-slate-800 font-mono">${budget?.avg_daily_cost_usd?.toFixed(3) || '0.05'}/day</strong>
            </div>
          </div>
        </div>

        {/* 30-Day Projected Burn */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">30-Day Projected Burn</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              ${budget?.projected_30d_usd?.toFixed(2) || '1.50'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-slate-500">
              <span>Recommended Recharge:</span>
              <strong className="text-purple-600 font-mono">${calculatedRecommendedDeposit.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Success Rate & Reliability */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Platform Reliability</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {summary?.success_rate_pct || 100}%
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-slate-500">
              <span className="text-emerald-600 font-bold">{(summary?.today_requests || 0) - (summary?.today_errors || 0)} ok</span>
              <span>•</span>
              <span className={summary?.today_errors > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                {summary?.today_errors || 0} failovers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Unified Provider Status & Pricing Matrix ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-indigo-600" /> Multi-Provider Live Quota & Cost Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live rate limits, balance synchronizations, and per-token local estimations for all active APIs
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {[
              { id: 'all', label: `All (${providers.length})` },
              { id: 'ai', label: `AI LLMs (${providers.filter(p => p.category === 'ai').length})` },
              { id: 'search', label: `Academic (${providers.filter(p => p.category === 'search').length})` },
              { id: 'infrastructure', label: `Cloud Infra (${providers.filter(p => p.category === 'infrastructure').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Provider & Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Key / Rotation Pool</th>
                <th className="py-3.5 px-4">Balance / Quota</th>
                <th className="py-3.5 px-4">Sync Mode</th>
                <th className="py-3.5 px-4 text-right">Today Spend</th>
                <th className="py-3.5 px-4 text-right">Month Spend</th>
                <th className="py-3.5 px-4 text-center">Requests</th>
                <th className="py-3.5 px-6 text-right">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProviders.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Provider Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        p.status === 'online' ? 'bg-emerald-500' :
                        p.status === 'rate_limited' ? 'bg-amber-500' :
                        p.status === 'degraded' ? 'bg-rose-500' : 'bg-slate-300'
                      }`} />
                      <div>
                        <div className="font-extrabold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.primary_model}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      p.status === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      p.status === 'rate_limited' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                      p.status === 'degraded' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>

                  {/* Key Details */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                        {p.masked_key}
                      </code>
                      {p.keys_count > 1 && (
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded">
                          {p.keys_count} keys pool
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Balance / Quota */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800">
                      {p.balance_usd !== null && p.balance_usd !== undefined
                        ? `$${p.balance_usd.toFixed(2)} USD`
                        : p.quota_limit}
                    </div>
                  </td>

                  {/* Balance Mode */}
                  <td className="py-4 px-4">
                    {p.balance_mode === 'live_api' ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ● Live API Sync
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        Estimated Cost Model
                      </span>
                    )}
                  </td>

                  {/* Today Spend */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                    ${p.today_cost_usd.toFixed(4)}
                  </td>

                  {/* Month Spend */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-600">
                    ${p.month_cost_usd.toFixed(2)}
                  </td>

                  {/* Requests & Errors */}
                  <td className="py-4 px-4 text-center">
                    <div className="font-bold text-slate-800">{p.today_requests}</div>
                    {p.today_errors > 0 && (
                      <div className="text-[9px] font-black text-rose-600">({p.today_errors} errors)</div>
                    )}
                  </td>

                  {/* Latency */}
                  <td className="py-4 px-6 text-right font-mono">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      p.avg_latency_ms < 450 ? 'bg-emerald-50 text-emerald-700' :
                      p.avg_latency_ms < 900 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {p.avg_latency_ms}ms
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Two Columns: Budget Calculator + Feature Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget & Recharge Forecasting */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" /> Budget & Runway Forecasting Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Projections calculated over 7-day rolling daily burn rate
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-200">
              Runway: {budget?.runway_days ? `${budget.runway_days} Days` : '999 Days'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">30-Day Burn</span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                ${budget?.projected_30d_usd?.toFixed(2) || '1.50'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">60-Day Burn</span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                ${budget?.projected_60d_usd?.toFixed(2) || '3.00'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">90-Day Burn</span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                ${budget?.projected_90d_usd?.toFixed(2) || '4.50'}
              </span>
            </div>
          </div>

          {/* Safety Buffer Selector */}
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-indigo-950">Safety Margin Buffer</span>
              <div className="flex items-center gap-1">
                {[10, 20, 30].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setSafetyBufferPct(pct)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      safetyBufferPct === pct
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-200/50">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block">Recommended Pre-paid Recharge</span>
                <span className="text-[10px] text-slate-500">Includes 30-day projection + {safetyBufferPct}% safety buffer</span>
              </div>
              <span className="text-xl font-black text-indigo-700 font-mono">
                ${calculatedRecommendedDeposit.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Feature Cost Attribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sliders size={16} className="text-purple-600" /> Feature Cost Attribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consumption grouped by ScholarHub features and tools
            </p>
          </div>

          {featuresBreakdown.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 font-medium">
              No feature usage transactions logged today yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {featuresBreakdown.slice(0, 5).map((f, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block capitalize">
                      {f.feature_id.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {f.requests} requests • {f.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-900">
                    ${f.cost_usd.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Live Fallback & Execution Log Stream ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200/90 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Activity size={16} className="text-blue-600 animate-pulse" /> Live Failover, Fallback & Routing Trace Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit log of actual successful providers, token latencies, and intermediate fallback errors
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
            Last {fallbackEvents.length} Requests
          </span>
        </div>

        {fallbackEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            No API transaction logs recorded yet today.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto font-sans">
            {fallbackEvents.map(event => (
              <div key={event.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{event.time}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {event.feature_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                      event.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {event.had_fallback ? '⚡ Fallback Handled' : event.status}
                    </span>
                  </div>

                  {/* Fallback waterfall path visualization */}
                  {event.had_fallback ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                      {event.fallback_chain.map((step, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 font-mono text-[10px] line-through">
                            {step.provider} ({step.error ? step.error.slice(0, 24) : 'fail'})
                          </span>
                          <span className="text-slate-400 font-bold">➔</span>
                        </React.Fragment>
                      ))}
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-mono font-bold text-[10px]">
                        ✓ {event.final_provider} ({event.final_model})
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 font-medium">
                      Fulfilled directly by <strong className="text-slate-900 font-bold">{event.final_provider}</strong> ({event.final_model})
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 font-mono">
                  <span className="text-xs font-black text-slate-900">${event.cost_usd.toFixed(6)}</span>
                  <span className="text-[10px] text-slate-500">{event.latency_ms}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
