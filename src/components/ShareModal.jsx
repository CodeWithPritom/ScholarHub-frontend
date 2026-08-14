import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Share2, Copy, Check, Lock, Users, Globe, 
  UserPlus, Trash2, Shield, Sparkles, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '../utils/api';
import { supabase } from '../supabaseClient';

export const ShareModal = ({ isOpen, onClose, sessionId, sessionTitle, user }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [shareToken, setShareToken] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch share status when modal opens
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchShareConfig();
    }
  }, [isOpen, sessionId]);

  const fetchShareConfig = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/share/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        setVisibility(data.visibility || 'private');
        setPreviewEnabled(data.preview_enabled ?? true);
        setShareToken(data.share_token || null);
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch share config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisibility = async (newVisibility) => {
    setVisibility(newVisibility);
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          session_id: sessionId,
          visibility: newVisibility,
          preview_enabled: previewEnabled
        })
      });

      if (res.ok) {
        const data = await res.json();
        setShareToken(data.share_token);
        setMembers(data.members || []);
        toast.success(`Share settings updated to ${newVisibility.toUpperCase()}`);
      } else {
        toast.error('Failed to update share settings');
      }
    } catch (err) {
      console.error('Error saving share settings:', err);
      toast.error('Could not save share settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsAddingMember(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/share/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          session_id: sessionId,
          email: inviteEmail.trim(),
          access_level: 'viewer'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setInviteEmail('');
        if (visibility === 'private') {
          handleSaveVisibility('restricted');
        }
        toast.success(`Access granted to ${inviteEmail}`);
      } else {
        toast.error('Failed to invite member');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      toast.error('Could not add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/share/members/${memberId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        toast.success('Member removed');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error('Failed to remove member');
    }
  };

  const shareUrl = shareToken 
    ? `${window.location.origin}/shared/${shareToken}`
    : null;

  const handleCopyLink = () => {
    if (!shareUrl) {
      handleSaveVisibility(visibility);
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Share Research Audit</h3>
                <p className="text-xs font-semibold text-slate-500 truncate max-w-[280px]">
                  {sessionTitle || 'Audit Session'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span className="text-xs font-bold">Loading share permissions...</span>
              </div>
            ) : (
              <>
                {/* 1. Add People Input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Add Collaborators by Email
                  </label>
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <div className="relative flex-1">
                      <UserPlus size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="collaborator@university.edu"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingMember || !inviteEmail.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {isAddingMember ? <Loader2 size={14} className="animate-spin" /> : 'Invite'}
                    </button>
                  </form>
                </div>

                {/* Invited Members List */}
                {members.length > 0 && (
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Invited Collaborators ({members.length})
                    </span>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {members.map(m => (
                        <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black uppercase">
                              {m.email[0]}
                            </div>
                            <span className="text-xs font-bold text-slate-800 truncate">{m.email}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                              {m.access_level || 'Viewer'}
                            </span>
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. General Access Dropdown (Google Drive Style) */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    General Access Permissions
                  </span>

                  <div className="space-y-2">
                    {/* Option 1: Restricted */}
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      visibility === 'private'
                        ? 'bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-white/60'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={visibility === 'private'}
                        onChange={() => handleSaveVisibility('private')}
                        className="mt-1 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <Lock size={14} className="text-slate-600" />
                          <span>Restricted (Private)</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Only you can open and access this audit.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Specific People */}
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      visibility === 'restricted'
                        ? 'bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-white/60'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="restricted"
                        checked={visibility === 'restricted'}
                        onChange={() => handleSaveVisibility('restricted')}
                        className="mt-1 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <Users size={14} className="text-indigo-600" />
                          <span>Specific Collaborators</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Only invited email accounts can view full content.
                        </p>
                      </div>
                    </label>

                    {/* Option 3: Anyone with link (Public Preview) */}
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      visibility === 'public'
                        ? 'bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-white/60'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={visibility === 'public'}
                        onChange={() => handleSaveVisibility('public')}
                        className="mt-1 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <Globe size={14} className="text-emerald-600" />
                          <span>Anyone with the link</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Unauthenticated users view a branded preview with a glassmorphic wall; logged-in users get full access.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Bar / Link Copy */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={handleCopyLink}
              disabled={saving}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-xs ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-600" />
                  <span>Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-slate-500" />
                  <span>Copy Share Link</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
