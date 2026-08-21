import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from './supabaseClient'
import { BASE_URL } from './utils/api'
import { handlePasswordResetDeviceOverride } from './utils/deviceSync'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Lock, Mail, Loader2, Save, Compass, X, ShieldCheck, 
  Database, Laptop, Smartphone, Check, Eye, EyeOff, FileDown, 
  Trash2, Key, GraduationCap, Building2, BookOpen, ExternalLink
} from 'lucide-react'
import WorkspaceLayout from './components/WorkspaceLayout'
import InterestSelector from './components/intelligence/InterestSelector'

const ACADEMIC_STATUS_OPTIONS = [
  'Undergraduate Student',
  'Master\'s Candidate',
  'Ph.D. Researcher',
  'Postdoctoral Fellow',
  'Assistant Professor',
  'Principal Investigator / Professor',
  'Independent Researcher'
]

const ACADEMIC_FIELDS = [
  'Genetic Eng. & Biotech (GEB)',
  'Pharmacy & Pharmacology',
  'Computer Science & AI',
  'Medicine & Biomedical Sciences',
  'Physics & Astronomy',
  'Chemistry & Materials Science',
  'Engineering & Technology',
  'Social & Behavioral Sciences',
  'Law & Legal Studies',
  'Environmental Sciences',
  'Mathematics & Statistics'
]

const CITATION_STYLES = [
  { id: 'apa', name: 'APA 7th Edition (Author, Year)' },
  { id: 'ieee', name: 'IEEE (Numbered References)' },
  { id: 'nature', name: 'Nature Style (Superscript)' },
  { id: 'harvard', name: 'Harvard Reference Format' },
  { id: 'mla', name: 'MLA 9th Edition' },
  { id: 'vancouver', name: 'Vancouver Medical Format' }
]

