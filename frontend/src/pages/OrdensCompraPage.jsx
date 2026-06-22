import { StatusBadge } from '../components/ui/StatusBadge'
import { TableSection } from '../components/ui/Table'
import { formatCurrency } from '../utils/formatters'
import { useSistemaCompras } from '../context/comprasContext'

export default function OrdensCompraPage() {
  const { ordemRows } = useSistemaCompras()

  return (
    <div className="page-section">
      <TableSection
        title="Ordens de compra"
        subtitle="Ordens geradas para envio"
        rows={ordemRows}
        columns={[
          ['numero', 'Numero'],
          ['fornecedor', 'Fornecedor'],
          ['total', 'Total', formatCurrency],
          ['status', 'Status', StatusBadge],
          ['envio', 'Envio', StatusBadge],
        ]}
      />
    </div>
  )
}
