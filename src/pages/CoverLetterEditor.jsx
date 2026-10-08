import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useDebouncedCoverLetterSave } from '../lib/useDebouncedCoverLetterSave'
import { buildCoverLetter } from '../lib/buildCoverLetter'
import ImproveWithAIButton from '../components/ImproveWithAIButton'

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--paper-raised)',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  fontSize: '16px',
}

export default function CoverLetterEditor() {
  const { id } = useParams()
  const { session } = useAuth()
  const [form, setForm] = useState(null)
  const [resumes, setResumes] = useState([])
  const [notFound, setNotFound] = useState(false)
  const { save, status, flush } = useDebouncedCoverLetterSave(id)

  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [hiringManager, setHiringManager] = useState('')
  const [extra, setExtra] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [genNote, setGenNote] = useState('')

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

  async function handleGenerate() {
    setGenError('')
    setGenNote('')

    if (!form.resume_id) {
      setGenError('Choose your CV in the box above first. We write your letter from the details already in it.')
      return
    }

    if (form.content && form.content.trim() !== '') {
      const proceed = window.confirm('This will replace the letter you have already written. Continue?')
      if (!proceed) return
    }

    setGenerating(true)
    const resumeId = form.resume_id

    const [resumeRes, workRes, eduRes, skillsRes, certRes, langRes] = await Promise.all([
      supabase.from('resumes').select('full_name, professional_summary').eq('id', resumeId).single(),
      supabase.from('work_experience').select('*').eq('resume_id', resumeId).order('sort_order'),
      supabase.from('education').select('*').eq('resume_id', resumeId).order('sort_order'),
      supabase.from('skills').select('*').eq('resume_id', resumeId).order('sort_order'),
      supabase.from('certifications').select('*').eq('resume_id', resumeId).order('sort_order'),
      supabase.from('languages').select('*').eq('resume_id', resumeId).order('sort_order'),
    ])

    if (resumeRes.error || !resumeRes.data) {
      setGenError('Could not read that CV — please try again.')
      setGenerating(false)
      return
    }

    const letter = buildCoverLetter(
      {
        resume: resumeRes.data,
        workExperience: workRes.data || [],
        education: eduRes.data || [],
        skills: skillsRes.data || [],
        certifications: certRes.data || [],
        languages: langRes.data || [],
      },
      { company, jobTitle, hiringManager, extra }
    )

    if (!letter) {
      setGenError(
        'Your CV does not have enough finished details yet. Add your summary, work experience or skills (and remove any [square bracket] example text), then try again.'
      )
      setGenerating(false)
      return
    }

    handleFieldChange('content', letter)

    const trimmedCompany = company.trim()
    const trimmedJob = jobTitle.trim()
    if ((!form.title || form.title === 'Untitled Cover Letter') && (trimmedCompany || trimmedJob)) {
      handleFieldChange('title', `Cover Letter – ${trimmedCompany || trimmedJob}`)
    }

    setGenNote('Draft created from your CV. Read it through and edit or remove anything that does not apply.')
    setGenerating(false)
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
          <label htmlFor="resume_id">Your CV (used for your contact details and to write your letter)</label>
          <select
            id="resume_id"
            value={form.resume_id || ''}
            onChange={(e) => handleFieldChange('resume_id', e.target.value || null)}
            style={{ ...fieldStyle, fontSize: '16px' }}
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

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: '18px' }}>Write my letter from my CV</h2>
        <p>
          We use the details already in your CV, plus anything you add here. Nothing is invented. Everything is
          optional.
        </p>

        <div className="field">
          <label htmlFor="cl_company">Company name</label>
          <input id="cl_company" value={company} onChange={(e) => setCompany(e.target.value)} style={fieldStyle} />
        </div>
        <div className="field">
          <label htmlFor="cl_job">Job title you are applying for</label>
          <input id="cl_job" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={fieldStyle} />
        </div>
        <div className="field">
          <label htmlFor="cl_manager">Hiring manager's name (if you know it)</label>
          <input
            id="cl_manager"
            value={hiringManager}
            onChange={(e) => setHiringManager(e.target.value)}
            placeholder="e.g. Ms Dlamini"
            style={fieldStyle}
          />
        </div>
        <div className="field">
          <label htmlFor="cl_extra">Anything else to add (optional)</label>
          <textarea
            id="cl_extra"
            rows={3}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="For example: why you want this job, or when you can start. Only add things that are true."
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {genError && <p className="error-text">{genError}</p>}
        {genNote && <p>{genNote}</p>}

        <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Writing your letter…' : 'Create letter from my CV'}
        </button>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px' }}>Your Letter</h2>
        <p>
          Edit anything here — greeting, body, and sign-off, just as it should appear on the page. The draft uses
          the wording from your CV, and "Improve with AI" below can polish it.
        </p>
        <textarea
          rows={18}
          value={form.content || ''}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          placeholder="Dear Hiring Manager,&#10;&#10;..."
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
        <ImproveWithAIButton
          text={form.content}
          fieldType="cover_letter"
          onImproved={(improved) => handleFieldChange('content', improved)}
        />
      </div>
    </div>
  )
                                                                                          }
