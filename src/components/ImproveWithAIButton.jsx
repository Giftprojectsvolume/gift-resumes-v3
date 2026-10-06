import { useState } from 'react'
import { useAICredits } from '../lib/useAICredits'

export default function ImproveWithAIButton({ text, fieldType, onImproved }) {
  const { balance, improveText } = useAICredits()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleClick() {
    if (!text || !text.trim()) return
    setLoading(true)
    setErrorMsg('')
    try {
      const improved = await improveText(text, fieldType)
      onImproved(improved)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
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
    </div>
  )
}
