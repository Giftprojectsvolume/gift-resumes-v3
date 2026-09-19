export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
              color: 'var(--ink)',
              marginBottom: '4px',
            }}
          >
            Gift Resumes
          </div>
          <h1 style={{ fontSize: '26px' }}>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
