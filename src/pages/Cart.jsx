import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Edit3, Trash2, ArrowLeft, ArrowRight, ShieldCheck, 
  Check, Loader2, Sparkles, AlertCircle, RefreshCw, Lock, 
  FileText, User, Mail, Globe, CheckCircle2, ChevronRight, ShoppingBag
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { BASE_URL } from '../utils/api'
import SEOHead from '../components/SEOHead'
import Footer from '../Footer'

const DURATION_CYCLES = {
  '1_month': { label: '1 Month', cycleText: '1mo', multiplier: 1, name: 'Monthly' },
  '3_months': { label: '3 Months', cycleText: '3mo', multiplier: 3, name: 'Quarterly', discountBadge: 'Save 16%' },
  '6_months': { label: '6 Months', cycleText: '6mo', multiplier: 6, name: 'Semi-Annually', discountBadge: 'Save 25%' },
  '1_year': { label: '1 Year', cycleText: '1yr', multiplier: 12, name: 'Annually', discountBadge: 'Save 37%' }
}

const TIER_DATA = {
  starter: {
    id: 'starter',
    name: 'Starter Scholar Tier',
    subtitle: 'High-Speed Synthesis, 1,500 Compute Zaps & Full 2D/3D Mindmap Engine',
    monthlyPrice: 199,
    prices: {
      '1_month': 199,
      '3_months': 499,
      '6_months': 899,
      '1_year': 1499
    }
  },
  pro: {
    id: 'pro',
    name: 'PRO Scholar Tier',
    subtitle: 'PhD & Heavy Compute Suite, 3,000 Compute Zaps & Deep Reasoning Engine',
    monthlyPrice: 499,
    prices: {
      '1_month': 499,
      '3_months': 1299,
      '6_months': 2399,
      '1_year': 3999
    }
  }
}

