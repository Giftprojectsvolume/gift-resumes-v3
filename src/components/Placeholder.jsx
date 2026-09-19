export default function Placeholder({ title, message }) {
  return (
    <div style={{ padding: '24px 20px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px' }}>{title}</h1>
      <p>{message || 'This part of Gift Resumes is coming in a future step.'}</p>
    </div>
  )
}
