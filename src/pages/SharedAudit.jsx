import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Sparkles, BookOpen, ExternalLink, ArrowLeft, 
  GitFork, CheckCircle, AlertCircle, Loader2, LogIn, UserPlus, 
  Share2, ShieldCheck, ChevronRight, MessageSquare, Send,
  FileSpreadsheet, FileText, Download, User, Bot, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { BASE_URL } from '../utils/api';
import { supabase } from '../supabaseClient';
import WorkspaceLayout from '../components/WorkspaceLayout';
import { VisualDispatcher } from '../components/uve/VisualDispatcher';

const cleanProps = ({ style, node, ...rest }) => {
  const validStyle = (style && typeof style === 'object' && !Array.isArray(style)) ? style : undefined;
  return validStyle ? { style: validStyle, ...rest } : rest;
};

/**
 * Message Content Renderer for Shared Audit
 * Applies exact Auditor message transformations:
 * - Extracts Relevance Map and renders Relevance Match Meter
 * - Auto-wraps raw JSON / Mermaid visual blocks into ```uve-json code fences
 * - Formats [1], [2] citation tags
 * - Custom ReactMarkdown code component to render ECharts / Mindmaps / Mermaid via VisualDispatcher
 * - Beautiful academic tables
 */
const SharedMessageContent = ({ content, activePapers, onSelectPaper }) => {
  if (!content) return null;

  let mainContent = content;
  let relevanceRaw = '';

  const relMapMatch = content.match(/(?:\[Relevance Map\]|###\s*Relevance Map|\*\*Relevance Map\*\*|Relevance Map\b[\s\S]*?(?=RELEVANCE[|:]))/i);
  if (relMapMatch) {
    const splitIdx = relMapMatch.index;
    mainContent = content.substring(0, splitIdx).trim();
    relevanceRaw = content.substring(splitIdx);
  } else if (content.includes('[Relevance Map]')) {
    const parts = content.split('[Relevance Map]');
    mainContent = parts[0].trim();
    relevanceRaw = parts[1] || '';
  }

  const relevanceEntries = (() => {
    if (!relevanceRaw) return [];
    const entries = [];
    const lines = relevanceRaw.split(/\r?\n/);
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || (!trimmed.toUpperCase().includes('RELEVANCE|') && !trimmed.toUpperCase().includes('RELEVANCE:'))) {
        continue;
      }
      const segs = trimmed.split(/\||:/).map(s => s.trim()).filter(Boolean);
      if (segs.length > 0 && segs[0].toUpperCase() === 'RELEVANCE') {
        segs.shift();
      }
      if (segs.length < 2) continue;

      let title = segs[0] || 'Research Paper';
      let rawScore = segs[1] || '0';
      let reason = segs[2] || '';

      let cleanTitle = title.replace(/^[\-\*\d\.\s]+/, '').replace(/^\[|\]$/g, '').trim();
      if (!cleanTitle || cleanTitle.toLowerCase().includes('paper title') || cleanTitle.toLowerCase() === 'percentage' || cleanTitle.toLowerCase() === 'paper') {
        continue;
      }

      let scoreNum = parseInt(rawScore.replace(/[^0-9]/g, ''), 10);
      let reasonScoreNum = parseInt(reason.replace(/[^0-9]/g, ''), 10);

      if (isNaN(scoreNum) && !isNaN(reasonScoreNum)) {
        const temp = rawScore;
        rawScore = reason;
        reason = temp;
        scoreNum = reasonScoreNum;
      }

      if (isNaN(scoreNum)) {
        scoreNum = 85;
      }

      scoreNum = Math.max(0, Math.min(100, scoreNum));

      entries.push({
        title: cleanTitle,
        score: scoreNum,
        reason: reason || 'High contextual relevance match.'
      });
    }
    return entries;
  })();

  let processedContent = mainContent
    .replace(/(^|[^\[])\[(\d+):\s*"([^"]+)"\]/g, (match, p1, p2, p3) => {
      return `${p1}[cite-${p2}-quote-${encodeURIComponent(p3)}](#cite-${p2}-quote-${encodeURIComponent(p3)})`;
    })
    .replace(/(^|[^\[])\[(\d+)\](?!\]|\()/g, '$1[cite-$2](#cite-$2)');

  // Auto-wrap ONLY unwrapped visual blocks that exist OUTSIDE existing ``` code fences
  const parts = processedContent.split(/(```[\s\S]*?```)/g);
  processedContent = parts.map((part, pIdx) => {
    if (pIdx % 2 === 1) return part;
    let text = part;
    if (!text.includes('```mermaid') && !text.includes('```uve-json') && !text.includes('```json')) {
      text = text.replace(
        /(?:^|\n)\s*(\{\s*"engine"\s*:\s*"[^"]+"[\s\S]*?\})\s*(?=\n|$)/g,
        (match, jsonBlock) => `\n\n\`\`\`uve-json\n${jsonBlock.trim()}\n\`\`\`\n\n`
      );
      text = text.replace(
        /(?:^|\n)\s*((?:graph|flowchart|sequenceDiagram|gantt|classDiagram)\s+(?:TD|LR|TB|RL)?[\s\S]*?)(?=\n\n\n|\n\s*\n\s*[A-Z#]|$)/gi,
        (match, mermaidBlock) => {
          if (mermaidBlock.includes('{"engine"')) return match;
          return `\n\n\`\`\`mermaid\n${mermaidBlock.trim()}\n\`\`\`\n\n`;
        }
      );
    }
    return text;
  }).join('');

  return (
    <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4 prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-indigo-900 prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
      <style>{`
        .prose table {
          table-layout: auto !important;
          min-width: 700px !important;
        }
      `}</style>

      <div className="overflow-x-auto w-full relative">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            a: ({ node, href, children, ...props }) => {
              if (href && href.startsWith('#cite-')) {
                const parts = href.replace('#cite-', '').split('-quote-');
                const citationNum = parts[0];
                let quote = null;
                if (parts.length > 1) {
                  try {
                    quote = decodeURIComponent(parts[1]);
                  } catch (e) {
                    quote = parts[1];
                  }
                }
                
                return (
                  <span className="inline-flex items-center gap-0.5 mx-0.5 relative -top-0.5">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs no-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        const idx = parseInt(citationNum) - 1;
                        if (onSelectPaper) onSelectPaper(idx);
                      }}
                      title={quote ? `Citation [${citationNum}]: "${quote}"` : `View paper #${citationNum}`}
                    >
                      [{citationNum}]
                    </button>
                  </span>
                );
              }
              return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
            },
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-([\w-]+)/.exec(className || '');
              const lang = match ? match[1].toLowerCase() : '';
              const rawContent = String(children).replace(/\n$/, '').trim();

              const isUveOrMermaid = !inline && (
                lang === 'mermaid' || 
                lang === 'uve-json' || 
                lang === 'json-uve' || 
                lang === 'uve' ||
                lang === 'graph' ||
                lang === 'flowchart' ||
                (lang === 'json' && (rawContent.includes('"visualization"') || rawContent.includes('"engine"') || rawContent.includes('"nodes"') || rawContent.includes('"config"'))) ||
                rawContent.includes('{"engine"') ||
                rawContent.includes('"engine": "mermaid"') ||
                rawContent.includes('"engine": "react-flow"') ||
                rawContent.includes('"engine": "echarts"') ||
                rawContent.includes('"engine": "d3"') ||
                rawContent.startsWith('graph ') ||
                rawContent.startsWith('graph\n') ||
                rawContent.startsWith('flowchart ') ||
                rawContent.startsWith('flowchart\n') ||
                rawContent.startsWith('sequenceDiagram')
              );

              if (isUveOrMermaid) {
                return (
                  <VisualDispatcher 
                    rawJson={rawContent} 
                    payload={rawContent}
                    onSourceClick={(paperIdx) => {
                      const idx = parseInt(paperIdx) - 1;
                      if (onSelectPaper) onSelectPaper(idx);
                    }} 
                  />
                );
              }
              
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            table: (props) => (
              <div className="my-6 w-full overflow-x-auto rounded-2xl border border-slate-200/80 shadow-md bg-white">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[700px]" {...cleanProps(props)} />
              </div>
            ),
            thead: (props) => <thead className="bg-slate-100/90 text-slate-800 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200" {...cleanProps(props)} />,
            th: (props) => <th className="px-4 py-3 border-b border-slate-200 text-slate-800 font-black text-[11px] tracking-wider uppercase text-left bg-slate-50" {...cleanProps(props)} />,
            td: (props) => <td className="px-4 py-3.5 border-b border-slate-200/60 text-slate-700 leading-relaxed align-middle whitespace-normal text-xs" {...cleanProps(props)} />
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {relevanceEntries.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center">
              <Sparkles size={12} className="text-indigo-600 animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relevance Match Meter</span>
          </div>
          <div className="space-y-4">
            {relevanceEntries.map((entry, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-bold text-slate-700 leading-tight line-clamp-1 flex-1 mr-3">{entry.title}</p>
                  <span className="text-xs font-black text-indigo-600 shrink-0">
                    {entry.score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${entry.score}%` }}
                    className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                  />
                </div>
                {entry.reason && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{entry.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export const SharedAudit = ({ user, onLogout }) => {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [isForking, setIsForking] = useState(false);

  useEffect(() => {
    if (shareToken) {
      fetchSharedAudit();
    }
  }, [shareToken]);

  const fetchSharedAudit = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/shared/${shareToken}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned status ${res.status}`);
      }

      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error fetching shared audit:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out while connecting to server. Please refresh or check connection.');
      } else {
        setError(err.message || 'Shared audit not accessible.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForkAudit = async () => {
    if (!user) {
      toast.info('Please log in to save this audit to your workspace.');
      navigate(`/auth?redirect=/shared/${shareToken}`);
      return;
    }

    setIsForking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/share/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ share_token: shareToken })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to fork audit');
      }

      const data = await res.json();
      const newSessId = data.new_session_id;

      if (newSessId) {
        sessionStorage.setItem('auditor_sessionId', newSessId);
        sessionStorage.setItem('auditor_messages', JSON.stringify(chat_history || []));
        sessionStorage.setItem('auditor_activePapers', JSON.stringify(papers || research_map || []));
        sessionStorage.setItem('auditor_chatInitiated', 'true');
        sessionStorage.setItem('auditor_activeWorkflow', workflow || 'research');

        const cacheKey = `auditor_cache_${newSessId}`;
        sessionStorage.setItem(cacheKey, JSON.stringify({
          sessionId: newSessId,
          activeWorkflow: workflow || 'research',
          activePapers: papers || research_map || [],
          chatInitiated: true,
          messages: chat_history || [],
          updatedAt: Date.now()
        }));
      }

      toast.success(data.message || 'Research audit saved to your workspace!');

      navigate('/auditor', {
        state: {
          reloadSession: {
            id: newSessId,
            papers: papers || research_map || [],
            chat_history: chat_history || [],
            workflow: workflow || 'research',
            title: title
          }
        }
      });
    } catch (err) {
      console.error('Fork Error:', err);
      toast.error(err.message || 'Could not save audit to workspace');
    } finally {
      setIsForking(false);
    }
  };

  const handleSelectPaper = (idx) => {
    const element = document.getElementById(`source-row-${idx}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-indigo-500');
      setTimeout(() => element.classList.remove('ring-2', 'ring-indigo-500'), 3000);
    }
  };

  if (loading) {
    return (
      <WorkspaceLayout user={user} onLogout={onLogout}>
        <div className="h-full bg-slate-50 flex flex-col items-center justify-center text-slate-700 gap-4 p-4">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Loading Shared Research Session...
          </span>
        </div>
      </WorkspaceLayout>
    );
  }

  if (error) {
    return (
      <WorkspaceLayout user={user} onLogout={onLogout}>
        <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-2xl font-black">
              <Lock size={24} />
            </div>
            <h2 className="text-lg font-black text-slate-800">Shared Session Restricted</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{error}</p>
            <div className="pt-2 flex flex-col gap-2 w-full">
              <Link
                to={`/auth?redirect=/shared/${shareToken}`}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Sign In to Access
              </Link>
              <Link
                to="/auditor"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Go to Workspace
              </Link>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  const { is_preview, title, workflow, papers, chat_history, research_map, locked_messages_count } = auditData;
  const activePapersList = papers || research_map || [];
  const messagesList = chat_history || [];

  return (
    <WorkspaceLayout user={user} onLogout={onLogout}>
      <div className="h-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
        {/* Top App Bar — ChatGPT/Claude Shared Model */}
        <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-2xs gap-4 shrink-0">
          <div className="flex items-center gap-3 truncate">
            <Link
              to="/auditor"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Back to Auditor"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-900 truncate">
                  {title || 'Shared Research Audit'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                  <Globe size={11} className="text-indigo-600" />
                  Shared View
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <button
                onClick={handleForkAudit}
                disabled={isForking}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isForking ? <Loader2 size={14} className="animate-spin" /> : <GitFork size={14} />}
                <span>Save to Workspace</span>
              </button>
            ) : (
              <Link
                to={`/auth?redirect=/shared/${shareToken}`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
              >
                <LogIn size={14} />
                <span>Sign In / Sign Up</span>
              </Link>
            )}
          </div>
        </div>

        {/* Auditor Workspace Split Pane Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* LEFT COLUMN: Main Chat Lane */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative border-r border-slate-200/80">
            <div id="shared-chat-lane" className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 pb-28 custom-scrollbar">
              {messagesList.map((msg, index) => {
                const msgKey = msg.id || `msg-${index}-${msg.role}`;
                const isUser = msg.role === 'user';

                return (
                  <div key={msgKey} className="w-full w-full 2xl:px-12 mx-auto flex flex-col gap-1.5">
                    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      {isUser ? (
                        <span className="text-[11px] font-medium text-slate-400">
                          {msg.timestamp || 'Shared Query'}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          ScholarHub Agent
                        </span>
                      )}

                      <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                        isUser
                          ? 'bg-slate-100 border-slate-200 text-slate-900 rounded-tr-none max-w-[85%] ml-auto font-medium'
                          : 'bg-white border-slate-200/80 text-slate-900 rounded-tl-none font-normal shadow-2xs w-full'
                      }`}>
                        {isUser ? (
                          <span>{msg.content}</span>
                        ) : (
                          <SharedMessageContent 
                            content={msg.content} 
                            activePapers={activePapersList} 
                            onSelectPaper={handleSelectPaper}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Inline Glassmorphic Lock Overlay (For Public Preview Mode) */}
              {is_preview && (
                <div className="w-full w-full 2xl:px-12 mx-auto my-4">
                  <div className="p-6 md:p-8 bg-slate-900/95 border border-indigo-500/30 rounded-3xl text-white text-center space-y-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto">
                      <Lock size={22} />
                    </div>

                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                        {locked_messages_count || 3} More Turns & Sources Locked
                      </h3>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed">
                        Join ScholarHub to view complete literature synthesis, interact with statistical graphs, and export references.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-3">
                      <Link
                        to={`/auth?redirect=/shared/${shareToken}`}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                      >
                        <LogIn size={14} />
                        <span>Login or Register to Continue</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Read-Only Bottom Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200/80 sticky bottom-0 z-20">
              <div className="w-full 2xl:px-12 mx-auto">
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-slate-500 text-xs font-semibold gap-3 select-none">
                  <div className="flex items-center gap-2 truncate">
                    <Lock size={15} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {user 
                        ? "Shared Audit (Read-Only Mode) — Save to your workspace to continue chatting and editing." 
                        : "Shared View — Sign in or save audit to ask follow-up questions."
                      }
                    </span>
                  </div>

                  {user ? (
                    <button
                      onClick={handleForkAudit}
                      disabled={isForking}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      {isForking ? <Loader2 size={13} className="animate-spin" /> : <GitFork size={13} />}
                      <span>Save to Workspace</span>
                    </button>
                  ) : (
                    <Link
                      to={`/auth?redirect=/shared/${shareToken}`}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sources Pane (Exact same style as Auditor right column) */}
          <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200/80 flex flex-col h-72 md:h-full shrink-0">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
                <BookOpen size={16} className="text-indigo-600" />
                <span>CITED SOURCES ({activePapersList.length})</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activePapersList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No cited papers attached to this audit.
                </div>
              ) : (
                activePapersList.map((paper, pIdx) => (
                  <div
                    key={pIdx}
                    id={`source-row-${pIdx}`}
                    className="p-3.5 bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl transition-all shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 truncate max-w-[180px]">
                        {paper.journal || 'Academic Paper'} ({paper.year || paper.pub_date?.slice(0, 4) || 'n.d.'})
                      </span>

                      {(paper.doi || paper.pmid || paper.url) && (
                        <a
                          href={paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Open paper source"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-900 transition-colors">
                      {paper.title}
                    </h4>

                    {paper.authors && (
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default SharedAudit;
