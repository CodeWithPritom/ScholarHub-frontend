import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCitations, copyToClipboard } from '../utils/citationUtils'
import { Quote, X, Copy, Check } from 'lucide-react'

const CitationModal = ({ article, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('apa')
  const [copiedStyle, setCopiedStyle] = useState(null)

  if (!isOpen || !article) return null
  const citations = generateCitations(article)

  const styles = [
    { key: 'apa', label: 'APA 7th' },
    { key: 'mla', label: 'MLA 9th' },
    { key: 'harvard', label: 'Harvard' }
  ]

  const handleCopy = async (style) => {
    await copyToClipboard(citations[style])
    setCopiedStyle(style)
    setTimeout(() => setCopiedStyle(null), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full shadow-[0_48px_96px_-16px_rgba(0,0,0,0.25)] border border-slate-100 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <Quote size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Citation Generator</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-formatted references</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Style Tabs */}
            <div className="flex bg-slate-50 rounded-2xl p-1.5 mb-6 border border-slate-100">
              {styles.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveTab(s.key)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                    activeTab === s.key
                      ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Citation Text */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap break-words" style={{ fontFamily: "'Merriweather', serif" }}>
                {citations[activeTab]}
              </p>
            </div>

            {/* Copy Button */}
            <button
              onClick={() => handleCopy(activeTab)}
              className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                copiedStyle === activeTab
                  ? 'bg-green-500 text-white shadow-xl shadow-green-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200'
              }`}
            >
              {copiedStyle === activeTab ? <><Check size={16} /> Copied to Clipboard!</> : <><Copy size={16} /> Copy {styles.find(s => s.key === activeTab)?.label} Citation</>}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CitationModal
