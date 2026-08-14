import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Paperclip, Folder, Search, Mic, Lock, Square, X } from 'lucide-react';
import { toast } from 'sonner';

export const ChatInput = React.memo(({ 
  onSubmit, 
  onStopGeneration,
  activeWorkflow = 'research', 
  researchEffort = 'standard', 
  setResearchEffort, 
  maxComputeAccess = 'standard', 
  onOpenLibraryModal,
  onPdfUpload,
  uploadingPdf = false,
  uploadMeta = null,
  attachedFile = null,
  onRemoveAttachment = null,
  toggleVoiceRecognition,
  isListening = false,
  isAnalyzing = false
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEffortMenu, setShowEffortMenu] = useState(false);

  const attachmentMenuRef = useRef(null);
  const effortMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const isInputDisabled = isAnalyzing || uploadingPdf;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp'];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext) && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Supported formats: PDF documents & PNG/JPG/WEBP images.');
        return;
      }
      if (onPdfUpload) {
        onPdfUpload(file);
      }
    }
    e.target.value = '';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target)) {
        setShowAttachmentMenu(false);
      }
      if (effortMenuRef.current && !effortMenuRef.current.contains(e.target)) {
        setShowEffortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand textarea height up to max-h-44 (176px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 176)}px`;
    }
  }, [localQuery]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isInputDisabled) return;
    const q = localQuery.trim();
    if (!q) return;
    onSubmit(q);
    setLocalQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full shrink-0 border-t border-slate-200/80 bg-white px-3 py-1.5 md:py-2 flex justify-center z-30">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept=".pdf,application/pdf,image/png,image/jpeg,image/webp,image/jpg" 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <div className="w-full w-full 2xl:px-12 flex flex-col">
        {/* Real-time In-Chat Upload Progress Card */}
        <AnimatePresence>
          {uploadingPdf && uploadMeta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full bg-slate-900 text-white rounded-2xl p-4 mb-2 shadow-xl border border-slate-800 flex flex-col gap-2.5 z-40"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold truncate max-w-[60%]">
                  <Paperclip size={15} className="text-indigo-400 shrink-0 animate-bounce" />
                  <span className="truncate">{uploadMeta.fileName}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-mono">
                  <span className="text-slate-300">{uploadMeta.loadedMB} / {uploadMeta.totalMB} MB</span>
                  <span className="text-indigo-300 font-extrabold">{uploadMeta.speedStr}</span>
                  <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider">
                    {uploadMeta.percent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-150 shadow-sm"
                  style={{ width: `${Math.max(uploadMeta.percent, 4)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-0.5">
                <span>⚡ Uploading & parsing document content locally...</span>
                <span>{uploadMeta.percent < 100 ? `${100 - uploadMeta.percent}% remaining` : 'Analyzing text & structuring topics...'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 md:p-3 flex flex-col gap-2 shadow-sm hover:border-slate-300 transition-all w-full relative">
          <div className="relative w-full flex items-start">
            <textarea
              ref={textareaRef}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={uploadingPdf ? "Uploading document... please wait" : isAnalyzing ? "Research Agent is analyzing & synthesizing..." : "Ask a follow-up or explore another direction..."}
              disabled={isInputDisabled}
              className="w-full bg-transparent text-slate-800 text-sm md:text-base placeholder-slate-400 focus:outline-none py-1 resize-none overflow-y-auto max-h-44 min-h-[40px] disabled:opacity-50 font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100/90">
            <div className="flex items-center gap-2">
              {/* Attach (+) Button on the Left */}
              <div className="relative shrink-0" ref={attachmentMenuRef}>
                <button
                  type="button"
                  disabled={isInputDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInputDisabled) return;
                    setShowAttachmentMenu(!showAttachmentMenu);
                  }}
                  className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 transition-all flex items-center justify-center shadow-xs ${isInputDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-200 hover:text-slate-800 cursor-pointer'}`}
                >
                  <Plus size={16} />
                </button>
                
                {/* Popover Menu */}
                <AnimatePresence>
                  {showAttachmentMenu && !isInputDisabled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="absolute bottom-full left-0 mb-3 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-[60] flex flex-col overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachmentMenu(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Paperclip size={14} className="text-slate-400" />
                        Attach PDF or Image
                      </button>
                      {activeWorkflow !== 'research' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false);
                            if (onOpenLibraryModal) onOpenLibraryModal();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                        >
                          <Folder size={14} className="text-slate-400" />
                          Add from library
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Effort Selector Popover - Only for Chat with Paper & Research Agent */}
              {(activeWorkflow === 'chat' || activeWorkflow === 'research') && (
                <div className="relative shrink-0" ref={effortMenuRef}>
                  <button
                    type="button"
                    disabled={isInputDisabled}
                    onClick={() => {
                      if (isInputDisabled) return;
                      setShowEffortMenu(!showEffortMenu);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 bg-indigo-600 text-white shadow-xs shrink-0 whitespace-nowrap ${isInputDisabled ? 'opacity-40 cursor-not-allowed select-none' : 'hover:bg-indigo-700 cursor-pointer'}`}
                    title={isInputDisabled ? "Tier switching disabled while uploading/analyzing" : "Select Research Effort Tier"}
                  >
                    {researchEffort === 'standard' ? 'Standard ⚡' : researchEffort === 'advanced' ? 'Advanced ✨' : 'Deep 🧠'}
                  </button>
                  <AnimatePresence>
                    {showEffortMenu && !isInputDisabled && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-full right-0 mb-3 w-56 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl py-2 z-[60] flex flex-col"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (setResearchEffort) setResearchEffort('standard');
                            setShowEffortMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex flex-col"
                        >
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Standard ⚡</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">10 Zaps • Quick answers</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (setResearchEffort) setResearchEffort('advanced');
                            setShowEffortMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex flex-col border-t border-slate-100"
                        >
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Advanced ✨</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">50 Zaps • Deep thoroughness</span>
                        </button>
                        <button
                          type="button"
                          disabled={maxComputeAccess === 'standard' || maxComputeAccess === 'advanced'}
                          onClick={() => {
                            if (maxComputeAccess === 'standard' || maxComputeAccess === 'advanced') {
                              toast.error('Upgrade to Pro tier to unlock Heavy Compute models.');
                              return;
                            }
                            if (setResearchEffort) setResearchEffort('deep');
                            setShowEffortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 transition-colors flex flex-col border-t border-slate-100 ${(maxComputeAccess === 'standard' || maxComputeAccess === 'advanced') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                        >
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {(maxComputeAccess === 'standard' || maxComputeAccess === 'advanced') ? <Lock size={10} className="text-slate-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                            Deep 🧠
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">200 Zaps • Maximum reasoning</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Voice Dictation */}
              <button
                type="button"
                disabled={isInputDisabled}
                onClick={toggleVoiceRecognition}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${isInputDisabled ? 'opacity-40 cursor-not-allowed' : isListening ? 'text-red-500 border-red-200 bg-red-50 animate-pulse shadow-xs shadow-red-500/20' : 'text-slate-500 border-slate-200/60 hover:text-slate-800 hover:bg-slate-100 cursor-pointer'}`}
                title="Voice Dictation"
              >
                <Mic size={16} />
              </button>

              {/* Stop Button (During Generation) OR Search Submit Button */}
              {isAnalyzing ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5 animate-pulse"
                  title="Stop AI Generation immediately"
                >
                  <Square size={13} className="fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isInputDisabled || !localQuery.trim()}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search size={15} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ChatInput;
