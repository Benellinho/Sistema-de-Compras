import { Alert } from '../ui/Alert'
import { useSistemaCompras } from '../../context/comprasContext'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }) {
  const { actionFeedback } = useSistemaCompras()

  return (
    <main className="app-shell">
      <Sidebar />
      <section className="workspace">
        <Navbar />
        {actionFeedback && <Alert>{actionFeedback}</Alert>}
        {children}
      </section>
    </main>
  )
}
