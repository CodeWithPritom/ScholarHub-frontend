import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Check, Copy, Sparkles, X, FileText, AlertCircle,
  BookOpen, Sliders, RefreshCw, CheckCircle2, Download
} from 'lucide-react'
import { toast } from 'sonner'
import { BASE_URL } from '../../utils/api'
import { supabase } from '../../supabaseClient'

export const AIDisclosureModal = ({ isOpen, onClose, userName, academicField }) => {
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
      toast.success('Publication-ready AI disclosure statement generated!')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ─── Header ─── */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-0.5">
                <Sparkles size={11} /> Ethics & Integrity Shield (The Plagiarism Guard)
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Publication-Ready AI Ethics & Disclosure Generator
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Generate formal transparency declarations compliant with Nature, Elsevier, ICMJE, and IEEE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── Body Scrollable ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* Target Publisher Guidelines */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              1. Select Publisher AI Policy / Academic Guideline
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'nature', label: 'Springer Nature Policy', sub: 'Mandatory human accountability statement' },
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
                      ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-extrabold block leading-tight">{p.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">{p.sub}</span>
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
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t}</span>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                      active ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {active && '✓'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Author & Paper Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
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

          {/* Generate Button */}
          {!statement && (
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
                  <span>Generate Publication-Ready AI Disclosure</span>
                </>
              )}
            </button>
          )}

          {/* ─── Result Workspace ─── */}
          {statement && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" /> Formatted for {guidelineName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {statement.split(/\s+/).length} words
                </span>
              </div>

              <div className="p-4 bg-[#FAFAF8] border border-emerald-200/90 rounded-2xl text-xs font-medium leading-[1.85] text-slate-900 font-sans shadow-inner whitespace-pre-wrap">
                {statement}
              </div>

              {complianceNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span><strong>Editorial Tip:</strong> {complianceNotes}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ─── Footer Controls ─── */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
          {statement ? (
            <>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                <span>Re-draft</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Disclosure Statement'}</span>
              </button>
            </>
          ) : (
            <div className="w-full text-right">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
