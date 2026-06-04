/**
 * App.jsx — Routing Shell & Global State
 * All business components live in components/ and pages/.
 * This file only manages: Auth state, Presence, and Route definitions.
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { ensureDeviceIsRegistered } from './utils/deviceSync'
import { SESSION_EXPIRED_EVENT } from './utils/api'
import { Dna, AlertTriangle, X, CreditCard } from 'lucide-react'

// Pages
import Auth from './Auth'
import LandingPage from './pages/LandingPage'
const ResearchPage = lazy(() => import('./ResearchPage'))
import MyLibrary from './MyLibrary'
import Settings from './Settings'
import VerifyEmail from './VerifyEmail'
import Archive from './pages/Archive'
import Resources from './pages/Resources'
import Pricing from './pages/Pricing'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import About from './pages/About'

// Components
import PaperDetail from './components/PaperDetail'
import AIReport from './components/AIReport'
import SupportBot from './components/SupportBot'

/**
 * SessionExpiryRedirector — Must live inside <BrowserRouter> to access useNavigate.
 * When a 402 fires anywhere in the app, App.jsx sets sessionExpired=true, and
 * this component immediately navigates the user to /pricing.
 */
function SessionExpiryRedirector({ sessionExpired, onRedirected }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionExpired) {
      navigate('/pricing', { replace: true });
      // Don't clear the flag here — let the toast stay visible on /pricing
    }
  }, [sessionExpired, navigate]);
  return null;
}

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [liveUsersCount, setLiveUsersCount] = useState(1)
  const [totalMembersCount, setTotalMembersCount] = useState(12400) // Fallback
  const [deviceLimitWarning, setDeviceLimitWarning] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [expiryMessage, setExpiryMessage] = useState('')

  // ─── Global 402 Session Expiry Handler ───
  // Listens for the custom 'scholarhub:session-expired' event fired by
  // utils/api.js apiFetch or any component calling fireSessionExpired().
  // Immediately downgrades the global profile to 'free' and triggers redirect.
  const handleSessionExpiry = useCallback((e) => {
    const detail = e.detail || 'Your premium plan has expired.';
    setExpiryMessage(detail);
    setSessionExpired(true);

    // Downgrade the global profile to free tier immediately
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, user_tier: 'free', tier: 'free' };
    });

    // Auto-dismiss expiry toast after 8 seconds
    setTimeout(() => setSessionExpired(false), 8000);
  }, []);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiry);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiry);
  }, [handleSessionExpiry]);

  // ─── Fetch Total Members ───
  useEffect(() => {
    const fetchTotalMembers = async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        if (count) setTotalMembersCount(count)
      } catch (e) { /* ignore */ }
    }
    fetchTotalMembers()
  }, [])

  // ─── Auth State Listener & Profile Fetcher ───
  useEffect(() => {
    let isMounted = true;
    
    const fetchAndSetProfile = async (sessionUser) => {
      if (!sessionUser) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsInitializing(false);
        }
        return;
      }
      
      const isFounder = sessionUser.email === 'arupbhowmikpritom@gmail.com';
      if (isMounted) setUser(sessionUser);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name, academic_field, status, user_tier, unlocked_portal')
          .eq('id', sessionUser.id)
          .maybeSingle();
          
        if (!error && data && (data.academic_field || data.unlocked_portal)) {
          if (isMounted) {
            setProfile({ ...data, tier: data.user_tier });
            setIsAdmin(data.role === 'admin' || isFounder);
          }
        } else {
          // Dynamic Default Fallback for empty data
          if (isMounted) {
            const field = sessionUser?.user_metadata?.academic_field || 'Medicine/Bio';
            const fieldMap = {
              'Medicine/Bio': 'bio',
              'Engineering/CS': 'eng',
              'Engineering': 'eng',
              'Physics': 'physics',
              'Mathematics': 'math',
              'Social Sciences': 'social',
              'Chemistry / Pharmacy': 'chem',
              'Law / Legal Studies': 'law'
            };
            const unlocked = fieldMap[field] || 'bio';

            setProfile({ 
              user_tier: 'free', 
              tier: 'free', 
              unlocked_portal: unlocked, 
              academic_field: field,
              role: 'user',
              full_name: sessionUser?.user_metadata?.full_name || 'Academic User'
            });
            setIsAdmin(isFounder);
          }
        }
      } catch {
        // Fallback Profile
        if (isMounted) {
          const field = sessionUser?.user_metadata?.academic_field || 'Medicine/Bio';
          const fieldMap = {
            'Medicine/Bio': 'bio',
            'Engineering/CS': 'eng',
            'Engineering': 'eng',
            'Physics': 'physics',
            'Mathematics': 'math',
            'Social Sciences': 'social',
            'Chemistry / Pharmacy': 'chem',
            'Law / Legal Studies': 'law'
          };
          const unlocked = fieldMap[field] || 'bio';

          setProfile({ 
            user_tier: 'free', 
            tier: 'free', 
            unlocked_portal: unlocked, 
            academic_field: field,
            role: 'user',
            full_name: sessionUser?.user_metadata?.full_name || 'Academic User'
          });
          setIsAdmin(isFounder);
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchAndSetProfile(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // ─── CRITICAL: Only show loading spinner for meaningful auth transitions ───
      // Supabase fires TOKEN_REFRESHED on every tab re-focus (via its internal
      // visibilitychange listener). Showing the loading screen for that event
      // unmounts all child components, wiping AdminPanel/ResearchPage state.
      const isSignificantEvent = (
        _event === 'SIGNED_IN' ||
        _event === 'SIGNED_OUT' ||
        _event === 'INITIAL_SESSION' ||
        _event === 'USER_UPDATED' ||
        _event === 'PASSWORD_RECOVERY'
      );

      if (isSignificantEvent) {
        if (isMounted) setIsInitializing(true);
        fetchAndSetProfile(session?.user ?? null);
      } else {
        // TOKEN_REFRESHED — silently update user object without flashing UI
        if (isMounted && session?.user) {
          setUser(session.user);
        }
      }

      // ─── Silent Background Device Sync ───
      // Triggers on SIGNED_IN (email confirm, password login) and INITIAL_SESSION
      // to catch users who bypass Auth.jsx's manual device registration flow.
      if (
        (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') &&
        session?.user
      ) {
        ensureDeviceIsRegistered(
          session.user.id,
          () => {
            if (isMounted) setDeviceLimitWarning(true);
          }
        ).catch((err) => {
          console.warn('[App] Device sync failed silently:', err);
        });
      }
    });

    // Background profile re-sync every 5 minutes (silent — no loading spinner)
    const intervalId = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Silently refresh profile without triggering isInitializing
          const sessionUser = session.user;
          const isFounder = sessionUser.email === 'arupbhowmikpritom@gmail.com';
          supabase
            .from('profiles')
            .select('role, full_name, academic_field, status, user_tier, unlocked_portal')
            .eq('id', sessionUser.id)
            .maybeSingle()
            .then(({ data, error }) => {
              if (!isMounted) return;
              if (!error && data && (data.academic_field || data.unlocked_portal)) {
                setProfile({ ...data, tier: data.user_tier });
                setIsAdmin(data.role === 'admin' || isFounder);
              }
            });
        }
      });
    }, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [])

  // ─── Realtime Presence (Live Users) ───
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user ? user.id : 'guest-' + Math.random().toString(36).substring(2, 9) } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const count = Object.keys(channel.presenceState()).length
        setLiveUsersCount(count === 0 ? 1 : count)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() })
      })

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
    sessionStorage.clear()
    localStorage.removeItem('sb-access-token')
    window.location.href = '/'
  }

  // ─── Auth Loading Screen ───
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-slate-800 border-t-blue-500 border-r-indigo-500 rounded-full animate-spin shadow-[0_0_40px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Dna size={32} className="text-blue-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-white tracking-widest uppercase shadow-blue-500/50 drop-shadow-lg">
              Authenticating <span className="text-blue-500">Researcher...</span>
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">
              Synchronizing Secure Session
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Route Protection ───
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/auth" replace />
    if (!user.email_confirmed_at) return <Navigate to="/verify-email" replace />
    return children
  }

  // ─── Routes ───
  return (
    <BrowserRouter>
      {/* ─── Global Support Bot ─── */}
      <SupportBot />

      {/* ─── 402 Session Expiry Redirector ─── */}
      <SessionExpiryRedirector sessionExpired={sessionExpired} onRedirected={() => setSessionExpired(false)} />

      {/* ─── Premium Expiry Toast ─── */}
      {sessionExpired && expiryMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md animate-in slide-in-from-top">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-xl shadow-red-100/50 flex items-start gap-3">
            <CreditCard size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800 leading-snug">
                Premium Plan Expired
              </p>
              <p className="text-xs font-medium text-red-600 mt-1">
                {expiryMessage}
              </p>
            </div>
            <button
              onClick={() => setSessionExpired(false)}
              className="text-red-400 hover:text-red-600 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Device Limit Warning Toast ─── */}
      {deviceLimitWarning && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm animate-in slide-in-from-right">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xl shadow-amber-100/50 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 leading-snug">
                Device limit reached (2/2).
              </p>
              <p className="text-xs font-medium text-amber-600 mt-1">
                Manage your devices in{' '}
                <a href="/profile" className="underline font-bold hover:text-amber-800 transition-colors">Profile</a>.
              </p>
            </div>
            <button
              onClick={() => setDeviceLimitWarning(false)}
              className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={user && !user.email_confirmed_at ? <Navigate to="/verify-email" replace /> : <LandingPage liveUsersCount={liveUsersCount} totalMembersCount={totalMembersCount} user={user} profile={profile} onLogout={handleLogout} />} />
        
        <Route path="/verify-email" element={user && !user.email_confirmed_at ? <VerifyEmail user={user} /> : <Navigate to="/" replace />} />
        
        <Route 
          path="/research" 
          element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}><ResearchPage user={user} profile={profile} liveUsersCount={liveUsersCount} onLogout={handleLogout} /></Suspense></ProtectedRoute>} 
        />
        
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        
        <Route path="/library" element={<ProtectedRoute><MyLibrary user={user} onLogout={handleLogout} /></ProtectedRoute>} />
        
        <Route path="/settings" element={<ProtectedRoute><Settings user={user} /></ProtectedRoute>} />
        
        <Route path="/archive" element={<Archive />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/pricing" element={<Pricing user={user} />} />
        <Route path="/admin" element={<AdminPanel user={user} profile={profile} liveUsersCount={liveUsersCount} />} />
        <Route path="/profile" element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} />
        <Route path="/paper/*" element={<PaperDetail />} />
        <Route path="/ai-report" element={<AIReport />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
