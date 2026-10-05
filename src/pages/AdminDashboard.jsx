import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/formatDate'

export default function AdminDashboard() {
  const { session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // Same simple, proven pattern the regular Dashboard already
        // uses to read your own profile — nothing new, nothing risky.
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

        const [usersRes, purchasesRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }),
          supabase
            .from('purchases')
            .select('id, amount_cents, status, created_at, user_id, products(name)')
            .order('created_at', { ascending: false }),
        ])

        if (usersRes.error) setErrorMsg((prev) => prev + ` Users: ${usersRes.error.message}.`)
        if (purchasesRes.error) setErrorMsg((prev) => prev + ` Purchases: ${purchasesRes.error.message}.`)

        setUsers(usersRes.data || [])
        setPurchases(purchasesRes.data || [])
        setLoading(false)
      } catch (err) {
        setErrorMsg(`Unexpected error: ${err.message}`)
        setLoading(false)
      }
    }

    load()
  }, [session.user.id])

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
