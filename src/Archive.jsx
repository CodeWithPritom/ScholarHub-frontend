import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dna, ArrowLeft, Clock, ArrowUpRight, Trash2 } from 'lucide-react'

const Archive = () => {
  const navigate = useNavigate()
  const [viewedPapers, setViewedPapers] = useState([])
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    
    // Load from session storage
    const stored = sessionStorage.getItem('viewed_papers')
    if (stored) {
      setViewedPapers(JSON.parse(stored))
    }
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const clearArchive = () => {
    sessionStorage.removeItem('viewed_papers')
    setViewedPapers([])
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <Dna size={20} className="text-blue-600" />
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
              Session <span className="text-blue-600">Archive</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32 max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2">
              Recent <span className="text-blue-600">History</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Papers you've viewed during this session.
            </p>
          </div>
          
          {viewedPapers.length > 0 && (
            <button 
              onClick={clearArchive}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
            >
              <Trash2 size={16} /> Clear Session
            </button>
          )}
        </div>

        {viewedPapers.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Clock size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No History Yet</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
              Start reading papers from the dashboard and they will appear here for quick access during your session.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {viewedPapers.map((paper, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/paper/${encodeURIComponent(paper.pmid)}`, { state: { article: paper } })}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <h4 className="text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
                    {paper.title}
                  </h4>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{paper.pmid}</span>
                    <span>{paper.journal}</span>
                    <span>{paper.date}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowUpRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Archive
