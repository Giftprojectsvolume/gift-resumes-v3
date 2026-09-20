import RepeatableCardSection from './RepeatableCardSection'

const FIELDS = [
  { name: 'institution', label: 'Institution', type: 'text' },
  { name: 'qualification', label: 'Qualification', type: 'text' },
  { name: 'start_year', label: 'Start year (optional)', type: 'number', placeholder: 'e.g. 2018' },
  { name: 'end_year', label: 'End year (optional)', type: 'number', placeholder: 'e.g. 2021' },
  { name: 'details', label: 'Details (optional)', type: 'textarea' },
]

export default function EducationSection({ resumeId }) {
  return (
    <RepeatableCardSection
      resumeId={resumeId}
      table="education"
      fields={FIELDS}
      emptyRow={{ institution: '', qualification: '' }}
      summaryFn={(row) => [row.qualification, row.institution].filter(Boolean).join(' — ') || 'New qualification'}
      addLabel="+ Add education"
      title="Education"
      helpText="Add your schooling or qualifications. Years are optional."
    />
  )
}
