import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import { motion } from 'framer-motion'
import { Turnstile } from '@marsidev/react-turnstile'
import { 
  Dna, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Check,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import logo from './assets/images/logo.png'

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
      setSuccess("Password reset link sent! Please check your email.")
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
        setSuccess('Account created! Please check your email for a verification link to activate your account.')
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6 relative overflow-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10 pointer-events-auto"
      >
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Research Hub
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <img src={logo} alt="ScholarHub AI" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                ScholarHub <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mt-1">
                {isLogin ? 'Researcher Login' : step === 1 ? 'Create Account' : 'Tell us about yourself'}
              </p>
            </div>
          </div>

          {/* Tab Toggle */}
          {step === 1 && (
            <div className="flex bg-slate-50 rounded-2xl p-1.5 mb-10 border border-slate-100">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); setSuccess(null) }}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
                  isLogin 
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LogIn size={14} />
                Login
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); setSuccess(null) }}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
                  !isLogin 
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserPlus size={14} />
                Sign Up
              </button>
            </div>
          )}

          {/* Error / Success Messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-8"
            >
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700 leading-snug">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl mb-8"
            >
              <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-green-700 leading-snug">{success}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={isLogin || step === 2 ? handleAuth : handleNextStep} className="space-y-6">
            {/* Step 1 Sign Up/Login Fields */}
            {step === 1 && (
              <>
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <UserPlus size={12} className="text-blue-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required={!isLogin}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. John Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                      disabled={loading}
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Mail size={12} className="text-blue-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                    disabled={loading}
                  />
                </div>

                {!isForgotPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} className="text-blue-500" />
                        Password
                      </label>
                      {isLogin && (
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                      disabled={loading}
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="relative z-[9999] pointer-events-auto touch-auto min-h-[70px] w-full flex justify-center my-4">
                    <Turnstile 
                      ref={turnstileRef}
                      siteKey="0x4AAAAAADMiMm356ph5tSi8" 
                      onSuccess={(token) => setCaptchaToken(token)}
                      theme="light"
                      options={{ theme: 'light' }}
                    />
                  </div>
                )}

                {isForgotPassword ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading || !captchaToken}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Mail size={18} />
                          Send Reset Link
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || (isLogin && !captchaToken)}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        {isLogin ? <LogIn size={18} /> : <ChevronRight size={18} />}
                        {isLogin ? 'Access Research Hub' : 'Next: About You'}
                        <Sparkles size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Step 2 Onboarding Fields (Sign Up only) */}
            {!isLogin && step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <BookOpen size={12} className="text-blue-500" />
                    Your Academic Field
                  </label>
                  <select
                    value={academicField}
                    onChange={(e) => setAcademicField(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-500" />
                    Academic Status
                  </label>
                  <select
                    value={academicStatus}
                    onChange={(e) => setAcademicStatus(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                  >
                    <option value="Undergrad">Undergrad</option>
                    <option value="Masters">Masters</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Independent">Independent</option>
                  </select>
                </div>

                <div className="flex justify-center py-2">
                  <Turnstile 
                    ref={turnstileRef}
                    siteKey="0x4AAAAAADMiMm356ph5tSi8" 
                    onSuccess={(token) => setCaptchaToken(token)}
                    options={{ theme: 'light' }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !captchaToken}
                    className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Register
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Secured by Supabase Authentication
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth
