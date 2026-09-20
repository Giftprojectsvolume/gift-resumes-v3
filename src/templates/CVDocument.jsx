import { formatCVDate } from '../lib/formatCVDate'

function PersonalHeader({ data }) {
  return (
    <div className="cv-header">
      <h1 className="cv-name">{data.full_name || 'Your Name'}</h1>
      <div className="cv-contact-line">
        {[data.city, data.phone, data.email, data.linkedin_url].filter(Boolean).join('  ·  ')}
      </div>
    </div>
  )
}

function SectionHeading({ children }) {
  return <h2 className="cv-section-title">{children}</h2>
}

function SummaryBlock({ data }) {
  if (!data.professional_summary) return null
  return (
    <section className="cv-section">
      <SectionHeading>Professional Summary</SectionHeading>
      <p className="cv-summary-text">{data.professional_summary}</p>
    </section>
  )
}

function ExperienceBlock({ data }) {
  if (!data.workExperience || data.workExperience.length === 0) return null
  return (
    <section className="cv-section">
      <SectionHeading>Work Experience</SectionHeading>
      {data.workExperience.map((job) => (
        <div className="cv-entry" key={job.id}>
          <div className="cv-entry-header">
            <span className="cv-entry-title">
              {job.job_title}
              {job.employer ? ` — ${job.employer}` : ''}
            </span>
            <span className="cv-entry-dates">
              {formatCVDate(job.start_date)}
              {job.start_date || job.end_date || job.is_current ? ' – ' : ''}
              {job.is_current ? 'Present' : formatCVDate(job.end_date)}
            </span>
          </div>
          {job.responsibilities && <p className="cv-entry-body">{job.responsibilities}</p>}
          {job.achievements && <p className="cv-entry-body">{job.achievements}</p>}
        </div>
      ))}
    </section>
  )
}

function EducationBlock({ data }) {
  if (!data.education || data.education.length === 0) return null
  return (
    <section className="cv-section">
      <SectionHeading>Education</SectionHeading>
      {data.education.map((edu) => (
        <div className="cv-entry" key={edu.id}>
          <div className="cv-entry-header">
            <span className="cv-entry-title">
              {edu.qualification}
              {edu.institution ? ` — ${edu.institution}` : ''}
            </span>
            <span className="cv-entry-dates">{[edu.start_year, edu.end_year].filter(Boolean).join(' – ')}</span>
          </div>
          {edu.details && <p className="cv-entry-body">{edu.details}</p>}
        </div>
      ))}
    </section>
  )
}

function SkillsBlock({ data }) {
  if (!data.skills || data.skills.length === 0) return null
  return (
    <section className="cv-section">
      <SectionHeading>Skills</SectionHeading>
      <div className="cv-skill-list">
        {data.skills.map((s) => (
          <span className="cv-skill-tag" key={s.id}>
            {s.skill_name}
          </span>
        ))}
      </div>
    </section>
  )
}

function CertificationsBlock({ data }) {
  if (!data.certifications || data.certifications.length === 0) return null
  return (
    <section className="cv-section">
      <SectionHeading>Certifications</SectionHeading>
      {data.certifications.map((c) => (
        <div className="cv-entry" key={c.id}>
          <div className="cv-entry-header">
            <span className="cv-entry-title">
              {c.certificate_name}
              {c.institution ? ` — ${c.institution}` : ''}
            </span>
            <span className="cv-entry-dates">{formatCVDate(c.cert_date)}</span>
          </div>
          {c.details && <p className="cv-entry-body">{c.details}</p>}
        </div>
      ))}
    </section>
  )
}

function LanguagesBlock({ data }) {
  if (!data.languages || data.languages.length === 0) return null
  return (
    <section className="cv-section">
      <SectionHeading>Languages</SectionHeading>
      <div className="cv-skill-list">
        {data.languages.map((l) => (
          <span className="cv-skill-tag" key={l.id}>
            {l.language}
            {l.proficiency ? ` (${l.proficiency})` : ''}
          </span>
        ))}
      </div>
    </section>
  )
}

function ReferencesBlock({ data }) {
  const hasList = data.references && data.references.length > 0
  if (!hasList && !data.references_available_on_request) return null
  return (
    <section className="cv-section">
      <SectionHeading>References</SectionHeading>
      {data.references_available_on_request && !hasList && <p className="cv-entry-body">Available on request.</p>}
      {hasList &&
        data.references.map((r) => (
          <div className="cv-entry" key={r.id}>
            <div className="cv-entry-header">
              <span className="cv-entry-title">{r.ref_name}</span>
            </div>
            <p className="cv-entry-body">{[r.position, r.company, r.contact_info].filter(Boolean).join(' · ')}</p>
          </div>
        ))}
    </section>
  )
}

const SECTION_COMPONENTS = {
  summary: SummaryBlock,
  experience: ExperienceBlock,
  education: EducationBlock,
  skills: SkillsBlock,
  certifications: CertificationsBlock,
  languages: LanguagesBlock,
  references: ReferencesBlock,
}

export default function CVDocument({ data, template }) {
  return (
    <div className={`cv-page ${template.className}`}>
      <PersonalHeader data={data} />
      {template.sectionOrder.map((key) => {
        const SectionComponent = SECTION_COMPONENTS[key]
        return SectionComponent ? <SectionComponent data={data} key={key} /> : null
      })}
    </div>
  )
}
