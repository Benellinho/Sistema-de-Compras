export function Loading({ text = 'Carregando...' }) {
  return (
    <span className="button-content">
      <span className="message-spinner" aria-hidden="true" />
      <span>{text}</span>
    </span>
  )
}
