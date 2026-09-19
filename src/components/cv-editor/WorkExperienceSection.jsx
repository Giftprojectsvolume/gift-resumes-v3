import RepeatableCardSection from './RepeatableCardSection'

const FIELDS = [
  { name: 'employer', label: 'Employer', type: 'text' },
  { name: 'job_title', label: 'Job title', type: 'text' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'is_current', label: 'I currently work here', type: 'checkbox' },
  { name: 'end_date', label: 'End date', type: 'date', hideWhen: (row) => row.is_current },
  { name: 'responsibilities', label: 'Responsibilities', type: 'textarea' },
  { name: 'achievements', label: 'Achievements (optional)', type: 'textarea' },
]

export default function WorkExperienceSection({ resumeId }) {
  return (
    <RepeatableCardSection
      resumeId={resumeId}
      table="work_experience"
      fields={FIELDS}
      emptyRow={{ employer: '', job_title: '', is_current: false }}
      summaryFn={(row) => [row.job_title, row.employer].filter(Boolean).join(' at ') || 'New role'}
      addLabel="+ Add work experience"
      title="Work Experience"
      helpText="Add as many roles as apply. It's fine to leave this empty if you're just starting out."
    />
  )
}
