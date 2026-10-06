import { useState } from 'react'
import { supabase } from '../supabaseClient'

const REASONS = [
  { value: 'fake_or_suspicious', label: 'Fake or suspicious job' },
  { value: 'asking_for_money', label: 'Asking applicants for money' },
  { value: 'suspicious_contact', label: 'Suspicious WhatsApp/recruiter behaviour' },
  { value: 'job_does_not_exist', label: 'Job does not exist' },
  { value: 'incorrect_information', label: 'Incorrect information' },
  { value: 'already_closed', label: 'Already closed' },
  { value: 'other', label: 'Other' },
]

export default function ReportJobModal({ jobId, onClose, onReported }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return

    setSubmitting(true)
    setErrorMsg('')

    const { error } = await supabase.rpc('report_job', {
      p_job_id: jobId,
      p_reason: reason,
      p_details: details || null,
    })

    setSubmitting(false)

    if (error) {
      setErrorMsg('Could not submit your report — please try again.')
      return
    }

    onReported()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 'var(--content-max)',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          margin: 0,
        }}
      >
        <h2 style={{ fontSize: '18px' }}>Report this listing</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reason">What's the issue?</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--paper-raised)',
                fontSize: '16px',
              }}
            >
              <option value="">Select a reason…</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="details">Any details that might help (optional)</label>
            <textarea
              id="details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--paper-raised)',
                fontFamily: 'inherit',
                fontSize: '16px',
                resize: 'vertical',
              }}
            />
          </div>

          {errorMsg && <p className="error-text">{errorMsg}</p>}

          <button type="submit" className="btn-primary" disabled={!reason || submitting}>
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: 'var(--space-2)' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
        }
