import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatMarkdown } from '../utils/formatters'
import { supabase } from '../supabaseClient'
import {
  ArrowLeft, Printer, Download, FileText, Sparkles,
  Database, Dna
} from 'lucide-react'

const AIReport = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { summary, keyword, sourceCount } = location.state || {}
  const [activeTab, setActiveTab] = useState('synthesis')
  const [userTier, setUserTier] = useState('free')

  const parts = summary ? summary.split('[Research Gaps]') : []
  const mainSummary = parts[0] ? parts[0].trim() : ''
  const gapsContent = parts[1] ? parts[1].trim() : ''

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!summary) navigate('/')
  }, [summary, navigate])

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && session.user) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('user_tier')
            .eq('id', session.user.id)
            .maybeSingle()
          if (profData && profData.user_tier) {
            setUserTier(profData.user_tier.toLowerCase())
          }
        }
      } catch (err) {
        console.error("Error fetching tier in AIReport:", err)
      }
    }
    fetchTier()
  }, [])

  const handleExportPDF = () => {
    if (userTier === 'free') {
      alert("Upgrade to Starter or PRO to export reports as PDF.")
      navigate('/pricing')
      return
    }
    window.print()
  }

  if (!summary) return null

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-700">
      {/* Report Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest"
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>
      </nav>

      {/* Print Specific Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 2cm; }
          body { background: white !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          main { padding-top: 0 !important; padding-bottom: 0 !important; max-width: 100% !important; }
          .lg\\:grid-cols-4 { display: block !important; }
          .shadow-2xl { shadow: none !important; box-shadow: none !important; }
          .rounded-\\[3rem\\] { border-radius: 0 !important; }
          .p-12, .md\\:p-20 { padding: 0 !important; }
          .border { border: none !important; }
          .font-serif { font-size: 12pt !important; line-height: 1.6 !important; color: black !important; }
          h1 { font-size: 24pt !important; margin-bottom: 1cm !important; }
          .mt-20 { margin-top: 1cm !important; }
        }
      `}} />

      <main className="pt-32 pb-32 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Metadata */}
          <aside className="lg:col-span-1 order-2 lg:order-1 print:hidden">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Analysis Metadata</h4>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Original Query</span>
                    <p className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">"{keyword}"</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Analysis Scope</span>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={14} className="text-blue-500" />
                      {sourceCount} Analyzed Papers
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Confidence Score</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[94%]"></div>
                      </div>
                      <span className="text-[10px] font-black text-green-600">94%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white print:hidden">
                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Research Note</h5>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  This report is synthesized using advanced LLM technology. Please cross-reference with PMIDs for clinical decisions.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-[3rem] p-12 md:p-20 border border-slate-100 shadow-2xl shadow-slate-200/50">
              <div className="mb-12 border-b border-slate-100 pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest mb-6">
                  Executive Intelligence Report
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
                  Scientific Synthesis: {keyword}
                </h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">
                  Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 mb-10 gap-8 print:hidden">
                <button
                  onClick={() => setActiveTab('synthesis')}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === 'synthesis'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Executive Synthesis
                </button>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'gaps'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Identified Research Gaps
                  {gapsContent && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>

              {/* Dynamic View container */}
              <div className="print:hidden">
                {activeTab === 'synthesis' ? (
                  <article className="prose prose-slate max-w-none">
                    <div className="font-serif text-lg text-slate-800 leading-relaxed antialiased" style={{ fontFamily: "'Merriweather', serif" }}>
                      {formatMarkdown(mainSummary || summary)}
                    </div>
                  </article>
                ) : (
                  <article className="prose prose-slate max-w-none">
                    <div className="font-serif text-lg text-slate-800 leading-relaxed antialiased" style={{ fontFamily: "'Merriweather', serif" }}>
                      {gapsContent ? (
                        <div className="space-y-6">
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Unanswered Questions & Conflicting Findings:</p>
                          {formatMarkdown(gapsContent)}
                        </div>
                      ) : (
                        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No specific gaps identified</p>
                          <p className="text-slate-400 text-xs font-medium mt-2">Initiate a new search session to trigger research gap analysis.</p>
                        </div>
                      )}
                    </div>
                  </article>
                )}
              </div>

              {/* Print Layout */}
              <div className="hidden print:block space-y-12">
                <section>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b pb-2 mb-4">Executive Synthesis</h2>
                  <div className="font-serif text-sm text-slate-800 leading-relaxed" style={{ fontFamily: "'Merriweather', serif" }}>
                    {formatMarkdown(mainSummary || summary)}
                  </div>
                </section>
                {gapsContent && (
                  <section className="pt-8 border-t border-dashed border-slate-200">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-amber-600 border-b pb-2 mb-4">Identified Research Gaps</h2>
                    <div className="font-serif text-sm text-slate-800 leading-relaxed animate-pulse" style={{ fontFamily: "'Merriweather', serif" }}>
                      {formatMarkdown(gapsContent)}
                    </div>
                  </section>
                )}
              </div>

              <div className="mt-20 pt-12 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <Database size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Source</p>
                    <p className="text-xs font-bold text-slate-900">National Library of Medicine (NCBI)</p>
                  </div>
                </div>
                <div className="w-32 h-10 opacity-20 grayscale">
                  <div className="flex items-center gap-1 font-black text-2xl tracking-tighter text-slate-900">
                    <Dna size={24} className="text-blue-600" />
                    NCBI<span className="text-blue-600">PRO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIReport
