import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { COVER_LETTER_TEMPLATE_REGISTRY, getCoverLetterTemplateBySlug } from '../coverLetterTemplates/coverLetterTemplateRegistry'
import CoverLetterDocument from '../coverLetterTemplates/CoverLetterDocument'
import PurchaseButton from '../components/PurchaseButton'
import { useA4Preview, A4_WIDTH, A4_HEIGHT } from '../lib/useA4Preview'
import '../styles/cover-letter-templates.css'
import '../styles/preview.css'

export default function CoverLetterPreview() {
  const { id } = useParams()
  const { session } = useAuth()
  const [data, setData] = useState(null)
  const [templateSlug, setTemplateSlug] = useState(null)
  const [templateRows, setTemplateRows] = useState([])
  const [bundleProduct, setBundleProduct] = useState(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [switching, setSwitching] = useState(false)

  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const { scale, contentHeight, pageCount } = useA4Preview(containerRef, contentRef)

  const load = useCallback(async () => {
    setLoading(true)
    const [letterRes, templatesRes, productRes] = await Promise.all([
      supabase.from('cover_letters').select('*, templates(slug)').eq('id', id).single(),
      supabase.from('templates').select('id, slug, name, sort_order').eq('type', 'cover_letter').order('sort_order'),
      supabase.from('products').select('id, price_cents').eq('name', 'CV + Cover Letter').eq('is_active', true).single(),
    ])

    if (letterRes.error || !letterRes.data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let linkedResume = null
    let purchased = false

    if (letterRes.data.resume_id) {
      const [resumeRes, purchasedRes] = await Promise.all([
        supabase.from('resumes').select('full_name, city, phone, email').eq('id', letterRes.data.resume_id).single(),
        supabase.rpc('has_purchased_feature', {
          p_user_id: session.user.id,
          p_resume_id: letterRes.data.resume_id,
          p_feature: 'cover_letter_pdf',
        }),
      ])
      linkedResume = resumeRes.data || null
      purchased = purchasedRes.data === true
    }

    setTemplateSlug(letterRes.data.templates?.slug || null)
    setTemplateRows(templatesRes.data || [])
    setBundleProduct(productRes.data || null)
    setHasPurchased(purchased)
    setData({ ...letterRes.data, linkedResume })
    setLoading(false)
  }, [id, session.user.id])

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
          {hasPurchased ? (
            <>
              <button className="btn-primary" onClick={handleDownloadPDF}>
                Download PDF
              </button>
              <p className="download-pdf-hint">
                Your browser's Print screen will open next — choose <strong>Save as PDF</strong> as the
                printer/destination, then Save or Download to get your file.
              </p>
            </>
          ) : !data.resume_id ? (
            <p className="download-pdf-hint">
              Link this cover letter to a CV in the editor first — the CV + Cover Letter package (R99) covers both
              together.
            </p>
          ) : bundleProduct ? (
            <>
              <PurchaseButton
                productId={bundleProduct.id}
                priceCents={bundleProduct.price_cents}
                label="Unlock CV + Cover Letter PDFs"
                resumeId={data.resume_id}
                onPurchased={load}
              />
              <p className="download-pdf-hint">
                One payment unlocks unlimited editing and downloading of both this CV and this cover letter.
              </p>
            </>
          ) : (
            <p className="download-pdf-hint">PDF download is not available right now. Please try again shortly.</p>
          )}
        </div>
      </div>

      {hasPurchased && (
        <div className="print-only-cl">
          <CoverLetterDocument data={data} template={activeTemplate} />
        </div>
      )}
    </div>
  )
}
