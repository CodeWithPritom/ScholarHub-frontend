import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna, Activity, Library, User, ChevronDown, ChevronUp, Settings,
  ShieldAlert, LogOut, LogIn, Search, Sparkles, RefreshCcw,
  BookOpen, ArrowUpRight, X, FileDown, Megaphone,
  Mail, FileText, GraduationCap, MessageSquare, Copy, Check,
  Download, FolderPlus, BarChart3, BarChart2, Plus, Loader2, Lock
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { BASE_URL, fireSessionExpired } from './utils/api';
import { getOrCreateDeviceId, ensureDeviceIsRegistered } from './utils/deviceSync';
import Footer from './Footer';
import AuthModal from './AuthModal';
import WorkspaceLayout from './components/WorkspaceLayout';
import { ProUpgradeModal, StarterUpgradeModal, ForceRefreshModal } from './components/UpgradeModals';
import * as XLSX from 'xlsx';

import AIChatWidget from './components/AIChatWidget';
import SearchBar from './components/SearchBar';
import ArticleGrid from './components/ArticleGrid';


const getPortalDetails = (portalId) => {
  switch (portalId) {
    case 'eng': return { name: 'Engineering', source: 'arXiv Engineering Hub' };
    case 'physics': return { name: 'Physics', source: 'Physics Archive' };
    case 'math': return { name: 'Mathematics', source: 'Math Records' };
    case 'social': return { name: 'Social Sciences', source: 'Global Scholar Databases' };
    case 'law': return { name: 'Legal', source: 'Global Scholar Databases' };
    case 'chem': return { name: 'Chemistry', source: 'Chemistry Hub' };
    case 'geb': return { name: 'GEB', source: 'Genetic Engineering Database' };
    case 'pharma': return { name: 'Pharmacy', source: 'Pharmacology Database' };
    default: return { name: 'GEB', source: 'Genetic Engineering Database' };
  }
};

const mapAcademicFieldToPortal = (field) => {
  if (!field) return 'universal';
  const f = field.toLowerCase();
  if (f.includes('genetic') || f.includes('geb') || f.includes('biotech')) return 'geb';
  if (f.includes('pharmacology') || f.includes('pharmacy')) return 'pharma';
  if (f.includes('engineering') || f.includes('cs')) return 'eng';
  if (f.includes('physics')) return 'physics';
  if (f.includes('mathematics') || f.includes('math')) return 'math';
  if (f.includes('social')) return 'social';
  if (f.includes('law') || f.includes('legal')) return 'law';
  if (f.includes('chemistry')) return 'chem';
  return 'universal';
};

// Utility functions for Lit Review Modal
const parseInline = (text) => {
  // Handle bold (**text**) and inline code (`text`)
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-[#171717]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-indigo-700 text-xs rounded font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const renderTextWithLinks = (text, type) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  let linkClass = 'underline hover:opacity-85 transition-opacity font-bold break-all ';
  if (type === 'warning') linkClass += 'text-amber-700';
  else if (type === 'success') linkClass += 'text-green-700';
  else linkClass += 'text-indigo-700';

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass} onClick={(e) => e.stopPropagation()}>{part}</a>;
    }
    
    // Parse markdown double asterisks to bold tag
    if (part && part.includes('**')) {
      const boldParts = part.split(/\*\*([^*]+)\*\*/g);
      return boldParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return <strong key={j} className="font-bold text-[#171717]">{subPart}</strong>;
        }
        return subPart;
      });
    }
    
    return part;
  });
};

const formatMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let buffer = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  const flushBuffer = () => {
    if (buffer.length > 0) {
      const content = buffer.join('\n').trim();
      if (content) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-5 leading-[1.85] text-slate-600 text-[15px]">
            {parseInline(content)}
          </p>
        );
      }
      buffer = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} ml-6 mb-6 space-y-3`}
        >
          {listItems.map((item, j) => (
            <li key={j} className="text-slate-600 text-[15px] leading-[1.85] pl-1">
              {parseInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('### ')) {
      flushBuffer();
      flushList();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-black text-slate-800 mt-8 mb-3 tracking-tight">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushBuffer();
      flushList();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-xl font-black text-[#171717] mt-10 mb-4 pb-2 border-b border-slate-100 tracking-tight">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushBuffer();
      flushList();
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-2xl font-black text-[#171717] mt-10 mb-5 pb-3 border-b-2 border-slate-200 tracking-tight">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Unordered list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushBuffer();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    // Ordered list items
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      flushBuffer();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(olMatch[2]);
      return;
    }

    // Empty line = paragraph break
    if (trimmed === '') {
      flushList();
      flushBuffer();
      return;
    }

    // Normal text
    if (listItems.length > 0) flushList();
    buffer.push(line);
  });

  flushBuffer();
  flushList();
  return elements;
};

const formatMarkdownToHTML = (text) => {
  if (!text) return '';
  let html = text;
  html = html.replace(/^### (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\s*-\s*(.*$)/gim, '<li>$1</li>');

  const paras = html.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    return '<p>' + trimmed + '</p>';
  });
  return paras.join('\n');
};

const exportToPDF = (content) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  let html = '<html><head><title>ScholarHub AI - Literature Review Synthesis</title>';
  html += '<style>';
  html += 'body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }';
  html += 'h1 { font-size: 24px; font-weight: 900; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }';
  html += 'h2 { font-size: 18px; font-weight: 800; margin-top: 32px; margin-bottom: 16px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; }';
  html += 'p { margin-bottom: 16px; font-size: 14px; }';
  html += 'ul { margin-bottom: 16px; padding-left: 20px; }';
  html += 'li { margin-bottom: 8px; font-size: 14px; }';
  html += '.footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; text-align: center; }';
  html += '</style></head><body>';
  html += '<h1>ScholarHub AI - Literature Review Synthesis</h1>';
  html += '<div>' + content + '</div>';
  html += '<div class="footer">Generated by ScholarHub AI Premium</div>';
  html += '<script>window.onload = function() { window.print(); }</script>';
  html += '</body></html>';

  printWindow.document.write(html);
  printWindow.document.close();
};



// Quick-View Sidebar component
const SidePanel = ({ paper, onClose, onChatWithPaper, onFindRelated, userTier }) => {
  const navigate = useNavigate();
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [outreachEmail, setOutreachEmail] = useState('');
  const [outreachError, setOutreachError] = useState('');
  const [outreachCopied, setOutreachCopied] = useState(false);

  const title = paper?.title || 'No Title Available';
  const authors = paper?.authors || 'Authors not listed';
  const abstract = paper?.abstract || 'No abstract text available.';
  const pmid = paper?.pmid || '';

  const handleGenerateOutreach = async (e) => {
    e.stopPropagation();
    if (userTier === 'free') {
      toast.warning('AI Outreach is a premium feature. Please upgrade.');
      return;
    }
    
    setGeneratingOutreach(true);
    setOutreachError('');
    
    try {
      const deviceId = localStorage.getItem('scholarhub_device_id') || getOrCreateDeviceId();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) throw new Error("Authentication required. Please log in.");
      if (!deviceId) throw new Error("Device ID missing. Please refresh.");
      
      const res = await fetch(`${BASE_URL}/ai/generate-outreach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': deviceId || ''
        },
        body: JSON.stringify({
          paper_title: paper.title,
          abstract: paper.abstract || '',
          author_name: paper.full_authors?.[0] || paper.authors?.split(',')[0] || 'Author'
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to generate outreach');
      }
      
      const data = await res.json();
      setOutreachEmail(data.output);
      toast.success('Outreach email drafted!');
    } catch (err) {
      setOutreachError(err.message);
      toast.error(err.message);
    } finally {
      setGeneratingOutreach(false);
    }
  };

  const handleFindProfessor = () => {
    if (paper.author_orcid) {
      window.open(`https://orcid.org/${paper.author_orcid}`, '_blank');
    } else {
      const authorQuery = paper.full_authors?.[0] || paper.authors?.split(',')[0] || '';
      if (authorQuery) {
        window.open(`https://google.com/search?q=${encodeURIComponent(authorQuery + ' university email contact')}`, '_blank');
      } else {
        toast.error('No author information found.');
      }
    }
  };

  const copyOutreach = () => {
    navigator.clipboard.writeText(outreachEmail);
    setOutreachCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setOutreachCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      className="fixed top-0 right-0 bottom-0 z-[110] w-full md:w-[480px] bg-white border-l border-slate-200 text-slate-800 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.15)]"
    >
      {/* Top Header */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-black text-[#171717] leading-snug tracking-tight mb-2 line-clamp-3">
            {title}
          </h3>
          <p className="text-xs font-semibold text-slate-700 line-clamp-2">
            {authors}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-600 border border-slate-200 transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Middle Content Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-[0.2em] mb-3">
            Abstract Overview
          </span>
          <div className="text-sm text-slate-600 leading-relaxed font-medium font-sans">
            {abstract}
          </div>
        </div>

        {/* Dynamic Outreach Box in Sidebar */}
        {outreachEmail && (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Drafted Message</span>
              <button
                onClick={copyOutreach}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-100/50 hover:bg-indigo-200/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200/50"
              >
                {outreachCopied ? <Check size={12} /> : <Copy size={12} />} 
                {outreachCopied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
            <div className="text-xs text-slate-700 whitespace-pre-wrap font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200 max-h-[180px] overflow-y-auto">
              {outreachEmail}
            </div>
          </div>
        )}
        {outreachError && (
          <p className="text-xs font-semibold text-red-500 text-center">{outreachError}</p>
        )}
      </div>

      {/* Bottom Action Hub */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Full Analysis (Primary action) */}
          <button
            onClick={() => navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article: paper } })}
            className="col-span-2 w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FileText size={14} /> Full Analysis
          </button>

          {/* AI Outreach */}
          <button
            onClick={() => navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article: paper, activeFeature: 'outreach' } })}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Mail size={14} />
            AI Outreach
          </button>

          {/* Find Related */}
          <button
            onClick={() => navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article: paper } })}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Search size={14} /> Find Related
          </button>

          {/* Find Professor */}
          <button
            onClick={() => navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article: paper } })}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap size={14} /> Find Professor
          </button>

          {/* Chat with Paper */}
          <button
            onClick={onChatWithPaper}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={14} /> Chat with Paper
          </button>
        </div>
      </div>
    </motion.div>
  );
};



