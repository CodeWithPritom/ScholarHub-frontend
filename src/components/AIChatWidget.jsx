import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, XCircle, Send, FileText, Minimize2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Minimal Markdown-lite formatter for AI summaries (inline)
 */
const formatMarkdown = (text) => {
  if (!text) return null
  const paragraphs = text.split('\n\n')
  return paragraphs.map((para, i) => {
    if (para.trim().startsWith('- ') || para.trim().startsWith('* ')) {
      const items = para.split('\n').map(line => line.replace(/^[-*]\s+/, '').trim())
      return (
        <ul key={i} className="list-disc ml-6 mb-6 space-y-2">
          {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
        </ul>
      )
    }
    return <p key={i} className="mb-6 leading-relaxed">{parseInline(para)}</p>
  })
}

const parseInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

const AIChatWidget = ({
  // AI Prompt (the small suggestion card)
  aiPromptVisible,
  setAiPromptVisible,
  onSummarize,
  // AI Chat (the full chat widget)
  aiChatOpen,
  setAiChatOpen,
  aiWidgetMode,
  setAiWidgetMode,
  aiThinking,
  aiStep,
  aiProgress,
  aiSummary,
  isAiLimitReached,
  setIsAiLimitReached,
  userTier,
  lastSearched,
  // Chat conversation
  chatHistory,
  chatInput,
  setChatInput,
  handleSendMessage,
}) => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, aiThinking]);

  return (
    <>
      {/* AI Assistant Elements */}
      <AnimatePresence>
        {aiPromptVisible && (
          <motion.div 
            key="ai-prompt"
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-10 md:left-auto md:right-10 z-[100] w-full md:w-[340px] px-4 md:px-0 pb-4 md:pb-0"
          >
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-blue-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot size={80} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <Bot size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Intelligence Suite</div>
                  <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Assistant Active</div>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed mb-8">
                The analysis is complete! Would you like a condensed executive summary of the top 5 findings?
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onSummarize}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group/btn"
                >
                  <Sparkles size={16} className="group-hover/btn:scale-125 transition-transform" />
                  Yes, Summarize
                </button>
                <button 
                  onClick={() => setAiPromptVisible(false)}
                  className="w-full py-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {aiChatOpen && (
          <motion.div 
            key="ai-chat"
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              width: aiWidgetMode === 'maximized' ? 'min(1200px, 90vw)' : aiWidgetMode === 'minimized' ? '300px' : '450px',
              height: aiWidgetMode === 'minimized' ? '70px' : 'auto'
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-0 left-0 right-0 md:bottom-10 md:left-auto md:right-10 z-[101] bg-white shadow-[0_48px_96px_-16px_rgba(0,0,0,0.25)] md:border border-slate-100 overflow-hidden flex flex-col max-w-full ${
              aiWidgetMode === 'maximized' ? 'rounded-t-[2.5rem] md:rounded-[3rem]' : 'rounded-t-[2rem] md:rounded-[2.5rem]'
            }`}
            style={{ maxHeight: aiWidgetMode === 'maximized' ? '90vh' : aiWidgetMode === 'minimized' ? '70px' : '85vh' }}
          >
            {/* Chat Header */}
            <div className={`p-6 bg-slate-900 text-white flex items-center justify-between transition-all ${aiWidgetMode === 'minimized' ? 'h-full' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-0.5">Live Synthesis</div>
                  <div className="text-sm font-black tracking-tight">{aiWidgetMode === 'minimized' ? 'Report Ready' : 'AI Executive Report'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {aiWidgetMode !== 'minimized' && (
                  <>
                    <button 
                      onClick={() => setAiWidgetMode(aiWidgetMode === 'maximized' ? 'normal' : 'maximized')}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      title={aiWidgetMode === 'maximized' ? 'Restore' : 'Maximize'}
                    >
                      {aiWidgetMode === 'maximized' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button 
                      onClick={() => setAiWidgetMode('minimized')}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      title="Minimize"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </>
                )}
                {aiWidgetMode === 'minimized' && (
                  <button 
                    onClick={() => setAiWidgetMode('normal')}
                    className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <ChevronUp size={18} />
                  </button>
                )}
                <button 
                  onClick={() => { setAiChatOpen(false); setAiWidgetMode('normal'); }}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {aiWidgetMode !== 'minimized' && (
              <>
                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/50">
                  {isAiLimitReached ? (
                    <div className="py-10">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-[2.5rem] p-8 text-center relative overflow-hidden group shadow-lg shadow-amber-100/50">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Sparkles size={100} className="text-amber-500" />
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-200 mx-auto mb-6">
                          <Sparkles size={32} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Daily AI Limit Reached 🚀</h4>
                        <p className="text-slate-600 font-medium leading-relaxed mb-8 relative z-10 max-w-sm mx-auto">
                          You've used all your insights for today on the {userTier === 'free' ? 'FREE' : 'STARTER'} plan. Research shouldn't have boundaries.
                        </p>
                        <div className="flex flex-col gap-3 relative z-10 w-full max-w-xs mx-auto">
                          <button
                            onClick={() => {
                              setIsAiLimitReached(false);
                              navigate('/pricing');
                            }}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5"
                          >
                            UPGRADE TO {userTier === 'free' ? 'STARTER' : 'PRO'}
                          </button>
                          <button
                            onClick={() => setIsAiLimitReached(false)}
                            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-slate-200 transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : aiThinking && chatHistory.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="text-lg font-black text-slate-900 mb-4">{aiStep}</div>
                      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${aiProgress}%` }}
                          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                        />
                      </div>
                      <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">
                        Processing Scientific Papers...
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Initial Summary Bubble */}
                      {aiSummary && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-white rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Bot size={14} className="text-blue-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Synthesis</span>
                          </div>
                          <div className="font-serif text-slate-700 leading-relaxed text-sm" style={{ fontFamily: "'Merriweather', serif" }}>
                            {formatMarkdown(aiSummary)}
                          </div>
                        </motion.div>
                      )}

                      {/* Conversational History */}
                      {chatHistory.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm font-medium leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                              : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}

                      {/* Thinking Indicator */}
                      {aiThinking && chatHistory.length > 0 && (
                        <div className="flex justify-start">
                          <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none flex gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Chat Input & Actions */}
                <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => navigate('/ai-report', { state: { summary: aiSummary, keyword: lastSearched, sourceCount: 5 } })}
                      className="px-4 py-3 bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors rounded-xl border border-slate-100"
                      title="View Report"
                    >
                      <FileText size={18} />
                    </button>
                    <form onSubmit={handleSendMessage} className="flex-1 relative group">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this research..."
                        className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all outline-none"
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim() || aiThinking}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 transition-all shadow-lg shadow-blue-200 flex items-center justify-center"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={10} className="text-blue-400" />
                      Llama 3.1 Research Engine
                    </p>
                    <button 
                      onClick={() => { setAiChatOpen(false); setAiWidgetMode('normal'); }}
                      className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                    >
                      Dismiss Session
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
