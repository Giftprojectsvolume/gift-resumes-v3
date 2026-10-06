import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAICredits } from '../lib/useAICredits'
import PurchaseButton from './PurchaseButton'

export default function ImproveWithAIButton({ text, fieldType, onImproved }) {
  const { balance, improveText, refresh } = useAICredits()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [outOfCredits, setOutOfCredits] = useState(false)
  const [creditProduct, setCreditProduct] = useState(null)

  useEffect(() => {
    async function loadProduct() {
      const { data } = await supabase
        .from('products')
        .select('id, price_cents')
        .eq('name', 'AI CV Improvement (1 credit)')
        .eq('is_active', true)
        .single()
      setCreditProduct(data || null)
    }
    loadProduct()
  }, [])

  async function handleClick() {
    if (!text || !text.trim()) return
    setLoading(true)
    setErrorMsg('')
    setOutOfCredits(false)
    try {
      const improved = await improveText(text, fieldType)
      onImproved(improved)
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('out of')) {
        setOutOfCredits(true)
      } else {
        setErrorMsg(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreditsPurchased() {
    setOutOfCredits(false)
    await refresh()
  }

  return (
    <div style={{ marginTop: 'var(--space-2)' }}>
      <button
        type="button"
        className="action-btn"
        onClick={handleClick}
        disabled={loading || !text || !text.trim()}
        style={{ width: 'auto' }}
      >
        {loading ? 'Improving…' : '✨ Improve with AI'}
      </button>
      {balance !== null && (
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 8 }}>
          {balance} credit{balance === 1 ? '' : 's'} left
        </span>
      )}
      {errorMsg && (
        <p className="error-text" style={{ marginTop: 4 }}>
          {errorMsg}
        </p>
      )}
      {outOfCredits && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 13, marginBottom: 6 }}>You're out of AI credits.</p>
          {creditProduct ? (
            <PurchaseButton
              productId={creditProduct.id}
              priceCents={creditProduct.price_cents}
              label="Buy 1 AI credit"
              resumeId={null}
              onPurchased={handleCreditsPurchased}
            />
          ) : (
            <p className="error-text">Credits aren't available to purchase right now.</p>
          )}
        </div>
      )}
    </div>
  )
}