const ResearchPage = ({ user, profile, liveUsersCount, onLogout }) => {
  const navigate = useNavigate();
  const searchAbortControllerRef = useRef(null);
  const resultsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const getStorage = (key, defaultVal, isJson = false) => {
    try {
      const val = sessionStorage.getItem(key);
      if (val === null) return defaultVal;
      return isJson ? JSON.parse(val) : val;
    } catch { return defaultVal; }
  };

  const [selectedPapers, setSelectedPapers] = useState([]);
  const [showAuditDropdown, setShowAuditDropdown] = useState(false);
  const [showLibrarySaveModal, setShowLibrarySaveModal] = useState(false);
  const [libraryAlbums, setLibraryAlbums] = useState([]);
  const [selectedSaveAlbumId, setSelectedSaveAlbumId] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);

  const handleAuditOption = (mode) => {
    setShowAuditDropdown(false);
    if (!selectedPapers || selectedPapers.length === 0) return;

    const userTier = (profile?.tier || profile?.current_tier || 'free').toLowerCase();
    if (mode === 'report' && userTier !== 'starter' && userTier !== 'pro') {
      setShowStarterModal(true);
      toast.info("Full Research Report generation is reserved for Starter and Pro members.");
      return;
    }

    // Clear old chat history and session ID to start clean session for selected papers
    sessionStorage.removeItem('auditor_messages');
    sessionStorage.removeItem('auditor_sessionId');
    sessionStorage.setItem('auditor_activePapers', JSON.stringify(selectedPapers));
    sessionStorage.setItem('auditor_activeWorkflow', mode === 'systematic' ? 'systematic' : mode === 'report' ? 'report' : 'chat');
    sessionStorage.setItem('auditor_autoTrigger', mode);

    navigate('/auditor');
  };

  const handleBatchExportToExcel = () => {
    if (selectedPapers.length === 0) return;
    try {
      const data = selectedPapers.map(p => ({
        Title: p.title || '—',
        Authors: p.authors ? (Array.isArray(p.authors) ? p.authors.join(', ') : p.authors) : '—',
        Journal: p.journal || '—',
        DOI: p.doi || '—',
        Citations: p.citationCount ?? '—',
        Abstract: p.abstract || '—'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Selected Papers");
      
      XLSX.writeFile(wb, "ScholarHub_Batch_Export.xlsx");
      toast.success(`Exported ${selectedPapers.length} papers to Excel successfully!`);
    } catch (err) {
      console.error('Batch Export Error:', err);
      toast.error('Failed to export selected papers to Excel.');
    }
  };

  const fetchLibraryAlbums = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      if (error) throw error;
      setLibraryAlbums(data || []);
    } catch (err) {
      console.error('Error fetching albums:', err);
    }
  };

  useEffect(() => {
    if (showLibrarySaveModal && user) {
      fetchLibraryAlbums();
    }
  }, [showLibrarySaveModal, user]);

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
      setLibraryAlbums(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedSaveAlbumId(data.id);
      toast.success(`Album "${data.name}" created!`);
    } catch (err) {
      console.error('Failed to create album:', err);
      toast.error('Failed to create album.');
    }
  };

  const handleConfirmSaveToLibrary = async () => {
    if (!user) {
      toast.error("Please sign in to save papers.");
      return;
    }
    setIsSavingToLibrary(true);
    try {
      const { count, error: countErr } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (countErr) throw countErr;
      if ((count || 0) + selectedPapers.length > 200) {
        toast.warning("Library limit reached (200 papers). Remove papers to save more.");
        setIsSavingToLibrary(false);
        return;
      }
      let savedCount = 0;
      let skippedCount = 0;

      for (const paper of selectedPapers) {
        const pmid = paper.pmid || 'N/A';
        const title = paper.title || 'No Title Available';
        const journal = paper.journal || 'Unknown Journal';
        
        const { data: existing } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('pmid', pmid)
          .maybeSingle();

        if (existing) {
          skippedCount++;
          continue;
        }

        let finalSource = paper.source;
        if (!finalSource) {
          if (pmid.startsWith('W') || pmid.startsWith('10.')) finalSource = 'scholar';
          else if (journal.toLowerCase().includes('arxiv') || String(pmid).includes('.')) finalSource = 'arxiv';
          else finalSource = 'ncbi';
        }

        const finalUrl = paper.redirection_url || paper.url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
        const insertData = {
          user_id: user.id,
          pmid,
          title,
          journal,
          source: finalSource,
          url: finalUrl,
          full_metadata: paper
        };
        if (selectedSaveAlbumId) {
          insertData.album_id = selectedSaveAlbumId;
        }

        const { error } = await supabase.from('bookmarks').insert(insertData);
        if (error) throw error;
        savedCount++;
      }

      if (savedCount > 0) {
        toast.success(`Saved ${savedCount} papers to library!`);
      } else if (skippedCount > 0) {
        toast.info('Selected papers are already in your library.');
      }
      setSelectedPapers([]);
      setShowLibrarySaveModal(false);
    } catch (err) {
      console.error('Error saving to library:', err);
      toast.error('An error occurred while saving to your library.');
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const handleToggleSelect = (paper) => {
    setSelectedPapers(prev => {
      const exists = prev.some(p => p.pmid === paper.pmid);
      if (exists) {
        return prev.filter(p => p.pmid !== paper.pmid);
      } else {
        return [...prev, paper];
      }
    });
  };

  const [portal, setPortal] = useState(() => {
    const cached = sessionStorage.getItem('active_portal');
    if (cached) return cached;

    const consent = localStorage.getItem('scholarhub_cookie_consent') === 'true';
    if (consent) {
      const saved = localStorage.getItem('last_used_portal');
      if (saved) return saved;
    }

    // Auth Sync: Fallback to user metadata
    const fieldMap = {
      'Genetic Eng. & Biotech (GEB)': 'geb',
      'Pharmacy & Pharmacology': 'pharma',
      'Engineering/CS': 'eng',
      'Engineering': 'eng',
      'Physics': 'physics',
      'Mathematics': 'math',
      'Social Sciences': 'social',
      'Chemistry / Pharmacy': 'chem',
      'Law / Legal Studies': 'law'
    };
    const metadata = user?.user_metadata || {};
    const field = metadata.academic_field || 'Genetic Eng. & Biotech (GEB)';
    return fieldMap[field] || 'universal';
  });

  const [hasSearched, setHasSearched] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return false;
    const val = sessionStorage.getItem(`hasSearched_${p}`);
    return val ? JSON.parse(val) : false;
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return '';
    return sessionStorage.getItem(`searchTerm_${p}`) || '';
  });

  const [lastSearched, setLastSearched] = useState('');
  const [universalFallbackAlert, setUniversalFallbackAlert] = useState(null);

  const [searchCount, setSearchCount] = useState(() => getStorage('searchCount', 0, true));

  const calculateRemaining = (expiryKey) => {
    const expiry = getStorage(expiryKey, 0, true);
    if (!expiry) return 0;
    const remaining = Math.ceil((expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const [cooldownTime, setCooldownTime] = useState(() => calculateRemaining('cooldownExpiry'));
  const [guestCooldown, setGuestCooldown] = useState(() => calculateRemaining('guestCooldownExpiry'));

  const [userTier, setUserTier] = useState('free');
  const [academicField, setAcademicField] = useState('Genetic Eng. & Biotech (GEB)');
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [usageStats, setUsageStats] = useState({ aiSummaries: 0 });

  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const ann = data[0];
          const dismissedId = sessionStorage.getItem('dismissed_announcement');
          if (dismissedId !== ann.id.toString()) {
            setAnnouncement(ann);
          }
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };
    fetchAnnouncement();
  }, []);

  const fetchUserDashboardStats = async () => {
    if (!user) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [bookmarkRes, usageRes] = await Promise.all([
        supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('usage_logs').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('action', 'ai_summary').eq('usage_date', todayStr)
      ]);

      if (!bookmarkRes.error && bookmarkRes.count !== null) {
        setBookmarkCount(bookmarkRes.count);
      }

      if (!usageRes.error && usageRes.count !== null) {
        setUsageStats({ aiSummaries: usageRes.count });
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };


  useEffect(() => {
    if (!user) {
      setUserTier('free');
      setAcademicField('Genetic Eng. & Biotech (GEB)');
      setBookmarkCount(0);
      return;
    }
    const getTierAndProfile = async () => {
      try {
        const { data: profData, error: fetchErr } = await supabase
          .from('profiles')
          .select('academic_field, user_tier')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        let tier = (profData?.user_tier || 'free').toLowerCase();
        let field = profData?.academic_field || user?.user_metadata?.academicField || user?.user_metadata?.academic_field || 'Genetic Eng. & Biotech (GEB)';

        try {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('tier, expires_at')
            .eq('user_id', user.id)
            .maybeSingle();

          if (subData) {
            if (subData.expires_at && new Date() > new Date(subData.expires_at)) {
              tier = 'free';
            } else if (subData.tier && subData.tier !== 'free') {
              tier = subData.tier.toLowerCase();
            }
          }
        } catch (subErr) {
          console.error("Error fetching subscription expiry:", subErr);
        }

        setUserTier(tier);
        setAcademicField(field);

        // Frontend Sync: Manage session portal based on consent
        setPortal(prev => {
          const consent = localStorage.getItem('scholarhub_cookie_consent') === 'true';
          let proPortal = prev || mapAcademicFieldToPortal(field);

          if (consent) {
            const stored = localStorage.getItem('last_used_portal');
            if (stored) proPortal = stored;
          }
          if (prev !== proPortal) {
            sessionStorage.setItem('active_portal', proPortal);
            setTimeout(() => hydratePortalState(proPortal), 0);
            return proPortal;
          }
          if (!prev) {
            const def = mapAcademicFieldToPortal(field);
            sessionStorage.setItem('active_portal', def);
            setTimeout(() => hydratePortalState(def), 0);
            return def;
          }
          return prev;
        });
      } catch (err) {
        console.error("Error fetching tier/profile:", err);
        setProfileError("Database connection issue. Fallback profile loaded.");

        const metadata = user?.user_metadata || {};
        const field = metadata.academicField || metadata.academic_field || 'Genetic Eng. & Biotech (GEB)';

        setUserTier('free');
        setAcademicField(field);

        setPortal(prev => {
          const def = mapAcademicFieldToPortal(field);
          if (!prev) {
            sessionStorage.setItem('active_portal', def);
            setTimeout(() => hydratePortalState(def), 0);
            return def;
          }
          return prev;
        });
      }
    };
    getTierAndProfile();

    fetchUserDashboardStats();

    // Force re-fetch every 5 minutes
    const intervalId = setInterval(() => {
      getTierAndProfile();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && userTier && portal) {
      const url = new URL(window.location);
      url.searchParams.delete('q');
      window.history.replaceState({}, document.title, url.pathname + url.search);
      setSearchTerm(query);
      searchPubMed(null, query);
    }
  }, [userTier, portal]);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [litReviewModalOpen, setLitReviewModalOpen] = useState(false);
  const [litReviewLoading, setLitReviewLoading] = useState(false);
  const [litReviewContent, setLitReviewContent] = useState('');
  const [proUnlockModalOpen, setProUnlockModalOpen] = useState(false);
  const [starterUnlockModalOpen, setStarterUnlockModalOpen] = useState(false);
  const [proModalReason, setProModalReason] = useState('lit_review');
  const [litReviewStep, setLitReviewStep] = useState('');
  const [litReviewProgress, setLitReviewProgress] = useState(0);
  const [litReviewTitle, setLitReviewTitle] = useState('Literature Review Synthesis');
  const [cachedLitReview, setCachedLitReview] = useState(null);
  const [cachedGapAnalysis, setCachedGapAnalysis] = useState(null);

  const handleGapAnalysisClick = async () => {
    if (userTier !== 'pro') {
      setProModalReason('lit_review');
      setProUnlockModalOpen(true);
      return;
    }

    const currentKey = articles.slice(0, 15).map(art => art.pmid || art.title).join('|');

    setLitReviewTitle('Research Gap Analysis');
    setLitReviewModalOpen(true);

    if (cachedGapAnalysis && cachedGapAnalysis.key === currentKey) {
      setLitReviewLoading(false);
      setLitReviewContent(cachedGapAnalysis.content);
      return;
    }

    setLitReviewLoading(true);
    setLitReviewContent('');
    setLitReviewStep('AI is analyzing research gaps...');
    setLitReviewProgress(10);

    try {
      const steps = [
        { text: 'Identifying conflicting methodologies...', prog: 30, delay: 1000 },
        { text: 'Evaluating limitations in current studies...', prog: 60, delay: 2200 },
        { text: 'Highlighting unexplored theoretical frameworks...', prog: 85, delay: 3500 },
        { text: 'Formulating actionable future directions...', prog: 95, delay: 4800 },
        { text: 'AI is reading deep into the papers, please bear with us...', prog: 98, delay: 20000 }
      ];

      steps.forEach(({ text, prog, delay }) => {
        setTimeout(() => {
          setLitReviewStep(text);
          setLitReviewProgress(prog);
        }, delay);
      });

      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout
      const deviceId = getOrCreateDeviceId();

      const response = await fetch(`${BASE_URL}/ai/gap-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-Device-ID': deviceId
        },
        body: JSON.stringify({
          articles: articles.slice(0, 15).map(art => ({
            title: art.title,
            abstract: art.abstract || ''
          })),
          portal: portal || 'universal'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 402) {
          handle402Expiry();
          throw new Error('Premium session expired.');
        }
        let errMsg = 'Failed to generate gap analysis. Please try again.';
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
          else if (errData.detail) errMsg = errData.detail;

          if (typeof errMsg === 'string' && errMsg.includes('Device ID not registered')) {
            errMsg = 'This device is not registered. Please manage your devices in the Profile page.';
          }
        } catch { /* ignore parsing errors */ }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setLitReviewContent(data.output);
      setCachedGapAnalysis({ key: currentKey, content: data.output });
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') {
        setLitReviewContent('Error: The AI analysis took too long (over 90 seconds). Please try again with fewer articles or later.');
      } else if (err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('token') || err.message?.includes('413')) {
        setLitReviewContent('The selected research papers contain too much data. Please try again, and our system will auto-optimize the content.');
      } else {
        setLitReviewContent('Error: ' + err.message);
      }
    } finally {
      setLitReviewLoading(false);
    }
  };

  const handleLitReviewClick = async () => {
    if (userTier !== 'pro') {
      setProModalReason('lit_review');
      setProUnlockModalOpen(true);
      return;
    }

    const currentKey = articles.slice(0, 15).map(art => art.pmid || art.title).join('|');

    setLitReviewTitle('Literature Review Synthesis');
    setLitReviewModalOpen(true);

    if (cachedLitReview && cachedLitReview.key === currentKey) {
      setLitReviewLoading(false);
      setLitReviewContent(cachedLitReview.content);
      return;
    }

    setLitReviewLoading(true);
    setLitReviewContent('');
    setLitReviewStep('AI is synthesizing global research data...');
    setLitReviewProgress(10);

    try {
      const steps = [
        { text: 'Scanning methodology and design choices...', prog: 30, delay: 1000 },
        { text: 'Comparing cohort sizes and controls...', prog: 60, delay: 2200 },
        { text: 'Formulating critical research gap analysis...', prog: 85, delay: 3500 },
        { text: 'Finalizing academic synthesis...', prog: 95, delay: 4800 },
        { text: 'Synthesis is taking longer than expected. Please try with fewer papers or check your connection.', prog: 98, delay: 40000 }
      ];

      steps.forEach(({ text, prog, delay }) => {
        setTimeout(() => {
          setLitReviewStep(text);
          setLitReviewProgress(prog);
        }, delay);
      });

      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

      const deviceId = getOrCreateDeviceId();
      const response = await fetch(`${BASE_URL}/ai/literature-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-Device-ID': deviceId
        },
        body: JSON.stringify({
          articles: articles.slice(0, 15).map(art => ({
            title: art.title,
            abstract: art.abstract || ''
          })),
          portal: portal || 'universal'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 402) {
          handle402Expiry();
          throw new Error('Premium session expired.');
        }
        let errMsg = 'Failed to generate literature review. Please try again.';
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
          else if (errData.detail) errMsg = errData.detail;

          if (typeof errMsg === 'string' && errMsg.includes('Device ID not registered')) {
            errMsg = 'This device is not registered. Please manage your devices in the Profile page.';
          }
        } catch { /* ignore parsing errors */ }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setLitReviewContent(data.output);
      setCachedLitReview({ key: currentKey, content: data.output });
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') {
        setLitReviewContent('Error: Synthesis is taking longer than expected. Please try with fewer papers or check your connection.');
      } else if (err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('token') || err.message?.includes('413')) {
        setLitReviewContent('The selected research papers contain too much data. Please try again, and our system will auto-optimize the content.');
      } else {
        setLitReviewContent('Error: ' + err.message);
      }
    } finally {
      setLitReviewLoading(false);
    }
  };

  const [articles, setArticles] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return [];
    const val = sessionStorage.getItem(`results_${p}`);
    return val ? JSON.parse(val) : [];
  });

  const [resultLimit, setResultLimit] = useState(50);

  const [startDate, setStartDate] = useState(() => getStorage('startDate', ''));
  const [endDate, setEndDate] = useState(() => getStorage('endDate', ''));
  const [sortBy, setSortBy] = useState(() => getStorage('sortBy', 'relevance'));

  const [globalLatestPaper, setGlobalLatestPaper] = useState(null);
  const [globalLatestLoading, setGlobalLatestLoading] = useState(true);

  const [aiPromptVisible, setAiPromptVisible] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return false;
    const val = sessionStorage.getItem(`aiPromptVisible_${p}`);
    return val ? JSON.parse(val) : false;
  });
  const [aiChatOpen, setAiChatOpen] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return false;
    const val = sessionStorage.getItem(`aiChatOpen_${p}`);
    return val ? JSON.parse(val) : false;
  });
  const [aiThinking, setAiThinking] = useState(false);
  const [aiSummary, setAiSummary] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return '';
    return sessionStorage.getItem(`aiSummary_${p}`) || '';
  });
  const [aiStep, setAiStep] = useState('');
  const [aiProgress, setAiProgress] = useState(0);
  const [aiWidgetMode, setAiWidgetMode] = useState(() => getStorage('aiWidgetMode', 'normal'));
  const [isAiLimitReached, setIsAiLimitReached] = useState(false);

  const [chatHistory, setChatHistory] = useState(() => {
    const p = sessionStorage.getItem('active_portal');
    if (!p) return [];
    const val = sessionStorage.getItem(`chatHistory_${p}`);
    return val ? JSON.parse(val) : [];
  });
  const [chatInput, setChatInput] = useState('');

  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [showExpiryToast, setShowExpiryToast] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const handle402Expiry = () => {
    setUserTier('free');
    sessionStorage.clear();
    setResultLimit(50);
    setPortal(portal || 'universal');
    setShowExpiryToast(true);
    setTimeout(() => setShowExpiryToast(false), 5000);

    // Fire global event → App.jsx downgrades profile.tier to 'free' + redirects to /pricing
    fireSessionExpired('Your premium session has expired. Please renew to continue using Pro features.');
  };

  const hydratePortalState = (newPortal) => {
    const loadedArticles = sessionStorage.getItem(`results_${newPortal}`);
    setArticles(loadedArticles ? JSON.parse(loadedArticles) : []);

    setSearchTerm(sessionStorage.getItem(`searchTerm_${newPortal}`) || '');
    setAiSummary(sessionStorage.getItem(`aiSummary_${newPortal}`) || '');

    const loadedHistory = sessionStorage.getItem(`chatHistory_${newPortal}`);
    setChatHistory(loadedHistory ? JSON.parse(loadedHistory) : []);

    const loadedSearched = sessionStorage.getItem(`hasSearched_${newPortal}`);
    setHasSearched(loadedSearched ? JSON.parse(loadedSearched) : false);

    const loadedPrompt = sessionStorage.getItem(`aiPromptVisible_${newPortal}`);
    setAiPromptVisible(loadedPrompt ? JSON.parse(loadedPrompt) : false);

    const loadedChat = sessionStorage.getItem(`aiChatOpen_${newPortal}`);
    setAiChatOpen(loadedChat ? JSON.parse(loadedChat) : false);
  };

  const handlePortalSwitch = (newPortal) => {
    // a) Save current portal's data to its specific key in sessionStorage
    try {
      const currentP = portal;
      if (currentP) {
        sessionStorage.setItem(`results_${currentP}`, JSON.stringify(articles));
        sessionStorage.setItem(`searchTerm_${currentP}`, searchTerm);
        sessionStorage.setItem(`aiSummary_${currentP}`, aiSummary);
        sessionStorage.setItem(`hasSearched_${currentP}`, JSON.stringify(hasSearched));
        sessionStorage.setItem(`aiPromptVisible_${currentP}`, JSON.stringify(aiPromptVisible));
        sessionStorage.setItem(`aiChatOpen_${currentP}`, JSON.stringify(aiChatOpen));
        if (chatHistory && chatHistory.length > 0) {
          sessionStorage.setItem(`chatHistory_${currentP}`, JSON.stringify(chatHistory));
        }
      }
    } catch (e) {
      console.warn('Failed to save old portal state', e);
    }

    // Task 2: Save to localStorage if consent is true (Rule A & Rule C)
    const consent = localStorage.getItem('scholarhub_cookie_consent') === 'true';
    if (consent) {
      if (userTier === 'pro' || !user) {
        localStorage.setItem('last_used_portal', newPortal);
      }
    }

    // b) Update the 'portal' state
    sessionStorage.setItem('active_portal', newPortal);
    setPortal(newPortal);

    // c) Immediately load the saved data of the NEW portal from sessionStorage into the state
    hydratePortalState(newPortal);
  };

  useEffect(() => {
    // Sync current state to active portal cache continuously
    try {
      const p = portal;
      if (!p) return;
      sessionStorage.setItem('active_portal', p);
      sessionStorage.setItem(`searchTerm_${p}`, searchTerm);
      sessionStorage.setItem('searchCount', JSON.stringify(searchCount));
      sessionStorage.setItem('resultLimit', JSON.stringify(resultLimit));
      sessionStorage.setItem('startDate', startDate);
      sessionStorage.setItem('endDate', endDate);
      sessionStorage.setItem('sortBy', sortBy);
      sessionStorage.setItem('aiWidgetMode', aiWidgetMode);

      sessionStorage.setItem(`results_${p}`, JSON.stringify(articles));
      sessionStorage.setItem(`aiSummary_${p}`, aiSummary);
      sessionStorage.setItem(`hasSearched_${p}`, JSON.stringify(hasSearched));
      sessionStorage.setItem(`aiPromptVisible_${p}`, JSON.stringify(aiPromptVisible));
      sessionStorage.setItem(`aiChatOpen_${p}`, JSON.stringify(aiChatOpen));

      if (chatHistory && chatHistory.length > 0) {
        sessionStorage.setItem(`chatHistory_${p}`, JSON.stringify(chatHistory));
      }
    } catch (e) {
      console.warn('Session storage quota exceeded while saving state. Some data may not persist on navigation.', e);
    }
  }, [searchTerm, lastSearched, hasSearched, searchCount, articles, resultLimit, startDate, endDate, sortBy, aiPromptVisible, aiChatOpen, aiSummary, aiWidgetMode, chatHistory, portal]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      setAiPromptVisible(true);
      sessionStorage.setItem('aiPromptVisible', 'true');
    }
  }, [articles]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSortBy('relevance');
    setResultLimit(50);
  };

  const fetchGlobalLatest = async (forceRefresh = false) => {
    const userField = academicField || 'Genetic Eng. & Biotech (GEB)';
    const primaryFields = {
      'Genetic Eng. & Biotech (GEB)': 'bio',
      'Engineering/CS': 'eng',
      'Physics': 'physics',
      'Mathematics': 'math',
      'Social Sciences': 'social',
      'Law / Legal Studies': 'law',
      'Chemistry / Pharmacy': 'chem'
    };

    const isPrimary = userField in primaryFields;
    const portalParam = isPrimary ? primaryFields[userField] : 'universal';
    const CACHE_KEY = `global_latest_research_cache_${userField.replace(/\s+/g, '_')}`;

    if (!forceRefresh) {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          const now = Date.now();
          const ONE_DAY = 24 * 60 * 60 * 1000;

          if (now - cached.timestamp < ONE_DAY && cached.data) {
            setGlobalLatestPaper(cached.data);
            setGlobalLatestLoading(false);
            return;
          }
        } catch (e) {
          // Silent catch
        }
      }
    }

    setGlobalLatestLoading(true);
    try {
      let latestPaper = null;
      if (isPrimary) {
        const url = `${BASE_URL}/get-latest-research?portal=${portalParam}${forceRefresh ? '&force=true' : ''}`;
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.latest) {
            latestPaper = data.latest;
          }
        }
      } else {
        const url = `${BASE_URL}/api/search?portal=universal&keyword=${encodeURIComponent(userField)}&limit=1`;
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.articles && data.articles.length > 0) {
            latestPaper = data.articles[0];
          }
        }
      }

      if (latestPaper) {
        setGlobalLatestPaper(latestPaper);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: latestPaper,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error("Latest research fetch failed:", err);
    } finally {
      setGlobalLatestLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalLatest();
  }, [portal, academicField]);

  const onSummarize = async () => {
    if (articles.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    setAiPromptVisible(false);
    setAiChatOpen(true);
    setAiWidgetMode('normal');
    setAiThinking(true);
    setAiStep('Initializing Llama 3.1 Synthesis Engine...');
    setAiProgress(10);
    setChatHistory([]);
    setAiSummary('');

    try {
      const pDetails = getPortalDetails(portal);
      const steps = [
        { text: `Cross-referencing ${pDetails.source}...`, prog: 30, delay: 800 },
        { text: `Analyzing ${pDetails.name} Insights...`, prog: 60, delay: 1500 },
        { text: 'Generating Executive Report...', prog: 90, delay: 2200 }
      ];

      steps.forEach(({ text, prog, delay }) => {
        setTimeout(() => {
          setAiStep(text);
          setAiProgress(prog);
        }, delay);
      });

      const deviceId = getOrCreateDeviceId();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${BASE_URL}/ai/summarize-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': deviceId
        },
        body: JSON.stringify({
          articles: articles.slice(0, userTier === 'pro' ? 15 : (userTier === 'starter' ? 10 : 5)).map(p => ({ title: p.title, abstract: p.abstract, url: p.url })),
          portal: portal || 'universal'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 402) {
          handle402Expiry();
          return;
        }
        if (response.status === 429) {
          setIsAiLimitReached(true);
          return;
        }
        let errMsg = 'Failed to generate summary';
        try {
          const errData = await response.json();
          const detail = errData.error || errData.detail;
          if (typeof detail === 'string' && detail.includes('Device ID not registered')) {
            errMsg = 'This device is not registered. Please manage your devices in the Profile page.';
          } else if (detail) {
            errMsg = detail;
          }
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      const data = await response.json();
      fetchUserDashboardStats();

      setAiSummary(data.output);
      setChatHistory([{ role: 'assistant', content: 'Here is your executive summary. Feel free to ask any specific questions about these papers.' }]);

    } catch (err) {
      console.error(err);
      setAiStep('Synthesis Failed');
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
      const isRateLimit = err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('token') || err.message?.includes('413');
      const errorMsg = isTimeout
        ? "The AI is experiencing heavy load and timed out. Please try again."
        : isRateLimit
          ? "The selected research papers contain too much data. Please try again, and our system will auto-optimize the content."
          : "We encountered an error while synthesizing the research data. Please try again.";
      setAiSummary(errorMsg);
    } finally {
      setAiThinking(false);
    }
  };

  const handleChatWithPaper = async (paper) => {
    setAiChatOpen(true);
    setAiWidgetMode('normal');
    const prompt = `Please summarize the methodology and key findings of the paper: "${paper.title}" with abstract: "${paper.abstract || ''}"`;
    
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: `Summarize key findings of "${paper.title}"` }]);
    setAiThinking(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setShowAuthModal(true);
        setAiThinking(false);
        return;
      }
      const deviceId = getOrCreateDeviceId();
      const response = await fetch(`${BASE_URL}/ai/chat-with-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': deviceId
        },
        body: JSON.stringify({
          articles: [{ title: paper.title, abstract: paper.abstract, url: paper.url || '' }],
          user_message: prompt,
          portal: portal || 'universal',
          chat_history: chatHistory
        })
      });
      if (!response.ok) {
        if (response.status === 402) {
          handle402Expiry();
          return;
        }
        if (response.status === 429) {
          setIsAiLimitReached(true);
          setChatHistory(prev => prev.slice(0, -1));
          return;
        }
        throw new Error('Chat failed');
      }
      const data = await response.json();
      fetchUserDashboardStats();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.output }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: err.message || 'Error occurred.' }]);
    } finally {
      setAiThinking(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || aiThinking) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiThinking(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${BASE_URL}/ai/chat-with-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': deviceId
        },
        body: JSON.stringify({
          articles: articles.slice(0, userTier === 'pro' ? 15 : (userTier === 'starter' ? 10 : 5)).map(p => ({ title: p.title, abstract: p.abstract, url: p.url })),
          user_message: userMessage,
          portal: portal || 'universal',
          chat_history: chatHistory
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 402) {
          handle402Expiry();
          return;
        }
        if (response.status === 429) {
          setIsAiLimitReached(true);
          setChatHistory(prev => prev.slice(0, -1));
          return;
        }
        let errMsg = 'Chat failed';
        try {
          const errData = await response.json();
          const detail = errData.error || errData.detail;
          if (typeof detail === 'string' && detail.includes('Device ID not registered')) {
            errMsg = 'This device is not registered. Please manage your devices in the Profile page.';
          } else if (detail) {
            errMsg = detail;
          }
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      const data = await response.json();
      fetchUserDashboardStats();

      setChatHistory(prev => [...prev, { role: 'assistant', content: data.output }]);
    } catch (err) {
      console.error(err);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
      const isRateLimit = err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('token') || err.message?.includes('413');
      const errorMsg = isTimeout
        ? "The AI is experiencing heavy load and timed out. Please try again."
        : isRateLimit
          ? "The selected research papers contain too much data. Please try again, and our system will auto-optimize the content."
          : (err.message || 'Connection to AI server lost. Please try again.');
      setChatHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setAiThinking(false);
    }
  };

  const isSearchBlocked = cooldownTime > 0 || guestCooldown > 0;

  const cancelSearch = () => {
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    setLoading(false);
    setIsSyncing(false);
    setError(null);
    toast.info('Search analysis stopped by user.', {
      description: 'No request credits were deducted.',
      icon: '🛑'
    });
  };


  const searchPubMed = async (e, overrideTerm = null) => {
    if (e) e.preventDefault();
    setSelectedPapers([]);
    const currentSearchTerm = overrideTerm !== null ? overrideTerm : searchTerm;
    if (!currentSearchTerm.trim()) return;

    // Removed artificial results limits; system-optimized limit is set to 50 results.

    if (cooldownTime > 0) return;
    if (guestCooldown > 0) return;

    if (searchCount >= 10) {
      if (userTier !== 'pro') {
        setCooldownTime(60);
        sessionStorage.setItem('cooldownExpiry', JSON.stringify(Date.now() + 60000));
        setSearchCount(0);
        sessionStorage.setItem('searchCount', '0');
        return;
      } else {
        setSearchCount(0);
        sessionStorage.setItem('searchCount', '0');
      }
    }

    const authorizedPortal = portal || 'universal';
    const queryKey = `cache_${authorizedPortal}_${currentSearchTerm}_${resultLimit}_${startDate}_${endDate}_${sortBy}`;
    const cachedData = sessionStorage.getItem(queryKey);
    if (cachedData) {
      const results = JSON.parse(cachedData);
      setArticles(results);
      setHasSearched(true);
      setLastSearched(currentSearchTerm);
      if (results.length > 0) {
        sessionStorage.setItem('aiPromptVisible', 'true');
        setTimeout(() => setAiPromptVisible(true), 1500);
      }
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setLastSearched(currentSearchTerm);
    setIsSyncing(true);

    try {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      sessionStorage.setItem('searchCount', newCount.toString());
      sessionStorage.setItem('portal', authorizedPortal);

      if (userTier === 'free' || !user) {
        setGuestCooldown(5);
        sessionStorage.setItem('guestCooldownExpiry', JSON.stringify(Date.now() + 5000));
      } else if (userTier === 'starter') {
        setGuestCooldown(1);
        sessionStorage.setItem('guestCooldownExpiry', JSON.stringify(Date.now() + 1000));
      } else {
        setGuestCooldown(0);
        sessionStorage.removeItem('guestCooldownExpiry');
      }

      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      searchAbortControllerRef.current = new AbortController();

      // Silent Debounce Delay Throttling (10s for free tier, 5s for starter/pro)
      const delayMs = userTier === 'free' ? 10000 : 5000;
      await new Promise((resolve, reject) => {
        const signal = searchAbortControllerRef.current?.signal;
        if (signal?.aborted) {
          return reject(new DOMException('Aborted', 'AbortError'));
        }
        const timeoutId = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        }, delayMs);
        function onAbort() {
          clearTimeout(timeoutId);
          reject(new DOMException('Aborted', 'AbortError'));
        }
        signal?.addEventListener('abort', onAbort);
      });

      setIsSyncing(false);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const fetchUrl = `${BASE_URL}/api/search?portal=${authorizedPortal}&keyword=${encodeURIComponent(currentSearchTerm)}&limit=${resultLimit}&start_date=${startDate}&end_date=${endDate}&sort_by=${sortBy}`;

      const fetchHeaders = { 'Content-Type': 'application/json' };
      if (token) {
        fetchHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: fetchHeaders,
        mode: 'cors',
        signal: searchAbortControllerRef.current.signal
      });
      if (!response.ok) {
        if (response.status === 401) {
          setShowAuthModal(true);
          setLoading(false);
          return;
        }
        if (response.status === 402) {
          handle402Expiry();
          throw new Error('Your premium session has ended.');
        }
        let errMsg = `Server status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) errMsg = errData.detail;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      let searchData = await response.json();

      // ─── Async Job Polling (HTTP 202 Accepted / Queued Status) ───
      if (response.status === 202 || (searchData.status === 'queued' && searchData.job_id)) {
        const jobId = searchData.job_id;
        let pollCount = 0;
        let jobCompleted = false;

        console.log(`[RESEARCHPAGE FRONTEND] Job '${jobId}' queued. Initiating real-time polling...`);
        setIsSyncing(true);

        while (!jobCompleted && pollCount < 180) { // Max 3 minutes
          await new Promise(r => setTimeout(r, 1000));
          pollCount++;

          try {
            const jobRes = await fetch(`${BASE_URL}/api/job/${jobId}`, {
              headers: fetchHeaders,
              signal: searchAbortControllerRef.current?.signal
            });
            if (jobRes.ok) {
              const jobData = await jobRes.json();
              console.log("Job Payload Received:", jobData.payload || jobData.result || jobData);

              const payloadObj = jobData.payload || jobData.result || jobData;

              if (jobData.status === 'completed' && payloadObj) {
                console.log(`[RESEARCHPAGE FRONTEND] Job '${jobId}' completed successfully after ${pollCount}s!`);
                searchData = payloadObj;
                jobCompleted = true;
              } else if (jobData.status === 'failed') {
                throw new Error(jobData.error || 'ROS Pipeline async search job failed.');
              }
            }
          } catch (pErr) {
            if (pErr.name === 'AbortError') throw pErr;
            console.warn(`[RESEARCHPAGE FRONTEND] Polling attempt ${pollCount} warning:`, pErr);
          }
        }

        if (!jobCompleted) {
          throw new Error('Search request timed out waiting for background ROS worker.');
        }
      }

      if (searchData.error) {
        if (searchData.error.includes("arXiv API is currently slow")) {
          setError("arXiv is taking too long to respond. This sometimes happens with their servers.");
        } else {
          setError(searchData.error);
        }
        setArticles([]);
        setLoading(false);
        return;
      }

      if (searchData.switched_to_universal) {
        setUniversalFallbackAlert(searchData.refined_query || currentSearchTerm);
      } else {
        setUniversalFallbackAlert(null);
      }

      const results = searchData.articles || (searchData.payload && searchData.payload.articles) || (searchData.result && searchData.result.articles) || [];
      sessionStorage.setItem(queryKey, JSON.stringify(results));

      // Race Condition Guard: Ensure articles are updated in state BEFORE completing loading state
      setArticles(results);

      if (results.length > 0) {
        sessionStorage.setItem('aiPromptVisible', 'true');
        setTimeout(() => setAiPromptVisible(true), 1500);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }

      if (userTier === 'free' || !user) {
        setGuestCooldown(5);
        sessionStorage.setItem('guestCooldownExpiry', JSON.stringify(Date.now() + 5000));
      } else if (userTier === 'starter') {
        setGuestCooldown(1);
        sessionStorage.setItem('guestCooldownExpiry', JSON.stringify(Date.now() + 1000));
      } else {
        setGuestCooldown(0);
        sessionStorage.removeItem('guestCooldownExpiry');
      }
      setLoading(false);
    } catch (err) {
      setIsSyncing(false);
      if (err.name === 'AbortError') return;
      const userMsg = err.message?.includes('Failed to fetch') || err.message?.includes('fetch')
        ? 'The Global Research Databases are currently experiencing high latency. We apologize for this external delay. Please try again in a few moments as we re-establish the connection.'
        : err.message;
      setError(userMsg);
      setLoading(false);
    }
  };

  const handleForceRefreshClick = () => {
    setShowRefreshModal(true);
  };

  const executeForceRefresh = () => {
    setShowRefreshModal(false);
    const authorizedPortal = portal || 'universal';
    const queryKey = `cache_${authorizedPortal}_${searchTerm}_${resultLimit}_${startDate}_${endDate}_${sortBy}`;
    sessionStorage.removeItem(queryKey);

    sessionStorage.removeItem(`results_${authorizedPortal}`);
    sessionStorage.removeItem(`ai_summary_${authorizedPortal}`);
    sessionStorage.removeItem(`has_searched_${authorizedPortal}`);
    sessionStorage.removeItem(`chat_history_${authorizedPortal}`);
    sessionStorage.removeItem(`search_term_${authorizedPortal}`);

    setArticles([]);
    setAiSummary('');
    setHasSearched(false);
    setChatHistory([]);
    setAiPromptVisible(false);

    searchPubMed(new Event('submit'));
  };

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  useEffect(() => {
    if (guestCooldown > 0) {
      const timer = setTimeout(() => setGuestCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [guestCooldown]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const [isRefining, setIsRefining] = useState(false);
  const handleAiRefine = async () => {
    if (!searchTerm.trim()) return;
    setIsRefining(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/ai/refine-query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ raw_query: searchTerm })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.refined_query) {
          setSearchTerm(data.refined_query);
        }
      }
    } catch (err) {
      console.error('AI Refine error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE_URL}/suggest?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions((data.suggestions || []).length > 0);
        }
      } catch { /* silent */ }
    }, 300);
  };

  const suggestionTimer = useRef(null);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    const debounceMs = userTier === 'free' ? 3000 : userTier === 'starter' ? 1000 : 0;

    suggestionTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, debounceMs);
  };

  const handleSuggestionClick = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout}>

      {/* Force Refresh Modal */}
      <ForceRefreshModal
        isOpen={showRefreshModal}
        onClose={() => setShowRefreshModal(false)}
        onConfirm={executeForceRefresh}
      />

      {/* Global Announcement Banner */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`sticky top-0 z-50 -mx-6 md:-mx-12 -mt-6 md:-mt-10 mb-8 py-3.5 px-6 border-b flex items-center justify-between gap-3 text-xs md:text-sm font-bold shadow-md overflow-hidden text-[#171717] ${announcement.type === 'warning'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-indigo-50 border-indigo-200'
              }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className={`shrink-0 ${announcement.type === 'warning' ? 'text-amber-600' : 'text-indigo-600'}`}
              >
                <Megaphone size={16} />
              </motion.div>
              <span className="truncate tracking-wide font-semibold text-[#171717]">{announcement.title ? <><strong className="mr-2">{announcement.title} -</strong>{renderTextWithLinks(announcement.message, announcement.type)}</> : renderTextWithLinks(announcement.message, announcement.type)}</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem('dismissed_announcement', announcement.id.toString())
                setAnnouncement(null)
              }}
              className="shrink-0 p-1.5 rounded-full hover:bg-slate-950/5 text-slate-700 hover:text-[#171717] transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Error Banner */}
      <AnimatePresence>
        {profileError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`py-3 px-6 border-b z-30 relative flex items-center justify-center gap-3 text-sm font-bold shadow-sm bg-red-50 text-red-700 border-red-200`}
          >
            <ShieldAlert size={16} className="animate-pulse" />
            <span>{profileError}</span>
            <button onClick={() => setProfileError(null)} className="ml-2 hover:bg-red-100 rounded-full p-1 transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Engine Section */}
      <section className="relative w-full pb-16">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {(!hasSearched && !aiChatOpen) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="flex flex-col items-center text-center w-full 2xl:px-12 mx-auto mb-8 md:mb-16"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 mb-4 uppercase tracking-widest shadow-sm border border-blue-100">
                  <Search size={14} /> Professional Search Engine
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-[#171717] tracking-tight leading-[0.95] mb-6">
                  Analytical <span className="text-blue-600">Dashboard.</span>
                </h2>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
                  Real-time synchronization with Global Research Databases. Execute advanced queries across 7 disciplines.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Important User Guidance Note */}
          <div className="w-full 2xl:px-12 mx-auto mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs flex items-start gap-3.5 text-left transition-all">
            <div className="p-2 bg-amber-100/90 rounded-xl text-amber-700 shrink-0 mt-0.5 shadow-2xs">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
              <strong className="font-extrabold text-amber-900 block mb-0.5 text-xs md:text-sm uppercase tracking-wider">
                📌 Important Note for Researchers:
              </strong>
              For the highest precision in Research Hub, use short keywords (1-4 words). For long prompts, complex queries, and multi-layered analysis, please use the <Link to="/auditor" className="text-indigo-600 font-extrabold underline hover:text-indigo-800 transition-colors">Auditor Agent</Link>.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-3">
              <SearchBar
                portal={portal}
                setPortal={handlePortalSwitch}
                userTier={userTier}

                setArticles={setArticles}
                setHasSearched={setHasSearched}
                suggestionsRef={suggestionsRef}
                searchPubMed={searchPubMed}
                setShowSuggestions={setShowSuggestions}
                searchTerm={searchTerm}
                handleSearchInput={handleSearchInput}
                suggestions={suggestions}
                loading={loading}
                resultLimit={resultLimit}
                setResultLimit={setResultLimit}
                isSearchBlocked={isSearchBlocked}
                cooldownTime={cooldownTime}
                guestCooldown={guestCooldown}
                handleSuggestionClick={handleSuggestionClick}
                showSuggestions={showSuggestions}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                sortBy={sortBy}
                setSortBy={setSortBy}
                clearFilters={clearFilters}
                setStarterUnlockModalOpen={setStarterUnlockModalOpen}
                isRefining={isRefining}
                handleAiRefine={handleAiRefine}
              />
            </div>

            {/* Global Latest Research Card */}
            <div className="lg:col-span-2 w-full mt-10 lg:mt-0">
              <div className="relative">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="relative bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden group/card">
                  {globalLatestLoading ? (
                    <div className="animate-pulse space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl w-14 h-14"></div>
                        <div className="space-y-3 flex-1">
                          <div className="h-4 bg-slate-50 rounded w-1/3"></div>
                          <div className="h-3 bg-slate-50 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-4 pt-4">
                        <div className="h-3 bg-slate-50 rounded w-full"></div>
                        <div className="h-3 bg-slate-50 rounded w-full"></div>
                        <div className="h-3 bg-slate-50 rounded w-3/4"></div>
                      </div>
                    </div>
                  ) : globalLatestPaper ? (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                            <Sparkles size={24} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Live Intelligence</div>
                            <div className="text-xs font-bold text-slate-600">
                              Latest Research in {academicField}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => fetchGlobalLatest(true)}
                          disabled={globalLatestLoading}
                          className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                        >
                          <RefreshCcw size={16} className={globalLatestLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xl font-black text-[#171717] leading-tight group-hover/card:text-blue-600 transition-colors line-clamp-2">
                          {globalLatestPaper.title || 'System Synchronizing...'}
                        </h4>

                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <BookOpen size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black text-slate-600 truncate uppercase tracking-widest">{globalLatestPaper.journal || 'Global Research Database'}</span>
                        </div>

                        {globalLatestPaper.abstract && (
                          <p className="text-sm text-slate-700 leading-relaxed line-clamp-2 font-medium">
                            {globalLatestPaper.abstract}
                          </p>
                        )}

                        {globalLatestPaper.pmid ? (
                          <button
                            onClick={() => navigate(`/paper/${encodeURIComponent(globalLatestPaper.pmid)}`, { state: { article: globalLatestPaper } })}
                            className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group/btn"
                          >
                            Read Full Paper
                            <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          </button>
                        ) : (
                          <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Syncing Metadata...</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <div className="mx-auto text-slate-100 mb-6 flex justify-center">
                        <Activity size={48} />
                      </div>
                      <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-6">Network Handshake Pending</p>
                      <button onClick={fetchGlobalLatest} className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all">Retry Synchronization</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Workspace */}
      <div className="w-full pb-40">

        {universalFallbackAlert && (
          <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-purple-100 shrink-0">
                <Sparkles size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#171717] tracking-tight">Our AI convergence engine optimized your query for better search coverage.</h4>
                <p className="text-xs font-bold text-purple-600/70 uppercase tracking-widest mt-1">Search optimized to: <span className="text-purple-700">{universalFallbackAlert}</span></p>
              </div>
            </div>
            <button onClick={() => setUniversalFallbackAlert(null)} className="p-2.5 bg-white hover:bg-purple-100 text-purple-400 hover:text-purple-700 rounded-xl border border-purple-100 transition-all shadow-sm">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <h3 className="text-3xl font-black text-[#171717] tracking-tight">
              {hasSearched ? 'Analysis Results' : 'Research Feed'}
            </h3>
            {hasSearched && !loading && articles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  {articles.length} Papers
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  Top {resultLimit} Analysis
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black border border-green-100 uppercase tracking-widest">
              <Activity size={12} className="animate-pulse" />
              Cached Session
            </div>
          </div>
        </div>



        <div ref={resultsRef} className="scroll-mt-8">
          <ArticleGrid
            articles={articles}
            hasSearched={hasSearched}
            clearFilters={clearFilters}
            user={user}
            userTier={userTier}
            bookmarkCount={bookmarkCount}
            fetchBookmarkCount={fetchUserDashboardStats}
            setShowAuthModal={setShowAuthModal}
            loading={loading}
            error={error}
            searchPubMed={searchPubMed}
            cancelSearch={cancelSearch}
            onPaperClick={setSelectedPaper}
            selectedPapers={selectedPapers}
            onToggleSelect={handleToggleSelect}
            isSyncing={isSyncing}
            onRetryDeviceSync={async () => {
              if (user?.id) {
                toast.info("Re-registering device with research hub...");
                const res = await ensureDeviceIsRegistered(user.id);
                if (res.synced) {
                  toast.success("Device successfully registered!");
                } else if (res.limitReached) {
                  toast.error("Device limit reached (max 2 devices). Please manage registered devices in Settings.");
                }
              } else {
                toast.info(`Device ID active: ${getOrCreateDeviceId().substring(0, 8)}...`);
              }
            }}
            onToggleSelectAll={(visibleArticles, shouldSelectAll) => {
              if (shouldSelectAll) {
                setSelectedPapers(prev => {
                  const newPapers = [...prev];
                  visibleArticles.forEach(art => {
                    if (!newPapers.some(p => p.pmid === art.pmid)) {
                      newPapers.push(art);
                    }
                  });
                  return newPapers;
                });
              } else {
                setSelectedPapers(prev => 
                  prev.filter(p => !visibleArticles.some(va => va.pmid === p.pmid))
                );
              }
            }}
          />
        </div>
      </div>

      {/* AI Assistant Elements */}
      <AIChatWidget
        aiPromptVisible={aiPromptVisible}
        setAiPromptVisible={setAiPromptVisible}
        onSummarize={onSummarize}
        aiChatOpen={aiChatOpen}
        setAiChatOpen={setAiChatOpen}
        aiWidgetMode={aiWidgetMode}
        setAiWidgetMode={setAiWidgetMode}
        aiThinking={aiThinking}
        aiStep={aiStep}
        aiProgress={aiProgress}
        aiSummary={aiSummary}
        isAiLimitReached={isAiLimitReached}
        setIsAiLimitReached={setIsAiLimitReached}
        userTier={userTier}
        lastSearched={lastSearched}
        chatHistory={chatHistory}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSendMessage={handleSendMessage}
      />

      {/* Quick-View Side Panel */}
      <AnimatePresence>
        {selectedPaper && (
          <SidePanel
            paper={selectedPaper}
            onClose={() => setSelectedPaper(null)}
            onChatWithPaper={() => {
              handleChatWithPaper(selectedPaper);
              setSelectedPaper(null);
            }}
            onFindRelated={() => {
              searchPubMed(null, selectedPaper.title);
              setSelectedPaper(null);
            }}
            userTier={userTier}
          />
        )}
      </AnimatePresence>

      {/* Literature Review Generation Overlay */}
      <AnimatePresence>
        {litReviewModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              /* Locked backdrop: do NOT close on click — user must use the Close button */
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full sm:h-auto w-full 2xl:px-12 bg-white rounded-none sm:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-screen sm:max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#171717] leading-none">{litReviewTitle}</h3>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Llama 3.1 PRO Synthesis</p>
                  </div>
                </div>
                {!litReviewLoading && (
                  <button
                    onClick={() => setLitReviewModalOpen(false)}
                    className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-10 min-h-[300px]">
                {litReviewLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <motion.div
                        className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                      <Sparkles size={28} className="text-amber-500 animate-pulse" />
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-sm font-black text-slate-700 uppercase tracking-wider">{litReviewStep}</p>
                      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto">
                        <motion.div
                          className="h-full bg-amber-500"
                          initial={{ width: '0%' }}
                          animate={{ width: `${litReviewProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <div
                      className="font-serif text-slate-700 leading-relaxed text-sm space-y-6"
                      style={{ fontFamily: "'Merriweather', serif" }}
                    >
                      {formatMarkdown(litReviewContent)}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {!litReviewLoading && (
                <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const formattedHTML = formatMarkdownToHTML(litReviewContent);
                        exportToPDF(formattedHTML);
                      }}
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                      <FileDown size={14} />
                      Export to PDF
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(litReviewContent);
                          toast.success('Literature review copied to clipboard!');
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Copy Markdown
                    </button>
                  </div>
                  <button
                    onClick={() => setLitReviewModalOpen(false)}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Close Review
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRO Upgrade Warning Modal */}
      <ProUpgradeModal
        isOpen={proUnlockModalOpen}
        onClose={() => setProUnlockModalOpen(false)}
        navigate={navigate}
        reason={proModalReason}
      />

      {/* STARTER Upgrade Warning Modal */}
      <StarterUpgradeModal
        isOpen={starterUnlockModalOpen}
        onClose={() => setStarterUnlockModalOpen(false)}
        navigate={navigate}
      />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Expiry Toast */}
      <AnimatePresence>
        {showExpiryToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-700 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight">Premium Session Ended</div>
              <div className="text-xs font-medium text-slate-600">Reverting to your assigned Free portal.</div>
            </div>
            <button onClick={() => setShowExpiryToast(false)} className="ml-4 p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Floating Toolbar */}
      <AnimatePresence>
        {selectedPapers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-8 left-1/2 z-50 bg-slate-900 border border-slate-800 text-white px-3 py-2.5 md:px-5 md:py-3.5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-row items-center justify-between gap-2 md:gap-4 w-[92%] max-w-md md:max-w-lg shrink-0"
          >
            <span className="text-[10px] md:text-xs font-bold whitespace-nowrap text-slate-600 shrink-0">
              <span className="text-blue-400 font-black">{selectedPapers.length}</span> Selected
            </span>
            
            <div className="h-6 w-[1px] bg-slate-800 shrink-0" />
            
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              {/* Audit Dropdown Menu */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowAuditDropdown(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Sparkles size={12} className="text-yellow-300 md:w-3.5 md:h-3.5" />
                  <span>AUDIT</span>
                  <ChevronUp size={12} className={`transition-transform duration-200 ${showAuditDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAuditDropdown && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-3 left-0 md:left-auto md:right-0 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-slate-200"
                    >
                      <button
                        onClick={() => handleAuditOption('chat')}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/40 border border-transparent transition-all text-left cursor-pointer group"
                      >
                        <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors mt-0.5 shrink-0">
                          <MessageSquare size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-blue-300 flex items-center gap-1">
                            Chat with Selected Papers
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                            RAG-based QA using selected papers as primary context + AI knowledge.
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAuditOption('systematic')}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-transparent transition-all text-left cursor-pointer group"
                      >
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors mt-0.5 shrink-0">
                          <BarChart2 size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1">
                            Systematic & Semantic Review
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                            Auto PRISMA flow chart, summary table & paper comparison.
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAuditOption('report')}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-purple-600/20 hover:border-purple-500/40 border border-transparent transition-all text-left cursor-pointer group relative"
                      >
                        <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors mt-0.5 shrink-0">
                          <FileText size={15} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center justify-between gap-1">
                            <span>Full Research Report</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-purple-500/30 text-purple-300 border border-purple-400/30 rounded-md uppercase tracking-wider flex items-center gap-0.5">
                              <Lock size={9} /> Paid
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                            Publication-ready manuscript synthesis & research gaps.
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={handleBatchExportToExcel}
                title="Batch Download"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all border border-slate-700/50 shrink-0 cursor-pointer"
              >
                <Download size={13} className="md:w-4 md:h-4" />
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Please sign in to save papers.");
                    return;
                  }
                  setSelectedSaveAlbumId(null);
                  setShowLibrarySaveModal(true);
                }}
                title="Save to Library"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all border border-slate-700/50 shrink-0 cursor-pointer"
              >
                <FolderPlus size={13} className="md:w-4 md:h-4" />
              </button>
            </div>
            
            <button
              onClick={() => setSelectedPapers([])}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-600 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Clear Selection"
            >
              <X size={13} className="md:w-4 md:h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLibrarySaveModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-[#171717]"
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
                  className="p-2 text-slate-600 hover:text-slate-650 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">SELECT ALBUM</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedSaveAlbumId(null)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        selectedSaveAlbumId === null
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen size={14} className={selectedSaveAlbumId === null ? 'text-blue-400' : 'text-slate-600'} />
                        General (Default)
                      </span>
                      {selectedSaveAlbumId === null && <Check size={14} className="text-blue-400" />}
                    </button>

                    {/* Albums */}
                    {libraryAlbums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => setSelectedSaveAlbumId(album.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          selectedSaveAlbumId === album.id
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FolderPlus size={14} className={selectedSaveAlbumId === album.id ? 'text-blue-400' : 'text-slate-600'} />
                          {album.name}
                        </span>
                        {selectedSaveAlbumId === album.id && <Check size={14} className="text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <p className="text-xs font-semibold text-slate-700 mb-2">CREATE NEW ALBUM</p>
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
    </WorkspaceLayout>
  );
};

export default ResearchPage;
