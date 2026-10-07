import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getFileType(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx')) return 'docx'
  return null
}

export default function ImportCV() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const fileType = getFileType(file)
    if (!fileType) {
      setErrorMsg('Please upload a PDF or Word (.docx) file.')
      setStatus('error')
      return
    }

    setStatus('processing')
    setErrorMsg('')

    try {
      const fileBase64 = await readFileAsBase64(file)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ fileBase64, fileType }),
      })

      let result
      try {
        result = await res.json()
      } catch (parseErr) {
        setErrorMsg(`The server sent back something unreadable (status ${res.status}). Raw parse error: ${parseErr.message}`)
        setStatus('error')
        return
      }

      if (!res.ok || !result.success) {
        setErrorMsg(`Import failed (status ${res.status}): ${result.error || 'No error detail provided.'}`)
        setStatus('error')
        return
      }

      await createResumeFromDraft(result.data)
    } catch (err) {
      setErrorMsg(`Something went wrong while importing. Detail: ${err && err.message ? err.message : String(err)}`)
      setStatus('error')
    }
  }

  async function createResumeFromDraft(draft) {
    const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: session.user.id,
        title: `Imported CV — ${today}`,
        full_name: draft.full_name || '',
        email: draft.email || '',
        phone: draft.phone || '',
        city: draft.city || '',
        linkedin_url: draft.linkedin_url || '',
        professional_summary: draft.professional_summary || '',
      })
      .select('id')
      .single()

    if (resumeError || !resume) {
      setErrorMsg(`Could not create your CV row. Detail: ${resumeError ? resumeError.message : 'no resume returned'}`)
      setStatus('error')
      return
    }

    const resumeId = resume.id

    const workRows = (Array.isArray(draft.work_experience) ? draft.work_experience : []).map((job, i) => ({
      resume_id: resumeId,
      employer: job.employer || '',
      job_title: job.job_title || '',
      start_date: job.start_date || null,
      end_date: job.end_date || null,
      is_current: !!job.is_current,
      responsibilities: job.responsibilities || '',
      sort_order: i,
    }))

    const eduRows = (Array.isArray(draft.education) ? draft.education : []).map((edu, i) => ({
      resume_id: resumeId,
      institution: edu.institution || '',
      qualification: edu.qualification || '',
      start_year: edu.start_year || null,
      end_year: edu.end_year || null,
      sort_order: i,
    }))

    const skillRows = (Array.isArray(draft.skills) ? draft.skills : []).map((skill, i) => ({
      resume_id: resumeId,
      skill_name: typeof skill === 'string' ? skill : skill?.skill_name || '',
      sort_order: i,
    }))

    const certRows = (Array.isArray(draft.certifications) ? draft.certifications : []).map((cert, i) => ({
      resume_id: resumeId,
      certificate_name: cert.certificate_name || '',
      institution: cert.institution || '',
      sort_order: i,
    }))

    const langRows = (Array.isArray(draft.languages) ? draft.languages : []).map((lang, i) => ({
      resume_id: resumeId,
      language: lang.language || '',
      proficiency: lang.proficiency || '',
      sort_order: i,
    }))

    const refRows = (Array.isArray(draft.references) ? draft.references : []).map((ref, i) => ({
      resume_id: resumeId,
      ref_name: ref.ref_name || '',
      position: ref.position || '',
      company: ref.company || '',
      contact_info: ref.contact_info || '',
      sort_order: i,
    }))

    const results = await Promise.all([
      workRows.length > 0 ? supabase.from('work_experience').insert(workRows) : Promise.resolve({ error: null }),
      eduRows.length > 0 ? supabase.from('education').insert(eduRows) : Promise.resolve({ error: null }),
      skillRows.length > 0 ? supabase.from('skills').insert(skillRows) : Promise.resolve({ error: null }),
      certRows.length > 0 ? supabase.from('certifications').insert(certRows) : Promise.resolve({ error: null }),
      langRows.length > 0 ? supabase.from('languages').insert(langRows) : Promise.resolve({ error: null }),
      refRows.length > 0 ? supabase.from('references').insert(refRows) : Promise.resolve({ error: null }),
    ])

    const failed = results.find((r) => r.error)
    if (failed) {
      setErrorMsg(`Your CV was created, but one section failed to save: ${failed.error.message}`)
      setStatus('error')
      return
    }

    navigate(`/resume/${resumeId}/edit`)
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Import Existing CV</h1>
      <p>
        Already have a CV? Upload it and we'll bring your information into a new, editable Gift Resumes CV — nothing
        is invented, and you'll be able to review and correct everything before saving.
      </p>

      <div className="card">
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
          Supported: PDF and Word (.docx) files with real, selectable text. Scanned photos aren't supported yet.
        </p>

        {status === 'processing' ? (
          <p>Reading your CV… this can take a few seconds.</p>
        ) : (
          <input type="file" accept=".pdf,.docx" onChange={handleFileChange} style={{ marginTop: 'var(--space-3)' }} />
        )}

        {status === 'error' && <p className="error-text">{errorMsg}</p>}
      </div>
    </div>
  )
        }
