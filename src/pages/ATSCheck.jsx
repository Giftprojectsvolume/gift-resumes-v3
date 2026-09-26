import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { runATSChecklist, checkJobDescriptionOverlap } from '../lib/atsChecklist'
import '../styles/ats.css'

const STATUS_LABEL = {
  pass: 'Looks good',
  warning: 'Worth a look',
  fail: 'Needs attention',
}

export default function ATSCheck() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [overlapResult, setOverlapResult] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [resumeRes, workRes, eduRes, skillsRes] = await Promise.all([
        supabase.from('resumes').select('*').eq('id', id).single(),
        supabase.from('work_experience').select('*').eq('resume_id', id).order('sort_order'),
        supabase.from('education').select('*').eq('resume_id', id).order('sort_order'),
        supabase.from('skills').select('*').eq('resume_id', id).order('sort_order'),
      ])

      if (cancelled) return

      if (resumeRes.error || !resumeRes.data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setData({
        ...resumeRes.data,
        workExperience: workRes.data || [],
        education: eduRes.data || [],
        skills: skillsRes.data || [],
      })
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  function handleCheckJobDescription() {
    setOverlapResult(checkJobDescriptionOverlap(data, jobDescription))
  }

  if (notFound) {
    return (
      <div className="page">
        <p>We couldn't find that CV — it may have been deleted, or it belongs to a different account.</p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (loading || !data) {
    return <div style={{ padding: 24 }}>Checking your CV…</div>
  }

  const checks = runATSChecklist(data)

  return (
    <div className="page">
      <div className="editor-header">
        <Link to={`/resume/${id}/edit`} className="back-link">
          ← Editor
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>ATS / Readability Check</h1>
      <p>
        These are common readability checks, not a guarantee about any specific employer's software — different
        systems work differently. Use this as a helpful guide, not a pass/fail exam.
      </p>

      <div className="section">
        {checks.map((check) => (
          <div className={`ats-check-row ats-status-${check.status}`} key={check.id}>
            <div className="ats-check-top">
              <span className="ats-check-label">{check.label}</span>
              <span className={`badge ats-badge-${check.status}`}>{STATUS_LABEL[check.status]}</span>
            </div>
            <p className="ats-check-detail">{check.detail}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 'var(--space-5)' }}>
        <h2 style={{ fontSize: '18px' }}>Check against a job description</h2>
        <p>Paste a job advert below to see which of its important words don't yet appear anywhere in your CV.</p>
        <textarea
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
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
            marginBottom: 'var(--space-3)',
          }}
        />
        <button className="btn-primary" onClick={handleCheckJobDescription} disabled={!jobDescription.trim()}>
          Compare to this job
        </button>

        {overlapResult && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            {overlapResult.missingKeywords.length === 0 ? (
              <p>Your CV already mentions most of the meaningful words from this job description.</p>
            ) : (
              <>
                <p>These words from the job description don't appear in your CV yet — worth reviewing if they genuinely apply to your experience:</p>
                <div className="cv-skill-list" style={{ marginTop: 'var(--space-2)' }}>
                  {overlapResult.missingKeywords.map((word) => (
                    <span className="ats-keyword-chip" key={word}>
                      {word}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
