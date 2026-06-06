import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, RotateCcw, AlertCircle, Clock, Sparkles, FlaskConical, Smile, Ghost, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { getOrCreateDeviceId } from '../utils/deviceSync';

export default function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('support_chat_history');
      return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'Hi there! I am Emo ✨, your AI guardian! How can I help you today? 🧬' }];
    } catch {
      return [{ role: 'assistant', content: 'Hi there! I am Emo ✨, your AI guardian! How can I help you today? 🧬' }];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [voiceMode, setVoiceMode] = useState(() => {
    const saved = sessionStorage.getItem('support_voice_mode');
    return saved ? JSON.parse(saved) : null;
  });
  // Removed bee animation state for performance
  const navigate = useNavigate();
  
  // Cooldown State
  const COOLDOWN_DURATION = 600; // 10 minutes in seconds
  const [cooldownExpiry, setCooldownExpiry] = useState(() => {
    const saved = sessionStorage.getItem('support_cooldown_expiry');
    return saved ? parseInt(saved) : null;
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const messagesEndRef = useRef(null);

  // Toggle listener
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-support-bot', handleToggle);
    return () => window.removeEventListener('toggle-support-bot', handleToggle);
  }, []);

  // Pre-load voices so they are ready when needed (Fix for Chrome/Edge)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Save history
  useEffect(() => {
    sessionStorage.setItem('support_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Helper to clean text for speech synthesis
  const cleanForSpeech = (rawText) => {
    let t = rawText.replace(/<[^>]*>?/gm, ''); // Remove HTML
    // Remove Emojis using Unicode property escapes
    t = t.replace(/\p{Emoji_Presentation}/gu, '');
    t = t.replace(/\p{Emoji}\uFE0F/gu, '');
    // Fallback common emojis just in case
    t = t.replace(/✨|🚀|🧬|🧠|🔥|🚨|🍯|👂|😊|🤩|🤔|💪/gu, '');
    // Remove Markdown & tricky punctuation
    t = t.replace(/\*|#|\[|\]|\(|\)|_|-/g, '');
    // Normalize smart quotes to standard single quotes
    t = t.replace(/’/g, "'");
    // Expand common contractions to prevent "apostrophe" spelling out
    t = t.replace(/\bI'm\b/gi, "I am");
    t = t.replace(/\bcan't\b/gi, "cannot");
    t = t.replace(/\bwon't\b/gi, "will not");
    t = t.replace(/\bdon't\b/gi, "do not");
    t = t.replace(/\bdoesn't\b/gi, "does not");
    t = t.replace(/\bit's\b/gi, "it is");
    t = t.replace(/\bthat's\b/gi, "that is");
    t = t.replace(/\bwhat's\b/gi, "what is");
    t = t.replace(/\byou're\b/gi, "you are");
    t = t.replace(/\bwe're\b/gi, "we are");
    t = t.replace(/\bthey're\b/gi, "they are");
    t = t.replace(/\bI've\b/gi, "I have");
    t = t.replace(/\byou've\b/gi, "you have");
    t = t.replace(/\bwe've\b/gi, "we have");
    t = t.replace(/\bthey've\b/gi, "they have");
    t = t.replace(/\bI'll\b/gi, "I will");
    t = t.replace(/\byou'll\b/gi, "you will");
    t = t.replace(/\bhe'll\b/gi, "he will");
    t = t.replace(/\bshe'll\b/gi, "she will");
    t = t.replace(/\bwe'll\b/gi, "we will");
    t = t.replace(/\bthey'll\b/gi, "they will");
    t = t.replace(/\bisn't\b/gi, "is not");
    t = t.replace(/\baren't\b/gi, "are not");
    t = t.replace(/\bwasn't\b/gi, "was not");
    t = t.replace(/\bweren't\b/gi, "were not");
    t = t.replace(/\bhaven't\b/gi, "have not");
    t = t.replace(/\bhasn't\b/gi, "has not");
    t = t.replace(/\bhadn't\b/gi, "had not");
    t = t.replace(/\bwouldn't\b/gi, "would not");
    t = t.replace(/\bcouldn't\b/gi, "could not");
    t = t.replace(/\bshouldn't\b/gi, "should not");
    // Strip trailing commas/dots that might cause issues if parsed weirdly
    t = t.replace(/(\.+)$/, '');
    
    return t;
  };

  // Emo's Voice Synthesizer
  const speak = (text) => {
    if (voiceMode && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel ongoing speech
      const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
      const voices = window.speechSynthesis.getVoices();
      
      // Look for known soft/female voices across Windows, Mac, and Android
      const preferredVoices = ['Google US English', 'Google UK English Female', 'Zira', 'Hazel', 'Samantha', 'Victoria', 'Tessa', 'Veena'];
      let selectedVoice = null;
      for (const pref of preferredVoices) {
        selectedVoice = voices.find(v => v.name.includes(pref));
        if (selectedVoice) break;
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('girl')) 
                     || voices.find(v => !v.name.includes('David') && !v.name.includes('Mark') && !v.name.toLowerCase().includes('male'));
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.pitch = 1.0; // Normal pitch to prevent weird robotic/alien sounds
      utterance.rate = 1.05; // Normal speed
      window.speechSynthesis.speak(utterance);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Cooldown timer
  useEffect(() => {
    if (!cooldownExpiry) return;

    const tick = () => {
      const now = Date.now();
      if (now >= cooldownExpiry) {
        setCooldownExpiry(null);
        sessionStorage.removeItem('support_cooldown_expiry');
        setTimeRemaining(0);
      } else {
        setTimeRemaining(Math.ceil((cooldownExpiry - now) / 1000));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownExpiry]);

  const handleSend = async (e, overrideMessage = null) => {
    if (e) e.preventDefault();
    const userMessage = overrideMessage || input.trim();
    if (!userMessage || isLoading || cooldownExpiry) return;

    setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));

      const data = await apiFetch('/api/support/chat', {
        method: 'POST',
        headers: { 'X-Device-ID': deviceId },
        body: JSON.stringify({ message: userMessage, history: historyForApi })
      });

      let replyText = data.reply;
      // Handle both [NAV:library] and NAV:library
      const navMatch = replyText.match(/\[?NAV:([a-zA-Z0-9_-]+)\]?/);
      if (navMatch) {
        const path = navMatch[1];
        navigate(`/${path}`);
        replyText = replyText.replace(navMatch[0], '').trim();
      }

      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      speak(replyText);
    } catch (err) {
      console.error('[SupportBot] Connection Error:', err);
      if (err.message.includes('coffee break') || err.message.includes('429') || err.message.includes('sizzling')) {
        const expiry = Date.now() + COOLDOWN_DURATION * 1000;
        setCooldownExpiry(expiry);
        sessionStorage.setItem('support_cooldown_expiry', expiry.toString());
        setMessages(prev => [...prev, { role: 'assistant', content: err.message }]);
        speak("Oof! I feel heavy now! My neural circuits are sizzling from too much science! I need a 10-minute break. Need emergency help? Click the direct contact founder button below!");
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Oh no! My circuits got tangled. Please try again! 🐝🔧' }]);
        speak("Oh no! My circuits got tangled. Please try again!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const initialMessage = [{ role: 'assistant', content: 'Hi there! I am Emo ✨, your AI guardian! How can I help you today? 🧬' }];
    setMessages(initialMessage);
    sessionStorage.setItem('support_chat_history', JSON.stringify(initialMessage));
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsOpen(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const parseMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 font-bold">$1</strong>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-medium hover:text-indigo-800 transition-colors">$1</a>');
    html = html.replace(/^(?:\*|\-)\s+(.*)$/gm, '<li class="ml-4 list-disc marker:text-indigo-400">$1</li>');
    html = html.replace(/\n/g, '<br/>');
    return { __html: html };
  };

  const waitingMessages = [
    "Emo is asking the scientists...",
    "Scanning the knowledge base... ✨",
    "Gathering sweet knowledge... 🍯"
  ];
  const [waitingMessage, setWaitingMessage] = useState(waitingMessages[0]);

  useEffect(() => {
    if (isLoading) {
      setWaitingMessage(waitingMessages[Math.floor(Math.random() * waitingMessages.length)]);
    }
  }, [isLoading]);

  const handleVoiceChoice = (enabled) => {
    setVoiceMode(enabled);
    sessionStorage.setItem('support_voice_mode', JSON.stringify(enabled));
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop talking instantly
    } else if (enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Yay! I can't wait to hear your voice! Click the mic and start talking.");
      const voices = window.speechSynthesis.getVoices();
      
      const preferredVoices = ['Google US English', 'Google UK English Female', 'Zira', 'Hazel', 'Samantha', 'Victoria', 'Tessa', 'Veena'];
      let selectedVoice = null;
      for (const pref of preferredVoices) {
        selectedVoice = voices.find(v => v.name.includes(pref));
        if (selectedVoice) break;
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('girl')) 
                     || voices.find(v => !v.name.includes('David') && !v.name.includes('Mark') && !v.name.toLowerCase().includes('male'));
      }
      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.pitch = 1.0; // Normal pitch to prevent weird robotic/alien sounds
      utterance.rate = 1.05; // Normal speed
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Oops! Your browser doesn't support my ears (Speech Recognition).");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsMicActive(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(null, transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'not-allowed') {
        const msg = "Oops! I'm still learning that language, or I couldn't hear you. Can we talk in English or Bangla?";
        setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
        speak(msg);
      }
      setIsMicActive(false);
    };

    recognition.onend = () => setIsMicActive(false);
    recognition.start();
  };

  const cooldownProgress = cooldownExpiry ? ((COOLDOWN_DURATION - timeRemaining) / COOLDOWN_DURATION) * 100 : 100;

  return (
    <>
      {/* Bee Animation Removed for Performance */}

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Smile size={26} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[9999] w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_12px_40px_rgba(79,70,229,0.25)] border border-white/50 flex flex-col overflow-hidden"
          >
            {/* Glassmorphism Header */}
            <div className="flex items-center justify-between p-4 bg-indigo-600/90 backdrop-blur-md text-white shrink-0 shadow-sm relative z-10 border-b border-indigo-500/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 relative">
                  <Smile size={18} className="text-indigo-100" />
                  <span className="absolute -bottom-1 -right-1 text-xs drop-shadow-sm">🐝</span>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide leading-tight">Emo ✨</h3>
                  <p className="text-[10px] text-indigo-200 font-medium tracking-wider uppercase">AI Guardian</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {voiceMode !== null && (
                  <button 
                    onClick={() => handleVoiceChoice(!voiceMode)} 
                    title={voiceMode ? "Disable Voice Mode" : "Enable Voice Mode"}
                    className={`p-1.5 rounded-lg transition-colors ${voiceMode ? 'text-rose-300 hover:text-white hover:bg-white/20' : 'text-slate-300 hover:text-white hover:bg-white/20'}`}
                  >
                    {voiceMode ? <Mic size={16} /> : <MicOff size={16} />}
                  </button>
                )}
                <button 
                  onClick={handleReset} 
                  title="Reset Conversation"
                  className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={handleClose} 
                  className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              <AnimatePresence>
                {messages.map((m, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm ${
                        m.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/20' 
                          : 'bg-white/90 border border-slate-200/60 text-slate-800 rounded-bl-none shadow-slate-200/50'
                      }`}
                      dangerouslySetInnerHTML={m.role === 'user' ? { __html: m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') } : parseMarkdown(m.content)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Cute Loading Animation */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 p-3 rounded-2xl rounded-bl-none shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        animate={{ x: [0, 5, -5, 5, 0], y: [0, -3, 3, -3, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="text-xl drop-shadow-sm"
                      >
                        🐝
                      </motion.div>
                      <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="text-xs text-indigo-500 font-black uppercase tracking-widest"
                      >
                        Thinking...
                      </motion.div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      {waitingMessage}
                    </p>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input / Cooldown Area */}
            {cooldownExpiry ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50/95 backdrop-blur-xl border-t border-amber-200 shrink-0 relative overflow-hidden flex flex-col p-5 rounded-b-3xl"
              >
                {/* Tired Bot Animation */}
                <div className="flex justify-center mb-4 pt-2">
                  <motion.div 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/50">
                      <Sparkles size={28} className="text-white opacity-90" />
                    </div>
                    {/* Zzz floating */}
                    <motion.div 
                      animate={{ opacity: [0, 1, 0], y: [0, -15], x: [0, 5] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0 }}
                      className="absolute -top-3 -right-2 text-orange-600 font-black text-sm drop-shadow-sm"
                    >
                      Z
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: [0, 1, 0], y: [0, -20], x: [0, 10] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.6 }}
                      className="absolute -top-6 -right-5 text-orange-600 font-black text-lg drop-shadow-sm"
                    >
                      z
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: [0, 1, 0], y: [0, -25], x: [0, 15] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 1.2 }}
                      className="absolute -top-10 -right-8 text-orange-600 font-black text-xl drop-shadow-sm"
                    >
                      z
                    </motion.div>
                  </motion.div>
                </div>

                <p className="text-xs font-bold text-amber-900 text-center mb-5 leading-relaxed">
                  Oof! My neural circuits are sizzling from too much science! 🧠🔥 Emo needs a quick 10-minute recharge break to keep up with your brilliant mind.
                </p>

                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">
                    <span>Recharge Progress</span>
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                  <div className="h-2.5 bg-amber-200/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      initial={{ width: `${cooldownProgress}%` }}
                      animate={{ width: `${cooldownProgress}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </div>

                {/* Emergency Button */}
                <div className="text-center border-t border-amber-200/50 pt-3">
                  <p className="text-[10px] font-bold text-amber-700/80 mb-2">Need help urgently? 🚨</p>
                  {showEmergency ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-amber-100"
                    >
                      <p className="text-[10px] font-bold text-slate-700 leading-snug">
                        Please email our lead architect Arup Bhowmik Pritom directly at: <br/>
                        <a href="mailto:arupbhowmikpritom@gmail.com" className="text-indigo-600 hover:text-indigo-700 underline mt-1.5 block">arupbhowmikpritom@gmail.com</a>
                      </p>
                      <p className="text-[9px] font-semibold text-slate-500 mt-1.5">He will get back to you within 24 hours!</p>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowEmergency(true)}
                      className="w-full py-2 bg-white text-amber-600 text-[11px] font-black tracking-wide rounded-xl border border-amber-200 shadow-sm hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      DIRECT CONTACT FOUNDER
                    </button>
                  )}
                </div>
              </motion.div>
            ) : voiceMode === null ? (
              <div className="p-4 bg-indigo-50/90 backdrop-blur-xl border-t border-indigo-100 rounded-b-3xl shrink-0 flex flex-col gap-3 text-center">
                <p className="text-sm font-bold text-indigo-900 leading-snug">
                  Hi! I'm Emo. 🤖 Would you like to talk using your voice? It makes things faster!
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVoiceChoice(true)} 
                    className="flex-1 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    Yes, Enable Voice 🎤
                  </button>
                  <button 
                    onClick={() => handleVoiceChoice(false)} 
                    className="flex-1 py-2.5 bg-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-300 shadow-sm transition-colors"
                  >
                    No, Text Only ⌨️
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-3 bg-white/60 backdrop-blur-xl border-t border-slate-200/50 rounded-b-3xl shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ask Emo anything..."
                    className={`w-full pl-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 disabled:bg-slate-50 transition-all shadow-inner ${voiceMode ? 'pr-20' : 'pr-12'}`}
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {voiceMode && (
                      <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={isLoading}
                        className={`p-2 rounded-xl transition-colors shadow-sm ${isMicActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} disabled:opacity-50`}
                        title="Dictate with voice"
                      >
                        <Mic size={16} />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                    >
                      <Send size={16} className={input.trim() && !isLoading ? 'animate-pulse' : ''} />
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Listening Animation Overlay */}
            <AnimatePresence>
              {isMicActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-20 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3 z-50"
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                  />
                  <span className="text-sm font-bold text-slate-700">Emo is listening... 👂</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
