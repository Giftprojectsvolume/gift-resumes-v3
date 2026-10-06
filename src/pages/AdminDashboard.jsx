import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/formatDate'

const REASON_LABEL = {
  fake_or_suspicious: 'Fake or suspicious job',
  asking_for_money: 'Asking applicants for money',
  suspicious_contact: 'Suspicious WhatsApp/recruiter behaviour',
  job_does_not_exist: 'Job does not exist',
  incorrect_information: 'Incorrect information',
  already_closed: 'Already closed',
  other: 'Other',
}

export default function AdminDashboard() {
  const { session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [pendingJobs, setPendingJobs] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const load = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setErrorMsg(`Could not check admin access: ${profileError.message}`)
        setLoading(false)
        return
      }

      if (!profile?.is_admin) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)

      const [usersRes, purchasesRes, jobsRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }),
        supabase
          .from('purchases')
          .select('id, amount_cents, status, created_at, user_id, products(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('job_leads')
          .select('id, title, employer_name, status, created_at')
          .in('status', ['pending', 'under_review'])
          .order('created_at', { ascending: false }),
        supabase
          .from('job_reports')
          .select('id, job_id, reason, details, status, created_at, job_leads(title)')
          .eq('status', 'open')
          .order('created_at', { ascending: false }),
      ])

      setUsers(usersRes.data || [])
      setPurchases(purchasesRes.data || [])
      setPendingJobs(jobsRes.data || [])
      setReports(reportsRes.data || [])
      setLoading(false)
    } catch (err) {
      setErrorMsg(`Unexpected error: ${err.message}`)
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleApprove(jobId) {
    await supabase.from('job_leads').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', jobId)
    load()
  }

  async function handleReject(jobId) {
    await supabase.from('job_leads').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', jobId)
    load()
  }

  async function handleReinstate(jobId) {
    await supabase.from('job_leads').update({ status: 'approved' }).eq('id', jobId)
    load()
  }

  async function handleDeactivate(jobId) {
    await supabase.from('job_leads').update({ status: 'deactivated' }).eq('id', jobId)
    load()
  }

  async function handleResolveReport(reportId) {
    await supabase.from('job_reports').update({ status: 'resolved' }).eq('id', reportId)
    load()
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>
  }

  if (errorMsg) {
    return (
      <div className="page">
        <p className="error-text">{errorMsg}</p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="page">
        <p>This page is for admin accounts only.</p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const totalRevenueCents = purchases
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount_cents, 0)

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Admin</h1>

      <div className="section">
        <div className="plan-card">
          <div className="plan-label">Total Revenue</div>
          <p style={{ fontSize: '26px', fontWeight: 700, color: 'var(--paper)' }}>
            R{(totalRevenueCents / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Job Reports ({reports.length})</h2>
        </div>
        {reports.length === 0 ? (
          <div className="empty-state">
            <p>No open reports.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div className="card list-card" key={report.id}>
              <div className="resume-title">{report.job_leads?.title || 'Listing'}</div>
              <div className="resume-meta">
                {REASON_LABEL[report.reason] || report.reason} · {formatDate(report.created_at)}
              </div>
              {report.details && <p style={{ fontSize: 13, marginTop: 6 }}>{report.details}</p>}
              <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Link to={`/jobs/${report.job_id}`} className="action-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  View listing
                </Link>
                <button className="action-btn" onClick={() => handleResolveReport(report.id)}>
                  Mark resolved
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Listings Needing Review ({pendingJobs.length})</h2>
        </div>
        {pendingJobs.length === 0 ? (
          <div className="empty-state">
            <p>Nothing waiting on review.</p>
          </div>
        ) : (
          pendingJobs.map((job) => (
            <div className="card list-card" key={job.id}>
              <div className="resume-title">{job.title}</div>
              <div className="resume-meta">
                {job.employer_name} · <span className={`badge status-${job.status}`}>{job.status}</span>
              </div>
              {job.status === 'pending' ? (
                <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <button className="action-btn" onClick={() => handleApprove(job.id)}>
                    Approve
                  </button>
                  <button className="action-btn danger" onClick={() => handleReject(job.id)}>
                    Reject
                  </button>
                </div>
              ) : (
                <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <button className="action-btn" onClick={() => handleReinstate(job.id)}>
                    Reinstate
                  </button>
                  <button className="action-btn danger" onClick={() => handleDeactivate(job.id)}>
                    Deactivate
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Users ({users.length})</h2>
        </div>
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No users yet.</p>
          </div>
        ) : (
          users.map((user) => (
            <div className="card list-card" key={user.id}>
              <div className="resume-title">{user.full_name || 'No name set'}</div>
              <div className="resume-meta">Joined {formatDate(user.created_at)}</div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Purchases ({purchases.length})</h2>
        </div>
        {purchases.length === 0 ? (
          <div className="empty-state">
            <p>No purchases yet.</p>
          </div>
        ) : (
          purchases.map((purchase) => (
            <div className="card list-card" key={purchase.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="resume-title">{purchase.products?.name || 'Purchase'}</div>
                  <div className="resume-meta">{formatDate(purchase.created_at)}</div>
                </div>
                <span className={`badge status-${purchase.status}`}>{purchase.status}</span>
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontWeight: 600 }}>
                R{(purchase.amount_cents / 100).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
    }
