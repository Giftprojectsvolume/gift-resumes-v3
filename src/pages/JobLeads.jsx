import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const LEVEL_LABEL = {
  entry: 'Entry-level',
  mid: 'Mid-level',
  executive: 'Executive',
}

function isEffectivelyFeatured(job) {
  return job.is_featured && job.featured_until && new Date(job.featured_until) > new Date()
}

export default function JobLeads() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('job_leads')
        .select('id, title, employer_name, location, work_type, job_level, closing_date, is_featured, featured_until, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const rows = data || []
      const sorted = [...rows].sort((a, b) => {
        const aFeatured = isEffectivelyFeatured(a) ? 1 : 0
        const bFeatured = isEffectivelyFeatured(b) ? 1 : 0
        if (aFeatured !== bFeatured) return bFeatured - aFeatured
        return new Date(b.created_at) - new Date(a.created_at)
      })

      setJobs(sorted)
      setLoading(false)
    }
    load()
  }, [])

  const filteredJobs = levelFilter ? jobs.filter((j) => j.job_level === levelFilter) : jobs

  if (loading) {
    return <div style={{ padding: 24 }}>Loading job leads…</div>
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Job Leads</h1>
      <p>
        These listings are reviewed before they're published, but we can't guarantee every job is genuine — if
        anything feels off, report it from the listing page.
      </p>

      <div className="field">
        <label htmlFor="level-filter">Filter by level</label>
        <select
          id="level-filter"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--paper-raised)',
            fontSize: '16px',
          }}
        >
          <option value="">All levels</option>
          <option value="entry">Entry-level</option>
          <option value="mid">Mid-level</option>
          <option value="executive">Executive</option>
        </select>
      </div>

      <div className="section">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No job leads available right now — check back soon.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card list-card">
                <div className="resume-title">{job.title}</div>
                <div className="resume-meta">
                  {job.employer_name}
                  {job.location ? ` · ${job.location}` : ''}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {job.job_level && <span className="badge">{LEVEL_LABEL[job.job_level]}</span>}
                  {job.work_type && <span className="badge">{job.work_type}</span>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
        }
