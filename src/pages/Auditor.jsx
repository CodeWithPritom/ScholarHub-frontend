import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, ChevronDown, Check,
  BookOpen, FileUp, X, ExternalLink, RefreshCw, ChevronRight,
  Copy, Download, Layout, ZoomIn, ZoomOut, FileSpreadsheet, FolderPlus, Loader2, CheckCircle, Quote, Share2,
  Paperclip, Folder, AlertCircle, Lock, Mic, Sparkles, Pencil, FileText, ThumbsUp, ThumbsDown, Image as ImageIcon, Clock,
  Calculator, ShieldCheck, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';
import { BASE_URL, notifyCreditsUpdated } from '../utils/api';
import { getOrCreateDeviceId } from '../utils/deviceSync';
import { getQuotaResetInfo } from '../utils/quotaUtils';
import WorkspaceLayout from '../components/WorkspaceLayout';
import SEOHead from '../components/SEOHead';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType } from 'docx';
import { VisualDispatcher } from '../components/uve/VisualDispatcher';
import { MermaidDiagram } from '../components/MermaidDiagram';
import ChatInput from '../components/ChatInput';
import { ShareModal } from '../components/ShareModal';
import { StatsAdvisorModal } from '../components/tools/StatsAdvisorModal';
import { AIDisclosureModal } from '../components/tools/AIDisclosureModal';
import { ScientificPitchModal } from '../components/tools/ScientificPitchModal';
import { 
  downloadFile, 
  generateBibTeX, 
  generateRIS, 
  generateAPABibliographyText, 
  generateExcelCSV, 
  generateStructuredJSON 
} from '../utils/citationUtils';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#f8fafc',
    primaryBorderColor: '#e2e8f0',
    primaryTextColor: '#0f172a',
    lineColor: '#0f172a',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#e2e8f0',
    fontFamily: 'Inter, sans-serif'
  }
});

const MemoizedVisualDispatcher = React.memo(({ payload, sessionKey, onSourceClick }) => {
  return (
    <div className="min-h-[280px] sm:min-h-[360px] md:min-h-[420px] w-full not-prose my-3 sm:my-4 rounded-2xl flex items-center justify-center overflow-hidden">
      <VisualDispatcher key={sessionKey} payload={payload} onSourceClick={onSourceClick} />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.sessionKey === nextProps.sessionKey && 
         JSON.stringify(prevProps.payload) === JSON.stringify(nextProps.payload);
});

const getFormattedTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const FollowUpSection = ({ suggestions = [], onSelect }) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;
  return (
    <div className="w-full w-full 2xl:px-12 mx-auto mt-6 pt-6 border-t border-slate-200/80 animate-fadeIn">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span>✨</span> Follow-up Questions
      </h3>
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="w-full text-left px-4 py-3.5 hover:bg-slate-50 text-sm font-bold text-slate-700 hover:text-slate-900 transition-all flex items-center justify-between group cursor-pointer"
          >
            <span>{suggestion}</span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

const defaultMockPapers = [
  {
    pmid: "1",
    title: "Computer Vision and Image Processing: A Paper Review",
    journal: "International Journal for Research in Applied Science and Engineering Technology",
    journal_quartile: "Q1",
    citationCount: 260,
    abstract: "Computer vision has been studied from many perspectives. It expands from raw data recording techniques and ideas combining digital image processing, pattern recognition, machine learning and computer graphics. The wide usage has attracted many scholars to integrate with many disciplines and fields. This paper provides a survey of the recent technologies and theoretical concepts explaining the development of computer vision especially related to image processing using different areas of their field application. It used method of multi-range images and video to obtain necessary information, and another calls segmentation \"a critical step in image processing, computer vision, and pattern recognition.\""
  },
  {
    pmid: "2",
    title: "Computer Vision and Image Segmentation",
    journal: "International Journal for Research in Applied Science and Engineering Technology",
    journal_quartile: "Q1",
    citationCount: 2,
    abstract: "Abstract: Image segmentation is a critical step in image processing, computer vision, and pattern recognition, which involves dividing an image into different regions or segments. Image segmentation plays an essential role in many applications, such as object recognition, medical image analysis, autonomous driving, and robotics. This paper aims to provide an overview of image segmentation techniques, including traditional and deep learning-based approaches. The paper also discusses the challenges associated with image segmentation, such as noise, illumination variations, and occlusions. Finally, the paper provides a brief discussion on the evaluation metrics used to assess the performance of image segmentation algorithms."
  },
  {
    pmid: "3",
    title: "Digital signal processing techniques for image enhancement and restoration",
    journal: "Applied and Computational Engineering",
    journal_quartile: "Q1",
    citationCount: 4,
    abstract: "Digital image processing has become a fundamental tool in modern image processing, including image enhancement and restoration. This paper reviews important image enhancement and restoration techniques such as histogram equalization and application scenarios. Secondly, for image deconvolution and blind deconvolution techniques, this paper introduces deblurring techniques such as Richardson-Lucy deconvolution and blind deconvolution, and explores their possible future development directions."
  }
];

const mockAISummaries = {
  "1": "Reviews core preprocessing and extraction paradigms in computer vision, verifying segmentations.",
  "2": "Outlines deep learning vs traditional segmentation challenges (noise, illumination, occlusion).",
  "3": "Explains Richardson-Lucy deconvolution and histogram equalization for digital restoration."
};

const getPaperSummary = (paper) => {
  if (!paper) return '';
  if (mockAISummaries && paper.pmid && mockAISummaries[paper.pmid]) {
    return mockAISummaries[paper.pmid];
  }
  const raw = paper.abstract || paper.summary || paper.snippet || paper.description || paper.details || paper.full_metadata?.abstract || paper.full_metadata?.summary || paper.full_metadata?.snippet || paper.full_metadata?.description || '';
  if (raw && typeof raw === 'string' && raw.trim()) {
    const clean = raw.replace(/^Abstract:\s*/i, '').trim();
    return clean.length > 250 ? clean.slice(0, 250) + '...' : clean;
  }
  return 'Abstract preview not available for this indexed source.';
};

const cleanProps = ({ style, node, ...rest }) => {
  const validStyle = (style && typeof style === 'object' && !Array.isArray(style)) ? style : undefined;
  return validStyle ? { style: validStyle, ...rest } : rest;
};

const MessageEditBox = React.memo(({ initialText, onCancel, onSave }) => {
  const [text, setText] = useState(initialText);
  return (
    <div className="w-full flex flex-col gap-2 min-w-0 max-w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 font-sans shadow-xs text-slate-800 resize-none break-words whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] min-w-0"
        rows={3}
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const trimmed = text.trim();
            if (trimmed) onSave(trimmed);
          }}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          Save & Submit
        </button>
      </div>
    </div>
  );
});

/**
 * AuditorChatMessage — Highly optimized memoized message item
 * Prevents re-parsing Markdown, regexes, and subcomponents for past messages during streaming.
 */
const AuditorChatMessage = React.memo(({
  msg,
  originalIndex,
  isAnalyzing,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  activePapers,
  onCitationClick,
  onRelevanceClick,
  onRatingFeedback,
  onDownloadMarkdown,
  onExportExcel,
  showRightPane,
  onToggleRightPane
}) => {
  const currentText = msg.content || '';

  // 1. Extract relevance entries line-by-line safely
  const relevanceEntries = useMemo(() => {
    const entries = [];
    const lines = currentText.split(/\r?\n/);
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || (!trimmed.toUpperCase().includes('RELEVANCE:::') && !trimmed.toUpperCase().includes('RELEVANCE|') && !trimmed.toUpperCase().includes('RELEVANCE:'))) {
        continue;
      }
      const segs = trimmed.split(/:::|\||:/).map(s => s.trim()).filter(Boolean);
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

      let paperNumMatch = title.match(/\[?(?:Paper\s*)?(\d+)\]?/i) || title.match(/^(\d+)[\.\:\-\s]/);
      let paperIdx = -1;
      if (paperNumMatch) {
        const parsedNum = parseInt(paperNumMatch[1], 10);
        if (parsedNum > 0 && parsedNum <= (activePapers?.length || 0)) {
          paperIdx = parsedNum - 1;
        }
      }
      if (paperIdx === -1 && entries.length < (activePapers?.length || 0)) {
        paperIdx = entries.length;
      }

      const matchedPaper = (paperIdx >= 0 && activePapers) ? activePapers[paperIdx] : null;
      const displayTitle = matchedPaper?.title || cleanTitle;
      const displayQuartile = matchedPaper?.journal_quartile || matchedPaper?.quartile;
      const displayPaperNumber = paperIdx >= 0 ? (paperIdx + 1) : (entries.length + 1);

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
        paperIdx,
        paperNumber: displayPaperNumber,
        title: displayTitle,
        quartile: displayQuartile,
        paper: matchedPaper,
        score: scoreNum,
        reason: reason || 'High contextual relevance match.'
      });
    }
    return entries;
  }, [currentText, activePapers]);

  // 2. Clean mainContent: Strip explicit structured [Relevance Map] headers and raw RELEVANCE lines
  const processedContent = useMemo(() => {
    let mainContent = currentText
      .replace(/(?:^|\n)\s*(?:\[Relevance Map\]|###\s*Relevance Map|\*\*Relevance Map\*\*)[\s\S]*?(?=(?:---SUGGESTIONS---|```uve-json|```mermaid|$))/gi, '')
      .replace(/(?:^|\n)\s*RELEVANCE[^\n]*/gi, '')
      .trim();

    let text = mainContent
      .replace(/(^|[^\[])\[(\d+):\s*"([^"]+)"\]/g, (match, p1, p2, p3) => {
        return `${p1}[cite-${p2}-quote-${encodeURIComponent(p3)}](#cite-${p2}-quote-${encodeURIComponent(p3)})`;
      })
      .replace(/(^|[^\[])\[(\d+)\](?!\]|\()/g, '$1[cite-$2](#cite-$2)');

    // Auto-wrap visual blocks that exist outside existing code fences
    const parts = text.split(/(```[\s\S]*?```)/g);
    let result = parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) return part;
      let p = part;
      if (!p.includes('```mermaid') && !p.includes('```uve-json') && !p.includes('```json')) {
        p = p.replace(
          /(?:^|\n)\s*(\{\s*"engine"\s*:\s*"[^"]+"[\s\S]*?\})\s*(?=\n|$)/g,
          (match, jsonBlock) => `\n\n\`\`\`uve-json\n${jsonBlock.trim()}\n\`\`\`\n\n`
        );
        p = p.replace(
          /(?:^|\n)\s*((?:graph|flowchart|sequenceDiagram|gantt|classDiagram)\s+(?:TD|LR|TB|RL)?[\s\S]*?)(?=\n\n\n|\n\s*\n\s*[A-Z#]|$)/gi,
          (match, mermaidBlock) => {
            if (mermaidBlock.includes('{"engine"')) return match;
            return `\n\n\`\`\`mermaid\n${mermaidBlock.trim()}\n\`\`\`\n\n`;
          }
        );
      }
      return p;
    }).join('');

    // 3. Normalize LaTeX math delimiters & protect table cell pipes inside math
    // Step A: Protect internal pipes in table math segments
    const lines = result.split(/\r?\n/);
    const mathNormalizedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.includes('|', 1)) {
        // Protect pipes inside \( ... \), \[ ... \], $$ ... $$, or $ ... $
        return line.replace(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g, (mathBlock) => {
          return mathBlock.replace(/\|/g, '\\vert ');
        });
      }
      return line;
    });

    let mathText = mathNormalizedLines.join('\n');

    // Step B: Convert LaTeX block math \[ ... \] to $$ ... $$
    mathText = mathText.replace(/\\\[([\s\S]*?)\\\]/g, (match, eq) => `\n\n$$\n${eq.trim()}\n$$\n\n`);

    // Step C: Convert LaTeX inline math \( ... \) to $ ... $
    mathText = mathText.replace(/\\\(([\s\S]*?)\\\)/g, (match, eq) => `$${eq.trim()}$`);

    return mathText;
  }, [currentText]);

  return (
    <div className="w-full w-full 2xl:px-12 mx-auto flex flex-col gap-1.5">
      <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
        {msg.role === 'user' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400/80 tracking-normal font-sans">
              {msg.timestamp || getFormattedTimestamp()}
            </span>
            {!isAnalyzing && !isEditing && (
              <button
                type="button"
                onClick={onStartEdit}
                title="Edit prompt & resubmit"
                className="p-1 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Pencil size={11} />
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Research Agent
          </span>
        )}

        <div className={`p-4 rounded-2xl text-sm leading-relaxed border min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word] ${msg.role === 'user'
          ? 'bg-slate-50 border-slate-200/60 text-slate-800 rounded-tr-none max-w-[85%] ml-auto'
          : 'bg-white border-slate-200/60 text-slate-855 rounded-tl-none font-normal shadow-xs w-full'
        }`}>
          {msg.role === 'user' && isEditing ? (
            <MessageEditBox
              initialText={msg.content}
              onCancel={onCancelEdit}
              onSave={onSaveEdit}
            />
          ) : (
            <div className={`prose prose-slate max-w-none text-sm leading-relaxed space-y-4 prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-indigo-900 prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word] ${msg.role === 'user' ? 'text-slate-800' : 'text-slate-700'}`}>
              <style>{`
                .prose table {
                  table-layout: auto !important;
                  min-width: 800px !important;
                }
              `}</style>

              {/* AI Reasoning Console (Streaming CoT) */}
              {msg.rawThoughts && (
                <details 
                  className="mb-4 group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm" 
                  open={msg.isStreaming}
                >
                  <summary className="px-4 py-3 cursor-pointer select-none font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border-b border-transparent group-open:border-slate-200 flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-2">
                      {msg.isStreaming ? (
                        <span className="flex items-center justify-center w-4 h-4">
                          <Loader2 size={12} className="text-emerald-500 animate-spin" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-4 h-4">
                          <CheckCircle size={12} className="text-slate-400" />
                        </span>
                      )}
                      ⚡ AI Reasoning
                    </span>
                    <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 text-[11px] font-mono text-slate-500 bg-slate-50/50 whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed border-t border-slate-100">
                    {msg.rawThoughts}
                  </div>
                </details>
              )}

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
                              className="inline-flex items-center justify-center px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs no-underline"
                              onMouseEnter={() => {
                                const el = document.getElementById(`source-row-${parseInt(citationNum) - 1}`);
                                if (el) el.classList.add('bg-indigo-50/70', 'shadow-[inset_4px_0_0_0_#6366f1]');
                              }}
                              onMouseLeave={() => {
                                const el = document.getElementById(`source-row-${parseInt(citationNum) - 1}`);
                                if (el) el.classList.remove('bg-indigo-50/70', 'shadow-[inset_4px_0_0_0_#6366f1]');
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                onCitationClick(citationNum, quote);
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
                    p: ({ node, children, ...props }) => {
                      const hasBlock = React.Children.toArray(children).some(
                        child => React.isValidElement(child) && (child.type === 'div' || child.type === 'section' || typeof child.type === 'object' || typeof child.type === 'function')
                      );
                      if (hasBlock) {
                        return <div className="my-2 leading-relaxed" {...props}>{children}</div>;
                      }
                      return <p className="my-2 leading-relaxed" {...props}>{children}</p>;
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
                              onCitationClick(paperIdx);
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
                    td: (props) => {
                      const renderCellWithBreaks = (children) => {
                        if (!children) return children;
                        if (typeof children === 'string' && /<br\s*\/?>/i.test(children)) {
                          const parts = children.split(/<br\s*\/?>/gi);
                          return parts.map((part, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br className="my-0.5" />}
                              {part}
                            </React.Fragment>
                          ));
                        }
                        if (Array.isArray(children)) {
                          return children.map((child, i) => {
                            if (typeof child === 'string' && /<br\s*\/?>/i.test(child)) {
                              const parts = child.split(/<br\s*\/?>/gi);
                              return (
                                <React.Fragment key={i}>
                                  {parts.map((part, pIdx) => (
                                    <React.Fragment key={pIdx}>
                                      {pIdx > 0 && <br className="my-0.5" />}
                                      {part}
                                    </React.Fragment>
                                  ))}
                                </React.Fragment>
                              );
                            }
                            return child;
                          });
                        }
                        return children;
                      };
                      return (
                        <td className="px-4 py-3.5 border-b border-slate-200/60 text-slate-700 leading-relaxed align-middle whitespace-normal text-xs" {...cleanProps(props)}>
                          {renderCellWithBreaks(props.children)}
                        </td>
                      );
                    }
                  }}
                >
                  {processedContent}
                </ReactMarkdown>
                {msg.isStreaming && (
                  <span className="inline-block w-2.5 h-4 ml-1 bg-indigo-600 animate-pulse rounded-xs align-middle" />
                )}
              </div>

              {relevanceEntries.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100/85">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center">
                      <Sparkles size={12} className="text-indigo-600 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relevance Match Meter</span>
                  </div>
                  <div className="space-y-2.5">
                    {relevanceEntries.map((entry, idx) => (
                      <div 
                        key={entry.paperIdx >= 0 ? `rel-entry-${entry.paperIdx}` : `rel-entry-${idx}`}
                        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/80 hover:border-slate-200/80 cursor-pointer group bg-white shadow-2xs"
                        onClick={() => onRelevanceClick(entry)}
                      >
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-black shrink-0">
                              [{entry.paperNumber}]
                            </span>
                            {entry.quartile && (
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-black shrink-0 font-sans">
                                {entry.quartile}
                              </span>
                            )}
                            <p className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-indigo-600 transition-colors">
                              {entry.title}
                            </p>
                          </div>
                          <span className="text-xs font-black text-indigo-600 shrink-0 font-mono">
                            {entry.score}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${entry.score}%` }}
                            className={`h-full rounded-full transition-all duration-1000 ${
                              entry.score >= 70 ? 'bg-indigo-500' : entry.score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        {entry.reason && (
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">{entry.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Response Utility Hub */}
          {msg.role === 'assistant' && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-100/60 text-slate-500">
              {msg.thinkingTime && (
                <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md mr-auto flex items-center gap-1.5 border border-slate-200 shadow-sm font-mono">
                  <AlertCircle size={12} />
                  Analyzed in {msg.thinkingTime.toFixed(1)}s
                </div>
              )}

              {/* Relevance Rating Controls */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 ml-1">
                <button
                  type="button"
                  onClick={() => onRatingFeedback(5)}
                  className="p-1 hover:text-green-600 transition-colors cursor-pointer"
                  title="Rate Relevant (5 Stars)"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onRatingFeedback(1)}
                  className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                  title="Rate Irrelevant (1 Star)"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(msg.content);
                  toast.success('Response copied to clipboard!');
                }}
                title="Copy response to clipboard"
                className="flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0"
              >
                <Copy size={16} className="text-slate-500 shrink-0" />
                <span className="hidden md:inline">Copy</span>
              </button>
              <button
                onClick={() => {
                  onDownloadMarkdown(msg.content, `audit-response-${originalIndex + 1}.md`);
                }}
                title="Download response as Markdown file"
                className="flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0"
              >
                <Download size={16} className="text-slate-500 shrink-0" />
                <span className="hidden md:inline">Download</span>
              </button>
              <button
                onClick={onToggleRightPane}
                title={showRightPane ? 'Hide Sources Panel' : 'Show Sources Panel'}
                className="flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0"
              >
                <Layout size={16} className="text-slate-500 shrink-0" />
                <span className="hidden md:inline">{showRightPane ? 'Hide Sources' : 'Show Sources'}</span>
              </button>
              {msg.content.includes('|') && msg.content.includes('---') && (
                <button
                  onClick={() => onExportExcel(msg.content)}
                  title="Export Markdown Table to Excel"
                  className="flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 hover:border-emerald-300 text-emerald-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0"
                >
                  <FileSpreadsheet size={16} className="shrink-0 text-emerald-600" />
                  <span className="hidden md:inline">Export Excel</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.msg.content === nextProps.msg.content &&
    prevProps.msg.isStreaming === nextProps.msg.isStreaming &&
    prevProps.msg.rawThoughts === nextProps.msg.rawThoughts &&
    prevProps.msg.thinkingTime === nextProps.msg.thinkingTime &&
    prevProps.isAnalyzing === nextProps.isAnalyzing &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.showRightPane === nextProps.showRightPane &&
    prevProps.activePapers?.length === nextProps.activePapers?.length
  );
});

const Auditor = ({ user, profile: propProfile, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(propProfile || null);

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
    } else if (user?.id) {
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data) setProfile(data);
      });
    }
  }, [propProfile, user]);

  const userTier = (profile?.tier || profile?.user_tier || 'free').toLowerCase();
  const maxComputeAccess = useMemo(() => {
    if (userTier === 'pro' || userTier === 'lifetime') return 'deep';
    if (userTier === 'starter') return 'advanced';
    return 'standard';
  }, [userTier]);

  // All state hooks
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('auditor_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [];
  });
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('auditor_sessionId') || null);
  const [query, setQuery] = useState('');
  const [highlightedSourceRow, setHighlightedSourceRow] = useState(null);
  const [activeWorkflow, setActiveWorkflow] = useState(() => sessionStorage.getItem('auditor_activeWorkflow') || 'research');
  const [researchEffort, setResearchEffort] = useState('standard');
  const [activePapers, setActivePapers] = useState(() => {
    const saved = sessionStorage.getItem('auditor_activePapers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [];
  });

  // PDF Attachments State & Active Session Attachment
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [activeAttachment, setActiveAttachment] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMeta, setUploadMeta] = useState(null);

  const handleRemoveAttachment = async () => {
    if (!activeAttachment) return;
    const attId = activeAttachment.id;
    const attName = activeAttachment.name || activeAttachment.file_name;
    setActiveAttachment(null);
    setActivePapers(prev => prev.filter(p => p.id !== attId && !p.title?.includes(attName)));
    toast.success('Attachment removed');

    try {
      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
      if (attId) {
        await fetch(`${BASE_URL}/api/attachments/${attId}`, {
          method: 'DELETE',
          headers: sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
        });
      }
    } catch (err) {
      console.error('Error removing attachment:', err);
    }
  };

  // Phase 12 Research Gallery Lightbox State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryFigures, setGalleryFigures] = useState([]);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState('');

  const openResearchGallery = async (attachmentId, fileName) => {
    try {
      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
      const deviceId = getOrCreateDeviceId();
      const headers = {};
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
      if (deviceId) headers['X-Device-ID'] = deviceId;

      const res = await fetch(`${BASE_URL}/api/attachments/${attachmentId}/gallery`, { headers });
      if (res.ok) {
        const data = await res.json();
        setGalleryFigures(data.figures || []);
        setActiveGalleryTitle(fileName);
        setGalleryOpen(true);
      }
    } catch (err) {
      console.error('Failed to open gallery:', err);
    }
  };

  // Phase 14 Manuscript Export & Feedback Helpers

  const handleExportManuscript = async (msgContent) => {
    try {
      const res = await fetch(`${BASE_URL}/api/export/manuscript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: query || 'Academic Research Synthesis',
          grounded_answer: msgContent,
          cognitive_metadata: { intent: activeWorkflow, effort_level: researchEffort }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.manuscript], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.file_name || 'Manuscript_Export.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Manuscript Exported Successfully!');
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export manuscript');
    }
  };

  const handleRatingFeedback = async (ratingVal) => {
    try {
      await fetch(`${BASE_URL}/api/feedback/relevance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query || 'Audit Search', rating: ratingVal })
      });
      toast.success(`Thank you! Rated ${ratingVal}/5 stars.`);
    } catch (err) {
      console.error(err);
    }
  };



  const handlePdfFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setUploadProgress(20);

    try {
      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
      const deviceId = getOrCreateDeviceId();

      const formData = new FormData();
      formData.append('file', file);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      setUploadProgress(50);

      const headers = {};
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
      if (deviceId) headers['X-Device-ID'] = deviceId;

      const res = await fetch(`${BASE_URL}/api/attachments/upload-file`, {
        method: 'POST',
        headers,
        body: formData
      });

      setUploadProgress(90);

      if (!res.ok) {
        throw new Error('Failed to upload and parse PDF');
      }

      const data = await res.json();
      setUploadProgress(100);
      toast.success(data.message || `Uploaded ${file.name}`);

      setAttachedFiles(prev => [
        ...prev.filter(f => f.name !== file.name),
        {
          id: data.attachment_id,
          name: file.name,
          pages: data.pages_parsed,
          chunks: data.chunks_indexed,
          status: data.vector_status
        }
      ]);
    } catch (err) {
      console.error('PDF Upload Error:', err);
      toast.error('Failed to parse and vectorize PDF');
    } finally {
      setTimeout(() => setUploadingPdf(false), 400);
      e.target.value = '';
    }
  };
  const [editingMsgIndex, setEditingMsgIndex] = useState(null);

  const handleStopGeneration = () => {
    if (activeRequestController.current) {
      try {
        activeRequestController.current.abort();
      } catch (e) {}
      activeRequestController.current = null;
    }
    isRequestInFlight.current = false;
    isRequesting.current = false;
    setIsAnalyzing(false);
    setSearchStatus('');
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
    }
    setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
    toast.info('AI generation stopped by user. No additional tokens deducted.');
  };
  const [chatInitiated, setChatInitiated] = useState(() => sessionStorage.getItem('auditor_chatInitiated') === 'true');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [activeStep, setActiveStep] = useState('Initializing Deep Reasoning...');
  const thinkingIntervalRef = useRef(null);
  const thinkingTimeRef = useRef(0);
  const isRequesting = useRef(false);
  const isRequestInFlight = useRef(false);
  const activeRequestController = useRef(null);
  const [showRightPane, setShowRightPane] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [libraryPapers, setLibraryPapers] = useState([]);
  const [selectedLibraryPmids, setSelectedLibraryPmids] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('all');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [selectedDetailPaper, setSelectedDetailPaper] = useState(null);
  const [showLibrarySaveModal, setShowLibrarySaveModal] = useState(false);
  const [selectedSaveAlbumId, setSelectedSaveAlbumId] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [cognitiveInfo, setCognitiveInfo] = useState(null);
  const [cognitiveStep, setCognitiveStep] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineOriginalQuery, setRefineOriginalQuery] = useState('');
  const [refineDirections, setRefineDirections] = useState([]);
  const [isRefiningLoading, setIsRefiningLoading] = useState(false);
  const [showDynamicSuggestions, setShowDynamicSuggestions] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [latentConnection, setLatentConnection] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSourcesExportMenu, setShowSourcesExportMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEffortMenu, setShowEffortMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [exportCount, setExportCount] = useState(0);
  const [latestHistorySession, setLatestHistorySession] = useState(null);
  const [showWorkspaceLimitModal, setShowWorkspaceLimitModal] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isDisclosureModalOpen, setIsDisclosureModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  // Refs & Scroll Intent
  const recognitionRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const effortMenuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // If pending analysis flag is left stale in sessionStorage on mount, clear it cleanly
    const isPending = sessionStorage.getItem('is_pending_analysis') === 'true';
    if (isPending && messages.length === 0) {
      sessionStorage.removeItem('is_pending_analysis');
      sessionStorage.removeItem('pending_query');
    }
  }, [messages.length]);

  const baseQueryBeforeSpeechRef = useRef('');

  const toggleVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      toast.info('Voice dictation paused. You can edit your text or click Send.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      // Capture existing query so spoken words append seamlessly
      baseQueryBeforeSpeechRef.current = query ? query.trim() + ' ' : '';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('🎙️ Listening... Speak your research question!');
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          toast.error('Microphone permission was denied. Please allow microphone access in your browser.');
        } else if (event.error === 'network') {
          toast.error('Network connectivity issue during voice dictation.');
        } else if (event.error !== 'no-speech') {
          toast.error(`Voice dictation notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }
        }

        const spokenContent = (finalText + interimText).trim();
        if (spokenContent) {
          setQuery(baseQueryBeforeSpeechRef.current + spokenContent);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      toast.error('Could not activate microphone. Please check browser permissions.');
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false);
      }
      if (effortMenuRef.current && !effortMenuRef.current.contains(event.target)) {
        setShowEffortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('academic_field, academic_status, max_compute_access, user_tier, export_count')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          setProfile(data);
          setExportCount(data.export_count || 0);
        }
      } catch (err) {
        console.error('Error fetching profile in Auditor:', err);
      }
    };
    fetchProfile();
  }, [user]);

  const checkExportLimit = async () => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('export_count, user_tier, last_reset_date, plan_expiry_date')
        .eq('id', user.id)
        .maybeSingle();
      if (error || !data) throw error || new Error("Failed to fetch profile");
      
      const currentCount = data.export_count || 0;
      const tier = (data.user_tier || 'free').toLowerCase();
      const limit = tier === 'pro' ? 100 : tier === 'starter' ? 50 : 10;
      
      if (currentCount >= limit) {
        // Calculate refresh days remaining (Unified 7-day rolling cycle)
        const quotaInfo = getQuotaResetInfo(data.last_reset_date, user?.created_at);
        const waitText = quotaInfo.label.toLowerCase();
        toast.error(`Export limit reached (${currentCount}/${limit}). Your quota will automatically refresh ${waitText}, or upgrade your plan for instant access.`);
        return false;
      }
      
      const newCount = currentCount + 1;
      const { error: patchError } = await supabase
        .from('profiles')
        .update({ export_count: newCount })
        .eq('id', user.id);
      if (patchError) throw patchError;
      
      setExportCount(newCount);
      return true;
    } catch (err) {
      console.error("Export limit check error:", err);
      toast.error("Failed to verify export limits.");
      return false;
    }
  };

  const generateManuscriptDOM = async () => {
    const documentTitle = messages.find(m => m.role === 'user')?.content || latestHistorySession?.title || query || 'ScholarHub Academic Research Synthesis';
    
    const container = document.createElement('div');
    container.id = 'export-manuscript-container';
    container.style.fontFamily = 'Georgia, serif';

    container.style.color = 'black';

    container.style.padding = '50px';

    container.style.width = '800px';

    container.style.lineHeight = '1.7';

    container.style.backgroundColor = '#ffffff';

    // Global CSS override satisfying html2canvas (forcing light theme, page-break guards, and removing oklch variable parsing errors)
    const styleOverride = document.createElement('style');
    styleOverride.textContent = `
      #export-manuscript-container, #export-manuscript-container * {
        color-scheme: light !important;
        --oklch-colors: none !important;
        color: black !important;
        background-color: #ffffff !important;
        border-color: #cbd5e1 !important;
      }
      #export-manuscript-container table,
      #export-manuscript-container img,
      #export-manuscript-container h1,
      #export-manuscript-container h2,
      #export-manuscript-container .export-section,
      #export-manuscript-container li {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #export-manuscript-container table {
        background-color: #ffffff !important;
        border-collapse: collapse !important;
        width: 100% !important;
        margin: 15px 0 !important;
      }
      #export-manuscript-container th {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
        border: 1px solid #94a3b8 !important;
        padding: 8px 12px !important;
        font-weight: bold !important;
        text-align: left !important;
        font-size: 10pt !important;
      }
      #export-manuscript-container td {
        background-color: #ffffff !important;
        color: #1e293b !important;
        border: 1px solid #cbd5e1 !important;
        padding: 8px 12px !important;
        font-size: 10pt !important;
      }
      #export-manuscript-container tr:nth-child(even) td {
        background-color: #f8fafc !important;
      }
      #export-manuscript-container sup {
        font-size: 8pt !important;
        color: #312e81 !important;
        font-weight: bold !important;
      }
    `;
    container.appendChild(styleOverride);

    // Document Header
    const titleEl = document.createElement('h1');
    titleEl.innerText = documentTitle.startsWith('Research Report:') ? documentTitle : `Research Report: ${documentTitle}`;
    titleEl.style.fontSize = '22pt';

    titleEl.style.textAlign = 'center';

    titleEl.style.marginBottom = '8px';

    titleEl.style.fontWeight = 'bold';

    titleEl.style.color = '#0f172a';
    container.appendChild(titleEl);

    // Metadata Sub-Header
    const metaEl = document.createElement('div');
    metaEl.style.textAlign = 'center';

    metaEl.style.fontSize = '10pt';

    metaEl.style.color = '#475569';

    metaEl.style.marginBottom = '25px';

    metaEl.style.borderBottom = '2px solid #cbd5e1';

    metaEl.style.paddingBottom = '12px';
    
    const authorName = user?.email || 'ScholarHub Researcher';
    const currentDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    metaEl.innerHTML = `<strong>Author:</strong> ${authorName} &nbsp;|&nbsp; <strong>Date:</strong> ${currentDate} &nbsp;|&nbsp; <strong>Sources:</strong> ${activePapers.length} Papers`;
    container.appendChild(metaEl);

    // Table of Contents (TOC)
    const tocBox = document.createElement('div');
    tocBox.className = 'export-section';
    tocBox.style.border = '1px solid #e2e8f0';

    tocBox.style.backgroundColor = '#f8fafc';

    tocBox.style.padding = '15px 20px';

    tocBox.style.borderRadius = '8px';

    tocBox.style.marginBottom = '30px';

    tocBox.style.fontSize = '10pt';
    
    tocBox.innerHTML = `
      <div style="font-weight: bold; font-size: 11pt; margin-bottom: 8px; text-transform: uppercase; tracking-wider: 1px; color: #1e293b;">Table of Contents</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>I. Visual Analysis & Flow Diagrams</span><span style="color: #64748b;">Page 1</span></div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>II. Evidence Table (Comparison Matrix)</span><span style="color: #64748b;">Page 1</span></div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>III. Synthesis Narrative</span><span style="color: #64748b;">Page 2</span></div>
      <div style="display: flex; justify-content: space-between;"><span>IV. Academic References</span><span style="color: #64748b;">Page 3</span></div>
    `;
    container.appendChild(tocBox);

    // Query assistant chat bubbles from chat lane
    const assistantBubbles = document.querySelectorAll('#auditor-chat-lane .prose');
    const lastBubble = assistantBubbles[assistantBubbles.length - 1];

    if (!lastBubble) {
      toast.error('No audit content found to export. Please start an audit first.');
      return null;
    }

    // Task 2: Visual Artifact Capture (Canvas / ECharts / ReactFlow / Mermaid SVG to Static PNG)
    try {
      const visualContainers = lastBubble.querySelectorAll('.not-prose');
      let chartCount = 0;

      for (const vizBox of visualContainers) {
        chartCount++;
        const canvasEl = vizBox.querySelector('canvas');
        const svgEl = vizBox.querySelector('svg');

        if (canvasEl) {
          try {
            const chartDataUrl = canvasEl.toDataURL('image/png');
            const imgEl = document.createElement('img');
            imgEl.src = chartDataUrl;
            imgEl.style.width = '100%';

            imgEl.style.maxWidth = '600px';

            imgEl.style.display = 'block';

            imgEl.style.margin = '15px auto';

            imgEl.style.borderRadius = '8px';

            imgEl.style.border = '1px solid #e2e8f0';

            const sectionHead = document.createElement('h2');
            sectionHead.innerText = `I.${chartCount} Visual Analysis Chart`;
            sectionHead.style.fontSize = '13pt';

            sectionHead.style.marginTop = '20px';

            sectionHead.style.marginBottom = '10px';

            sectionHead.style.borderBottom = '1px solid #cbd5e1';

            sectionHead.style.fontWeight = 'bold';
            
            const chartBlock = document.createElement('div');
            chartBlock.className = 'export-section';
            chartBlock.appendChild(sectionHead);
            chartBlock.appendChild(imgEl);
            container.appendChild(chartBlock);
          } catch (cErr) {
            console.warn('Skipped canvas capture:', cErr);
          }
        } else if (svgEl) {
          try {
            const rawSvgString = new XMLSerializer().serializeToString(svgEl);
            const svgString = rawSvgString
              .replace(/height="auto"/gi, 'height="100%"')
              .replace(/height="([0-9.]+)pt"/gi, 'height="100%"')
              .replace(/height="([0-9.]+)px"/gi, 'height="100%"');
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const URLObj = window.URL || window.webkitURL || window;
            const blobURL = URLObj.createObjectURL(svgBlob);

            const img = new Image();
            const p = new Promise((resolve) => {
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = svgEl.clientWidth ? svgEl.clientWidth * 2 : 1200;
                canvas.height = svgEl.clientHeight ? svgEl.clientHeight * 2 : 800;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imgUrl = canvas.toDataURL('image/png');
                const imgEl = document.createElement('img');
                imgEl.src = imgUrl;
                imgEl.style.width = '100%';

                imgEl.style.maxWidth = '550px';

                imgEl.style.display = 'block';

                imgEl.style.margin = '15px auto';
                
                const sectionHead = document.createElement('h2');
                sectionHead.innerText = `I. PRISMA & Process Flow Diagram`;
                sectionHead.style.fontSize = '13pt';

                sectionHead.style.marginTop = '20px';

                sectionHead.style.marginBottom = '10px';

                sectionHead.style.borderBottom = '1px solid #cbd5e1';

                sectionHead.style.fontWeight = 'bold';

                const chartBlock = document.createElement('div');
                chartBlock.className = 'export-section';
                chartBlock.appendChild(sectionHead);
                chartBlock.appendChild(imgEl);
                container.appendChild(chartBlock);

                URLObj.revokeObjectURL(blobURL);
                resolve();
              };
              img.onerror = () => resolve();
            });
            img.src = blobURL;
            await p;
          } catch (sErr) {
            console.warn('Skipped SVG capture:', sErr);
          }
        }
      }
    } catch (visualErr) {
      console.warn('Skipping visual section due to capture issue:', visualErr);
    }

    // Section II: Evidence Table (Render-Before-Export Strategy)
    try {
      const tableEl = lastBubble.querySelector('table');
      if (tableEl) {
        const heading = document.createElement('h2');
        heading.innerText = 'II. Evidence Table (Comparison Matrix)';
        heading.style.fontSize = '13pt';

        heading.style.marginTop = '24px';

        heading.style.marginBottom = '12px';

        heading.style.borderBottom = '1px solid #cbd5e1';

        heading.style.paddingBottom = '4px';

        heading.style.fontWeight = 'bold';

        const tableClone = tableEl.cloneNode(true);
        tableClone.querySelectorAll('button').forEach(btn => {
          const txt = btn.innerText;
          const span = document.createElement('sup');
          span.innerText = `[${txt}]`;
          if (btn.parentNode) {
            btn.parentNode.replaceChild(span, btn);
          }
        });

        const tableBlock = document.createElement('div');
        tableBlock.className = 'export-section';
        tableBlock.appendChild(heading);
        tableBlock.appendChild(tableClone);
        container.appendChild(tableBlock);
      }
    } catch (tableErr) {
      console.warn('Skipping table section due to rendering issue:', tableErr);
    }

    // Section III: Synthesis Narrative
    try {
      const heading = document.createElement('h2');
      heading.innerText = 'III. Synthesis Narrative';
      heading.style.fontSize = '13pt';

      heading.style.marginTop = '24px';

      heading.style.marginBottom = '12px';

      heading.style.borderBottom = '1px solid #cbd5e1';

      heading.style.paddingBottom = '4px';

      heading.style.fontWeight = 'bold';
      
      const narrativeBlock = document.createElement('div');
      narrativeBlock.appendChild(heading);

      assistantBubbles.forEach(bubble => {
        const children = bubble.childNodes;
        children.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            if (child.classList.contains('not-prose') || child.querySelector('table') || child.tagName === 'TABLE') {
              return;
            }
            const clone = child.cloneNode(true);
            if (clone.tagName === 'P') {
              clone.style.fontSize = '11pt';

              clone.style.marginBottom = '12px';

              clone.style.textAlign = 'justify';

              clone.style.fontFamily = 'Georgia, serif';
            }
            // Replace citation buttons with clean superscript numbers
            clone.querySelectorAll('button').forEach(btn => {
              const txt = btn.innerText;
              const span = document.createElement('sup');
              span.innerText = `[${txt}]`;
              if (btn.parentNode) {
                btn.parentNode.replaceChild(span, btn);
              }
            });
            narrativeBlock.appendChild(clone);
          }
        });
      });
      container.appendChild(narrativeBlock);
    } catch (narrativeErr) {
      console.warn('Skipping narrative section due to rendering issue:', narrativeErr);
    }

    // Section IV: References Section
    try {
      if (activePapers.length > 0) {
        const heading = document.createElement('h2');
        heading.innerText = 'IV. Academic References';
        heading.style.fontSize = '13pt';

        heading.style.marginTop = '30px';

        heading.style.marginBottom = '12px';

        heading.style.borderBottom = '1px solid #cbd5e1';

        heading.style.paddingBottom = '4px';

        heading.style.fontWeight = 'bold';

        const refList = document.createElement('ol');
        refList.style.fontSize = '10pt';

        refList.style.paddingLeft = '20px';

        refList.style.lineHeight = '1.6';

        activePapers.forEach((paper, idx) => {
          const li = document.createElement('li');
          li.style.marginBottom = '10px';
          
          let authors = 'Unknown Authors';
          if (paper.authors) {
            authors = typeof paper.authors === 'string' ? paper.authors : (Array.isArray(paper.authors) ? paper.authors.join(', ') : 'Unknown Authors');
          }
          const year = paper.journal_year ? `(${paper.journal_year})` : '';
          const title = paper.title || 'Untitled';
          const journal = paper.journal || '';
          const doi = paper.doi ? `DOI: https://doi.org/${paper.doi}` : '';
          
          li.innerHTML = `<strong>${authors}</strong> ${year}. "${title}." <em>${journal}</em>. <span style="color: #312e81;">${doi}</span>`;
          refList.appendChild(li);
        });

        const refBlock = document.createElement('div');
        refBlock.className = 'export-section';
        refBlock.appendChild(heading);
        refBlock.appendChild(refList);
        container.appendChild(refBlock);
      }
    } catch (refErr) {
      console.warn('Skipping references section due to rendering issue:', refErr);
    }

    return container;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = await generateManuscriptDOM();
      if (!element) {
        setIsExporting(false);
        return;
      }
      document.body.appendChild(element);

      // Ensure all images are loaded before html2canvas capture
      const images = Array.from(element.querySelectorAll('img'));
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(element);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = query ? `${query.replace(/[^a-z0-9]/gi, '_')}_Manuscript.pdf` : 'Research_Report.pdf';
      pdf.save(filename);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = async () => {
    setIsExporting(true);
    try {
      const sectionChildren = [
        new Paragraph({
          text: query ? `Research Report: ${query}` : 'ScholarHub Academic Research Synthesis',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Prepared By: ${user?.email || 'ScholarHub Researcher'} | Date: ${new Date().toLocaleDateString()} | Source Count: ${activePapers.length} papers`, italics: true }),
          ],
          spacing: { after: 400 },
        }),
      ];

      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      
      if (lastAssistantMessage) {
        let cleanContent = lastAssistantMessage.content;
        cleanContent = cleanContent.replace(/```mermaid[\s\S]*?```/g, '');

        const paras = cleanContent.split('\n\n');
        paras.forEach(pText => {
          const trimmed = pText.trim();
          if (!trimmed) return;

          if (trimmed.startsWith('###')) {
            sectionChildren.push(
              new Paragraph({
                text: trimmed.replace('###', '').trim(),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (trimmed.startsWith('##')) {
            sectionChildren.push(
              new Paragraph({
                text: trimmed.replace('##', '').trim(),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
              })
            );
          } else if (trimmed.startsWith('|')) {
            const tableRows = [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Paper ID', bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Title', bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Authors', bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Journal / Year', bold: true })] }),
                ],
              }),
            ];
            
            activePapers.forEach((paper, idx) => {
              let auths = 'N/A';
              if (paper.authors) {
                auths = typeof paper.authors === 'string' ? paper.authors : (Array.isArray(paper.authors) ? paper.authors[0] : 'N/A');
              }
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(`[${idx + 1}]`)] }),
                    new TableCell({ children: [new Paragraph(paper.title || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(auths)] }),
                    new TableCell({ children: [new Paragraph(`${paper.journal || ''} ${paper.journal_year ? `(${paper.journal_year})` : ''}`)] }),
                  ],
                })
              );
            });

            sectionChildren.push(
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
            );
          } else {
            const formattedText = trimmed
              .replace(/\[(\d+):\s*"([^"]+)"\]/g, '[$1]')
              .replace(/\[(\d+)\]/g, '[$1]');
            
            sectionChildren.push(
              new Paragraph({
                children: [
                  new TextRun(formattedText),
                ],
                spacing: { after: 120 },
              })
            );
          }
        });
      }

      if (activePapers.length > 0) {
        sectionChildren.push(
          new Paragraph({
            text: 'References',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          })
        );

        activePapers.forEach((paper, idx) => {
          let authors = 'Unknown Authors';
          if (paper.authors) {
            authors = typeof paper.authors === 'string' ? paper.authors : (Array.isArray(paper.authors) ? paper.authors.join(', ') : 'Unknown Authors');
          }
          sectionChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[${idx + 1}] `, bold: true }),
                new TextRun(`${authors}. `),
                new TextRun(paper.journal_year ? `(${paper.journal_year}). ` : ''),
                new TextRun({ text: `"${paper.title || 'Untitled'}". `, bold: true }),
                new TextRun({ text: paper.journal ? `${paper.journal}. ` : '', italic: true }),
                new TextRun(paper.doi ? `DOI: ${paper.doi}` : ''),
              ],
              spacing: { after: 100 },
            })
          );
        });
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: sectionChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = query ? `${query.replace(/[^a-z0-9]/gi, '_')}_Manuscript.docx` : 'Research_Report.docx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Word document downloaded successfully!');
    } catch (error) {
      console.error('Word export failed:', error);
      toast.error('Failed to export Word document.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateManuscript = async (format) => {
    if (format === 'pdf') {
      await exportToPDF();
    } else if (format === 'word') {
      await exportToWord();
    }
  };

  const downloadMarkdown = (content, filename = 'audit-response.md') => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCitation = (paper) => {
    let authors = 'Unknown authors';
    if (paper.authors) {
      if (typeof paper.authors === 'string') {
        authors = paper.authors;
      } else if (Array.isArray(paper.authors)) {
        authors = paper.authors[0] ? `${paper.authors[0]} et al.` : 'Unknown authors';
      }
    } else if (paper.full_authors && paper.full_authors.length > 0) {
      authors = paper.full_authors[0] ? `${paper.full_authors[0]} et al.` : 'Unknown authors';
    }
    const year = paper.year || paper.pub_date?.split('-')[0] || (paper.date && typeof paper.date === 'string' ? paper.date.split(' ').pop() : null) || 'n.d.';
    const title = paper.title || 'Untitled';
    const journal = paper.journal || 'Preprint';
    return `${authors} (${year}). ${title}. ${journal}.`;
  };

  const copyCitation = (paper) => {
    const citation = formatCitation(paper);
    navigator.clipboard.writeText(citation);
    toast.success('Citation copied');
  };

  const handleChatLaneWheel = (e) => {
    // If user scrolls UP with mouse wheel or trackpad, immediately detach auto-scroll lock
    if (e.deltaY < 0) {
      isUserScrolledUpRef.current = true;
      setShowScrollBottomBtn(true);
    }
  };

  const handleChatLaneTouchMove = () => {
    const container = document.getElementById('auditor-chat-lane');
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom > 30) {
      isUserScrolledUpRef.current = true;
      setShowScrollBottomBtn(true);
    }
  };

  const handleChatLaneScroll = (e) => {
    const container = e.currentTarget;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // Tight 30px threshold eliminates scroll fighting and jitter
    const isScrolledUp = distanceFromBottom > 30;
    if (isUserScrolledUpRef.current !== isScrolledUp) {
      isUserScrolledUpRef.current = isScrolledUp;
      setShowScrollBottomBtn(isScrolledUp);
    }
  };

  const scrollToBottom = (force = false) => {
    // Never auto-scroll if user is actively editing a message
    if (editingMsgIndex !== null && !force) {
      return;
    }
    const container = document.getElementById('auditor-chat-lane');
    if (!container) return;

    if (force) {
      isUserScrolledUpRef.current = false;
      setShowScrollBottomBtn(false);
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }

    if (!isUserScrolledUpRef.current) {
      requestAnimationFrame(() => {
        if (!isUserScrolledUpRef.current && container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  };

  useEffect(() => {
    if (chatInitiated && !isUserScrolledUpRef.current) {
      scrollToBottom();
    }
  }, [messages, isAnalyzing, chatInitiated]);

  useEffect(() => {
    if (user && showLibraryModal) {
      loadLibrary();
    }
  }, [user, showLibraryModal]);

  useEffect(() => {
    if (location.state?.reloadSession) {
      const session = location.state.reloadSession;
      const targetWf = session.workflow || 'chat';
      setSessionId(session.id);
      setQuery('');
      setActiveWorkflow(targetWf);
      setActivePapers(session.papers || []);
      setMessages(session.chat_history || []);
      setChatInitiated(true);

      // Hydrate sessionStorage immediately so persistence matches reloaded session
      try {
        sessionStorage.setItem('auditor_sessionId', session.id);
        sessionStorage.setItem('auditor_activeWorkflow', targetWf);
        sessionStorage.setItem('auditor_activePapers', JSON.stringify(session.papers || []));
        sessionStorage.setItem('auditor_chatInitiated', 'true');
        sessionStorage.setItem('auditor_messages', JSON.stringify(session.chat_history || []));
        const cacheKey = `auditor_cache_${session.id}`;
        sessionStorage.setItem(cacheKey, JSON.stringify({
          sessionId: session.id,
          activeWorkflow: targetWf,
          activePapers: session.papers || [],
          chatInitiated: true,
          messages: session.chat_history || [],
          updatedAt: Date.now()
        }));
      } catch (err) {
        console.warn('Error updating sessionStorage during session reload:', err);
      }

      // Clean state to avoid reloading again if they refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.selectedPapers && location.state.selectedPapers.length >= 1) {
      setActiveWorkflow('systematic');
      setActivePapers(location.state.selectedPapers);
      setMessages([]);
      setChatInitiated(false);
    }
  }, [location.state]);

  // Task 2: Persistence Layer (Local Redis Cache) Hydration Hook
  useEffect(() => {
    const currentSessionId = sessionId || sessionStorage.getItem('auditor_sessionId');
    if (currentSessionId) {
      const cacheKey = `auditor_cache_${currentSessionId}`;
      const cacheData = {
        sessionId: currentSessionId,
        activeWorkflow,
        activePapers,
        chatInitiated,
        messages,
        updatedAt: Date.now()
      };
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        sessionStorage.setItem('auditor_sessionId', currentSessionId);
        sessionStorage.setItem('auditor_activeWorkflow', activeWorkflow);
        sessionStorage.setItem('auditor_activePapers', JSON.stringify(activePapers));
        sessionStorage.setItem('auditor_chatInitiated', chatInitiated ? 'true' : 'false');
        sessionStorage.setItem('auditor_messages', JSON.stringify(messages));
      } catch (err) {
        console.warn('SessionStorage Local Redis cache write error:', err);
      }
    }
  }, [sessionId, activeWorkflow, activePapers, chatInitiated, messages]);

  // On Mount: Check Local Redis cache FIRST to load state immediately and skip DB blink
  useEffect(() => {
    if (location.state?.reloadSession) return;

    const currentSessionId = sessionId || sessionStorage.getItem('auditor_sessionId');
    if (currentSessionId) {
      const cacheKey = `auditor_cache_${currentSessionId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.messages && parsed.messages.length > 0) {
            setMessages(parsed.messages);
            if (parsed.activePapers) setActivePapers(parsed.activePapers);
            if (parsed.chatInitiated !== undefined) setChatInitiated(parsed.chatInitiated);
            if (parsed.activeWorkflow) setActiveWorkflow(parsed.activeWorkflow);
          }
        } catch (e) {
          console.warn('Failed to parse Local Redis cached session:', e);
        }
      }
    }
  }, []);

  // Auto-initiate Chat greeting when transitioning to chat workflow with active papers (Task 1)
  useEffect(() => {
    if (activeWorkflow === 'chat' && activePapers.length > 0 && messages.length === 0 && !chatInitiated) {
      setChatInitiated(true);
      setMessages([
        {
          role: 'assistant',
          content: `I'm ready to chat with your selected papers. What would you like to know about them?`,
          suggestions: [
            '📄 Perform a Literature Review',
            '🔍 Identify Research Gaps',
            '🔬 Summarize All Papers'
          ]
        }
      ]);
    }
  }, [activeWorkflow, activePapers, messages.length, chatInitiated]);

  useEffect(() => {
    if (!user) return;
    const fetchLatest = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_history')
          .select('id, title, workflow, updated_at, papers, chat_history')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) setLatestHistorySession(data);
      } catch (e) {
        console.error('Failed to fetch latest session:', e);
      }
    };
    fetchLatest();
  }, [user]);

  const loadLibrary = async () => {
    try {
      const [bookmarksRes, albumsRes] = await Promise.all([
        supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('albums')
          .select('*')
          .eq('user_id', user.id)
          .order('name')
      ]);

      if (bookmarksRes.error) throw bookmarksRes.error;
      if (albumsRes.error) throw albumsRes.error;

      setLibraryPapers(bookmarksRes.data || []);
      setAlbums(albumsRes.data || []);
    } catch (err) {
      console.error('Error loading library:', err);
    }
  };

  const handleConfirmSaveToLibrary = async () => {
    if (!user || !selectedDetailPaper) return;
    if (libraryPapers.length >= 200) {
      toast.warning('Library limit reached (200 papers). Remove papers to save more.');
      return;
    }
    setIsSavingToLibrary(true);
    try {
      const pmid = selectedDetailPaper.pmid || 'N/A';
      const title = selectedDetailPaper.title || 'No Title Available';
      const journal = selectedDetailPaper.journal || 'Unknown Journal';

      // Check if already bookmarked
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('pmid', pmid)
        .maybeSingle();

      if (existing) {
        toast.info('This paper is already in your library.');
        setShowLibrarySaveModal(false);
        return;
      }

      let finalSource = selectedDetailPaper.source;
      if (!finalSource) {
        if (pmid.startsWith('W') || pmid.startsWith('10.')) finalSource = 'scholar';
        else if (journal.toLowerCase().includes('arxiv') || String(pmid).includes('.')) finalSource = 'arxiv';
        else finalSource = 'ncbi';
      }

      const finalUrl = selectedDetailPaper.redirection_url || selectedDetailPaper.url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
      const insertData = {
        user_id: user?.id,
        pmid,
        title,
        journal,
        source: finalSource,
        url: finalUrl,
        full_metadata: selectedDetailPaper // Save the entire paper object into the full_metadata JSONB column
      };
      if (selectedSaveAlbumId) {
        insertData.album_id = selectedSaveAlbumId;
      }

      const { error } = await supabase.from('bookmarks').insert(insertData);
      if (error) throw error;

      toast.success('Paper saved to library successfully!');
      loadLibrary(); // Reload the local library list
      setShowLibrarySaveModal(false);
    } catch (err) {
      console.error('Error saving paper to library:', err);
      toast.error('Failed to save paper to library.');
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File "${file.name}" exceeds maximum 5 MB size limit (${(file.size / (1024*1024)).toFixed(1)} MB). Please select a smaller file.`);
      return;
    }

    setUploadingPdf(true);
    setUploadProgress(0);
    const totalMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadMeta({
      fileName: file.name,
      percent: 0,
      loadedMB: '0.0',
      totalMB,
      speedStr: '0 KB/s'
    });

    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
      const deviceId = getOrCreateDeviceId();

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/api/attachments/upload-file`);
      if (sessionToken) xhr.setRequestHeader('Authorization', `Bearer ${sessionToken}`);
      if (deviceId) xhr.setRequestHeader('X-Device-ID', deviceId);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          const now = Date.now();
          const timeDiffSec = (now - lastTime) / 1000;

          let speedStr = 'Calculating...';
          if (timeDiffSec > 0.2) {
            const bytesDiff = event.loaded - lastLoaded;
            const bytesPerSec = bytesDiff / timeDiffSec;
            if (bytesPerSec >= 1024 * 1024) {
              speedStr = `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
            } else {
              speedStr = `${Math.round(bytesPerSec / 1024)} KB/s`;
            }
            lastLoaded = event.loaded;
            lastTime = now;
          }

          const loadedMB = (event.loaded / (1024 * 1024)).toFixed(1);

          setUploadProgress(percent);
          setUploadMeta({
            fileName: file.name,
            percent,
            loadedMB,
            totalMB,
            speedStr
          });
        }
      };

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.detail || `Upload failed with status ${xhr.status}`));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.send(formData);
      });

      const data = await uploadPromise;
      toast.success(data.message || `Document "${file.name}" attached successfully!`);

      setActiveAttachment({
        id: data.attachment_id,
        name: file.name,
        pages: data.pages_parsed || 1
      });

      const extractedAbstract = data.abstract || data.full_text_preview || `Attached research document "${file.name}" (${data.pages_parsed || 1} pages).`;

      const newPaper = {
        id: data.attachment_id || `att_${Date.now()}`,
        title: `[Uploaded PDF] ${file.name}`,
        abstract: extractedAbstract,
        full_text: data.full_text_preview || extractedAbstract,
        authors: ["Uploaded Document"],
        journal_quartile: "Uploaded Document",
        source: "user_attachment",
        doi: "",
        url: ""
      };

      setActivePapers(prev => [newPaper, ...prev.filter(p => p.id !== newPaper.id)]);
      setShowRightPane(true);

      const previewSnippet = extractedAbstract.length > 300 ? extractedAbstract.slice(0, 300) + '...' : extractedAbstract;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `📄 **Attached Document:** ${file.name}\n\n- **Pages:** ${data.pages_parsed || 1}\n\n**Document Content Overview:**\n${previewSnippet}\n\nYou can now ask questions or request comparative analysis combining this document with external literature.`,
          timestamp: getFormattedTimestamp()
        }
      ]);
    } catch (err) {
      console.error('PDF upload error:', err);
      toast.error(`Document upload failed: ${err.message}`);
    } finally {
      setUploadingPdf(false);
      setUploadMeta(null);
    }
  };

  const handleCreateAlbum = async (e) => {
    if (e) e.preventDefault();
    if (!newAlbumName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('albums')
        .insert({ user_id: user.id, name: newAlbumName.trim() })
        .select()
        .single();
      if (error) throw error;
      setNewAlbumName('');
      setAlbums(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Album "${data.name}" created!`);
    } catch (err) {
      console.error('Failed to create album:', err);
      toast.error('Failed to create album.');
    }
  };

  useEffect(() => {
    if (isAnalyzing && researchEffort === 'deep') {
      setThinkingTime(0);
      thinkingTimeRef.current = 0;
      setActiveStep('Analyzing Methodology...');
      thinkingIntervalRef.current = setInterval(() => {
        setThinkingTime(prev => {
          const newTime = prev + 0.1;
          thinkingTimeRef.current = newTime;
          
          if (newTime > 30 && researchEffort === 'deep') {
            setActiveStep("Engaging Deep Reasoning Engine (Nemotron-3)...");
          } else {
            const cycle = Math.floor(newTime / 4) % 5;
            const steps = [
              "Analyzing Data Sources...",
              "Synthesizing Methodology...",
              "Cross-referencing Findings...",
              "Structuring Evidence Table...",
              "Finalizing Multi-model Synthesis..."
            ];
            setActiveStep(steps[cycle]);
          }
          
          return newTime;
        });
      }, 100);
    } else {
      if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
    }
    return () => {
      if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
    };
  }, [isAnalyzing, researchEffort]);

  const executeAudit = async (finalQuery, explicitPapers = null, targetWorkflow = null) => {
    if (isRequestInFlight.current || activeRequestController.current || isRequesting.current) return;
    isRequestInFlight.current = true;
    isRequesting.current = true;
    
    sessionStorage.setItem('is_pending_analysis', 'true');
    sessionStorage.setItem('pending_query', finalQuery);
    setIsAnalyzing(true);
    setChatInitiated(true);
    isUserScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    setTimeout(() => scrollToBottom(true), 50);

    const conversation = [...messages];
    let papersToUse = (explicitPapers && Array.isArray(explicitPapers) && explicitPapers.length > 0)
      ? explicitPapers
      : (activePapers.length > 0 ? activePapers : JSON.parse(sessionStorage.getItem('auditor_activePapers') || '[]'));
    const timestamp = getFormattedTimestamp();

    const currentWorkflow = targetWorkflow || activeWorkflow;

    // 1. If in Research Agent mode and this is the initial submit, or no papers are loaded in workspace, or explicitly told to 'search again'
    const shouldSearchAgain = finalQuery.toLowerCase().includes('search again');
    const hasNoPriorUserMessages = !conversation.some(m => m.role === 'user');
    const isResearchInitial = (currentWorkflow === 'research' && hasNoPriorUserMessages);
    const hasZeroPapers = !papersToUse || papersToUse.length === 0;

    if (isResearchInitial || hasZeroPapers || shouldSearchAgain) {
      setSearchStatus('searching');
      setCognitiveStep('Analyzing Research Intent & Primary Entity...');

      // Update greeting message showing active search intent
      conversation.push({ role: 'user', content: finalQuery, timestamp });
      
      const firstUserMsg = conversation.find(m => m.role === 'user');
      let searchKeyword = finalQuery;
      if (shouldSearchAgain) {
        if (finalQuery.toLowerCase().trim() === 'search again') {
          searchKeyword = firstUserMsg ? firstUserMsg.content : finalQuery;
        } else {
          searchKeyword = finalQuery.replace(/search\s+again\s+(for\s+)?/i, '').trim();
        }
      }

      conversation.push({
        role: 'assistant',
        content: shouldSearchAgain 
          ? `Re-initiating database search for: "${searchKeyword}"...` 
          : `I'll search for foundational papers on ${finalQuery}, then pull the most relevant ones into a paper table.`
      });
      setMessages(conversation);
      setQuery('');

      try {
        const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
        const deviceId = getOrCreateDeviceId();

        const words = searchKeyword.trim().split(/\s+/);
        const isLong = words.length > 5;
        
        const checkPotentialTypos = (text) => {
          const textWords = text.toLowerCase().match(/[a-z]+/g) || [];
          const hasRepeatedLetters = /([a-z])\1\1/i.test(text);
          if (hasRepeatedLetters) return true;
          for (const w of textWords) {
            if (w.length > 4 && !/[aeiouy]/.test(w)) return true;
          }
          return false;
        };

        // Query unified search API (which aggregates NCBI, arXiv, Europe PMC, OpenAlex, and Crossref in parallel)
        const fetchUrl = `${BASE_URL}/api/search?portal=geb&keyword=${encodeURIComponent(searchKeyword)}&limit=10`;
        const fetchHeaders = { 'Content-Type': 'application/json' };
        if (sessionToken) {
          fetchHeaders['Authorization'] = `Bearer ${sessionToken}`;
        }
        if (deviceId) {
          fetchHeaders['X-Device-ID'] = deviceId;
        }

        const searchRes = await fetch(fetchUrl, {
          method: 'GET',
          headers: fetchHeaders
        });

        // Trigger Project Nexus Shadow Agent for cross-context latent connections
        try {
          fetch(`${BASE_URL}/api/intelligence/shadow-links`, {
            method: 'POST',
            headers: fetchHeaders,
            body: JSON.stringify({ query: searchKeyword })
          }).then(r => r.json()).then(data => {
            if (data && data.has_latent_link) {
              setLatentConnection(data);
              toast.info(`🔗 Shadow Agent: Latent connection found!`);
            }
          }).catch(() => {});
        } catch (e) {}

        if (!searchRes.ok && searchRes.status !== 202) {
          throw new Error('Failed to fetch search results from academic databases.');
        }

        let searchData = await searchRes.json();

        // ─── Phase 7.2 Async Job Polling (Cache Miss 202 Accepted) ───
        if (searchRes.status === 202 || (searchData.status === 'queued' && searchData.job_id)) {
          const jobId = searchData.job_id;
          let pollCount = 0;
          let jobCompleted = false;

          console.log(`[AUDITOR FRONTEND] Job '${jobId}' queued. Initiating real-time polling...`);
          setCognitiveStep("Initializing ROS Deep Reasoning...");

          while (!jobCompleted && pollCount < 300) { // Max 5 minutes polling window
            await new Promise(r => setTimeout(r, 1000));
            pollCount++;

            try {
              const jobRes = await fetch(`${BASE_URL}/api/job/${jobId}`, { headers: fetchHeaders });
              if (jobRes.ok) {
                const jobData = await jobRes.json();
                const payloadObj = jobData.payload || jobData.result || jobData;
                console.log("Job Payload Received:", payloadObj);

                if (jobData.step) {
                  setCognitiveStep(`[ROS Pipeline] ${jobData.step}`);
                }
                if (jobData.status === 'completed' && payloadObj) {
                  console.log(`[AUDITOR FRONTEND] Job '${jobId}' completed successfully after ${pollCount}s! Payload:`, payloadObj);
                  searchData = payloadObj;
                  jobCompleted = true;
                  window.dispatchEvent(new Event('zapsUpdated'));
                } else if (jobData.status === 'failed') {
                  throw new Error(jobData.error || 'ROS Pipeline async job failed.');
                }
              }
            } catch (pErr) {
              console.warn(`[AUDITOR FRONTEND] Polling attempt ${pollCount} warning:`, pErr);
            }
          }

          if (!jobCompleted) {
            throw new Error('Search request timed out waiting for background worker.');
          }
        }

        if (searchData.cognitive_metadata) {
          setCognitiveInfo(searchData.cognitive_metadata);
          setCognitiveStep(`Intent: ${searchData.cognitive_metadata.intent || 'Research'} | Entity: ${searchData.cognitive_metadata.main_entity || 'General'}`);
        }
        const fetchedPapers = searchData.articles || [];


        if (fetchedPapers.length === 0) {
          setMessages(prev => [
            ...prev.filter(m => !m.content?.includes('Resuming analysis for:')),
            { role: 'assistant', content: "Database-এ আপনার প্রম্পট/কোয়েরি অনুযায়ী কোনো প্রাসঙ্গিক তথ্য বা গবেষণা পেপার পাওয়া যায়নি। দয়া করে ভিন্ন বা কিছুটা সুনির্দিষ্ট কি-ওয়ার্ড দিয়ে চেষ্টা করুন।" }
          ]);
          setIsAnalyzing(false);
          setSearchStatus('');
          return;
        }

        papersToUse = fetchedPapers;
        setActivePapers(fetchedPapers);
        setShowRightPane(true);
        toast.success(`Fetched ${fetchedPapers.length} papers for context.`);
      } catch (err) {
        console.error('Dynamic search failed:', err);
        const userMsg = err.message?.includes('Failed to fetch') || err.message?.includes('fetch')
          ? 'The Global Research Databases are currently experiencing high latency or network interruption. We apologize for this delay. Please try again in a few moments.'
          : 'Dynamic academic search failed.';
        toast.error(userMsg);

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ **Search Connection Interrupted**\n\n${userMsg}\n\nPlease click below to re-initiate your query when ready.`,
            suggestions: [`🔍 Retry search for: "${searchKeyword}"`]
          }
        ]);

        isRequestInFlight.current = false;
        isRequesting.current = false;
        setIsAnalyzing(false);
        setSearchStatus('');
        sessionStorage.removeItem('is_pending_analysis');
        sessionStorage.removeItem('pending_query');
        return;
      }
    } else {
      // 2. Normal Flow (Chat with papers or Systematic Review modes, or follow-up messages)
      if (conversation.length === 0) {
        let greeting = activePapers.length === 0
          ? 'What research topic would you like me to explore for you?'
          : `I've analyzed your ${activePapers.length} selected papers. How can I help you audit them today?`;
        let greetingSuggestions = [];
        if (activeWorkflow === 'systematic') {
          greeting = `I see you've selected ${activePapers.length} papers for a Systematic Review. Shall I generate a summary matrix or identify research gaps first?`;
          greetingSuggestions = [
            '📊 Generate comparative table of paper features', 
            '🔍 Identify research gaps (as an interactive graph)'
          ];
        } else if (activeWorkflow === 'chat') {
          greeting = `I'm ready to chat with your selected papers. What would you like to know about them?`;
          if (activePapers.length > 0) {
            greetingSuggestions = [
              '📄 Perform a Literature Review',
              '🔍 Identify Research Gaps',
              '🔬 Summarize All Papers'
            ];
          }
        } else if (activeWorkflow === 'research') {
          greeting = 'What research topic would you like me to explore for you?';
        }
        conversation.push({
          role: 'assistant',
          content: greeting,
          suggestions: greetingSuggestions
        });
      }
      conversation.push({ role: 'user', content: finalQuery, timestamp });
      setMessages(conversation);
      setQuery('');
    }

    // 3. Transition to Analyzing stage
    setSearchStatus('analyzing');

    // Adaptive Truncation Context Builder (Task 1)
    const getMetadataLength = (art, index) => {
      const pIndex = index + 1;
      const meta = art.full_metadata || {};
      const title = art.title || meta.title || 'No Title';
      const doi = art.doi || meta.doi || 'Not Available';
      const pmid = art.pmid || meta.pmid || 'Not Available';
      const journal = art.journal || meta.journal || 'Unknown Journal';
      const quartile = art.journal_quartile || meta.journal_quartile || art.quartile || meta.quartile || 'N/A';
      const citations = art.citationCount || meta.citationCount || art.citations || meta.citations || 0;
      
      let keywords = art.keywords || meta.keywords || [];
      if (Array.isArray(keywords)) {
        keywords = keywords.filter(Boolean).join(', ');
      }
      
      let sources = art.sources || meta.sources || [art.source || 'unknown'];
      if (Array.isArray(sources)) {
        sources = sources.filter(Boolean).join(', ');
      }
      const url = art.url || meta.url || 'Not Available';

      const formattedString = 
        `\n[Paper ${pIndex}]\n` +
        `Title: ${title}\n` +
        `Abstract: \n` +
        `DOI: ${doi}\n` +
        `PMID: ${pmid}\n` +
        `Journal: ${journal} (SJR Quartile: ${quartile})\n` +
        `Citations: ${citations}\n` +
        `Keywords: ${keywords}\n` +
        `Sources Mapped: ${sources}\n` +
        `URL: ${url}\n`;
      return formattedString.length;
    };

    const getQPriority = (q) => {
      if (q === 'Q1' || q === 'Q2') return 1;
      return 2;
    };

    const papersMetadata = papersToUse.map((art, index) => {
      const qRank = getQPriority(art.journal_quartile || art.quartile);
      const absText = art.abstract || '';
      return {
        index,
        qRank,
        fullAbstract: absText,
        abstractLength: absText.length,
        allocatedLength: 0,
        metadataLength: getMetadataLength(art, index)
      };
    });

    // Task 1: Precision Context Engine (V9.0) Index-Based Query Interception
    const targetIndices = [];
    const paperKeywords = /paper|papers|number|numbers|#|and|or/i;
    const allNumbers = finalQuery.match(/\b\d+\b/g) || [];
    if (paperKeywords.test(finalQuery)) {
      allNumbers.forEach(nStr => {
        const num = parseInt(nStr, 10);
        if (num > 0 && num <= papersToUse.length) {
          targetIndices.push(num - 1); // 0-based index
        }
      });
    }
    const uniqueTargetIndices = Array.from(new Set(targetIndices));

    const totalMetadataLength = papersMetadata.reduce((acc, p) => acc + p.metadataLength, 0);
    let maxBudget = 15000 - (messages.length * 500); // 15,000-character budget as specified
    if (messages.length > 0) {
      maxBudget = 4000;
    } else if (maxBudget < 5000) {
      maxBudget = 5000;
    }
    let remainingAbstractBudget = maxBudget - totalMetadataLength; 
    if (remainingAbstractBudget < 0) remainingAbstractBudget = 0;

    // First allocate full abstracts to deep-dive targets (uniqueTargetIndices)
    uniqueTargetIndices.forEach(idx => {
      const p = papersMetadata.find(item => item.index === idx);
      if (p && remainingAbstractBudget > 0) {
        const takeAmount = Math.min(p.abstractLength, remainingAbstractBudget);
        p.allocatedLength = takeAmount;
        remainingAbstractBudget -= takeAmount;
      }
    });

    // Allocate to Q1/Q2 first (excluding deep-dive targets)
    if (remainingAbstractBudget > 0) {
      const highPriorityPapers = papersMetadata.filter(p => p.qRank === 1 && !uniqueTargetIndices.includes(p.index));
      for (const p of highPriorityPapers) {
        if (remainingAbstractBudget <= 0) break;
        const takeAmount = Math.min(p.abstractLength, remainingAbstractBudget);
        p.allocatedLength = takeAmount;
        remainingAbstractBudget -= takeAmount;
      }
    }

    // Allocate remaining to other papers (excluding deep-dive targets)
    if (remainingAbstractBudget > 0) {
      const lowPriorityPapers = papersMetadata.filter(p => p.qRank === 2 && !uniqueTargetIndices.includes(p.index));
      for (const p of lowPriorityPapers) {
        if (remainingAbstractBudget <= 0) break;
        const takeAmount = Math.min(p.abstractLength, remainingAbstractBudget);
        p.allocatedLength = takeAmount;
        remainingAbstractBudget -= takeAmount;
      }
    }

    const truncatedPapers = papersToUse.map((art, index) => {
      const pMeta = papersMetadata[index];
      let abs = pMeta.fullAbstract;
      if (abs.length > pMeta.allocatedLength) {
        abs = abs.slice(0, pMeta.allocatedLength);
        if (abs.length > 0) {
          abs += '... [truncated]';
        } else {
          abs = 'No abstract available or truncated due to context limits.';
        }
      }
      return {
        ...art,
        abstract: abs
      };
    });

    // 4. Fetch AI audit response using truncatedPapers context
    try {
      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
      const deviceId = getOrCreateDeviceId();

      // Determine audit mode based on workflow and user query
      let auditMode = 'research_synthesis';
      if (currentWorkflow === 'report') {
        auditMode = 'report';
      } else if (currentWorkflow === 'systematic') {
        auditMode = 'systematic';
      } else if (currentWorkflow === 'research') {
        auditMode = 'research_synthesis';
      } else if (currentWorkflow === 'chat') {
        const queryLower = finalQuery.toLowerCase();
        if (queryLower.includes('literature review')) {
          auditMode = 'report';
        } else if (queryLower.includes('research gap') || queryLower.includes('research gaps')) {
          auditMode = 'gap';
        } else {
          auditMode = 'research_synthesis';
        }
      }

      if (activeRequestController.current) {
        try {
          activeRequestController.current.abort();
        } catch (e) {}
        activeRequestController.current = null;
      }
      const controller = new AbortController();
      activeRequestController.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 seconds (5 mins) for Deep Tier synthesis

      let response;
      try {
        response = await fetch(`${BASE_URL}/ai/audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
            'X-Device-ID': deviceId,
            'X-Research-Effort': researchEffort
          },
          signal: controller.signal,
          body: JSON.stringify({
            query: finalQuery,
            articles: truncatedPapers.map(art => ({
              title: art.title || art.full_metadata?.title || '',
              abstract: art.abstract || art.full_metadata?.abstract || art.summary || art.snippet || art.description || art.details || '',
              full_metadata: art.full_metadata || art
            })),
            chat_history: conversation.slice(-3),
            audit_mode: auditMode,
            workflow: activeWorkflow,
            academic_field: profile?.academic_field || '',
            academic_status: profile?.academic_status || 'Undergraduate'
          })
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to analyze selected papers.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullText = '';
      let isStreamFinished = false;

      const tempId = Date.now().toString();
      let newAssistantMessage = { 
        id: tempId,
        role: 'assistant', 
        content: '',
        rawThoughts: '',
        suggestions: null,
        thinkingTime: researchEffort === 'deep' ? thinkingTimeRef.current : null,
        isStreaming: true
      };

      setMessages(prev => [
        ...prev.filter(m => !m.content?.includes('Resuming analysis for:')),
        newAssistantMessage
      ]);

      let lastStateDispatchTime = 0;
      let streamLineBuffer = '';

      while (!isStreamFinished) {
        const { done, value } = await reader.read();
        if (done) {
          isStreamFinished = true;
          break;
        }
        
        streamLineBuffer += decoder.decode(value, { stream: true });
        const lines = streamLineBuffer.split('\n');
        streamLineBuffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') {
              isStreamFinished = true;
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullText += data.content;
              }
            } catch (e) {}
          }
        }
        
        // State routing: parse <thought> tags
        const hasThoughtStart = fullText.includes('<thought>');
        const hasThoughtEnd = fullText.includes('</thought>');
        
        let updatedThoughts = '';
        let updatedContent = fullText;
        
        if (hasThoughtStart) {
           if (hasThoughtEnd) {
               const thoughtMatch = fullText.match(/<thought>([\s\S]*?)<\/thought>/);
               if (thoughtMatch) {
                   updatedThoughts = thoughtMatch[1].trim();
                   updatedContent = fullText.split('</thought>')[1].trimStart();
               }
           } else {
               updatedThoughts = fullText.split('<thought>')[1];
               updatedContent = '';
           }
        }

        // Parse suggestions if any
        let finalContent = updatedContent;
        let suggestions = null;
        if (finalContent.includes('---SUGGESTIONS---')) {
            const parts = finalContent.split('---SUGGESTIONS---');
            finalContent = parts[0].trim();
            const suggestionLines = parts[1].trim().split('\n');
            suggestions = suggestionLines
              .map(l => l.replace(/^[-*0-9.\s]+/, '').trim())
              .filter(Boolean)
              .slice(0, 3);
        }
        
        newAssistantMessage = {
          ...newAssistantMessage,
          content: finalContent,
          rawThoughts: updatedThoughts,
          suggestions: suggestions && suggestions.length === 3 ? suggestions : null
        };

        const now = performance.now();
        if (now - lastStateDispatchTime > 60 || isStreamFinished) {
          lastStateDispatchTime = now;
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? newAssistantMessage : msg
          ));
        }
      }

      if (streamLineBuffer.length > 0 && streamLineBuffer.startsWith('data: ')) {
        const dataStr = streamLineBuffer.substring(6).trim();
        if (dataStr !== '[DONE]') {
          try {
            const data = JSON.parse(dataStr);
            if (data.content) fullText += data.content;
          } catch (e) {}
        }
      }

      newAssistantMessage.isStreaming = false;
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? newAssistantMessage : msg
      ));
      notifyCreditsUpdated();

      // Save or update session in Supabase audit_history table
      try {
        const sessionPayload = {
          user_id: user.id,
          title: finalQuery.length > 80 ? finalQuery.slice(0, 80) + '...' : finalQuery,
          papers: papersToUse,
          chat_history: [...conversation, newAssistantMessage],
          workflow: activeWorkflow,
          updated_at: new Date().toISOString()
        };

        if (sessionId) {
          const { error: saveError } = await supabase
            .from('audit_history')
            .update(sessionPayload)
            .eq('id', sessionId);
          if (saveError) {
            console.error('Supabase update audit_history error details:', JSON.stringify(saveError, null, 2));
            throw saveError;
          }
        } else {
          // Pre-check: enforce 100-session workspace quota
          const { count: sessionCount } = await supabase
            .from('audit_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (sessionCount !== null && sessionCount >= 100) {
            setShowWorkspaceLimitModal(true);
            // Still allow the analysis to complete — just skip persisting the new session
          } else {
            const { data: inserted, error: saveError } = await supabase
              .from('audit_history')
              .insert({
                ...sessionPayload,
                created_at: new Date().toISOString()
              })
              .select()
              .single();
            if (saveError) {
              console.error('Supabase insert audit_history error details:', JSON.stringify(saveError, null, 2));
              throw saveError;
            }
            if (inserted?.id) {
              setSessionId(inserted.id);
            }
          }
        }
      } catch (dbErr) {
        console.error('Failed to save session to Supabase:', dbErr);
        toast.error('Could not sync session with cloud.');
      }

    } catch (error) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
        toast.info('Generation stopped.');
        return;
      }
      
      let userMsg = 'An error occurred during AI analysis.';
      if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        userMsg = 'The Global Research Databases are currently experiencing high latency. We apologize for this external delay. Please try again in a few moments as we re-establish the connection.';
      } else {
        userMsg = error.message || userMsg;
      }

      toast.error(userMsg);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error: ${userMsg}` }
      ]);
    } finally {
      if (activeRequestController.current) {
        activeRequestController.current = null;
      }
      isRequestInFlight.current = false;
      isRequesting.current = false;
      setIsAnalyzing(false);
      setSearchStatus('');
      sessionStorage.removeItem('is_pending_analysis');
      sessionStorage.removeItem('pending_query');
    }
  };

  // Auto-trigger audit action when navigating from Research Hub with selected papers & mode
  useEffect(() => {
    const autoTrigger = sessionStorage.getItem('auditor_autoTrigger');
    if (!autoTrigger) return;

    // Parse selected papers directly from sessionStorage to guarantee immediate synchronization
    const savedPapersStr = sessionStorage.getItem('auditor_activePapers');
    let papersList = [...activePapers];
    if (savedPapersStr) {
      try {
        const parsed = JSON.parse(savedPapersStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          papersList = parsed;
          setActivePapers(parsed);
          setShowRightPane(true);
        }
      } catch (e) {
        console.error("Failed to parse active papers:", e);
      }
    }

    // Reset current session chat messages, request flags, and session ID to start clean workspace
    setMessages([]);
    sessionStorage.removeItem('auditor_messages');
    sessionStorage.removeItem('auditor_sessionId');
    sessionStorage.removeItem('is_pending_analysis');
    sessionStorage.removeItem('pending_query');
    setSessionId(null);
    isRequestInFlight.current = false;
    isRequesting.current = false;

    const timer = setTimeout(() => {
      sessionStorage.removeItem('auditor_autoTrigger');
      
      if (autoTrigger === 'systematic') {
        setActiveWorkflow('systematic');
        setResearchEffort('standard');
        executeAudit(
          'Conduct a Semantic Review by analyzing the abstracts of the provided research papers. Identify their main topics, key concepts, research objectives, methods, findings, and common themes. Compare the meaning and concepts across different papers to identify similarities, differences, research trends, and possible research gaps.',
          papersList,
          'systematic'
        );
      } else if (autoTrigger === 'report') {
        setActiveWorkflow('report');
        setResearchEffort('standard');
        executeAudit(
          'Prepare a Research Report by analyzing the provided research papers and summarizing their key information. Identify their research objectives, methodologies, findings, major themes, similarities, differences, and research gaps. Compare the information from different studies to understand overall research trends and develop a clear understanding of the selected topic.',
          papersList,
          'report'
        );
      } else if (autoTrigger === 'chat') {
        setActiveWorkflow('chat');
        const papersCount = papersList.length;
        setMessages([
          {
            role: 'assistant',
            content: `I've loaded your **${papersCount} selected paper(s)** as primary research sources. What specific question or topic would you like to explore first?`,
            suggestions: [
              '📄 Summarize core methodology across papers',
              '🔍 Identify key research gaps and contradictions',
              '💡 How can I apply these findings to my thesis?'
            ],
            timestamp: getFormattedTimestamp()
          }
        ]);
        toast.success(`Loaded ${papersCount} selected papers as RAG sources.`);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const handleExportToExcel = async (primaryContent) => {
    if (!(await checkExportLimit())) return;
    try {
      const wb = XLSX.utils.book_new();
      let totalTablesExtracted = 0;

      const contentList = [];
      if (primaryContent && typeof primaryContent === 'string') {
        contentList.push(primaryContent);
      }
      messages.forEach(msg => {
        if (msg.content && msg.content !== primaryContent) {
          contentList.push(msg.content);
        }
      });

      contentList.forEach((content) => {
        const tableBlocks = [...content.matchAll(/\|[^\n]+\|\r?\n\|[\s-:]+\|[\s\S]*?(?=\n\n|\n[^|]|$)/g)].map(m => m[0]);
        let tablesToProcess = tableBlocks;

        if (tablesToProcess.length === 0) {
          const altMatches = content.match(/\|[\s\S]*?\|[\s\S]*?\|/g);
          if (altMatches) tablesToProcess = altMatches;
        }

        tablesToProcess.forEach((tableText) => {
          const rows = tableText.split(/\r?\n/).filter(row => row.trim().startsWith('|'));
          const data = [];

          rows.forEach((row, rowIndex) => {
            if (rowIndex === 1 && row.includes('---')) return;
            const cells = row.split('|').slice(1, -1).map(cell => cell.trim().replace(/<[^>]*>/g, ''));
            if (cells.length > 0) {
              data.push(cells);
            }
          });

          if (data.length > 0) {
            totalTablesExtracted++;
            const ws = XLSX.utils.aoa_to_sheet(data);
            const sheetName = `Table_${totalTablesExtracted}`.slice(0, 31);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
          }
        });

        if (content.includes('[Relevance Map]')) {
          const parts = content.split('[Relevance Map]');
          const rawRel = parts[1] || '';
          const relLines = rawRel.split(/\r?\n/);
          const relData = [['Paper Title', 'Relevance Score', 'Justification']];
          relLines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.toUpperCase().includes('RELEVANCE|') || trimmed.toUpperCase().includes('RELEVANCE:')) {
              const segs = trimmed.split(/\||:/).map(s => s.trim()).filter(Boolean);
              if (segs[0]?.toUpperCase() === 'RELEVANCE') segs.shift();
              if (segs.length >= 2) {
                relData.push([segs[0], segs[1], segs[2] || '']);
              }
            }
          });

          if (relData.length > 1) {
            totalTablesExtracted++;
            const ws = XLSX.utils.aoa_to_sheet(relData);
            const sheetName = `Relevance_Map_${totalTablesExtracted}`.slice(0, 31);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
          }
        }
      });

      if (wb.SheetNames.length === 0) {
        toast.error('No table data found to export.');
        return;
      }

      const filename = `ScholarHub_Audit_Tables_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success(`Exported ${wb.SheetNames.length} table worksheet tab(s) to Excel!`);
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error('Failed to export tables to Excel.');
    }
  };

  const handleExportSourcesToExcel = async () => {
    if (activePapers.length === 0) {
      toast.error('No sources to export.');
      return;
    }
    if (!(await checkExportLimit())) return;

    try {
      const data = activePapers.map(p => ({
        Title: p.title || '—',
        Authors: p.authors ? (Array.isArray(p.authors) ? p.authors.join(', ') : p.authors) : '—',
        Journal: p.journal || 'Preprint',
        Year: p.year || '—',
        'SJR Quartile': p.journal_quartile || '—',
        'Citation Count': p.citationCount ?? '—',
        DOI: p.doi || '—',
        'Publisher URL': p.url || '—'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sources");

      const safeQuery = query ? query.replace(/[^a-z0-9]/gi, '_').substring(0, 30) : 'Export';
      const filename = `ScholarHub_Sources_${safeQuery}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success('Sources exported successfully!');
    } catch (err) {
      console.error('Export Error:', err);
      toast.error('Failed to export sources to Excel.');
    }
  };

  const handleQuerySubmit = async (e, customQuery = '') => {
    if (e) e.preventDefault();
    if (isRequesting.current) return;
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;

    setShowDynamicSuggestions(false);
    executeAudit(finalQuery);
  };

  const handleLibraryInject = () => {
    const selectedRaw = libraryPapers.filter(p => selectedLibraryPmids.includes(p.pmid));
    if (selectedRaw.length === 0) {
      toast.warning('No papers selected.');
      return;
    }

    const papersToInject = selectedRaw.map(p => {
      if (p.full_metadata) {
        return {
          ...p.full_metadata,
          pmid: p.pmid,
          title: p.title || p.full_metadata.title,
          journal: p.journal || p.full_metadata.journal,
          source: p.source || p.full_metadata.source,
          url: p.url || p.full_metadata.url
        };
      }
      return p;
    });

    // Combine papers
    const updatedPapers = [...activePapers];
    const existingPmids = updatedPapers.map(ap => ap.pmid);
    const filteredNew = papersToInject.filter(p => !existingPmids.includes(p.pmid));
    const finalPapers = [...updatedPapers, ...filteredNew];

    setActivePapers(finalPapers);
    setSelectedLibraryPmids([]);
    setShowLibraryModal(false);
    toast.success(`Successfully added ${papersToInject.length} papers to workspace.`);

    // If in Chat with papers mode, transition immediately to chat view with the updated greeting
    if (activeWorkflow === 'chat' && finalPapers.length > 0 && messages.length === 0) {
      setChatInitiated(true);
      setMessages([
        {
          role: 'assistant',
          content: `I'm ready to chat with your selected papers. What would you like to know about them?`,
          suggestions: [
            '📄 Perform a Literature Review',
            '🔍 Identify Research Gaps',
            '🔬 Summarize All Papers'
          ]
        }
      ]);
    } else if (activeWorkflow === 'systematic' && finalPapers.length > 0 && messages.length === 0) {
      setResearchEffort('standard');
      executeAudit(
        'Conduct a Semantic Review by analyzing the abstracts of the provided research papers. Identify their main topics, key concepts, research objectives, methods, findings, and common themes. Compare the meaning and concepts across different papers to identify similarities, differences, research trends, and possible research gaps.',
        finalPapers,
        'systematic'
      );
    } else if (activeWorkflow === 'report' && finalPapers.length > 0 && messages.length === 0) {
      setResearchEffort('standard');
      executeAudit(
        'Prepare a Research Report by analyzing the provided research papers and summarizing their key information. Identify their research objectives, methodologies, findings, major themes, similarities, differences, and research gaps. Compare the information from different studies to understand overall research trends and develop a clear understanding of the selected topic.',
        finalPapers,
        'report'
      );
    }
  };

  const toggleLibrarySelection = (pmid) => {
    setSelectedLibraryPmids(prev =>
      prev.includes(pmid) ? prev.filter(id => id !== pmid) : [...prev, pmid]
    );
  };

  const handleRemovePaper = (pmid) => {
    setActivePapers(prev => prev.filter(p => p.pmid !== pmid));
    toast.success('Paper removed from active context.');
  };

  const filteredLibrary = libraryPapers.filter(paper => {
    if (selectedAlbumId === 'general') {
      if (paper.album_id !== null) return false;
    } else if (selectedAlbumId !== 'all') {
      if (paper.album_id !== selectedAlbumId) return false;
    }
    if (librarySearchQuery.trim()) {
      const q = librarySearchQuery.toLowerCase();
      return paper.title?.toLowerCase().includes(q) || paper.journal?.toLowerCase().includes(q);
    }
    return true;
  });

  const latestSuggestions = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        const raw = messages[i].suggestions;
        if (raw && raw.length > 0) {
          // Format suggestions to make sure they explicitly encourage visual discovery
          return raw.map(s => {
            const lower = s.toLowerCase();
            if (lower.includes('graph') || lower.includes('flowchart') || lower.includes('table') || lower.includes('matrix') || lower.includes('diagram') || lower.includes('landscape') || lower.includes('timeline')) {
              return s;
            }
            if (lower.includes('compare') || lower.includes('contrast')) {
              return `${s} (in a comparative table)`;
            }
            if (lower.includes('process') || lower.includes('method') || lower.includes('flow')) {
              return `${s} (as a visual flowchart)`;
            }
            if (lower.includes('connection') || lower.includes('relation') || lower.includes('link')) {
              return `${s} (as an interactive graph)`;
            }
            return `${s} (view comparative table)`;
          }).slice(0, 3);
        }
        
        // Context-aware fallbacks that strictly follow the Visual exploration guidelines
        const content = (messages[i].content || "").toLowerCase();
        const fallbacks = [];
        if (content.includes("method") || content.includes("process") || content.includes("flow")) {
          fallbacks.push("Visualize methodology flowchart for these studies");
        }
        if (content.includes("compare") || content.includes("table") || content.includes("vs") || content.includes("finding")) {
          fallbacks.push("Generate comparative table of key metrics");
        }
        if (fallbacks.length < 3) {
          fallbacks.push("Generate comparative table of main outcomes");
        }
        if (fallbacks.length < 3) {
          fallbacks.push("Render interactive graph of study connections");
        }
        if (fallbacks.length < 3) {
          fallbacks.push("Visualize methodology flowchart of research stages");
        }
        return fallbacks.slice(0, 3);
      }
    }
    return [];
  })();

  useEffect(() => {
    const isSupportedWorkflow = ['research', 'chat', 'systematic'].includes(activeWorkflow);
    if (chatInitiated && isSupportedWorkflow && latestSuggestions && latestSuggestions.length > 0 && !isAnalyzing && query.trim() === '') {
      setShowDynamicSuggestions(true);
    } else {
      setShowDynamicSuggestions(false);
    }
  }, [chatInitiated, activeWorkflow, latestSuggestions, isAnalyzing, query]);

  return (
    <WorkspaceLayout user={user} onLogout={onLogout} lockScroll={chatInitiated}>
      <SEOHead
        title="The Auditor | AI Research IDE & Cochrane Risk of Bias Analyzer | ScholarHub AI"
        description="Autonomous systematic reviews, Cochrane RoB 2.0 risk of bias auditing, multi-paper synthesis, and interactive UVE mindmaps on ScholarHub AI."
        canonicalPath="/auditor"
      />
      <div className={`bg-slate-50 text-slate-900 ${chatInitiated ? 'h-full w-full overflow-hidden' : 'min-h-full w-full'} flex flex-col relative z-10 font-sans`}>

        {/* Hairline progress bar */}
        {isAnalyzing && (
          <div className="h-[2.5px] bg-slate-100 overflow-hidden z-20 shrink-0 flex items-center relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: searchStatus === 'searching' ? '40%' : '95%' }}
              transition={{ duration: searchStatus === 'searching' ? 4 : 15, ease: "easeOut" }}
              className="h-full bg-slate-900"
            />
            <div className="absolute right-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
              {searchStatus === 'searching' ? 'Searching Academic DBs...' : 'Analyzing Lit Context...'}
            </div>
          </div>
        )}

        {/* MAIN CANVAS */}
        <div className={`flex-1 flex flex-col ${chatInitiated ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-6'}`}>
          <div className={`w-full h-full flex flex-col ${chatInitiated ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>

            <AnimatePresence mode="wait">

              {/* 1. INITIAL SEARCH VIEW */}
              {!chatInitiated && (
                <motion.div
                  key="initial-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center w-full 2xl:px-12 mx-auto w-full py-6"
                >

                  {(activeWorkflow === 'chat' || activeWorkflow === 'systematic' || activeWorkflow === 'report') && activePapers.length === 0 ? (
                    <div className="w-full">
                      {/* Integrated Card Header for Chat mode */}
                      <div className="bg-slate-800 rounded-t-xl px-4 py-2.5 flex items-center gap-3">
                        <div className="relative">
                          <select
                            value={activeWorkflow}
                            onChange={(e) => setActiveWorkflow(e.target.value)}
                            className="appearance-none bg-slate-700/60 hover:bg-slate-700 text-[11px] font-black text-slate-200 pl-2.5 pr-7 py-1.5 rounded-md focus:outline-none cursor-pointer transition-colors border border-slate-600/50"
                          >
                            <option value="research">🔬 Research Agent</option>
                            <option value="report" disabled={userTier === 'free'}>📄 Research Report {userTier === 'free' ? '🔒' : ''}</option>
                            <option value="systematic">📋 Semantic Review</option>
                            <option value="peer_review">⚖️ The Peer Reviewer (Critical Appraisal)</option>
                            <option value="pitch">🎙️ Scientific Pitch Suite</option>
                            <option value="chat">💬 Chat with papers</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="h-4 w-px bg-slate-700/50 hidden sm:block" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline ml-auto">Select sources to begin</span>
                      </div>

                      {/* Chat Empty State Body */}
                      <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 mb-4">
                          <BookOpen size={24} />
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-800 mb-1.5">
                          {activeWorkflow === 'report' ? 'Research Report' : activeWorkflow === 'systematic' ? 'Semantic Review' : 'Chat with papers'}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 max-w-sm mb-2 leading-relaxed">
                          Select papers from your library to start {activeWorkflow === 'chat' ? 'a focused conversation' : 'the automated analysis'}.
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium max-w-sm mb-6 leading-normal italic">
                          Once papers are added, Emo will {activeWorkflow === 'chat' ? 'help you explore them' : 'automatically generate the review'}.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLibraryModal(true)}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md shadow-slate-900/10 hover:shadow-lg flex items-center gap-2"
                        >
                          <BookOpen size={14} />
                          Select Sources from Library
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Refinement Interface */}
                      {isRefining ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 max-w-2xl mx-auto w-full text-center">
                          <h2 className="text-lg font-black text-slate-800 mb-1 leading-snug">
                            What do you mean by "{refineOriginalQuery}"?
                          </h2>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-8">
                            Select a research direction to narrow down your search
                          </p>

                          {isRefiningLoading ? (
                            <div className="flex flex-col items-center gap-3">
                              <RefreshCw size={24} className="animate-spin text-slate-800" />
                              <p className="text-xs text-slate-500 font-medium">Generating research directions...</p>
                            </div>
                          ) : (
                            <div className="w-full space-y-3.5 mb-8">
                              {refineDirections.map((dir, idx) => (
                                <button
                                  key={`dir-${idx}-${dir?.slice(0, 15)}`}
                                  onClick={() => {
                                    setIsRefining(false);
                                    executeAudit(`${refineOriginalQuery} + ${dir}`);
                                  }}
                                  className="w-full text-left p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl transition-all shadow-sm hover:shadow group flex justify-between items-center cursor-pointer"
                                >
                                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{dir}</span>
                                  <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-650 transition-colors" />
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setIsRefining(false);
                              executeAudit(refineOriginalQuery);
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors underline cursor-pointer"
                          >
                            Skip & Search Directly
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleQuerySubmit} className="w-full flex flex-col items-center">
                          {latentConnection && (
                            <div className="w-full max-w-xl mb-4 p-3.5 bg-slate-900 border border-indigo-500/40 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Sparkles size={16} className="text-indigo-400 animate-pulse shrink-0" />
                                <div className="text-xs">
                                  <span className="font-black text-indigo-300 uppercase tracking-widest block text-[10px]">Project Nexus Latent Link ({latentConnection.confidence_score}% Match)</span>
                                  <span className="font-medium text-slate-200">{latentConnection.synthesis_note}</span>
                                </div>
                              </div>
                              <button type="button" onClick={() => setLatentConnection(null)} className="text-slate-400 hover:text-white text-xs font-bold p-1">✕</button>
                            </div>
                          )}

                          {/* Compact Elegant Title */}
                          <h1 className="text-2xl font-black text-slate-800 mb-1 tracking-tight text-center">
                            Literature Review Auditor
                          </h1>
                          <p className="text-slate-500 text-xs font-medium max-w-md text-center mb-5 leading-relaxed transition-all">
                            {activeWorkflow === 'report' ? 'Generate a publication-ready manuscript with sentence-level citations.' :
                             activeWorkflow === 'systematic' ? 'Automate data extraction and PRISMA-ready synthesis.' :
                             activeWorkflow === 'research' ? 'Identify trends and explore literature across global databases.' :
                             'Discuss and analyze your selected library papers.'}
                          </p>

                           {/* Integrated Card with Header */}
                          <div className="w-full rounded-xl shadow-md border border-slate-200">
                            {/* Card Header — Workflow Selector */}
                            <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between rounded-t-xl">
                              <div className="relative">
                                <select
                                  value={activeWorkflow}
                                  onChange={(e) => setActiveWorkflow(e.target.value)}
                                  className="appearance-none bg-slate-700/60 hover:bg-slate-700 text-[11px] font-black text-slate-200 pl-2.5 pr-7 py-1.5 rounded-md focus:outline-none cursor-pointer transition-colors border border-slate-600/50"
                                >
                                  <option value="research">🔬 Research Agent</option>
                                  <option value="report" disabled={userTier === 'free'}>📄 Research Report {userTier === 'free' ? '🔒' : ''}</option>
                                  <option value="systematic">📋 Semantic Review</option>
                                  <option value="chat">💬 Chat with papers</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                              <div className="h-4 w-px bg-slate-700/50 hidden sm:block" />
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline ml-auto">ScholarHub V5</span>
                            </div>

                            {/* Card Body — Textarea */}
                            <div className="bg-white p-4 flex flex-col gap-2 rounded-b-xl min-w-0 max-w-full relative">
                              <div className="flex items-start min-w-0 max-w-full">
                                <textarea
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleQuerySubmit(e);
                                    }
                                  }}
                                  placeholder="Enter your research query (e.g. Compare the efficacy of digital restorations vs traditional techniques...)"
                                  className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none resize-none min-h-[80px] leading-relaxed w-full min-w-0 break-words whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word]"
                                />
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  {/* Minimalist Attach + Button */}
                                  <div className="relative shrink-0" ref={attachmentMenuRef}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAttachmentMenu(!showAttachmentMenu);
                                      }}
                                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                                    >
                                      <Plus size={16} />
                                    </button>
                                    
                                    {/* Popover Menu */}
                                    <AnimatePresence>
                                      {showAttachmentMenu && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                          className="absolute bottom-full left-0 mb-3 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-[60] flex flex-col overflow-hidden"
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowAttachmentMenu(false);
                                              document.getElementById('pdf-file-input')?.click();
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                                          >
                                            <Paperclip size={14} className="text-slate-400" />
                                            Attach file
                                          </button>
                                          {activeWorkflow !== 'research' && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setShowAttachmentMenu(false);
                                                setShowLibraryModal(true);
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
                                  {/* Effort Selector Popover */}
                                  <div className="relative shrink-0" ref={effortMenuRef}>
                                    <button
                                      type="button"
                                      onClick={() => setShowEffortMenu(!showEffortMenu)}
                                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm"
                                    >
                                      {researchEffort === 'standard' ? 'Standard ⚡' : researchEffort === 'advanced' ? 'Advanced ✨' : 'Deep 🧠'}
                                    </button>
                                    <AnimatePresence>
                                      {showEffortMenu && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute bottom-full right-0 mb-3 w-56 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl py-2 z-[60] flex flex-col"
                                        >
                                          <button
                                            type="button"
                                            onClick={() => { setResearchEffort('standard'); setShowEffortMenu(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex flex-col"
                                          >
                                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Standard ⚡</span>
                                            <span className="text-[10px] text-slate-500 mt-0.5">50 Zaps • Quick answers</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { setResearchEffort('advanced'); setShowEffortMenu(false); }}
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
                                              setResearchEffort('deep');
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

                                  {/* Hidden File Input for PDF Upload */}
                                  <input
                                    id="pdf-file-input"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfFileUpload}
                                    className="hidden"
                                  />

                                  {/* Voice Recognition (Mic) Button */}
                                  <button
                                    type="button"
                                    onClick={toggleVoiceRecognition}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${isListening ? 'text-red-500 border-red-200 bg-red-50 animate-pulse shadow-sm shadow-red-500/20' : 'text-slate-500 border-slate-200/60 hover:text-slate-800 hover:bg-slate-100'}`}
                                    title="Voice Dictation"
                                  >
                                    <Mic size={16} />
                                  </button>

                                  {/* Submit Button */}
                                  <button
                                    type="submit"
                                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer shadow flex items-center justify-center"
                                  >
                                    <Search size={15} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* PDF Upload Progress Overlay Bar */}
                          {uploadingPdf && (
                            <div className="w-full mt-3 p-3 bg-cyan-950/90 text-cyan-200 border border-cyan-800/80 rounded-xl shadow-lg flex flex-col gap-1.5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="flex items-center gap-2">
                                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                                  Parsing & Vectorizing PDF Chunks...
                                </span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-cyan-900/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-400 transition-all duration-300 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Attached PDFs Context Bar */}

                          {attachedFiles.length > 0 && (
                            <div className="w-full mt-3 py-2 px-3.5 bg-white text-[#171717] border border-[#E5E5DF] rounded-[12px] flex flex-wrap items-center justify-between gap-2 shadow-sm">
                              <div className="flex items-center gap-2">
                                <FileText size={14} className="text-cyan-400 shrink-0" />
                                <span className="text-xs font-bold text-[#171717]">
                                  {attachedFiles.length} PDF{attachedFiles.length > 1 ? 's' : ''} Vectorized in RAG Memory
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {attachedFiles.map((att, idx) => (
                                  <div key={att.id || att.name || `att-${idx}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F3F3EF] border border-[#E5E5DF] rounded-[8px] text-[10px] text-indigo-600 font-medium">
                                    <span className="font-bold truncate max-w-[130px]">{att.name}</span>
                                    <span className="text-[9px] text-slate-400">({att.pages || 1}p)</span>
                                    {(att.chunks > 0 || att.figures > 0 || true) && (
                                      <button
                                        type="button"
                                        onClick={() => openResearchGallery(att.id, att.name)}
                                        className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                        title="Open Visual Research Gallery"
                                      >
                                        <ImageIcon size={10} /> Gallery
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setAttachedFiles(prev => prev.filter(f => f.name !== att.name))}
                                      className="text-slate-400 hover:text-red-400 p-0.5 rounded cursor-pointer"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>

                            </div>
                          )}

                          {/* Phase 12 Research Gallery Lightbox Modal */}
                          <AnimatePresence>
                            {galleryOpen && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                              >
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="bg-white border border-[#E5E5DF] rounded-[12px] w-full 2xl:px-12 w-full p-6 space-y-6 shadow-md text-[#171717] max-h-[85vh] flex flex-col"
                                >
                                  <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-4">
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="text-cyan-400" size={20} />
                                      <h3 className="text-sm font-black uppercase tracking-wider text-[#171717]">Research Gallery — {activeGalleryTitle}</h3>
                                    </div>
                                    <button
                                      onClick={() => setGalleryOpen(false)}
                                      className="p-1.5 text-slate-700 hover:text-[#171717] rounded-lg hover:bg-[#F3F3EF] transition-all"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                    {galleryFigures.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic">No visual figures extracted for this document.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {galleryFigures.map((fig, i) => (
                                          <div key={fig.id || fig.title || `fig-${i}`} className="bg-[#F3F3EF]/60 border border-[#E5E5DF] rounded-[12px] p-4 space-y-3 overflow-hidden">
                                            {fig.image_url ? (
                                              <img
                                                src={fig.image_url}
                                                alt={fig.title}
                                                className="w-full h-44 object-cover rounded-[8px] border border-[#E5E5DF] bg-[#F3F3EF]"
                                              />
                                            ) : (
                                              <div className="w-full h-44 rounded-[8px] border border-dashed border-[#E5E5DF] bg-[#F3F3EF] flex flex-col items-center justify-center text-center p-4">
                                                <ImageIcon size={28} className="text-slate-400 mb-2" />
                                                <span className="text-xs font-bold text-slate-500">Visual data for this figure could not be extracted</span>
                                              </div>
                                            )}
                                            <div>
                                              <span className="text-xs font-bold text-cyan-400 block">{fig.title}</span>
                                              <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">{fig.caption}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>


                          {/* Context Bar below Search input */}
                          {activeWorkflow !== 'research' && activePapers.length > 0 && (
                            <div className="w-full mt-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="text-xs font-bold text-slate-700">
                                  Using {activePapers.length} papers as context
                                </span>
                              </div>

                              {/* Active paper titles tag list */}
                              <div className="flex flex-wrap gap-1.5">
                                {activePapers.map((p, idx) => (
                                  <div key={p.pmid || p.id || p.doi || `active-p-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 max-w-[120px]">
                                    <span className="truncate">{p.title}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePaper(p.pmid || p.id || idx)}
                                      className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer transition-colors"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </form>
                      )}
                    </>
                  )}

                  {/* ─── Academic Mastery Suite Quick Launch Strip (Pre-chat) ─── */}
                  {!isRefining && (
                    <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsStatsModalOpen(true)}
                        className="px-3.5 py-2 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Calculator size={14} className="text-indigo-600" />
                        <span>Biostatistics Test Advisor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsDisclosureModalOpen(true)}
                        className="px-3.5 py-2 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>AI Ethics Disclosure Generator</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPitchModalOpen(true)}
                        className="px-3.5 py-2 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/80 text-purple-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Mic size={14} className="text-purple-600" />
                        <span>Scientific Pitch & 3MT Suite</span>
                      </button>
                    </div>
                  )}

                  {/* ─── Action Cards Grid (visible only pre-chat) ─── */}
                  {!isRefining && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.15 }}
                      className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
                    >
                      {/* Card 1: Resume */}
                      {latestHistorySession ? (
                        <button
                          onClick={() => {
                            setSessionId(latestHistorySession.id);
                            setActivePapers(latestHistorySession.papers || []);
                            setMessages(latestHistorySession.chat_history || []);
                            setChatInitiated(true);
                            setActiveWorkflow(latestHistorySession.workflow || 'research');
                            setShowRightPane(true);
                          }}
                          className="group bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 text-left shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-2"
                        >
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit">🕒 Resume</span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 line-clamp-2 leading-snug">
                            {latestHistorySession.title || 'Untitled Session'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {latestHistorySession.updated_at
                              ? new Date(latestHistorySession.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                              : 'Recent session'}
                          </span>
                        </button>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm opacity-60">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">🕒 Resume</span>
                          <span className="text-xs font-medium text-slate-400 leading-snug">No recent sessions</span>
                          <span className="text-[10px] text-slate-300 font-medium">Start a new audit to build history</span>
                        </div>
                      )}

                      {/* Card 2: Suggested */}
                      <button
                        onClick={() => {
                          setQuery('Efficacy of CAR-T cell therapy in relapsed/refractory B-cell lymphoma');
                          handleQuerySubmit(null, 'Efficacy of CAR-T cell therapy in relapsed/refractory B-cell lymphoma');
                        }}
                        className="group bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 text-left shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-2"
                      >
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">💡 Suggested</span>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 line-clamp-2 leading-snug">
                          Efficacy of CAR-T cell therapy in relapsed B-cell lymphoma
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Immunology · Oncology</span>
                      </button>

                      {/* Card 3: Suggested */}
                      <button
                        onClick={() => {
                          setQuery('Machine learning approaches for early detection of Alzheimer\'s disease biomarkers');
                          handleQuerySubmit(null, 'Machine learning approaches for early detection of Alzheimer\'s disease biomarkers');
                        }}
                        className="group bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 text-left shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-2"
                      >
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">💡 Suggested</span>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 line-clamp-2 leading-snug">
                          ML approaches for early Alzheimer's disease biomarker detection
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Neuroscience · AI</span>
                      </button>
                    </motion.div>
                  )}

                </motion.div>
              )}

              {/* 2. SPLIT-VIEW RESULT VIEW */}
              {chatInitiated && (
                <motion.div
                  key="split-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-0 overflow-y-auto lg:overflow-hidden h-full w-full px-4 lg:px-0 pb-4 lg:pb-0"
                >

                  {/* Left Pane: Conversation */}
                  <div className={`flex flex-col relative overflow-hidden h-[80dvh] lg:h-full bg-slate-50/50 transition-all duration-300 rounded-2xl lg:rounded-none shrink-0 lg:shrink ${showRightPane && !isMobile ? 'lg:w-[60%] lg:flex-none' : 'w-full lg:flex-1'}`}>
                    {/* Conversation Header (Sleek Single Horizontal Row on Mobile) */}
                    <div className="px-3 sm:px-6 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0 relative z-50">
                      {/* Left: Active Workflow Badge */}
                      <div className="bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl select-none flex items-center gap-1.5 shadow-2xs">
                        {activeWorkflow === 'research' && <><span>🔬</span> <span className="hidden xs:inline">Research Agent</span><span className="xs:hidden">Agent</span></>}
                        {activeWorkflow === 'report' && <><span>📄</span> <span className="hidden xs:inline">Research Report</span><span className="xs:hidden">Report</span></>}
                        {activeWorkflow === 'systematic' && <><span>📋</span> <span className="hidden xs:inline">Systematic Review</span><span className="xs:hidden">Review</span></>}
                        {activeWorkflow === 'chat' && <><span>💬</span> <span className="hidden xs:inline">Chat with papers</span><span className="xs:hidden">Chat</span></>}
                      </div>

                      {/* Right: Actions Row (Mastery Tools, Share, Export & New Chat) */}
                      <div className="flex items-center gap-1.5 sm:gap-2 relative z-50">
                        {/* Stats Advisor Launcher */}
                        <button
                          onClick={() => setIsStatsModalOpen(true)}
                          title="Statistical Test Selector & APA 7th Reporter (Skill #6)"
                          className="p-2 sm:px-3 sm:py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px]"
                        >
                          <Calculator size={15} className="text-indigo-600" />
                          <span className="hidden xl:inline">Stats Advisor</span>
                        </button>

                        {/* AI Disclosure Launcher */}
                        <button
                          onClick={() => setIsDisclosureModalOpen(true)}
                          title="Generate Publication-Ready AI Ethics & Disclosure Statement (Nature, Elsevier, ICMJE)"
                          className="p-2 sm:px-3 sm:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px]"
                        >
                          <ShieldCheck size={15} className="text-emerald-600" />
                          <span className="hidden xl:inline">AI Disclosure</span>
                        </button>

                        {/* Scientific Pitch Suite Launcher */}
                        <button
                          onClick={() => setIsPitchModalOpen(true)}
                          title="Scientific Pitch & 3-Minute Thesis (3MT) Generator (Skill #10)"
                          className="p-2 sm:px-3 sm:py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px]"
                        >
                          <Mic size={15} className="text-purple-600" />
                          <span className="hidden xl:inline">Pitch Suite</span>
                        </button>

                        {/* Share Button */}
                        {messages.length > 0 && (
                          <button
                            onClick={async () => {
                              if (!sessionId && user) {
                                try {
                                  const sessionPayload = {
                                    user_id: user.id,
                                    title: (messages[0]?.content || 'Research Audit').slice(0, 80),
                                    papers: activePapers,
                                    chat_history: messages,
                                    workflow: activeWorkflow,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                  };
                                  const { data: inserted } = await supabase
                                    .from('audit_history')
                                    .insert(sessionPayload)
                                    .select()
                                    .single();
                                  if (inserted?.id) {
                                    setSessionId(inserted.id);
                                  }
                                } catch (e) {
                                  console.error('Pre-share save error:', e);
                                }
                              }
                              setShowShareModal(true);
                            }}
                            title="Share Research & Collaborate"
                            className="p-2 sm:px-3.5 sm:py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] min-w-[38px]"
                          >
                            <Share2 size={16} className="text-indigo-600" />
                            <span className="hidden md:inline">Share</span>
                          </button>
                        )}

                        {/* Export Report Dropdown */}
                        {messages.length > 0 && (
                          <div className="relative z-50">
                            <button
                              onClick={() => setShowExportMenu(!showExportMenu)}
                              disabled={isExporting}
                              title="Export Report (PDF / Word)"
                              className="p-2 sm:px-3.5 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50 min-h-[38px] min-w-[38px]"
                            >
                              {isExporting ? (
                                <>
                                  <Loader2 size={16} className="animate-spin text-slate-500" />
                                  <span className="hidden md:inline">Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Download size={16} className="text-slate-600" />
                                  <span className="hidden md:inline">Export Report</span>
                                </>
                              )}
                            </button>

                            {showExportMenu && (
                              <>
                                {/* Click Outside Backdrop */}
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setShowExportMenu(false)} 
                                />
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic & Data Exports</span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      const csvData = generateExcelCSV(activePapers);
                                      downloadFile(csvData, `ScholarHub_Papers_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
                                      toast.success('Excel CSV downloaded with full paper metadata!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Export all papers and tables into Excel CSV"
                                  >
                                    <span className="flex items-center gap-2">📊 <span>Excel Spreadsheet (.csv)</span></span>
                                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Excel</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      const bibData = generateBibTeX(activePapers);
                                      downloadFile(bibData, `ScholarHub_Bibliography_${Date.now()}.bib`, 'application/x-bibtex;charset=utf-8;');
                                      toast.success('BibTeX Bibliography downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Export BibTeX for LaTeX, Zotero, & EndNote"
                                  >
                                    <span className="flex items-center gap-2">📚 <span>BibTeX Bibliography (.bib)</span></span>
                                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">BibTeX</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      const risData = generateRIS(activePapers);
                                      downloadFile(risData, `ScholarHub_Citations_${Date.now()}.ris`, 'application/x-research-info-systems;charset=utf-8;');
                                      toast.success('RIS Citations downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Export RIS for Reference Managers"
                                  >
                                    <span className="flex items-center gap-2">🔖 <span>RIS Citation File (.ris)</span></span>
                                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">RIS</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      const apaData = generateAPABibliographyText(activePapers);
                                      downloadFile(apaData, `ScholarHub_APA_Bibliography_${Date.now()}.txt`, 'text/plain;charset=utf-8;');
                                      toast.success('APA 7th Bibliography downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Export formatted APA 7th Bibliography"
                                  >
                                    <span className="flex items-center gap-2">📖 <span>APA Bibliography (.txt)</span></span>
                                    <span className="text-[10px] font-extrabold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded">APA</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      const jsonData = generateStructuredJSON(activePapers, messages[messages.length - 1]?.content || '');
                                      downloadFile(jsonData, `ScholarHub_Payload_${Date.now()}.json`, 'application/json;charset=utf-8;');
                                      toast.success('Structured JSON downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Export raw structured JSON data payload"
                                  >
                                    <span className="flex items-center gap-2">💾 <span>Structured JSON (.json)</span></span>
                                    <span className="text-[10px] font-extrabold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">JSON</span>
                                  </button>

                                  <div className="px-3 py-1.5 border-t border-b border-slate-100 my-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document Formats</span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      generateManuscript('pdf');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Download as PDF document"
                                  >
                                    <span className="flex items-center gap-2">📄 <span>PDF Manuscript (.pdf)</span></span>
                                    <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">PDF</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowExportMenu(false);
                                      generateManuscript('word');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                    title="Download as Word (.docx) document"
                                  >
                                    <span className="flex items-center gap-2">📝 <span>Word Document (.docx)</span></span>
                                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Word</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* New Chat Button */}
                        <button
                          onClick={() => {
                            setSessionId(null);
                            setMessages([]);
                            setChatInitiated(false);
                            setActivePapers([]);
                            setActiveAttachment(null);
                            sessionStorage.removeItem('auditor_sessionId');
                            sessionStorage.removeItem('auditor_messages');
                            sessionStorage.removeItem('auditor_activePapers');
                            sessionStorage.removeItem('auditor_chatInitiated');
                            toast.success('Started a new audit session.');
                          }}
                          title="Start New Chat Session"
                          className="p-2 sm:px-3.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] min-w-[38px]"
                        >
                          <Plus size={16} />
                          <span className="hidden md:inline">New Chat</span>
                        </button>
                      </div>
                    </div>

                    <div 
                      id="auditor-chat-lane" 
                      onScroll={handleChatLaneScroll}
                      onWheel={handleChatLaneWheel}
                      onTouchMove={handleChatLaneTouchMove}
                      className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex flex-col gap-6 custom-scrollbar relative min-w-0 max-w-full"
                    >
                      {messages.map((msg, index) => {
                        const originalIndex = index;
                        const msgKey = msg.id || `msg-${msg.timestamp || ''}-${originalIndex}-${msg.role}`;
                        return (
                          <AuditorChatMessage
                            key={msgKey}
                            msg={msg}
                            originalIndex={originalIndex}
                            isAnalyzing={isAnalyzing}
                            isEditing={editingMsgIndex === index}
                            onStartEdit={() => setEditingMsgIndex(index)}
                            onCancelEdit={() => setEditingMsgIndex(null)}
                            onSaveEdit={(newQuery) => {
                              setEditingMsgIndex(null);
                              isUserScrolledUpRef.current = false;
                              setShowScrollBottomBtn(false);
                              setMessages(prev => prev.slice(0, index));
                              handleQuerySubmit(null, newQuery);
                            }}
                            activePapers={activePapers}
                            onCitationClick={(citationNum) => {
                              const idx = parseInt(citationNum) - 1;
                              const paper = activePapers[idx];
                              if (paper) {
                                setSelectedDetailPaper(paper);
                                setShowRightPane(true);
                                setHighlightedSourceRow(idx);
                                setTimeout(() => {
                                  const element = document.getElementById(`source-row-${idx}`);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 150);
                                setTimeout(() => {
                                  setHighlightedSourceRow(null);
                                }, 4000);
                              }
                            }}
                            onRelevanceClick={(entry) => {
                              if (entry.paper) {
                                setSelectedDetailPaper(entry.paper);
                                setShowRightPane(true);
                                if (entry.paperIdx >= 0) {
                                  setHighlightedSourceRow(entry.paperIdx);
                                  setTimeout(() => {
                                    const el = document.getElementById(`source-row-${entry.paperIdx}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 150);
                                  setTimeout(() => setHighlightedSourceRow(null), 4000);
                                }
                              }
                            }}
                            onRatingFeedback={(rating) => handleRatingFeedback(rating)}
                            onDownloadMarkdown={(content, filename) => {
                              downloadMarkdown(content, filename);
                              toast.success('Response downloaded as markdown.');
                            }}
                            onExportExcel={(content) => handleExportToExcel(content)}
                            showRightPane={showRightPane}
                            onToggleRightPane={() => setShowRightPane(prev => !prev)}
                          />
                        );
                      })}

                      {isAnalyzing && (
                        <div className="w-full w-full 2xl:px-12 mx-auto flex flex-col gap-2">
                          <div className="flex flex-col gap-1.5 items-start w-full">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              Research Agent
                              {researchEffort === 'deep' && (
                                <span className="bg-slate-900/10 text-slate-700 px-1.5 py-0.5 rounded text-[10px] tracking-widest font-black flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" /> Deep Tier
                                </span>
                              )}
                            </span>
                            
                            {researchEffort === 'deep' ? (
                              <div className="p-5 bg-slate-900/5 backdrop-blur-sm border border-slate-200/50 rounded-2xl rounded-tl-none max-w-[90%] w-full shadow-sm space-y-4">
                                <div className="flex flex-col items-center justify-center gap-4 py-4">
                                  <Loader2 size={24} className="animate-spin text-slate-500" />
                                  <div className="flex flex-col items-center text-center">
                                    <span className="text-slate-800 font-semibold tracking-wide text-sm">{activeStep}</span>
                                    <span className="text-slate-400 text-xs font-mono mt-1">{(typeof thinkingTime === 'number' ? thinkingTime : 0).toFixed(1)}s elapsed</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-5 bg-white border border-slate-200 rounded-2xl rounded-tl-none max-w-[90%] w-full shadow-sm space-y-3.5">
                                <div className="flex items-center gap-3">
                                  {searchStatus === 'searching' ? (
                                    <Sparkles size={15} className="animate-spin text-emerald-600 shrink-0" />
                                  ) : (
                                    <Check size={14} className="text-emerald-600 font-black shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${searchStatus === 'searching' ? 'text-slate-900' : 'text-slate-500'}`}>
                                      1. Cognitive Intent Analysis & Entity Extraction
                                    </span>
                                    {cognitiveInfo?.main_entity ? (
                                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                          Entity: {cognitiveInfo.main_entity}
                                        </span>
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                          Intent: {cognitiveInfo.intent}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-mono">
                                        {cognitiveStep || 'Analyzing research objective...'}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                                  {searchStatus === 'searching' ? (
                                    <RefreshCw size={14} className="animate-spin text-slate-600 shrink-0" />
                                  ) : (
                                    <Check size={14} className="text-emerald-600 font-black shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${searchStatus === 'searching' ? 'text-slate-900' : 'text-slate-500'}`}>
                                      2. Pluggable Multi-Database Retrieval
                                    </span>
                                    {cognitiveInfo?.total_retrieved !== undefined && (
                                      <span className="text-xs text-slate-400 font-mono">
                                        Retrieved {cognitiveInfo.total_retrieved} documents across 12 academic sources
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                                  {searchStatus === 'searching' ? (
                                    <Sparkles size={14} className="animate-pulse text-amber-500 shrink-0" />
                                  ) : (
                                    <Check size={14} className="text-emerald-600 font-black shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${searchStatus === 'searching' ? 'text-slate-900' : 'text-slate-500'}`}>
                                      3. Ruthless Relevance Scoring & Entity Validation
                                    </span>
                                    {cognitiveInfo?.total_validated !== undefined ? (
                                      <div className="flex items-center gap-2 text-xs font-medium">
                                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                          Validated {cognitiveInfo.total_validated} high-relevance papers
                                        </span>
                                        {cognitiveInfo.rejected_count > 0 && (
                                          <span className="text-slate-400 font-normal">
                                            (Filtered {cognitiveInfo.rejected_count} off-topic)
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-mono">
                                        Filtering irrelevant documents...
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                                  {searchStatus === 'analyzing' ? (
                                    <Sparkles size={14} className="animate-spin text-emerald-600 shrink-0" />
                                  ) : (
                                    <Check size={14} className="text-emerald-600 font-black shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${searchStatus === 'analyzing' ? 'text-slate-900' : 'text-slate-400'}`}>
                                      4. Evidence Synthesis & Context Map Building
                                    </span>
                                    {cognitiveInfo?.total_papers_in_context ? (
                                      <span className="text-xs text-slate-500 font-mono">
                                        Synthesized {cognitiveInfo.total_papers_in_context} papers into structured Context Map
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-mono">
                                        Synthesizing research evidence & building context...
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                                  {searchStatus === 'analyzing' ? (
                                    <RefreshCw size={14} className="animate-spin text-slate-600 shrink-0" />
                                  ) : (
                                    <Check size={14} className="text-emerald-600 font-black shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${searchStatus === 'analyzing' ? 'text-slate-900' : 'text-slate-400'}`}>
                                      5. Grounded AI Generation & Hallucination Guard
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                      Generating grounded research response & applying citation anchors
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                                  {searchStatus === 'analyzing' ? (
                                    <Sparkles size={14} className="animate-pulse text-indigo-600 shrink-0" />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">6</span>
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${searchStatus === 'analyzing' ? 'text-slate-900' : 'text-slate-400'}`}>
                                      6. Adaptive Visualization Planning & Chart Routing
                                    </span>
                                    {cognitiveInfo?.viz_plan ? (
                                      <span className="text-xs text-slate-500 font-mono">
                                        {cognitiveInfo.viz_plan.should_visualize 
                                          ? `Rendering ${cognitiveInfo.viz_plan.engine} (${cognitiveInfo.viz_plan.type}) diagram`
                                          : 'Visual skipped: pure narrative response selected'}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-mono">
                                        Planning adaptive research visualizations & analytical diagrams...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {showDynamicSuggestions && (
                        <FollowUpSection 
                          suggestions={latestSuggestions} 
                          onSelect={(s) => handleQuerySubmit(null, s)} 
                        />
                      )}

                      <div ref={messagesEndRef} />

                      {/* Floating Jump to Latest Button when User is Scrolled Up */}
                      {showScrollBottomBtn && (
                        <button
                          type="button"
                          onClick={() => {
                            isUserScrolledUpRef.current = false;
                            setShowScrollBottomBtn(false);
                            scrollToBottom(true);
                          }}
                          className="sticky bottom-4 ml-auto mr-4 z-40 px-3.5 py-2 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold animate-fadeIn hover:scale-105 backdrop-blur-md"
                          title="Jump to latest message"
                        >
                          <ChevronDown size={14} className="text-indigo-600 animate-bounce" />
                          <span className="text-[11px] font-bold">Jump to latest</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Input Bar */}
                    <ChatInput 
                      onSubmit={(submittedQuery) => handleQuerySubmit(null, submittedQuery)}
                      activeWorkflow={activeWorkflow}
                      researchEffort={researchEffort}
                      setResearchEffort={setResearchEffort}
                      maxComputeAccess={maxComputeAccess}
                      onOpenLibraryModal={() => setShowLibraryModal(true)}
                      onPdfUpload={handlePdfUpload}
                      uploadingPdf={uploadingPdf}
                      uploadMeta={uploadMeta}
                      attachedFile={activeAttachment}
                      onRemoveAttachment={handleRemoveAttachment}
                      toggleVoiceRecognition={toggleVoiceRecognition}
                      isListening={isListening}
                      isAnalyzing={isAnalyzing || isRequesting.current}
                      onStopGeneration={handleStopGeneration}
                    />
                  </div>

                  {isMobile && showRightPane && (
                    <motion.div
                      key="backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowRightPane(false)}
                      className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[80]"
                    />
                  )}

                  {/* Right Pane: Sources list */}
                  <AnimatePresence>
                    {showRightPane && (
                      <motion.div
                        key="right-pane"
                        initial={isMobile ? { y: '100%' } : { opacity: 0 }}
                        animate={isMobile ? { y: 0 } : { opacity: 1 }}
                        exit={isMobile ? { y: '100%' } : { opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                        className={isMobile
                          ? "fixed inset-x-0 bottom-0 z-[90] h-[85vh] bg-white rounded-t-3xl border-t border-slate-200 flex flex-col shadow-2xl overflow-hidden"
                          : "lg:w-[40%] lg:min-w-[400px] lg:flex-none bg-white border-l border-slate-200/80 flex flex-col h-full relative transition-all duration-350"
                        }
                      >
                        {selectedDetailPaper ? (
                          <div className="absolute inset-0 bg-white z-30 flex flex-col h-full animate-slideIn">
                            {/* Fixed Close Button for Detail Overlay */}
                            <button
                              onClick={() => setSelectedDetailPaper(null)}
                              className="absolute top-4 right-4 z-40 p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer border border-slate-200/60 bg-white shadow-sm flex items-center justify-center"
                              title="Back to sources list"
                            >
                              <X size={18} />
                            </button>

                            <div className="p-4 pr-16 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
                              <span className="text-base font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                Paper Details
                                {(selectedDetailPaper.verified_metadata || selectedDetailPaper.full_metadata?.verified_metadata || selectedDetailPaper.sources?.length > 1 || selectedDetailPaper.full_metadata?.sources?.length > 1) && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-750 text-[9px] font-black uppercase tracking-wider shadow-sm normal-case animate-fadeIn">
                                    <CheckCircle size={10} className="text-indigo-500" />
                                    Verified
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                              <div>
                                <h2 className="text-base font-bold text-slate-900 leading-snug">
                                  {selectedDetailPaper.title}
                                </h2>
                                {selectedDetailPaper.url && (
                                  <a
                                    href={selectedDetailPaper.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-bold text-slate-800 hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    Open Publisher Page <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 text-xs font-semibold text-slate-600">
                                <div>
                                  <span className="text-slate-400 uppercase block text-[9px] tracking-wider mb-0.5 font-bold">Journal</span>
                                  <span className="text-slate-800 line-clamp-1 font-medium">{selectedDetailPaper.journal || 'Preprint'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 uppercase block text-[9px] tracking-wider mb-0.5 font-bold">Citations</span>
                                  <span className="text-slate-805 font-medium">{selectedDetailPaper.citationCount ?? '—'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 uppercase block text-[9px] tracking-wider mb-0.5 font-bold">Quartile</span>
                                  <span className="text-slate-800 font-medium">{selectedDetailPaper.journal_quartile || '—'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 uppercase block text-[9px] tracking-wider mb-0.5 font-bold">Identifiers</span>
                                  <span className="text-slate-800 font-medium truncate block">
                                    {selectedDetailPaper.pmid ? `PMID: ${selectedDetailPaper.pmid}` : selectedDetailPaper.doi ? `DOI: ${selectedDetailPaper.doi}` : '—'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="text-xs font-bold text-slate-450 uppercase tracking-widest block mb-2">Abstract</span>
                                <div className="text-sm text-slate-650 leading-relaxed font-normal whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                  {selectedDetailPaper.abstract || 'No abstract available.'}
                                </div>
                              </div>

                              {/* Copy Citation */}
                              <button
                                onClick={() => copyCitation(selectedDetailPaper)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <Copy size={16} />
                                Copy Citation
                              </button>

                              {/* Save to Library */}
                              <button
                                onClick={() => {
                                  if (!user) {
                                    toast.error("Please sign in to save papers to your library.");
                                    return;
                                  }
                                  setSelectedSaveAlbumId(null);
                                  setShowLibrarySaveModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md mt-2"
                              >
                                <FolderPlus size={16} />
                                Save to Library
                              </button>
                            </div>
                          </div>
                        ) : null}

                        <div className="p-4 pr-16 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0 gap-2">
                          <span className="text-base font-extrabold uppercase tracking-wider text-slate-700 truncate">
                            Sources ({activePapers.length})
                          </span>
                          <div className="flex items-center gap-2 shrink-0 relative">
                            <button
                              onClick={() => setShowLibraryModal(true)}
                              className="px-2.5 py-2.5 md:px-4 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                              title="Add Sources from Library"
                            >
                              <Plus size={16} /> <span className="hidden sm:inline">Add Source</span>
                            </button>

                            <button
                              onClick={() => setShowSourcesExportMenu(!showSourcesExportMenu)}
                              className="px-2.5 py-2.5 md:px-4 md:py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                              title="Export Sources"
                            >
                              <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Export</span> <ChevronDown size={14} />
                            </button>

                            {showSourcesExportMenu && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSourcesExportMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                                  <button
                                    onClick={() => {
                                      setShowSourcesExportMenu(false);
                                      handleExportSourcesToExcel();
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="flex items-center gap-2">📊 <span>Excel Spreadsheet (.csv)</span></span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowSourcesExportMenu(false);
                                      const bibData = generateBibTeX(activePapers);
                                      downloadFile(bibData, `ScholarHub_Sources_${Date.now()}.bib`, 'application/x-bibtex;charset=utf-8;');
                                      toast.success('BibTeX Bibliography downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="flex items-center gap-2">📚 <span>BibTeX Bibliography (.bib)</span></span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowSourcesExportMenu(false);
                                      const risData = generateRIS(activePapers);
                                      downloadFile(risData, `ScholarHub_Sources_${Date.now()}.ris`, 'application/x-research-info-systems;charset=utf-8;');
                                      toast.success('RIS Citations downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="flex items-center gap-2">🔖 <span>RIS Citation File (.ris)</span></span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowSourcesExportMenu(false);
                                      const apaData = generateAPABibliographyText(activePapers);
                                      downloadFile(apaData, `ScholarHub_Sources_APA_${Date.now()}.txt`, 'text/plain;charset=utf-8;');
                                      toast.success('APA Bibliography downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="flex items-center gap-2">📖 <span>APA Bibliography (.txt)</span></span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowSourcesExportMenu(false);
                                      const jsonData = generateStructuredJSON(activePapers);
                                      downloadFile(jsonData, `ScholarHub_Sources_${Date.now()}.json`, 'application/json;charset=utf-8;');
                                      toast.success('Structured JSON downloaded!');
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="flex items-center gap-2">💾 <span>Structured JSON (.json)</span></span>
                                  </button>
                                </div>
                              </>
                            )}

                          </div>
                        </div>

                        {/* Prominent panel close button (on both mobile and desktop) */}
                        {!selectedDetailPaper && (
                          <button
                            onClick={() => setShowRightPane(false)}
                            className="absolute top-4 right-4 z-50 p-2.5 text-slate-550 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer border border-slate-200/60 bg-white shadow-sm flex items-center justify-center"
                            title="Close sources panel"
                          >
                            <X size={18} />
                          </button>
                        )}

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/20">
                                <th className="px-3 py-2.5 text-slate-450 font-bold uppercase tracking-wider w-8">#</th>
                                <th className="px-3 py-2.5 text-slate-450 font-bold uppercase tracking-wider">Title</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activePapers.map((paper, idx) => (
                                <tr
                                  key={paper.pmid || paper.id || paper.doi || `source-paper-${idx}`}
                                  id={`source-row-${idx}`}
                                  onClick={() => setSelectedDetailPaper(paper)}
                                  className={`border-b border-slate-100 cursor-pointer last:border-b-0 transition-colors ${
                                    highlightedSourceRow === idx
                                      ? 'bg-amber-55 border-amber-300 ring-2 ring-amber-400/50'
                                      : 'hover:bg-slate-50/70'
                                  }`}
                                >
                                  <td className="px-3 py-3 text-slate-400 font-semibold text-center align-top">{idx + 1}</td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-start gap-1.5 group/title">
                                      <span className="text-slate-900 group-hover/title:text-slate-700 font-bold line-clamp-2 leading-snug">
                                        {paper.title}
                                      </span>
                                      {paper.url && (
                                        <a
                                          href={paper.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-slate-455 hover:text-slate-700 transition-colors inline-flex shrink-0 mt-0.5"
                                          title="Open publisher page"
                                        >
                                          <ExternalLink size={14} />
                                        </a>
                                      )}
                                    </div>

                                    <div className="text-sm text-slate-450 mt-1.5 flex flex-wrap gap-x-2 gap-y-1 items-center font-semibold">
                                      {paper.journal_quartile && (
                                        <span className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 font-sans">
                                          {paper.journal_quartile}
                                        </span>
                                      )}
                                      {(paper.source === 'user_attachment' || paper.journal_quartile === 'PDF Vector RAG' || paper.title?.includes('[Uploaded PDF]')) && (
                                        <span className="inline-flex items-center gap-1 h-5 px-2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs" title="Automated session eviction active (30-day vector TTL)">
                                          <Clock size={10} className="text-amber-500 shrink-0" />
                                          Indexed for 30 days of active research
                                        </span>
                                      )}
                                      <span className="truncate max-w-[200px]">{paper.journal || 'Preprint'}</span>
                                      <span>•</span>
                                      <span>Cites: {paper.citationCount ?? '—'}</span>
                                    </div>

                                    <div className="text-sm text-slate-505 mt-2 leading-relaxed font-medium bg-slate-55 p-3 rounded-lg border border-slate-200/40">
                                      {getPaperSummary(paper)}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); copyCitation(paper); }}
                                      className="mt-2.5 inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-slate-200/50 bg-white shadow-sm"
                                      title="Copy citation to clipboard"
                                    >
                                      <Copy size={14} />
                                      Cite
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>

        {/* Modal: Inject saved bookmarks */}
        <AnimatePresence>
          {showLibraryModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl flex flex-col max-h-[80vh] shadow-2xl overflow-hidden text-slate-900"
              >
                <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-slate-700" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Inject Papers from Library
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLibraryModal(false)}
                    className="p-2.5 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-5 pt-4 pb-2 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/20">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search saved papers by title, journal..."
                      value={librarySearchQuery}
                      onChange={(e) => setLibrarySearchQuery(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 focus:border-slate-350 text-sm px-3.5 py-2.5 pl-9 rounded-xl focus:outline-none placeholder-slate-400 font-medium"
                    />
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    {librarySearchQuery && (
                      <button
                        onClick={() => setLibrarySearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Album Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedAlbumId('all')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${selectedAlbumId === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white hover:bg-slate-100 border border-slate-250 text-slate-600'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedAlbumId('general')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${selectedAlbumId === 'general'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white hover:bg-slate-100 border border-slate-250 text-slate-600'
                        }`}
                    >
                      General
                    </button>
                    {albums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => setSelectedAlbumId(album.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${selectedAlbumId === album.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-white hover:bg-slate-100 border border-slate-250 text-slate-600'
                          }`}
                      >
                        {album.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-2.5 max-h-[45vh]" style={{ scrollbarWidth: 'thin' }}>
                  {filteredLibrary.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        No matching papers found.
                      </p>
                    </div>
                  ) : (
                    filteredLibrary.map((paper, idx) => {
                      const isSelected = selectedLibraryPmids.includes(paper.pmid);
                      return (
                        <div
                          key={paper.pmid || paper.id || paper.doi || `lib-paper-${idx}`}
                          onClick={() => toggleLibrarySelection(paper.pmid)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${isSelected
                            ? 'bg-slate-50 border-slate-900 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-650 hover:border-slate-300'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-205 bg-slate-50'
                            }`}>
                            {isSelected && <Check size={10} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold leading-snug line-clamp-2 text-slate-900">{paper.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 truncate font-medium">{paper.journal || 'Unknown Journal'}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-5 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                  <button
                    onClick={() => setShowLibraryModal(false)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-750 text-sm font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLibraryInject}
                    disabled={selectedLibraryPmids.length === 0}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer animate-none"
                  >
                    Inject Selected ({selectedLibraryPmids.length})
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Save to Library */}
        <AnimatePresence>
          {showLibrarySaveModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-slate-900"
              >
                <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <FolderPlus size={18} className="text-slate-700" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Save to Library
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLibrarySaveModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">SELECT ALBUM</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      <button
                        onClick={() => setSelectedSaveAlbumId(null)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedSaveAlbumId === null
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen size={14} className={selectedSaveAlbumId === null ? 'text-blue-400' : 'text-slate-400'} />
                          General (Default)
                        </span>
                        {selectedSaveAlbumId === null && <Check size={14} className="text-blue-400" />}
                      </button>

                      {/* Albums */}
                      {albums.map(album => (
                        <button
                          key={album.id}
                          onClick={() => setSelectedSaveAlbumId(album.id)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedSaveAlbumId === album.id
                              ? 'bg-slate-900 text-white shadow-md'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <FolderPlus size={14} className={selectedSaveAlbumId === album.id ? 'text-blue-400' : 'text-slate-400'} />
                            {album.name}
                          </span>
                          {selectedSaveAlbumId === album.id && <Check size={14} className="text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-500 mb-2">CREATE NEW ALBUM</p>
                    <form onSubmit={handleCreateAlbum} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Album name..."
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2.5 outline-none focus:border-slate-400 text-slate-700"
                      />
                      <button
                        type="submit"
                        disabled={!newAlbumName.trim()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} className="mr-1" /> Create
                      </button>
                    </form>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    onClick={() => setShowLibrarySaveModal(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSaveToLibrary}
                    disabled={isSavingToLibrary}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center shadow-md disabled:opacity-50"
                  >
                    {isSavingToLibrary ? 'Saving...' : 'Confirm Save'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          sessionId={sessionId}
          sessionTitle={messages[0]?.content?.slice(0, 60) || 'Research Audit'}
          user={user}
        />

        {/* Workspace Limit Modal */}
        <AnimatePresence>
          {showWorkspaceLimitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
              onClick={() => setShowWorkspaceLimitModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto relative"
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <span className="text-lg">🗂️</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Workspace Limit Reached</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Storage capacity at maximum</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You have <span className="font-bold text-slate-900">100 of 100</span> audit sessions stored.
                    Please archive or delete older audits from your History to continue saving new research.
                  </p>
                </div>

                {/* Capacity Bar */}
                <div className="px-6 pb-4">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-amber-400 rounded-full" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 text-right">100 / 100 Sessions Used</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowWorkspaceLimitModal(false);
                      navigate('/history');
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Open History
                  </button>
                  <button
                    onClick={() => setShowWorkspaceLimitModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Academic Mastery Suite Modals (10 Pillars of Research) ─── */}
        <StatsAdvisorModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
        />

        <AIDisclosureModal
          isOpen={isDisclosureModalOpen}
          onClose={() => setIsDisclosureModalOpen(false)}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}
          academicField={profile?.academic_field || 'General Research'}
        />

        <ScientificPitchModal
          isOpen={isPitchModalOpen}
          onClose={() => setIsPitchModalOpen(false)}
          defaultTopic={query || (activePapers[0]?.title || '')}
          articles={activePapers}
          academicField={profile?.academic_field || 'General Research'}
        />
      </div>
    </WorkspaceLayout>
  );
};

class AuditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Auditor rendering crash caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-2xl font-black">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-800">Session View Recovered</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              An unexpected display glitch occurred while formatting research references or markdown tags.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem('is_pending_analysis');
                sessionStorage.removeItem('pending_query');
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Reload & Reset Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuditorWithBoundary = (props) => (
  <AuditorErrorBoundary>
    <Auditor {...props} />
  </AuditorErrorBoundary>
);

export default AuditorWithBoundary;
