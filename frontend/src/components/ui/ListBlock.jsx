import { statusText } from '../../utils/formatters'
import { EmptyState } from './EmptyState'

export function ListBlock({ title, items }) {
  return (
    <section className="list-block">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{items.length} registros</span>
      </div>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => {
            const ativoStatus =
              item.ativo === undefined || item.ativo === null
                ? ''
                : ` | ${statusText(item.ativo ? 'ATIVO' : 'INATIVO')}`
            const status = item.status ? ` | ${statusText(item.status)}` : ativoStatus
            const detail = [
              item.fornecedor_nome,
              item.codigo || item.cnpj || item.email || item.unidade || item.cargo,
            ]
              .filter(Boolean)
              .join(' | ')

            return (
              <li key={item.id}>
                <strong>
                  {item.razao_social ||
                    item.nome_fantasia ||
                    item.descricao ||
                    item.nome ||
                    item.codigo}
                </strong>
                <span>
                  {detail || 'Sem detalhe'}
                  {status}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState text="Nenhum registro carregado." />
      )}
    </section>
  )
}
