import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from './supabaseClient'
import { BASE_URL } from './utils/api'
import { handlePasswordResetDeviceOverride } from './utils/deviceSync'
import { motion } from 'framer-motion'
import { 
  User, Lock, Mail, Loader2, Save, Compass, X
} from 'lucide-react'
import WorkspaceLayout from './components/WorkspaceLayout'
import InterestSelector from './components/intelligence/InterestSelector'

const Settings = ({ user }) => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [userInterests, setUserInterests] = useState({ disciplines: [] })
  const [showInterestModal, setShowInterestModal] = useState(false)
  
  useEffect(() => {
    window.scrollTo(0, 0)
    if (user) {
      fetchProfile()
      fetchUserInterests()
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

  const fetchUserInterests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const res = await fetch(`${BASE_URL}/api/intelligence/user-interests`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const intData = await res.json()
          if (intData.interests) setUserInterests(intData.interests)
        }
      }
    } catch (e) {
      console.error('Error fetching user interests:', e)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
        
      if (profileError) throw profileError

      if (password) {
        const { error: passError } = await supabase.auth.updateUser({ password })
        if (passError) throw passError
        await handlePasswordResetDeviceOverride(user.id)
        setPassword('')
      }
      
      showToast('Profile updated successfully!')
    } catch (err) {
      showToast(err.message || 'Failed to update settings.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpickInterest = async (disc) => {
    const updated = (userInterests.disciplines || []).filter(d => d !== disc)
    setUserInterests(prev => ({ ...prev, disciplines: updated }))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await fetch(`${BASE_URL}/api/intelligence/user-interests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ disciplines: updated })
        })
        showToast('Research interests updated')
      }
    } catch (e) {
      console.error('Error updating interests:', e)
    }
  }

  const handleSaveInterestsFromModal = async (newDisciplines) => {
    setUserInterests(prev => ({ ...prev, disciplines: newDisciplines }))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await fetch(`${BASE_URL}/api/intelligence/user-interests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ disciplines: newDisciplines })
        })
        showToast('Research interests updated')
      }
    } catch (e) {
      console.error('Error saving interests from modal:', e)
    } finally {
      setShowInterestModal(false)
    }
  }

  if (!user) return null

  return (
    <WorkspaceLayout user={user}>
      <div className="max-w-2xl mx-auto w-full space-y-8">
        
        {/* Account Info Settings */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <User size={36} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Manage your personal information and security credentials.</p>
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
              className="w-full py-5 mt-4 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
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

        {/* Research Interests & Personalization Section */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Compass size={16} className="text-slate-800" />
                Research Interests & Personalization
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Manage your active academic disciplines to personalize your Literature Intelligence feed.
              </p>
            </div>

            <button
              onClick={() => setShowInterestModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              Add / Manage Interests
            </button>
          </div>

          {userInterests.disciplines && userInterests.disciplines.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userInterests.disciplines.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200/80 px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleUnpickInterest(item)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Unpick interest"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 font-medium">
              No research interests selected yet. Click "Add / Manage Interests" above to customize your feed.
            </div>
          )}
        </motion.div>

        {/* Interest Selector Modal */}
        {showInterestModal && (
          <InterestSelector
            initialSelected={userInterests.disciplines || []}
            onSave={handleSaveInterestsFromModal}
            onClose={() => setShowInterestModal(false)}
            isModal={true}
          />
        )}

      </div>
    </WorkspaceLayout>
  )
}

export default Settings
