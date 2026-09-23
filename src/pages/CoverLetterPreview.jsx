import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { COVER_LETTER_TEMPLATE_REGISTRY, getCoverLetterTemplateBySlug } from '../coverLetterTemplates/coverLetterTemplateRegistry'
import CoverLetterDocument from '../coverLetterTemplates/CoverLetterDocument'
import { useA4Preview, A4_WIDTH, A4_HEIGHT } from '../lib/useA4Preview'
import '../styles/cover-letter-templates.css'
import '../styles/preview.css'

export default function CoverLetterPreview() {
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
    const [letterRes, templatesRes] = await Promise.all([
      supabase.from('cover_letters').select('*, templates(slug)').eq('id', id).single(),
      supabase.from('templates').select('id, slug, name, sort_order').eq('type', 'cover_letter').order('sort_order'),
    ])

    if (letterRes.error || !letterRes.data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let linkedResume = null
    if (letterRes.data.resume_id) {
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('full_name, city, phone, email')
        .eq('id', letterRes.data.resume_id)
        .single()
      linkedResume = resumeData || null
    }

    setTemplateSlug(letterRes.data.templates?.slug || null)
    setTemplateRows(templatesRes.data || [])
    setData({ ...letterRes.data, linkedResume })
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSelectTemplate(templateRowId) {
    setSwitching(true)
    await supabase.from('cover_letters').update({ template_id: templateRowId }).eq('id', id)
    await load()
    setSwitching(false)
  }

  function handleDownloadPDF() {
    const safeName = (data.linkedResume?.full_name || data.title || 'My Cover Letter').trim().replace(/[^\w\s-]/g, '')
    const previousTitle = document.title
    document.title = `${safeName} Cover Letter`
    window.print()
    setTimeout(() => {
      document.title = previousTitle
    }, 1000)
  }

  if (notFound) {
    return (
      <div className="page">
        <p>We couldn't find that cover letter — it may have been deleted, or it belongs to a different account.</p>
        <Link to="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (loading || !data) {
    return <div style={{ padding: 24 }}>Loading preview…</div>
  }

  const activeTemplate = getCoverLetterTemplateBySlug(templateSlug)

  return (
    <div>
      <div className="no-print">
        <div className="preview-topbar">
          <Link to={`/cover-letter/${id}/edit`} className="back-link">
            ← Editor
          </Link>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {pageCount} page{pageCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="template-picker">
          {COVER_LETTER_TEMPLATE_REGISTRY.map((tpl) => {
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
                <CoverLetterDocument data={data} template={activeTemplate} />
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

      <div className="print-only-cl">
        <CoverLetterDocument data={data} template={activeTemplate} />
      </div>
    </div>
  )
}
