import RepeatableCardSection from './RepeatableCardSection'

const FIELDS = [
  { name: 'language', label: 'Language', type: 'text' },
  {
    name: 'proficiency',
    label: 'Proficiency',
    type: 'select',
    options: ['Basic', 'Conversational', 'Fluent', 'Professional', 'Native'],
  },
]

export default function LanguagesSection({ resumeId }) {
  return (
    <RepeatableCardSection
      resumeId={resumeId}
      table="languages"
      fields={FIELDS}
      emptyRow={{ language: '', proficiency: '' }}
      summaryFn={(row) => [row.language, row.proficiency].filter(Boolean).join(' — ') || 'New language'}
      addLabel="+ Add language"
      title="Languages"
      helpText="Optional — add any languages you speak and how well."
    />
  )
}
