import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Microscope, Library, BarChart3, Settings,
  HelpCircle, ChevronLeft, ChevronRight, X, Sparkles, History, Zap, Download,
  Newspaper, GraduationCap, BookOpen, MessageSquare
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/logo.png';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen, collapsed, setCollapsed, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [pulseActive, setPulseActive] = useState(false);
  const [historyHovered, setHistoryHovered] = useState(false);
  const [historySessions, setHistorySessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });
  const historyRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [computeCredits, setComputeCredits] = useState(1000);
  const [totalCredits, setTotalCredits] = useState(1000);
  const [savedPapersCount, setSavedPapersCount] = useState(0);
  const [exportCount, setExportCount] = useState(0);
  const [userTier, setUserTier] = useState('free');

  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('compute_credits, total_credits, export_count, user_tier')
        .eq('id', user.id)
        .single();
      if (data) {
        if (data.compute_credits !== null) setComputeCredits(data.compute_credits);
        if (data.total_credits !== null) setTotalCredits(data.total_credits);
        if (data.export_count !== null) setExportCount(data.export_count);
        if (data.user_tier) setUserTier(data.user_tier.toLowerCase());
      }

      const { count, error: countError } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (count !== null) setSavedPapersCount(count);
    } catch (err) {
      console.error('Error fetching compute credits:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();

    // Listen for custom window events triggered by API calls across the app
    const handleEvents = () => fetchCredits();
    window.addEventListener('zapsUpdated', handleEvents);
    window.addEventListener('creditsUpdated', handleEvents);
    window.addEventListener('bookmarkUpdated', handleEvents);
    window.addEventListener('exportUpdated', handleEvents);

    // 5-second polling interval for real-time live sync
    const interval = setInterval(fetchCredits, 5000);

    // Supabase Realtime Subscription for instantaneous DB updates
    let channel;
    if (user?.id) {
      channel = supabase
        .channel(`sidebar_profile_${user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          if (payload.new) {
            if (payload.new.compute_credits !== undefined) setComputeCredits(payload.new.compute_credits);
            if (payload.new.total_credits !== undefined) setTotalCredits(payload.new.total_credits);
            if (payload.new.export_count !== undefined) setExportCount(payload.new.export_count);
            if (payload.new.user_tier) setUserTier(payload.new.user_tier.toLowerCase());
          }
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('zapsUpdated', handleEvents);
      window.removeEventListener('creditsUpdated', handleEvents);
      window.removeEventListener('bookmarkUpdated', handleEvents);
      window.removeEventListener('exportUpdated', handleEvents);
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, fetchCredits]);

  useEffect(() => {
    if (location.pathname === '/auditor') {
      setPulseActive(true);
      const timer = setTimeout(() => {
        setPulseActive(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setPulseActive(false);
    }
  }, [location.pathname]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('audit_history')
        .select('id, title, workflow, papers, chat_history, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4);

      if (!error && data) {
        setHistorySessions(data);
      }
    } catch (err) {
      console.error('Error fetching sidebar history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (historyHovered && user) {
      fetchHistory();
    }
  }, [historyHovered, user?.id]);

  const handleHistoryMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHistoryHovered(true);
    if (historyRef.current) {
      const rect = historyRef.current.getBoundingClientRect();
      setPopoverCoords({
        top: rect.top,
        left: rect.right + 12
      });
    }
  };

  const handleHistoryMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHistoryHovered(false);
    }, 200);
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHistoryHovered(true);
  };

  const handlePopoverMouseLeave = () => {
    setHistoryHovered(false);
  };

  const handleSessionClick = async (session) => {
    try {
      const loadingToast = toast.loading('Loading audit session...');
      const { data, error } = await supabase
        .from('audit_history')
        .select('id, user_id, title, papers, chat_history, workflow, created_at, updated_at')
        .eq('id', session.id)
        .single();

      toast.dismiss(loadingToast);
      if (error) throw error;

      setHistoryHovered(false);
      navigate('/auditor', { state: { reloadSession: data } });
      toast.success('Session loaded successfully');
    } catch (err) {
      toast.dismiss();
      console.error('Error reloading session:', err);
      toast.error('Failed to load session context.');
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Research', path: '/research', icon: <Microscope size={20} /> },
    { name: 'Library', path: '/library', icon: <Library size={20} /> },
    { name: 'Auditor', path: '/auditor', icon: <BarChart3 size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'News', path: '/news', icon: <Newspaper size={20} /> },
    { name: 'Opportunities', path: '/opportunities', icon: <GraduationCap size={20} /> },
    { name: 'Academy', path: '/academy', icon: <BookOpen size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleSupport = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event('toggle-support-bot'));
  };

  const exportLimit = userTier === 'pro' ? 100 : userTier === 'starter' ? 50 : 10;

  return (
    <>
      {/* Mobile Backdrop (Dark & Blur) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed lg:relative top-0 left-0 bottom-0 z-[100] transition-all duration-300 h-screen shrink-0 w-72 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Main Sidebar Container (overflow-x-hidden applied here) */}
        <aside className="w-full h-full bg-sds-bg border-r border-sds-border flex flex-col shadow-sm lg:shadow-none overflow-x-hidden relative">

          {/* Header / Logo */}
          <div className={`h-16 flex items-center ${collapsed ? 'lg:justify-center' : 'justify-between px-5'} border-b border-sds-border shrink-0`}>
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-[12px] bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Sparkles size={18} className="text-sds-text" />
              </div>

              {/* Conditionally hide text on desktop collapse to prevent internal overflow */}
              <span className={`text-lg font-black tracking-tight text-sds-text whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                ScholarHub
              </span>
            </Link>

            {/* Mobile Close Button ('X') */}
            <button
              className={`lg:hidden p-2 text-slate-700 hover:text-sds-text hover:bg-sds-surface rounded-[12px] transition-colors ${collapsed ? 'lg:hidden' : 'block'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className={`flex-1 overflow-y-auto py-6 ${collapsed ? 'lg:px-2' : 'px-4'} space-y-2 scrollbar-none`}>
            {links.map((link) => {
              const isAnchor = link.path.includes('#');
              const isActive = location.pathname === link.path && !isAnchor;
              const isHistory = link.name === 'History';
              const showPulse = isHistory && pulseActive;

              const linkClasses = `flex items-center ${collapsed ? 'lg:justify-center' : 'gap-4 px-3'} py-3 rounded-[12px] text-base font-bold transition-all duration-200 group relative ${isActive
                  ? 'bg-[#315CFF] text-white shadow-sm'
                  : showPulse
                    ? 'text-slate-700 hover:bg-sds-surface hover:text-sds-text border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse'
                    : 'text-slate-700 hover:bg-sds-surface hover:text-sds-text'
                }`;

              const linkContent = (
                <>
                  <div className={`shrink-0 ${isActive
                      ? 'text-white'
                      : showPulse
                        ? 'text-sds-accent animate-pulse'
                        : 'text-slate-700 group-hover:text-blue-400'
                    }`}>
                    {link.icon}
                  </div>
                  <span className={`truncate whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                    {link.name}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="hidden lg:block absolute left-16 bg-sds-surface text-sds-text text-sm font-bold px-3 py-1.5 rounded-[12px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-sm border border-sds-border">
                      {link.name}
                    </div>
                  )}
                </>
              );

              if (isAnchor) {
                return (
                  <a key={link.name} href={link.path} onClick={() => setMobileMenuOpen(false)} className={linkClasses}>
                    {linkContent}
                  </a>
                );
              }

              if (isHistory) {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    ref={historyRef}
                    onMouseEnter={handleHistoryMouseEnter}
                    onMouseLeave={handleHistoryMouseLeave}
                    onClick={() => setMobileMenuOpen(false)}
                    className={linkClasses}
                  >
                    {linkContent}
                  </Link>
                );
              }

              return (
                <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className={linkClasses}>
                  {linkContent}
                </Link>
              );
            })}

            {/* Support Button */}
            <button onClick={handleSupport} className={`w-full relative flex items-center ${collapsed ? 'lg:justify-center' : 'gap-4 px-3'} py-3 rounded-[12px] text-base font-bold text-slate-700 hover:bg-sds-surface hover:text-sds-text transition-all duration-200 group mt-4`}>
              <div className="shrink-0 text-slate-700 group-hover:text-emerald-400">
                <HelpCircle size={20} />
              </div>
              <span className={`truncate whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                Support
              </span>
            </button>

            {/* Feedback Button */}
            <button 
              onClick={() => { setMobileMenuOpen(false); window.dispatchEvent(new Event('open-feedback-modal')); }}
              className={`w-full relative flex items-center ${collapsed ? 'lg:justify-center' : 'gap-4 px-3'} py-3 rounded-[12px] text-base font-bold text-slate-700 hover:bg-sds-surface hover:text-sds-text transition-all duration-200 group mt-2`}
            >
              <div className="shrink-0 text-slate-700 group-hover:text-amber-500">
                <MessageSquare size={20} />
              </div>
              <span className={`truncate whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                Feedback
              </span>
              {collapsed && (
                <div className="hidden lg:block absolute left-16 bg-sds-surface text-sds-text text-sm font-bold px-3 py-1.5 rounded-[12px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-sm border border-sds-border">
                  Feedback
                </div>
              )}
            </button>
            {/* Compute, Export & Storage Mini-Meter */}
            {user && (
              <div className={`mt-6 w-full pt-4 border-t border-sds-border flex flex-col gap-4 ${collapsed ? 'items-center gap-5' : 'px-3'}`}>
                {/* Compute */}
                <div className="flex flex-col w-full">
                  <div className={`flex items-center justify-between mb-1.5 ${collapsed ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Zap size={14} className="text-sds-accent drop-shadow-[0_0_2px_rgba(99,102,241,0.8)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Compute</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{computeCredits} / {totalCredits} Zaps</span>
                  </div>
                  {collapsed ? (
                    <div className="text-sds-accent drop-shadow-[0_0_2px_rgba(99,102,241,0.8)]" title={`Compute: ${computeCredits} / ${totalCredits} Zaps`}>
                      <Zap size={20} />
                    </div>
                  ) : (
                    <div className="w-full h-2 bg-sds-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        style={{ width: `${Math.min(100, Math.max(0, (computeCredits / Math.max(1, totalCredits)) * 100))}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Export Quota */}
                <div className="flex flex-col w-full">
                  <div className={`flex items-center justify-between mb-1.5 ${collapsed ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Download size={14} className="text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Export</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{exportCount} / {exportLimit} Exports</span>
                  </div>
                  {collapsed ? (
                    <div className="text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]" title={`Export Quota: ${exportCount} / ${exportLimit} Exports`}>
                      <Download size={20} />
                    </div>
                  ) : (
                    <div className="w-full h-2 bg-sds-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        style={{ width: `${Math.min(100, Math.max(0, (exportCount / Math.max(1, exportLimit)) * 100))}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Storage */}
                <div className="flex flex-col w-full">
                  <div className={`flex items-center justify-between mb-1.5 ${collapsed ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="text-sm">📚</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Storage</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{savedPapersCount} / 200 Saved</span>
                  </div>
                  {collapsed ? (
                    <div className="text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.8)]" title={`Storage: ${savedPapersCount} / 200 Saved`}>
                      <Library size={20} />
                    </div>
                  ) : (
                    <div className="w-full h-2 bg-sds-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        style={{ width: `${Math.min(100, Math.max(0, (savedPapersCount / 200) * 100))}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </aside>

        {/* Hover Popover Dropdown for History */}
        <AnimatePresence>
          {historyHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              style={{
                position: 'fixed',
                top: popoverCoords.top,
                left: popoverCoords.left,
              }}
              className="z-[250] w-80 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-[12px] p-2 origin-left"
            >
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  Recent Audits
                </span>
                {loadingHistory && (
                  <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <div className="py-1 max-h-64 overflow-y-auto space-y-0.5">
                {!user ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-700 font-medium">
                    Log in to view history
                  </div>
                ) : historySessions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-700 font-medium">
                    No history found
                  </div>
                ) : (
                  historySessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionClick(session)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-[12px] hover:bg-slate-100/80 transition-all text-left group"
                    >
                      <span className="text-base shrink-0 select-none">
                        {session.workflow === 'research' ? '🔬' : '📊'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 group-hover:text-sds-accent transition-colors truncate">
                          {session.title || 'Untitled Session'}
                        </p>
                        <p className="text-[9px] text-slate-700 font-semibold mt-0.5">
                          {session.papers?.length || 0} papers · {getRelativeTime(session.updated_at || session.created_at)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <Link
                to="/history"
                onClick={() => setHistoryHovered(false)}
                className="flex items-center justify-center py-2.5 mt-1 border-t border-slate-100 text-[10px] font-black uppercase tracking-wider text-sds-accent hover:text-indigo-750 bg-slate-50/50 hover:bg-slate-50 rounded-b-xl transition-all"
              >
                View all history →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Desktop Collapse Toggle (Rendered OUTSIDE overflow-x-hidden container) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Menu" : "Collapse Menu"}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-[200] w-8 h-8 bg-white border border-indigo-200 text-sds-accent rounded-full items-center justify-center shadow-sm hover:rotate-180 transition-all duration-500"
        >
          {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>
      </div>
    </>
  );
};

export default Sidebar;
