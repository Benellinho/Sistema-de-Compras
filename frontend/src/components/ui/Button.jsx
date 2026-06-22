export function Button({ children, className = '', ...props }) {
  return (
    <button className={className || undefined} {...props}>
      {children}
    </button>
  )
}

export function ButtonContent({ active, children }) {
  return (
    <span className="button-content">
      {active && <span className="button-spinner" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}
