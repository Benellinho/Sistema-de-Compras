export function ActionScreen({ title, subtitle, endpoint, children }) {
  return (
    <div className="page-section">
      <section className="action-header">
        <div>
          <span className="eyebrow">Tela de acao</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <code>{endpoint}</code>
      </section>
      {children}
    </div>
  )
}
