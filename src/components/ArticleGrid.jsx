import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, AlertCircle, Bookmark, Check, Loader2, Library,
  FolderPlus, Calendar, Users, Copy, Database, ChevronUp,
  Filter, RefreshCcw, LayoutGrid, Quote, X, List, SlidersHorizontal, FileSpreadsheet,
  CheckCircle, Globe, Cpu, FileText, Sparkles, CheckCircle2, Square, Lightbulb, Zap, ShieldCheck, Activity
} from 'lucide-react';

import { supabase } from '../supabaseClient';
import { generateCitation } from '../utils/citationUtils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const SkeletonCard = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-[12px] border border-slate-200/60 p-4 sm:p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-slate-200 rounded-[12px] w-3/4"></div>
      <div className="h-6 bg-slate-200 rounded-full w-24"></div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
    </div>
    <div className="flex justify-end pt-4">
      <div className="h-10 bg-slate-200 rounded-[12px] w-full"></div>
    </div>
  </div>
);

const getExternalUrl = (pmid, source) => {
  if (!pmid) return '';
  if (source === 'arxiv') return `https://arxiv.org/abs/${pmid}`;
  if (source === 'scholar') return `https://www.semanticscholar.org/paper/${pmid}`;
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}`;
};

const ArticleCard = ({ article, user, userTier, bookmarkCount, onAuthRequired, onBookmarkSaved, onPaperClick, isSelected, onToggleSelect }) => {
  const navigate = useNavigate();
  const [bookmarkStatus, setBookmarkStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'exists'
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const albumRef = useRef(null);

  const title = article?.title || 'No Title Available';
  const pmid = article?.pmid || 'N/A';
  const abstract = article?.abstract || 'No abstract text available for this study.';
  const journal = article?.journal || 'Unknown Journal';
  const date = article?.date || 'Undated';
  const authors = article?.authors || 'Authors not listed';
  const keywords = article?.keywords || [];

  const limit = 200;
  const isLimitReached = bookmarkCount >= limit;

  const handleOpenDetail = () => {
    if (onPaperClick) {
      onPaperClick(article);
    } else {
      navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article } });
    }
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'warning') toast.warning(message);
    else toast.error(message);
  };

  const [citationCopied, setCitationCopied] = useState(false);
  const handleCopyCitation = async (e) => {
    e.stopPropagation();
    const citation = generateCitation(article, 'apa');
    try {
      await navigator.clipboard.writeText(citation);
      setCitationCopied(true);
      setTimeout(() => setCitationCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
      showToast('Failed to copy citation', 'error');
    }
  };

  // Close album picker on outside click
  useEffect(() => {
    const handle = (e) => {
      if (albumRef.current && !albumRef.current.contains(e.target)) {
        setShowAlbumPicker(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const fetchAlbums = async () => {
    const { data } = await supabase.from('albums').select('*').eq('user_id', user.id).order('name');
    setAlbums(data || []);
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    if (isLimitReached) {
      showToast('Library limit reached (200 papers). Remove papers to save more.', 'warning');
      return;
    }
    await fetchAlbums();
    setShowAlbumPicker(true);
  };

  const saveToAlbum = async (albumId = null) => {
    setShowAlbumPicker(false);
    if (bookmarkStatus === 'saving') return;
    setBookmarkStatus('saving');

    try {
      const { data: existing } = await supabase
        .from('bookmarks').select('id').eq('user_id', user.id).eq('pmid', pmid).maybeSingle();

      if (existing) {
        setBookmarkStatus('exists');
        showToast('Paper already in your library.', 'warning');
        setTimeout(() => setBookmarkStatus('idle'), 2000);
        return;
      }

      let finalSource = article.source;
      if (!finalSource) {
        if (pmid.startsWith('W') || pmid.startsWith('10.')) finalSource = 'scholar';
        else if (journal.toLowerCase().includes('arxiv') || String(pmid).includes('.')) finalSource = 'arxiv';
        else finalSource = 'ncbi';
      }

      const finalUrl = article.redirection_url || article.url || getExternalUrl(pmid, finalSource);
      const insertData = { user_id: user.id, pmid, title, journal, source: finalSource, url: finalUrl, full_metadata: article };
      if (albumId) insertData.album_id = albumId;
      const { error } = await supabase.from('bookmarks').insert(insertData);
      if (error) throw error;

      setBookmarkStatus('saved');
      showToast('Paper saved to your library!');
      if (onBookmarkSaved) onBookmarkSaved();
      setTimeout(() => setBookmarkStatus('idle'), 2500);
    } catch (err) {
      console.error('Bookmark error:', err);
      setBookmarkStatus('idle');
      showToast('Failed to save. Please try again.', 'error');
    }
  };

  const handleCreateAlbumAndSave = async (e) => {
    e.stopPropagation();
    if (!newAlbumName.trim()) return;
    try {
      const { data, error } = await supabase.from('albums').insert({ user_id: user.id, name: newAlbumName.trim() }).select().single();
      if (error) throw error;
      setNewAlbumName('');
      saveToAlbum(data.id);
    } catch (err) {
      showToast('Failed to create album.', 'error');
    }
  };

  return (
    <motion.div
      layout
      className="group bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-sm hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative"
      onClick={handleOpenDetail}
    >

      <div className="p-8 flex-1">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {onToggleSelect && (
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(article)}
                  className="w-4 h-4 rounded border-slate-300 text-[#171717] focus:ring-slate-900/20 cursor-pointer accent-slate-900"
                />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                <BookOpen size={14} />
                {journal}
              </span>
              {(article.verified_metadata || article.full_metadata?.verified_metadata || (article.sources && article.sources.length > 1) || (article.full_metadata?.sources && article.full_metadata.sources.length > 1)) && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[12px] text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-widest shadow-sm">
                  <CheckCircle size={12} className="text-indigo-500" />
                  Verified Metadata
                </span>
              )}
              {article.journal_quartile && (
                <span className={`inline-flex items-center justify-center h-7 w-10 shrink-0 rounded-[12px] text-[10px] font-black uppercase tracking-widest border ${article.journal_quartile === 'Q1' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100' :
                    article.journal_quartile === 'Q2' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm shadow-indigo-100' :
                      article.journal_quartile === 'Q3' ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100' :
                        'bg-slate-50 text-slate-700 border-slate-200 shadow-sm shadow-slate-100'
                  }`}>
                  {article.journal_quartile}
                </span>
              )}
            </div>
            {article.citationCount !== undefined && article.citationCount !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">
                <Quote size={12} />
                {article.citationCount} Citations
              </span>
            )}
            {article.influentialCitationCount !== undefined && article.influentialCitationCount !== null && article.influentialCitationCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest">
                <AlertCircle size={12} className="text-rose-500" />
                {article.influentialCitationCount} Influential
              </span>
            )}
          </div>
          <div className="relative" ref={albumRef}>
            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkStatus === 'saving' || isLimitReached}
              className={`shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-300 ${isLimitReached
                  ? 'bg-slate-50 border-2 border-slate-100 text-slate-600 cursor-not-allowed opacity-60'
                  : bookmarkStatus === 'saved'
                    ? 'bg-green-50 border-2 border-green-200 text-green-600 shadow-sm shadow-green-100 scale-110'
                    : bookmarkStatus === 'exists'
                      ? 'bg-amber-50 border-2 border-amber-200 text-amber-600'
                      : bookmarkStatus === 'saving'
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-600 animate-pulse'
                        : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm hover:shadow-blue-100 hover:scale-110'
                }`}
              title={isLimitReached ? "Upgrade to Starter for unlimited storage" : (bookmarkStatus === 'saved' ? 'Saved!' : 'Save to Library')}
            >
              {bookmarkStatus === 'saving' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : bookmarkStatus === 'saved' ? (
                <Check size={16} />
              ) : (
                <Bookmark size={16} />
              )}
            </button>

            <AnimatePresence>
              {showAlbumPicker && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-12 right-0 z-30 w-64 bg-white rounded-[12px] border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Save to Album</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <button
                      onClick={() => saveToAlbum(null)}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Library size={14} className="text-slate-600" /> General (Default)
                    </button>
                    {albums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => saveToAlbum(album.id)}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FolderPlus size={14} className="text-slate-600" /> {album.name}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-100">
                    <form onSubmit={handleCreateAlbumAndSave} className="flex gap-2">
                      <input
                        type="text"
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        placeholder="New album name..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-[12px] text-xs font-semibold outline-none focus:border-blue-300 text-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-[12px] text-xs font-bold hover:bg-blue-700 transition-colors">
                        <FolderPlus size={14} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <h3 className="text-xl font-black font-sds-content text-[#171717] group-hover:text-blue-600 transition-colors leading-tight mb-4 line-clamp-3 font-sds-content">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-5 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-600" />
            {date}
          </div>
          <div className="flex items-center gap-2 max-w-[150px]">
            <Users size={14} className="text-slate-600 shrink-0" />
            <span className="truncate">{authors}</span>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-700 text-[9px] font-bold rounded border border-slate-100">
                {kw}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="px-2 py-0.5 text-slate-600 text-[9px] font-bold">+{keywords.length - 3}</span>
            )}
          </div>
        )}

        <div className="relative">
          <div className="overflow-hidden text-slate-600 text-sm leading-relaxed line-clamp-3 font-sds-content font-medium">
            {abstract}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="mt-6 flex items-center justify-start">
          <button
            onClick={handleCopyCitation}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all ${citationCopied
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
              }`}
          >
            {citationCopied ? <Check size={12} /> : <Copy size={12} />}
            {citationCopied ? 'Copied!' : 'Copy Citation'}
          </button>
        </div>
      </div>

      <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-600 flex items-center gap-2 uppercase tracking-[0.2em]">
            <Database size={12} />
            PMID: {pmid}
          </span>
          {article.figures && article.figures.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenDetail(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors uppercase tracking-widest cursor-pointer shadow-2xs"
            >
              <Sparkles size={11} className="text-blue-500" />
              <span>View Research Gallery ({article.figures.length})</span>
            </button>
          )}
        </div>
        <div className="w-8 h-8 rounded-[12px] bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
          <ChevronUp size={14} className="rotate-90" />
        </div>
      </div>
    </motion.div>
  );
};

