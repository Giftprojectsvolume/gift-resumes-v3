import { Link } from 'react-router-dom'

export default function Help() {
  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: '22px' }}>Help</h1>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: '16px' }}>Need help?</h2>
        <p>Email us and we'll get back to you as soon as we can:</p>
        <p style={{ fontWeight: 600 }}>support@giftresumes.co.za</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '16px' }}>Common questions</h2>
        <p>
          <strong>Why can't I download my CV as a PDF?</strong>
          <br />
          Creating and editing a CV is free. Downloading the finished PDF is a once-off purchase — see Pricing for
          current package prices.
        </p>
        <p>
          <strong>Does editing cost extra after I've purchased a CV?</strong>
          <br />
          No. Once you've unlocked a CV, you can edit and re-download it as many times as you like, for free.
        </p>
      </div>
    </div>
  )
}
