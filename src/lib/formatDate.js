export function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}
