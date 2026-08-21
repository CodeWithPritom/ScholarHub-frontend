import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Check, X, Shield, Sparkles, Loader2, ArrowRight, Tag, Zap, 
  AlertCircle, GraduationCap, Building2, HelpCircle, ChevronDown, 
  ChevronUp, Cpu, Flame, Search, FileText, Share2, Award, Sliders
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../Footer'
import SEOHead from '../components/SEOHead'
import { BASE_URL } from '../utils/api'
import logo from '../assets/images/logo.png'

const Pricing = ({ user, profile }) => {
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState(() => sessionStorage.getItem('active_coupon_code') || '')
  const [couponStatus, setCouponStatus] = useState(() => {
    try {
      const saved = sessionStorage.getItem('active_coupon_status')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [dynamicTiers, setDynamicTiers] = useState([])
  const [loadingTiers, setLoadingTiers] = useState(true)
  
  const [localTier, setLocalTier] = useState(null)
  const userTier = localTier || profile?.tier || 'free'
  const [duration, setDuration] = useState('1_month') // '1_month', '3_months', '6_months', '1_year', 'custom'
  
  // Modals
  const [isStudentModalOpen, setStudentModalOpen] = useState(false)
  const [isCustomModalOpen, setCustomModalOpen] = useState(false)
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCelebrationModalOpen, setCelebrationModalOpen] = useState(false)
  const [upgradedTierText, setUpgradedTierText] = useState('')
  const [pendingCoupon, setPendingCoupon] = useState('')
  const [showExitWarning, setShowExitWarning] = useState(false)
  const [pendingPath, setPendingPath] = useState('')

  // Credit Estimator Slider State
  const [estimatedAudits, setEstimatedAudits] = useState(30)
  const [estimatedPdfUploads, setEstimatedPdfUploads] = useState(15)

  // Custom Lab Inquiry Form State
  const [labInquiry, setLabInquiry] = useState({
    institutionName: '',
    contactName: '',
    email: user?.email || '',
    seats: 10,
    estimatedAuditsMonthly: 500,
    notes: ''
  })

  // Comparison Table Expansion
  const [showFullComparison, setShowFullComparison] = useState(true)

  const handleNavigate = (path) => {
    if (couponStatus?.success) {
      setPendingPath(path)
      setShowExitWarning(true)
    } else {
      navigate(path)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchDynamicTiers()
  }, [])

  const fetchDynamicTiers = async () => {
    try {
      setLoadingTiers(true)
      const res = await fetch(`${BASE_URL}/api/tiers/public-config`)
      if (res.ok) {
        const data = await res.json()
        if (data.tiers && Array.isArray(data.tiers)) {
          setDynamicTiers(data.tiers)
        }
      }
    } catch (e) {
      console.warn('[PRICING] Failed to load dynamic tiers, using defaults:', e)
    } finally {
      setLoadingTiers(false)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (couponStatus?.success) {
        e.preventDefault()
        e.returnValue = "You have an active coupon. If you refresh or leave this page, you will lose this discount permanently. Are you sure?"
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [couponStatus?.success])

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return
    setPendingCoupon(couponCode.trim().toUpperCase())
    setConfirmModalOpen(true)
  }

  const confirmRedemption = async () => {
    setCouponStatus({ loading: true, error: null, success: null, discount: 0 })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Please sign in to redeem a coupon.')

      const response = await fetch(`${BASE_URL}/api/coupons/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code: pendingCoupon })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to redeem coupon.')
      }

      const data = await response.json()
      const newStatus = { 
        loading: false, 
        error: null, 
        success: data.message || 'Coupon applied & locked successfully!', 
        discount: data.discount_percent || 100,
        applicable_tier: data.applicable_tier || 'both'
      }
      setCouponStatus(newStatus)
      setCouponCode(pendingCoupon)
      sessionStorage.setItem('active_coupon_status', JSON.stringify(newStatus))
      sessionStorage.setItem('active_coupon_code', pendingCoupon)
    } catch (err) {
      setCouponStatus({ loading: false, error: err.message, success: null, discount: 0 })
    } finally {
      setConfirmModalOpen(false)
    }
  }

  const isCouponApplicableFor = (tierName) => {
    if (!couponStatus?.success) return false
    const applicableStr = (couponStatus.applicable_tier || 'both').toLowerCase()
    const applicable = applicableStr.split(',').map(s => s.trim())
    
    if (applicable.includes('both') || applicable.includes('all')) return true
    if (applicable.includes(tierName.toLowerCase())) return true
    
    const cleanDuration = duration.toLowerCase()
    const currentPkg = `${tierName.toLowerCase()}_${cleanDuration}`
    if (applicable.includes(currentPkg)) return true
    if (applicable.includes(cleanDuration)) return true
    
    return false
  }

  const handleAction = async (tierName) => {
    if (!user) {
      handleNavigate('/auth')
      return
    }

    if (tierName.toLowerCase() === 'free') {
      handleNavigate('/research')
      return
    }

    if (tierName.toLowerCase() === 'custom') {
      setCustomModalOpen(true)
      return
    }

    // 100% discount auto-redeem
    if (couponStatus?.discount === 100 && isCouponApplicableFor(tierName)) {
      setIsRedeeming(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch(`${BASE_URL}/api/subscriptions/auto-upgrade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            code: couponCode,
            target_tier: tierName.toLowerCase(),
            duration: duration.replace('_', ' ')
          })
        })
        
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.detail || 'Failed to auto-upgrade.')
        }

        setLocalTier(tierName.toLowerCase())
        setUpgradedTierText(tierName.toUpperCase())
        setCelebrationModalOpen(true)
      } catch (err) {
        toast.error(err.message)
      } finally {
        setIsRedeeming(false)
      }
      return
    }

    // WhatsApp / Direct Upgrade Checkout
    const email = user.email || 'unknown'
    let baseNum = 0
    let planPriceNum = 0
    const isCouponApplicable = isCouponApplicableFor(tierName)

    if (tierName.toLowerCase() === 'starter') {
      baseNum = duration === '1_month' ? 199 : duration === '3_months' ? 499 : duration === '6_months' ? 899 : 1499
      planPriceNum = isCouponApplicable ? Math.floor(baseNum * (1 - couponStatus.discount / 100)) : baseNum
    } else if (tierName.toLowerCase() === 'pro') {
      baseNum = duration === '1_month' ? 499 : duration === '3_months' ? 1299 : duration === '6_months' ? 2399 : 3999
      planPriceNum = isCouponApplicable ? Math.floor(baseNum * (1 - couponStatus.discount / 100)) : baseNum
    }
    
    const durationLabel = duration === '1_month' ? '1 MONTH' : duration === '3_months' ? '3 MONTHS (16% Off)' : duration === '6_months' ? '6 MONTHS (25% Off)' : '1 YEAR (37% Off)'
    let text = `Hi Pritom, I want to activate [${tierName.toUpperCase()}] [${durationLabel}] on ScholarHub AI.\n`
    text += `Standard Price: ৳${baseNum}\n`
    
    if (isCouponApplicable) {
      text += `Applied Coupon: [${couponCode.toUpperCase().trim()}] (${couponStatus.discount}% off)\n`
      text += `Discounted Payable: ৳${planPriceNum}\n`
    } else {
      text += `Payable Amount: ৳${baseNum}\n`
    }
    text += `Account Email: [${email}]`
    
    const whatsappUrl = `https://wa.me/8801853343176?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  // Fallback plans if dynamic config is loading
  const plans = [
    {
      id: 'free',
      name: 'FREE',
      price: '৳0',
      description: 'Essential toolkit for undergraduates and early-stage literature exploration.',
      monthlyZaps: 500,
      features: [
        { name: '500 Compute Zaps / month', included: true },
        { name: '10 Reference Exports / mo (Zotero & Mendeley)', included: true },
        { name: '3 PDF Document Uploads / day (Max 10MB)', included: true },
        { name: 'Unified Search (PubMed, arXiv, OpenAlex — 250M+)', included: true },
        { name: 'Standard UVE 2D Charts & Visualizations', included: true },
        { name: 'AI Ethics & Disclosure Statement Generator', included: true },
        { name: 'Standard Search Speed (10s Queue Cooldown)', included: true },
        { name: 'Fast Literature Synthesis (5s Cooldown Bypass)', included: false },
        { name: 'Statistical Test Advisor & Python/R Code', included: false },
        { name: 'Deep Reasoning 🧠 Chain-of-Thought', included: false },
        { name: 'The Peer Reviewer & Risk of Bias Matrix', included: false },
        { name: 'Zero-Queue Dedicated AI Gateway Routing', included: false }
      ],
      buttonText: user ? (userTier === 'free' ? 'Current Plan' : 'Free Tier') : 'Register & Start Researching',
      isCurrent: userTier === 'free',
      isUpgrade: false
    },
    {
      id: 'starter',
      name: 'STARTER',
      price: duration === '1_month' ? '৳199' : duration === '3_months' ? '৳499' : duration === '6_months' ? '৳899' : duration === '1_year' ? '৳1,499' : 'Custom',
      basePriceNum: duration === '1_month' ? 199 : duration === '3_months' ? 499 : duration === '6_months' ? 899 : duration === '1_year' ? 1499 : 0,
      period: duration === '1_month' ? '/mo' : duration === '3_months' ? '/3 mo' : duration === '6_months' ? '/6 mo' : duration === '1_year' ? '/yr' : '',
      originalPrice: duration === '1_month' ? null : duration === '3_months' ? '৳597' : duration === '6_months' ? '৳1,194' : duration === '1_year' ? '৳2,388' : null,
      savings: duration === '1_month' ? null : duration === '3_months' ? '98' : duration === '6_months' ? '295' : duration === '1_year' ? '889' : null,
      description: 'High-speed synthesis & analytical tools for active university & graduate researchers.',
      monthlyZaps: 1500,
      features: [
        { name: '1,500 Compute Zaps / month', included: true },
        { name: '50 Reference Exports / mo (BibTeX, Zotero, Mendeley)', included: true },
        { name: '9 PDF Document Uploads / day (Max 25MB)', included: true },
        { name: 'High-Speed Search (5s Cooldown Bypass)', included: true },
        { name: 'Full UVE 2D/3D Mindmap & Visual Engine', included: true },
        { name: 'Statistical Test Advisor & Python/R Code', included: true },
        { name: 'Research DNA Vector Tracking & Faculty Matching', included: true },
        { name: 'Weekly Curated Academic Digest Email', included: true },
        { name: 'Deep Reasoning 🧠 Chain-of-Thought', included: false },
        { name: 'The Peer Reviewer & Risk of Bias Matrix', included: false },
        { name: 'Vision-RAG Multimodal Paper OCR', included: false },
        { name: 'Zero-Queue Dedicated AI Gateway Routing', included: false }
      ],
      buttonText: user ? (userTier === 'starter' ? 'Current Plan' : 'Upgrade to Starter') : 'Login to Upgrade',
      isCurrent: userTier === 'starter',
      isUpgrade: true,
      popular: true
    },
    {
      id: 'pro',
      name: 'PRO',
      price: duration === '1_month' ? '৳499' : duration === '3_months' ? '৳1,299' : duration === '6_months' ? '৳2,399' : duration === '1_year' ? '৳3,999' : 'Custom',
      basePriceNum: duration === '1_month' ? 499 : duration === '3_months' ? 1299 : duration === '6_months' ? 2399 : duration === '1_year' ? 3999 : 0,
      originalPrice: duration === '1_month' ? null : duration === '3_months' ? '৳1,497' : duration === '6_months' ? '৳2,994' : duration === '1_year' ? '৳5,988' : null,
      savings: duration === '1_month' ? null : duration === '3_months' ? '198' : duration === '6_months' ? '595' : duration === '1_year' ? '1,989' : null,
      period: duration === '1_month' ? '/mo' : duration === '3_months' ? '/3 mo' : duration === '6_months' ? '/6 mo' : duration === '1_year' ? '/yr' : '',
      description: 'The ultimate AI Research IDE for PhD candidates, principal investigators & heavy compute.',
      monthlyZaps: 3000,
      features: [
        { name: '3,000 Compute Zaps / month', included: true },
        { name: '100 Reference Exports / mo (Unlimited styles)', included: true },
        { name: '15 PDF Document Uploads / day (Max 50MB)', included: true },
        { name: 'Instant Search (Zero cooldown & highest priority)', included: true },
        { name: 'Deep Reasoning 🧠 Full Chain-of-Thought', included: true },
        { name: 'The Peer Reviewer & Cochrane Risk of Bias Matrix', included: true },
        { name: 'Vision-RAG Multimodal Paper & Chart Parser', included: true },
        { name: 'Research Gap Detector & Novelty Radar', included: true },
        { name: 'Daily Morning Breakthrough Intelligence Briefing', included: true },
        { name: 'Zero-Queue Dedicated AI Gateway Routing', included: true },
        { name: 'Direct Faculty ORCID & Outreach Drafter', included: true },
        { name: 'Priority 24/7 VIP Admin Support', included: true }
      ],
      buttonText: user ? (userTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro') : 'Login to Upgrade',
      isCurrent: userTier === 'pro',
      isUpgrade: true,
      premium: true
    },
    {
      id: 'custom',
      name: 'CUSTOM / LAB',
      price: 'Custom',
      description: 'Tailored multi-seat license and dedicated AI infrastructure for university labs & departments.',
      monthlyZaps: 10000,
      features: [
        { name: 'Custom Dedicated Zap Credit Quotas', included: true },
        { name: 'Multi-Seat Lab Member Management', included: true },
        { name: 'Isolated Organizational AI Budget & RPM Limit', included: true },
        { name: 'Unlimited PDF Uploads & Batch OCR', included: true },
        { name: 'Institutional Invoicing & Department Billing', included: true },
        { name: 'Dedicated AI Gateway Instance with 99.9% SLA', included: true }
      ],
      buttonText: 'Request Lab Quote',
      isCurrent: userTier === 'custom',
      isUpgrade: true,
      institutional: true
    }
  ]

  // Filter plans based on duration (if custom tab selected, focus custom)
  const displayPlans = duration === 'custom' ? plans.filter(p => p.id === 'custom' || p.id === 'pro') : plans.filter(p => p.id !== 'custom')

  // Recommended Tier based on Estimator
  const totalRequiredZaps = (estimatedAudits * 25) + (estimatedPdfUploads * 15)
  const recommendedTier = totalRequiredZaps > 1500 ? 'PRO' : totalRequiredZaps > 500 ? 'STARTER' : 'FREE'

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ScholarHub AI Research Plans & Compute Subscriptions",
    "image": "https://scholarhub-ai.com/logo.png",
    "description": "Flexible subscription tiers for individual researchers and university labs. FREE, STARTER, PRO, and CUSTOM plans with up to 37% multi-month savings.",
    "brand": {
      "@type": "Brand",
      "name": "ScholarHub AI"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "BDT",
      "lowPrice": "0",
      "highPrice": "3999",
      "offerCount": "4",
      "offers": [
        {
          "@type": "Offer",
          "name": "FREE Plan",
          "price": "0",
          "priceCurrency": "BDT",
          "url": "https://scholarhub-ai.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "STARTER Plan",
          "price": "199",
          "priceCurrency": "BDT",
          "url": "https://scholarhub-ai.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "PRO Plan",
          "price": "499",
          "priceCurrency": "BDT",
          "url": "https://scholarhub-ai.com/pricing"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-sds-bg font-sans selection:bg-blue-500/20 text-sds-text">
      <SEOHead
        title="Pricing & Compute Plans | ScholarHub AI"
        description="Choose the right AI research tier for your academic workflow. Flexible monthly and annual plans for students, PhD scholars, and university labs."
        canonicalPath="/pricing"
        schemaJson={pricingSchema}
      />
      
      {/* Navbar Minimal */}
      <nav className="border-b border-sds-border bg-sds-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full 2xl:px-12 mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
            <img src={logo} alt="ScholarHub AI" className="h-10 w-auto object-contain" />
            <span className="text-xl font-black tracking-tighter text-sds-text">ScholarHub<span className="text-blue-500">AI</span></span>
          </div>
          <button 
            onClick={() => handleNavigate(user ? '/research' : '/auth')}
            className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {user ? 'Back to Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="w-full 2xl:px-12 mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-36">
        
        {/* Guest Banner */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10 p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <AlertCircle className="text-blue-600 shrink-0" size={24} />
              <p className="text-sm font-bold text-blue-900">Create a free researcher account to activate, manage and sync subscription plans seamlessly.</p>
            </div>
            <button 
              onClick={() => handleNavigate('/auth')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Sign Up Free
            </button>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
            <Zap size={14} className="text-amber-500" /> Transparent Academic Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Accelerate your Literature Synthesis & <br className="hidden sm:block" />
            <span className="text-blue-600">Research Discovery</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Predictable academic plans with guaranteed compute quotas, deep reasoning synthesis, and zero-queue AI gateway routing.
          </p>

          {/* Coupon Input Box */}
          {user && (
            <div className="max-w-md mx-auto mt-8 bg-white p-2 rounded-2xl border border-slate-200 flex items-center shadow-xs focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <div className="pl-4 text-slate-400">
                <Tag size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Enter discount coupon code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 uppercase"
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponStatus?.loading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {couponStatus?.loading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}

          {/* Active Coupon Banner */}
          {couponStatus?.success && (
            <div className="max-w-md mx-auto mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-emerald-600" /> {couponStatus.discount}% Discount Locked ({couponCode.toUpperCase()})</span>
              <span className="text-[10px] uppercase font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Active</span>
            </div>
          )}

          {/* Duration Selector Tabs */}
          <div className="mt-10 inline-flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex-wrap justify-center gap-1 shadow-inner">
            {[
              { id: '1_month', label: '1 Month', badge: null },
              { id: '3_months', label: '3 Months', badge: 'Save 16%' },
              { id: '6_months', label: '6 Months', badge: 'Save 25%' },
              { id: '1_year', label: '1 Year', badge: 'Save 37%' },
              { id: 'custom', label: 'Institutional / Lab', badge: 'Multi-Seat' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDuration(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  duration === tab.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    tab.id === '1_year' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 ${duration === 'custom' ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'} gap-6 lg:gap-8 items-stretch w-full mx-auto`}>
          {displayPlans.map((plan) => {
            const isCouponApplicable = isCouponApplicableFor(plan.name)
            return (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 lg:p-8 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm ${
                  plan.premium 
                    ? 'border-2 border-amber-500 ring-4 ring-amber-500/10' 
                    : plan.popular 
                    ? 'border-2 border-blue-600 ring-4 ring-blue-600/10'
                    : plan.institutional
                    ? 'border-2 border-indigo-600 ring-4 ring-indigo-600/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Floating Badges */}
                {plan.premium && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Flame size={12} /> THESIS & PHD SUITE
                  </div>
                )}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles size={12} /> MOST POPULAR
                  </div>
                )}
                {plan.institutional && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Building2 size={12} /> DEDICATED CAPACITY
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${
                      plan.premium ? 'text-amber-600' : plan.popular ? 'text-blue-600' : plan.institutional ? 'text-indigo-600' : 'text-slate-500'
                    }`}>
                      {plan.name}
                    </h3>
                    
                    {/* Price Display */}
                    <div className="flex flex-col mb-3">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {isCouponApplicable && plan.isUpgrade ? (
                          <>
                            <span className="text-2xl font-bold text-slate-400 line-through mr-1">{plan.price}</span>
                            <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                              {couponStatus.discount === 100 ? '৳ 0' : `৳ ${Math.floor(plan.basePriceNum * (1 - couponStatus.discount / 100))}`}
                            </span>
                          </>
                        ) : (
                          <>
                            {plan.originalPrice && (
                              <span className="text-2xl font-bold text-slate-400 line-through mr-1">{plan.originalPrice}</span>
                            )}
                            <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                          </>
                        )}
                        {plan.period && <span className="text-slate-500 font-bold text-xs">{plan.period}</span>}
                      </div>

                      {/* Savings Pill */}
                      {plan.savings && !isCouponApplicable && (
                        <div className="mt-2 text-xs font-black text-emerald-800 bg-emerald-50 self-start px-3 py-1 rounded-full border border-emerald-200">
                          Save ৳{plan.savings} ({duration === '3_months' ? '16%' : duration === '6_months' ? '25%' : '37%'} off)
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8 pt-4 border-t border-slate-100">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center mt-0.5 ${
                          feature.included ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {feature.included ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                        </div>
                        <span className={`text-xs font-semibold leading-snug ${feature.included ? 'text-slate-800' : 'text-slate-400'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Action */}
                <div>
                  <button
                    onClick={() => handleAction(plan.name)}
                    disabled={isRedeeming || plan.isCurrent}
                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      plan.isCurrent 
                        ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default' 
                        : couponStatus?.discount === 100 && plan.isUpgrade && isCouponApplicable
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                        : plan.premium
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/20'
                        : plan.institutional
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/20'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                    }`}
                  >
                    {isRedeeming && plan.isUpgrade ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : couponStatus?.discount === 100 && plan.isUpgrade && isCouponApplicable ? (
                      <>CLAIM 100% FREE ACCESS ✨ <ArrowRight size={14} /></>
                    ) : (
                      <>{plan.buttonText} {!plan.isCurrent && <ArrowRight size={14} />}</>
                    )}
                  </button>

                  {plan.isUpgrade && !plan.institutional && !(couponStatus?.discount === 100 && isCouponApplicable) && user && (
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                      Instant WhatsApp Activation (Bkash / Nagad)
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Interactive Compute & Zap Estimator ─── */}
        <div className="mt-16 max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-2">
                <Sliders size={12} /> Workload Calculator
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Estimate Your Monthly Compute Needs
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Slide your typical monthly workload to find the optimal tier without overpaying.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center shrink-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Recommended Plan</div>
              <div className={`text-lg font-black tracking-tight mt-0.5 ${
                recommendedTier === 'PRO' ? 'text-amber-600' : recommendedTier === 'STARTER' ? 'text-blue-600' : 'text-slate-800'
              }`}>
                {recommendedTier} TIER
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">AI Paper Audits / Month</label>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{estimatedAudits} Audits</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="120" 
                value={estimatedAudits} 
                onChange={(e) => setEstimatedAudits(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 font-medium">Estimated Zap Cost: ~{estimatedAudits * 25} Zaps</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">PDF Uploads & OCR / Month</label>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{estimatedPdfUploads} Documents</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={estimatedPdfUploads} 
                onChange={(e) => setEstimatedPdfUploads(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400 font-medium">Estimated Zap Cost: ~{estimatedPdfUploads * 15} Zaps</span>
            </div>
          </div>
        </div>

        {/* ─── Deep Feature Comparison Table (Supabase/Vercel style) ─── */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Full Capability Comparison</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Detailed feature-by-feature breakdown across all research plans.</p>
            </div>
            <button
              onClick={() => setShowFullComparison(!showFullComparison)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {showFullComparison ? <><ChevronUp size={14} /> Collapse Matrix</> : <><ChevronDown size={14} /> Expand Matrix</>}
            </button>
          </div>

          {showFullComparison && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-900 font-black">
                      <th className="py-4 px-6 uppercase tracking-wider text-[11px] w-1/3">Feature / Capability</th>
                      <th className="py-4 px-4 text-center">FREE</th>
                      <th className="py-4 px-4 text-center text-blue-600">STARTER</th>
                      <th className="py-4 px-4 text-center text-amber-600">PRO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {/* Search & Literature */}
                    <tr className="bg-slate-50/40"><td colSpan={4} className="py-2.5 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">1. Literature Retrieval & Data Sources</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">PubMed / NCBI, arXiv & OpenAlex (250M+ Papers)</td><td className="text-center font-bold text-emerald-600">Full Access</td><td className="text-center font-bold text-emerald-600">Full Access</td><td className="text-center font-bold text-emerald-600">Full Access</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Search Speed Queue & Rate Limits</td><td className="text-center">10s Cooldown</td><td className="text-center text-blue-600 font-bold">5s Fast Bypass</td><td className="text-center text-amber-600 font-bold">0s Instant Dedicated</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">SJR Journal Quality & Quartiles (Q1-Q4)</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td></tr>

                    {/* AI Compute */}
                    <tr className="bg-slate-50/40"><td colSpan={4} className="py-2.5 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">2. AI Synthesis & Reasoning Engine</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Monthly Compute Credits (Zaps)</td><td className="text-center font-bold">500 Zaps</td><td className="text-center font-bold text-blue-600">1,500 Zaps</td><td className="text-center font-bold text-amber-600">3,000 Zaps</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Deep Reasoning 🧠 Chain-of-Thought Synthesis</td><td className="text-center text-slate-300">—</td><td className="text-center text-slate-300">—</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /> Dedicated Model</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">The Peer Reviewer & Risk of Bias Matrix</td><td className="text-center text-slate-300">—</td><td className="text-center text-slate-300">—</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /> Cochrane Standard</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Vision-RAG Multimodal Paper OCR</td><td className="text-center text-slate-300">—</td><td className="text-center text-slate-300">—</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /> Up to 50MB</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Research Gap Detector & Novelty Radar</td><td className="text-center text-slate-300">—</td><td className="text-center text-slate-300">—</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td></tr>

                    {/* Visual Intelligence */}
                    <tr className="bg-slate-50/40"><td colSpan={4} className="py-2.5 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">3. Universal Visualization Engine (UVE)</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Interactive 2D Knowledge Graphs & Flowcharts</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td></tr>
                    <tr><td className="py-3 px-6 font-semibold">3D Mindmaps & Orbital Graph Visualizers</td><td className="text-center text-slate-300">—</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Molecular Chemistry & Circuit Adapters</td><td className="text-center text-slate-300">—</td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td><td className="text-center font-bold text-emerald-600"><Check size={14} className="inline" /></td></tr>

                    {/* Exports & Governance */}
                    <tr className="bg-slate-50/40"><td colSpan={4} className="py-2.5 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">4. Exports, Storage & Support</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Reference Exports / Month (BibTeX, Zotero, Mendeley)</td><td className="text-center">10 / mo</td><td className="text-center font-bold text-blue-600">50 / mo</td><td className="text-center font-bold text-amber-600">100 / mo</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Daily PDF Uploads & Max Size</td><td className="text-center">3 / day (10MB)</td><td className="text-center">9 / day (25MB)</td><td className="text-center font-bold">15 / day (50MB)</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Live Device Concurrency Slots</td><td className="text-center font-bold">2 Devices</td><td className="text-center font-bold">2 Devices</td><td className="text-center font-bold">2 Devices</td></tr>
                    <tr><td className="py-3 px-6 font-semibold">Support SLA</td><td className="text-center">Community</td><td className="text-center">Standard Email (24h)</td><td className="text-center font-bold text-amber-600">VIP Priority (1-2h)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Student Outreach Banner */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-400/20">
                  <GraduationCap size={14} /> Student Outreach Initiative
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                  Get 1 Month of <span className="text-amber-400">PRO Tier</span> for Free
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  We believe cost should never block breakthroughs. Bangladeshi university students can claim a 30-day Pro license by verifying their student ID.
                </p>
              </div>
              <button
                onClick={() => setStudentModalOpen(true)}
                className="shrink-0 px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Claim Student Access
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* ─── Institutional / Custom Lab Modal ─── */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
            onClick={() => setCustomModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setCustomModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-xl"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Building2 size={24} />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">Institutional & Lab Plan Setup</h3>
              <p className="text-xs text-slate-500 font-medium mb-5">
                Configure dedicated organizational compute quotas, isolated AI budgets, and multi-seat licensing.
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">University / Lab Name</label>
                  <input 
                    type="text" 
                    value={labInquiry.institutionName} 
                    onChange={e => setLabInquiry({...labInquiry, institutionName: e.target.value})}
                    placeholder="e.g. University of Dhaka Bioinformatics Lab"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Researcher Seats</label>
                    <input 
                      type="number" 
                      min="3" 
                      max="100" 
                      value={labInquiry.seats} 
                      onChange={e => setLabInquiry({...labInquiry, seats: parseInt(e.target.value) || 5})}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      value={labInquiry.email} 
                      onChange={e => setLabInquiry({...labInquiry, email: e.target.value})}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const msg = `Hi Pritom, I would like to set up an Institutional / Custom Lab License on ScholarHub AI.\nLab Name: ${labInquiry.institutionName || 'Institutional Lab'}\nSeats: ${labInquiry.seats}\nContact Email: ${labInquiry.email}`
                  window.open(`https://wa.me/8801853343176?text=${encodeURIComponent(msg)}`, '_blank')
                  setCustomModalOpen(false)
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                Submit Lab Inquiry via WhatsApp
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Verification Modal */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
            onClick={() => setStudentModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setStudentModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-xl"
              >
                <X size={18} />
              </button>
              
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">Verify Student Status 🎓</h3>
              <p className="text-xs text-slate-500 font-medium mb-5">
                Send your valid student ID to claim your 30-day Pro subscription.
              </p>
              
              <div className="space-y-2.5 mb-6 text-xs font-semibold text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                  <span>Clear picture of Student ID (Front & Back)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                  <span>Institutional (Student) Email Address</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const msg = `Hi Pritom, I want to claim the 1-Month Free PRO Student Subscription. User Email: ${user?.email || 'unknown'}`
                  window.open(`https://wa.me/8801853343176?text=${encodeURIComponent(msg)}`, '_blank')
                  setStudentModalOpen(false)
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Send to WhatsApp & Claim
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupon Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
            onClick={() => setConfirmModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-auto text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-xl"
              >
                <X size={18} />
              </button>
              
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-4">
                <Tag size={24} />
              </div>
              
              <h3 className="text-xl font-black mb-1">Confirm Coupon Redemption</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Are you sure you want to apply <strong className="text-slate-900">[{pendingCoupon}]</strong>? Once applied, it will be locked to your account.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={confirmRedemption}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Proceed & Apply
                </button>
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Upgrade Celebration Modal */}
      <AnimatePresence>
        {isCelebrationModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl text-center my-auto"
            >
              <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
                <Sparkles size={30} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Congratulations! 🎉</h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-6">
                Your account is now upgraded to <span className="text-amber-600 font-black">{upgradedTierText}</span>.
              </p>

              <button
                onClick={() => {
                  sessionStorage.removeItem('active_coupon_status')
                  sessionStorage.removeItem('active_coupon_code')
                  navigate('/research')
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Workspace <ArrowRight size={15} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
            onClick={() => setShowExitWarning(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">Forfeit Active Discount?</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                You have an active one-time discount coupon locked. If you leave this page, it cannot be reused.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Stay on Pricing
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('active_coupon_status')
                    sessionStorage.removeItem('active_coupon_code')
                    setShowExitWarning(false)
                    navigate(pendingPath)
                  }}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Leave & Forfeit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer user={user} onAuthRequired={() => handleNavigate('/auth')} />
    </div>
  )
}

export default Pricing
