import RepeatableCardSection from './RepeatableCardSection'

const FIELDS = [
  { name: 'ref_name', label: 'Name', type: 'text' },
  { name: 'position', label: 'Position (optional)', type: 'text' },
  { name: 'company', label: 'Company (optional)', type: 'text' },
  { name: 'contact_info', label: 'Contact info (optional)', type: 'text' },
]

export default function ReferencesSection({ resumeId, form, onChange }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-5)' }}>
        <input
          type="checkbox"
          checked={!!form.references_available_on_request}
          onChange={(e) => onChange('references_available_on_request', e.target.checked)}
          style={{ width: 20, height: 20 }}
        />
        <span>References available on request (instead of listing them)</span>
      </label>

      <RepeatableCardSection
        resumeId={resumeId}
        table="references"
        fields={FIELDS}
        emptyRow={{ ref_name: '' }}
        summaryFn={(row) => row.ref_name || 'New reference'}
        addLabel="+ Add reference"
        title="References"
        helpText="Optional — list references directly, or tick the box above instead."
      />
    </div>
  )
}
