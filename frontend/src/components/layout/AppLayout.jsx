import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }) {
  return (
    <main className="app-shell">
      <Sidebar />
      <section className="workspace">
        <Navbar />
        {children}
      </section>
    </main>
  )
}
