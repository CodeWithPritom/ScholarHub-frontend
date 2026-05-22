import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { supabase } from './supabaseClient'
import logo from './assets/images/logo.png'

const VerifyEmail = ({ user }) => {
  const [resending, setResending] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleResend = async () => {
    setResending(true)
    setMessage('')
    try {
      if (!user?.email) throw new Error("No user email found.")
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })
      if (error) throw error
      setMessage('Verification email sent! Please check your inbox.')
    } catch (err) {
      setMessage(err.message || 'Failed to resend email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        
        <div className="flex justify-center mb-8">
          <img src={logo} alt="ScholarHub AI" className="h-12 w-auto object-contain" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight mb-4 text-slate-900">
          Check Your Inbox
        </h1>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">
          We need to verify your email address to secure your account. Please click the link we sent to <strong className="text-slate-900">{user?.email || 'your email'}</strong> to unlock full access.
        </p>

        {message && (
          <div className={`p-4 rounded-xl mb-8 text-xs font-bold uppercase tracking-widest ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {resending ? <Mail size={16} className="animate-pulse" /> : <Send size={16} />}
            {resending ? 'Sending...' : 'Resend Email'}
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmail
