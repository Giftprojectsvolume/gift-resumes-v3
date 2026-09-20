import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/formatDate'

const PLAN_COPY = {
  free: {
    label: 'Free Plan',
    description: 'Create and edit your CV for free.',
    cta: 'Upgrade',
  },
  payg: {
    label: 'CV Package',
    description: "You've purchased a once-off CV package. Go Annual for unlimited downloads and AI credits.",
    cta: 'Upgrade to Annual',
  },
  annual: {
    label: 'Annual Career Plan',
    description: 'Unlimited CVs, cover letters and premium features are active on your account.',
    cta: null,
  },
}

export default function Dashboard() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const userId = session.user.id

  const [fullName, setFullName] = useState('')
  const [planTier, setPlanTier] = useState('free')
  const [resumes, setResumes] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')

    const [profileRes, planRes, resumesRes, purchasesRes] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
      supabase.rpc('get_user_plan_status'),
      supabase
        .from('resumes')
        .select('id, title, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      supabase
        .from('purchases')
        .select('id, amount_cents, status, created_at, products(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ])

    if (profileRes.data) setFullName(profileRes.data.full_name || '')
    if (planRes.data && planRes.data.length > 0) setPlanTier(planRes.data[0].tier)
    if (resumesRes.data) setResumes(resumesRes.data)
    if (purchasesRes.data) setPurchases(purchasesRes.data)

    if (profileRes.error || planRes.error || resumesRes.error || purchasesRes.error) {
      setErrorMsg('Some parts of your dashboard could not be loaded. Pull to refresh or try again shortly.')
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function handleCreateCV() {
    const { data, error } = await supabase
      .from('resumes')
      .insert({ user_id: userId, title: 'Untitled CV' })
      .select('id')
      .single()

    if (error) {
      setErrorMsg('Could not create a new CV — please try again.')
      return
    }

    navigate(`/resume/${data.id}/edit`)
  }

  async function handleDuplicate(resumeId) {
    const { error } = await supabase.rpc('duplicate_resume', { source_resume_id: resumeId })
    if (error) {
      setErrorMsg('Could not duplicate that CV — please try again.')
      return
    }
    loadDashboard()
  }

  async function handleDelete(resumeId, title) {
    const confirmed = window.confirm(`Delete "${title}"? This can't be undone.`)
    if (!confirmed) return

    const { error } = await supabase.from('resumes').delete().eq('id', resumeId)
    if (error) {
      setErrorMsg('Could not delete that CV — please try again.')
      return
    }
    setResumes((prev) => prev.filter((r) => r.id !== resumeId))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const plan = PLAN_COPY[planTier] || PLAN_COPY.free

  if (loading) {
    return <div style={{ padding: 24 }}>Loading your dashboard…</div>
  }

  return (
    <div className="page">
      <div className="top-bar">
        <span className="brand">Gift Resumes</span>
        <button className="signout-link" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      <div className="section">
        <h1 style={{ fontSize: '22px' }}>
          Welcome back{fullName ? `, ${fullName.split(' ')[0]}` : ''}
        </h1>
      </div>

      {errorMsg && <p className="error-text" style={{ marginBottom: 'var(--space-4)' }}>{errorMsg}</p>}

      <div className="section">
        <div className="plan-card">
          <div className="plan-label">{plan.label}</div>
          <p>{plan.description}</p>
          {plan.cta && (
            <button className="upgrade-btn" onClick={() => navigate('/pricing')}>
              {plan.cta}
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <button className="btn-primary" onClick={handleCreateCV}>
          + Create New CV
        </button>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>My CVs</h2>
        </div>

        {resumes.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created a CV yet.</p>
            <button className="btn-secondary" onClick={handleCreateCV} style={{ width: 'auto', display: 'inline-block' }}>
              Create your first CV
            </button>
          </div>
        ) : (
          resumes.map((resume) => (
            <div className="card resume-card list-card" key={resume.id}>
              <div className="resume-title">{resume.title}</div>
              <div className="resume-meta">Last edited {formatDate(resume.updated_at)}</div>
              <div className="action-grid">
                <button className="action-btn" onClick={() => navigate(`/resume/${resume.id}/edit`)}>
                  Edit
                </button>
                <button className="action-btn" onClick={() => navigate(`/resume/${resume.id}/preview`)}>
                  Preview
                </button>
                <button className="action-btn" onClick={() => handleDuplicate(resume.id)}>
                  Duplicate
                </button>
                <button className="action-btn danger" onClick={() => handleDelete(resume.id, resume.title)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>My Cover Letters</h2>
        </div>
        <div className="empty-state">
          <p>The cover letter builder is coming in a future step.</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>My Purchases</h2>
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

      <div className="section">
        <div className="section-header">
          <h2>Account</h2>
        </div>
        <div className="nav-list">
          <Link to="/account">Account / Profile</Link>
          <Link to="/help">Help</Link>
        </div>
      </div>
    </div>
  )
}
