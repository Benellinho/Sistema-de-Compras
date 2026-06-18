import { ListBlock } from '../components/ui/ListBlock'
import { useSistemaCompras } from '../context/comprasContext'

export default function UsuariosPage() {
  const { usuarios } = useSistemaCompras()

  return (
    <div className="page-section">
      <section className="catalog-grid">
        <ListBlock title="Usuarios" items={usuarios} />
      </section>
    </div>
  )
}
