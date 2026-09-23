import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useDebouncedCoverLetterSave } from '../lib/useDebouncedCoverLetterSave'

export default function CoverLetterEditor() {
  const { id } = useParams()
  const { session } = useAuth()
  const [form, setForm] = useState(null)
  const [resumes, setResumes] = useState([])
  const [notFound, setNotFound] = useState(false)
  const { save, status, flush } = useDebouncedCoverLetterSave(id)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [letterRes, resumesRes] = await Promise.all([
        supabase.from('cover_letters').select('*').eq('id', id).single(),
        supabase.from('resumes').select('id, title').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
      ])

      if (cancelled) return

      if (letterRes.error || !letterRes.data) {
        setNotFound(true)
        return
      }

      setForm(letterRes.data)
      setResumes(resumesRes.data || [])
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id, session.user.id])

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    save({ [field]: value })
  }

  if (notFound) {
    return (
      <div className="page">
        <p>We couldn't find that cover letter — it may have been deleted, or it belongs to a different account.</p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!form) {
    return <div style={{ padding: 24 }}>Loading your cover letter…</div>
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link" onClick={flush}>
          ← Dashboard
        </Link>
        <span className={`save-status ${status}`}>
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && 'Saved'}
          {status === 'error' && "Couldn't save"}
        </span>
      </div>

      <input
        className="title-input"
        value={form.title || ''}
        onChange={(e) => handleFieldChange('title', e.target.value)}
        aria-label="Cover letter title"
        placeholder="Untitled Cover Letter"
      />

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="resume_id">Link to a CV for your contact details (optional)</label>
          <select
            id="resume_id"
            value={form.resume_id || ''}
            onChange={(e) => handleFieldChange('resume_id', e.target.value || null)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--paper-raised)',
              fontSize: '16px',
            }}
          >
            <option value="">No CV linked</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px' }}>Your Letter</h2>
        <p>Write the whole letter here — greeting, body, and sign-off, just as it should appear on the page.</p>
        <textarea
          rows={18}
          value={form.content || ''}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          placeholder="Dear Hiring Manager,&#10;&#10;..."
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--paper-raised)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
            fontSize: '16px',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  )
}
