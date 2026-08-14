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
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-[#171717] selection:bg-blue-100 selection:text-blue-700">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[12px] p-10 border border-[#E5E5DF] shadow-sm text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#315CFF]"></div>
        
        <div className="flex justify-center mb-8">
          <img src={logo} alt="ScholarHub AI" className="h-12 w-auto object-contain" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-[#171717] font-sds-content">
          Check Your Inbox
        </h1>
        
        <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm">
          We need to verify your email address to secure your account. Please click the link we sent to <strong className="text-[#171717]">{user?.email || 'your email'}</strong> to unlock full access.
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
            className="w-full py-3.5 bg-[#315CFF] hover:bg-[#2547d0] text-white font-semibold rounded-[8px] transition-colors shadow-xs uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {resending ? <Mail size={16} className="animate-pulse" /> : <Send size={16} />}
            {resending ? 'Sending...' : 'Resend Email'}
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-3.5 bg-[#F3F3EF] hover:bg-[#E5E5DF] text-slate-800 font-semibold rounded-[8px] transition-all uppercase tracking-widest text-[10px] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmail
