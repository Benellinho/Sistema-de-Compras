import {
  APROVACAO_JUSTIFICATIVAS,
  DEFAULT_RETORNO_PRAZO,
  DEFAULT_RETORNO_PARCELAS,
  DEFAULT_RETORNO_TIPO_PAGAMENTO,
  RECUSA_JUSTIFICATIVAS,
  retornoFornecedorStatuses,
  statusLabels,
} from './constants'

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('pt-BR')
}

export function statusText(status) {
  return statusLabels[status] || status || '-'
}

export function numeroSimples(id) {
  if (id === null || id === undefined || id === '') {
    return '-'
  }

  const numericValue = Number(id)

  return Number.isFinite(numericValue) ? String(numericValue) : String(id)
}

export function solicitacaoNumero(solicitacao) {
  return numeroSimples(solicitacao?.id)
}

export function cotacaoNumero(cotacao) {
  return numeroSimples(cotacao?.solicitacao_id)
}

export function compraNumero(compra) {
  return numeroSimples(compra?.solicitacao_id)
}

export function ordemNumero(ordem, compra) {
  return numeroSimples(compra?.solicitacao_id || ordem?.solicitacao_id)
}

export function solicitacaoItens(solicitacao) {
  return Array.isArray(solicitacao?.itens) ? solicitacao.itens : []
}

export function solicitacaoItensCatalogados(solicitacao) {
  return solicitacaoItens(solicitacao).filter(
    (item) => item.item_id !== null && item.item_id !== undefined,
  )
}

export function itemSolicitacaoDescricao(item) {
  return (
    (item?.item_codigo && item?.item_descricao
      ? `${item.item_codigo} - ${item.item_descricao}`
      : item?.item_descricao) ||
    item?.descricao ||
    item?.descricao_necessidade ||
    'Item'
  )
}

export function parseSolicitacaoObservacoes(observacoes) {
  if (!observacoes) {
    return {}
  }

  if (typeof observacoes === 'object' && !Array.isArray(observacoes)) {
    return observacoes
  }

  const text = String(observacoes)

  try {
    const parsed = JSON.parse(text)

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    return { necessidade: text }
  }

  return { necessidade: text }
}

export function solicitacaoMeta(solicitacao) {
  return parseSolicitacaoObservacoes(solicitacao?.observacoes)
}

export function solicitacaoSolicitante(solicitacao) {
  return solicitacao?.solicitante_nome || solicitacao?.solicitante_email || '-'
}

export function solicitacaoUrgencia(solicitacao) {
  return solicitacaoMeta(solicitacao).urgencia || ''
}

export function solicitacaoCentroCusto(solicitacao) {
  const meta = solicitacaoMeta(solicitacao)

  return meta.centro_custo || meta.centroCusto || ''
}

