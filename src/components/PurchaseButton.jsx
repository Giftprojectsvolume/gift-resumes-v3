import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePaystackCheckout } from '../lib/usePaystackCheckout'

export default function PurchaseButton({ productId, priceCents, label, resumeId, onPurchased }) {
  const { session } = useAuth()
  const { startCheckout } = usePaystackCheckout()
  const [processing, setProcessing] = useState(false)

  function handleClick() {
    setProcessing(true)
    startCheckout({
      email: session.user.email,
      amountCents: priceCents,
      productId,
      resumeId,
      onSuccess: () => {
        setProcessing(false)
        onPurchased?.()
      },
      onError: (message) => {
        setProcessing(false)
        // A null message just means the customer closed the payment window.
        if (message) window.alert(message)
      },
    })
  }

  return (
    <button className="btn-primary" onClick={handleClick} disabled={processing}>
      {processing ? 'Processing…' : `${label} — R${(priceCents / 100).toFixed(2)}`}
    </button>
  )
}
