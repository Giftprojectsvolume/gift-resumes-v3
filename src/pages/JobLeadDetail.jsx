import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatDate } from '../lib/formatDate'
import ReportJobModal from '../components/ReportJobModal'

const LEVEL_LABEL = {
  entry: 'Entry-level',
  mid: 'Mid-level',
  executive: 'Executive',
}

export default function JobLeadDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('job_leads').select('*').eq('id', id).single()

    if (error || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setJob(data)
    setLoading(false)
  }

  function handleReported() {
    setShowReportModal(false)
    setReported(true)
  }

  if (notFound || (job && job.status !== 'approved' && !reported)) {
    return (
      <div className="page">
        <p>This listing isn't available — it may have been removed, closed, or is under review.</p>
        <Link to="/jobs" className="btn-secondary">
          Back to Job Leads
        </Link>
      </div>
    )
  }

  if (loading || !job) {
    return <div style={{ padding: 24 }}>Loading…</div>
  }

  if (reported) {
    return (
      <div className="page">
        <h1 style={{ fontSize: '22px' }}>Thank you for reporting this job</h1>
        <p>
          The listing has been temporarily hidden while we review the report. We may contact you for additional
          information if needed.
        </p>
        <Link to="/jobs" className="btn-secondary">
          Back to Job Leads
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/jobs" className="back-link">
          ← Job Leads
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>{job.title}</h1>
      <p className="resume-meta" style={{ marginBottom: 'var(--space-4)' }}>
        {job.employer_name}
        {job.location ? ` · ${job.location}` : ''}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        {job.job_level && <span className="badge">{LEVEL_LABEL[job.job_level]}</span>}
        {job.work_type && <span className="badge">{job.work_type}</span>}
        {job.closing_date && <span className="badge">Closes {formatDate(job.closing_date)}</span>}
      </div>

      {job.description && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '16px' }}>Description</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>
      )}

      {job.requirements && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '16px' }}>Requirements</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
        </div>
      )}

      {job.application_instructions && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '16px' }}>How to apply</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{job.application_instructions}</p>
          {job.application_link && (
            <a href={job.application_link} target="_blank" rel="noreferrer" className="btn-secondary">
              Open application link
            </a>
          )}
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        This listing was reviewed before publishing, but we can't guarantee it's genuine. If anything seems
        suspicious — being asked for money, odd contact details, or anything else — please report it.
      </p>

      <button className="btn-secondary" onClick={() => setShowReportModal(true)}>
        Report this listing
      </button>

      {showReportModal && (
        <ReportJobModal jobId={job.id} onClose={() => setShowReportModal(false)} onReported={handleReported} />
      )}
    </div>
  )
          }
