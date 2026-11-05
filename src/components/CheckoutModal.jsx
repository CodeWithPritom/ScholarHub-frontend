import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, Globe, ShieldCheck, Check, Copy, ExternalLink, 
  MessageSquare, Sparkles, Lock, ArrowRight, X, Loader2, 
  Phone, Mail, Zap, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { openPaddleCheckout, USD_PRICES } from '../utils/paddle'
import { BASE_URL } from '../utils/api'
import { supabase } from '../supabaseClient'

export default function CheckoutModal({
  isOpen,
  onClose,
  plan = 'pro',
  duration = '1_month',
  basePriceBdt = 499,
  finalPriceBdt = 499,
  discountPercent = 0,
  couponCode = '',
  user = null,
  profile = null,
  onSuccess = () => {}
}) {
  const [selectedMethod, setSelectedMethod] = useState('paddle') // 'paddle' | 'bkash'
  const [isProcessingPaddle, setIsProcessingPaddle] = useState(false)
  const [copiedNumber, setCopiedNumber] = useState(false)

  if (!isOpen) return null

  const packageKey = `${plan.toLowerCase()}_${duration.toLowerCase()}`
  const priceUsd = USD_PRICES[packageKey] || 4.99
  const discountedUsd = discountPercent > 0 
    ? Math.max(0.5, +(priceUsd * (1 - discountPercent / 100)).toFixed(2)) 
    : priceUsd

  const bkashNumber = '01853343176'
  const supportEmail = 'arupbhowmikpritom@gmail.com'

  const durationLabel = duration === '1_month' 
    ? '1 Month' 
    : duration === '3_months' 
    ? '3 Months' 
    : duration === '6_months' 
    ? '6 Months' 
    : '1 Year'

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(bkashNumber)
    setCopiedNumber(true)
    toast.success(`Copied ${bkashNumber} to clipboard!`)
    setTimeout(() => setCopiedNumber(false), 2500)
  }

  // 1. Paddle Checkout Action
  const handleLaunchPaddle = async () => {
    setIsProcessingPaddle(true)
    try {
      await openPaddleCheckout({
        tier: plan,
        duration: duration,
        couponCode: couponCode,
        discountPercent: discountPercent,
        user: user,
        onSuccess: async (eventData) => {
          toast.success('Paddle payment received! Confirming activation...')
          const txId = eventData.transactionId

          // Call backend verification
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
              const res = await fetch(`${BASE_URL}/api/payment/verify-paddle-checkout`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  transaction_id: txId,
                  target_tier: plan,
                  duration: duration
                })
              })

              if (res.ok) {
                toast.success(`Activated ${plan.toUpperCase()} Scholar Tier successfully!`)
                window.dispatchEvent(new Event('profileUpdated'))
                if (onSuccess) onSuccess()
                onClose()
                return
              }
            }
          } catch (verErr) {
            console.warn('Backend verification call failed:', verErr)
          }

          // Fallback UI success if event succeeded
          window.dispatchEvent(new Event('profileUpdated'))
          if (onSuccess) onSuccess()
          onClose()
        },
        onClose: () => {
          setIsProcessingPaddle(false)
        },
        onError: (err) => {
          setIsProcessingPaddle(false)
          toast.error(err.message || 'Paddle checkout could not be opened.')
        }
      })
    } catch (err) {
      setIsProcessingPaddle(false)
      toast.error(err.message || 'Paddle initialization error.')
    }
  }

  // 2. bKash / Local WhatsApp Action
  const handleLaunchBkashWhatsApp = () => {
    const email = user?.email || 'unregistered'
    const name = user?.user_metadata?.full_name || profile?.full_name || 'ScholarHub Researcher'

    let text = `Hi Pritom, I want to complete my subscription payment on ScholarHub AI via bKash / Local Banking.\n\n`
    text += `*Order Review:*\n`
    text += `• Plan: ${plan.toUpperCase()} SCHOLAR TIER\n`
    text += `• Cycle: ${durationLabel.toUpperCase()}\n`
    text += `• Base Price: BDT ${basePriceBdt}.00\n`
    
    if (discountPercent > 0 && couponCode) {
      text += `• Applied Promo: [${couponCode.toUpperCase()}] (${discountPercent}% OFF)\n`
      text += `• *Total Due Today:* BDT ${finalPriceBdt}.00\n`
    } else {
      text += `• *Total Due Today:* BDT ${basePriceBdt}.00\n`
    }
    
    text += `\n*Billing Details:*\n`
    text += `• Name: ${name}\n`
    text += `• Email: ${email}\n`
    text += `• Country: Bangladesh\n`
    text += `• Payment Method: bKash / Nagad / Rocket\n\n`
    text += `I am sending the payment screenshot / transaction ID here for instant activation.`

    const whatsappUrl = `https://wa.me/8801853343176?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        >
          {/* Top Banner / Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Select Payment Gateway</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Upgrade to {plan.toUpperCase()} Scholar Tier
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Choose your preferred checkout method. Both options support instant provisioning.
            </p>

            {/* Plan pill summary */}
            <div className="mt-4 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-white/10">
              <span className="text-amber-300 font-bold">{durationLabel} Plan</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>৳{finalPriceBdt} BDT</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>${discountedUsd} USD</span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Dual Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Paddle (International Payment) */}
              <div
                onClick={() => setSelectedMethod('paddle')}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMethod === 'paddle'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                {/* Header with Radio */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CreditCard size={20} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                        Global Cards
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === 'paddle' ? 'border-indigo-600 bg-white' : 'border-slate-300'
                      }`}>
                        {selectedMethod === 'paddle' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">
                    Paddle Checkout
                  </h3>
                  <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                    International Payment
                  </p>

                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                    Visa, MasterCard, Amex, PayPal, Apple Pay & Google Pay in USD with automated instant unlock.
                  </p>
                </div>

                {/* Price Tag */}
                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Pay in USD:</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">${discountedUsd}</span>
                    <span className="text-xs text-slate-500 font-medium">/{durationLabel.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              {/* Option 2: bKash (Local Payment) */}
              <div
                onClick={() => setSelectedMethod('bkash')}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50/50 shadow-md ring-2 ring-pink-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                {/* Header with Radio */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Phone size={20} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md">
                        Bangladesh
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === 'bkash' ? 'border-pink-600 bg-white' : 'border-slate-300'
                      }`}>
                        {selectedMethod === 'bkash' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">
                    bKash / Nagad / Rocket
                  </h3>
                  <p className="text-[11px] font-bold text-pink-600 mt-0.5">
                    Local Mobile Banking
                  </p>

                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                    Direct local transfer via bKash personal send-money. Verified via WhatsApp concierge in minutes.
                  </p>
                </div>

                {/* Price Tag */}
                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Pay in BDT:</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">৳{finalPriceBdt}</span>
                    <span className="text-xs text-slate-500 font-medium">/{durationLabel.toLowerCase()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Selected Method Dynamic Details Box */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 border border-slate-200 text-xs">
              
              {selectedMethod === 'paddle' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Paddle Hosted Automated Checkout (PCI-DSS Level 1)</span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Clicking continue will open the secure Paddle checkout modal directly over this page. Your card details are never stored on ScholarHub AI servers.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">Visa</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">MasterCard</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">American Express</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">PayPal</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">Apple Pay</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <MessageSquare size={16} className="text-pink-600 shrink-0" />
                      <span>bKash Personal Send Money Instructions</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                      Fast 2-Min Activation
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">Personal bKash / Nagad Number:</span>
                      <div className="text-sm font-black text-slate-900 tracking-wide font-mono">
                        {bkashNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedNumber ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedNumber ? 'Copied' : 'Copy Number'}</span>
                    </button>
                  </div>

                  <p className="text-slate-600 font-medium leading-relaxed">
                    1. Send <strong>৳{finalPriceBdt}.00</strong> to the number above via bKash/Nagad "Send Money".<br />
                    2. Click the WhatsApp button below to send your pre-formatted order summary & transaction ID.
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {selectedMethod === 'paddle' ? (
                <button
                  type="button"
                  onClick={handleLaunchPaddle}
                  disabled={isProcessingPaddle}
                  className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-75"
                >
                  {isProcessingPaddle ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Opening Paddle...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ${discountedUsd} via Paddle</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchBkashWhatsApp}
                  className="w-full sm:w-auto px-7 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span>Proceed to WhatsApp (৳{finalPriceBdt})</span>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>

            {/* Footer Trust Guarantee */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Lock size={12} className="text-slate-400" /> 256-Bit SSL Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" /> Instant Researcher Provisioning
              </span>
            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  )
}
