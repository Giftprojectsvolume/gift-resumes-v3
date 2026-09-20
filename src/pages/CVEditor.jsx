import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useDebouncedResumeSave } from '../lib/useDebouncedResumeSave'
import PersonalInfoSection from '../components/cv-editor/PersonalInfoSection'
import SummarySection from '../components/cv-editor/SummarySection'
import WorkExperienceSection from '../components/cv-editor/WorkExperienceSection'
import EducationSection from '../components/cv-editor/EducationSection'
import SkillsSection from '../components/cv-editor/SkillsSection'
import CertificationsSection from '../components/cv-editor/CertificationsSection'
import LanguagesSection from '../components/cv-editor/LanguagesSection'
import ReferencesSection from '../components/cv-editor/ReferencesSection'

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', Component: PersonalInfoSection },
  { id: 'summary', label: 'Summary', Component: SummarySection },
  { id: 'experience', label: 'Work Experience', Component: WorkExperienceSection },
  { id: 'education', label: 'Education', Component: EducationSection },
  { id: 'skills', label: 'Skills', Component: SkillsSection },
  { id: 'certifications', label: 'Certifications', Component: CertificationsSection },
  { id: 'languages', label: 'Languages', Component: LanguagesSection },
  { id: 'references', label: 'References', Component: ReferencesSection },
]

export default function CVEditor() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const { save, status, flush } = useDebouncedResumeSave(id)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setNotFound(true)
          return
        }
        setForm(data)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    save({ [field]: value })
  }

  function handleTitleChange(e) {
    handleFieldChange('title', e.target.value)
  }

  if (notFound) {
    return (
      <div className="page">
        <p>We couldn't find that CV — it may have been deleted, or it belongs to a different account.</p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!form) {
    return <div style={{ padding: 24 }}>Loading your CV…</div>
  }

  const ActiveComponent = SECTIONS.find((s) => s.id === activeSection).Component

  return (
    <div className="page">
      <div className="editor-header">
        <Link to="/dashboard" className="back-link" onClick={flush}>
          ← Dashboard
        </Link>
        <span className={`save-status ${status}`}>
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && 'Saved'}
          {status === 'error' && "Couldn't save"}
        </span>
      </div>

      <input
        className="title-input"
        value={form.title || ''}
        onChange={handleTitleChange}
        aria-label="CV title"
        placeholder="Untitled CV"
      />

      <div className="tab-row">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`tab-pill ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '-8px', marginBottom: 'var(--space-4)' }}>
        Section {SECTIONS.findIndex((s) => s.id === activeSection) + 1} of {SECTIONS.length}
      </p>

      <div className="card">
        <ActiveComponent form={form} onChange={handleFieldChange} resumeId={id} />
      </div>
    </div>
  )
}
