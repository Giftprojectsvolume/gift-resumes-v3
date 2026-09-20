import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { TEMPLATE_REGISTRY, getTemplateBySlug } from '../templates/templateRegistry'
import CVDocument from '../templates/CVDocument'
import { useA4Preview, A4_WIDTH, A4_HEIGHT } from '../lib/useA4Preview'
import '../styles/cv-templates.css'
import '../styles/preview.css'

export default function CVPreview() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [templateSlug, setTemplateSlug] = useState(null)
  const [templateRows, setTemplateRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [switching, setSwitching] = useState(false)

  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const { scale, contentHeight, pageCount } = useA4Preview(containerRef, contentRef)

  const load = useCallback(async () => {
    setLoading(true)
    const [resumeRes, workRes, eduRes, skillsRes, certRes, langRes, refRes, templatesRes] = await Promise.all([
      supabase.from('resumes').select('*, templates(slug)').eq('id', id).single(),
      supabase.from('work_experience').select('*').eq('resume_id', id).order('sort_order'),
      supabase.from('education').select('*').eq('resume_id', id).order('sort_order'),
      supabase.from('skills').select('*').eq('resume_id', id).order('sort_order'),
      supabase.from('certifications').select('*').eq('resume_id', id).order('sort_order'),
      supabase.from('languages').select('*').eq('resume_id', id).order('sort_order'),
      supabase.from('references').select('*').eq('resume_id', id).order('sort_order'),
      supabase.from('templates').select('id, slug, name, sort_order').eq('type', 'cv').order('sort_order'),
    ])

    if (resumeRes.error || !resumeRes.data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setTemplateSlug(resumeRes.data.templates?.slug || null)
    setTemplateRows(templatesRes.data || [])
    setData({
      ...resumeRes.data,
      workExperience: workRes.data || [],
      education: eduRes.data || [],
      skills: skillsRes.data || [],
      certifications: certRes.data || [],
      languages: langRes.data || [],
      references: refRes.data || [],
    })
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSelectTemplate(templateRowId) {
    setSwitching(true)
    await supabase.from('resumes').update({ template_id: templateRowId }).eq('id', id)
    await load()
    setSwitching(false)
  }

  function handleDownloadPDF() {
    const safeName = (data.full_name || data.title || 'My CV').trim().replace(/[^\w\s-]/g, '')
    const previousTitle = document.title
    document.title = `${safeName} CV`
    window.print()
    setTimeout(() => {
      document.title = previousTitle
    }, 1000)
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

  if (loading || !data) {
    return <div style={{ padding: 24 }}>Loading preview…</div>
  }

  const activeTemplate = getTemplateBySlug(templateSlug)

  return (
    <div>
      <div className="no-print">
        <div className="preview-topbar">
          <Link to={`/resume/${id}/edit`} className="back-link">
            ← Editor
          </Link>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {pageCount} page{pageCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="template-picker">
          {TEMPLATE_REGISTRY.map((tpl) => {
            const row = templateRows.find((r) => r.slug === tpl.slug)
            const isActive = tpl.slug === activeTemplate.slug
            return (
              <button
                key={tpl.slug}
                className={`template-swatch ${isActive ? 'active' : ''}`}
                disabled={!row || switching}
                onClick={() => row && handleSelectTemplate(row.id)}
              >
                <span className={`swatch-preview ${tpl.className}`} />
                <span className="swatch-label">{tpl.name}</span>
              </button>
            )
          })}
        </div>

        <div className="preview-viewport" ref={containerRef}>
          <div className="preview-scaler" style={{ width: A4_WIDTH * scale, height: contentHeight * scale }}>
            <div className="preview-inner" style={{ width: A4_WIDTH, transform: `scale(${scale})` }}>
              <div ref={contentRef}>
                <CVDocument data={data} template={activeTemplate} />
              </div>
              {Array.from({ length: pageCount - 1 }).map((_, i) => (
                <div key={i} className="page-break-marker" style={{ top: (i + 1) * A4_HEIGHT }}>
                  <span>Page {i + 2}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="download-pdf-block">
          <button className="btn-primary" onClick={handleDownloadPDF}>
            Download PDF
          </button>
          <p className="download-pdf-hint">
            Your browser's Print screen will open next — choose <strong>Save as PDF</strong> as the printer/destination,
            then Save or Download to get your file.
          </p>
        </div>
      </div>

      <div className="print-only-cv">
        <CVDocument data={data} template={activeTemplate} />
      </div>
    </div>
  )
}
