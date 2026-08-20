import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, X, Shield, Sparkles, Loader2, ArrowRight, Tag, Zap, AlertCircle, GraduationCap } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../Footer'
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
  }) // { loading, error, success, discount, applicable_tier }
  const [isRedeeming, setIsRedeeming] = useState(false)
  
  // Use local state for immediate UI updates, falling back to global profile
  const [localTier, setLocalTier] = useState(null)
  const userTier = localTier || profile?.tier || 'free'
  const [duration, setDuration] = useState('1 month') // '1 month', '3 months', '6 months', '1 year'
  const [isStudentModalOpen, setStudentModalOpen] = useState(false)
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCelebrationModalOpen, setCelebrationModalOpen] = useState(false)
  const [upgradedTierText, setUpgradedTierText] = useState('')
  const [pendingCoupon, setPendingCoupon] = useState('')
  const [showExitWarning, setShowExitWarning] = useState(false)
  const [pendingPath, setPendingPath] = useState('')

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
  }, [])

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

  useEffect(() => {
    if (!user) {
      setLocalTier('free')
      return
    }
  }, [user])

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

  const handleAction = async (tierName) => {
    if (!user) {
      handleNavigate('/auth')
      return
    }

    if (tierName.toLowerCase() === 'free') {
      handleNavigate('/research')
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
            duration: duration
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

    // WhatsApp flow
    const email = user.email || 'unknown'
    let baseNum = 0
    let planPriceNum = 0
    const isCouponApplicable = isCouponApplicableFor(tierName)

    if (tierName.toLowerCase() === 'starter') {
      baseNum = duration === '1 month' ? 199 : duration === '3 months' ? 499 : duration === '6 months' ? 899 : 1499;
      planPriceNum = isCouponApplicable ? Math.floor(baseNum * (1 - couponStatus.discount / 100)) : baseNum
    } else if (tierName.toLowerCase() === 'pro') {
      baseNum = duration === '1 month' ? 499 : duration === '3 months' ? 1299 : duration === '6 months' ? 2399 : 3999;
      planPriceNum = isCouponApplicable ? Math.floor(baseNum * (1 - couponStatus.discount / 100)) : baseNum
    } else if (tierName.toLowerCase() === 'custom') {
      const text = `Hi Pritom, I am interested in a Custom / Institutional Lab Plan for ScholarHub AI.\nMy email is [${email}]. Please share pricing for multi-seat / department setup.`
      window.open(`https://wa.me/8801853343176?text=${encodeURIComponent(text)}`, '_blank')
      return
    }
    
    let text = `Hi Pritom, I want to upgrade to [${tierName.toUpperCase()}] [${duration.toUpperCase()}].\n`
    text += `Original Price: ৳${baseNum}.\n`
    
    if (isCouponApplicable) {
      text += `Applying Coupon: [${couponCode.toUpperCase().trim()}] (${couponStatus.discount}% off).\n`
      text += `I need to pay: ৳${planPriceNum}.\n`
    } else {
      text += `I need to pay: ৳${baseNum}.\n`
    }
    text += `My email is [${email}].`
    
    const whatsappUrl = `https://wa.me/8801853343176?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const isCouponApplicableFor = (tierName) => {
    if (!couponStatus?.success) return false;
    const applicableStr = (couponStatus.applicable_tier || 'both').toLowerCase();
    const applicable = applicableStr.split(',').map(s => s.trim());
    
    if (applicable.includes('both') || applicable.includes('all')) return true;
    if (applicable.includes(tierName.toLowerCase())) return true;
    
    const cleanDuration = duration.replace(' ', '_').toLowerCase();
    const currentPkg = `${tierName.toLowerCase()}_${cleanDuration}`;
    if (applicable.includes(currentPkg)) return true;
    if (applicable.includes(cleanDuration)) return true;
    
    return false;
  }

  const plans = [
    {
      name: 'FREE',
      price: '৳0',
      description: 'Essential toolkit for undergraduates and early-stage literature exploration.',
      features: [
        { name: '500 Compute Credits (Zaps) / mo', included: true },
        { name: '10 Reference Exports / mo (Zotero & Mendeley)', included: true },
        { name: '3 PDF Document Uploads / day (Max 10MB)', included: true },
        { name: '200 Saved Papers & Unlimited Collections', included: true },
        { name: 'Unified Search (PubMed, arXiv, OpenAlex — 250M+)', included: true },
        { name: 'AI Disclosure & Ethics Generator (Skill #4)', included: true },
        { name: 'Standard Search Speed (Normal queue)', included: true },
        { name: 'Faculty & Author Cold Outreach Drafter (Skill #7)', included: false },
        { name: 'Stats Advisor & Python/R Script Generator (Skill #6)', included: false },
        { name: 'Scientific Pitch Suite (1-min, 3-min, Defense Q&A)', included: false },
        { name: 'The Peer Reviewer & Risk of Bias Matrix (Skill #5)', included: false },
        { name: 'Deep Reasoning 🧠 Compute Access', included: false }
      ],
      color: 'slate',
      buttonText: user ? (userTier === 'free' ? 'Current Plan' : 'Free Tier') : 'Register & Start Researching',
      isCurrent: userTier === 'free',
      isUpgrade: false
    },
    {
      name: 'STARTER',
      price: duration === '1 month' ? '৳199' : duration === '3 months' ? '৳499' : duration === '6 months' ? '৳899' : duration === '1 year' ? '৳1,499' : 'Custom Quote',
      basePriceNum: duration === '1 month' ? 199 : duration === '3 months' ? 499 : duration === '6 months' ? 899 : duration === '1 year' ? 1499 : 0,
      period: duration === '1 month' ? '/mo' : duration === '3 months' ? '/3 mo' : duration === '6 months' ? '/6 mo' : duration === '1 year' ? '/yr' : '',
      originalPrice: duration === '1 month' ? null : duration === '3 months' ? '৳597' : duration === '6 months' ? '৳1,194' : duration === '1 year' ? '৳2,388' : null,
      savings: duration === '1 month' ? null : duration === '3 months' ? '98' : duration === '6 months' ? '295' : duration === '1 year' ? '889' : null,
      description: 'High-speed synthesis & academic tools for active university & graduate researchers.',
      features: [
        { name: '1,500 Compute Credits (Zaps) / mo', included: true },
        { name: '50 Reference Exports / mo (Zotero, Mendeley, BibTeX)', included: true },
        { name: '9 PDF Document Uploads / day (Max 25MB)', included: true },
        { name: 'High-Speed Search (5s Cooldown Bypass)', included: true },
        { name: 'AI Ethics & Disclosure Statement Generator (Skill #4)', included: true },
        { name: 'Statistical Test Advisor & Python/R Code (Skill #6)', included: true },
        { name: 'Scientific Pitch Suite (1-min, 3-min, Defense Q&A)', included: true },
        { name: 'Research DNA Profile & Supervisor Outreach (Skill #7)', included: true },
        { name: 'Research Report & Structured Review Mode', included: true },
        { name: 'The Peer Reviewer & Risk of Bias Matrix (Skill #5)', included: false },
        { name: 'Deep Reasoning 🧠 Compute Access', included: false }
      ],
      color: 'blue',
      buttonText: user ? (userTier === 'starter' ? 'Current Plan' : duration === 'Custom' ? 'Contact for Lab Quote' : 'Upgrade to Starter') : 'Login to Upgrade',
      isCurrent: userTier === 'starter',
      isUpgrade: true,
      popular: true
    },
    {
      name: 'PRO',
      price: duration === '1 month' ? '৳499' : duration === '3 months' ? '৳1,299' : duration === '6 months' ? '৳2,399' : duration === '1 year' ? '৳3,999' : 'Custom Quote',
      basePriceNum: duration === '1 month' ? 499 : duration === '3 months' ? 1299 : duration === '6 months' ? 2399 : duration === '1 year' ? 3999 : 0,
      originalPrice: duration === '1 month' ? null : duration === '3 months' ? '৳1,497' : duration === '6 months' ? '৳2,994' : duration === '1 year' ? '৳5,988' : null,
      savings: duration === '1 month' ? null : duration === '3 months' ? '198' : duration === '6 months' ? '595' : duration === '1 year' ? '1,989' : null,
      period: duration === '1 month' ? '/mo' : duration === '3 months' ? '/3 mo' : duration === '6 months' ? '/6 mo' : duration === '1 year' ? '/yr' : '',
      description: 'The ultimate AI Research IDE for PhD candidates, principal investigators & heavy compute.',
      features: [
        { name: '3,000 Compute Credits (Zaps) / mo', included: true },
        { name: '100 Reference Exports / mo (Unlimited styles)', included: true },
        { name: '15 PDF Document Uploads / day (Max 50MB)', included: true },
        { name: 'Instant Search (Zero cooldown & highest priority)', included: true },
        { name: 'Deep Reasoning 🧠 Compute (Full Chain-of-Thought)', included: true },
        { name: 'The Peer Reviewer & Risk of Bias Matrix (Skill #5)', included: true },
        { name: 'Vision-RAG Multimodal Paper & Chart Parser (Skill #2)', included: true },
        { name: 'AI Research Gap Detector & Novelty Radar (Skill #3)', included: true },
        { name: 'Statistical Test Advisor + Python/R Scripts (Skill #6)', included: true },
        { name: 'Scientific Pitch Suite & Defense Simulator (Skill #8)', included: true },
        { name: 'Priority 24/7 VIP Admin Support', included: true }
      ],
      color: 'amber',
      buttonText: user ? (userTier === 'pro' ? 'Current Plan' : duration === 'Custom' ? 'Contact for Institutional Quote' : 'Upgrade to Pro') : 'Login to Upgrade',
      isCurrent: userTier === 'pro',
      isUpgrade: true,
      premium: true
    }
  ]

  return (
    <div className="min-h-screen bg-sds-bg font-sans selection:bg-blue-500/20 text-sds-text">
      
      {/* Navbar Minimal */}
      <nav className="border-b border-sds-border bg-sds-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full 2xl:px-12 mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
            <img src={logo} alt="ScholarHub AI" className="h-10 w-auto object-contain" />
            <span className="text-xl font-black tracking-tighter text-sds-text">ScholarHub<span className="text-blue-500">AI</span></span>
          </div>
          <button 
            onClick={() => handleNavigate(user ? '/research' : '/auth')}
            className="text-sm font-bold text-slate-700 hover:text-blue-400 transition-colors"
          >
            {user ? 'Back to Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="w-full 2xl:px-12 mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-48">
        {/* Banner if Guest */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12 p-5 bg-blue-50 border border-blue-200 rounded-[12px] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <AlertCircle className="text-blue-400 shrink-0" size={24} />
              <p className="text-sm font-bold text-blue-300">You must create a free account to activate and manage subscription plans.</p>
            </div>
            <button 
              onClick={() => handleNavigate('/auth')}
              className="px-6 py-2.5 bg-[#315CFF] hover:bg-[#2547d0] text-white text-sds-text text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Sign Up Now
            </button>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-sds-text tracking-tight mb-4 sm:mb-6 leading-tight">
            ScholarHub AI Pricing: <br className="hidden sm:block" /><span className="text-blue-500">Supercharge your Research</span>
          </h1>
          <p className="text-lg text-slate-700 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Unlock multi-disciplinary AI models, bypass rate limits, and discover breakthroughs faster than ever before.
          </p>

          {/* Coupon System */}
          {user && (
            <div className="max-w-md mx-auto bg-white p-2 rounded-[12px] border border-sds-border flex items-center focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <div className="pl-4 text-slate-700">
                <Tag size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Have a coupon code?" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-bold text-sds-text placeholder:text-slate-700 placeholder:font-medium uppercase"
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponStatus?.loading}
                className="px-6 py-3 bg-sds-bg hover:bg-white border border-sds-border text-sds-text text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity: 0y-50"
              >
                {couponStatus?.loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}
          
          <AnimatePresence>
            {couponStatus?.error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-3">
                {couponStatus.error}
              </motion.p>
            )}
            {couponStatus?.success && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-sm font-black mt-3 flex items-center justify-center gap-1">
                <Check size={16} /> {couponStatus.success} ({couponStatus.discount}% OFF)
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Duration Toggle */}
        <div className="flex justify-center mb-16 relative z-20 w-full overflow-x-auto pb-4">
          <div className="bg-white p-1.5 rounded-full flex items-center relative gap-1 border border-sds-border min-w-max">
            {['1 month', '3 months', '6 months', '1 year', 'Custom'].map(opt => (
              <button
                key={opt}
                onClick={() => setDuration(opt)}
                className={`relative px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full transition-colors flex items-center gap-2`}
              >
                {duration === opt && (
                  <motion.div
                    layoutId="billing-indicator"
                    className="absolute inset-0 bg-sds-bg rounded-full border border-sds-border"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${duration === opt ? 'text-sds-text' : 'text-slate-700'}`}>
                  {opt}
                  {opt === '1 year' && (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-black tracking-wider border border-emerald-300 whitespace-nowrap">
                      Save 35%+
                    </span>
                  )}
                  {opt === 'Custom' && (
                    <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded-full font-black tracking-wider border border-purple-300 whitespace-nowrap">
                      Lab / Multi-Seat
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative bg-white rounded-[12px] p-6 md:p-5 lg:p-8 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                plan.premium 
                  ? 'border-2 border-sds-accent shadow-sm md:scale-105 z-10 bg-white' 
                  : plan.popular 
                  ? 'border-2 border-blue-600 shadow-sm md:scale-105 z-10 bg-white'
                  : 'border-sds-border shadow-sm bg-white'
              }`}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-sds-text text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-none flex items-center gap-1.5 whitespace-nowrap">
                  <Zap size={12} /> FULL RESEARCH IDE
                </div>
              )}
              {plan.popular && !plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-sds-text text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-none flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles size={12} /> MOST POPULAR
                </div>
              )}
              
              <div>
                <div className="mb-8">
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${
                    plan.premium ? 'text-amber-500' : plan.color === 'blue' ? 'text-blue-400' : 'text-slate-700'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      {isCouponApplicableFor(plan.name) && plan.isUpgrade ? (
                        <>
                          <span className="text-2xl sm:text-3xl font-bold text-slate-700 line-through mr-2">{plan.price}</span>
                          <span className="text-4xl sm:text-5xl font-black text-sds-text tracking-tight">
                            {couponStatus.discount === 100 ? '৳ 0' : `৳ ${Math.floor(plan.basePriceNum * (1 - couponStatus.discount / 100))}`}
                          </span>
                        </>
                      ) : (
                        <>
                          {plan.originalPrice && (
                            <span className="text-2xl sm:text-3xl font-bold text-slate-700 line-through mr-2">{plan.originalPrice}</span>
                          )}
                          <span className="text-4xl sm:text-5xl font-black text-sds-text tracking-tight">{plan.price.replace('৳', '৳ ')}</span>
                        </>
                      )}
                      {plan.period && <span className="text-slate-700 font-bold">{plan.period}</span>}
                    </div>
                    {plan.savings && !(isCouponApplicableFor(plan.name)) && (
                      <div className="mt-2 text-sm font-bold text-emerald-800 bg-emerald-100 self-start px-3 py-1 rounded-full border border-emerald-300">
                        You save ৳{plan.savings}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        feature.included ? 'bg-green-100 text-green-700 font-bold' : 'bg-sds-bg text-slate-650'
                      }`}>
                        {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-semibold ${feature.included ? 'text-slate-600' : 'text-slate-700'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleAction(plan.name)}
                  disabled={isRedeeming || plan.isCurrent}
                  className={`w-full py-4.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    plan.isCurrent 
                      ? 'bg-sds-bg text-slate-700 border border-slate-900 cursor-default' 
                      : couponStatus?.discount === 100 && plan.isUpgrade && isCouponApplicableFor(plan.name)
                      ? 'bg-amber-600 hover:bg-amber-700 text-sds-text shadow-none'
                      : plan.premium
                      ? 'bg-[#315CFF] hover:bg-[#2547d0] text-white text-sds-text shadow-none'
                      : 'bg-[#315CFF] hover:bg-[#2547d0] text-white text-sds-text shadow-none'
                  }`}
                >
                  {isRedeeming && plan.isUpgrade ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : couponStatus?.discount === 100 && plan.isUpgrade && isCouponApplicableFor(plan.name) ? (
                    <>CLAIM FREE ACCESS ✨ <ArrowRight size={16} /></>
                  ) : (
                    <>{plan.buttonText} {!plan.isCurrent && <ArrowRight size={16} />}</>
                  )}
                </button>
                
                {plan.isUpgrade && !(couponStatus?.discount === 100 && isCouponApplicableFor(plan.name)) && user && (
                  <p className="text-center text-[9px] font-black text-slate-555 uppercase tracking-widest mt-4 leading-tight">
                    Upgrade via WhatsApp<br/>
                    <span className="opacity: 0y-70 text-[8px]">(Manual Activation)</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Visual Social Proof for Quartiles */}
        <div className="w-full 2xl:px-12 mx-auto mt-12 mb-8 bg-white border border-sds-border rounded-[12px] p-6 text-center">
          <p className="text-sm font-bold text-slate-700 flex items-center justify-center gap-3 flex-wrap">
            <Sparkles className="text-amber-550" size={18} />
            <span><span className="text-emerald-450 font-black">Q1</span> = Top 25% of journals in the field.</span>
            <span><span className="text-indigo-400 font-black">Q2</span> = Top 50%.</span>
            <span className="text-sds-text">Shop smarter, cite better.</span>
          </p>
        </div>


        {/* Student Outreach Program Section */}
        <div className="mt-12 w-full 2xl:px-12 mx-auto">
          <div className="bg-white border-2 border-sds-border rounded-[2.5rem] p-10 relative overflow-hidden shadow-sm">
            <div className="absolute -right-10 -top-10 text-slate-950/20">
              <GraduationCap size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-4">
                  <GraduationCap size={14} /> Student Outreach Program
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-sds-text tracking-tight mb-2">
                  Get 1 Month of <span className="text-amber-500 font-black">PRO Tier</span> for FREE
                </h3>
                <p className="text-slate-700 font-medium text-sm max-w-md">
                  Experience the full power of ScholarHub AI. Unlock 100 daily AI uses, 100 results per search, and the AI Outreach Architect for 30 days. No credit card required.
                </p>
              </div>
              <button
                onClick={() => setStudentModalOpen(true)}
                className="shrink-0 w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-sds-text rounded-[12px] text-xs font-black uppercase tracking-widest transition-all"
              >
                ACTIVATE PRO MONTH
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Student Verification Modal */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
            onClick={() => setStudentModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-sds-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setStudentModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              
              <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-5">
                <GraduationCap size={28} />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-sds-text mb-2">Verify Student Status 🎓</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-6">
                Follow these exact steps to claim your free 1-month PRO plan. Admin approval takes up to 24 hours.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</div>
                  <p className="text-xs font-semibold text-slate-700">Upload a clear picture of your Valid Student ID (Front and Back side).</p>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</div>
                  <p className="text-xs font-semibold text-slate-700">Provide your institutional (Student) email address.</p>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</div>
                  <p className="text-xs font-semibold text-slate-700">Send these details directly to the Founder via WhatsApp.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const msg = `Hi Pritom, I want to claim the 1-Month Free PRO Subscription. I will provide my Student ID and Email for verification. User Email: ${user?.email || 'unknown'}`
                  window.open(`https://wa.me/8801853343176?text=${encodeURIComponent(msg)}`, '_blank')
                  setStudentModalOpen(false)
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
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
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
            onClick={() => setConfirmModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-sds-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] text-sds-text my-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-5">
                <Tag size={28} />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-sds-text mb-2">Confirm Coupon Redemption</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-6">
                Are you sure you want to proceed? Once applied, this coupon will be permanently locked to your account and cannot be used again.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={confirmRedemption}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Proceed & Apply
                </button>
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
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
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-sds-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] text-center text-sds-text my-auto overscroll-contain"
            >
              <div className="w-20 h-20 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30">
                <Sparkles size={36} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black text-sds-text mb-3 tracking-tight">Congratulations! 🎉</h3>
              <p className="text-sm font-semibold text-slate-600 mb-8 leading-relaxed">
                Your account has been upgraded to <span className="text-amber-600 font-black">{upgradedTierText}</span> instantly. Welcome to ScholarHub AI.
              </p>

              <button
                onClick={() => {
                  sessionStorage.removeItem('active_coupon_status')
                  sessionStorage.removeItem('active_coupon_code')
                  navigate('/research')
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Workspace <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
            onClick={() => setShowExitWarning(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-sds-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] text-sds-text my-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-5">
                <AlertCircle size={28} />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-sds-text mb-2">Forfeit Discount?</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-6">
                You have an active one-time discount applied. If you leave this page, your coupon session will be destroyed and cannot be used again. Are you sure?
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Stay & Complete Upgrade
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('active_coupon_status')
                    sessionStorage.removeItem('active_coupon_code')
                    setShowExitWarning(false)
                    navigate(pendingPath)
                  }}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Lose Discount & Leave
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