const Cart = ({ user, profile }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Initial Plan & Duration
  const initialPlan = (searchParams.get('plan') || 'pro').toLowerCase()
  const initialDur = (searchParams.get('duration') || '1_month').toLowerCase()

  const [selectedTier, setSelectedTier] = useState(initialPlan === 'starter' ? 'starter' : 'pro')
  const [selectedDuration, setSelectedDuration] = useState(
    ['1_month', '3_months', '6_months', '1_year'].includes(initialDur) ? initialDur : '1_month'
  )

  // Modals & Controls
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false)
  const [upgradedTierText, setUpgradedTierText] = useState('')

  // Promo Code State
  const [promoInput, setPromoInput] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [activeCoupon, setActiveCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem('active_coupon_status')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [couponCode, setCouponCode] = useState(() => sessionStorage.getItem('active_coupon_code') || '')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentPlan = TIER_DATA[selectedTier] || TIER_DATA.pro
  const currentCycle = DURATION_CYCLES[selectedDuration] || DURATION_CYCLES['1_month']
  const basePrice = currentPlan.prices[selectedDuration] || currentPlan.monthlyPrice

  // Strict check for coupon applicability
  const isCouponApplicable = () => {
    if (!activeCoupon?.success) return false
    const applicableStr = (activeCoupon.applicable_tier || 'both').toLowerCase()
    const rawPkgs = activeCoupon.applicable_packages || [applicableStr]
    const pkgs = Array.isArray(rawPkgs) ? rawPkgs.map(p => String(p).toLowerCase().trim()) : [applicableStr]
    const currentPkg = `${selectedTier}_${selectedDuration}`

    // 1. If explicit package names exist (e.g. 'starter_6_months', 'pro_1_month')
    const hasSpecificPackages = pkgs.some(p => p.includes('_') && p !== 'both' && p !== 'all')

    if (hasSpecificPackages) {
      return pkgs.includes(currentPkg)
    }

    // 2. Generic tier rules ('both', 'all', 'starter', 'pro')
    if (pkgs.includes('both') || pkgs.includes('all') || applicableStr === 'both' || applicableStr === 'all') return true
    if (pkgs.includes(selectedTier) || applicableStr === selectedTier) return true
    return false
  }

  // Suggest package if coupon is restricted
  const getApplicablePackageSuggestion = () => {
    if (!activeCoupon?.success) return null
    const pkgs = activeCoupon.applicable_packages || []
    if (pkgs.includes('both') || pkgs.includes('all') || pkgs.length === 0) return null

    // Find the first matching package rule
    const first = pkgs[0].toLowerCase()
    if (first.startsWith('pro_')) {
      const dur = first.replace('pro_', '')
      return { 
        tier: 'pro', 
        duration: dur, 
        label: `PRO Scholar Tier (${dur.replace(/_/g, ' ')})` 
      }
    } else if (first.startsWith('starter_')) {
      const dur = first.replace('starter_', '')
      return { 
        tier: 'starter', 
        duration: dur, 
        label: `Starter Scholar Tier (${dur.replace(/_/g, ' ')})` 
      }
    } else if (first === 'pro') {
      return { tier: 'pro', duration: selectedDuration, label: 'PRO Scholar Tier' }
    } else if (first === 'starter') {
      return { tier: 'starter', duration: selectedDuration, label: 'Starter Scholar Tier' }
    }
    return null
  }

  const isApplicable = isCouponApplicable()
  const discountPercent = isApplicable ? (activeCoupon?.discount || 0) : 0
  const discountAmount = isApplicable ? Math.round(basePrice * (discountPercent / 100)) : 0
  const finalPayable = Math.max(0, basePrice - discountAmount)
  const suggestedPkg = getApplicablePackageSuggestion()

  // Validate Promo Code
  const handleValidatePromo = async (e) => {
    if (e) e.preventDefault()
    const cleanCode = promoInput.trim().toUpperCase()
    if (!cleanCode) {
      toast.error('Please enter a promotion or coupon code.')
      return
    }

    if (!user) {
      toast.error('Please sign in to validate your promotion.')
      navigate(`/auth?redirect=/cart?plan=${selectedTier}&duration=${selectedDuration}`)
      return
    }

    setValidatingPromo(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${BASE_URL}/api/coupons/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ code: cleanCode })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Invalid promotion code or expired coupon.')
      }

      const data = await res.json()
      const newStatus = {
        success: data.message || `Promo code ${cleanCode} validated successfully!`,
        discount: data.discount_percent || 100,
        applicable_tier: data.applicable_tier || 'both',
        applicable_packages: data.applicable_packages || ['both']
      }

      setActiveCoupon(newStatus)
      setCouponCode(cleanCode)
      setPromoInput('')
      sessionStorage.setItem('active_coupon_status', JSON.stringify(newStatus))
      sessionStorage.setItem('active_coupon_code', cleanCode)

      if (data.already_redeemed) {
        toast.info(data.message)
      } else {
        toast.success(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    sessionStorage.removeItem('active_coupon_status')
    sessionStorage.removeItem('active_coupon_code')
    setActiveCoupon(null)
    setCouponCode('')
    toast.info('Promotion code removed.')
  }

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Handle Place Order — opens confirmation modal
  const handlePlaceOrder = () => {
    if (!agreeTerms) {
      toast.error('Please accept the Terms & Conditions and Privacy Policy to proceed.')
      return
    }

    if (!user) {
      navigate(`/auth?redirect=/cart?plan=${selectedTier}&duration=${selectedDuration}`)
      return
    }

    setIsConfirmModalOpen(true)
  }

  // Execute Confirmed Order
  const executeConfirmedOrder = async () => {
    setIsConfirmModalOpen(false)

    // 100% Free Instant Automated Access
    if (discountPercent === 100 && isApplicable) {
      setIsPlacingOrder(true)
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
            target_tier: selectedTier,
            duration: selectedDuration.replace('_', ' ')
          })
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.detail || 'Failed to process order activation.')
        }

        const resData = await response.json()
        setUpgradedTierText(selectedTier.toUpperCase())

        // Clear active coupon
        sessionStorage.removeItem('active_coupon_status')
        sessionStorage.removeItem('active_coupon_code')
        setActiveCoupon(null)
        setCouponCode('')

        // Dispatch instant event for sync
        window.dispatchEvent(new Event('profileUpdated'))

        toast.success(resData.message || `Activated ${selectedTier.toUpperCase()} successfully!`)
        setIsCelebrationOpen(true)
      } catch (err) {
        toast.error(err.message)
      } finally {
        setIsPlacingOrder(false)
      }
      return
    }

    // Paid / WhatsApp Checkout
    if (isApplicable && discountPercent > 0 && couponCode) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          await fetch(`${BASE_URL}/api/coupons/confirm-order-use`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ code: couponCode })
          })
        }
      } catch (e) {
        console.warn('Coupon usage record skipped:', e)
      }
    }

    const email = user?.email || 'unknown'
    const name = user?.user_metadata?.full_name || profile?.full_name || 'ScholarHub Researcher'
    const durationLabel = selectedDuration === '1_month' ? '1 MONTH' : selectedDuration === '3_months' ? '3 MONTHS' : selectedDuration === '6_months' ? '6 MONTHS' : '1 YEAR'
    
    let text = `Hi Pritom, I want to place an order on ScholarHub AI.\n\n`
    text += `*Order Review:*\n`
    text += `• Plan: ${selectedTier.toUpperCase()} SCHOLAR TIER\n`
    text += `• Cycle: ${durationLabel}\n`
    text += `• Base Price: BDT ${basePrice}.00\n`
    
    if (isApplicable && discountPercent > 0) {
      text += `• Validated Promo: [${couponCode.toUpperCase()}] (${discountPercent}% OFF)\n`
      text += `• *Total Due Today:* BDT ${finalPayable}.00\n`
    } else {
      text += `• *Total Due Today:* BDT ${basePrice}.00\n`
    }
    
    text += `\n*Billing Details:*\n`
    text += `• Name: ${name}\n`
    text += `• Email: ${email}\n`
    text += `• Country: Bangladesh`

    const whatsappUrl = `https://wa.me/8801853343176?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const userName = user?.user_metadata?.full_name || profile?.full_name || 'ScholarHub Researcher'
  const userEmail = user?.email || 'researcher@scholarhub-ai.com'
  const academicField = user?.user_metadata?.academic_field || profile?.academic_field || 'Academic Researcher'

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-500/20">
      <SEOHead
        title="Review & Checkout | ScholarHub AI"
        description="Review your academic research plan subscription, apply promotions, and activate instant compute quotas."
        canonicalPath="/cart"
      />

      {/* Top Navbar Minimal Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
              S
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">ScholarHub AI</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <Link to="/pricing" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ShoppingBag size={14} /> View Plans
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">
                {userName.charAt(0)}
              </div>
              <span className="font-semibold text-slate-800 hidden sm:inline">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Review & Checkout Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Review & Checkout
          </h1>
        </div>

        {/* 2-Column WHMCS / Hosting Style Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── LEFT COLUMN: Product, Promo, Billing (8 cols) ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Product / Options Table Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              
              {/* Table Header */}
              <div className="bg-slate-50/70 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Product/Options</span>
                <span>Price/Cycle</span>
              </div>

              {/* Product Item Row */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {currentPlan.name}
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {currentCycle.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {currentPlan.subtitle}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-400 uppercase">BDT</div>
                    <div className="text-lg font-black text-slate-900">
                      {basePrice}.00/{currentCycle.cycleText}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Renewal BDT {basePrice}.00/{currentCycle.cycleText}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Edit Plan or Billing Cycle"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTier(selectedTier === 'pro' ? 'starter' : 'pro')
                        toast.info(`Switched to ${selectedTier === 'pro' ? 'Starter' : 'PRO'} plan`)
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                      title="Switch Tier"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Footer Actions */}
              <div className="px-6 py-3.5 bg-slate-50/50 flex items-center justify-between text-xs">
                <Link
                  to="/pricing"
                  className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={14} /> Continue Shopping
                </Link>

                <button
                  onClick={() => {
                    handleRemovePromo()
                    navigate('/pricing')
                  }}
                  className="font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Empty Cart <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* 2. Promotion Card (Purple / Indigo Modern Banner) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Promotion</h3>
              <div className="bg-[#6366f1] p-4 sm:p-5 rounded-2xl shadow-sm">
                <form onSubmit={handleValidatePromo} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder={couponCode ? `Active Promo Code: ${couponCode}` : "Enter promo code if you have one"}
                      className="w-full bg-white text-slate-900 pl-11 pr-4 py-3 rounded-xl text-xs font-bold placeholder:text-slate-400 placeholder:font-medium outline-none focus:ring-2 focus:ring-white/50 uppercase"
                    />
                    {couponCode && (
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-rose-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={validatingPromo || !promoInput.trim()}
                    className="px-6 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer border border-indigo-400/40"
                  >
                    {validatingPromo ? <Loader2 size={14} className="animate-spin" /> : "Validate Code"}
                  </button>
                </form>

                {/* Validated Details inside Promotion Box */}
                {activeCoupon?.success && (
                  <div className="mt-3 pt-3 border-t border-indigo-400/40 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles size={14} className="text-amber-300" />
                      Promo Code <strong>[{couponCode}]</strong> Validated
                    </div>
                    <div className="font-extrabold bg-white text-indigo-700 px-2.5 py-0.5 rounded-md text-[11px]">
                      {activeCoupon.discount}% OFF
                    </div>
                  </div>
                )}
              </div>

              {/* Package Mismatch Alert & Auto-Switch Banner */}
              {activeCoupon?.success && !isApplicable && suggestedPkg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">
                        Promo code [{couponCode}] is only valid for {suggestedPkg.label}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium">
                        Click switch to apply your guaranteed {activeCoupon.discount}% discount immediately.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTier(suggestedPkg.tier)
                      setSelectedDuration(suggestedPkg.duration)
                      toast.success(`Switched cart to ${suggestedPkg.label}!`)
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw size={12} /> Switch to {suggestedPkg.label}
                  </button>
                </motion.div>
              )}
            </div>

            {/* 3. Billing Details Card (Radio Profile Card matching Image) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Billing Details</h3>
              <div className="bg-white border-2 border-indigo-600 rounded-2xl p-6 shadow-xs relative">
                
                {/* Active Account Radio Option */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center mt-0.5 shrink-0 bg-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-slate-900">{userName}</div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        BDT
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium leading-relaxed pt-1 space-y-0.5">
                      <div>{userEmail}</div>
                      <div>Academic Focus: {academicField}</div>
                      <div>Dhaka, Bangladesh</div>
                      <div className="text-slate-400 text-[11px]">+880 (Institutional Verified)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Researcher & Device Concurrency Details */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Researcher & Device Allocation</h3>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3 text-xs text-slate-600">
                <p className="font-medium leading-relaxed">
                  Your academic subscription includes <strong>2 concurrent device sync slots</strong> with dedicated zero-queue AI gateway routing. You may access your workspace simultaneously on your laptop and mobile device without losing active session state.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-slate-700 font-bold">
                  <span>Default Provisioning:</span>
                  <span className="text-indigo-600">Active Researcher Profile ({userEmail})</span>
                </div>
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: Order Summary Card (Purple Card matching Image) ─── */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            
            {/* Purple Order Summary Card */}
            <div className="bg-[#6366f1] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
              
              <h3 className="text-lg font-black tracking-tight mb-6">
                Order Summary
              </h3>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs pb-3 border-b border-indigo-400/40 text-indigo-100">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-white">BDT {basePrice}.00</span>
              </div>

              {/* Totals Cycle */}
              <div className="py-4 space-y-2 border-b border-indigo-400/40 text-xs text-indigo-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Totals</span>
                  <span></span>
                </div>
                <div className="flex justify-between items-center font-bold text-white">
                  <span>{currentCycle.name}</span>
                  <span>BDT {basePrice}.00</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-amber-300 font-extrabold text-xs pt-1">
                    <span>Discount ({discountPercent}% OFF)</span>
                    <span>- BDT {discountAmount}.00</span>
                  </div>
                )}
              </div>

              {/* Total Due Today */}
              <div className="py-5 space-y-1">
                <div className="text-xs font-semibold text-indigo-200">
                  Total Due Today
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  BDT {finalPayable}.00
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full py-4 bg-white hover:bg-slate-50 text-indigo-700 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-75"
              >
                {isPlacingOrder ? (
                  <Loader2 size={18} className="animate-spin text-indigo-700" />
                ) : (
                  <>Place Order <ArrowRight size={16} /></>
                )}
              </button>
            </div>

            {/* Terms & Agreement Checkbox */}
            <div className="p-2 flex items-start gap-2.5 text-[11px] text-slate-500 leading-snug">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer font-medium">
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">Terms & Conditions</a>,{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">Privacy Policy</a>, and{' '}
                <a href="/refund" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">Refund Policy</a>.
              </label>
            </div>

            {/* Trust Badges */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-xs space-y-2 text-slate-600 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-[11px]">
                <ShieldCheck size={16} className="text-emerald-600" />
                Guaranteed Academic Infrastructure
              </div>
              <ul className="space-y-1 text-[11px] text-slate-500 font-medium">
                <li>✓ Instant automated compute allocation</li>
                <li>✓ 256-Bit SSL End-to-End Encryption</li>
                <li>✓ 24/7 Priority VIP Researcher Support</li>
              </ul>
            </div>

          </div>

        </div>
      </main>

      {/* ─── Edit Plan / Cycle Modal ─── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-slate-900 mb-1">Customize Subscription Plan</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Select your preferred research tier and billing cycle.</p>

              {/* Tier options */}
              <div className="space-y-3 mb-6">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">1. Research Tier</label>
                <div className="grid grid-cols-2 gap-3">
                  {['starter', 'pro'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTier(t)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedTier === t
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-black ring-2 ring-indigo-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-black uppercase">{t} Scholar</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        BDT {TIER_DATA[t].prices[selectedDuration]}.00/{currentCycle.cycleText}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration options */}
              <div className="space-y-3 mb-6">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">2. Billing Cycle</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.entries(DURATION_CYCLES).map(([durKey, dur]) => (
                    <button
                      key={durKey}
                      type="button"
                      onClick={() => setSelectedDuration(durKey)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs font-bold cursor-pointer ${
                        selectedDuration === durKey
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{dur.label}</span>
                        {dur.discountBadge && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black uppercase">
                            {dur.discountBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        BDT {currentPlan.prices[durKey]}.00
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Apply & Update Order
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Order Confirmation Modal ─── */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div 
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center"
            onClick={() => setIsConfirmModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-auto text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <ShoppingBag size={24} />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                Confirm Your Order & Activation 🚀
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Are you sure you want to proceed and activate this academic subscription?
              </p>

              {/* Order Summary Specs */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 mb-6 text-xs font-semibold">
                <div className="flex justify-between items-center text-slate-800">
                  <span className="text-slate-500 font-medium">Selected Tier:</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedTier} Scholar</span>
                </div>
                <div className="flex justify-between items-center text-slate-800">
                  <span className="text-slate-500 font-medium">Billing Cycle:</span>
                  <span className="font-bold text-slate-900">{currentCycle.name} ({currentCycle.label})</span>
                </div>
                {isApplicable && discountPercent > 0 ? (
                  <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-medium">Applied Promo [{couponCode}]:</span>
                    <span className="font-black">{discountPercent}% OFF (- BDT {discountAmount}.00)</span>
                  </div>
                ) : activeCoupon?.success && !isApplicable ? (
                  <div className="flex items-start gap-2 text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] font-medium leading-snug">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Notice: Promo code <strong>[{couponCode}]</strong> is for {suggestedPkg?.label || 'a different package'} and was <strong>NOT applied</strong>.
                    </span>
                  </div>
                ) : null}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Total Due Today:</span>
                  <span className={finalPayable === 0 ? "text-emerald-600" : "text-indigo-600"}>
                    BDT {finalPayable}.00 {finalPayable === 0 && "(FREE)"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={executeConfirmedOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isPlacingOrder ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>Proceed & Confirm Order <ArrowRight size={14} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Modify Selection / Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Auto-Upgrade Celebration Modal ─── */}
      <AnimatePresence>
        {isCelebrationOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex min-h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl text-center my-auto"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Sparkles size={30} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed! 🎉</h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-6">
                Your account is now activated with <span className="text-indigo-600 font-black">{upgradedTierText} SCHOLAR TIER</span>.
              </p>

              <button
                onClick={() => navigate('/research')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                Go to Workspace <ArrowRight size={15} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer user={user} onAuthRequired={() => navigate('/auth')} />
    </div>
  )
}

export default Cart