const Settings = ({ user }) => {
  const navigate = useNavigate()
  
  // Navigation Tabs: 'profile', 'intelligence', 'security', 'data'
  const [activeTab, setActiveTab] = useState('profile')
  
  // Loading & Saving States
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [exportingData, setExportingData] = useState(false)
  
  // Tab 1: Profile & Academic Identity
  const [fullName, setFullName] = useState('')
  const [academicStatus, setAcademicStatus] = useState('')
  const [academicField, setAcademicField] = useState('')
  const [institution, setInstitution] = useState('')
  const [orcidId, setOrcidId] = useState('')
  const [googleScholarUrl, setGoogleScholarUrl] = useState('')

  // Tab 2: Research Intelligence & Feeds
  const [userInterests, setUserInterests] = useState({ disciplines: [] })
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [citationStyle, setCitationStyle] = useState(() => localStorage.getItem('scholarhub_citation_style') || 'apa')

  // Tab 3: Security & Connected Devices
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [devices, setDevices] = useState([])

  // Fetch Connected Devices
  const fetchDevices = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setDevices(data)
    } catch (e) {
      console.error("Error fetching devices:", e)
    }
  }, [user])

  // Fetch Profile & User Metadata
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      await fetchDevices()

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, academic_field, academic_status')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '')
        setAcademicField(profile.academic_field || user.user_metadata?.academic_field || '')
        setAcademicStatus(profile.academic_status || user.user_metadata?.academic_status || '')
      } else {
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '')
        setAcademicField(user.user_metadata?.academic_field || '')
        setAcademicStatus(user.user_metadata?.academic_status || '')
      }

      setInstitution(user.user_metadata?.institution || '')
      setOrcidId(user.user_metadata?.orcid_id || '')
      setGoogleScholarUrl(user.user_metadata?.google_scholar_url || '')

      // Fetch User Research Interests
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

    } catch (err) {
      console.error('Error loading settings:', err)
      toast.error('Could not load account settings.')
    } finally {
      setLoading(false)
    }
  }, [user, fetchDevices])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (user) {
      fetchProfile()
    } else {
      navigate('/auth')
    }
  }, [user, navigate, fetchProfile])

  // Save Tab 1: Profile & Identity
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      // 1. Update Supabase Auth User Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          academic_field: academicField,
          academic_status: academicStatus,
          institution: institution,
          orcid_id: orcidId,
          google_scholar_url: googleScholarUrl
        }
      })
      if (authError) throw authError

      // 2. Update Supabase Profiles Table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          academic_field: academicField,
          academic_status: academicStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 3. Dispatch global sync event
      window.dispatchEvent(new Event('credits_updated'))
      toast.success('Academic profile updated successfully!')
    } catch (err) {
      console.error('Profile update error:', err)
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Save Tab 2: Intelligence & Preferences
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
        toast.success('Research interest removed')
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
        toast.success('Research interests updated')
      }
    } catch (e) {
      console.error('Error saving interests:', e)
    } finally {
      setShowInterestModal(false)
    }
  }

  const handleSaveCitationStyle = (styleId) => {
    setCitationStyle(styleId)
    localStorage.setItem('scholarhub_citation_style', styleId)
    toast.success('Default citation format updated')
  }

  // Save Tab 3: Security & Password Update
  const handleSaveSecurity = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setSavingSecurity(true)
    try {
      const { error: passError } = await supabase.auth.updateUser({ password })
      if (passError) throw passError
      
      // Override device sessions on password reset for security
      await handlePasswordResetDeviceOverride(user.id)
      
      setPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully! Other sessions secured.')
    } catch (err) {
      console.error('Security update error:', err)
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setSavingSecurity(false)
    }
  }

  // Save Tab 4: Export Library Data
  const handleExportUserData = async () => {
    setExportingData(true)
    try {
      // 1. Fetch all user bookmarks
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)

      // 2. Fetch all user audit records
      const { data: audits } = await supabase
        .from('audit_history')
        .select('*')
        .eq('user_id', user.id)

      const exportPayload = {
        scholarhub_version: '2.0.0',
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          full_name: fullName,
          academic_field: academicField,
          academic_status: academicStatus
        },
        saved_papers_count: bookmarks?.length || 0,
        saved_papers: bookmarks || [],
        audit_history_count: audits?.length || 0,
        audit_history: audits || []
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `scholarhub_library_export_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      toast.success('Library data exported as JSON!')
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export data.')
    } finally {
      setExportingData(false)
    }
  }

  // Clear Application Cache
  const handleClearCache = () => {
    localStorage.removeItem('scholarhub_search_history')
    localStorage.removeItem('scholarhub_draft_notes')
    toast.success('Local application cache cleared.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFC] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
        </div>
        <span className="text-xs font-black text-slate-600 uppercase tracking-[0.25em] animate-pulse">Loading Settings...</span>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Academic Identity', icon: <User size={16} />, desc: 'Personal info & institution' },
    { id: 'intelligence', label: 'Research Feeds', icon: <Compass size={16} />, desc: 'Niche interests & citations' },
    { id: 'security', label: 'Security & Devices', icon: <ShieldCheck size={16} />, desc: 'Password & active sessions' },
    { id: 'data', label: 'Data & Privacy', icon: <Database size={16} />, desc: 'Export library & cache' }
  ]

  return (
    <WorkspaceLayout user={user}>
      <div className="max-w-6xl mx-auto w-full space-y-8 pb-16">
        
        {/* ─── Settings Header ─── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Account & Research Settings
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Customize your academic identity, literature intelligence feeds, and security preferences.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                {user.email}
              </span>
            </div>
          </div>

          {/* Tab Selector Navigation Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-8 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── Active Tab Content Panels ─── */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* ══════════════ TAB 1: ACADEMIC IDENTITY ══════════════ */}
            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs"
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Academic Identity & Affiliation</h2>
                    <p className="text-xs font-medium text-slate-500">How you appear across research teams, papers, and supervisor outreach.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
                  
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={13} className="text-blue-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Jane Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={13} className="text-blue-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-500 outline-none cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>

                  {/* Academic Status & Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap size={13} className="text-indigo-500" />
                          Academic Status / Role
                        </label>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                          <Lock size={10} className="text-slate-500" />
                          Permanent Status
                        </span>
                      </div>
                      <div className="w-full px-4 py-3 bg-slate-100/90 border border-slate-200/90 rounded-xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
                          <span className="text-sm font-bold text-slate-900 tracking-tight">
                            {academicStatus || 'Not Specified'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                          Configured at Onboarding
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-normal">
                        Fixed academic level for grant eligibility, lab role matching, and supervisor outreach.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Compass size={13} className="text-blue-500" />
                          Primary Academic Field
                        </label>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                          <Lock size={10} className="text-slate-500" />
                          Permanent Core Field
                        </span>
                      </div>
                      <div className="w-full px-4 py-3 bg-slate-100/90 border border-slate-200/90 rounded-xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                          <span className="text-sm font-bold text-slate-900 tracking-tight">
                            {academicField || 'Not Specified'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                          Configured at Onboarding
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-normal">
                        Bound to your AI research models, live discovery feeds, and journal metrics.
                      </p>
                    </div>
                  </div>

                  {/* Institution & Lab */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={13} className="text-emerald-500" />
                      University / Institution / Lab Affiliation
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Harvard University, Dept. of Genetics"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* ORCID iD & Google Scholar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={13} className="text-violet-500" />
                        ORCID iD
                      </label>
                      <input
                        type="text"
                        value={orcidId}
                        onChange={(e) => setOrcidId(e.target.value)}
                        placeholder="0000-0002-1825-0097"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ExternalLink size={13} className="text-amber-500" />
                        Google Scholar Profile URL
                      </label>
                      <input
                        type="url"
                        value={googleScholarUrl}
                        onChange={(e) => setGoogleScholarUrl(e.target.value)}
                        placeholder="https://scholar.google.com/citations?user=..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Academic Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══════════════ TAB 2: RESEARCH INTELLIGENCE ══════════════ */}
            {activeTab === 'intelligence' && (
              <motion.div
                key="tab-intelligence"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Research Intelligence & Personalization</h2>
                    <p className="text-xs font-medium text-slate-500">Fine-tune your automated paper discovery feeds and default citation outputs.</p>
                  </div>
                </div>

                {/* Research Disciplines Manager */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Active Research Disciplines & Topics</h3>
                      <p className="text-xs font-medium text-slate-500">These topics power your personalized Academic News Hub and trending paper alerts.</p>
                    </div>

                    <button
                      onClick={() => setShowInterestModal(true)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      + Add / Manage Topics
                    </button>
                  </div>

                  {userInterests.disciplines && userInterests.disciplines.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {userInterests.disciplines.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200/90 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs"
                        >
                          <span>{item}</span>
                          <button
                            onClick={() => handleUnpickInterest(item)}
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove topic"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-medium bg-slate-50">
                      No personalized research disciplines chosen yet. Click "+ Add / Manage Topics" above to curate your feed.
                    </div>
                  )}
                </div>

                {/* Citation Format Preference */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Default Citation Format</h3>
                    <p className="text-xs font-medium text-slate-500">Applied automatically across paper detail views and BibTeX exports.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {CITATION_STYLES.map((style) => {
                      const isSelected = citationStyle === style.id
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => handleSaveCitationStyle(style.id)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected 
                              ? 'bg-blue-50/60 border-blue-500 text-blue-950 font-black shadow-xs ring-1 ring-blue-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                          }`}
                        >
                          <span className="text-xs">{style.name}</span>
                          {isSelected && <Check size={16} className="text-blue-600 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Interest Selector Modal */}
                {showInterestModal && (
                  <InterestSelector
                    initialSelected={userInterests.disciplines || []}
                    onSave={handleSaveInterestsFromModal}
                    onClose={() => setShowInterestModal(false)}
                    isModal={true}
                  />
                )}
              </motion.div>
            )}

            {/* ══════════════ TAB 3: SECURITY & SESSIONS ══════════════ */}
            {activeTab === 'security' && (
              <motion.div
                key="tab-security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Security & Device Sessions</h2>
                    <p className="text-xs font-medium text-slate-500">Manage password credentials and active device authorizations.</p>
                  </div>
                </div>

                {/* Update Password Form */}
                <form onSubmit={handleSaveSecurity} className="space-y-5 max-w-xl">
                  <h3 className="text-sm font-black text-slate-900">Change Account Password</h3>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Key size={13} className="text-blue-500" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        minLength={6}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} className="text-blue-500" />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      minLength={6}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingSecurity}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingSecurity ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Update Password & Re-authenticate</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Active Sessions List */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Registered Devices ({devices.length} / 2)</h3>
                      <p className="text-xs font-medium text-slate-500">Revoke sessions you no longer recognize.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {devices.map((dev) => {
                      const isCurrent = dev.device_id === localStorage.getItem('scholarhub_device_id')
                      const isMobile = dev.device_name?.toLowerCase().includes('mobile') || dev.device_name?.toLowerCase().includes('phone')

                      return (
                        <div key={dev.device_id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                          isCurrent ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isCurrent ? 'bg-blue-600 text-white shadow-xs shadow-blue-200' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {isMobile ? <Smartphone size={16} /> : <Laptop size={16} />}
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                                <span>{dev.device_name || 'Authorized Device'}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-slate-400">ID: {dev.device_id.substring(0, 12)}...</span>
                            </div>
                          </div>

                          {!isCurrent && (
                            <button
                              onClick={async () => {
                                const { error } = await supabase.from('user_devices').delete().eq('device_id', dev.device_id).eq('user_id', user.id)
                                if (!error) {
                                  setDevices(devices.filter(d => d.device_id !== dev.device_id))
                                  toast.success("Device revoked.")
                                } else {
                                  toast.error("Failed to revoke device.")
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Revoke session"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ══════════════ TAB 4: DATA & PRIVACY ══════════════ */}
            {activeTab === 'data' && (
              <motion.div
                key="tab-data"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Database size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Data Management & Privacy Retention</h2>
                    <p className="text-xs font-medium text-slate-500">Export your research library or clear local application memory.</p>
                  </div>
                </div>

                {/* Export Library Data */}
                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900">Export Research Library & Audits</h3>
                    <p className="text-xs font-medium text-slate-500">Download a full JSON archive of all your bookmarked papers, notes, and audit history.</p>
                  </div>

                  <button
                    onClick={handleExportUserData}
                    disabled={exportingData}
                    className="px-5 py-3 bg-[#315CFF] hover:bg-[#2547d0] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {exportingData ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating JSON...</span>
                      </>
                    ) : (
                      <>
                        <FileDown size={16} />
                        <span>Export Library (JSON)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clear Local Cache */}
                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900">Clear Local Application Cache</h3>
                    <p className="text-xs font-medium text-slate-500">Cleans temporary search keywords and unsaved local drafts from your browser storage.</p>
                  </div>

                  <button
                    onClick={handleClearCache}
                    className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>Clear Local Cache</span>
                  </button>
                </div>

                {/* Legal / Terms */}
                <div className="pt-4 text-xs font-medium text-slate-500 flex flex-wrap gap-4">
                  <span>ScholarHub strictly adheres to GDPR & academic data sovereignty.</span>
                  <a href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</a>
                  <a href="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </WorkspaceLayout>
  )
}

export default Settings
