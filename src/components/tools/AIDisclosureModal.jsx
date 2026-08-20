import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Check, Copy, Sparkles, X, FileText, AlertCircle,
  BookOpen, Sliders, RefreshCw, CheckCircle2, Download, ArrowRight, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { BASE_URL, notifyCreditsUpdated } from '../../utils/api'
import { supabase } from '../../supabaseClient'

export const AIDisclosureModal = ({ isOpen, onClose, userName, academicField }) => {
  const [activeStep, setActiveStep] = useState('setup') // setup, statement
  const [guideline, setGuideline] = useState('nature')
  const [paperTitle, setPaperTitle] = useState('')
  const [authorName, setAuthorName] = useState(userName || '')
  const [toolsUsed, setToolsUsed] = useState([
    'ScholarHub AI Literature Auditor',
    'Semantic Literature Search & Citation Engine'
  ])
  const [customScope, setCustomScope] = useState('')

  const [generating, setGenerating] = useState(false)
  const [statement, setStatement] = useState('')
  const [guidelineName, setGuidelineName] = useState('')
  const [complianceNotes, setComplianceNotes] = useState('')
  const [copied, setCopied] = useState(false)

  const toolOptions = [
    'ScholarHub AI Literature Auditor',
    'Semantic Literature Search & Citation Engine',
    'Automated Reference Extraction & RIS/BibTeX Manager',
    'Academic Readability & Syntax Refinement Engine'
  ]

  useEffect(() => {
    if (userName) setAuthorName(userName)
  }, [userName])

  if (!isOpen) return null

  const toggleTool = (tool) => {
    setToolsUsed(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Please log in to generate disclosures.')

      const payload = {
        guideline,
        tools_used: toolsUsed,
        paper_title: paperTitle,
        author_name: authorName,
        custom_scope: customScope,
        academic_field: academicField || 'General Research'
      }

      const res = await fetch(`${BASE_URL}/ai/generate-disclosure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to generate AI disclosure statement.')
      }

      const data = await res.json()
      setStatement(data.statement || data.output)
      setGuidelineName(data.guideline_name || 'Academic Guidelines')
      setComplianceNotes(data.compliance_notes || '')
      setActiveStep('statement')
      
      // Live reactive credit sync
      notifyCreditsUpdated(data.credits_remaining)
      toast.success('Publication-ready AI disclosure statement generated! (-5 Zaps deducted)')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!statement) return
    navigator.clipboard.writeText(statement)
    setCopied(true)
    toast.success('AI Disclosure Statement copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start sm:items-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)] flex flex-col overflow-hidden my-auto relative shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ─── Header (Sticky & Never Cut Off) ─── */}
        <div className="sticky top-0 z-20 p-4 sm:p-5 border-b border-slate-150 flex items-start justify-between bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-0.5 truncate">
                <Sparkles size={11} className="shrink-0" /> Ethics & Integrity Shield (The Plagiarism Guard)
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                Publication-Ready AI Ethics & Disclosure Generator
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                Generate formal transparency declarations compliant with Nature, Elsevier, ICMJE, and IEEE
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

        {/* ─── Stepper Tabs ─── */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50/90 border-b border-slate-200/80 shrink-0 flex items-center gap-2">
          <button
            onClick={() => setActiveStep('setup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'setup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>1. Policy & Declarations</span>
          </button>

          <button
            onClick={() => {
              if (statement) setActiveStep('statement')
              else handleGenerate()
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'statement'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>2. Formatted Statement {statement ? '✓' : ''}</span>
          </button>
        </div>

        {/* ─── Body Scrollable ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain">
          
          {/* STEP 1: SETUP & DECLARATION */}
          {activeStep === 'setup' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Target Publisher Guidelines */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>1. Select Publisher AI Policy / Guideline</span>
                  <span className="text-[10px] text-slate-400 font-medium">Select 1</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'nature', label: 'Springer Nature Policy', sub: 'Human accountability & methodology declaration' },
                    { id: 'elsevier', label: 'Elsevier & The Lancet', sub: 'Declaration of Generative AI writing section' },
                    { id: 'icmje', label: 'ICMJE Medical Journals', sub: 'Medical editorial board ethics compliance' },
                    { id: 'ieee', label: 'IEEE / ACM Standards', sub: 'Computer science & engineering disclosures' },
                    { id: 'thesis', label: 'University Dissertation', sub: 'Graduate school thesis submission declaration' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setGuideline(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        guideline === p.id 
                          ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-400/50' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-extrabold block leading-tight">{p.label}</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-1 block leading-snug">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools & Scope Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  2. Declared AI Assistance Modules
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {toolOptions.map(t => {
                    const active = toolsUsed.includes(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTool(t)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          active 
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 ring-1 ring-emerald-300' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-2">{t}</span>
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] shrink-0 ${
                          active ? 'bg-emerald-600 border-emerald-600 text-white font-black' : 'border-slate-300'
                        }`}>
                          {active && '✓'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Author & Paper Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Arup Bhowmik"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">Paper / Thesis Title (Optional)</label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    placeholder="e.g. Nanomedicine Delivery Mechanisms"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Action Banner */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Drafting Compliant Ethics Statement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Draft AI Disclosure Statement (⚡ 5 Zaps)</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: FORMATTED STATEMENT RESULT */}
          {activeStep === 'statement' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {statement ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-150 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" /> Formatted for {guidelineName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {statement.split(/\s+/).length} words
                      </span>
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? 'Copied to Clipboard' : 'Copy Statement'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Statement Box */}
                  <div className="p-4 bg-[#FAFAF8] border border-emerald-200/90 rounded-2xl text-xs font-medium leading-[1.85] text-slate-900 font-sans shadow-inner whitespace-pre-wrap max-h-64 sm:max-h-80 overflow-y-auto overscroll-contain scrollbar-thin">
                    {statement}
                  </div>

                  {complianceNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span><strong>Editorial Tip:</strong> {complianceNotes}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No statement generated yet. Click Generate in Step 1.
                </div>
              )}
            </div>
          )}

        </div>

        {/* ─── Footer Controls ─── */}
        <div className="p-4 sm:p-5 border-t border-slate-150 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
          {activeStep === 'statement' ? (
            <>
              <button
                onClick={() => setActiveStep('setup')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={13} />
                <span>Edit Parameters</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                  <span>Re-draft (⚡ 5 Zaps)</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold text-slate-500">
                ICMJE & COPE Ethics Transparency Standard
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
