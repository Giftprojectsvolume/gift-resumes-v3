function formatToday() {
  return new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CoverLetterDocument({ data, template }) {
  const senderName = data.linkedResume?.full_name
  const senderContact = data.linkedResume
    ? [data.linkedResume.city, data.linkedResume.phone, data.linkedResume.email].filter(Boolean).join('  ·  ')
    : ''

  return (
    <div className={`cl-page ${template.className}`}>
      {(senderName || senderContact) && (
        <div className="cl-header">
          {senderName && <div className="cl-sender-name">{senderName}</div>}
          {senderContact && <div className="cl-sender-contact">{senderContact}</div>}
        </div>
      )}

      <div className="cl-date">{formatToday()}</div>

      <div className="cl-body">{data.content || 'Start writing your cover letter in the editor.'}</div>
    </div>
  )
}
