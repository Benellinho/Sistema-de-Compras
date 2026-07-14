export function Alert({ children, tone = 'success' }) {
  const className = tone === 'success' ? 'success-message' : `${tone}-message`

  return <div className={className} role="status">{children}</div>
}
