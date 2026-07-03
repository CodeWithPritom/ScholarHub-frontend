/**
 * App.jsx — Routing Shell & Global State
 * All business components live in components/ and pages/.
 * This file only manages: Auth state, Presence, and Route definitions.
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabaseClient'
import { ensureDeviceIsRegistered } from './utils/deviceSync'
import { SESSION_EXPIRED_EVENT } from './utils/api'
import { Dna, AlertTriangle, X, CreditCard } from 'lucide-react'

// Pages
import Auth from './Auth'
import LandingPage from './pages/LandingPage'
const ResearchPage = lazy(() => import('./ResearchPage'))
const SuccessStories3D = lazy(() => import('./pages/SuccessStories3D'))
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

const ProfileSetupModal = ({ isOpen, user, onClose }) => {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [academicField, setAcademicField] = useState('Genetic Eng. & Biotech (GEB)');
  const [academicStatus, setAcademicStatus] = useState('Undergrad');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      setError('Please provide your full name.');
      return;
    }
    setLoading(true);
    setError(null);
    
    const fieldMap = {
      'Genetic Eng. & Biotech (GEB)': 'geb',
      'Pharmacy & Pharmacology': 'pharma',
      'Engineering/CS': 'eng',
      'Physics': 'physics',
      'Mathematics': 'math',
      'Social Sciences': 'social',
      'Law / Legal Studies': 'law',
      'Chemistry / Pharmacy': 'chem'
    };
    const unlockedPortal = fieldMap[academicField] || 'geb';
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          academic_field: academicField,
          academic_status: academicStatus,
          unlocked_portal: unlockedPortal
        }
      });
      if (updateError) throw updateError;
      
      if (user) {
        const { error: profileError } = await supabase.from('profiles').update({
            full_name: fullName,
            academic_field: academicField,
            status: academicStatus,
            unlocked_portal: unlockedPortal
        }).eq('id', user.id);
        if (profileError) console.error("Profile update error:", profileError);
      }
      
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Complete Your Profile</h2>
            <p className="text-sm font-medium text-slate-500 mt-2">Just a few more details to personalize your workspace.</p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Academic Field</label>
              <select value={academicField} onChange={e => setAcademicField(e.target.value)} disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="Genetic Eng. & Biotech (GEB)">Genetic Eng. & Biotech (GEB)</option>
                <option value="Pharmacy & Pharmacology">Pharmacy & Pharmacology</option>
                <option value="Engineering/CS">Engineering/CS</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Law / Legal Studies">Law / Legal Studies</option>
                <option value="Chemistry / Pharmacy">Chemistry / Pharmacy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Academic Status</label>
              <select value={academicStatus} onChange={e => setAcademicStatus(e.target.value)} disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="Undergrad">Undergrad</option>
                <option value="Masters">Masters</option>
                <option value="Faculty">Faculty</option>
                <option value="Independent">Independent</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-4 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-black tracking-wide transition-all shadow-lg flex justify-center items-center gap-2"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [liveUsersCount, setLiveUsersCount] = useState(1)
  const [totalMembersCount, setTotalMembersCount] = useState(0) // Real count via RPC
  const [deviceLimitWarning, setDeviceLimitWarning] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [expiryMessage, setExpiryMessage] = useState('')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

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
        const { data, error } = await supabase.rpc('get_total_user_count')
        if (!error && data !== null) setTotalMembersCount(data)
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

        const isMissing = (val) => !val || val === 'Scholar' || val === 'Not Specified' || val === 'Academic User';
        let profileIsValid = false;

        if (!error && data) {
          if (!isMissing(data.full_name) && !isMissing(data.academic_field) && !isMissing(data.status)) {
            profileIsValid = true;
          }
        }

        if (isMounted) {
          if (profileIsValid) {
            setNeedsOnboarding(false);
            setProfile({ ...data, tier: data.user_tier });
            setIsAdmin(data.role === 'admin' || isFounder);
          } else {
            setNeedsOnboarding(true);
            const field = sessionUser?.user_metadata?.academic_field || 'Genetic Eng. & Biotech (GEB)';
            setProfile({ 
              user_tier: 'free', 
              tier: 'free', 
              unlocked_portal: 'geb', 
              academic_field: field,
              academic_status: sessionUser?.user_metadata?.academic_status || 'Undergrad',
              role: 'user',
              full_name: sessionUser?.user_metadata?.full_name || ''
            });
            setIsAdmin(isFounder);
          }
        }
      } catch {
        if (isMounted) {
          setNeedsOnboarding(true);
          setProfile({ 
            user_tier: 'free', 
            tier: 'free', 
            unlocked_portal: 'geb', 
            academic_field: 'Genetic Eng. & Biotech (GEB)',
            academic_status: 'Undergrad',
            role: 'user',
            full_name: ''
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
              const isMissing = (val) => !val || val === 'Scholar' || val === 'Not Specified' || val === 'Academic User';
              if (!error && data) {
                if (!isMissing(data.full_name) && !isMissing(data.academic_field) && !isMissing(data.status)) {
                  setNeedsOnboarding(false);
                  setProfile({ ...data, tier: data.user_tier });
                  setIsAdmin(data.role === 'admin' || isFounder);
                } else {
                  setNeedsOnboarding(true);
                }
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

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/auth" replace />
    if (!user.email_confirmed_at) return <Navigate to="/verify-email" replace />
    return children
  }

  return (
    <BrowserRouter>
      {needsOnboarding ? (
        <ProfileSetupModal isOpen={true} user={user} onClose={() => setNeedsOnboarding(false)} />
      ) : (
        <>
          <SupportBot />
          <SessionExpiryRedirector sessionExpired={sessionExpired} onRedirected={() => setSessionExpired(false)} />

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
            <Route path="/research" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}><ResearchPage user={user} profile={profile} liveUsersCount={liveUsersCount} onLogout={handleLogout} /></Suspense></ProtectedRoute>} />
            <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
            <Route path="/library" element={<ProtectedRoute><MyLibrary user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings user={user} /></ProtectedRoute>} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pricing" element={<Pricing user={user} profile={profile} />} />
            <Route path="/admin" element={<AdminPanel user={user} profile={profile} liveUsersCount={liveUsersCount} />} />
            <Route path="/success-stories" element={<Suspense fallback={<div className="h-screen w-screen bg-[#020617] text-white flex items-center justify-center font-bold tracking-widest uppercase text-sm">Loading 3D Engine...</div>}><SuccessStories3D /></Suspense>} />
            <Route path="/profile" element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} />
            <Route path="/paper/*" element={<PaperDetail user={user} profile={profile} />} />
            <Route path="/ai-report" element={<AIReport />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </>
      )}
    </BrowserRouter>
  )
}

export default App
