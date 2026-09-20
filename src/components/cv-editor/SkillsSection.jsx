import { useState } from 'react'
import { useRepeatableSection } from '../../lib/useRepeatableSection'

export default function SkillsSection({ resumeId }) {
  const { rows, loading, status, addRow, deleteRow } = useRepeatableSection(resumeId, 'skills', { skill_name: '' })
  const [input, setInput] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const value = input.trim()
    if (!value) return
    await addRow({ skill_name: value })
    setInput('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: '18px' }}>Skills</h2>
        <span className={`save-status ${status}`}>
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && 'Saved'}
        </span>
      </div>
      <p>Add as many as apply — optional, and quick to add or remove.</p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Customer service"
          style={{ flex: 1 }}
        />
        <button type="submit" className="action-btn" style={{ width: 'auto', padding: '0 18px' }}>
          Add
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <p>No skills added yet — that's fine.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {rows.map((row) => (
            <span className="skill-chip" key={row.id}>
              {row.skill_name}
              <button onClick={() => deleteRow(row.id)} aria-label={`Remove ${row.skill_name}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
