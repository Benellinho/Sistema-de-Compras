import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { SummaryCard } from '../components/ui/SummaryCard'
import { useSistemaCompras } from '../context/comprasContext'
import {
  itemSolicitacaoDescricao,
  solicitacaoCentroCusto,
  solicitacaoItens,
  solicitacaoNecessidade,
  solicitacaoNumero,
  solicitacaoSolicitante,
  solicitacaoUrgencia,
  statusText,
} from '../utils/formatters'

export default function SolicitacaoDetalhePage() {
  const { id } = useParams()
  const { solicitacoes, navigateToTab } = useSistemaCompras()
  const solicitacao = solicitacoes.find((item) => Number(item.id) === Number(id))

  if (!solicitacao) {
    return (
      <div className="page-section">
        <EmptyState text="Solicitacao nao encontrada nos dados carregados." />
      </div>
    )
  }

  const itens = solicitacaoItens(solicitacao)

  return (
    <div className="page-section">
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Solicitacao {solicitacaoNumero(solicitacao)}</h2>
            <span>{solicitacaoSolicitante(solicitacao)}</span>
          </div>
          <StatusBadge value={solicitacao.status} />
        </div>
        <SummaryCard
          rows={[
            ['Necessidade', solicitacaoNecessidade(solicitacao)],
            ['Urgencia', solicitacaoUrgencia(solicitacao) || '-'],
            ['Centro de custo', solicitacaoCentroCusto(solicitacao) || '-'],
            ['Status', statusText(solicitacao.status)],
          ]}
        />
        <div className="form-actions">
          <button type="button" onClick={() => navigateToTab('classificar-solicitacao')}>
            Classificar
          </button>
          <button type="button" className="primary" onClick={() => navigateToTab('enviar-cotacao')}>
            Enviar cotacao
          </button>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Itens</h2>
          <span>{itens.length} registros</span>
        </div>
        {itens.length > 0 ? (
          <div className="classification-items">
            {itens.map((item) => (
              <div className="classification-item-row" key={item.id}>
                <div>
                  <strong>{itemSolicitacaoDescricao(item)}</strong>
                  <span>
                    {Number(item.quantidade || 0)} {item.unidade_snapshot || item.unidade || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Nenhum item carregado para esta solicitacao." />
        )}
      </section>
    </div>
  )
}
