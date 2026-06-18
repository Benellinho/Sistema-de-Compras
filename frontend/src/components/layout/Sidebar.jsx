import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../utils/constants'
import { useSistemaCompras } from '../../context/comprasContext'
import { API_BASE_URL } from '../../config/api'

export function Sidebar() {
  const { actionLocked, apiStatus, navigateToTab } = useSistemaCompras()

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-mark">SC</span>
        <div>
          <strong>Sistema de Compras</strong>
          <span>Prototipo integrado ao backend</span>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Navegacao principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.screenId}
            to={item.path}
            onClick={(event) => {
              event.preventDefault()

              if (!actionLocked) {
                navigateToTab(item.screenId)
              }
            }}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            aria-disabled={actionLocked}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <section className="api-panel">
        <span className={`status-dot ${apiStatus.tone}`} />
        <div>
          <strong>{apiStatus.label}</strong>
          <span>{API_BASE_URL}</span>
        </div>
      </section>
    </aside>
  )
}
