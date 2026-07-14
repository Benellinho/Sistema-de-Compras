import { apiUrl } from '../../config/api'

function SolicitacaoOrcamentoDocumento({
  cotacaoId,
  cotacaoFornecedorId,
  className = '',
  title = 'Solicitação de orçamento',
}) {
  if (!cotacaoId || !cotacaoFornecedorId) {
    return null
  }

  const documentoUrl = apiUrl(
    `/cotacoes/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/pdf`,
  )

  return (
    <object
      className={className}
      data={documentoUrl}
      type="application/pdf"
      aria-label={title}
    >
      <p>
        Não foi possível exibir o documento.{' '}
        <a href={documentoUrl} target="_blank" rel="noreferrer">
          Abrir solicitação de orçamento
        </a>
      </p>
    </object>
  )
}

export default SolicitacaoOrcamentoDocumento
