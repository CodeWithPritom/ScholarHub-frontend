import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Mail, Send, Eye, CheckCircle2, AlertCircle, Users, Zap, ShieldCheck,
  RefreshCw, Smartphone, Monitor, Layers, Clock, Check, X, FileText,
  Sparkles, ExternalLink, ArrowRight, Loader2, Play
} from 'lucide-react'

export function EmailBroadcastCenter({ apiFetch, adminEmail }) {
  // Composer Form State
  const [subject, setSubject] = useState('')
  const [badgeTitle, setBadgeTitle] = useState('Official Announcement')
  const [bodyText, setBodyText] = useState('')
  const [targetAudience, setTargetAudience] = useState('all') // 'all', 'pro', 'starter', 'free', 'custom'
  const [customEmails, setCustomEmails] = useState('')
  const [ctaText, setCtaText] = useState('Open ScholarHub AI')
  const [ctaUrl, setCtaUrl] = useState('https://scholarhub-ai.com/research')

  // Telemetry & Preview State
  const [audienceCount, setAudienceCount] = useState(0)
  const [loadingCount, setLoadingCount] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState('desktop') // 'desktop' | 'mobile'

  // Dispatch States
  const [testingSend, setTestingSend] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [dispatchConfirmOpen, setDispatchConfirmOpen] = useState(false)
  const [activeCampaign, setActiveCampaign] = useState(null)

  // Past Campaigns History
  const [campaigns, setCampaigns] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)

  // Fetch Audience Count
  const fetchAudienceCount = useCallback(async (aud) => {
    if (aud === 'custom') {
      const list = customEmails.split(/[,;\n\r]+/).filter(e => e.trim().includes('@'))
      setAudienceCount(list.length)
      return
    }
    setLoadingCount(true)
    try {
      const data = await apiFetch(`/api/admin/broadcasts/audience-count?audience=${aud}`)
      if (data) {
        setAudienceCount(data.count || 0)
      }
    } catch (err) {
      console.warn('Audience count error:', err)
    } finally {
      setLoadingCount(false)
    }
  }, [apiFetch, customEmails])

  useEffect(() => {
    fetchAudienceCount(targetAudience)
  }, [targetAudience, fetchAudienceCount])

  // Fetch Campaign History
  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/broadcasts/campaigns')
      if (data && data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch (err) {
      console.warn('Error loading campaigns:', err)
    } finally {
      setLoadingCampaigns(false)
    }
  }, [apiFetch])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Update Live Preview
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoadingPreview(true)
        const res = await apiFetch('/api/admin/broadcasts/preview', {
          method: 'POST',
          body: JSON.stringify({
            subject: subject || 'ScholarHub AI Platform Announcement',
            body: bodyText || 'Write your message in the composer on the left to see a live responsive preview...',
            badge_title: badgeTitle || 'Announcement',
            cta_text: ctaText || null,
            cta_url: ctaUrl || null
          })
        })
        if (res && res.html) {
          setPreviewHtml(res.html)
        }
      } catch (err) {
        console.warn('Preview error:', err)
      } finally {
        setLoadingPreview(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [subject, bodyText, badgeTitle, ctaText, ctaUrl, apiFetch])

  // Insert Variable Token into Body
  const insertToken = (token) => {
    setBodyText(prev => prev + ' ' + token)
  }

  // Send Single Test Email to Admin
  const handleTestSend = async () => {
    if (!subject.trim() || !bodyText.trim()) {
      toast.error('Please enter a subject line and body text before testing.')
      return
    }
    setTestingSend(true)
    try {
      const res = await apiFetch('/api/admin/broadcasts/test-send', {
        method: 'POST',
        body: JSON.stringify({
          subject: subject.trim(),
          body: bodyText.trim(),
          badge_title: badgeTitle,
          cta_text: ctaText,
          cta_url: ctaUrl,
          target_email: adminEmail
        })
      })
      toast.success(res.message || 'Test broadcast email dispatched to your inbox!')
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch test email.')
    } finally {
      setTestingSend(false)
    }
  }

  // Launch Bulk Broadcast Campaign
  const handleLaunchDispatch = async () => {
    setDispatching(true)
    try {
      const res = await apiFetch('/api/admin/broadcasts/dispatch', {
        method: 'POST',
        body: JSON.stringify({
          subject: subject.trim(),
          body: bodyText.trim(),
          target_audience: targetAudience,
          badge_title: badgeTitle,
          cta_text: ctaText,
          cta_url: ctaUrl,
          custom_emails: targetAudience === 'custom' ? customEmails : null
        })
      })
      toast.success(res.message || 'Broadcast campaign successfully started!')
      setDispatchConfirmOpen(false)
      setActiveCampaign({ id: res.campaign_id, recipient_count: res.recipient_count, sent: 0, failed: 0 })
      fetchCampaigns()

      // Poll progress for active campaign
      const pollId = setInterval(async () => {
        try {
          const pollRes = await apiFetch(`/api/admin/broadcasts/campaign/${res.campaign_id}`)
          if (pollRes && pollRes.campaign) {
            const c = pollRes.campaign
            setActiveCampaign({
              id: c.id,
              recipient_count: c.recipient_count,
              sent: c.sent_count,
              failed: c.failed_count,
              status: c.status
            })
            if (c.status === 'completed' || c.status === 'failed') {
              clearInterval(pollId)
              fetchCampaigns()
            }
          }
        } catch {
          clearInterval(pollId)
        }
      }, 2000)

    } catch (err) {
      toast.error(err.message || 'Failed to launch broadcast campaign.')
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="text-indigo-600" size={24} /> Email Broadcast &amp; Delivery Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch responsive, high-deliverability announcements and updates with batch pacing and chunking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-600" /> Resilient SMTP / Resend Engine
          </span>
        </div>
      </div>

      {/* ── Active Campaign Progress Banner ── */}
      {activeCampaign && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${activeCampaign.status === 'completed' ? 'bg-emerald-400' : 'bg-indigo-400 animate-ping'}`} />
              <h3 className="text-sm font-black uppercase tracking-wider">
                {activeCampaign.status === 'completed' ? 'Campaign Completed' : 'Broadcasting In Progress...'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-300">
              {activeCampaign.sent} / {activeCampaign.recipient_count} Sent
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{
                width: activeCampaign.recipient_count > 0
                  ? `${Math.min(100, (activeCampaign.sent / activeCampaign.recipient_count) * 100)}%`
                  : '0%'
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Delivering in paced chunks to protect sender reputation</span>
            {activeCampaign.failed > 0 && (
              <span className="text-rose-400 font-bold">{activeCampaign.failed} Failed</span>
            )}
          </div>
        </div>
      )}

      {/* ── Main Two-Column Layout (Composer vs Live Preview) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Left Column: Composer Controls (5 cols) ── */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Campaign Configuration
            </h3>

            {/* Target Audience Segmentation */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                Target Audience Segment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Users', icon: Users },
                  { id: 'pro', label: 'Pro Tier', icon: Zap },
                  { id: 'starter', label: 'Starter Tier', icon: Sparkles },
                  { id: 'free', label: 'Free Tier', icon: Users },
                  { id: 'custom', label: 'Custom List', icon: Mail }
                ].map(aud => {
                  const Icon = aud.icon
                  const selected = targetAudience === aud.id
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selected
                          ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={16} className={selected ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className="text-xs font-bold mt-2">{aud.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Verified Audience Count Banner */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">Estimated Recipients:</span>
                <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {loadingCount ? 'Counting...' : `${audienceCount.toLocaleString()} verified scholars`}
                </span>
              </div>
            </div>

            {/* Custom Email Input (if Custom selected) */}
            {targetAudience === 'custom' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Recipient Email Addresses (Comma or Newline separated)
                </label>
                <textarea
                  rows={3}
                  value={customEmails}
                  onChange={e => {
                    setCustomEmails(e.target.value)
                    fetchAudienceCount('custom')
                  }}
                  placeholder="alice@mit.edu, bob@stanford.edu&#10;carol@oxford.ac.uk"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Badge Title & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Header Badge
                </label>
                <input
                  type="text"
                  value={badgeTitle}
                  onChange={e => setBadgeTitle(e.target.value)}
                  placeholder="Announcement"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Major Upgrade: Introducing Universal Vision RAG & Lab Portal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Dynamic Variable Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Message Body (Auto-wraps paragraphs &amp; links)
                </label>
                <span className="text-[10px] text-slate-400">Click to insert token:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['{{name}}', '{{tier}}', '{{year}}', '{{portal_url}}'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => insertToken(t)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-mono font-bold border border-slate-200 cursor-pointer transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
              <textarea
                rows={7}
                value={bodyText}
                onChange={e => setBodyText(e.target.value)}
                placeholder="Write your email announcement here...&#10;&#10;Separate paragraphs with an empty line. Any URLs like https://scholarhub-ai.com will automatically become secure clickable links."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Call To Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  CTA Button Label (Optional)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={e => setCtaText(e.target.value)}
                  placeholder="e.g. Launch Research Workspace"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  CTA Target URL
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={e => setCtaUrl(e.target.value)}
                  placeholder="https://scholarhub-ai.com/research"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Dispatch Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestSend}
                disabled={testingSend || !subject || !bodyText}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testingSend ? <Loader2 size={14} className="animate-spin text-indigo-600" /> : <Send size={14} />}
                Send Test to Me
              </button>

              <button
                type="button"
                onClick={() => setDispatchConfirmOpen(true)}
                disabled={dispatching || !subject || !bodyText || audienceCount === 0}
                className="w-full sm:flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play size={14} /> Dispatch Campaign ({audienceCount})
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Live Responsive Preview (7 cols) ── */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Eye size={15} className="text-indigo-600" /> Live Responsive Email Preview
              </h3>
              <p className="text-[11px] text-slate-500">WYSIWYG layout rendered for Gmail, Outlook, and Apple Mail.</p>
            </div>

            {/* Device Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor size={13} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone size={13} /> Mobile
              </button>
            </div>
          </div>

          {/* Device Mockup Shell */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 sm:p-6 flex items-center justify-center min-h-[520px]">
            <div
              className={`transition-all duration-300 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 ${
                previewDevice === 'mobile'
                  ? 'w-[375px] max-w-full rounded-[36px] border-4 border-slate-800'
                  : 'w-full max-w-[620px]'
              }`}
            >
              {loadingPreview ? (
                <div className="p-12 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
                  <Loader2 size={24} className="animate-spin text-indigo-600" />
                  <span>Updating Live Template Preview...</span>
                </div>
              ) : (
                <div
                  className="overflow-y-auto max-h-[640px]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dispatched Campaign History Table ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" /> Dispatch History &amp; Audit Logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Record of past broadcasts dispatched from this platform.</p>
          </div>
          <button
            type="button"
            onClick={fetchCampaigns}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh history"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Sent</th>
                <th className="py-3 px-4">Failed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                    No past broadcasts logged yet.
                  </td>
                </tr>
              ) : (
                campaigns.map(c => {
                  const statusColor = {
                    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    sending: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse',
                    failed: 'bg-rose-50 text-rose-700 border-rose-200'
                  }[c.status] || 'bg-slate-50 text-slate-700 border-slate-200'

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-xs truncate" title={c.subject}>
                        {c.subject}
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-[10px] text-slate-500">
                        {c.target_audience}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {c.recipient_count || 0}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        {c.sent_count || 0}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        {c.failed_count || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
                          {c.status || 'draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {dispatchConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Confirm Broadcast Dispatch</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please review before bulk delivery</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Subject:</span>
                <span className="font-bold text-slate-900 max-w-[200px] truncate">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Target Audience:</span>
                <span className="font-bold uppercase text-indigo-600">{targetAudience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Recipient Count:</span>
                <span className="font-mono font-black text-slate-900">{audienceCount} Scholars</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Emails will be sent in paced batches of 15 with deliberate intervals to ensure optimal SMTP inbox delivery and prevent spam filtering.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchDispatch}
                disabled={dispatching}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
              >
                {dispatching ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Confirm &amp; Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
