import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from './supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, User, Lock, Mail, Check, AlertCircle, Loader2, Save, Settings as SettingsIcon } from 'lucide-react'
import WorkspaceLayout from './components/WorkspaceLayout'

const Settings = ({ user }) => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    window.scrollTo(0, 0)
    if (user) {
      fetchProfile()
    } else {
      navigate('/auth')
    }
  }, [user, navigate])

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message)
    else toast.error(message)
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
      if (error) throw error
      if (data && data.full_name) {
        setFullName(data.full_name)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Update full_name in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
        
      if (profileError) throw profileError

      // Update password if provided
      if (password) {
        const { error: passError } = await supabase.auth.updateUser({ password })
        if (passError) throw passError
        setPassword('') // clear after success
      }
      
      showToast('Profile updated successfully!')
    } catch (err) {
      showToast(err.message || 'Failed to update settings.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <WorkspaceLayout user={user}>

      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <User size={36} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Manage your personal information and security.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={12} className="text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-500 outline-none cursor-not-allowed opacity-80"
              />
              <p className="text-[10px] font-bold text-slate-400 ml-1">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={12} className="text-blue-500" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} className="text-blue-500" />
                Update Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                minLength={6}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </WorkspaceLayout>
  )
}

export default Settings
