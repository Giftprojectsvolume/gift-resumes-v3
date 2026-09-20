export default function SummarySection({ form, onChange }) {
  return (
    <div>
      <h2 style={{ fontSize: '18px' }}>Professional Summary</h2>
      <p>Write this in your own words — a few sentences about your experience and what you're looking for.</p>
      <div className="field">
        <label htmlFor="professional_summary">Summary</label>
        <textarea
          id="professional_summary"
          rows={6}
          value={form.professional_summary || ''}
          onChange={(e) => onChange('professional_summary', e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--paper-raised)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
            fontSize: '16px',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  )
}
