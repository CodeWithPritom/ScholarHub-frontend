import { initializePaddle } from '@paddle/paddle-js'
import { BASE_URL } from './api'

// Fallback Sandbox Token generated for ScholarHub AI
const DEFAULT_CLIENT_TOKEN = 'test_26250c1a468e975974c255699d2'
const PADDLE_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || DEFAULT_CLIENT_TOKEN
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV || 'sandbox'

export const PADDLE_PRICE_MAP = {
  starter_1_month: 'pri_01m63sy66y23qyvjc20xmz2k0j',
  starter_3_months: 'pri_01m63t2cx6ycrag98q9736v3ra',
  starter_6_months: 'pri_01m63t2dgxpxwg5r4gwmmepmvc',
  starter_1_year: 'pri_01m63t2emafmgd9nej4sbje64v',
  pro_1_month: 'pri_01m63t2fgty229pyr34s9gk0nn',
  pro_3_months: 'pri_01m63t2g3q7g2ahdbzthkytve4',
  pro_6_months: 'pri_01m63t2hd8e04667efkt7g9h1s',
  pro_1_year: 'pri_01m63t2hy354a0s1gm0p66hfkb',
  lab_annual: 'pri_01m63t2jex479sct0xrpc06pqk',
}

export const USD_PRICES = {
  starter_1_month: 1.99,
  starter_3_months: 4.99,
  starter_6_months: 8.99,
  starter_1_year: 14.99,
  pro_1_month: 4.99,
  pro_3_months: 12.99,
  pro_6_months: 23.99,
  pro_1_year: 39.99,
  lab_annual: 499.00,
}

let paddleInstancePromise = null

export function getPaddleInstance() {
  if (!paddleInstancePromise) {
    paddleInstancePromise = initializePaddle({
      token: PADDLE_TOKEN,
      environment: PADDLE_ENV,
      eventCallback: (event) => {
        if (event && event.name) {
          console.log('[PADDLE EVENT]', event.name, event.data)
        }
      }
    }).catch(err => {
      console.error('[PADDLE INIT ERROR]', err)
      paddleInstancePromise = null
      throw err
    })
  }
  return paddleInstancePromise
}

/**
 * Opens Paddle Overlay Checkout
 */
export async function openPaddleCheckout({
  tier = 'pro',
  duration = '1_month',
  couponCode = '',
  discountPercent = 0,
  user = null,
  onSuccess = () => {},
  onClose = () => {},
  onError = () => {}
}) {
  try {
    const paddle = await getPaddleInstance()
    if (!paddle) {
      throw new Error('Paddle failed to initialize.')
    }

    let transactionId = null

    // Always create a verified, pre-calculated transaction via our backend
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: tier,
          duration: duration,
          coupon_code: couponCode || null,
          user_email: user?.email || '',
          user_id: user?.id || ''
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.transaction_id) {
          transactionId = data.transaction_id
        }
      } else {
        const errData = await res.json()
        console.warn('[PADDLE] Backend transaction creation warning:', errData)
      }
    } catch (txnErr) {
      console.warn('[PADDLE] Failed to create server transaction, falling back to items:', txnErr)
    }

    let checkoutArgs = {}
    if (transactionId) {
      checkoutArgs = { transactionId }
    } else {
      const packageKey = `${tier.toLowerCase()}_${duration.toLowerCase()}`
      const priceId = PADDLE_PRICE_MAP[packageKey] || PADDLE_PRICE_MAP.pro_1_month
      checkoutArgs = {
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        customData: {
          user_id: user?.id || '',
          user_email: user?.email || '',
          tier: tier.toLowerCase(),
          duration: duration.toLowerCase(),
          coupon_code: couponCode || '',
          platform: 'scholarhub_web'
        }
      }
    }

    paddle.Checkout.open({
      ...checkoutArgs,
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
        variant: 'one-page',
        successUrl: `${window.location.origin}/cart?payment_success=true&provider=paddle&tier=${tier}&duration=${duration}`
      }
    })

    // Listen for completion
    const eventHandler = async (event) => {
      if (event?.name === 'checkout.completed') {
        console.log('[PADDLE] Checkout completed successfully:', event.data)
        const txId = event.data?.transaction_id || event.data?.id
        
        // Notify callback
        if (onSuccess) {
          onSuccess({
            transactionId: txId,
            tier,
            duration,
            data: event.data
          })
        }
      } else if (event?.name === 'checkout.closed') {
        if (onClose) onClose()
      }
    }

    // Attach custom event listener if supported
    paddle.Update({
      eventCallback: eventHandler
    })

    return true
  } catch (err) {
    console.error('[PADDLE CHECKOUT ERROR]', err)
    if (onError) onError(err)
    throw err
  }
}
