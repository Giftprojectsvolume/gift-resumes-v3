import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Pricing() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('product_type', 'addon')
        .order('price_cents', { ascending: true })
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div style={{ padding: 24 }}>Loading pricing…</div>
  }

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Pricing</h1>
      <p>Build and edit your CV for free. Pay once you're ready to download a polished PDF.</p>

      <div className="section">
        {products.map((product) => (
          <div className="card list-card" key={product.id}>
            <div className="resume-title">{product.name}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0' }}>
              R{(product.price_cents / 100).toFixed(2)}
              {product.product_type === 'subscription' && (
                <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink-soft)' }}>/year</span>
              )}
            </div>
            <p>{product.description}</p>

            {product.product_type === 'subscription' ? (
              <span className="badge">Coming soon</span>
            ) : (
              <Link to="/dashboard" className="btn-secondary">
                Open a CV to purchase
              </Link>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
        Once-off purchases apply to one CV. Open that CV's Preview screen to complete the purchase there.
      </p>
    </div>
  )
}
