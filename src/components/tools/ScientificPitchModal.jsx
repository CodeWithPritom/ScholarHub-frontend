import React, { useState } from 'react'
import {
  Mic, Clock, Check, Copy, Sparkles, X, FileText, ChevronRight,
  RefreshCw, Volume2, ShieldAlert, Award, MessageSquare, Play, Pause
} from 'lucide-react'
import { toast } from 'sonner'
import { BASE_URL } from '../../utils/api'
import { supabase } from '../../supabaseClient'

export const ScientificPitchModal = ({ isOpen, onClose, defaultTopic, articles = [], academicField }) => {
  const [topic, setTopic] = useState(defaultTopic || '')
  const [audience, setAudience] = useState('Academic Conference Attendees & PIs')
  const [activeTab, setActiveTab] = useState('1min') // 1min, 3min, 10min, qa

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
      toast.success('Scientific Communication Suite generated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyCurrent = () => {
    if (!pitchData) return
    let textToCopy = ''
    if (activeTab === '1min') textToCopy = pitchData.one_minute_pitch
    else if (activeTab === '3min') textToCopy = pitchData.three_minute_pitch
    else if (activeTab === '10min') textToCopy = pitchData.ten_minute_script
    else if (activeTab === 'qa') {
      textToCopy = (pitchData.qa_defense || []).map((q, i) => `Q${i+1}: ${q.question}\nDefense: ${q.defense_response}`).join('\n\n')
    }

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ─── Header ─── */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <Mic size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-black uppercase tracking-wider text-purple-700 mb-0.5">
                <Sparkles size={11} /> Scientific Communication Suite (Skill #10)
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Academic Pitch & 3-Minute Thesis (3MT) Generator
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Convert your research synthesis into high-impact elevator pitches, conference talks & defense scripts
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
          
          {/* Controls Bar */}
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

          {/* Generate Action Button */}
          {!pitchData && (
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
                  <span>Generate Scientific Pitch Suite</span>
                </>
              )}
            </button>
          )}

          {/* ─── Result Workspace ─── */}
          {pitchData && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: '1min', label: '1-Min Elevator Pitch', icon: Clock, badge: '~150 words' },
                    { id: '3min', label: '3-Min Conference (3MT)', icon: Award, badge: '~450 words' },
                    { id: '10min', label: '10-Min Seminar Script', icon: FileText, badge: 'Slide cues' },
                    { id: 'qa', label: 'Committee Q&A Defense', icon: MessageSquare, badge: '3 Questions' }
                  ].map(t => {
                    const Icon = t.icon
                    const active = activeTab === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          active
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{t.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          active ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {t.badge}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleCopyCurrent}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              {/* Tab 1: 1-Minute Elevator Pitch */}
              {activeTab === '1min' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs text-purple-900 font-bold">
                    <span className="flex items-center gap-2">
                      <Clock size={15} className="text-purple-600" />
                      <span>Delivery Target: <strong>60 Seconds</strong> (130-150 words per minute speaking pace)</span>
                    </span>
                    <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-purple-200 text-purple-700">
                      {pitchData.one_minute_pitch.split(/\s+/).length} words
                    </span>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl text-sm leading-[1.85] text-slate-900 font-serif shadow-inner whitespace-pre-wrap">
                    {pitchData.one_minute_pitch}
                  </div>
                </div>
              )}

              {/* Tab 2: 3-Minute Conference Summary (3MT) */}
              {activeTab === '3min' && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900 font-bold">
                    <span className="flex items-center gap-2">
                      <Award size={15} className="text-indigo-600" />
                      <span>3-Minute Thesis (3MT) Competition Format (Single Slide Concept)</span>
                    </span>
                    <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-700">
                      {pitchData.three_minute_pitch.split(/\s+/).length} words
                    </span>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl text-sm leading-[1.85] text-slate-900 font-serif shadow-inner whitespace-pre-wrap">
                    {pitchData.three_minute_pitch}
                  </div>
                </div>
              )}

              {/* Tab 3: 10-Minute Deep Dive Seminar Script */}
              {activeTab === '10min' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-800 font-bold">
                    <span className="flex items-center gap-2">
                      <FileText size={15} className="text-slate-600" />
                      <span>Slide-by-Slide Defense Script with Visual Cues</span>
                    </span>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl text-xs leading-[1.9] text-slate-900 font-mono shadow-inner whitespace-pre-wrap">
                    {pitchData.ten_minute_script}
                  </div>
                </div>
              )}

              {/* Tab 4: Committee Q&A Defense */}
              {activeTab === 'qa' && (
                <div className="space-y-3">
                  {(pitchData.qa_defense || []).map((qa, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                      <div className="flex items-start gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider shrink-0 mt-0.5">
                          Tough Question {i + 1}
                        </span>
                        <h5 className="text-xs font-black text-slate-900">
                          {qa.question}
                        </h5>
                      </div>
                      <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-950 font-medium leading-relaxed">
                        <strong className="text-emerald-800 block mb-0.5">Evidence-Backed Defense:</strong>
                        {qa.defense_response}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* ─── Footer Controls ─── */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
          {pitchData ? (
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
                onClick={handleCopyCurrent}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Current Section'}</span>
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
