const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--paper-raised)',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  fontSize: '16px',
}

export default function EntryFields({ fields, row, onChange }) {
  return (
    <>
      {fields.map((f) => {
        if (f.hideWhen && f.hideWhen(row)) return null

        if (f.type === 'checkbox') {
          return (
            <label
              key={f.name}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-4)' }}
            >
              <input
                type="checkbox"
                checked={!!row[f.name]}
                onChange={(e) => onChange(f.name, e.target.checked)}
                style={{ width: 20, height: 20 }}
              />
              <span>{f.label}</span>
            </label>
          )
        }

        if (f.type === 'select') {
          return (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              <select value={row[f.name] || ''} onChange={(e) => onChange(f.name, e.target.value)} style={inputStyle}>
                <option value="">Select…</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )
        }

        if (f.type === 'textarea') {
          return (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              <textarea
                rows={f.rows || 3}
                value={row[f.name] || ''}
                onChange={(e) => onChange(f.name, e.target.value)}
                placeholder={f.placeholder}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )
        }

        return (
          <div className="field" key={f.name}>
            <label>{f.label}</label>
            <input
              type={f.type || 'text'}
              value={row[f.name] || ''}
              onChange={(e) => onChange(f.name, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        )
      })}
    </>
  )
}
