import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import {
  STARTER_CATEGORIES,
  STARTERS,
  PLACEHOLDERS,
  formatExampleDuties,
  formatExampleSkill,
} from '../lib/cvStarters'

export default function NewCV() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const userId = session.user.id
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function createBlank() {
    if (busy) return
    setBusy(true)
    setErrorMsg('')

    const { data, error } = await supabase
      .from('resumes')
      .insert({ user_id: userId, title: 'Untitled CV' })
      .select('id')
      .single()

    if (error || !data) {
      setErrorMsg('Could not create a new CV — please try again.')
      setBusy(false)
      return
    }

    navigate(`/resume/${data.id}/edit`)
  }

  async function createFromStarter(category) {
    if (busy) return
    setBusy(true)
    setErrorMsg('')

    const starter = STARTERS[category.id]
    if (!starter) {
      setErrorMsg('That example is not available — please pick another.')
      setBusy(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle()

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title: `${category.label} CV`,
        full_name: (profile && profile.full_name) || '',
        email: session.user.email || '',
        professional_summary: starter.summary,
      })
      .select('id')
      .single()

    if (resumeError || !resume) {
      setErrorMsg('Could not create your CV — please try again.')
      setBusy(false)
      return
    }

    const results = await Promise.all([
      supabase.from('work_experience').insert({
        resume_id: resume.id,
        employer: PLACEHOLDERS.company,
        job_title: PLACEHOLDERS.jobTitle,
        start_date: null,
        end_date: null,
        is_current: false,
        responsibilities: formatExampleDuties(starter.duties),
        sort_order: 0,
      }),
      supabase.from('education').insert({
        resume_id: resume.id,
        institution: PLACEHOLDERS.institution,
        qualification: PLACEHOLDERS.qualification,
        details: PLACEHOLDERS.educationDetails,
        sort_order: 0,
      }),
      supabase.from('skills').insert(
        starter.skills.map((name, i) => ({
          resume_id: resume.id,
          skill_name: formatExampleSkill(name),
          sort_order: i,
        }))
      ),
    ])

    const failed = results.find((r) => r.error)
    if (failed) {
      await supabase.from('resumes').delete().eq('id', resume.id)
      setErrorMsg('Could not set up that example — please try again.')
      setBusy(false)
      return
    }

    navigate(`/resume/${resume.id}/edit`)
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Create New CV</h1>

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <span className="badge">Recommended</span>
        <h2 style={{ fontSize: '18px', marginTop: 'var(--space-2)' }}>Start With a CV Example</h2>
        <p>
          Don't know what to write? Start with a professional example and replace it with your own information.
          Everything in square brackets is an example for you to replace or delete.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Choose the closest match:</p>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {STARTER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className="btn-secondary"
              disabled={busy}
              onClick={() => createFromStarter(category)}
              style={{ textAlign: 'left' }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: '18px' }}>Start From Scratch</h2>
        <p>For when you already know what you want to write.</p>
        <button className="btn-primary" disabled={busy} onClick={createBlank}>
          Start with a blank CV
        </button>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px' }}>Duplicate Existing CV</h2>
        <p>
          Already made a CV here? Go to your dashboard and tap Duplicate on the CV you want to copy.
        </p>
        <Link to="/dashboard" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
          Go to my CVs
        </Link>
      </div>

      {busy && <p style={{ marginTop: 'var(--space-3)' }}>Setting up your CV…</p>}
    </div>
  )
        }
