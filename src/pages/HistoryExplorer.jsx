import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Trash2, ArrowLeft, MessageSquare, Clock, FileText, Microscope, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import WorkspaceLayout from '../components/WorkspaceLayout';
import { supabase } from '../supabaseClient';

const HistoryExplorer = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_history')
        .select('id, user_id, title, papers, chat_history, workflow, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch audit_history error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load history from cloud.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('audit_history')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Supabase delete audit_history error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      setSessions(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new Event('auditSessionDeleted'));
      toast.success('Session deleted.');
    } catch (err) {
      console.error('Error deleting session:', err);
      toast.error('Failed to delete session.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;
    try {
      const { error } = await supabase
        .from('audit_history')
        .delete()
        .eq('user_id', user.id);
      if (error) {
        console.error('Supabase clear audit_history error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      setSessions([]);
      window.dispatchEvent(new Event('auditSessionDeleted'));
      toast.success('All history cleared.');
    } catch (err) {
      console.error('Error clearing history:', err);
      toast.error('Failed to clear history.');
    }
  };

  const handleReload = async (session) => {
    try {
      toast.loading('Fetching session context...');
      const { data, error } = await supabase
        .from('audit_history')
        .select('id, user_id, title, papers, chat_history, workflow, created_at, updated_at')
        .eq('id', session.id)
        .single();

      toast.dismiss();
      if (error) {
        console.error('Supabase reload audit_history error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      navigate('/auditor', { state: { reloadSession: data } });
    } catch (err) {
      toast.dismiss();
      console.error('Error reloading session:', err);
      toast.error('Failed to reload session.');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <WorkspaceLayout user={user} onLogout={onLogout}>
      <div className="-mx-4 -my-6 md:-mx-6 md:-my-10 bg-slate-50 text-slate-900 min-h-[calc(100vh-64px)] flex flex-col font-sans">

        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <History size={18} className="text-slate-500" />
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">History Explorer</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">All past audit sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quota Badge */}
            <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
              <span className={sessions.length >= 100 ? 'text-amber-600 font-extrabold' : 'text-slate-800'}>
                {sessions.length}
              </span>
              <span className="text-slate-400 font-medium"> / 100 Sessions</span>
            </div>

            {sessions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => navigate('/auditor')}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} />
              Back to Auditor
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-full mx-auto w-full">

            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs text-slate-400 font-medium">Loading history...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20">
                <Clock size={40} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-600 mb-2">No Sessions Yet</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                  Start an audit session from the Research Auditor to see your history here.
                </p>
                <button
                  onClick={() => navigate('/auditor')}
                  className="mt-6 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  Start Auditing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const isExpanded = expandedId === session.id;
                  return (
                    <div
                      key={session.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
                    >
                      {/* Session Row */}
                      <div
                        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      >
                        {session.workflow === 'research' ? (
                          <Microscope size={18} className="text-indigo-500 shrink-0" />
                        ) : session.workflow === 'systematic' ? (
                          <BarChart2 size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <MessageSquare size={18} className="text-blue-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{session.title}</h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {formatDate(session.updated_at || session.created_at)} · {session.papers?.length || 0} papers
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReload(session); }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Reload
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                            className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-3">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Query / Topic</span>
                            <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                              {session.chat_history?.find(m => m.role === 'user')?.content || session.title}
                            </p>
                          </div>
                          {session.papers && session.papers.length > 0 && (
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Papers Used</span>
                              <div className="space-y-1.5">
                                {session.papers.map((p, idx) => (
                                  <div key={p.pmid || idx} className="flex items-center gap-2 text-xs text-slate-600">
                                    <FileText size={11} className="text-slate-400 shrink-0" />
                                    <span className="truncate font-medium">{p.title}</span>
                                    {p.journal_quartile && (
                                      <span className="text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 rounded shrink-0">
                                        {p.journal_quartile}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>
    </WorkspaceLayout>
  );
};

export default HistoryExplorer;
