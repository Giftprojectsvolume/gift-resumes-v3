import RepeatableCardSection from './RepeatableCardSection'

const FIELDS = [
  { name: 'certificate_name', label: 'Certificate name', type: 'text' },
  { name: 'institution', label: 'Institution (optional)', type: 'text' },
  { name: 'cert_date', label: 'Date (optional)', type: 'date' },
  { name: 'details', label: 'Details (optional)', type: 'textarea' },
]

export default function CertificationsSection({ resumeId }) {
  return (
    <RepeatableCardSection
      resumeId={resumeId}
      table="certifications"
      fields={FIELDS}
      emptyRow={{ certificate_name: '' }}
      summaryFn={(row) => row.certificate_name || 'New certificate'}
      addLabel="+ Add certificate"
      title="Certifications"
      helpText="Optional — add any certificates or short courses relevant to the role."
    />
  )
}
