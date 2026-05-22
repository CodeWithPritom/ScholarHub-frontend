import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Shield, Sparkles, Loader2, ArrowRight, Tag, Zap, AlertCircle, GraduationCap } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../Footer'
import { BASE_URL } from '../utils/api'
import logo from '../assets/images/logo.png'

const Pricing = ({ user }) => {
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState(() => sessionStorage.getItem('active_coupon_code') || '')
  const [couponStatus, setCouponStatus] = useState(() => {
    try {
      const saved = sessionStorage.getItem('active_coupon_status')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  }) // { loading, error, success, discount, applicable_tier }
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [academicField, setAcademicField] = useState('Genetic Eng. & Biotech (GEB)')
  const [userTier, setUserTier] = useState('free')
  const [billingCycle, setBillingCycle] = useState('monthly')
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
      setUserTier('free')
      return
    }
    const fetchProfileAndSubscription = async () => {
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('academic_field')
          .eq('id', user.id)
          .maybeSingle()
        if (profData && profData.academic_field) {
          setAcademicField(profData.academic_field)
        }

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .maybeSingle()
        if (subData && subData.tier) {
          setUserTier(subData.tier.toLowerCase())
        } else {
          setUserTier('free')
        }
      } catch (err) {
        console.error("Error loading pricing profile data:", err)
      }
    }
    fetchProfileAndSubscription()
  }, [user])

  const getPortalDisplayName = (field) => {
    if (field === 'Engineering/CS') return 'Engineering/CS Portal'
    if (field === 'Social Sciences') return 'Social Sciences Portal'
    if (field === 'Law / Legal Studies') return 'Law & Legal Portal'
    if (field === 'Physics') return 'Physics Portal'
    if (field === 'Mathematics') return 'Mathematics Portal'
    if (field === 'Chemistry / Pharmacy') return 'Chemistry Portal'
    return 'GEB Portal' // Default
  }

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
    if (couponStatus?.discount === 100 && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === tierName.toLowerCase())) {
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
            duration: billingCycle === 'yearly' ? '1 year' : '1 month'
          })
        })
        
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.detail || 'Failed to auto-upgrade.')
        }

        setUserTier(tierName.toLowerCase())
        setUpgradedTierText(tierName.toUpperCase())
        setCelebrationModalOpen(true)
      } catch (err) {
        alert(err.message)
      } finally {
        setIsRedeeming(false)
      }
      return
    }

    // WhatsApp flow
    const email = user.email || 'unknown'
    const duration = billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY'
    // Find price safely
    let baseNum = 0
    let planPriceNum = 0
    const isCouponApplicable = couponStatus?.success && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === tierName.toLowerCase())

    if (tierName.toLowerCase() === 'starter') {
      baseNum = billingCycle === 'yearly' ? 2500 : 250
      planPriceNum = isCouponApplicable ? Math.floor(baseNum * (1 - couponStatus.discount / 100)) : baseNum
    } else if (tierName.toLowerCase() === 'pro') {
      baseNum = billingCycle === 'yearly' ? 10000 : 1000
      planPriceNum = isCouponApplicable ? Math.floor(baseNum * (1 - couponStatus.discount / 100)) : baseNum
    }
    
    let text = `Hi Pritom, I want to upgrade to [${tierName.toUpperCase()}] [${duration}].\n`
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

  const activePortalName = getPortalDisplayName(academicField)

  const plans = [
    {
      name: 'FREE',
      price: '৳0',
      description: 'Perfect for starting your specific niche research.',
      features: [
        { name: user ? `Access to ${activePortalName}` : "Access to 1 Specialized Portal", included: true },
        { name: '3 AI Summaries / day', included: true },
        { name: '20 Saved Papers Limit', included: true },
        { name: '5s Search Delay', included: true },
        { name: 'General Contact via Email', included: true },
        { name: 'Direct Support Access', included: false },
        { name: 'Universal Portal Access', included: false }
      ],
      color: 'slate',
      buttonText: user ? (userTier === 'free' ? 'Current Plan' : 'Free Tier') : 'Register & Start Researching',
      isCurrent: userTier === 'free',
      isUpgrade: false
    },
    {
      name: 'STARTER',
      price: billingCycle === 'yearly' ? '৳2500' : '৳250',
      basePriceNum: billingCycle === 'yearly' ? 2500 : 250,
      period: billingCycle === 'yearly' ? '/yr' : '/mo',
      originalPrice: billingCycle === 'yearly' ? '৳5000' : '৳500',
      savings: billingCycle === 'yearly' ? '2500' : '250',
      description: 'Higher limits for the same assigned portal.',
      features: [
        { name: 'Enhanced Power for Your Portal', included: true },
        { name: '30 AI Summaries / day', included: true },
        { name: 'Unlimited Saved Papers', included: true },
        { name: '1s Search Speed', included: true },
        { name: 'AI Citation Generator', included: true },
        { name: 'Priority Private Discord Support', included: true }
      ],
      color: 'blue',
      buttonText: user ? (userTier === 'starter' ? 'Current Plan' : 'Upgrade to Starter') : 'Login to Upgrade',
      isCurrent: userTier === 'starter',
      isUpgrade: true,
      popular: true
    },
    {
      name: 'PRO',
      price: billingCycle === 'yearly' ? '৳10000' : '৳1000',
      basePriceNum: billingCycle === 'yearly' ? 10000 : 1000,
      originalPrice: billingCycle === 'yearly' ? '৳20000' : '৳2000',
      savings: billingCycle === 'yearly' ? '10000' : '1000',
      period: billingCycle === 'yearly' ? '/yr' : '/mo',
      description: 'For power researchers demanding unlimited AI potential.',
      features: [
        { name: 'Universal Access: ALL Portals Unlocked', included: true },
        { name: 'Access Bio, Eng, & Universal simultaneously', included: true },
        { name: '300+ AI Summaries / day', included: true },
        { name: 'Literature Review Gen', included: true },
        { name: 'Research Gap Detection', included: true },
        { name: 'Priority Private Discord Support', included: true }
      ],
      color: 'amber',
      buttonText: user ? (userTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro') : 'Login to Upgrade',
      isCurrent: userTier === 'pro',
      isUpgrade: true,
      premium: true
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* Navbar Minimal */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
            <img src={logo} alt="ScholarHub AI" className="h-10 w-auto object-contain" />
            <span className="text-xl font-black tracking-tighter text-slate-900">ScholarHub<span className="text-blue-600">AI</span></span>
          </div>
          <button 
            onClick={() => handleNavigate(user ? '/research' : '/auth')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            {user ? 'Back to Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* Banner if Guest */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-5 bg-blue-50 border border-blue-200 rounded-[2rem] flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-blue-600" size={24} />
              <p className="text-sm font-bold text-blue-900">You must create a free account to activate and manage subscription plans.</p>
            </div>
            <button 
              onClick={() => handleNavigate('/auth')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-200"
            >
              Sign Up Now
            </button>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
            ScholarHub AI Pricing: <br/><span className="text-blue-600">Supercharge your Research</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Unlock multi-disciplinary AI models, bypass rate limits, and discover breakthroughs faster than ever before.
          </p>

          {/* Coupon System */}
          {user && (
            <div className="max-w-md mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <div className="pl-4 text-slate-400">
                <Tag size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Have a coupon code?" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium uppercase"
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponStatus?.loading}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
              >
                {couponStatus?.loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}
          
          <AnimatePresence>
            {couponStatus?.error && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-3">
                {couponStatus.error}
              </motion.p>
            )}
            {couponStatus?.success && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-green-500 text-sm font-black mt-3 flex items-center justify-center gap-1">
                <Check size={16} /> {couponStatus.success} ({couponStatus.discount}% OFF)
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16 relative z-20">
          <div className="bg-slate-200/50 p-1.5 rounded-full flex items-center relative gap-1 border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative px-8 py-3 text-xs font-black uppercase tracking-widest rounded-full transition-colors`}
            >
              {billingCycle === 'monthly' && (
                <motion.div
                  layoutId="billing-indicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className={`relative z-10 ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
            </button>
            
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative px-8 py-3 text-xs font-black uppercase tracking-widest rounded-full transition-colors flex items-center gap-2`}
            >
              {billingCycle === 'yearly' && (
                <motion.div
                  layoutId="billing-indicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider border border-emerald-200 shadow-sm">
                  Save 15%+
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative bg-white rounded-[2.5rem] p-8 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                plan.premium 
                  ? 'border-2 border-amber-500 shadow-2xl shadow-amber-100 scale-105 z-10 bg-gradient-to-b from-amber-50/[0.2] to-transparent' 
                  : plan.popular 
                  ? 'border-2 border-blue-500 shadow-2xl shadow-blue-100 scale-105 z-10 bg-gradient-to-b from-blue-50/[0.2] to-transparent'
                  : 'border-slate-200 shadow-lg shadow-slate-100'
              }`}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-lg shadow-amber-200 flex items-center gap-1.5">
                  <Zap size={12} /> UNIVERSAL ACCESS
                </div>
              )}
              {plan.popular && !plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-lg shadow-blue-200 flex items-center gap-1.5">
                  <Sparkles size={12} /> MOST POPULAR
                </div>
              )}
              
              <div>
                <div className="mb-8">
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${
                    plan.premium ? 'text-amber-600' : plan.color === 'blue' ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-baseline gap-1">
                      {couponStatus?.success && plan.isUpgrade && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === plan.name.toLowerCase()) ? (
                        <>
                          <span className="text-3xl font-bold text-slate-400 line-through mr-2">{plan.price}</span>
                          <span className="text-5xl font-black text-slate-900 tracking-tighter">
                            {couponStatus.discount === 100 ? '৳0' : `৳${Math.floor(plan.basePriceNum * (1 - couponStatus.discount / 100))}`}
                          </span>
                        </>
                      ) : (
                        <>
                          {plan.originalPrice && (
                            <span className="text-3xl font-bold text-slate-400 line-through mr-2">{plan.originalPrice}</span>
                          )}
                          <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                        </>
                      )}
                      {plan.period && <span className="text-slate-500 font-bold">{plan.period}</span>}
                    </div>
                    {plan.savings && !(couponStatus?.success && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === plan.name.toLowerCase())) && (
                      <div className="mt-2 text-sm font-bold text-emerald-600 bg-emerald-50 self-start px-3 py-1 rounded-full border border-emerald-100">
                        You save ৳{plan.savings}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        feature.included ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300'
                      }`}>
                        {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-semibold ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
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
                  className={`w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    plan.isCurrent 
                      ? 'bg-slate-100 text-slate-400 cursor-default' 
                      : couponStatus?.discount === 100 && plan.isUpgrade && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === plan.name.toLowerCase())
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200'
                      : plan.premium
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                  }`}
                >
                  {isRedeeming && plan.isUpgrade ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : couponStatus?.discount === 100 && plan.isUpgrade && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === plan.name.toLowerCase()) ? (
                    <>CLAIM FREE ACCESS ✨ <ArrowRight size={16} /></>
                  ) : (
                    <>{plan.buttonText} {!plan.isCurrent && <ArrowRight size={16} />}</>
                  )}
                </button>
                
                {plan.isUpgrade && !(couponStatus?.discount === 100 && (couponStatus?.applicable_tier === 'both' || couponStatus?.applicable_tier === plan.name.toLowerCase())) && user && (
                  <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 leading-tight">
                    Upgrade via WhatsApp<br/>
                    <span className="opacity-70 text-[8px]">(Manual Activation for 1 or 12 months)</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Student Outreach Program Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-100 rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl shadow-indigo-100/50">
            <div className="absolute -right-10 -top-10 text-indigo-100 opacity-50">
              <GraduationCap size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-4">
                  <GraduationCap size={14} /> Student Outreach Program
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                  Get 1 Year of <span className="text-indigo-600">STARTER Tier</span> for FREE
                </h3>
                <p className="text-slate-500 font-medium text-sm max-w-md">
                  We believe cost shouldn't be a barrier to research. Verify your academic status and unlock premium capabilities at zero cost. <span className="font-bold text-slate-700">One-time offer per student.</span>
                </p>
              </div>
              <button
                onClick={() => setStudentModalOpen(true)}
                className="shrink-0 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1"
              >
                Claim Free Year
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Student Verification Modal */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setStudentModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setStudentModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Verify Student Status 🎓</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">
                Follow these exact steps to claim your free 1-year Starter plan. Admin approval takes up to 24 hours.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</div>
                  <p className="text-sm font-semibold text-slate-700">Upload a clear picture of your Valid Student ID (Front and Back side).</p>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</div>
                  <p className="text-sm font-semibold text-slate-700">Provide your institutional (Student) email address.</p>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</div>
                  <p className="text-sm font-semibold text-slate-700">Send these details directly to the Founder via WhatsApp.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const msg = `Hi Pritom, I want to claim the 1-Year Free Student Starter Pack. I will provide my Student ID and Email for verification. User Email: ${user?.email || 'unknown'}`
                  window.open(`https://wa.me/8801853343176?text=${encodeURIComponent(msg)}`, '_blank')
                  setStudentModalOpen(false)
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-200"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setConfirmModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Tag size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm Coupon Redemption</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">
                Are you sure you want to proceed? Once applied, this coupon will be permanently locked to your account and cannot be used again.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmRedemption}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-200"
                >
                  Proceed & Apply
                </button>
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-200">
                  <Sparkles size={40} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Congratulations! 🎉</h3>
                <p className="text-base font-semibold text-slate-600 mb-10 leading-relaxed">
                  Your account has been upgraded to <span className="text-amber-600 font-black">{upgradedTierText}</span> instantly. Welcome to the elite research hub.
                </p>

                <button
                  onClick={() => {
                    sessionStorage.removeItem('active_coupon_status')
                    sessionStorage.removeItem('active_coupon_code')
                    navigate('/research')
                  }}
                  className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-300 flex items-center justify-center gap-2"
                >
                  Go to Workspace <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowExitWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Forfeit Discount?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">
                You have an active one-time discount applied. If you leave this page, your coupon session will be destroyed and cannot be used again. Are you sure?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-300"
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
                  className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
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
