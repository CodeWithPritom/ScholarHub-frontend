import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, Trash2, ArrowUpRight, Clock, Dna, ChevronLeft } from 'lucide-react'
import Footer from '../Footer'
import { motion, AnimatePresence } from 'framer-motion'
const getExternalUrl = (pmid, source) => {
  if (!pmid) return '';
  if (source === 'arxiv') return `https://arxiv.org/abs/${pmid}`;
  if (source === 'scholar') return `https://www.semanticscholar.org/paper/${pmid}`;
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}`;
};

const Archive = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('viewedHistory') || '[]')
    setHistory(data)
  }, [])

  const handleRemove = (pmid) => {
    const updated = history.filter(item => item.pmid !== pmid)
    setHistory(updated)
    sessionStorage.setItem('viewedHistory', JSON.stringify(updated))
  }

  const handleClearAll = () => {
    setHistory([])
    sessionStorage.removeItem('viewedHistory')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      
      {/* Navbar Minimal */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Dna size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">ScholarHub<span className="text-blue-600">AI</span></span>
          </div>
          <button 
            onClick={() => navigate('/research')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Dashboard
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
              <Clock className="text-blue-600" size={32} />
              Session Archive
            </h1>
            <p className="text-slate-500 font-medium">Your local history of recently viewed research papers.</p>
          </div>
          
          {history.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} /> Clear All History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-16 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Your archive is empty.</h3>
            <p className="text-slate-500 text-sm font-medium mb-4 max-w-sm mx-auto">
              Any research papers you open during this session will be temporarily saved here for quick access.
            </p>
            <button 
              onClick={() => navigate('/research')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-200"
            >
              Start Researching
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((paper) => (
                <motion.div 
                  key={paper.pmid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                        <BookOpen size={10} />
                        <span className="truncate max-w-[200px]">{paper.journal || 'Unknown Journal'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                        <Calendar size={12} /> {paper.date || 'Unknown Date'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {paper.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleRemove(paper.pmid)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 size={16} />
                    </button>
                    <a
                      href={paper.url || getExternalUrl(paper.pmid, paper.source)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      View Again <ArrowUpRight size={14} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Archive
