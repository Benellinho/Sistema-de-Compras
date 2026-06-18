export function Modal({ children, isOpen }) {
  if (!isOpen) {
    return null
  }

  return <div className="modal">{children}</div>
}