export function compactOptionText(parts) {
  return parts
    .map((part) => (part === null || part === undefined ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' - ')
}

export function solicitacaoClassificacaoOption(solicitacao) {
  return compactOptionText([solicitacaoNumero(solicitacao), solicitacaoSolicitante(solicitacao)])
}

export function solicitacaoCotacaoOption(solicitacao) {
  return compactOptionText([
    solicitacaoNumero(solicitacao),
    solicitacaoSolicitante(solicitacao),
    solicitacaoUrgencia(solicitacao),
    solicitacaoCentroCusto(solicitacao),
  ])
}

export function buildSolicitacaoObservacoes({ necessidade, urgencia, centroCusto }) {
  return JSON.stringify({
    necessidade,
    urgencia,
    centro_custo: centroCusto,
  })
}

export function solicitacaoNecessidade(solicitacao) {
  const meta = solicitacaoMeta(solicitacao)
  const firstFreeTextItem = solicitacaoItens(solicitacao).find(
    (item) => item.item_id === null || item.item_id === undefined,
  )
  const firstCatalogItem = solicitacaoItensCatalogados(solicitacao)[0]
  const firstCatalogDescription = firstCatalogItem
    ? firstCatalogItem.descricao_necessidade || itemSolicitacaoDescricao(firstCatalogItem)
    : ''

  return (
    meta.necessidade ||
    firstFreeTextItem?.descricao_necessidade ||
    firstCatalogDescription ||
    'Sem necessidade'
  )
}

export function solicitacaoPrincipalItem(solicitacao) {
  return solicitacaoNecessidade(solicitacao)
}

export function solicitacaoResumoItens(solicitacao) {
  const itensCatalogados = solicitacaoItensCatalogados(solicitacao)

  if (itensCatalogados.length < 1) {
    return 'Aguardando itens'
  }

  const firstItem = itensCatalogados[0]
  const firstDescription = itemSolicitacaoDescricao(firstItem)

  return itensCatalogados.length === 1
    ? firstDescription
    : `${firstDescription} +${itensCatalogados.length - 1}`
}

export function isActiveUsuario(usuario) {
  return usuario?.ativo !== false && usuario?.ativo !== 0
}

export function isActiveFornecedor(fornecedor) {
  return !fornecedor?.status || fornecedor.status === 'ATIVO'
}

export function isActiveItem(item) {
  return item?.ativo !== false && item?.ativo !== 0
}

export function fornecedorNome(fornecedor) {
  return (
    fornecedor?.fornecedor_nome_fantasia ||
    fornecedor?.nome_fantasia ||
    fornecedor?.fornecedor_razao_social ||
    fornecedor?.razao_social ||
    fornecedor?.razaoSocial ||
    'Fornecedor'
  )
}

export function usuarioNome(usuario) {
  return usuario?.nome || usuario?.email || `Usuario ${usuario?.id || ''}`.trim()
}

export function cotacaoFornecedorTotal(fornecedor) {
  return (fornecedor?.itens || []).reduce((sum, item) => {
    if (item.status_item === 'INDISPONIVEL') {
      return sum
    }

    return sum + Number(item.valor_total || Number(item.quantidade || 0) * Number(item.valor_unitario || 0))
  }, 0)
}

export function cotacaoMelhorValor(cotacao) {
  const totais = (cotacao?.fornecedores || [])
    .filter((fornecedor) => fornecedor.status === 'RESPONDIDO')
    .map(cotacaoFornecedorTotal)
    .filter((total) => total > 0)

  if (totais.length < 1) {
    return 0
  }

  return Math.min(...totais)
}

export function compraTotal(compra) {
  return (compra?.fornecedores || []).reduce(
    (sum, fornecedor) =>
      sum +
      (fornecedor.itens || []).reduce(
        (itemSum, item) =>
          itemSum +
          Number(item.valor_total || Number(item.quantidade_pedida || 0) * Number(item.valor_unitario || 0)),
        0,
      ),
    0,
  )
}

export function ordemTotal(ordem) {
  return (ordem?.itens || []).reduce(
    (sum, item) =>
      sum + Number(item.valor_total || Number(item.quantidade_pedida || 0) * Number(item.valor_unitario || 0)),
    0,
  )
}

export function calculateResponseTotal(itens) {
  return itens.reduce((sum, item) => {
    if (item.statusItem === 'INDISPONIVEL') {
      return sum
    }

    return sum + Number(item.quantidade || 0) * Number(item.valorUnitario || 0)
  }, 0)
}

export function buildRetornoItens(cotacao, solicitacoes) {
  const solicitacao = solicitacoes.find(
    (item) => Number(item.id) === Number(cotacao?.solicitacao_id),
  )

  return solicitacaoItensCatalogados(solicitacao).map((item) => ({
    solicitacaoItemId: item.id,
    descricao: itemSolicitacaoDescricao(item),
    quantidade: Number(item.quantidade || 0),
    unidade: item.unidade_snapshot || item.unidade || '',
    statusItem: 'DISPONIVEL',
    valorUnitario: '',
    observacoes: '',
  }))
}

export function retornoStatusFromFornecedor(fornecedor) {
  return retornoFornecedorStatuses.has(fornecedor?.status) ? fornecedor.status : 'RESPONDIDO'
}

export function optionLabel(options, value) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || value
}

export function retornoFormaPagamentoText(retornoCotacao) {
  if (retornoCotacao.tipoPagamento === 'A_VISTA') {
    return 'À vista'
  }

  return `Boleto - ${retornoCotacao.parcelasPagamento || DEFAULT_RETORNO_PARCELAS}x`
}

export function aprovacaoObservacao(decisao, form) {
  const comentario = form.comentario.trim()
  const justificativa =
    decisao === 'APROVAR'
      ? optionLabel(APROVACAO_JUSTIFICATIVAS, form.justificativaAprovacao)
      : optionLabel(RECUSA_JUSTIFICATIVAS, form.justificativaRecusa)

  return comentario ? `${justificativa} - ${comentario}` : justificativa
}

export function withRetornoStatus(form, status) {
  const nextForm = {
    ...form,
    status,
  }

  if (status === 'RESPONDIDO') {
    return {
      ...nextForm,
      prazoEntrega: nextForm.prazoEntrega || DEFAULT_RETORNO_PRAZO,
      tipoPagamento: nextForm.tipoPagamento || DEFAULT_RETORNO_TIPO_PAGAMENTO,
      parcelasPagamento: nextForm.parcelasPagamento || DEFAULT_RETORNO_PARCELAS,
    }
  }

  return {
    ...nextForm,
    prazoEntrega: '',
    tipoPagamento: '',
    parcelasPagamento: '',
    anexo: '',
    itens: (nextForm.itens || []).map((item) => ({
      ...item,
      statusItem: 'DISPONIVEL',
      valorUnitario: '',
      observacoes: '',
    })),
  }
}
