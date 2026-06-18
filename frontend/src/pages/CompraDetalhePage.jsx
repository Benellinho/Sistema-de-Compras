import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { SummaryCard } from '../components/ui/SummaryCard'
import { useSistemaCompras } from '../context/comprasContext'
import {
  compraNumero,
  compraTotal,
  fornecedorNome,
  formatCurrency,
  statusText,
} from '../utils/formatters'

export default function CompraDetalhePage() {
  const { id } = useParams()
  const { compras, navigateToTab } = useSistemaCompras()
  const compra = compras.find((item) => Number(item.id) === Number(id))

  if (!compra) {
    return (
      <div className="page-section">
        <EmptyState text="Compra nao encontrada nos dados carregados." />
      </div>
    )
  }

  return (
    <div className="page-section">
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Compra {compraNumero(compra)}</h2>
            <span>{compra.criado_por_nome || 'Responsavel nao informado'}</span>
          </div>
          <StatusBadge value={compra.status} />
        </div>
        <SummaryCard
          rows={[
            ['Solicitacao', compraNumero(compra)],
            ['Status', statusText(compra.status)],
            ['Total', formatCurrency(compraTotal(compra))],
          ]}
        />
        <div className="form-actions">
          <button type="button" className="primary" onClick={() => navigateToTab('compras')}>
            Gerar ordem de compra
          </button>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Fornecedores</h2>
          <span>{(compra.fornecedores || []).length} registros</span>
        </div>
        <div className="response-history">
          {(compra.fornecedores || []).map((fornecedor) => (
            <article className="response-card" key={fornecedor.id}>
              <div>
                <StatusBadge value={fornecedor.status || compra.status} />
                <span>{fornecedorNome(fornecedor)}</span>
              </div>
              <span>{fornecedor.prazo_entrega || '-'}</span>
              <b>{formatCurrency(compraTotal({ fornecedores: [fornecedor] }))}</b>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