const TableRow = ({ article, user, userTier, bookmarkCount, onAuthRequired, onBookmarkSaved, onPaperClick, isSelected, onToggleSelect }) => {
  const navigate = useNavigate();
  const [bookmarkStatus, setBookmarkStatus] = useState('idle');
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const albumRef = useRef(null);
  const [citationCopied, setCitationCopied] = useState(false);

  const title = article?.title || 'No Title Available';
  const pmid = article?.pmid || 'N/A';
  const journal = article?.journal || 'Unknown Journal';
  const date = article?.date || 'Undated';
  const authors = article?.authors || 'Authors not listed';

  const limit = 200;
  const isLimitReached = bookmarkCount >= limit;

  const handleOpenDetail = () => {
    if (onPaperClick) {
      onPaperClick(article);
    } else {
      navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article } });
    }
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'warning') toast.warning(message);
    else toast.error(message);
  };

  const handleCopyCitation = async (e) => {
    e.stopPropagation();
    const citation = generateCitation(article, 'apa');
    try {
      await navigator.clipboard.writeText(citation);
      setCitationCopied(true);
      showToast('Citation copied to clipboard!');
      setTimeout(() => setCitationCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
      showToast('Failed to copy citation', 'error');
    }
  };

  useEffect(() => {
    const handle = (e) => {
      if (albumRef.current && !albumRef.current.contains(e.target)) {
        setShowAlbumPicker(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const fetchAlbums = async () => {
    if (!user) return;
    const { data } = await supabase.from('albums').select('*').eq('user_id', user.id).order('name');
    setAlbums(data || []);
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    if (isLimitReached) {
      showToast('Library limit reached (200 papers). Remove papers to save more.', 'warning');
      return;
    }
    await fetchAlbums();
    setShowAlbumPicker(true);
  };

  const saveToAlbum = async (albumId = null) => {
    setShowAlbumPicker(false);
    if (bookmarkStatus === 'saving') return;
    setBookmarkStatus('saving');

    try {
      const { data: existing } = await supabase
        .from('bookmarks').select('id').eq('user_id', user.id).eq('pmid', pmid).maybeSingle();

      if (existing) {
        setBookmarkStatus('exists');
        showToast('Paper already in your library.', 'warning');
        setTimeout(() => setBookmarkStatus('idle'), 2000);
        return;
      }

      let finalSource = article.source;
      if (!finalSource) {
        if (pmid.startsWith('W') || pmid.startsWith('10.')) finalSource = 'scholar';
        else if (journal.toLowerCase().includes('arxiv') || String(pmid).includes('.')) finalSource = 'arxiv';
        else finalSource = 'ncbi';
      }

      const finalUrl = article.redirection_url || article.url || getExternalUrl(pmid, finalSource);
      const insertData = { user_id: user.id, pmid, title, journal, source: finalSource, url: finalUrl, full_metadata: article };
      if (albumId) insertData.album_id = albumId;
      const { error } = await supabase.from('bookmarks').insert(insertData);
      if (error) throw error;

      setBookmarkStatus('saved');
      showToast('Paper saved to your library!');
      if (onBookmarkSaved) onBookmarkSaved();
      setTimeout(() => setBookmarkStatus('idle'), 2500);
    } catch (err) {
      console.error('Bookmark error:', err);
      setBookmarkStatus('idle');
      showToast('Failed to save. Please try again.', 'error');
    }
  };

  const handleCreateAlbumAndSave = async (e) => {
    e.stopPropagation();
    if (!newAlbumName.trim()) return;
    try {
      const { data, error } = await supabase.from('albums').insert({ user_id: user.id, name: newAlbumName.trim() }).select().single();
      if (error) throw error;
      setNewAlbumName('');
      saveToAlbum(data.id);
    } catch (err) {
      console.error('Failed to create album:', err);
      showToast('Failed to create album.', 'error');
    }
  };

  return (
    <tr
      onClick={handleOpenDetail}
      className="hover:bg-slate-50/70 cursor-pointer transition-colors duration-200 group relative border-b border-slate-100/80"
    >
      {onToggleSelect && (
        <td className="px-6 py-4 w-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(article)}
              className="w-4 h-4 rounded border-slate-300 text-[#171717] focus:ring-slate-900/20 cursor-pointer accent-slate-900"
            />
          </div>
        </td>
      )}
      {/* Column 1: Title & Source */}
      <td className="px-6 py-4 max-w-lg min-w-[280px]">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-3 font-sds-content leading-snug">
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
              {journal}
            </span>
            {(article.verified_metadata || article.full_metadata?.verified_metadata || (article.sources && article.sources.length > 1) || (article.full_metadata?.sources && article.full_metadata.sources.length > 1)) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase tracking-widest">
                <CheckCircle size={10} className="text-indigo-500" />
                Verified
              </span>
            )}
            {article.journal_quartile && (
              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[2rem] shrink-0 rounded text-[9px] font-black uppercase tracking-widest border ${article.journal_quartile === 'Q1' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  article.journal_quartile === 'Q2' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    article.journal_quartile === 'Q3' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                }`}>
                {article.journal_quartile}
              </span>
            )}
            {article.citationCount !== undefined && article.citationCount !== null && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100">
                <Quote size={10} />
                {article.citationCount} Citations
              </span>
            )}
            {article.influentialCitationCount !== undefined && article.influentialCitationCount !== null && article.influentialCitationCount > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100">
                <AlertCircle size={10} className="text-rose-500" />
                {article.influentialCitationCount} Influential
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Column 2: Authors */}
      <td className="px-6 py-4 max-w-[220px]">
        <span className="text-xs font-semibold text-slate-700 line-clamp-3 font-sds-content leading-relaxed">
          {authors}
        </span>
      </td>

      {/* Column 3: Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {date}
        </span>
      </td>

      {/* Column 4: PMID / Database ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-black text-slate-600 tracking-widest uppercase">
          {pmid}
        </span>
      </td>

      {/* Column 5: Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2 relative">

          {/* Copy Citation Button */}
          <button
            onClick={handleCopyCitation}
            className={`flex items-center justify-center w-8 h-8 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${citationCopied
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
              }`}
            title="Copy Citation"
          >
            {citationCopied ? <Check size={12} /> : <Copy size={12} />}
          </button>

          {/* Bookmark Button Container */}
          <div className="relative" ref={albumRef}>
            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkStatus === 'saving' || isLimitReached}
              className={`w-8 h-8 rounded-[12px] flex items-center justify-center transition-all duration-300 ${isLimitReached
                  ? 'bg-slate-50 border border-slate-100 text-slate-600 cursor-not-allowed opacity-60'
                  : bookmarkStatus === 'saved'
                    ? 'bg-green-50 border border-green-200 text-green-600 shadow-sm shadow-green-100'
                    : bookmarkStatus === 'exists'
                      ? 'bg-amber-50 border border-amber-200 text-amber-600'
                      : bookmarkStatus === 'saving'
                        ? 'bg-blue-50 border border-blue-200 text-blue-600 animate-pulse'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                }`}
              title={isLimitReached ? "Upgrade to Starter" : "Save to Library"}
            >
              {bookmarkStatus === 'saving' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : bookmarkStatus === 'saved' ? (
                <Check size={12} />
              ) : (
                <Bookmark size={12} />
              )}
            </button>

            {/* Album Picker */}
            <AnimatePresence>
              {showAlbumPicker && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 top-10 z-30 w-56 bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden text-left"
                >
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Save to Album</p>
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    <button
                      onClick={() => saveToAlbum(null)}
                      className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                    >
                      <Library size={12} className="text-slate-600" /> Default
                    </button>
                    {albums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => saveToAlbum(album.id)}
                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                      >
                        <FolderPlus size={12} className="text-slate-600" /> {album.name}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <form onSubmit={handleCreateAlbumAndSave} className="flex gap-1.5">
                      <input
                        type="text"
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        placeholder="Album..."
                        className="flex-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-semibold outline-none focus:border-blue-300 text-slate-700"
                      />
                      <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 transition-colors">
                        <FolderPlus size={12} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Arrow Detail Button */}
          <button
            onClick={handleOpenDetail}
            className="w-8 h-8 rounded-[12px] bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 transition-all"
          >
            <ChevronUp size={12} className="rotate-90" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ArticleGrid = ({
  articles, hasSearched, clearFilters, user, userTier, bookmarkCount,
  fetchBookmarkCount, setShowAuthModal, loading, error, searchPubMed, portal, cancelSearch, onPaperClick,
  selectedPapers = [], onToggleSelect, onToggleSelectAll, isSyncing = false, onRetryDeviceSync
}) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const handleExportSessionToExcel = () => {
    if (!articles || articles.length === 0) {
      toast.error('No articles to export.');
      return;
    }

    try {
      const data = articles.map(p => ({
        Title: p.title || '—',
        Author: p.authors ? (Array.isArray(p.authors) ? p.authors.join(', ') : p.authors) : '—',
        Journal: p.journal || '—',
        DOI: p.doi || '—',
        Citations: p.citationCount ?? '—',
        'Abstract Summary': p.abstract || '—'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Research Articles");

      const filename = `ScholarHub_Export_Session.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Session exported to Excel successfully!');
    } catch (err) {
      console.error('Session Export Error:', err);
      toast.error('Failed to export session to Excel.');
    }
  };

  const [loadingProgress, setLoadingProgress] = useState(5);
  const [tipIndex, setTipIndex] = useState(0);

  const RESEARCH_TIPS = [
    "💡 Tip: Filter articles by SJR Journal Quartiles (Q1/Q2) for top-tier impact factor papers.",
    "🧬 Fact: ScholarHub queries over 35 million PubMed records and 2.4 million arXiv preprints in real-time.",
    "⚡ Tip: Select multiple papers and export them directly to Excel, CSV, or BibTeX format.",
    "🔬 Fact: Automated RAG synthesis extracts key findings, methodology & sample size from each abstract.",
    "🧠 Tip: Use the 'Auditor' tool to perform deep manuscript synthesis and methodology comparison."
  ];

  useEffect(() => {
    if (!loading) {
      setLoadingProgress(5);
      setLoadingStage(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return 95;
        const increment = prev < 30 ? 4 : prev < 60 ? 3 : prev < 80 ? 2 : 1;
        return prev + increment;
      });
    }, 180);

    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % RESEARCH_TIPS.length);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [loading]);

  const currentStage = loadingProgress < 25 ? 0 : loadingProgress < 50 ? 1 : loadingProgress < 75 ? 2 : 3;

  const stages = [
    {
      level: "Level 1",
      title: "Index & Query Repositories",
      desc: "Connecting to PubMed Central, arXiv & global academic indices...",
      icon: <Globe size={18} className="text-blue-600 animate-spin" />
    },
    {
      level: "Level 2",
      title: "Parse Manuscripts & SJR Impact",
      desc: "Filtering SCImago Journal Rankings (Q1-Q4) & citation impact...",
      icon: <FileText size={18} className="text-indigo-600 animate-pulse" />
    },
    {
      level: "Level 3",
      title: "Deep RAG Neural Extraction",
      desc: "Extracting key findings, methodology & evidence matrix...",
      icon: <Cpu size={18} className="text-purple-600 animate-bounce" />
    },
    {
      level: "Level 4",
      title: "Synthesize & Render Matrix",
      desc: "Formatting research cards, synthesis table & datasets...",
      icon: <Sparkles size={18} className="text-emerald-600 animate-pulse" />
    }
  ];

  const [selectedQuartileIndex, setSelectedQuartileIndex] = useState(0); // 0 = All, 1 = Q4, 2 = Q3, 3 = Q2, 4 = Q1
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const filterPopoverRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target)) {
        setShowFilterPopover(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const steps = ['All', 'Q4', 'Q3', 'Q2', 'Q1'];

  const visibleArticles = articles.filter(article => {
    if (selectedQuartileIndex === 0) return true;
    const quartile = article.journal_quartile;
    if (!quartile) return false;
    const qNum = parseInt(quartile.replace('Q', ''));
    const limitNum = 5 - selectedQuartileIndex;
    return qNum <= limitNum;
  });

  const isAllSelected = visibleArticles.length > 0 && visibleArticles.every(art =>
    selectedPapers.some(p => p.pmid === art.pmid)
  );

  return (
    <>
      {!hasSearched ? (
        <div className="text-center py-40 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors"></div>
          <div className="relative z-10">
            <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Search size={56} />
            </div>
            <h4 className="text-4xl font-black font-sds-content text-[#171717] mb-4 tracking-tight">System Idle.</h4>
            <p className="text-slate-700 max-sm:px-6 max-w-sm mx-auto font-semibold leading-relaxed">
              Awaiting academic query parameters. Enter a topic above to initiate multi-threaded synchronization with the research hub.
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-[3rem] p-16 text-center w-full 2xl:px-12 mx-auto shadow-sm shadow-red-100">
          <AlertCircle size={64} className="text-red-600 mx-auto mb-8" />
          <h4 className="text-3xl font-black font-sds-content text-red-900 mb-4 tracking-tight">Sync Interrupted</h4>
          <p className="text-red-700/70 mb-10 font-bold text-lg leading-relaxed">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => searchPubMed && searchPubMed()}
              className="px-8 py-4 bg-red-600 text-white text-xs font-black rounded-[12px] hover:bg-red-700 transition-all shadow-sm shadow-red-200 uppercase tracking-widest cursor-pointer"
            >
              Retry Protocol
            </button>
            {onRetryDeviceSync && (
              <button
                onClick={onRetryDeviceSync}
                className="px-8 py-4 bg-slate-900 text-white text-xs font-black rounded-[12px] hover:bg-slate-800 transition-all shadow-sm shadow-slate-200 uppercase tracking-widest cursor-pointer"
              >
                Retry Device Registration
              </button>
            )}
          </div>
        </div>
      ) : loading ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center gap-6"
        >
          {/* Header Row: Status Pulse & Percentage Counter */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Synthesizing Literature & Evidence
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-sds-content">
              <span className="text-3xl font-black text-blue-600 tracking-tight">
                {loadingProgress}%
              </span>
            </div>
          </div>

          {/* Progress Bar (Frameless & Sleek) */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </div>

          {/* Frameless Stepper Timeline */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            {stages.map((stg, idx) => {
              const isCompleted = currentStage > idx;
              const isActive = currentStage === idx;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-start gap-1 transition-all ${
                    isCompleted
                      ? 'text-slate-800'
                      : isActive
                      ? 'text-blue-600'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : isActive ? (
                      <Loader2 size={16} className="text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {stg.level}
                    </span>
                  </div>
                  <span className={`text-xs font-bold truncate max-w-full ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {stg.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Stage Description Line */}
          <div className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-slate-50/80 border border-slate-100 rounded-2xl">
            <div className="text-blue-600 shrink-0">
              {stages[currentStage].icon}
            </div>
            <p className="text-xs font-semibold text-slate-600 text-center truncate">
              {stages[currentStage].desc}
            </p>
          </div>

          {/* Frameless Tip Line */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Lightbulb size={14} className="text-amber-500 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={tipIndex}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                {RESEARCH_TIPS[tipIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* STOP ANALYSIS Control Button */}
          {cancelSearch && (
            <button
              type="button"
              onClick={() => {
                if (cancelSearch) cancelSearch();
              }}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200/80 rounded-xl text-[11px] font-bold transition-all shadow-sm cursor-pointer group"
            >
              <Square size={10} className="fill-rose-600 text-rose-600 group-hover:scale-125 transition-transform shrink-0" />
              <span>STOP ANALYSIS</span>
            </button>
          )}

          {/* Skeleton Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full opacity-40 pointer-events-none mt-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </motion.div>


      ) : hasSearched && visibleArticles.length === 0 ? (
        <div className="text-center py-20 px-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm w-full 2xl:px-12 mx-auto">
          <div className="w-20 h-20 bg-slate-50 text-slate-600 rounded-[12px] flex items-center justify-center mx-auto mb-6">
            <Filter size={40} />
          </div>
          <h4 className="text-2xl font-black font-sds-content text-[#171717] mb-2">
            {articles && articles.length > 0 ? "No records match your active filters" : "No Academic Papers Found"}
          </h4>
          <p className="text-slate-700 max-w-md mx-auto font-medium text-xs leading-relaxed mb-8">
            {articles && articles.length > 0
              ? `You have ${articles.length} validated articles loaded, but they are filtered out by your active SJR Quality setting.`
              : "We couldn't find exact matches for your search query. Try one of our recommended high-yield research topics below:"}
          </p>

          {articles && articles.length > 0 && selectedQuartileIndex !== 0 ? (
            <button
              onClick={() => { setSelectedQuartileIndex(0); if (clearFilters) clearFilters(); }}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-[12px] transition-all shadow-md shadow-blue-200 cursor-pointer"
            >
              Reset Quality Filter ({articles.length} Papers Available)
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 mb-3">Suggested Research Queries</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "CRISPR-Cas9 Gene Editing Innovations",
                  "Deep Learning for Protein Structure Folding",
                  "Single-Cell RNA Sequencing Cancer Genomics",
                  "Quantum Computing Error Correction",
                  "Transformer Models in Biomedical NLP"
                ].map((suggestedQuery) => (
                  <button
                    key={suggestedQuery}
                    onClick={() => searchPubMed && searchPubMed(null, suggestedQuery)}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-[12px] text-xs font-semibold text-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Search size={12} className="text-slate-600" />
                    <span>{suggestedQuery}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-full">
          {/* Layout View Toggle Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-slate-100 px-6 py-3.5 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative w-full max-w-full">
            {/* Left Side: Select All & Count */}
            <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-start">
              {onToggleSelectAll && (
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onToggleSelectAll(visibleArticles, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#171717] focus:ring-slate-900/20 cursor-pointer accent-slate-900"
                  />
                  Select All
                </label>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                Found {visibleArticles.length} academic papers
              </span>
            </div>

            {/* Middle: Filter Popover & Export Session */}
            <div className="flex items-center justify-center gap-3 w-full sm:w-auto relative" ref={filterPopoverRef}>
              <button
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                className={`flex items-center gap-2 px-4 py-3 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  selectedQuartileIndex !== 0
                    ? 'bg-slate-900 text-white shadow-md border border-slate-900'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <SlidersHorizontal size={12} />
                Filter {selectedQuartileIndex !== 0 && `(${steps[selectedQuartileIndex]})`}
              </button>

              <button
                onClick={handleExportSessionToExcel}
                className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                <FileSpreadsheet size={12} />
                Export Session
              </button>

              <AnimatePresence>
                {showFilterPopover && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-12 sm:bottom-auto sm:top-12 left-1/2 -translate-x-1/2 z-[100] w-72 bg-white border border-slate-200 rounded-[12px] shadow-sm p-6"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                          Journal Quality
                        </span>
                        {selectedQuartileIndex !== 0 && (
                          <button
                            onClick={() => setSelectedQuartileIndex(0)}
                            className="text-[9px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-100 p-1 rounded-[12px] flex gap-1 w-full">
                        {steps.map((step, idx) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => setSelectedQuartileIndex(idx)}
                            className={`flex-1 py-3 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                              idx === selectedQuartileIndex
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-650'
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>

                      <p className="text-[9.5px] text-slate-600 font-semibold leading-normal">
                        {selectedQuartileIndex === 0
                          ? 'Showing all papers regardless of quartile.'
                          : `Showing papers ranked ${steps[selectedQuartileIndex]} or higher.`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Layout Toggle */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-[12px] w-full sm:w-auto justify-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-3 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-600'
                  }`}
              >
                <LayoutGrid size={12} /> Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-3 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-600'
                  }`}
              >
                <List size={12} /> Table
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {visibleArticles.map((article, idx) => (
                <ArticleCard
                  key={`${article.pmid}-${idx}`}
                  article={article}
                  user={user}
                  userTier={userTier}
                  bookmarkCount={bookmarkCount}
                  onBookmarkSaved={fetchBookmarkCount}
                  onAuthRequired={() => setShowAuthModal(true)}
                  onPaperClick={onPaperClick}
                  isSelected={selectedPapers.some(p => p.pmid === article.pmid)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full overflow-x-auto bg-white rounded-[2rem] border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {onToggleSelect && <th className="px-6 py-4 w-10"></th>}
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Title & Journal</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Authors</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Published Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">PMID / Database ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {visibleArticles.map((article, idx) => (
                    <TableRow
                      key={`${article.pmid}-${idx}`}
                      article={article}
                      user={user}
                      userTier={userTier}
                      bookmarkCount={bookmarkCount}
                      onBookmarkSaved={fetchBookmarkCount}
                      onAuthRequired={() => setShowAuthModal(true)}
                      onPaperClick={onPaperClick}
                      isSelected={selectedPapers.some(p => p.pmid === article.pmid)}
                      onToggleSelect={onToggleSelect}
                    />
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
};

export default ArticleGrid;
