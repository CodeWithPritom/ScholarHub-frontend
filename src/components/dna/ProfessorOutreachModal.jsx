import React, { useState, useEffect } from 'react'
import {
  Mail, Sparkles, Copy, Check, ExternalLink, RefreshCw, X,
  GraduationCap, Send, ShieldCheck, UserCheck, Dna, FileText,
  Sliders, MessageSquare, AlertCircle, Info, ArrowUpRight
} from 'lucide-react'
import { toast } from 'sonner'
import { BASE_URL, notifyCreditsUpdated } from '../../utils/api'
import { supabase } from '../../supabaseClient'

export const ProfessorOutreachModal = ({
  isOpen,
  onClose,
  professor,
  academicField,
  userName,
  userTier,
  shareToken
}) => {
  const [purpose, setPurpose] = useState('Prospective PhD / Graduate Application')
  const [tone, setTone] = useState('High-Impact & Persuasive')
  const [customBackground, setCustomBackground] = useState('')
  const [keySkills, setKeySkills] = useState('')
  const [attachDnaLink, setAttachDnaLink] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedFull, setCopiedFull] = useState(false)
  const [error, setError] = useState('')

  // Construct verified public DNA link
  const dnaUrl = shareToken ? `${window.location.origin}/dna/${shareToken}` : ''

  // Pre-fill initial defaults when professor changes
  useEffect(() => {
    if (professor) {
      setError('')
      const defaultField = academicField || 'Pharmacy & Pharmacology'
      const topicsStr = professor.topics ? professor.topics.slice(0, 2).join(', ') : 'targeted therapeutics'
      
      setCustomBackground(
        `Researcher in ${defaultField} with active focus on ${topicsStr}. Seeking to apply domain knowledge and methodological rigor to advance lab objectives.`
      )
      setKeySkills(
        defaultField.toLowerCase().includes('pharm') 
          ? 'Formulation Design, LC-MS/HPLC, In-Vitro Assays, Pharmacokinetics, Molecular Modeling'
          : defaultField.toLowerCase().includes('bio') 
          ? 'CRISPR Gene Editing, Cell Culture, PCR/Sequencing, Flow Cytometry, Assay Development'
          : 'Data Analysis, Computational Modeling, Experimental Design, Scientific Writing'
      )
    }
  }, [professor, academicField])

  if (!isOpen || !professor) return null

  const handleGenerate = async () => {
    if (userTier === 'FREE') {
      toast.warning('AI Professor Outreach is a premium feature. Please upgrade your plan.')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Please log in to generate outreach emails.')

      const deviceId = localStorage.getItem('scholarhub_device_id') || ''

      const payload = {
        professor_name: professor.name,
        professor_title: professor.title,
        institution: professor.institution,
        research_focus: professor.focus,
        topics: professor.topics || [],
        user_name: userName,
        academic_field: academicField,
        user_background: customBackground,
        user_key_skills: keySkills,
        purpose: purpose,
        tone: tone,
        dna_link: attachDnaLink ? dnaUrl : null
      }

      const res = await fetch(`${BASE_URL}/ai/generate-outreach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': deviceId
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to generate professor outreach email.')
      }

      const data = await res.json()
      if (data.subject) {
        setSubject(data.subject)
        setBody(data.body || '')
      } else if (data.output) {
        // Fallback parser if output is single string
        if (data.output.includes('Subject:')) {
          const parts = data.output.split('Subject:', 2)[1]
          const lines = parts.trim().split('\n', 2)
          setSubject(lines[0].trim())
          setBody(parts.replace(lines[0], '').trim())
        } else {
          setSubject(`Prospective Inquiry regarding ${professor.focus?.slice(0, 35)}... | ${userName}`)
          setBody(data.output)
        }
      }
      
      // Live reactive credit sync
      notifyCreditsUpdated(data.credits_remaining)
      toast.success('High-impact outreach email crafted! (-10 Zaps deducted)')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopySubject = () => {
    if (!subject) return
    navigator.clipboard.writeText(subject)
    setCopiedSubject(true)
    toast.success('Subject line copied!')
    setTimeout(() => setCopiedSubject(false), 2000)
  }

  const handleCopyFull = () => {
    const fullText = `Subject: ${subject}\n\n${body}`
    navigator.clipboard.writeText(fullText)
    setCopiedFull(true)
    toast.success('Full email (Subject + Body) copied to clipboard!')
    setTimeout(() => setCopiedFull(false), 2500)
  }

  const handleOpenMailto = () => {
    if (!subject && !body) return
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start sm:items-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)] flex flex-col overflow-hidden my-auto relative shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ─── Header (Sticky & Never Cut Off) ─── */}
        <div className="sticky top-0 z-20 p-4 sm:p-6 border-b border-slate-150 flex items-start justify-between bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Mail size={20} />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-0.5 truncate">
                <Sparkles size={11} className="shrink-0" /> AI Academic Outreach Architect
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                Draft Outreach to {professor.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <GraduationCap size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{professor.institution}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold shrink-0">{professor.matchScore}% Match</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Body Scrollable ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain">
          
          {/* Target Professor Snapshot Card */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider">
                Lab Target Focus
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                ORCID: {professor.orcid || 'Verified PI'}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              <strong>{professor.focus}</strong>
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {professor.topics?.map(t => (
                <span key={t} className="px-2 py-0.5 bg-white/80 border border-indigo-200/60 rounded-md text-[10px] font-bold text-indigo-800">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Outreach Purpose */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders size={12} className="text-indigo-600" /> Outreach Objective
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="Prospective PhD / Graduate Application">🎓 Prospective PhD / Graduate Application</option>
                <option value="Postdoctoral Fellowship Application">🔬 Postdoctoral Fellowship Application</option>
                <option value="Research Assistant (RA) / Lab Position">💼 Research Assistant (RA) / Lab Position</option>
                <option value="Research Collaboration & Co-Authorship">🤝 Research Collaboration & Co-Authorship</option>
                <option value="Academic Mentorship & Thesis Guidance">💡 Academic Mentorship & Thesis Guidance</option>
              </select>
            </div>

            {/* Target Tone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MessageSquare size={12} className="text-purple-600" /> Strategic Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="High-Impact & Persuasive">🔥 High-Impact & Persuasive (Recommended)</option>
                <option value="Formal & Academic">🎓 Formal & Academic Rigor</option>
                <option value="Concise & Direct (Under 200 words)">⚡ Concise & Direct (Under 200 words)</option>
              </select>
            </div>

            {/* Custom Background / Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Your Research Background & Alignment Note</span>
                <span className="text-[10px] text-slate-400 font-medium">Derived from {academicField}</span>
              </label>
              <textarea
                value={customBackground}
                onChange={(e) => setCustomBackground(e.target.value)}
                rows={2}
                placeholder="Highlight your current academic status, thesis focus, or key research trajectory..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Key Skills */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Key Methodologies / Lab Skills (Separated by commas)
              </label>
              <input
                type="text"
                value={keySkills}
                onChange={(e) => setKeySkills(e.target.value)}
                placeholder="e.g. Molecular Docking, LC-MS, Cell Culture, QSAR, In-Vivo Assays"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* DNA Link Attachment Toggle */}
            <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <Dna size={16} className="text-violet-600 shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">
                    Attach Verified 1-Year Public Research DNA Link
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Allows the Professor to view your verified literature vectors & rigor score in 1 click
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={attachDnaLink}
                onChange={(e) => setAttachDnaLink(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* ─── Generate CTA ─── */}
          {!body && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Synthesizing Academic Synergies & Drafting Email...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Draft AI Outreach Email (⚡ 10 Zaps)</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ─── Result Workspace ─── */}
          {body && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600" /> Tailored Academic Draft Ready
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {body.split(/\s+/).length} words • ~1 min read
                </span>
              </div>

              {/* Subject Line Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Subject Line</span>
                  <button
                    onClick={handleCopySubject}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSubject ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                  </button>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-indigo-50/40 border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Email Body Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Email Message Body (Editable & Scrollable)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  className="w-full bg-[#FAFAF8] border border-slate-200 rounded-2xl p-4 text-xs font-medium leading-[1.8] text-slate-900 focus:outline-none focus:border-indigo-500 font-sans max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain scrollbar-thin resize-y"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer Controls ─── */}
        {body && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
              <span>Regenerate Draft</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFull}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedFull ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedFull ? 'Copied Full Email!' : 'Copy Full Email'}</span>
              </button>

              <button
                onClick={handleOpenMailto}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                <span>Open in Mail App</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
