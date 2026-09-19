import { useState } from 'react'
import { useRepeatableSection } from '../../lib/useRepeatableSection'
import EntryFields from './EntryFields'

export default function RepeatableCardSection({
  resumeId,
  table,
  fields,
  emptyRow,
  summaryFn,
  addLabel,
  title,
  helpText,
}) {
  const { rows, loading, status, addRow, updateRow, deleteRow, moveRow } = useRepeatableSection(
    resumeId,
    table,
    emptyRow
  )
  const [expandedId, setExpandedId] = useState(null)

  async function handleAdd() {
    const newRow = await addRow()
    if (newRow) setExpandedId(newRow.id)
  }

  async function handleDelete(row) {
    const confirmed = window.confirm("Delete this entry? This can't be undone.")
    if (!confirmed) return
    await deleteRow(row.id)
  }

  function handleFieldChange(row, name, value) {
    if (name === 'is_current' && value) {
      updateRow(row.id, { is_current: true, end_date: null })
    } else {
      updateRow(row.id, { [name]: value })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: '18px' }}>{title}</h2>
        <span className={`save-status ${status}`}>
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && 'Saved'}
          {status === 'error' && "Couldn't save"}
        </span>
      </div>
      {helpText && <p>{helpText}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <p>Nothing added yet — that's fine, this section is optional.</p>
        </div>
      ) : (
        rows.map((row, index) => {
          const isOpen = expandedId === row.id
          return (
            <div className="card list-card" key={row.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isOpen ? null : row.id)}
              >
                <span style={{ fontWeight: 600 }}>{summaryFn(row)}</span>
                <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{isOpen ? 'Hide' : 'Edit'}</span>
              </div>

              {isOpen && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <EntryFields fields={fields} row={row} onChange={(name, value) => handleFieldChange(row, name, value)} />
                </div>
              )}

              <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <button className="action-btn" disabled={index === 0} onClick={() => moveRow(row.id, 'up')}>
                  ↑ Up
                </button>
                <button
                  className="action-btn"
                  disabled={index === rows.length - 1}
                  onClick={() => moveRow(row.id, 'down')}
                >
                  ↓ Down
                </button>
                <button className="action-btn danger" onClick={() => handleDelete(row)}>
                  Delete
                </button>
              </div>
            </div>
          )
        })
      )}

      <button className="btn-secondary" onClick={handleAdd} style={{ marginTop: 'var(--space-3)' }}>
        {addLabel}
      </button>
    </div>
  )
}
