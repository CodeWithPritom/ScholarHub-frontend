import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversionWall from './ConversionWall';
import { BASE_URL } from '../../utils/api';
import { supabase } from '../../supabaseClient';

const AIMentorChat = ({ lessonTitle, lessonContent, user, profile, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your AI Research Mentor for "${lessonTitle || 'this lesson'}". Ask me anything about methodology, thesis structure, or how to apply this lesson to your work!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I am your AI Research Mentor for "${lessonTitle || 'this lesson'}". Ask me anything about methodology, thesis structure, or how to apply this lesson to your work!`
      }
    ]);
  }, [lessonTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const userTier = (profile?.user_tier || user?.user_tier || 'free').toLowerCase();
  const role = (profile?.role || user?.role || 'user').toLowerCase();
  const email = (user?.email || '').toLowerCase();
  const isPro = user && (userTier === 'pro' || role === 'admin' || email === 'arupbhowmikpritom@gmail.com');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !isPro) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/intelligence/academy/ai-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          lesson_title: lessonTitle || 'Lesson',
          lesson_content: lessonContent || '',
          user_question: userMsg,
          chat_history: newHistory.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Thank you for your question.' }]);
      } else {
        const errData = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: errData.detail || 'Apologies, I could not generate a response. Please verify your Pro subscription.' }]);
      }
    } catch (err) {
      console.error('[AIMentorChat] Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection timeout. Please try asking again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 flex h-[520px] w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
              <Bot size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-tight text-slate-900">AI Research Mentor</h4>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Pro Feature • 10 Zaps/session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Area */}
        {!isPro ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 bg-slate-50">
            <ConversionWall
              type="upgrade"
              headline="AI Mentorship is a Pro Feature"
              description="AI Mentorship is a Pro feature. Upgrade to Pro to get guided 1-on-1 research assistance and thesis analysis (10 Zaps/session)."
              ctaText="Upgrade to Pro Plan"
              ctaLink="/pricing"
            />
          </div>
        ) : (
          <>
            {/* Messages Chat Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50 scrollbar-thin">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white mt-0.5">
                      <Bot size={13} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 font-normal leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none shadow-2xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                  <Loader2 size={14} className="animate-spin text-slate-600" />
                  <span>AI Mentor is crafting response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI Mentor about this lesson..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AIMentorChat;
