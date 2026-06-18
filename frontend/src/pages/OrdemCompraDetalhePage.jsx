import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { SummaryCard } from '../components/ui/SummaryCard'
import { useSistemaCompras } from '../context/comprasContext'
import { fornecedorNome, formatCurrency, ordemTotal, statusText } from '../utils/formatters'

export default function OrdemCompraDetalhePage() {
  const { id } = useParams()
  const { ordensCompra } = useSistemaCompras()
  const ordem = ordensCompra.find((item) => Number(item.id) === Number(id))

  if (!ordem) {
    return (
      <div className="page-section">
        <EmptyState text="Ordem de compra nao encontrada nos dados carregados." />
      </div>
    )
  }

  return (
    <div className="page-section">
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Ordem de compra {ordem.id}</h2>
            <span>{fornecedorNome(ordem)}</span>
          </div>
          <StatusBadge value={ordem.status} />
        </div>
        <SummaryCard
          rows={[
            ['Status', statusText(ordem.status)],
            ['Envio', statusText(ordem.envios?.[0]?.status || 'PENDENTE')],
            ['Total', formatCurrency(ordemTotal(ordem))],
          ]}
        />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Itens</h2>
          <span>{(ordem.itens || []).length} registros</span>
        </div>
        {(ordem.itens || []).length > 0 ? (
          <div className="classification-items">
            {(ordem.itens || []).map((item) => (
              <div className="classification-item-row" key={item.id}>
                <div>
                  <strong>{item.item_descricao || item.descricao || 'Item'}</strong>
                  <span>{Number(item.quantidade_pedida || item.quantidade || 0)}</span>
                </div>
                <strong>{formatCurrency(item.valor_total)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Nenhum item carregado para esta ordem." />
        )}
      </section>
    </div>
  )
}
