import React, { useState } from 'react'
import {
  Mic, Clock, Check, Copy, Sparkles, X, FileText, ChevronRight,
  RefreshCw, Volume2, ShieldAlert, Award, MessageSquare, Play, Pause,
  ArrowRight, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { BASE_URL, notifyCreditsUpdated } from '../../utils/api'
import { supabase } from '../../supabaseClient'

export const ScientificPitchModal = ({ isOpen, onClose, defaultTopic, articles = [], academicField }) => {
  const [activeStep, setActiveStep] = useState('setup') // setup, results
  const [topic, setTopic] = useState(defaultTopic || '')
  const [audience, setAudience] = useState('Academic Conference Attendees & PIs')
  const [activePitchTab, setActivePitchTab] = useState('1min') // 1min, 3min, 10min, qa

  const [generating, setGenerating] = useState(false)
  const [pitchData, setPitchData] = useState(null)
  const [copied, setCopied] = useState(false)

  // Interactive Pitch Practice Timer
  const [timerSeconds, setTimerSeconds] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Please log in to generate presentation scripts.')

      const payload = {
        topic: topic || 'Current Research Investigation',
        articles: articles.slice(0, 6).map(art => ({
          title: art.title || art.full_metadata?.title || '',
          abstract: art.abstract || art.full_metadata?.abstract || art.snippet || ''
        })),
        academic_field: academicField || 'General Science',
        audience
      }

      const res = await fetch(`${BASE_URL}/ai/generate-pitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to generate scientific pitch.')
      }

      const data = await res.json()
      setPitchData(data)
      setActiveStep('results')
      
      // Live reactive credit sync
      notifyCreditsUpdated(data.credits_remaining)
      toast.success('Scientific Communication Suite generated! (-15 Zaps deducted)')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyCurrent = () => {
    if (!pitchData) return
    let textToCopy = ''
    if (activePitchTab === '1min') textToCopy = pitchData.one_minute_pitch
    else if (activePitchTab === '3min') textToCopy = pitchData.three_minute_pitch
    else if (activePitchTab === '10min') textToCopy = pitchData.ten_minute_script
    else if (activePitchTab === 'qa') {
      textToCopy = (pitchData.qa_defense || []).map((q, i) => `Q${i+1}: ${q.question}\nDefense: ${q.defense_response}`).join('\n\n')
    }

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start sm:items-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)] flex flex-col overflow-hidden my-auto relative shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ─── Header (Sticky & Never Cut Off) ─── */}
        <div className="sticky top-0 z-20 p-4 sm:p-5 border-b border-slate-150 flex items-start justify-between bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <Mic size={20} />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-black uppercase tracking-wider text-purple-700 mb-0.5 truncate">
                <Sparkles size={11} className="shrink-0" /> Scientific Communication Suite (Skill #10)
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                Academic Pitch & 3-Minute Thesis (3MT) Generator
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                Convert your research synthesis into high-impact elevator pitches, conference talks & defense scripts
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

        {/* ─── Stepper Navigation ─── */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50/90 border-b border-slate-200/80 shrink-0 flex items-center gap-2">
          <button
            onClick={() => setActiveStep('setup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'setup'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>1. Topic & Audience Setup</span>
          </button>

          <button
            onClick={() => {
              if (pitchData) setActiveStep('results')
              else handleGenerate()
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'results'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>2. Multi-Format Pitch Suite {pitchData ? '✓' : ''}</span>
          </button>
        </div>

        {/* ─── Body Scrollable ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain">
          
          {/* STEP 1: SETUP */}
          {activeStep === 'setup' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Core Research Topic / Problem
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. mRNA Targeted Delivery in Oncology"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Target Presentation Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Academic Conference Attendees & PIs">Academic Conference Attendees & PIs</option>
                    <option value="Grant Review Board & Funders">Grant Review Board & Funders</option>
                    <option value="PhD Dissertation Defense Committee">PhD Dissertation Defense Committee</option>
                    <option value="Biotech Industry Partners & Clinicians">Biotech Industry Partners & Clinicians</option>
                  </select>
                </div>
              </div>

              {articles.length > 0 && (
                <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl text-xs font-medium text-purple-900 flex items-center justify-between">
                  <span>Synthesizing from <strong>{articles.length} active literature papers</strong></span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 rounded-md">Context Injected</span>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Drafting Multi-Tier Pitch Suite...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Draft Scientific Pitch Suite (⚡ 15 Zaps)</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PITCH SUITE TABS */}
          {activeStep === 'results' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {pitchData ? (
                <>
                  {/* Sub-tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: '1min', label: '1-Min Elevator Pitch', icon: Clock, badge: '~150 words' },
                        { id: '3min', label: '3-Min Conference (3MT)', icon: Award, badge: '~450 words' },
                        { id: '10min', label: '10-Min Seminar Script', icon: FileText, badge: 'Slide cues' },
                        { id: 'qa', label: 'Committee Q&A Defense', icon: MessageSquare, badge: '3 Questions' }
                      ].map(t => {
                        const Icon = t.icon
                        const active = activePitchTab === t.id
                        return (
                          <button
                            key={t.id}
                            onClick={() => setActivePitchTab(t.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                              active
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Icon size={14} />
                            <span>{t.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                              active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {t.badge}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={handleCopyCurrent}
                      className="px-3 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy Script'}</span>
                    </button>
                  </div>

                  {/* 1-Min Pitch View */}
                  {activePitchTab === '1min' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium leading-[1.85] text-slate-900 font-sans shadow-inner whitespace-pre-wrap max-h-64 sm:max-h-80 overflow-y-auto overscroll-contain scrollbar-thin">
                        {pitchData.one_minute_pitch}
                      </div>
                    </div>
                  )}

                  {/* 3-Min Thesis (3MT) View */}
                  {activePitchTab === '3min' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium leading-[1.85] text-slate-900 font-sans shadow-inner whitespace-pre-wrap max-h-64 sm:max-h-80 overflow-y-auto overscroll-contain scrollbar-thin">
                        {pitchData.three_minute_pitch}
                      </div>
                    </div>
                  )}

                  {/* 10-Min Seminar Script View */}
                  {activePitchTab === '10min' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium leading-[1.85] text-slate-900 font-sans shadow-inner whitespace-pre-wrap max-h-64 sm:max-h-80 overflow-y-auto overscroll-contain scrollbar-thin">
                        {pitchData.ten_minute_script}
                      </div>
                    </div>
                  )}

                  {/* Q&A Committee Defense View */}
                  {activePitchTab === 'qa' && (
                    <div className="space-y-3 max-h-72 sm:max-h-96 overflow-y-auto overscroll-contain scrollbar-thin pr-1">
                      {(pitchData.qa_defense || []).map((q, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                          <div className="flex items-start gap-2 text-xs font-black text-slate-900">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">Q{idx + 1}</span>
                            <span>{q.question}</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 leading-relaxed">
                            <strong className="text-purple-700 block mb-1">Defense Strategy:</strong>
                            {q.defense_response}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No pitch suite generated yet.
                </div>
              )}
            </div>
          )}

        </div>

        {/* ─── Footer Controls ─── */}
        <div className="p-4 sm:p-5 border-t border-slate-150 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
          {activeStep === 'results' ? (
            <>
              <button
                onClick={() => setActiveStep('setup')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={13} />
                <span>Edit Topic</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                  <span>Re-generate (⚡ 15 Zaps)</span>
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
                Calibrated for Academic Conferences & 3MT Competitions
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
