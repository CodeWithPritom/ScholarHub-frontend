import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, LogOut, User, Library, Search, Bookmark, 
  Trash2, FolderPlus, Folder, Calendar, BookOpen, Database, 
  Check, AlertCircle, Loader2, ExternalLink, Pencil, X, Settings, ChevronDown
} from 'lucide-react'

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
  const [toast, setToast] = useState(null)
  
  // Album Management
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [editAlbumName, setEditAlbumName] = useState('')
  const [deletingAlbum, setDeletingAlbum] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </button>
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors">
                <User size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} className="text-blue-600 ml-1" />
              </div>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-[100]">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <User size={16} />
                  My Account
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Settings size={16} />
                  Settings
                </Link>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-left">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl ${
              toast.type === 'success'
                ? 'bg-green-500 text-white shadow-green-200'
                : 'bg-red-500 text-white shadow-red-200'
            }`}
          >
            {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-28 pb-32 max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-10">
        
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
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-[0.95] mb-2">
              {selectedAlbum === null ? 'General Collection' : albums.find(a => a.id === selectedAlbum)?.name || 'Album'}
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'Paper' : 'Papers'}
            </p>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="group bg-white rounded-3xl border border-slate-200/60 hover:border-blue-300 shadow-sm hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 p-6 flex items-start gap-6"
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
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <Database size={10} />
                        PMID: {bookmark.pmid}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
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
      </main>
    </div>
  )
}

export default MyLibrary
