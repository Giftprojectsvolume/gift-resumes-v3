export default function PersonalInfoSection({ form, onChange }) {
  return (
    <div>
      <h2 style={{ fontSize: '18px' }}>Personal Information</h2>
      <div className="field">
        <label htmlFor="full_name">Full name</label>
        <input
          id="full_name"
          type="text"
          value={form.full_name || ''}
          onChange={(e) => onChange('full_name', e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email || ''} onChange={(e) => onChange('email', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" type="tel" value={form.phone || ''} onChange={(e) => onChange('phone', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="city">City / location</label>
        <input id="city" type="text" value={form.city || ''} onChange={(e) => onChange('city', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="linkedin_url">LinkedIn (optional)</label>
        <input
          id="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/..."
          value={form.linkedin_url || ''}
          onChange={(e) => onChange('linkedin_url', e.target.value)}
        />
      </div>
    </div>
  )
}
