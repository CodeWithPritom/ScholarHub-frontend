/**
 * App.jsx — Routing Shell & Global State
 * All business components live in components/ and pages/.
 * This file only manages: Auth state, Presence, and Route definitions.
 */

import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabaseClient'
import { ensureDeviceIsRegistered, handlePasswordResetDeviceOverride } from './utils/deviceSync'
import { SESSION_EXPIRED_EVENT, DEVICE_ERROR_EVENT } from './utils/api'
import { Dna, AlertTriangle, X, CreditCard, KeyRound, MonitorSmartphone, ShieldCheck } from 'lucide-react'
import { Toaster } from 'sonner'

// Pages
import Auth from './Auth'
import LandingPage from './pages/LandingPage'
import AgentFeature from './pages/features/AgentFeature'
import VisionRagFeature from './pages/features/VisionRagFeature'
import DiscoveryFeature from './pages/features/DiscoveryFeature'
import HubFeature from './pages/features/HubFeature'
import AcademyFeature from './pages/features/AcademyFeature'
import AuditorFeature from './pages/features/AuditorFeature'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
const ResearchPage = lazy(() => import('./ResearchPage'))
const SuccessStories3D = lazy(() => import('./pages/SuccessStories3D'))
const Auditor = lazy(() => import('./pages/Auditor'))
const HistoryExplorer = lazy(() => import('./pages/HistoryExplorer'))
const SharedAudit = lazy(() => import('./pages/SharedAudit'))
const NewsHub = lazy(() => import('./pages/NewsHub'))
const OpportunityHub = lazy(() => import('./pages/OpportunityHub'))
const AcademyHub = lazy(() => import('./pages/AcademyHub'))
const ResearchDNAPage = lazy(() => import('./pages/ResearchDNAPage'))
const PublicResearchDNAPage = lazy(() => import('./pages/PublicResearchDNAPage'))
import MyLibrary from './MyLibrary'
import Settings from './Settings'
import VerifyEmail from './VerifyEmail'
import Archive from './pages/Archive'
import Resources from './pages/Resources'
import Pricing from './pages/Pricing'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import About from './pages/About'

// Components
import PaperDetail from './components/PaperDetail'
import AIReport from './components/AIReport'
import SupportBot from './components/SupportBot'
import MobileBottomNav from './components/MobileBottomNav'

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

/**
 * AuthRouteHandler — Handles the /auth route with redirect support.
 * If user is already logged in and a ?redirect= param exists, navigate there.
 * Otherwise redirect to home. If not logged in, show the Auth component.
 */
function AuthRouteHandler({ user }) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  if (user) {
    // User is already logged in — honor the redirect param if it's a safe internal path
    if (redirectTo && redirectTo.startsWith('/')) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Auth />;
}

const ProfileSetupModal = ({ isOpen, user, onClose }) => {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [academicField, setAcademicField] = useState('Genetic Eng. & Biotech (GEB)');
  const [customField, setCustomField] = useState('');
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
    if (academicField === 'Others' && !customField.trim()) {
      setError('Please specify your domain.');
      return;
    }
    setLoading(true);
    setError(null);

    const finalField = academicField === 'Others' ? customField.trim() : academicField;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          academic_field: finalField,
          academic_status: academicStatus
        }
      });
      if (updateError) throw updateError;

      if (user) {
        const { error: profileError } = await supabase.from('profiles').update({
          full_name: fullName,
          academic_field: finalField,
          academic_status: academicStatus,
          status: 'active'
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
      <div 
        className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative z-10 my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Complete Your Profile</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2">Just a few more details to personalize your workspace.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-bold mb-4">
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
                <option value="Others">Others</option>
              </select>
            </div>
            {academicField === 'Others' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specify Domain</label>
                <input type="text" required placeholder="e.g. Zoology, Botany, Nuclear Physics" value={customField} onChange={e => setCustomField(e.target.value)} disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            )}
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
              className="w-full mt-4 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-black tracking-wide transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const ProtectedRoute = React.memo(({ user, children }) => {
  if (!user) return <Navigate to="/auth" replace />
  if (user && !user.email_confirmed_at) return <Navigate to="/verify-email" replace />
  return <>{children}</>
});

const DeviceSecurityModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  const handleResetPasswordClick = () => {
    onClose();
    supabase.auth.signOut().then(() => {
      window.location.href = '/auth?forgot=true';
    });
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full relative z-10 border border-slate-200 text-left overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto overscroll-contain"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-xs">
              <MonitorSmartphone size={26} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Device Not Detected / Security Sync Pending
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            {message || 'The system could not verify your active device security session or a device limit was reached.'}
          </p>

          <div className="my-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold leading-relaxed space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck size={14} className="text-amber-600" /> Recommended Resolution:
            </div>
            <div>
              Please <strong>Reset Your Password</strong> — resetting your password automatically purges all stale/conflict device locks from the server and cleanly registers your current device session.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleResetPasswordClick}
              className="w-full sm:flex-1 py-3.5 px-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound size={15} />
              Reset Password Now
            </button>

            <a
              href="/profile"
              onClick={onClose}
              className="w-full sm:w-auto py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all text-center"
            >
              Manage Devices
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [liveUsersCount, setLiveUsersCount] = useState(1)
  const [totalMembersCount, setTotalMembersCount] = useState(0) // Real count via RPC
  const [deviceLimitWarning, setDeviceLimitWarning] = useState(false)
  const [deviceErrorModalOpen, setDeviceErrorModalOpen] = useState(false)
  const [deviceErrorMessage, setDeviceErrorMessage] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const [expiryMessage, setExpiryMessage] = useState('')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const isFirstLoad = useRef(true)
  const isFirstMount = useRef(true)
  const initialLoadComplete = useRef(false)
  const isInitialLoad = useRef(true)
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ─── Global 402 Session Expiry Handler ───
  const handleSessionExpiry = useCallback((e) => {
    const detail = e.detail || 'Your premium plan has expired.';
    setExpiryMessage(detail);
    setSessionExpired(true);

    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, user_tier: 'free', tier: 'free' };
    });

    setTimeout(() => setSessionExpired(false), 8000);
  }, []);

  // ─── Global Device Sync Error Handler ───
  const handleDeviceError = useCallback((e) => {
    const detail = e.detail || 'Device not detected or security sync pending.';
    setDeviceErrorMessage(detail);
    setDeviceErrorModalOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiry);
    window.addEventListener(DEVICE_ERROR_EVENT, handleDeviceError);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiry);
      window.removeEventListener(DEVICE_ERROR_EVENT, handleDeviceError);
    };
  }, [handleSessionExpiry, handleDeviceError]);

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

  // ─── Automatic Device Registration Sync ───
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      ensureDeviceIsRegistered(user.id, () => {
        if (isMounted) setDeviceLimitWarning(true);
      }).catch((err) => {
        console.warn('[App] Silent background device sync failed:', err);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

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
          initialLoadComplete.current = true;
          isInitialLoad.current = false;
        }
        return;
      }

      const isFounder = sessionUser.email === 'arupbhowmikpritom@gmail.com';
      if (isMounted) setUser(sessionUser);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name, academic_field, status, user_tier')
          .eq('id', sessionUser.id)
          .maybeSingle();

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('tier, expires_at')
          .eq('user_id', sessionUser.id)
          .maybeSingle();

        let resolvedTier = (data?.user_tier || 'free').toLowerCase();

        if (subData) {
          if (subData.expires_at && new Date() > new Date(subData.expires_at)) {
            resolvedTier = 'free';
          } else if (subData.tier && subData.tier !== 'free') {
            resolvedTier = subData.tier.toLowerCase();
          }
        }

        const isMissing = (val) => !val || val === 'Scholar' || val === 'Not Specified' || val === 'Academic User';
        let profileIsValid = false;

        if (!error && data) {
          if (!isMissing(data.full_name) && !isMissing(data.academic_field)) {
            profileIsValid = true;
          }
        }

        if (isMounted) {
          const finalProfile = {
            ...(data || {}),
            user_tier: resolvedTier,
            tier: resolvedTier,
            role: data?.role || 'user',
            full_name: data?.full_name || sessionUser?.user_metadata?.full_name || '',
            academic_field: data?.academic_field || sessionUser?.user_metadata?.academic_field || '',
            status: data?.status || sessionUser?.user_metadata?.academic_status || 'Undergrad'
          };

          setNeedsOnboarding(!profileIsValid);
          setProfile(finalProfile);
          setIsAdmin(data?.role === 'admin' || isFounder);
        }
      } catch {
        if (isMounted) {
          setNeedsOnboarding(true);
          setProfile({
            user_tier: 'free',
            tier: 'free',
            academic_field: '',
            academic_status: 'Undergrad',
            role: 'user',
            full_name: ''
          });
          setIsAdmin(isFounder);
        }
      }
 finally {
        if (isMounted) {
          setIsInitializing(false);
          initialLoadComplete.current = true;
          isInitialLoad.current = false;
          isFirstMount.current = false;
          isFirstLoad.current = false;
        }
      }
    };

    // Password Recovery Device Session Override helper
    const checkPasswordRecoveryOverride = async (sess, evt) => {
      const isRecovery = evt === 'PASSWORD_RECOVERY' || 
                         window.location.hash.includes('type=recovery') || 
                         window.location.search.includes('type=recovery');
      if (isRecovery && sess?.user?.id) {
        console.log('[App] Password Recovery detected! Overriding device locks for user:', sess.user.id);
        await handlePasswordResetDeviceOverride(sess.user.id);
        if (isMounted) setDeviceLimitWarning(false);
      }
    };

    // Initial session check with stale refresh token cleanup guard
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error && (error.message?.includes('Refresh Token') || error.status === 400)) {
        console.warn('[App] Stale or invalid refresh token detected. Cleaning local auth state.');
        supabase.auth.signOut().catch(() => {});
        fetchAndSetProfile(null);
        return;
      }
      fetchAndSetProfile(session?.user ?? null);
      if (session?.user) {
        checkPasswordRecoveryOverride(session, null);
      }
    }).catch(err => {
      if (err?.message?.includes('Refresh Token') || err?.status === 400) {
        supabase.auth.signOut().catch(() => {});
        fetchAndSetProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && _event === 'PASSWORD_RECOVERY') {
        checkPasswordRecoveryOverride(session, _event);
      }

      // ─── CRITICAL: Silent Auth & Token Refresh Guard ───
      const isSignificantEvent = _event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED' || _event === 'PASSWORD_RECOVERY';
      if (_event === 'TOKEN_REFRESHED' || !isSignificantEvent || !isInitialLoad.current) {
        if (isMounted && session?.user && (!userRef.current || userRef.current.id !== session.user.id)) {
          setUser(session.user);
        }
        return;
      }

      if (initialLoadComplete.current) {
        if (isMounted) {
          if (session?.user) {
            if (!userRef.current || userRef.current.id !== session.user.id || userRef.current.email !== session.user.email) {
              setUser(session.user);
            }
          } else if (_event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
        }
        if ((_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') && session?.user) {
          const isRecovery = window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery');
          if (isRecovery) {
            handlePasswordResetDeviceOverride(session.user.id).then(() => {
              if (isMounted) setDeviceLimitWarning(false);
            });
          } else {
            ensureDeviceIsRegistered(session.user.id, () => {
              if (isMounted) setDeviceLimitWarning(true);
            }).catch((err) => {
              console.warn('[App] Device sync failed silently:', err);
            });
          }
        }
        return;
      }

      const needsFullFetch = (
        _event === 'SIGNED_IN' ||
        _event === 'SIGNED_OUT' ||
        _event === 'USER_UPDATED' ||
        _event === 'PASSWORD_RECOVERY'
      );

      if (needsFullFetch) {
        if (!initialLoadComplete.current && isFirstLoad.current) {
          setIsInitializing(true);
        }
        fetchAndSetProfile(session?.user ?? null);
      } else {
        // TOKEN_REFRESHED, INITIAL_SESSION, or custom events — silently update user object
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
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const sessionUser = session.user;
          const isFounder = sessionUser.email === 'arupbhowmikpritom@gmail.com';
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role, full_name, academic_field, status, user_tier')
              .eq('id', sessionUser.id)
              .maybeSingle();

            const { data: subData } = await supabase
              .from('subscriptions')
              .select('tier, expires_at')
              .eq('user_id', sessionUser.id)
              .maybeSingle();

            if (!isMounted) return;

            let resolvedTier = (data?.user_tier || 'free').toLowerCase();

            if (subData) {
              if (subData.expires_at && new Date() > new Date(subData.expires_at)) {
                resolvedTier = 'free';
              } else if (subData.tier && subData.tier !== 'free') {
                resolvedTier = subData.tier.toLowerCase();
              }
            }

            const isMissing = (val) => !val || val === 'Scholar' || val === 'Not Specified' || val === 'Academic User';
            const profileIsValid = !error && data && !isMissing(data.full_name) && !isMissing(data.academic_field);

            setNeedsOnboarding(!profileIsValid);
            setProfile({
              ...(data || {}),
              user_tier: resolvedTier,
              tier: resolvedTier
            });
            setIsAdmin(data?.role === 'admin' || isFounder);
          } catch (e) {
            console.error('[App] Background profile re-sync error:', e);
          }
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
    let presenceKey = user?.id;
    if (!presenceKey) {
      presenceKey = sessionStorage.getItem('scholarhub_presence_guest_id');
      if (!presenceKey) {
        presenceKey = 'guest-' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('scholarhub_presence_guest_id', presenceKey);
      }
    }

    const channel = supabase.channel('online-users', {
      config: { presence: { key: presenceKey } },
    });

    let isSubscribed = true;

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!isSubscribed) return;
        const count = Object.keys(channel.presenceState()).length;
        setLiveUsersCount(count === 0 ? 1 : count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isSubscribed) {
          try {
            await channel.track({ online_at: new Date().toISOString() });
          } catch (e) {
            // Ignore tracking abort on rapid unmount
          }
        }
      });

    return () => {
      isSubscribed = false;
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, [user?.id]);



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

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      {needsOnboarding ? (
        <ProfileSetupModal isOpen={true} user={user} onClose={() => setNeedsOnboarding(false)} />
      ) : (
        <>
          <SupportBot user={user} />
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
            <div className="fixed top-4 right-4 z-[9999] max-w-md animate-in slide-in-from-right">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xl shadow-amber-100/50 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800 leading-snug">
                    Device Limit Reached (2 of 2)
                  </p>
                  <p className="text-xs font-medium text-amber-600 mt-1.5 leading-relaxed">
                    You are already logged in on 2 devices. To access from this new device,
                    please <strong>reset your password</strong> — this will sign out all
                    other devices and allow this device to take over.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href="/auth"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeviceLimitWarning(false);
                        supabase.auth.signOut().then(() => {
                          window.location.href = '/auth?forgot=true';
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <KeyRound size={13} />
                      Reset Password
                    </a>
                    <a
                      href="/profile"
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Manage Devices
                    </a>
                  </div>
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

          <DeviceSecurityModal 
            isOpen={deviceErrorModalOpen || deviceLimitWarning} 
            message={deviceErrorMessage} 
            onClose={() => {
              setDeviceErrorModalOpen(false);
              setDeviceLimitWarning(false);
            }} 
          />

          <Routes>
            <Route path="/" element={user && !user.email_confirmed_at ? <Navigate to="/verify-email" replace /> : <LandingPage liveUsersCount={liveUsersCount} totalMembersCount={totalMembersCount} user={user} profile={profile} onLogout={handleLogout} />} />
            <Route path="/features/agent" element={<AgentFeature user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/features/vision-rag" element={<VisionRagFeature user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/features/discovery" element={<DiscoveryFeature user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/features/hub" element={<HubFeature user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/features/academy" element={<AcademyFeature user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/features/auditor" element={<AuditorFeature user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/privacy" element={<PrivacyPolicy user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/terms" element={<TermsOfService user={user} profile={profile} onLogout={handleLogout} liveUsersCount={liveUsersCount} />} />
            <Route path="/verify-email" element={user && !user.email_confirmed_at ? <VerifyEmail user={user} /> : <Navigate to="/" replace />} />
            <Route path="/research" element={<ProtectedRoute user={user}><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}><ResearchPage user={user} profile={profile} liveUsersCount={liveUsersCount} onLogout={handleLogout} /></Suspense></ProtectedRoute>} />
            <Route path="/auth" element={<AuthRouteHandler user={user} />} />
            <Route path="/library" element={<ProtectedRoute user={user}><MyLibrary user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/auditor" element={<ProtectedRoute user={user}><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}><Auditor user={user} onLogout={handleLogout} /></Suspense></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute user={user}><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}><HistoryExplorer user={user} onLogout={handleLogout} /></Suspense></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute user={user}><Settings user={user} /></ProtectedRoute>} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/news" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}><NewsHub user={user} profile={profile} liveUsersCount={liveUsersCount} onLogout={handleLogout} /></Suspense>} />
            <Route path="/opportunities" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>}><OpportunityHub user={user} profile={profile} liveUsersCount={liveUsersCount} onLogout={handleLogout} /></Suspense>} />
            <Route path="/academy" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}><AcademyHub user={user} profile={profile} liveUsersCount={liveUsersCount} onLogout={handleLogout} /></Suspense>} />
            <Route path="/dna" element={<Navigate to="/research-dna" replace />} />
            <Route path="/research-dna" element={<ProtectedRoute user={user}><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>}><ResearchDNAPage user={user} profile={profile} onLogout={handleLogout} /></Suspense></ProtectedRoute>} />
            <Route path="/dna/:shareToken" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>}><PublicResearchDNAPage /></Suspense>} />
            <Route path="/pricing" element={<Pricing user={user} profile={profile} />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user}>
                  {isAdmin ? <AdminPanel user={user} profile={profile} liveUsersCount={liveUsersCount} /> : <Navigate to="/" replace />}
                </ProtectedRoute>
              } 
            />
            <Route path="/success-stories" element={<Suspense fallback={<div className="h-screen w-screen bg-[#020617] text-white flex items-center justify-center font-bold tracking-widest uppercase text-sm">Loading 3D Engine...</div>}><SuccessStories3D /></Suspense>} />
            <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
            <Route path="/paper/*" element={<PaperDetail user={user} profile={profile} />} />
            <Route path="/ai-report" element={<AIReport />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/about" element={<About />} />
            <Route path="/shared/:shareToken" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}><SharedAudit user={user} /></Suspense>} />
          </Routes>
          {/* Mobile Native Bottom Navigation Bar */}
          <MobileBottomNav user={user} />
        </>
      )}
    </BrowserRouter>
  )
}

export default App
