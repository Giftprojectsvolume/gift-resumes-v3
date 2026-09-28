import { useCallback } from 'react'
import { supabase } from '../supabaseClient'

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

async function verifyPayment({ reference, productId, resumeId, onSuccess, onError }) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token

  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-paystack-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ reference, product_id: productId, resume_id: resumeId }),
    })
    const data = await res.json()
    if (!res.ok) {
      onError?.(data.error || 'Payment could not be verified.')
      return
    }
    onSuccess?.()
  } catch {
    onError?.('Could not verify your payment. If you were charged, please contact support with your email address.')
  }
}

export function usePaystackCheckout() {
  const startCheckout = useCallback(async ({ email, amountCents, productId, resumeId, onSuccess, onError }) => {
    if (!PAYSTACK_PUBLIC_KEY) {
      onError?.('Payments are not switched on yet.')
      return
    }

    try {
      await loadPaystackScript()
    } catch {
      onError?.('Could not load the payment window. Check your connection and try again.')
      return
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountCents,
      currency: 'ZAR',
      callback: (response) => {
        verifyPayment({ reference: response.reference, productId, resumeId, onSuccess, onError })
      },
      onClose: () => {
        onError?.(null)
      },
    })

    handler.openIframe()
  }, [])

  return { startCheckout }
}
