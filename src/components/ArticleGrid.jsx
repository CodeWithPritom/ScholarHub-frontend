import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, AlertCircle, Bookmark, Check, Loader2, Library, 
  FolderPlus, Calendar, Users, Copy, Database, ChevronUp, 
  Filter, RefreshCcw, LayoutGrid, Quote, X, List
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { generateCitation } from '../utils/citationUtils';
import { toast } from 'sonner';

const SkeletonCard = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
      <div className="h-6 bg-slate-200 rounded-full w-24"></div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
    </div>
    <div className="flex justify-end pt-4">
      <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
    </div>
  </div>
);

const getExternalUrl = (pmid, source) => {
  if (!pmid) return '';
  if (source === 'arxiv') return `https://arxiv.org/abs/${pmid}`;
  if (source === 'scholar') return `https://www.semanticscholar.org/paper/${pmid}`;
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}`;
};

const ArticleCard = ({ article, user, userTier, bookmarkCount, onAuthRequired, onBookmarkSaved }) => {
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

  const isLimitReached = userTier === 'free' && bookmarkCount >= 20;

  const handleOpenDetail = () => {
    navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article } });
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
    if (isLimitReached) return;
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
      
      const finalUrl = article.url || getExternalUrl(pmid, finalSource);
      const insertData = { user_id: user.id, pmid, title, journal, source: finalSource, url: finalUrl };
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
      className="group bg-white hover:bg-slate-50/30 rounded-[2rem] border border-slate-100 hover:border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col cursor-pointer relative"
      onClick={handleOpenDetail}
    >

      <div className="p-8 flex-1">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                <BookOpen size={14} />
                {journal}
              </span>
              {article.journal_quartile && (
                <span className={`inline-flex items-center px-2 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  article.journal_quartile === 'Q1' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100' :
                  article.journal_quartile === 'Q2' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm shadow-indigo-100' :
                  article.journal_quartile === 'Q3' ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100' :
                  'bg-slate-50 text-slate-500 border-slate-200 shadow-sm shadow-slate-100'
                }`}>
                  {article.journal_quartile}
                </span>
              )}
            </div>
            {article.citationCount !== undefined && article.citationCount !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest" title={`${article.influentialCitationCount || 0} Influential`}>
                <Quote size={12} />
                {article.citationCount} Citations
              </span>
            )}
          </div>
          <div className="relative" ref={albumRef}>
            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkStatus === 'saving' || isLimitReached}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isLimitReached
                  ? 'bg-slate-50 border-2 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                  : bookmarkStatus === 'saved'
                  ? 'bg-green-50 border-2 border-green-200 text-green-600 shadow-lg shadow-green-100 scale-110'
                  : bookmarkStatus === 'exists'
                  ? 'bg-amber-50 border-2 border-amber-200 text-amber-600'
                  : bookmarkStatus === 'saving'
                  ? 'bg-blue-50 border-2 border-blue-200 text-blue-600 animate-pulse'
                  : 'bg-white border-2 border-slate-100 text-slate-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100 hover:scale-110'
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
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-12 right-0 z-30 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Save to Album</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <button
                      onClick={() => saveToAlbum(null)}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Library size={14} className="text-slate-400" /> General (Default)
                    </button>
                    {albums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => saveToAlbum(album.id)}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FolderPlus size={14} className="text-slate-400" /> {album.name}
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
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold outline-none focus:border-blue-300 text-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                        <FolderPlus size={14} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-4 line-clamp-2">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-300" />
            {date}
          </div>
          <div className="flex items-center gap-2 max-w-[150px]">
            <Users size={14} className="text-slate-300 shrink-0" />
            <span className="truncate">{authors}</span>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-100">
                {kw}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="px-2 py-0.5 text-slate-300 text-[9px] font-bold">+{keywords.length - 3}</span>
            )}
          </div>
        )}

        <div className="relative">
          <div className="overflow-hidden text-slate-600 text-sm leading-relaxed line-clamp-3 font-medium">
            {abstract}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white group-hover:from-slate-50/50 to-transparent"></div>
        </div>

        <div className="mt-6 flex items-center justify-start">
          <button
            onClick={handleCopyCitation}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              citationCopied
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-white text-slate-400 border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            {citationCopied ? <Check size={12} /> : <Copy size={12} />}
            {citationCopied ? 'Copied!' : 'Copy Citation'}
          </button>
        </div>
      </div>

      <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
          <Database size={12} />
          PMID: {pmid}
        </span>
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
          <ChevronUp size={14} className="rotate-90" />
        </div>
      </div>
    </motion.div>
  );
};

const TableRow = ({ article, user, userTier, bookmarkCount, onAuthRequired, onBookmarkSaved }) => {
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

  const isLimitReached = userTier === 'free' && bookmarkCount >= 20;

  const handleOpenDetail = () => {
    navigate(`/paper/${encodeURIComponent(pmid)}`, { state: { article } });
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
    if (isLimitReached) return;
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
      
      const finalUrl = article.url || getExternalUrl(pmid, finalSource);
      const insertData = { user_id: user.id, pmid, title, journal, source: finalSource, url: finalUrl };
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
      {/* Column 1: Title & Source */}
      <td className="px-6 py-4 max-w-lg min-w-[280px]">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
              {journal}
            </span>
            {article.journal_quartile && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                article.journal_quartile === 'Q1' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                article.journal_quartile === 'Q2' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                article.journal_quartile === 'Q3' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-slate-50 text-slate-500 border-slate-100'
              }`}>
                {article.journal_quartile}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Column 2: Authors */}
      <td className="px-6 py-4 max-w-[220px]">
        <span className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed">
          {authors}
        </span>
      </td>

      {/* Column 3: Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {date}
        </span>
      </td>

      {/* Column 4: PMID / Database ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
          {pmid}
        </span>
      </td>

      {/* Column 5: Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2 relative">
          
          {/* Copy Citation Button */}
          <button
            onClick={handleCopyCitation}
            className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              citationCopied
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-white text-slate-400 border border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isLimitReached
                  ? 'bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                  : bookmarkStatus === 'saved'
                  ? 'bg-green-50 border border-green-200 text-green-600 shadow-lg shadow-green-100'
                  : bookmarkStatus === 'exists'
                  ? 'bg-amber-50 border border-amber-200 text-amber-600'
                  : bookmarkStatus === 'saving'
                  ? 'bg-blue-50 border border-blue-200 text-blue-600 animate-pulse'
                  : 'bg-white border border-slate-200 text-slate-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
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
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-10 z-30 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden text-left"
                >
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Save to Album</p>
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    <button
                      onClick={() => saveToAlbum(null)}
                      className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                    >
                      <Library size={12} className="text-slate-400" /> Default
                    </button>
                    {albums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => saveToAlbum(album.id)}
                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                      >
                        <FolderPlus size={12} className="text-slate-400" /> {album.name}
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
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all"
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
  fetchBookmarkCount, setShowAuthModal, loading, error, searchPubMed, portal, cancelSearch 
}) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }
    const t1 = setTimeout(() => setLoadingStage(1), 1000);
    const t2 = setTimeout(() => setLoadingStage(2), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  const getPortalLoadingSteps = () => {
    switch(portal) {
      case 'eng': return [
        { text: "Connecting to arXiv Engineering Hub...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Pulling Computer Science Preprints...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      case 'physics': return [
        { text: "Syncing with Physics Archive...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Gathering Quantum Research...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      case 'math': return [
        { text: "Calculating Mathematical Context...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Fetching Theory Records...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      case 'social':
      case 'law': return [
        { text: "Scanning Global Scholar Databases...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Structuring Social/Legal Insights...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      case 'geb': return [
        { text: "Syncing with Genetic Engineering DB...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Extracting GEB Metadata...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      case 'pharma': return [
        { text: "Syncing with Pharmacology DB...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Extracting Pharmacological Metadata...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      case 'chem': return [
        { text: "Syncing with Chemistry Archives...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Extracting Chemical Metadata...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
      default: return [
        { text: "Syncing with Global Research Databases...", icon: <RefreshCcw size={24} className="text-blue-600 animate-spin" /> },
        { text: "Extracting Academic Metadata...", icon: <Database size={24} className="text-indigo-600 animate-pulse" /> },
        { text: "Structuring data for you...", icon: <LayoutGrid size={24} className="text-emerald-600 animate-pulse" /> }
      ];
    }
  };
  const loadingSteps = getPortalLoadingSteps();

  return (
    <>
      {!hasSearched ? (
        <div className="text-center py-40 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors"></div>
          <div className="relative z-10">
            <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Search size={56} />
            </div>
            <h4 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">System Idle.</h4>
            <p className="text-slate-500 max-sm:px-6 max-w-sm mx-auto font-semibold leading-relaxed">
              Awaiting academic query parameters. Enter a topic above to initiate multi-threaded synchronization with the research hub.
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-[3rem] p-20 text-center max-w-4xl mx-auto shadow-2xl shadow-red-100">
          <AlertCircle size={64} className="text-red-600 mx-auto mb-8" />
          <h4 className="text-3xl font-black text-red-900 mb-4 tracking-tight">Sync Interrupted</h4>
          <p className="text-red-700/70 mb-10 font-bold text-lg leading-relaxed">{error}</p>
          <button 
            onClick={() => searchPubMed()}
            className="px-12 py-5 bg-red-600 text-white text-xs font-black rounded-2xl hover:bg-red-700 transition-all shadow-2xl shadow-red-200 uppercase tracking-widest"
          >
            Retry Protocol
          </button>
        </div>
      ) : loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-20 space-y-16"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <motion.div 
                className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              {loadingSteps[loadingStage].icon}
            </div>
            
            <motion.p 
              key={loadingStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 text-center"
            >
              {loadingSteps[loadingStage].text}
            </motion.p>
            
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: '0%' }}
                animate={{ width: `${((loadingStage + 1) / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {cancelSearch && (
              <button 
                onClick={cancelSearch}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 mx-auto mt-8 relative z-50"
              >
                <X size={14} />
                Cancel Search
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full opacity-50 pointer-events-none">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </motion.div>
      ) : hasSearched && articles.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="w-28 h-28 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
            <Filter size={56} />
          </div>
          <h4 className="text-3xl font-black text-slate-900 mb-4">No Records Found</h4>
          <p className="text-slate-400 max-w-sm mx-auto font-bold mb-10 uppercase tracking-widest text-xs">Adjust your search parameters or date range for better results.</p>
          <button onClick={clearFilters} className="text-blue-600 text-sm font-black uppercase tracking-widest hover:underline">Reset Search Filters</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Layout View Toggle Selector */}
          <div className="flex justify-between items-center bg-white border border-slate-100 px-6 py-3.5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Found {articles.length} academic papers
            </span>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid size={12} /> Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={12} /> Table
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {articles.map((article, idx) => (
                <ArticleCard 
                  key={`${article.pmid}-${idx}`}
                  article={article} 
                  user={user} 
                  userTier={userTier}
                  bookmarkCount={bookmarkCount}
                  onBookmarkSaved={fetchBookmarkCount}
                  onAuthRequired={() => setShowAuthModal(true)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full overflow-x-auto bg-white rounded-[2rem] border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Title & Journal</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Authors</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Published Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">PMID / Database ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {articles.map((article, idx) => (
                    <TableRow 
                      key={`${article.pmid}-${idx}`}
                      article={article}
                      user={user}
                      userTier={userTier}
                      bookmarkCount={bookmarkCount}
                      onBookmarkSaved={fetchBookmarkCount}
                      onAuthRequired={() => setShowAuthModal(true)}
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
