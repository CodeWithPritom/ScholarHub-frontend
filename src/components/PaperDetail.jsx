import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { generateCitations, copyToClipboard } from '../utils/citationUtils'
import { formatAbstract } from '../utils/formatters'
import { BASE_URL } from '../utils/api'
import CopyButton from './CopyButton'
import CitationModal from './CitationModal'
import Footer from '../Footer'
import { supabase } from '../supabaseClient'
import {
  ArrowLeft, ExternalLink, ArrowUpRight, Quote,
  Tag, Globe, BookOpen, Calendar, Users, Activity,
  ChevronDown, ChevronUp, Lock, Mail, Search, Sparkles, Copy, Check
} from 'lucide-react'

const PaperDetail = ({ user, profile }) => {
  const params = useParams()
  const pmid = params['*'] || params.pmid
  const location = useLocation()
  const navigate = useNavigate()
  
  const [article, setArticle] = useState(location.state?.article || null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(!location.state?.article)
  
  const [copied, setCopied] = useState(false)
  const [citationOpen, setCitationOpen] = useState(false)
  const [showAllAuthors, setShowAllAuthors] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeModalMessage, setUpgradeModalMessage] = useState('')

  const [outreachEmail, setOutreachEmail] = useState('')
  const [generatingOutreach, setGeneratingOutreach] = useState(false)
  const [outreachError, setOutreachError] = useState('')
  const [outreachCopied, setOutreachCopied] = useState(false)

  // Immediate Unlock: Map the user's tier instantly from the App level profile
  const userTier = profile?.user_tier?.toLowerCase() || profile?.tier?.toLowerCase() || 'free'

  const handleGenerateOutreach = async () => {
    if (userTier === 'free') {
      setUpgradeModalMessage('Generic emails get ignored by professors. Use our AI Outreach Architect to write personalized, high-conversion emails based on this paper’s specific methodology. Available for Starter and Pro members.')
      setShowUpgradeModal(true)
      return
    }
    
    setGeneratingOutreach(true)
    setOutreachError('')
    
    try {
      const deviceId = localStorage.getItem('scholarhub_device_id');
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      if (!token) throw new Error("Authentication required. Please log in.")
      if (!deviceId) throw new Error("Device ID missing. Please refresh the page or register your device.")
      
      const res = await fetch(`${BASE_URL}/ai/generate-outreach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': deviceId || ''
        },
        body: JSON.stringify({
          paper_title: article.title,
          abstract: article.abstract || '',
          author_name: article.full_authors?.[0] || article.authors?.split(',')[0] || 'Author'
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Failed to generate outreach')
      }
      
      const data = await res.json()
      setOutreachEmail(data.output)
      
    } catch (err) {
      setOutreachError(err.message)
    } finally {
      setGeneratingOutreach(false)
    }
  }

  const handleCopyCitation = async () => {
    if (!article) return
    const citations = generateCitations(article)
    await copyToClipboard(citations.apa)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    window.scrollTo(0, 0)

    // Save to session archive if we have article
    if (article) {
      const currentArchive = JSON.parse(sessionStorage.getItem('viewedHistory') || '[]')
      if (!currentArchive.some(p => p.pmid === article.pmid)) {
        let finalUrl = article.url;
        let finalSource = article.source || 'ncbi';
        if (!finalUrl) {
          if (finalSource === 'arxiv') finalUrl = `https://arxiv.org/abs/${article.pmid}`;
          else if (finalSource === 'scholar') finalUrl = `https://semanticscholar.org/paper/${article.pmid}`;
          else if (finalSource === 'openalex') finalUrl = `https://openalex.org/${article.pmid}`;
          else if (finalSource === 'europepmc') finalUrl = `https://europepmc.org/article/MED/${article.pmid}`;
          else finalUrl = `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`;
        }
        const articleToSave = { ...article, url: finalUrl, source: finalSource };
        const newArchive = [articleToSave, ...currentArchive].slice(0, 50)
        sessionStorage.setItem('viewedHistory', JSON.stringify(newArchive))
      }
    }

    const fetchPaperDetail = async () => {
      const cacheKey = `paper_detail_${pmid}`
      const cachedData = sessionStorage.getItem(cacheKey)
      
      if (cachedData) {
        const data = JSON.parse(cachedData)
        if (data.main_article) setArticle(data.main_article)
        setRelated(data.similar_articles || [])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/paper/${encodeURIComponent(pmid)}`)
        if (res.ok) {
          const data = await res.json()
          
          // Cache the full response
          sessionStorage.setItem(cacheKey, JSON.stringify(data))

          if (data.main_article) {
            setArticle(data.main_article)
            
            // Also save fetched article to archive if it wasn't there
            const currentArchive = JSON.parse(sessionStorage.getItem('viewedHistory') || '[]')
            if (!currentArchive.some(p => p.pmid === data.main_article.pmid)) {
              let finalUrl = data.main_article.url
              if (!finalUrl) {
                if (data.main_article.source === 'arxiv') finalUrl = `https://arxiv.org/abs/${data.main_article.pmid}`
                else if (data.main_article.source === 'scholar') finalUrl = `https://semanticscholar.org/paper/${data.main_article.pmid}`
                else if (data.main_article.source === 'openalex') finalUrl = `https://openalex.org/${data.main_article.pmid}`
                else if (data.main_article.source === 'europepmc') finalUrl = `https://europepmc.org/article/MED/${data.main_article.pmid}`
                else finalUrl = `https://pubmed.ncbi.nlm.nih.gov/${data.main_article.pmid}`
              }
              const articleToSave = { ...data.main_article, url: finalUrl }
              const newArchive = [articleToSave, ...currentArchive].slice(0, 50)
              sessionStorage.setItem('viewedHistory', JSON.stringify(newArchive))
            }
            
            // Update articles array in sessionStorage to ensure full metadata persists when navigating back
            try {
              const currentArticles = JSON.parse(sessionStorage.getItem('articles') || '[]')
              const updatedArticles = currentArticles.map(p => 
                p.pmid === data.main_article.pmid ? { ...p, ...data.main_article } : p
              )
              sessionStorage.setItem('articles', JSON.stringify(updatedArticles))
            } catch(e) {}
          }
          setRelated(data.similar_articles || [])
        } else if (!article) {
          navigate('/') 
        }
      } catch (err) {
        console.error('Failed to fetch paper detail', err)
        if (!article) navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchPaperDetail()
  }, [pmid, navigate]) // Only run when pmid changes

  if (loading && !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Medical Literature...</span>
        </div>
      </div>
    )
  }

  if (!article) return null

  console.log('Article Data:', article)

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-700 font-sans">
      <CitationModal article={article} isOpen={citationOpen} onClose={() => setCitationOpen(false)} />

      {/* Mentorship Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Mentorship Network</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
              {upgradeModalMessage || "Mentorship & Direct Contact features are reserved for Starter and Pro members. Upgrade your plan to connect with global researchers."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => navigate('/pricing')}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/30"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar (Sticky Header) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Results
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCitationOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all shadow-sm"
            >
              <Quote size={14} />
              Cite
            </button>
            {(() => {
              const src = article.source || ''
              let label, color, url
              if (src === 'arxiv' || /^\d{4}\.\d{4,5}/.test(pmid)) {
                label = 'View on arXiv'
                color = 'bg-indigo-600 hover:bg-indigo-700'
                url = article.url || `https://arxiv.org/abs/${pmid}`
              } else if (src === 'scholar') {
                label = 'View on Scholar'
                color = 'bg-amber-500 hover:bg-amber-600'
                url = article.url || `https://semanticscholar.org/paper/${pmid}`
              } else if (src === 'openalex') {
                label = 'View on OpenAlex'
                color = 'bg-orange-500 hover:bg-orange-600'
                url = article.url || `https://openalex.org/${pmid}`
              } else if (src === 'europepmc') {
                label = 'View on Europe PMC'
                color = 'bg-emerald-600 hover:bg-emerald-700'
                url = article.url || `https://europepmc.org/article/MED/${pmid}`
              } else {
                label = pmid && /^\d+$/.test(pmid) ? 'View on PubMed' : 'View Original Source'
                color = 'bg-blue-600 hover:bg-blue-700'
                url = article.url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
              }
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 ${color} text-white text-xs font-bold rounded-lg transition-all shadow-sm`}
                >
                  {label}
                  <ExternalLink size={14} />
                </a>
              )
            })()}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-10 gap-10">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                  Academic Abstract
                </span>
                {article.pub_type && (
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.15em] border border-indigo-100">
                    {article.pub_type.split(',')[0]}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-snug md:leading-tight tracking-tight mb-4 break-words overflow-wrap-anywhere">
                {article.title}
              </h1>
            </div>

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mb-10 flex flex-wrap gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mr-2 py-1">
                  <Tag size={12} className="text-blue-500" /> Keywords
                </span>
                {article.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Abstract with Serif Typography */}
            <article className="prose prose-slate max-w-none mb-12">
              <div className="font-serif text-base md:text-lg text-slate-700 leading-relaxed break-words" style={{ fontFamily: "'Merriweather', serif" }}>
                {formatAbstract(article.abstract)}
              </div>
            </article>

            {/* Affiliations */}
            {article.affiliations && article.affiliations.length > 0 && (
              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mb-12">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe size={12} className="text-blue-500" /> Affiliations
                </h4>
                <div className="space-y-2">
                  {article.affiliations.map((aff, i) => (
                    <p key={i} className="text-xs font-medium text-slate-500 leading-relaxed">{aff}</p>
                  ))}
                </div>
              </div>
            )}


          </div>

          {/* Right Column - Info Sidebar (30%) */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              
              {/* Journal Info */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <BookOpen size={12} className="text-blue-500" /> Journal
                </h5>
                <p className="text-sm font-bold text-slate-900 leading-snug break-words overflow-wrap-anywhere">{article.journal}</p>
              </div>

              {/* Date */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <Calendar size={12} className="text-blue-500" /> Publication Date
                </h5>
                <p className="text-sm font-bold text-slate-900">{article.date}</p>
              </div>

              {/* Authors */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Users size={12} className="text-blue-500" /> Authors
                </h5>
                <div className="text-xs font-semibold text-slate-700 leading-relaxed space-y-1">
                  {(() => {
                    const authorList = article.full_authors && article.full_authors.length > 0 
                      ? article.full_authors 
                      : (article.authors ? article.authors.split(', ') : [])
                    
                    if (!authorList || authorList.length === 0) return <p>Unknown</p>

                    const displayedAuthors = showAllAuthors ? authorList : authorList.slice(0, 3)

                    return (
                      <>
                        {displayedAuthors.map((a, i) => <div key={i} className="break-words overflow-wrap-anywhere">{a}</div>)}
                        {authorList.length > 3 && (
                          <button 
                            onClick={() => setShowAllAuthors(!showAllAuthors)}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest mt-2 flex items-center gap-1"
                          >
                            {showAllAuthors ? (
                              <><ChevronUp size={12}/> Show Less</>
                            ) : (
                              <><ChevronDown size={12}/> +{authorList.length - 3} More</>
                            )}
                          </button>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* AI Outreach Architect */}
              <div className="pt-4 border-t border-slate-200/60 pb-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles size={12} className="text-indigo-400" /> AI Outreach Architect
                </h5>
                
                {!outreachEmail ? (
                  <button
                    onClick={handleGenerateOutreach}
                    disabled={generatingOutreach}
                    className="w-full relative group overflow-hidden rounded-xl p-[1px] transition-all hover:scale-[1.01]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-white text-xs font-bold shadow-lg">
                      {generatingOutreach ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Drafting Email...</>
                      ) : (
                        <><Sparkles size={14} /> Generate High-Impact Outreach Email</>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Drafted Message</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(outreachEmail)
                          setOutreachCopied(true)
                          setTimeout(() => setOutreachCopied(false), 2000)
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-100/50 hover:bg-indigo-200/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {outreachCopied ? <Check size={14} /> : <Copy size={14} />} 
                        {outreachCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap font-medium leading-relaxed bg-white p-3 rounded-lg border border-indigo-50/50 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200">
                      {outreachEmail}
                    </div>
                  </div>
                )}
                {outreachError && (
                  <p className="text-xs font-medium text-red-500 mt-2 text-center">{outreachError}</p>
                )}
              </div>

              {/* Mentorship & Contact */}
              <div className="pt-4 border-t border-slate-200/60">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  🎓 Research Mentorship & Contact
                </h5>
                <div 
                  className="space-y-2 relative"
                  onClick={() => {
                    if (userTier === 'free') {
                      setUpgradeModalMessage("Mentorship & Direct Contact features are reserved for Starter and Pro members. Upgrade your plan to connect with global researchers.")
                      setShowUpgradeModal(true)
                    }
                  }}
                >
                  <button 
                    disabled={userTier === 'free'}
                    onClick={() => {
                      if (userTier !== 'free') {
                        if (article.corresponding_email) {
                          window.location.href = `mailto:${article.corresponding_email}`
                        } else {
                          const authorQuery = article.full_authors?.[0] || article.authors?.split(',')[0] || ''
                          window.open(`https://google.com/search?q=${encodeURIComponent(authorQuery + ' university email contact')}`, '_blank')
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl text-xs font-bold transition-all ${
                      userTier === 'free' 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed blur-[2px]' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {userTier === 'free' ? (
                      <><Lock size={14} /> Contact Professor</>
                    ) : article.corresponding_email ? (
                      <><Mail size={14} /> Contact Professor</>
                    ) : (
                      <><Search size={14} /> Find Professor on Google</>
                    )}
                  </button>
                  <button 
                    disabled={userTier === 'free'}
                    onClick={() => {
                      if (userTier !== 'free' && article.author_orcid) {
                        window.open(`https://orcid.org/${article.author_orcid}`, '_blank')
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl text-xs font-bold transition-all ${
                      userTier === 'free' 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed blur-[2px]' 
                        : (!article.author_orcid ? 'hidden' : 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm')
                    }`}
                  >
                    {userTier === 'free' ? (
                      <><Lock size={14} /> View Detailed Profile</>
                    ) : (
                      <><Globe size={14} /> View Detailed Profile (ORCID)</>
                    )}
                  </button>
                  
                  {userTier === 'free' && (
                    <div className="absolute inset-0 z-10 cursor-pointer" />
                  )}
                </div>
                <p className="text-[9px] font-medium text-slate-400 mt-3 text-center px-2">
                  Emails are extracted from publicly available metadata in the original publication.
                </p>
              </div>

              {/* Identifiers */}
              <div className="pt-4 border-t border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">PMID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{article.pmid}</span>
                    <CopyButton text={article.pmid} label="PMID" />
                  </div>
                </div>
                
                {article.doi && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase">DOI</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{article.doi}</span>
                      <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="Open DOI">
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                )}
                
                {(article.volume || article.issue) && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Vol/Issue</span>
                    <span className="text-xs font-bold text-slate-900">
                      {article.volume}{article.issue ? `(${article.issue})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Related Research Discoveries */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="pt-16 border-t border-slate-200/60">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
            <Activity className="text-blue-600" size={24} /> 
            Related Research Discoveries
          </h3>
          
          {loading ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 scrollbar-none">
              {[1, 2, 3].map(i => (
                <div key={i} className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 flex-shrink-0 snap-start bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse">
                  <div className="h-4 bg-slate-200 rounded-md w-1/3 mb-4"></div>
                  <div className="h-5 bg-slate-200 rounded-md w-full mb-2"></div>
                  <div className="h-5 bg-slate-200 rounded-md w-4/5 mb-6"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
                </div>
              ))}
            </div>
          ) : related.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 scrollbar-none">
              {related.map((paper, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate(`/paper/${encodeURIComponent(paper.pmid)}`)}
                  className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 flex-shrink-0 snap-start bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest truncate max-w-[200px]">
                      <BookOpen size={10} className="shrink-0" />
                      <span className="truncate">{paper.journal}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug mb-4 group-hover:text-blue-600 transition-colors line-clamp-3">
                    {paper.title}
                  </h4>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                      <Calendar size={12} /> {paper.date}
                    </span>
                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center text-slate-500 text-sm font-bold flex flex-col items-center justify-center gap-2">
                <Activity size={24} className="text-slate-300" />
                No similar discoveries mapped in our database yet.
             </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PaperDetail
