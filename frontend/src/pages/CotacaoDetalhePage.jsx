import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { SummaryCard } from '../components/ui/SummaryCard'
import { useSistemaCompras } from '../context/comprasContext'
import {
  cotacaoFornecedorTotal,
  cotacaoNumero,
  fornecedorNome,
  formatCurrency,
  statusText,
} from '../utils/formatters'

export default function CotacaoDetalhePage() {
  const { id } = useParams()
  const { cotacoes, navigateToTab } = useSistemaCompras()
  const cotacao = cotacoes.find((item) => Number(item.id) === Number(id))

  if (!cotacao) {
    return (
      <div className="page-section">
        <EmptyState text="Cotacao nao encontrada nos dados carregados." />
      </div>
    )
  }

  return (
    <div className="page-section">
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Cotacao {cotacaoNumero(cotacao)}</h2>
            <span>Rodada {cotacao.numero_rodada || 1}</span>
          </div>
          <StatusBadge value={cotacao.status} />
        </div>
        <SummaryCard
          rows={[
            ['Solicitacao', cotacaoNumero(cotacao)],
            ['Status', statusText(cotacao.status)],
            ['Fornecedores', (cotacao.fornecedores || []).length],
          ]}
        />
        <div className="form-actions">
          <button type="button" onClick={() => navigateToTab('retorno-cotacao')}>
            Registrar retorno
          </button>
          <button type="button" className="primary" onClick={() => navigateToTab('aprovar-cotacao')}>
            Aprovar cotacao
          </button>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Fornecedores</h2>
          <span>{(cotacao.fornecedores || []).length} convidados</span>
        </div>
        <div className="response-history">
          {(cotacao.fornecedores || []).map((fornecedor) => (
            <article className="response-card" key={fornecedor.id}>
              <div>
                <StatusBadge value={fornecedor.status} />
                <span>{fornecedorNome(fornecedor)}</span>
              </div>
              <span>{fornecedor.prazo_entrega || '-'}</span>
              <b>{formatCurrency(cotacaoFornecedorTotal(fornecedor))}</b>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
