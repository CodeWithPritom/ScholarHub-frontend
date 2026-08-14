import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from './supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, LogOut, User, Library, Search, Bookmark, 
  Trash2, FolderPlus, Folder, Calendar, BookOpen, Database, 
  Check, AlertCircle, Loader2, ExternalLink, Pencil, X, Settings, ChevronDown, Copy, CheckCircle
} from 'lucide-react'
import WorkspaceLayout from './components/WorkspaceLayout'
import { 
  generateCitation, 
  generateBibTeX, 
  generateRIS, 
  generateAPABibliographyText, 
  generateExcelCSV, 
  generateStructuredJSON, 
  downloadFile 
} from './utils/citationUtils'

const getExternalUrl = (pmid, source) => {
  if (!pmid) return '';
  if (source === 'arxiv') return `https://arxiv.org/abs/${pmid}`;
  if (source === 'scholar') return `https://www.semanticscholar.org/paper/${pmid}`;
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}`;
};

const MyLibrary = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null) // null means 'General'
  
  const [loading, setLoading] = useState(true)
  const [removingBookmark, setRemovingBookmark] = useState(null)
  const [selectedDetailPaper, setSelectedDetailPaper] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  // Album Management
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [editAlbumName, setEditAlbumName] = useState('')
  const [deletingAlbum, setDeletingAlbum] = useState(null)

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message)
    else toast.error(message)
  }

  const copyCitation = (paper) => {
    const citation = generateCitation(paper.full_metadata || paper, 'apa');
    navigator.clipboard.writeText(citation);
    toast.success('Citation copied to clipboard!');
  };

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bookmarksRes, albumsRes] = await Promise.all([
        supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('albums').select('*').eq('user_id', user.id).order('name')
      ])

      if (bookmarksRes.error) throw bookmarksRes.error
      if (albumsRes.error) throw albumsRes.error

      setBookmarks(bookmarksRes.data || [])
      setAlbums(albumsRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      showToast('Failed to load library.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (id, pmid) => {
    setRemovingBookmark(pmid)
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)
      if (error) throw error
      setBookmarks(prev => prev.filter(b => b.id !== id))
      showToast('Paper removed.')
    } catch (err) {
      console.error('Error removing bookmark:', err)
      showToast('Failed to remove.', 'error')
    } finally {
      setRemovingBookmark(null)
    }
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    if (!newAlbumName.trim()) return
    try {
      const { data, error } = await supabase
        .from('albums')
        .insert({ user_id: user.id, name: newAlbumName.trim() })
        .select()
        .single()
      if (error) throw error
      setAlbums(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewAlbumName('')
      setIsCreatingAlbum(false)
      showToast('Album created.')
    } catch (err) {
      showToast('Failed to create album.', 'error')
    }
  }

  const handleRenameAlbum = async (id) => {
    if (!editAlbumName.trim()) return
    try {
      const { error } = await supabase
        .from('albums')
        .update({ name: editAlbumName.trim() })
        .eq('id', id)
      if (error) throw error
      setAlbums(prev => prev.map(a => a.id === id ? { ...a, name: editAlbumName.trim() } : a).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingAlbum(null)
      showToast('Album renamed.')
    } catch (err) {
      showToast('Failed to rename.', 'error')
    }
  }

  const handleDeleteAlbum = async (id) => {
    setDeletingAlbum(id)
    try {
      const { error } = await supabase.from('albums').delete().eq('id', id)
      if (error) throw error
      setAlbums(prev => prev.filter(a => a.id !== id))
      setBookmarks(prev => prev.map(b => b.album_id === id ? { ...b, album_id: null } : b))
      if (selectedAlbum === id) setSelectedAlbum(null)
      showToast('Album deleted.')
    } catch (err) {
      showToast('Failed to delete album.', 'error')
    } finally {
      setDeletingAlbum(null)
    }
  }

  const filteredBookmarks = bookmarks.filter(b => b.album_id === selectedAlbum)

  return (
    <WorkspaceLayout user={user} onLogout={onLogout}>
      {/* Storage Overview Banner */}
      <div className="mb-8 bg-white rounded-[12px] p-6 border border-[#E5E5DF] shadow-sm text-[#171717] flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
            <Library size={24} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] tracking-tight">Storage Overview</h3>
            <p className="text-[11px] font-semibold text-slate-700 mt-1">
              You have used <span className="font-bold text-emerald-600">{bookmarks.length}</span> out of <span className="font-bold text-[#171717]">200</span> total paper slots in your library.
            </p>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md flex flex-col gap-2 relative z-10 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usage</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{Math.round((bookmarks.length / 200) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-[#F3F3EF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, (bookmarks.length / 200) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="w-full h-full flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Collections</h3>
              <button 
                onClick={() => setIsCreatingAlbum(!isCreatingAlbum)}
                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            <AnimatePresence>
              {isCreatingAlbum && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateAlbum}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Album name"
                      className="flex-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                    <button type="submit" disabled={!newAlbumName.trim()} className="px-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
                      Add
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedAlbum(null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  selectedAlbum === null 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Library size={16} /> General
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${selectedAlbum === null ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {bookmarks.filter(b => b.album_id === null).length}
                </span>
              </button>

              {albums.map(album => (
                <div key={album.id} className="group relative">
                  {editingAlbum === album.id ? (
                    <div className="flex gap-2 px-2 py-2">
                      <input
                        autoFocus
                        type="text"
                        value={editAlbumName}
                        onChange={(e) => setEditAlbumName(e.target.value)}
                        className="flex-1 w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameAlbum(album.id)}
                      />
                      <button onClick={() => handleRenameAlbum(album.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg"><Check size={14}/></button>
                      <button onClick={() => setEditingAlbum(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><X size={14}/></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAlbum(album.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        selectedAlbum === album.id 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-sm truncate pr-2">
                        <Folder size={16} className="shrink-0" /> <span className="truncate">{album.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${selectedAlbum === album.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {bookmarks.filter(b => b.album_id === album.id).length}
                        </span>
                        
                        {/* Hover Actions */}
                        <div className={`hidden group-hover:flex items-center gap-1 ${selectedAlbum === album.id ? 'text-blue-200' : 'text-slate-400'}`}>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setEditAlbumName(album.name); setEditingAlbum(album.id); }}
                            className="p-1 hover:bg-black/10 rounded cursor-pointer"
                          >
                            <Pencil size={12} />
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                            className="p-1 hover:bg-red-500 hover:text-white rounded cursor-pointer transition-colors"
                          >
                            {deletingAlbum === album.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1">

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-[0.95] mb-2">
                {selectedAlbum === null ? 'General Collection' : albums.find(a => a.id === selectedAlbum)?.name || 'Album'}
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'Paper' : 'Papers'}
              </p>
            </div>

            {filteredBookmarks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  Export Collection <ChevronDown size={14} />
                </button>

                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                      <button
                        onClick={() => {
                          setShowExportMenu(false);
                          const papers = filteredBookmarks.map(b => b.full_metadata || b);
                          const csvData = generateExcelCSV(papers);
                          downloadFile(csvData, `Library_Collection_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
                          toast.success('Collection exported to Excel CSV!');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">📊 <span>Excel Spreadsheet (.csv)</span></span>
                      </button>
                      <button
                        onClick={() => {
                          setShowExportMenu(false);
                          const papers = filteredBookmarks.map(b => b.full_metadata || b);
                          const bibData = generateBibTeX(papers);
                          downloadFile(bibData, `Library_Collection_${Date.now()}.bib`, 'application/x-bibtex;charset=utf-8;');
                          toast.success('BibTeX Bibliography downloaded!');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">📚 <span>BibTeX Bibliography (.bib)</span></span>
                      </button>
                      <button
                        onClick={() => {
                          setShowExportMenu(false);
                          const papers = filteredBookmarks.map(b => b.full_metadata || b);
                          const risData = generateRIS(papers);
                          downloadFile(risData, `Library_Collection_${Date.now()}.ris`, 'application/x-research-info-systems;charset=utf-8;');
                          toast.success('RIS Citations downloaded!');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">🔖 <span>RIS Citation File (.ris)</span></span>
                      </button>
                      <button
                        onClick={() => {
                          setShowExportMenu(false);
                          const papers = filteredBookmarks.map(b => b.full_metadata || b);
                          const apaData = generateAPABibliographyText(papers);
                          downloadFile(apaData, `Library_APA_Bibliography_${Date.now()}.txt`, 'text/plain;charset=utf-8;');
                          toast.success('APA 7th Bibliography downloaded!');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">📖 <span>APA Bibliography (.txt)</span></span>
                      </button>
                      <button
                        onClick={() => {
                          setShowExportMenu(false);
                          const papers = filteredBookmarks.map(b => b.full_metadata || b);
                          const jsonData = generateStructuredJSON(papers);
                          downloadFile(jsonData, `Library_Collection_${Date.now()}.json`, 'application/json;charset=utf-8;');
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
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-6 py-32">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Library size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Bookmark size={32} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Empty Album</h4>
              <p className="text-slate-400 max-w-xs mx-auto font-bold mb-8 uppercase tracking-widest text-[10px]">
                Search for papers and save them to this collection.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-blue-200 inline-flex items-center gap-2"
              >
                <Search size={14} />
                Find Papers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookmarks.map((bookmark, idx) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  exit={{ opacity: 0 }}
                  className="group bg-white rounded-3xl border border-slate-200/60 hover:border-blue-300 shadow-sm hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 p-6 flex items-start gap-6 cursor-pointer"
                  onClick={() => setSelectedDetailPaper(bookmark)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                      {bookmark.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                        <BookOpen size={10} />
                        {bookmark.journal || 'Unknown Journal'}
                      </span>
                      {(bookmark.full_metadata?.verified_metadata || bookmark.full_metadata?.sources?.length > 1) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-indigo-50 border border-indigo-100 text-indigo-750 uppercase tracking-widest shadow-sm">
                          <CheckCircle size={10} className="text-indigo-500" />
                          Verified
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <Database size={10} />
                        PMID: {bookmark.pmid}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={bookmark.url || getExternalUrl(bookmark.pmid, bookmark.source)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                      title="View on PubMed"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.id, bookmark.pmid)}
                      disabled={removingBookmark === bookmark.pmid}
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all disabled:opacity-50"
                      title="Remove Bookmark"
                    >
                      {removingBookmark === bookmark.pmid ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Modal: Paper Detail */}
      <AnimatePresence>
        {selectedDetailPaper && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={() => setSelectedDetailPaper(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-[2rem] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 bg-white flex items-start justify-between shrink-0 gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                    {selectedDetailPaper.source || 'Database'} Record
                  </span>
                  {(selectedDetailPaper.full_metadata?.verified_metadata || selectedDetailPaper.full_metadata?.sources?.length > 1) && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-750 text-[9px] font-black uppercase tracking-wider shadow-sm">
                      <CheckCircle size={10} className="text-indigo-500" />
                      Verified Metadata
                    </span>
                  )}
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {selectedDetailPaper.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDetailPaper(null)}
                  className="p-2 text-slate-400 hover:text-slate-650 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Authors */}
                {selectedDetailPaper.full_metadata?.authors && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Authors</h4>
                    <p className="text-sm font-semibold text-slate-700">
                      {Array.isArray(selectedDetailPaper.full_metadata.authors) 
                        ? selectedDetailPaper.full_metadata.authors.join(', ') 
                        : selectedDetailPaper.full_metadata.authors}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white border border-slate-200/60 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Journal</h5>
                    <p className="text-xs font-bold text-slate-700 truncate" title={selectedDetailPaper.journal || '—'}>
                      {selectedDetailPaper.journal || '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Year / Date</h5>
                    <p className="text-xs font-bold text-slate-700">
                      {selectedDetailPaper.full_metadata?.date || selectedDetailPaper.full_metadata?.year || '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">DOI</h5>
                    <p className="text-xs font-bold text-slate-700 truncate" title={selectedDetailPaper.full_metadata?.doi || '—'}>
                      {selectedDetailPaper.full_metadata?.doi || '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Citations</h5>
                    <p className="text-xs font-bold text-slate-700">
                      {selectedDetailPaper.full_metadata?.citationCount ?? selectedDetailPaper.full_metadata?.citations ?? '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Journal Quartile</h5>
                    <p className="text-xs font-bold text-slate-700">
                      {selectedDetailPaper.full_metadata?.journal_quartile || selectedDetailPaper.full_metadata?.sjrQuartile || '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">PMID</h5>
                    <p className="text-xs font-bold text-slate-700">
                      {selectedDetailPaper.pmid || '—'}
                    </p>
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Abstract</h4>
                  <div className="p-4 bg-white border border-slate-200/60 rounded-2xl text-xs font-medium text-slate-600 leading-relaxed max-h-60 overflow-y-auto pr-2">
                    {selectedDetailPaper.full_metadata?.abstract || 'No abstract available for this paper.'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 gap-3">
                <a
                  href={selectedDetailPaper.url || getExternalUrl(selectedDetailPaper.pmid, selectedDetailPaper.source)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  View Original
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyCitation(selectedDetailPaper)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy size={14} />
                    Copy Citation
                  </button>
                  <button
                    onClick={() => setSelectedDetailPaper(null)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WorkspaceLayout>
  )
}

export default MyLibrary
