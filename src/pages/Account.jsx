import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [aiCredits, setAiCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')

  useEffect(() => {
    async function load() {
      const [profileRes, creditsRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', session.user.id).single(),
        supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', session.user.id)
          .eq('credit_type', 'ai_improvement')
          .maybeSingle(),
      ])

      if (profileRes.data) setFullName(profileRes.data.full_name || '')
      setAiCredits(creditsRes.data?.balance ?? 0)
      setLoading(false)
    }
    load()
  }, [session.user.id])

  async function handleSave() {
    setSaveStatus('saving')
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', session.user.id)
    setSaveStatus(error ? 'error' : 'saved')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Account</h1>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={session.user.email} disabled style={{ opacity: 0.7 }} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={handleSave} style={{ marginTop: 'var(--space-3)' }}>
          {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        {saveStatus === 'saved' && <p style={{ fontSize: 13, marginTop: 6 }}>Saved.</p>}
        {saveStatus === 'error' && <p className="error-text">Could not save — please try again.</p>}
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="resume-title">AI Improvement Credits</div>
        <p style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 0' }}>{aiCredits}</p>
      </div>

      <button className="btn-secondary" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  )
}
