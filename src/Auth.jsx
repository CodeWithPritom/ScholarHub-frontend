import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Turnstile } from '@marsidev/react-turnstile'
import { 
  Mail, 
  Lock, 
  UserPlus, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Check,
  Sparkles,
  BookOpen,
  MonitorSmartphone,
  Database,
  Zap,
  ShieldCheck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import logo from './assets/images/logo.png'
import emoImage from './assets/images/EMO.png'

const Auth = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [academicField, setAcademicField] = useState('Genetic Eng. & Biotech (GEB)')
  const [academicStatus, setAcademicStatus] = useState('Undergrad')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const turnstileRef = useRef(null)

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    if (!captchaToken) {
      setError("Please complete the captcha verification.")
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        captchaToken: captchaToken,
        redirectTo: `${window.location.origin}/settings`
      })
      if (error) throw error
      setSuccess(
        <>
          Password reset link sent! Please check your inbox or <span className="font-black text-emerald-900 bg-emerald-200/60 px-1.5 py-0.5 rounded-md mx-0.5">Spam</span> folder to proceed.
        </>
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      turnstileRef.current?.reset()
      setCaptchaToken('')
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    if (!email || !password || (!isLogin && !fullName)) {
      setError('Please fill in all fields.')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: { captchaToken }
        })
        if (error) throw error
        
        // Fetch profile to determine role-based redirect
        if (authData?.user) {
          // Immediate Founder Check
          if (authData.user.email === 'arupbhowmikpritom@gmail.com') {
            navigate('/admin')
            return
          }

          try {
            // Device Limit Check
            let deviceId = localStorage.getItem('scholarhub_device_id')
            if (!deviceId) {
              deviceId = crypto.randomUUID()
              localStorage.setItem('scholarhub_device_id', deviceId)
            }

            const { data: devices } = await supabase
              .from('user_devices')
              .select('*')
              .eq('user_id', authData.user.id)

            const deviceExists = devices?.find(d => d.device_id === deviceId)

            if (!deviceExists) {
              if (devices && devices.length >= 2) {
                await supabase.auth.signOut()
                setError("Device Limit Reached. Please remove a device from your profile on an existing device.")
                setLoading(false)
                return
              } else {
                const userAgent = window.navigator.userAgent
                const deviceName = userAgent.includes('Windows') ? 'Windows PC' : 
                                   userAgent.includes('Mac') ? 'Mac' : 
                                   userAgent.includes('Mobi') ? 'Mobile Device' : 'Unknown Device'
                
                await supabase.from('user_devices').insert({
                  user_id: authData.user.id,
                  device_id: deviceId,
                  device_name: deviceName
                })
              }
            }

            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authData.user.id)
              .single()
            
            if (profileData?.role === 'admin') {
              navigate('/admin')
            } else {
              navigate('/research')
            }
          } catch {
            navigate('/research')
          }
        }
      } else {
        console.log('Sending metadata:', { fullName, academicField, academicStatus })
        const fieldToPortal = {
          'Genetic Eng. & Biotech (GEB)': 'geb',
          'Pharmacy & Pharmacology': 'pharma',
          'Engineering/CS': 'eng',
          'Physics': 'physics',
          'Mathematics': 'math',
          'Social Sciences': 'social',
          'Chemistry / Pharmacy': 'chem',
          'Law / Legal Studies': 'law'
        };
        
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              academic_field: academicField,
              academic_status: academicStatus,
              unlocked_portal: fieldToPortal[academicField] || 'geb'
            },
            captchaToken: captchaToken
          }
        })
        if (error) throw error
        setSuccess(
          <>
            Account created! Please check your email (and your <span className="font-black text-emerald-900 bg-emerald-200/60 px-1.5 py-0.5 rounded-md mx-0.5">Spam</span> folder) for a verification link.
          </>
        )
        setIsLogin(true)
        setStep(1)
        setPassword('')
        setFullName('')
        turnstileRef.current?.reset()
        setCaptchaToken('')
      }
    } catch (err) {
      setError(err.message)
      turnstileRef.current?.reset()
      setCaptchaToken('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* MOBILE TOP SECTION & DESKTOP LEFT PANEL */}
      <div className="lg:w-1/2 flex flex-col lg:justify-between relative overflow-hidden bg-indigo-600 lg:bg-slate-900 min-h-[40vh] lg:min-h-screen lg:px-16 px-6 pt-8 pb-16 lg:py-16">
        {/* Mesh Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/20 lg:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/20 lg:bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Brand */}
        <div className="flex items-center gap-3 z-20 relative lg:static mb-6 lg:mb-0">
          <img src={logo} alt="ScholarHub" className="h-8 w-auto filter brightness-0 invert" />
          <span className="font-black text-white tracking-tight text-lg">ScholarHub <span className="text-indigo-200 lg:text-indigo-400">AI</span></span>
        </div>
        
        {/* Animated EMO */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
             <img src={emoImage} alt="EMO Mascot" className="w-52 sm:w-64 lg:w-[320px] h-auto drop-shadow-2xl" />
          </motion.div>
        </div>

        {/* Desktop Only: Features List */}
        <div className="hidden lg:block z-10 mt-12 w-full max-w-md">
          <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Trust the Truth.</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shrink-0"><Database size={20}/></div>
              <div><h4 className="font-bold text-white text-sm">Multi-Source APIs</h4><p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Unified access to NCBI, arXiv, OpenAlex.</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0"><Zap size={20}/></div>
              <div><h4 className="font-bold text-white text-sm">800+ Tokens/Sec</h4><p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Fast AI insights powered by Llama 3.1 & Groq LPU.</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 shrink-0"><ShieldCheck size={20}/></div>
              <div><h4 className="font-bold text-white text-sm">PostgreSQL RLS</h4><p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Data vault security & Strict 2-device limit.</p></div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-10 font-bold tracking-wide uppercase">ScholarHub AI is built for verified researchers who value data integrity.</p>
        </div>
      </div>

      {/* MOBILE BOTTOM SECTION (Card Overlapping) & DESKTOP RIGHT PANEL */}
      <div className="lg:w-1/2 flex flex-col items-center justify-start lg:justify-center px-4 sm:px-8 relative z-20 pb-16 lg:pb-0 bg-slate-50">
        
        <Link to="/" className="absolute top-8 right-8 lg:inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group z-20 hidden">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back Home
        </Link>

        {/* Auth Card */}
        <div className="w-full max-w-[440px] bg-white lg:rounded-[2.5rem] rounded-t-[3rem] rounded-b-3xl shadow-xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 relative z-10 -mt-16 lg:mt-0">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">{isLogin ? 'Sign in to access your portal' : 'Get started with ScholarHub AI'}</p>
          </div>

          {/* Pill Toggle (Only show on step 1) */}
          {step === 1 && !isForgotPassword && (
            <div className="relative flex bg-slate-100 p-1.5 rounded-full mb-8 border border-slate-200/50">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm"
                animate={{ left: isLogin ? '6px' : 'calc(50%)' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button type="button" onClick={() => { setIsLogin(true); setError(null); setSuccess(null) }} className={`relative z-10 flex-1 py-3 text-[13px] font-bold transition-colors ${isLogin ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Log In</button>
              <button type="button" onClick={() => { setIsLogin(false); setError(null); setSuccess(null) }} className={`relative z-10 flex-1 py-3 text-[13px] font-bold transition-colors ${!isLogin ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Sign Up</button>
            </div>
          )}

          {/* Error / Success Alerts */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl mb-6"
              >
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-700 leading-snug">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-6"
              >
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-emerald-700 leading-snug">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={isLogin || step === 2 ? handleAuth : handleNextStep} className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? 'login' : step === 1 ? 'signup1' : 'signup2'} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                
                {/* STEP 1 FIELDS */}
                {step === 1 && !isForgotPassword && (
                  <>
                    {!isLogin && (
                      <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" required={!isLogin} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" disabled={loading}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" disabled={loading}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={6} disabled={loading}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {isLogin && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</button>
                      </div>
                    )}

                    {/* Turnstile for both Login and Signup Step 1 */}
                    <div className="flex justify-center pt-2">
                      <Turnstile ref={turnstileRef} siteKey="0x4AAAAAADMiMm356ph5tSi8" onSuccess={(token) => setCaptchaToken(token)} options={{ theme: 'light' }} />
                    </div>

                    <button type="submit" disabled={loading || !captchaToken}
                      className="w-full mt-2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[14px] font-bold tracking-wide transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Access Research Hub' : 'Continue')}
                    </button>
                  </>
                )}

                {/* FORGOT PASSWORD */}
                {isForgotPassword && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" disabled={loading}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex justify-center py-2">
                      <Turnstile ref={turnstileRef} siteKey="0x4AAAAAADMiMm356ph5tSi8" onSuccess={(token) => setCaptchaToken(token)} options={{ theme: 'light' }} />
                    </div>
                    <button type="button" onClick={handleForgotPassword} disabled={loading || !captchaToken}
                      className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[14px] font-bold tracking-wide transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-[12px] font-bold text-slate-500 hover:text-slate-700 transition-colors mt-2">Back to Login</button>
                  </div>
                )}

                {/* STEP 2: ONBOARDING */}
                {!isLogin && step === 2 && !isForgotPassword && (
                  <>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      <select value={academicField} onChange={(e) => setAcademicField(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 pr-4 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none"
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

                    <div className="relative">
                      <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      <select value={academicStatus} onChange={(e) => setAcademicStatus(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 pr-4 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none"
                      >
                        <option value="Undergrad">Undergrad</option>
                        <option value="Masters">Masters</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Independent">Independent</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button type="button" onClick={() => setStep(1)} className="px-6 p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[13px] font-bold transition-all">Back</button>
                      <button type="submit" disabled={loading || !captchaToken}
                        className="flex-1 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[14px] font-bold tracking-wide transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Registration'}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        {/* Mobile Only: Features List Scrollable below card */}
        <div className="lg:hidden mt-8 w-full max-w-[440px] px-2">
          <h3 className="text-xl font-black text-slate-900 mb-6 text-center tracking-tight">Why Researchers Choose Us</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl mb-4"><Zap size={22}/></div>
               <h4 className="font-bold text-slate-900 text-[14px]">800+ Tokens/Sec</h4>
               <p className="text-[12px] text-slate-500 mt-1.5 font-medium leading-snug">Fast AI insights.</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl mb-4"><Database size={22}/></div>
               <h4 className="font-bold text-slate-900 text-[14px]">Multi-Source APIs</h4>
               <p className="text-[12px] text-slate-500 mt-1.5 font-medium leading-snug">NCBI, arXiv, OpenAlex.</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl mb-4"><ShieldCheck size={22}/></div>
               <h4 className="font-bold text-slate-900 text-[14px]">PostgreSQL RLS</h4>
               <p className="text-[12px] text-slate-500 mt-1.5 font-medium leading-snug">Data vault security.</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl mb-4"><MonitorSmartphone size={22}/></div>
               <h4 className="font-bold text-slate-900 text-[14px]">Strict 2-Device</h4>
               <p className="text-[12px] text-slate-500 mt-1.5 font-medium leading-snug">Account integrity.</p>
            </div>
          </div>
          <p className="text-xs text-center text-slate-400 mt-8 font-bold tracking-wide uppercase px-4">ScholarHub AI is built for verified researchers who value data integrity.</p>
        </div>

      </div>
    </div>
  )
}

export default Auth
