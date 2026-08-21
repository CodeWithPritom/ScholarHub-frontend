import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Paperclip, Folder, Search, Mic, Lock, Square, X, 
  Sparkles, Zap, FlaskConical, Calculator, Globe, Box, Share2, 
  BarChart3, Workflow, Dna, Command, ShieldCheck, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { SCIENTIFIC_SKILLS, findSkillsByQuery } from '../utils/scientificSkills';

const ICON_MAP = {
  Zap,
  FlaskConical,
  Calculator,
  Globe,
  Box,
  Share2,
  BarChart3,
  Workflow,
  Dna,
  ShieldCheck,
  Award,
  Mic
};

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

  // Command Autocomplete state
  const [showSkillAutocomplete, setShowSkillAutocomplete] = useState(false);
  const [autocompleteFilter, setAutocompleteFilter] = useState('');
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);

  const attachmentMenuRef = useRef(null);
  const effortMenuRef = useRef(null);
  const autocompleteRef = useRef(null);
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
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowSkillAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect @ or / trigger for command autocomplete
  useEffect(() => {
    const match = localQuery.match(/(?:^|\s)([@/][a-zA-Z0-9_-]*)$/);
    if (match) {
      setAutocompleteFilter(match[1]);
      setShowSkillAutocomplete(true);
      setSelectedSkillIndex(0);
    } else {
      setShowSkillAutocomplete(false);
    }
  }, [localQuery]);

  // Filter skills based on trigger typing
  const filteredSkills = useMemo(() => {
    return findSkillsByQuery(autocompleteFilter);
  }, [autocompleteFilter]);

  // Auto-expand textarea height up to max-h-44 (176px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 176)}px`;
    }
  }, [localQuery]);

  const applySkillTemplate = (skill) => {
    const handle = skill.triggers[0];
    const match = localQuery.match(/(?:^|\s)([@/][a-zA-Z0-9_-]*)$/);
    if (match) {
      const idx = localQuery.lastIndexOf(match[1]);
      const newQuery = localQuery.substring(0, idx) + handle + ' ';
      setLocalQuery(newQuery);
    } else {
      setLocalQuery((prev) => (prev ? `${prev.trim()} ${handle} ` : `${handle} `));
    }
    setShowSkillAutocomplete(false);
    setShowAttachmentMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const [internalListening, setInternalListening] = useState(false);
  const recognitionRef = useRef(null);

  const isActuallyListening = isListening || internalListening;

  const handleToggleVoice = useCallback(() => {
    if (toggleVoiceRecognition) {
      toggleVoiceRecognition();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice dictation is not supported by your current browser.');
      return;
    }

    if (internalListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setInternalListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setInternalListening(true);
        toast.info('🎙️ Listening... Speak your research prompt.');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const textToAdd = transcript.trim();
        if (textToAdd) {
          setLocalQuery(prev => {
            const trimmed = prev.trim();
            if (!trimmed) return textToAdd;
            if (trimmed.endsWith(textToAdd)) return prev;
            return `${trimmed} ${textToAdd}`;
          });
        }
      };

      recognition.onerror = (err) => {
        console.warn('[SpeechRecognition] Error:', err);
        setInternalListening(false);
      };

      recognition.onend = () => {
        setInternalListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('[SpeechRecognition] Launch error:', e);
      setInternalListening(false);
    }
  }, [internalListening, toggleVoiceRecognition]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isInputDisabled) return;
    const q = localQuery.trim();
    if (!q) return;
    onSubmit(q);
    setLocalQuery('');
    setShowSkillAutocomplete(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (showSkillAutocomplete && filteredSkills.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSkillIndex((prev) => (prev + 1) % filteredSkills.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSkillIndex((prev) => (prev - 1 + filteredSkills.length) % filteredSkills.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySkillTemplate(filteredSkills[selectedSkillIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSkillAutocomplete(false);
        return;
      }
    }

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
      <div className="w-full 2xl:px-12 flex flex-col">
        
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

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 md:p-3 flex flex-col gap-2 shadow-sm hover:border-slate-300 transition-all w-full min-w-0 max-w-full relative">
          
          {/* Autocomplete Skill Popup (@ / / command trigger) */}
          <AnimatePresence>
            {showSkillAutocomplete && filteredSkills.length > 0 && (
              <motion.div
                ref={autocompleteRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-80 max-h-72 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl overflow-y-auto z-[70] py-2 flex flex-col border-t-2 border-t-indigo-500"
              >
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Command size={11} className="text-indigo-600" /> Scientific Skills Registry</span>
                  <span className="font-mono text-slate-400">↑↓ to navigate</span>
                </div>

                {filteredSkills.map((skill, index) => {
                  const IconComp = ICON_MAP[skill.iconName] || Sparkles;
                  const isSelected = index === selectedSkillIndex;

                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => applySkillTemplate(skill)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${isSelected ? 'bg-indigo-50/90 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${skill.badgeColor}`}>
                        <IconComp size={14} style={{ color: skill.accentColor }} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 truncate">{skill.name}</span>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-bold shrink-0">{skill.triggers[0]}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-snug line-clamp-1 mt-0.5">{skill.description}</span>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full flex items-start min-w-0 max-w-full">
            <textarea
              ref={textareaRef}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={uploadingPdf ? "Uploading document... please wait" : isAnalyzing ? "Research Agent is analyzing & synthesizing..." : "Type @ or / to invoke Scientific Skills (e.g. @circuit, @chem, @math)..."}
              disabled={isInputDisabled}
              className="w-full bg-transparent text-slate-800 text-sm md:text-base placeholder-slate-400 focus:outline-none py-1 resize-none overflow-y-auto max-h-44 min-h-[40px] disabled:opacity-50 font-sans leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] min-w-0"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100/90">
            <div className="flex items-center gap-2">
              
              {/* Scientific Tool Picker (+) Button */}
              <div className="relative shrink-0" ref={attachmentMenuRef}>
                <button
                  type="button"
                  disabled={isInputDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInputDisabled) return;
                    setShowAttachmentMenu(!showAttachmentMenu);
                  }}
                  className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 transition-all flex items-center justify-center shadow-xs ${isInputDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-600 hover:text-white cursor-pointer'}`}
                  title="Open Scientific Tool Picker & Attachments"
                >
                  <Plus size={16} />
                </button>
                
                {/* Scientific Tool Picker Popover Menu */}
                <AnimatePresence>
                  {showAttachmentMenu && !isInputDisabled && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="absolute bottom-full left-0 mb-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-3 z-[60] flex flex-col gap-3"
                    >
                      {/* Section 1: File & Library Attachments */}
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 pb-1.5 border-b border-slate-100">
                        <span>Documents & Attachments</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Paperclip size={16} className="text-indigo-600" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">Attach Document</span>
                            <span className="text-[9px] text-slate-500">PDF, PNG, JPG</span>
                          </div>
                        </button>

                        {activeWorkflow !== 'research' && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              if (onOpenLibraryModal) onOpenLibraryModal();
                            }}
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Folder size={16} className="text-indigo-600" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">Add Library Paper</span>
                              <span className="text-[9px] text-slate-500">Saved articles</span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Section 2: Scientific Visual Engines & Skills */}
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 pt-1 pb-1 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-indigo-600">
                          <Sparkles size={13} /> UVE v2.0 Scientific Engines
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                        {SCIENTIFIC_SKILLS.map((skill) => {
                          const IconComp = ICON_MAP[skill.iconName] || Sparkles;

                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => applySkillTemplate(skill)}
                              className="p-2 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/60 hover:border-indigo-200 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer group"
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${skill.badgeColor}`}>
                                <IconComp size={14} style={{ color: skill.accentColor }} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-indigo-900 truncate">{skill.name}</span>
                                <span className="text-[9px] font-mono text-indigo-600 font-bold">{skill.triggers[0]}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className="text-[11px] font-mono font-bold text-slate-400 hidden sm:inline-block">
                Type <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">@</kbd> for skills
              </span>
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
                          <span className="text-[10px] text-slate-500 mt-0.5">50 Zaps • Quick answers</span>
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
                          <span className="text-[10px] text-slate-500 mt-0.5">100 Zaps • Deep thoroughness</span>
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
                onClick={handleToggleVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${isInputDisabled ? 'opacity-40 cursor-not-allowed' : isActuallyListening ? 'text-red-500 border-red-200 bg-red-50 animate-pulse shadow-xs shadow-red-500/20' : 'text-slate-500 border-slate-200/60 hover:text-slate-800 hover:bg-slate-100 cursor-pointer'}`}
                title={isActuallyListening ? "Listening... click to stop" : "Voice Dictation"}
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
