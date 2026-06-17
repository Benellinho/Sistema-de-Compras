import { useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE_URL, API_ROUTES } from './config/api'
import { comprasApi } from './services/api'
import './App.css'

const tabs = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'painel', label: 'Painel' },
  { id: 'solicitacoes', label: 'Solicitacoes' },
  { id: 'classificar-solicitacao', label: 'Classificar' },
  { id: 'enviar-cotacao', label: 'Enviar cotacao' },
  { id: 'cotacoes', label: 'Cotacoes' },
  { id: 'retorno-cotacao', label: 'Retorno cotacao' },
  { id: 'aprovar-cotacao', label: 'Aprovar cotacao' },
  { id: 'compras', label: 'Compras' },
  { id: 'cadastro-base', label: 'Cadastrar base' },
  { id: 'cadastros', label: 'Cadastros' },
]

const statusLabels = {
  ABERTA: 'Aberta',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  COTACAO_REPROVADA: 'Cotacao reprovada',
  EM_COTACAO: 'Em cotacao',
  EM_ANDAMENTO: 'Em andamento',
  EM_ANALISE: 'Em analise',
  ENCERRADA: 'Encerrada',
  CANCELADA: 'Cancelada',
  EM_MONTAGEM: 'Em montagem',
  AGUARDANDO_APROVACAO: 'Aguardando aprovacao',
  GERADA: 'Gerada',
  SUBSTITUIDA: 'Substituida',
  CONVIDADO: 'Convidado',
  ENVIADO: 'Enviado',
  PENDENTE: 'Pendente',
  RESPONDIDO: 'Respondido',
  RECUSADO: 'Recusado',
  SEM_RESPOSTA: 'Sem resposta',
  DISPONIVEL: 'Disponivel',
  INDISPONIVEL: 'Indisponivel',
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  APROVAR: 'Aprovar',
  REPROVAR: 'Reprovar',
}

const statusClass = {
  ABERTA: 'info',
  APROVADA: 'success',
  REPROVADA: 'danger',
  COTACAO_REPROVADA: 'danger',
  EM_COTACAO: 'warning',
  EM_ANDAMENTO: 'warning',
  EM_ANALISE: 'warning',
  ENCERRADA: 'neutral',
  CANCELADA: 'danger',
  EM_MONTAGEM: 'info',
  AGUARDANDO_APROVACAO: 'warning',
  GERADA: 'success',
  SUBSTITUIDA: 'neutral',
  CONVIDADO: 'info',
  ENVIADO: 'warning',
  PENDENTE: 'warning',
  RESPONDIDO: 'success',
  RECUSADO: 'danger',
  SEM_RESPOSTA: 'neutral',
  DISPONIVEL: 'success',
  INDISPONIVEL: 'danger',
  ATIVO: 'success',
  INATIVO: 'neutral',
}

const finalCotacaoStatuses = new Set(['APROVADA', 'REPROVADA', 'CANCELADA', 'ENCERRADA'])
const retornoFornecedorStatuses = new Set(['RESPONDIDO', 'RECUSADO', 'SEM_RESPOSTA'])

const ACTIONS = {
  criarSolicitacao: 'Criando solicitacao',
  lancarItem: 'Lancando item',
  editarItem: 'Salvando item',
  removerItem: 'Removendo item',
  limparSolicitacoes: 'Limpando solicitacoes',
  enviarCotacao: 'Criando e enviando solicitação de orçamento',
  registrarRetorno: 'Registrando retorno',
  aceitarCotacao: 'Aceitando cotacao',
  recusarCotacao: 'Recusando cotacao',
  gerarOrdemCompra: 'Gerando ordem de compra',
  cadastrarFornecedor: 'Cadastrando fornecedor',
  cadastrarContato: 'Cadastrando contato',
  cadastrarGrupo: 'Cadastrando grupo',
  cadastrarItem: 'Cadastrando item',
}

const DEFAULT_URGENCIA = 'Baixa'
const DEFAULT_ENVIO_OBSERVACOES =
  'Solicitar orcamento formal com prazo de entrega e condicao de pagamento.'
const DEFAULT_RETORNO_PRAZO = '5 dias'
const DEFAULT_RETORNO_TIPO_PAGAMENTO = 'BOLETO'
const DEFAULT_RETORNO_PARCELAS = '1'
const DEFAULT_RETORNO_OBSERVACOES = 'Condicoes recebidas por email e lancadas manualmente.'
const DEFAULT_APROVACAO_OBSERVACAO = ''
const CLASSIFICACAO_CREATE_SOLICITACAO_VALUE = '__CREATE_SOLICITACAO__'
const RETORNO_PARCELAS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
const APROVACAO_JUSTIFICATIVAS = [
  ['MENOR_PRECO', 'Menor preço'],
  ['PRAZO', 'Melhor prazo'],
  ['PECA_ORIGINAL', 'Peça original'],
  ['GARANTIA', 'Melhor garantia'],
  ['QUALIDADE', 'Qualidade técnica'],
  ['DISPONIBILIDADE', 'Disponibilidade imediata'],
  ['OUTRO', 'Outro'],
]
const RECUSA_JUSTIFICATIVAS = [
  ['VALOR_ACIMA', 'Valor acima do esperado'],
  ['PRAZO_INCOMPATIVEL', 'Prazo incompatível'],
  ['ESCOPO_INCORRETO', 'Escopo incorreto'],
  ['DADOS_INSUFICIENTES', 'Dados insuficientes'],
  ['OUTRO', 'Outro'],
]

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('pt-BR')
}

function statusText(status) {
  return statusLabels[status] || status || '-'
}

function numeroSimples(id) {
  if (id === null || id === undefined || id === '') {
    return '-'
  }

  const numericValue = Number(id)

  return Number.isFinite(numericValue) ? String(numericValue) : String(id)
}

function solicitacaoNumero(solicitacao) {
  return numeroSimples(solicitacao?.id)
}

function cotacaoNumero(cotacao) {
  return numeroSimples(cotacao?.solicitacao_id)
}

function compraNumero(compra) {
  return numeroSimples(compra?.solicitacao_id)
}

function ordemNumero(ordem, compra) {
  return numeroSimples(compra?.solicitacao_id || ordem?.solicitacao_id)
}

function solicitacaoItens(solicitacao) {
  return Array.isArray(solicitacao?.itens) ? solicitacao.itens : []
}

function solicitacaoItensCatalogados(solicitacao) {
  return solicitacaoItens(solicitacao).filter((item) => item.item_id !== null && item.item_id !== undefined)
}

function itemSolicitacaoDescricao(item) {
  return (
    (item?.item_codigo && item?.item_descricao
      ? `${item.item_codigo} - ${item.item_descricao}`
      : item?.item_descricao) ||
    item?.descricao ||
    item?.descricao_necessidade ||
    'Item'
  )
}

function parseSolicitacaoObservacoes(observacoes) {
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

function solicitacaoMeta(solicitacao) {
  return parseSolicitacaoObservacoes(solicitacao?.observacoes)
}

function solicitacaoSolicitante(solicitacao) {
  return solicitacao?.solicitante_nome || solicitacao?.solicitante_email || '-'
}

function solicitacaoUrgencia(solicitacao) {
  return solicitacaoMeta(solicitacao).urgencia || ''
}

function solicitacaoCentroCusto(solicitacao) {
  const meta = solicitacaoMeta(solicitacao)

  return meta.centro_custo || meta.centroCusto || ''
}

function compactOptionText(parts) {
  return parts
    .map((part) => (part === null || part === undefined ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' - ')
}

function solicitacaoClassificacaoOption(solicitacao) {
  return compactOptionText([solicitacaoNumero(solicitacao), solicitacaoSolicitante(solicitacao)])
}

function solicitacaoCotacaoOption(solicitacao) {
  return compactOptionText([
    solicitacaoNumero(solicitacao),
    solicitacaoSolicitante(solicitacao),
    solicitacaoUrgencia(solicitacao),
    solicitacaoCentroCusto(solicitacao),
  ])
}

function buildSolicitacaoObservacoes({ necessidade, urgencia, centroCusto }) {
  return JSON.stringify({
    necessidade,
    urgencia,
    centro_custo: centroCusto,
  })
}

function solicitacaoNecessidade(solicitacao) {
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

function solicitacaoPrincipalItem(solicitacao) {
  return solicitacaoNecessidade(solicitacao)
}

function solicitacaoResumoItens(solicitacao) {
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

function isActiveUsuario(usuario) {
  return usuario?.ativo !== false && usuario?.ativo !== 0
}

function isActiveFornecedor(fornecedor) {
  return !fornecedor?.status || fornecedor.status === 'ATIVO'
}

function isActiveItem(item) {
  return item?.ativo !== false && item?.ativo !== 0
}

function fornecedorNome(fornecedor) {
  return (
    fornecedor?.fornecedor_nome_fantasia ||
    fornecedor?.nome_fantasia ||
    fornecedor?.fornecedor_razao_social ||
    fornecedor?.razao_social ||
    fornecedor?.razaoSocial ||
    'Fornecedor'
  )
}

function usuarioNome(usuario) {
  return usuario?.nome || usuario?.email || `Usuario ${usuario?.id || ''}`.trim()
}

function cotacaoFornecedorTotal(fornecedor) {
  return (fornecedor?.itens || []).reduce((sum, item) => {
    if (item.status_item === 'INDISPONIVEL') {
      return sum
    }

    return sum + Number(item.valor_total || Number(item.quantidade || 0) * Number(item.valor_unitario || 0))
  }, 0)
}

function cotacaoMelhorValor(cotacao) {
  const totais = (cotacao?.fornecedores || [])
    .filter((fornecedor) => fornecedor.status === 'RESPONDIDO')
    .map(cotacaoFornecedorTotal)
    .filter((total) => total > 0)

  if (totais.length < 1) {
    return 0
  }

  return Math.min(...totais)
}

function compraTotal(compra) {
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

function ordemTotal(ordem) {
  return (ordem?.itens || []).reduce(
    (sum, item) =>
      sum + Number(item.valor_total || Number(item.quantidade_pedida || 0) * Number(item.valor_unitario || 0)),
    0,
  )
}

function calculateResponseTotal(itens) {
  return itens.reduce((sum, item) => {
    if (item.statusItem === 'INDISPONIVEL') {
      return sum
    }

    return sum + Number(item.quantidade || 0) * Number(item.valorUnitario || 0)
  }, 0)
}

function buildRetornoItens(cotacao, solicitacoes) {
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

function retornoStatusFromFornecedor(fornecedor) {
  return retornoFornecedorStatuses.has(fornecedor?.status) ? fornecedor.status : 'RESPONDIDO'
}

function optionLabel(options, value) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || value
}

function retornoFormaPagamentoText(retornoCotacao) {
  if (retornoCotacao.tipoPagamento === 'A_VISTA') {
    return 'À vista'
  }

  return `Boleto - ${retornoCotacao.parcelasPagamento || DEFAULT_RETORNO_PARCELAS}x`
}

function aprovacaoObservacao(decisao, form) {
  const comentario = form.comentario.trim()
  const justificativa =
    decisao === 'APROVAR'
      ? optionLabel(APROVACAO_JUSTIFICATIVAS, form.justificativaAprovacao)
      : optionLabel(RECUSA_JUSTIFICATIVAS, form.justificativaRecusa)

  return comentario ? `${justificativa} - ${comentario}` : justificativa
}

function withRetornoStatus(form, status) {
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

function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [usuarios, setUsuarios] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [contatosFornecedor, setContatosFornecedor] = useState([])
  const [grupos, setGrupos] = useState([])
  const [itens, setItens] = useState([])
  const [solicitacoes, setSolicitacoes] = useState([])
  const [cotacoes, setCotacoes] = useState([])
  const [compras, setCompras] = useState([])
  const [ordensCompra, setOrdensCompra] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [pendingAction, setPendingAction] = useState('')
  const [actionFeedback, setActionFeedback] = useState('')
  const actionLockedRef = useRef(false)
  const [apiStatus, setApiStatus] = useState({
    label: 'Aguardando checagem',
    tone: 'neutral',
    detail: 'Clique em checar ou aguarde a verificacao inicial.',
  })
  const [draft, setDraft] = useState({
    solicitanteId: '',
    descricaoNecessidade: '',
    urgencia: DEFAULT_URGENCIA,
    centroCusto: '',
  })
  const [classificacaoForm, setClassificacaoForm] = useState({
    solicitacaoId: '',
    itemSolicitacaoId: '',
    itemId: '',
    quantidade: '',
    observacoes: '',
  })
  const [envioCotacao, setEnvioCotacao] = useState({
    solicitacaoId: '',
    fornecedorIds: [],
    usuarioId: '',
    observacoes: DEFAULT_ENVIO_OBSERVACOES,
  })
  const [retornoCotacao, setRetornoCotacao] = useState({
    cotacaoId: '',
    cotacaoFornecedorId: '',
    status: 'RESPONDIDO',
    prazoEntrega: DEFAULT_RETORNO_PRAZO,
    tipoPagamento: DEFAULT_RETORNO_TIPO_PAGAMENTO,
    parcelasPagamento: DEFAULT_RETORNO_PARCELAS,
    observacoes: DEFAULT_RETORNO_OBSERVACOES,
    anexo: '',
    itens: [],
  })
  const [aprovacaoCotacao, setAprovacaoCotacao] = useState({
    cotacaoId: '',
    fornecedorId: '',
    usuarioId: '',
    justificativaAprovacao: '',
    justificativaRecusa: '',
    comentario: DEFAULT_APROVACAO_OBSERVACAO,
  })
  const [confirmarRecusaCotacao, setConfirmarRecusaCotacao] = useState(false)
  const [fornecedorForm, setFornecedorForm] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    telefone: '',
    email: '',
  })
  const [contatoForm, setContatoForm] = useState({
    fornecedorId: '',
    nome: '',
    cargo: '',
    telefone: '',
    email: '',
  })
  const [grupoForm, setGrupoForm] = useState({
    nome: '',
  })
  const [itemForm, setItemForm] = useState({
    codigo: '',
    descricao: '',
    unidade: 'UN',
    classificacao: 'CUSTO',
    grupoId: '',
    controlaEstoque: false,
  })

  const usuariosAtivos = useMemo(() => usuarios.filter(isActiveUsuario), [usuarios])
  const fornecedoresAtivos = useMemo(
    () => fornecedores.filter(isActiveFornecedor),
    [fornecedores],
  )
  const gruposAtivos = useMemo(() => grupos.filter(isActiveItem), [grupos])
  const itensAtivos = useMemo(() => itens.filter(isActiveItem), [itens])
  const defaultUsuario = usuariosAtivos[0]
  const defaultUsuarioId = defaultUsuario?.id ? String(defaultUsuario.id) : ''
  const actionLocked = Boolean(pendingAction)

  const solicitacoesClassificaveis = useMemo(
    () => solicitacoes.filter((solicitacao) => solicitacao.status === 'ABERTA'),
    [solicitacoes],
  )

  const solicitacoesCotaveis = useMemo(
    () =>
      solicitacoes.filter(
        (solicitacao) =>
          ['ABERTA', 'APROVADA', 'COTACAO_REPROVADA'].includes(solicitacao.status) &&
          solicitacaoItensCatalogados(solicitacao).length > 0,
      ),
    [solicitacoes],
  )

  const cotacoesAbertas = useMemo(
    () => cotacoes.filter((cotacao) => !finalCotacaoStatuses.has(cotacao.status)),
    [cotacoes],
  )

  const cotacoesComFornecedores = useMemo(
    () => cotacoesAbertas.filter((cotacao) => (cotacao.fornecedores || []).length > 0),
    [cotacoesAbertas],
  )

  const cotacoesParaAprovacao = useMemo(
    () =>
      cotacoesAbertas.filter((cotacao) =>
        (cotacao.fornecedores || []).some((fornecedor) => fornecedor.status === 'RESPONDIDO'),
      ),
    [cotacoesAbertas],
  )

  const selectedEnvioSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => Number(solicitacao.id) === Number(envioCotacao.solicitacaoId),
      ),
    [envioCotacao.solicitacaoId, solicitacoes],
  )

  const selectedClassificacaoSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => Number(solicitacao.id) === Number(classificacaoForm.solicitacaoId),
      ),
    [classificacaoForm.solicitacaoId, solicitacoes],
  )

  const selectedClassificacaoItem = useMemo(
    () => itensAtivos.find((item) => Number(item.id) === Number(classificacaoForm.itemId)),
    [classificacaoForm.itemId, itensAtivos],
  )

  const itensClassificacao = useMemo(
    () => solicitacaoItensCatalogados(selectedClassificacaoSolicitacao),
    [selectedClassificacaoSolicitacao],
  )
  const isEditingClassificacaoItem = Boolean(classificacaoForm.itemSolicitacaoId)
  const isCreatingClassificacaoSolicitacao =
    classificacaoForm.solicitacaoId === CLASSIFICACAO_CREATE_SOLICITACAO_VALUE
  const hasClassificacaoSolicitacaoTarget =
    Boolean(selectedClassificacaoSolicitacao) ||
    (isCreatingClassificacaoSolicitacao && Boolean(defaultUsuarioId))

  const selectedRetornoCotacao = useMemo(
    () => cotacoes.find((cotacao) => Number(cotacao.id) === Number(retornoCotacao.cotacaoId)),
    [cotacoes, retornoCotacao.cotacaoId],
  )

  const selectedRetornoSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => Number(solicitacao.id) === Number(selectedRetornoCotacao?.solicitacao_id),
      ),
    [selectedRetornoCotacao, solicitacoes],
  )

  const selectedRetornoFornecedor = useMemo(
    () =>
      (selectedRetornoCotacao?.fornecedores || []).find(
        (fornecedor) => Number(fornecedor.id) === Number(retornoCotacao.cotacaoFornecedorId),
      ),
    [retornoCotacao.cotacaoFornecedorId, selectedRetornoCotacao],
  )

  const selectedAprovacaoCotacao = useMemo(
    () =>
      cotacoes.find((cotacao) => Number(cotacao.id) === Number(aprovacaoCotacao.cotacaoId)),
    [aprovacaoCotacao.cotacaoId, cotacoes],
  )

  const selectedAprovacaoSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) =>
          Number(solicitacao.id) === Number(selectedAprovacaoCotacao?.solicitacao_id),
      ),
    [selectedAprovacaoCotacao, solicitacoes],
  )

  const selectedAprovacaoFornecedor = useMemo(
    () =>
      (selectedAprovacaoCotacao?.fornecedores || []).find(
        (fornecedor) =>
          Number(fornecedor.fornecedor_id) === Number(aprovacaoCotacao.fornecedorId) &&
          fornecedor.status === 'RESPONDIDO',
      ),
    [aprovacaoCotacao.fornecedorId, selectedAprovacaoCotacao],
  )

  const respostasDaCotacao = useMemo(
    () =>
      (selectedRetornoCotacao?.fornecedores || []).filter((fornecedor) =>
        ['RESPONDIDO', 'RECUSADO', 'SEM_RESPOSTA'].includes(fornecedor.status),
      ),
    [selectedRetornoCotacao],
  )

  const retornoTotal = useMemo(
    () => calculateResponseTotal(retornoCotacao.itens),
    [retornoCotacao.itens],
  )

  const compraFornecedorElegivel = useMemo(() => {
    const ordensAtivas = new Set(
      ordensCompra
        .filter((ordem) => ordem.status === 'GERADA')
        .map((ordem) => Number(ordem.compra_fornecedor_id)),
    )

    for (const compra of compras) {
      if (compra.status !== 'APROVADA') {
        continue
      }

      const fornecedor = (compra.fornecedores || []).find(
        (item) => !ordensAtivas.has(Number(item.id)),
      )

      if (fornecedor) {
        return { compra, fornecedor }
      }
    }

    return null
  }, [compras, ordensCompra])

  const comprasPorId = useMemo(
    () => new Map(compras.map((compra) => [Number(compra.id), compra])),
    [compras],
  )

  const metrics = useMemo(
    () => [
      {
        label: 'Solicitacoes abertas',
        value: solicitacoes.filter((item) => item.status === 'ABERTA').length,
        detail: `${solicitacoes.length} no backend`,
      },
      {
        label: 'Cotacoes ativas',
        value: cotacoesAbertas.length,
        detail: `${cotacoes.length} rodadas`,
      },
      {
        label: 'Valor em compras',
        value: formatCurrency(compras.reduce((sum, compra) => sum + compraTotal(compra), 0)),
        detail: 'compras carregadas',
      },
      {
        label: 'Ordens geradas',
        value: ordensCompra.filter((ordem) => ordem.status === 'GERADA').length,
        detail: `${ordensCompra.length} ordens`,
      },
    ],
    [compras, cotacoes.length, cotacoesAbertas.length, ordensCompra, solicitacoes],
  )

  const solicitacaoRows = useMemo(
    () =>
      solicitacoes.map((solicitacao) => ({
        id: solicitacao.id,
        numero: solicitacaoNumero(solicitacao),
        solicitante: solicitacaoSolicitante(solicitacao),
        item: solicitacaoPrincipalItem(solicitacao),
        itens: solicitacaoItensCatalogados(solicitacao).length,
        status: solicitacao.status,
        data: formatDate(solicitacao.created_at),
      })),
    [solicitacoes],
  )

  const cotacaoRows = useMemo(
    () =>
      cotacoes.map((cotacao) => {
        const resumo = cotacao.resumo_respostas || {}
        const respondidos =
          resumo.fornecedores_respondidos ??
          (cotacao.fornecedores || []).filter((fornecedor) => fornecedor.status === 'RESPONDIDO')
            .length
        const convidados =
          resumo.fornecedores_convidados ?? (cotacao.fornecedores || []).length

        return {
          id: cotacao.id,
          numero: cotacaoNumero(cotacao),
          rodada: cotacao.numero_rodada || 1,
          status: cotacao.status,
          respostas: `${respondidos}/${convidados}`,
          melhorValor: cotacaoMelhorValor(cotacao),
        }
      }),
    [cotacoes],
  )

  const compraRows = useMemo(
    () =>
      compras.map((compra) => {
        const fornecedor = compra.fornecedores?.[0]

        return {
          id: compra.id,
          numero: compraNumero(compra),
          fornecedor: fornecedorNome(fornecedor),
          aprovador: compra.criado_por_nome || '-',
          total: compraTotal(compra),
          status: compra.status,
        }
      }),
    [compras],
  )

  const ordemRows = useMemo(
    () =>
      ordensCompra.map((ordem) => {
        const compra = comprasPorId.get(Number(ordem.compra_id))

        return {
          id: ordem.id,
          numero: ordemNumero(ordem, compra),
          fornecedor: fornecedorNome(ordem),
          total: ordemTotal(ordem),
          status: ordem.status,
          envio: ordem.envios?.[0]?.status || 'PENDENTE',
        }
      }),
    [comprasPorId, ordensCompra],
  )

  useEffect(() => {
    checkApi()
    loadBackendData()
    // Initial screen bootstrap only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runLocked(actionName, task) {
    if (actionLockedRef.current) {
      return
    }

    actionLockedRef.current = true
    setPendingAction(actionName)

    try {
      await task()
    } finally {
      actionLockedRef.current = false
      setPendingAction('')
    }
  }

  function resetSolicitacaoForm() {
    setDraft({
      solicitanteId: defaultUsuarioId,
      descricaoNecessidade: '',
      urgencia: DEFAULT_URGENCIA,
      centroCusto: '',
    })
  }

  function resetClassificacaoForm() {
    setClassificacaoForm({
      solicitacaoId: solicitacoesClassificaveis[0]?.id
        ? String(solicitacoesClassificaveis[0].id)
        : '',
      itemSolicitacaoId: '',
      itemId: '',
      quantidade: '',
      observacoes: '',
    })
  }

  function resetEnvioCotacaoForm() {
    setEnvioCotacao({
      solicitacaoId: solicitacoesCotaveis[0]?.id ? String(solicitacoesCotaveis[0].id) : '',
      fornecedorIds: fornecedoresAtivos.slice(0, 3).map((fornecedor) => String(fornecedor.id)),
      usuarioId: defaultUsuarioId,
      observacoes: DEFAULT_ENVIO_OBSERVACOES,
    })
  }

  function resetRetornoCotacaoForm() {
    const cotacao = cotacoesComFornecedores[0]
    const fornecedor = cotacao?.fornecedores?.[0]

    setRetornoCotacao(
      withRetornoStatus(
        {
          cotacaoId: cotacao?.id ? String(cotacao.id) : '',
          cotacaoFornecedorId: fornecedor?.id ? String(fornecedor.id) : '',
          status: 'RESPONDIDO',
          prazoEntrega: DEFAULT_RETORNO_PRAZO,
          tipoPagamento: DEFAULT_RETORNO_TIPO_PAGAMENTO,
          parcelasPagamento: DEFAULT_RETORNO_PARCELAS,
          observacoes: DEFAULT_RETORNO_OBSERVACOES,
          anexo: '',
          itens: cotacao ? buildRetornoItens(cotacao, solicitacoes) : [],
        },
        retornoStatusFromFornecedor(fornecedor),
      ),
    )
  }

  function resetAprovacaoCotacaoForm() {
    const cotacao = cotacoesParaAprovacao[0]
    const fornecedor = (cotacao?.fornecedores || []).find(
      (item) => item.status === 'RESPONDIDO',
    )

    setAprovacaoCotacao({
      cotacaoId: cotacao?.id ? String(cotacao.id) : '',
      fornecedorId: fornecedor?.fornecedor_id ? String(fornecedor.fornecedor_id) : '',
      usuarioId: defaultUsuarioId,
      justificativaAprovacao: '',
      justificativaRecusa: '',
      comentario: DEFAULT_APROVACAO_OBSERVACAO,
    })
    setConfirmarRecusaCotacao(false)
  }

  function resetCadastroBaseForms() {
    setFornecedorForm({
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      telefone: '',
      email: '',
    })
    setContatoForm({
      fornecedorId: fornecedoresAtivos[0]?.id ? String(fornecedoresAtivos[0].id) : '',
      nome: '',
      cargo: '',
      telefone: '',
      email: '',
    })
    setGrupoForm({ nome: '' })
    setItemForm({
      codigo: '',
      descricao: '',
      unidade: 'UN',
      classificacao: 'CUSTO',
      grupoId: gruposAtivos[0]?.id ? String(gruposAtivos[0].id) : '',
      controlaEstoque: false,
    })
  }

  function resetTabState(tabId) {
    if (tabId === 'solicitacoes') {
      resetSolicitacaoForm()
      return
    }

    if (tabId === 'classificar-solicitacao') {
      resetClassificacaoForm()
      return
    }

    if (tabId === 'enviar-cotacao') {
      resetEnvioCotacaoForm()
      return
    }

    if (tabId === 'retorno-cotacao') {
      resetRetornoCotacaoForm()
      return
    }

    if (tabId === 'aprovar-cotacao') {
      resetAprovacaoCotacaoForm()
      return
    }

    if (tabId === 'cadastro-base') {
      resetCadastroBaseForms()
    }
  }

  function navigateToTab(tabId, { clearFeedback = true } = {}) {
    if (tabId !== activeTab) {
      resetTabState(activeTab)

      if (clearFeedback) {
        setActionFeedback('')
      }
    }

    setActiveTab(tabId)
  }

  function syncFormDefaults({
    usuariosData,
    fornecedoresData,
    gruposData,
    itensData,
    solicitacoesData,
    cotacoesData,
  }) {
    const nextUsuariosAtivos = usuariosData.filter(isActiveUsuario)
    const nextFornecedoresAtivos = fornecedoresData.filter(isActiveFornecedor)
    const nextGruposAtivos = gruposData.filter(isActiveItem)
    const nextItensAtivos = itensData.filter(isActiveItem)
    const nextDefaultUsuarioId = nextUsuariosAtivos[0]?.id ? String(nextUsuariosAtivos[0].id) : ''
    const nextSolicitacoesClassificaveis = solicitacoesData.filter(
      (solicitacao) => solicitacao.status === 'ABERTA',
    )
    const nextSolicitacoesCotaveis = solicitacoesData.filter((solicitacao) =>
      ['ABERTA', 'APROVADA', 'COTACAO_REPROVADA'].includes(solicitacao.status) &&
      solicitacaoItensCatalogados(solicitacao).length > 0,
    )
    const nextCotacoesAbertas = cotacoesData.filter(
      (cotacao) => !finalCotacaoStatuses.has(cotacao.status),
    )
    const nextCotacoesComFornecedores = nextCotacoesAbertas.filter(
      (cotacao) => (cotacao.fornecedores || []).length > 0,
    )
    const nextCotacoesParaAprovacao = nextCotacoesAbertas.filter((cotacao) =>
      (cotacao.fornecedores || []).some((fornecedor) => fornecedor.status === 'RESPONDIDO'),
    )

    setDraft((current) => {
      const userIsValid = nextUsuariosAtivos.some(
        (usuario) => Number(usuario.id) === Number(current.solicitanteId),
      )

      return {
        ...current,
        solicitanteId: userIsValid ? current.solicitanteId : nextDefaultUsuarioId,
      }
    })

    setClassificacaoForm((current) => {
      const solicitacaoIsValid = nextSolicitacoesClassificaveis.some(
        (solicitacao) => Number(solicitacao.id) === Number(current.solicitacaoId),
      )
      const selectedSolicitacao = nextSolicitacoesClassificaveis.find(
        (solicitacao) => Number(solicitacao.id) === Number(current.solicitacaoId),
      )
      const itemSolicitacaoIsValid = solicitacaoItensCatalogados(selectedSolicitacao).some(
        (item) => Number(item.id) === Number(current.itemSolicitacaoId),
      )
      const shouldClearInvalidEditing = Boolean(current.itemSolicitacaoId) && !itemSolicitacaoIsValid
      const itemIsValid = nextItensAtivos.some((item) => Number(item.id) === Number(current.itemId))

      return {
        ...current,
        solicitacaoId: solicitacaoIsValid
          ? current.solicitacaoId
          : nextSolicitacoesClassificaveis[0]?.id
            ? String(nextSolicitacoesClassificaveis[0].id)
            : '',
        itemSolicitacaoId: itemSolicitacaoIsValid ? current.itemSolicitacaoId : '',
        itemId: shouldClearInvalidEditing ? '' : itemIsValid ? current.itemId : '',
        quantidade: shouldClearInvalidEditing ? '' : current.quantidade ?? '',
        observacoes: shouldClearInvalidEditing ? '' : current.observacoes,
      }
    })

    setEnvioCotacao((current) => {
      const solicitacaoIsValid = nextSolicitacoesCotaveis.some(
        (solicitacao) => Number(solicitacao.id) === Number(current.solicitacaoId),
      )
      const validFornecedorIds = current.fornecedorIds.filter((id) =>
        nextFornecedoresAtivos.some((fornecedor) => Number(fornecedor.id) === Number(id)),
      )

      return {
        ...current,
        solicitacaoId: solicitacaoIsValid
          ? current.solicitacaoId
          : nextSolicitacoesCotaveis[0]?.id
            ? String(nextSolicitacoesCotaveis[0].id)
            : '',
        usuarioId:
          current.usuarioId &&
          nextUsuariosAtivos.some((usuario) => Number(usuario.id) === Number(current.usuarioId))
            ? current.usuarioId
            : nextDefaultUsuarioId,
        fornecedorIds:
          validFornecedorIds.length > 0
            ? validFornecedorIds
            : nextFornecedoresAtivos.slice(0, 3).map((fornecedor) => String(fornecedor.id)),
      }
    })

    setRetornoCotacao((current) => {
      const cotacaoAtual =
        nextCotacoesComFornecedores.find(
          (cotacao) => Number(cotacao.id) === Number(current.cotacaoId),
        ) || nextCotacoesComFornecedores[0]
      const fornecedoresCotacao = cotacaoAtual?.fornecedores || []
      const fornecedorAtual =
        fornecedoresCotacao.find(
          (fornecedor) => Number(fornecedor.id) === Number(current.cotacaoFornecedorId),
        ) || fornecedoresCotacao[0]

      return withRetornoStatus({
        ...current,
        cotacaoId: cotacaoAtual?.id ? String(cotacaoAtual.id) : '',
        cotacaoFornecedorId: fornecedorAtual?.id ? String(fornecedorAtual.id) : '',
        itens: cotacaoAtual ? buildRetornoItens(cotacaoAtual, solicitacoesData) : [],
      }, retornoStatusFromFornecedor(fornecedorAtual))
    })

    setAprovacaoCotacao((current) => {
      const cotacaoAtual =
        nextCotacoesParaAprovacao.find(
          (cotacao) => Number(cotacao.id) === Number(current.cotacaoId),
        ) || nextCotacoesParaAprovacao[0]
      const fornecedoresRespondidos = (cotacaoAtual?.fornecedores || []).filter(
        (fornecedor) => fornecedor.status === 'RESPONDIDO',
      )
      const fornecedorAtual =
        fornecedoresRespondidos.find(
          (fornecedor) => Number(fornecedor.fornecedor_id) === Number(current.fornecedorId),
        ) || fornecedoresRespondidos[0]

      return {
        ...current,
        cotacaoId: cotacaoAtual?.id ? String(cotacaoAtual.id) : '',
        fornecedorId: fornecedorAtual?.fornecedor_id ? String(fornecedorAtual.fornecedor_id) : '',
        usuarioId:
          current.usuarioId &&
          nextUsuariosAtivos.some((usuario) => Number(usuario.id) === Number(current.usuarioId))
            ? current.usuarioId
            : nextDefaultUsuarioId,
      }
    })

    setContatoForm((current) => ({
      ...current,
      fornecedorId:
        current.fornecedorId &&
        nextFornecedoresAtivos.some(
          (fornecedor) => Number(fornecedor.id) === Number(current.fornecedorId),
        )
          ? current.fornecedorId
          : nextFornecedoresAtivos[0]?.id
            ? String(nextFornecedoresAtivos[0].id)
            : '',
    }))

    setItemForm((current) => ({
      ...current,
      grupoId:
        current.grupoId &&
        nextGruposAtivos.some((grupo) => Number(grupo.id) === Number(current.grupoId))
          ? current.grupoId
          : nextGruposAtivos[0]?.id
            ? String(nextGruposAtivos[0].id)
            : '',
    }))
  }

  async function loadBackendData({ silent = false, successMessage = '' } = {}) {
    if (!silent) {
      setLoadingData(true)
    }

    try {
      const [
        usuariosData,
        fornecedoresData,
        gruposData,
        itensData,
        solicitacoesData,
        cotacoesData,
        comprasData,
        ordensData,
      ] = await Promise.all([
        comprasApi.listarUsuarios(),
        comprasApi.listarFornecedores(),
        comprasApi.listarGrupos(),
        comprasApi.listarItens(),
        comprasApi.listarSolicitacoes(),
        comprasApi.listarCotacoes(),
        comprasApi.listarCompras(),
        comprasApi.listarOrdensCompra(),
      ])

      const solicitacoesDetalhadas = await Promise.all(
        solicitacoesData.map((solicitacao) =>
          comprasApi.buscarSolicitacao(solicitacao.id).catch(() => ({
            ...solicitacao,
            itens: [],
          })),
        ),
      )
      const cotacoesDetalhadas = await Promise.all(
        cotacoesData.map((cotacao) =>
          comprasApi.buscarCotacao(cotacao.id).catch(() => ({
            ...cotacao,
            fornecedores: [],
            resumo_respostas: null,
          })),
        ),
      )
      const contatosData = (
        await Promise.all(
          fornecedoresData.map((fornecedor) =>
            comprasApi
              .listarContatosFornecedor(fornecedor.id)
              .catch(() => [])
              .then((contatos) =>
                contatos.map((contato) => ({
                  ...contato,
                  fornecedor_nome: fornecedorNome(fornecedor),
                })),
              ),
          ),
        )
      ).flat()

      setUsuarios(usuariosData)
      setFornecedores(fornecedoresData)
      setContatosFornecedor(contatosData)
      setGrupos(gruposData)
      setItens(itensData)
      setSolicitacoes(solicitacoesDetalhadas)
      setCotacoes(cotacoesDetalhadas)
      setCompras(comprasData)
      setOrdensCompra(ordensData)
      syncFormDefaults({
        usuariosData,
        fornecedoresData,
        gruposData,
        itensData,
        solicitacoesData: solicitacoesDetalhadas,
        cotacoesData: cotacoesDetalhadas,
      })

      if (successMessage || !silent) {
        setActionFeedback(successMessage || 'Dados carregados do backend.')
      }
    } catch (error) {
      setActionFeedback(`Falha ao carregar dados: ${error.message}`)
    } finally {
      if (!silent) {
        setLoadingData(false)
      }
    }
  }

  async function handleLoadBackendData() {
    return runLocked('Atualizando dados', async () => {
      await loadBackendData()
    })
  }

  async function checkApi() {
    return runLocked('Checando API', async () => {
      setApiStatus({
        label: 'Checando API',
        tone: 'warning',
        detail: `Chamando ${API_BASE_URL}${API_ROUTES.health}`,
      })

      try {
        const response = await comprasApi.health()

        setApiStatus({
          label: 'API funcionando',
          tone: 'success',
          detail: `GET /health respondeu ${response?.status || 'ok'}.`,
        })
      } catch (error) {
        setApiStatus({
          label: 'API fora do ar',
          tone: 'danger',
          detail: error.message,
        })
      }
    })
  }

  async function handleCreateSolicitacao(event) {
    event.preventDefault()

    return runLocked(ACTIONS.criarSolicitacao, async () => {
      setActionFeedback('')

      try {
        const descricaoNecessidade = draft.descricaoNecessidade.trim()
        const urgencia = draft.urgencia.trim()
        const centroCusto = draft.centroCusto.trim()

        if (!draft.solicitanteId) {
          throw new Error('Nenhum solicitante ativo encontrado.')
        }

        if (!descricaoNecessidade) {
          throw new Error('Informe a necessidade da solicitacao.')
        }

        const solicitacao = await comprasApi.criarSolicitacao({
          solicitante_id: Number(draft.solicitanteId),
          observacoes: buildSolicitacaoObservacoes({
            necessidade: descricaoNecessidade,
            urgencia,
            centroCusto,
          }),
        })

        setDraft((current) => ({
          ...current,
          descricaoNecessidade: '',
          centroCusto: '',
        }))
        await loadBackendData({
          silent: true,
          successMessage: `Solicitação N° ${solicitacaoNumero(solicitacao)} registrada`,
        })
        setClassificacaoForm((current) => ({
          ...current,
          solicitacaoId: String(solicitacao.id),
          itemSolicitacaoId: '',
          itemId: '',
          quantidade: '',
          observacoes: '',
        }))
        navigateToTab('classificar-solicitacao', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel criar solicitacao: ${error.message}`)
      }
    })
  }

  function handleClassificacaoSolicitacaoChange(solicitacaoId) {
    setActionFeedback('')
    setClassificacaoForm((current) => ({
      ...current,
      solicitacaoId,
      itemSolicitacaoId: '',
      itemId: '',
      quantidade: '',
      observacoes: '',
    }))
  }

  async function handleClassificarSolicitacao(event) {
    event.preventDefault()

    const pendingActionName = classificacaoForm.itemSolicitacaoId ? ACTIONS.editarItem : ACTIONS.lancarItem

    return runLocked(pendingActionName, async () => {
      setActionFeedback('')

      try {
        const shouldCreateSolicitacao = isCreatingClassificacaoSolicitacao

        if (!selectedClassificacaoItem) {
          throw new Error('Selecione um item cadastrado.')
        }

        if (!selectedClassificacaoSolicitacao && !shouldCreateSolicitacao) {
          throw new Error('Selecione uma solicitacao aberta.')
        }

        if (shouldCreateSolicitacao && !defaultUsuarioId) {
          throw new Error('Nenhum usuario ativo encontrado para criar a solicitacao.')
        }

        const itemPayload = {
          item_id: Number(classificacaoForm.itemId),
          quantidade: Number(classificacaoForm.quantidade || 0),
          descricao_necessidade: selectedClassificacaoItem.descricao,
          observacoes: classificacaoForm.observacoes || null,
        }
        const isEditing = Boolean(classificacaoForm.itemSolicitacaoId)
        let targetSolicitacao = selectedClassificacaoSolicitacao

        if (isEditing) {
          await comprasApi.atualizarItemSolicitacao(
            targetSolicitacao.id,
            classificacaoForm.itemSolicitacaoId,
            itemPayload,
          )
        } else {
          if (shouldCreateSolicitacao) {
            const solicitacaoDiretaTexto = `Solicitação criada diretamente por ${usuarioNome(defaultUsuario)}`

            targetSolicitacao = await comprasApi.criarSolicitacao({
              solicitante_id: Number(defaultUsuarioId),
              observacoes: buildSolicitacaoObservacoes({
                necessidade: solicitacaoDiretaTexto,
                urgencia: DEFAULT_URGENCIA,
                centroCusto: '',
              }),
            })
          }

          await comprasApi.adicionarItemSolicitacao(targetSolicitacao.id, itemPayload)
        }

        const feedbackSolicitacao = targetSolicitacao || selectedClassificacaoSolicitacao

        await loadBackendData({
          silent: true,
          successMessage: shouldCreateSolicitacao
            ? `Solicitação N° ${solicitacaoNumero(feedbackSolicitacao)} criada e item lancado.`
            : isEditing
              ? `Item atualizado na solicitação N° ${solicitacaoNumero(feedbackSolicitacao)}.`
              : `Item lancado na solicitação N° ${solicitacaoNumero(feedbackSolicitacao)}.`,
        })
        setClassificacaoForm((current) => ({
          ...current,
          solicitacaoId: shouldCreateSolicitacao ? String(feedbackSolicitacao.id) : current.solicitacaoId,
          itemSolicitacaoId: '',
          itemId: '',
          quantidade: '',
          observacoes: '',
        }))
        navigateToTab('classificar-solicitacao', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel salvar item: ${error.message}`)
      }
    })
  }

  function handleEditClassificacaoItem(item) {
    setActionFeedback('Item carregado para edicao.')
    setClassificacaoForm((current) => ({
      ...current,
      solicitacaoId: item.solicitacao_id ? String(item.solicitacao_id) : current.solicitacaoId,
      itemSolicitacaoId: String(item.id),
      itemId: item.item_id ? String(item.item_id) : '',
      quantidade: item.quantidade ? String(item.quantidade) : '',
      observacoes: item.observacoes || '',
    }))
  }

  function handleCancelEditClassificacaoItem() {
    setActionFeedback('')
    setClassificacaoForm((current) => ({
      ...current,
      itemSolicitacaoId: '',
      itemId: '',
      quantidade: '',
      observacoes: '',
    }))
  }

  async function handleRemoveClassificacaoItem(itemSolicitacaoId) {
    return runLocked(ACTIONS.removerItem, async () => {
      setActionFeedback('')

      try {
        if (!selectedClassificacaoSolicitacao) {
          throw new Error('Selecione uma solicitacao aberta.')
        }

        await comprasApi.removerItemSolicitacao(selectedClassificacaoSolicitacao.id, itemSolicitacaoId)
        await loadBackendData({
          silent: true,
          successMessage: `Item removido da solicitação N° ${solicitacaoNumero(selectedClassificacaoSolicitacao)}.`,
        })
        navigateToTab('classificar-solicitacao', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel remover item: ${error.message}`)
      }
    })
  }

  async function handleLimparSolicitacoesTeste() {
    const confirmed = window.confirm(
      'Isso vai apagar todas as solicitacoes, cotacoes, compras e ordens de compra criadas. Continuar?',
    )

    if (!confirmed) {
      return
    }

    return runLocked(ACTIONS.limparSolicitacoes, async () => {
      setActionFeedback('')

      try {
        const result = await comprasApi.limparSolicitacoesTeste()
        await loadBackendData({
          silent: true,
          successMessage: `${result.solicitacoes_removidas || 0} solicitacoes removidas.`,
        })
        navigateToTab('solicitacoes', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel limpar solicitacoes: ${error.message}`)
      }
    })
  }

  async function enviarSolicitacaoParaCotacao(event) {
    event.preventDefault()

    return runLocked(ACTIONS.enviarCotacao, async () => {
      setActionFeedback('')

      try {
        let solicitacaoId = Number(envioCotacao.solicitacaoId)

        if (!selectedEnvioSolicitacao) {
          throw new Error('Selecione uma solicitacao.')
        }

        if (envioCotacao.fornecedorIds.length < 1) {
          throw new Error('Selecione ao menos um fornecedor.')
        }

        if (solicitacaoItensCatalogados(selectedEnvioSolicitacao).length < 1) {
          throw new Error('Lance ao menos um item cadastrado antes de enviar para cotacao.')
        }

        if (selectedEnvioSolicitacao.status === 'ABERTA') {
          await comprasApi.decidirSolicitacao(solicitacaoId, {
            aprovador_id: Number(envioCotacao.usuarioId),
            decisao: 'APROVADO',
            observacao: 'Solicitacao aprovada para cotacao pelo prototipo.',
          })
        }

        const cotacao = await comprasApi.criarCotacao({
          solicitacao_id: solicitacaoId,
          criado_por: Number(envioCotacao.usuarioId),
          observacoes: envioCotacao.observacoes,
        })

        for (const fornecedorId of envioCotacao.fornecedorIds) {
          const fornecedorCotacao = await comprasApi.adicionarFornecedorCotacao(cotacao.id, {
            fornecedor_id: Number(fornecedorId),
            usuario_id: Number(envioCotacao.usuarioId),
          })

          await comprasApi.marcarEnvioFornecedorCotacao(cotacao.id, fornecedorCotacao.id, {
            usuario_id: Number(envioCotacao.usuarioId),
          })
        }

        await loadBackendData({
          silent: true,
          successMessage: `Solicitacao N° ${cotacaoNumero(cotacao)} enviada para cotacao.`,
        })
        navigateToTab('cotacoes', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel enviar cotacao: ${error.message}`)
      }
    })
  }

  async function handleRetornoCotacaoSubmit(event) {
    event.preventDefault()

    return runLocked(ACTIONS.registrarRetorno, async () => {
      setActionFeedback('')

      try {
        if (!selectedRetornoCotacao || !selectedRetornoFornecedor) {
          throw new Error('Selecione uma cotacao e um fornecedor.')
        }

        if (retornoCotacao.status === 'RESPONDIDO') {
          await comprasApi.registrarRespostaCotacao(
            selectedRetornoCotacao.id,
            selectedRetornoFornecedor.id,
            {
              prazo_entrega: retornoCotacao.prazoEntrega,
              forma_pagamento: retornoFormaPagamentoText(retornoCotacao),
              observacoes: retornoCotacao.observacoes,
              usuario_id: Number(defaultUsuarioId || envioCotacao.usuarioId),
              itens: retornoCotacao.itens.map((item) => ({
                solicitacao_item_id: Number(item.solicitacaoItemId),
                status_item: item.statusItem,
                quantidade:
                  item.statusItem === 'INDISPONIVEL' ? null : Number(item.quantidade || 0),
                valor_unitario:
                  item.statusItem === 'INDISPONIVEL' ? null : Number(item.valorUnitario || 0),
                observacoes: item.observacoes || null,
              })),
            },
          )
        } else {
          await comprasApi.atualizarFornecedorCotacaoStatus(
            selectedRetornoCotacao.id,
            selectedRetornoFornecedor.id,
            {
              status: retornoCotacao.status,
              observacoes: retornoCotacao.observacoes,
              usuario_id: Number(defaultUsuarioId || envioCotacao.usuarioId),
            },
          )
        }

        await loadBackendData({
          silent: true,
          successMessage: `Retorno de ${fornecedorNome(selectedRetornoFornecedor)} registrado.`,
        })
        navigateToTab('retorno-cotacao', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel registrar retorno: ${error.message}`)
      }
    })
  }

  async function aprovarCotacao(event, decisao) {
    event.preventDefault()

    return runLocked(decisao === 'REPROVAR' ? ACTIONS.recusarCotacao : ACTIONS.aceitarCotacao, async () => {
      setActionFeedback('')

      try {
        if (!selectedAprovacaoCotacao) {
          throw new Error('Selecione uma cotacao.')
        }

        const comentario = aprovacaoCotacao.comentario.trim()
        const observacao = aprovacaoObservacao(decisao, aprovacaoCotacao)
        const usuarioAprovadorId = aprovacaoCotacao.usuarioId || defaultUsuarioId

        if (!usuarioAprovadorId) {
          throw new Error('Nenhum usuario ativo encontrado para registrar a decisao.')
        }

        if (decisao === 'REPROVAR') {
          if (!aprovacaoCotacao.justificativaRecusa) {
            throw new Error('Selecione uma justificativa para recusar a cotacao.')
          }

          await comprasApi.atualizarCotacaoStatus(selectedAprovacaoCotacao.id, {
            status: 'REPROVADA',
            usuario_id: Number(usuarioAprovadorId),
            observacao,
          })
          await loadBackendData({
            silent: true,
            successMessage: `Solicitacao N° ${cotacaoNumero(selectedAprovacaoCotacao)} reprovada.`,
          })
          setConfirmarRecusaCotacao(false)
          navigateToTab('cotacoes', { clearFeedback: false })
          return
        }

        if (!selectedAprovacaoFornecedor) {
          throw new Error('Selecione um fornecedor com resposta registrada.')
        }

        if (!aprovacaoCotacao.justificativaAprovacao) {
          throw new Error('Selecione uma justificativa para aceitar a cotacao.')
        }

        if (aprovacaoCotacao.justificativaAprovacao === 'OUTRO' && !comentario) {
          throw new Error('Informe um comentario para a justificativa Outro.')
        }

        await comprasApi.atualizarCotacaoStatus(selectedAprovacaoCotacao.id, {
          status: 'APROVADA',
          usuario_id: Number(usuarioAprovadorId),
          observacao,
        })

        const compra = await comprasApi.criarCompra({
          cotacao_id: selectedAprovacaoCotacao.id,
          criado_por: Number(usuarioAprovadorId),
          observacoes: observacao,
        })
        const fornecedorCompra = await comprasApi.adicionarFornecedorCompra(compra.id, {
          fornecedor_id: Number(selectedAprovacaoFornecedor.fornecedor_id),
          usuario_id: Number(usuarioAprovadorId),
          justificativas: [aprovacaoCotacao.justificativaAprovacao],
          justificativa_texto: observacao,
          prazo_entrega: selectedAprovacaoFornecedor.prazo_entrega,
          forma_pagamento: selectedAprovacaoFornecedor.forma_pagamento,
        })

        for (const item of selectedAprovacaoFornecedor.itens || []) {
          if (item.status_item !== 'DISPONIVEL') {
            continue
          }

          await comprasApi.adicionarItemCompra(compra.id, fornecedorCompra.id, {
            solicitacao_item_id: Number(item.solicitacao_item_id),
            quantidade_pedida: Number(item.quantidade || 0),
            usuario_id: Number(usuarioAprovadorId),
          })
        }

        await comprasApi.enviarCompraAprovacao(compra.id, {
          usuario_id: Number(usuarioAprovadorId),
          observacao: 'Compra enviada para aprovacao pelo prototipo.',
        })
        await comprasApi.aprovarCompra(compra.id, {
          aprovador_id: Number(usuarioAprovadorId),
          observacao,
        })

        await loadBackendData({
          silent: true,
          successMessage: `Solicitacao N° ${compraNumero(compra)} criada e aprovada no backend.`,
        })
        setConfirmarRecusaCotacao(false)
        navigateToTab('compras', { clearFeedback: false })
      } catch (error) {
        setActionFeedback(`Nao foi possivel aprovar cotacao: ${error.message}`)
      }
    })
  }

  async function createOrdemCompra() {
    return runLocked(ACTIONS.gerarOrdemCompra, async () => {
      setActionFeedback('')

      try {
        if (!compraFornecedorElegivel) {
          throw new Error('Nao ha compra aprovada sem ordem ativa.')
        }

        await comprasApi.criarOrdemCompra({
          compra_fornecedor_id: Number(compraFornecedorElegivel.fornecedor.id),
          usuario_id: Number(defaultUsuarioId),
          observacoes: 'Ordem gerada pelo prototipo.',
        })

        await loadBackendData({
          silent: true,
          successMessage: `Solicitacao N° ${compraNumero(compraFornecedorElegivel.compra)} gerada no backend.`,
        })
      } catch (error) {
        setActionFeedback(`Nao foi possivel gerar ordem de compra: ${error.message}`)
      }
    })
  }

  async function handleCreateFornecedor(event) {
    event.preventDefault()

    return runLocked(ACTIONS.cadastrarFornecedor, async () => {
      setActionFeedback('')

      try {
        const fornecedor = await comprasApi.criarFornecedor({
          cnpj: fornecedorForm.cnpj,
          razao_social: fornecedorForm.razaoSocial,
          nome_fantasia: fornecedorForm.nomeFantasia || null,
          telefone: fornecedorForm.telefone || null,
          email: fornecedorForm.email || null,
          status: 'ATIVO',
        })

        setFornecedorForm({
          cnpj: '',
          razaoSocial: '',
          nomeFantasia: '',
          telefone: '',
          email: '',
        })
        setContatoForm((current) => ({
          ...current,
          fornecedorId: String(fornecedor.id),
        }))
        await loadBackendData({
          silent: true,
          successMessage: `Fornecedor ${fornecedorNome(fornecedor)} cadastrado.`,
        })
      } catch (error) {
        setActionFeedback(`Nao foi possivel cadastrar fornecedor: ${error.message}`)
      }
    })
  }

  async function handleCreateContato(event) {
    event.preventDefault()

    return runLocked(ACTIONS.cadastrarContato, async () => {
      setActionFeedback('')

      try {
        if (!contatoForm.fornecedorId) {
          throw new Error('Cadastre ou selecione um fornecedor.')
        }

        const contato = await comprasApi.criarContatoFornecedor(contatoForm.fornecedorId, {
          nome: contatoForm.nome,
          cargo: contatoForm.cargo || null,
          telefone: contatoForm.telefone || null,
          email: contatoForm.email || null,
        })

        setContatoForm((current) => ({
          ...current,
          nome: '',
          cargo: '',
          telefone: '',
          email: '',
        }))
        await loadBackendData({
          silent: true,
          successMessage: `Contato ${contato.nome} cadastrado.`,
        })
      } catch (error) {
        setActionFeedback(`Nao foi possivel cadastrar contato: ${error.message}`)
      }
    })
  }

  async function handleCreateGrupo(event) {
    event.preventDefault()

    return runLocked(ACTIONS.cadastrarGrupo, async () => {
      setActionFeedback('')

      try {
        const grupo = await comprasApi.criarGrupo({
          nome: grupoForm.nome,
          ativo: true,
        })

        setGrupoForm({ nome: '' })
        setItemForm((current) => ({
          ...current,
          grupoId: String(grupo.id),
        }))
        await loadBackendData({
          silent: true,
          successMessage: `Grupo ${grupo.nome} cadastrado.`,
        })
      } catch (error) {
        setActionFeedback(`Nao foi possivel cadastrar grupo: ${error.message}`)
      }
    })
  }

  async function handleCreateItem(event) {
    event.preventDefault()

    return runLocked(ACTIONS.cadastrarItem, async () => {
      setActionFeedback('')

      try {
        if (!itemForm.grupoId) {
          throw new Error('Cadastre ou selecione um grupo de item.')
        }

        const item = await comprasApi.criarItem({
          codigo: itemForm.codigo,
          descricao: itemForm.descricao,
          unidade: itemForm.unidade,
          classificacao: itemForm.classificacao,
          grupo_id: Number(itemForm.grupoId),
          controla_estoque: itemForm.controlaEstoque,
          ativo: true,
        })

        setItemForm((current) => ({
          ...current,
          codigo: '',
          descricao: '',
          unidade: 'UN',
          classificacao: 'CUSTO',
          controlaEstoque: false,
        }))
        await loadBackendData({
          silent: true,
          successMessage: `Item ${item.codigo} cadastrado.`,
        })
      } catch (error) {
        setActionFeedback(`Nao foi possivel cadastrar item: ${error.message}`)
      }
    })
  }

  function handleRetornoCotacaoChange(cotacaoId) {
    const cotacao = cotacoes.find((item) => Number(item.id) === Number(cotacaoId))
    const firstFornecedor = cotacao?.fornecedores?.[0]

    setRetornoCotacao((current) => withRetornoStatus({
      ...current,
      cotacaoId,
      cotacaoFornecedorId: firstFornecedor?.id ? String(firstFornecedor.id) : '',
      itens: buildRetornoItens(cotacao, solicitacoes),
    }, retornoStatusFromFornecedor(firstFornecedor)))
  }

  function handleAprovacaoCotacaoChange(cotacaoId) {
    const cotacao = cotacoes.find((item) => Number(item.id) === Number(cotacaoId))
    const firstFornecedor = (cotacao?.fornecedores || []).find(
      (fornecedor) => fornecedor.status === 'RESPONDIDO',
    )

    setAprovacaoCotacao((current) => ({
      ...current,
      cotacaoId,
      fornecedorId: firstFornecedor?.fornecedor_id ? String(firstFornecedor.fornecedor_id) : '',
      justificativaAprovacao: '',
      justificativaRecusa: '',
      comentario: DEFAULT_APROVACAO_OBSERVACAO,
    }))
    setConfirmarRecusaCotacao(false)
  }

  function goToEnvioCotacao() {
    if (!selectedClassificacaoSolicitacao || itensClassificacao.length < 1) {
      return
    }

    setEnvioCotacao((current) => ({
      ...current,
      solicitacaoId: String(selectedClassificacaoSolicitacao.id),
    }))
    navigateToTab('enviar-cotacao')
  }

  function handleRecusarCotacao(event) {
    if (!confirmarRecusaCotacao) {
      event.preventDefault()
      setConfirmarRecusaCotacao(true)
      return
    }

    aprovarCotacao(event, 'REPROVAR')
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">SC</span>
          <div>
            <strong>Sistema de Compras</strong>
            <span>Prototipo integrado ao backend</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Navegacao principal">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              disabled={actionLocked}
              onClick={() => navigateToTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="api-panel">
          <span className={`status-dot ${apiStatus.tone}`} />
          <div>
            <strong>{apiStatus.label}</strong>
            <span>{API_BASE_URL}</span>
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Compras internas</span>
            <h1>Fluxo de solicitacao, cotacao, aprovacao e ordem de compra</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" onClick={handleLoadBackendData} disabled={loadingData || actionLocked}>
              <ButtonContent active={loadingData}>
                {loadingData ? 'Carregando...' : 'Atualizar dados'}
              </ButtonContent>
            </button>
            <button
              type="button"
              className="primary"
              disabled={actionLocked}
              onClick={() => navigateToTab('solicitacoes')}
            >
              Nova solicitacao
            </button>
          </div>
        </header>

        {actionFeedback && <div className="success-message">{actionFeedback}</div>}

        {activeTab === 'inicio' && (
          <div className="page-section">
            <section className="backend-status-screen">
              <div>
                <span className="eyebrow">Backend</span>
                <h2>Status da API</h2>
                <p>Esta tela chama o endpoint real configurado para o frontend.</p>
              </div>
              <div className={`backend-status-card ${apiStatus.tone}`}>
                <span className={`status-dot ${apiStatus.tone}`} />
                <div>
                  <strong>{apiStatus.label}</strong>
                  <span>{apiStatus.detail}</span>
                </div>
              </div>
              <div className="backend-endpoints">
                <div>
                  <span>Base da API</span>
                  <code>{API_BASE_URL}</code>
                </div>
                <div>
                  <span>Health check</span>
                  <code>{`${API_BASE_URL}${API_ROUTES.health}`}</code>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={checkApi} disabled={actionLocked}>
                  Checar novamente
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={loadingData || actionLocked}
                  onClick={handleLoadBackendData}
                >
                  <ButtonContent active={loadingData}>Carregar dados</ButtonContent>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'painel' && (
          <div className="page-section">
            <section className="metrics-grid">
              {metrics.map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </article>
              ))}
            </section>

            <section className="section-block">
              <div className="section-heading">
                <h2>Fluxo atual</h2>
                <span>dados vindos do backend</span>
              </div>
              <div className="flow-board">
                {[
                  ['ABERTA', 'Solicitacoes abertas'],
                  ['EM_COTACAO', 'Em cotacao'],
                  ['APROVADA', 'Aprovadas'],
                ].map(([status, title]) => (
                  <div className="flow-column" key={status}>
                    <h3>{title}</h3>
                    {solicitacoes
                      .filter((solicitacao) => solicitacao.status === status)
                      .slice(0, 4)
                      .map((solicitacao) => (
                        <button
                          className="request-item"
                          type="button"
                          key={solicitacao.id}
                          disabled={actionLocked}
                          onClick={() =>
                            navigateToTab(
                              solicitacao.status === 'ABERTA'
                                ? 'classificar-solicitacao'
                                : 'solicitacoes',
                            )
                          }
                        >
                          <strong>{solicitacaoNumero(solicitacao)}</strong>
                          <span>{solicitacaoPrincipalItem(solicitacao)}</span>
                          <small>{statusText(solicitacao.status)}</small>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'solicitacoes' && (
          <div className="page-section">
            <div className="split-layout">
              <section className="section-block">
                <div className="section-heading">
                  <h2>Nova solicitacao</h2>
                  <span>Texto livre da necessidade</span>
                </div>
                <form className="compact-form" onSubmit={handleCreateSolicitacao}>
                  <label>
                    Necessidade
                    <textarea
                      value={draft.descricaoNecessidade}
                      rows={6}
                      placeholder="Descreva o que precisa comprar"
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          descricaoNecessidade: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Urgencia
                      <select
                        value={draft.urgencia}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            urgencia: event.target.value,
                          }))
                        }
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                      </select>
                    </label>
                    <label>
                      Centro de custo
                      <input
                        value={draft.centroCusto}
                        placeholder="Ex.: Manutencao"
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            centroCusto: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      actionLocked ||
                      !draft.solicitanteId ||
                      !draft.descricaoNecessidade.trim()
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.criarSolicitacao}>
                      Criar solicitacao
                    </ButtonContent>
                  </button>
                </form>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Base pronta</h2>
                  <span>cadastros necessarios</span>
                </div>
                <SummaryCard
                  rows={[
                    ['Usuarios ativos', usuariosAtivos.length],
                    ['Fornecedores ativos', fornecedoresAtivos.length],
                    ['Itens ativos', itensAtivos.length],
                    ['Grupos', grupos.length],
                  ]}
                />
                <div className="form-actions">
                  <button
                    type="button"
                    className="danger-action"
                    disabled={actionLocked || solicitacoes.length < 1}
                    onClick={handleLimparSolicitacoesTeste}
                  >
                    <ButtonContent active={pendingAction === ACTIONS.limparSolicitacoes}>
                      Limpar solicitacoes
                    </ButtonContent>
                  </button>
                </div>
              </section>
            </div>

            <TableSection
              title="Solicitacoes"
              subtitle="Registro carregado pela API"
              rows={solicitacaoRows}
              columns={[
                ['numero', 'Numero'],
                ['solicitante', 'Solicitante'],
                ['item', 'Necessidade'],
                ['itens', 'Itens'],
                ['status', 'Status', StatusBadge],
                ['data', 'Data'],
              ]}
            />
          </div>
        )}

        {activeTab === 'classificar-solicitacao' && (
          <ActionScreen
            title="Classificar solicitacao"
            subtitle="Converte a necessidade em itens cadastrados para compra"
            endpoint="POST/PUT/DELETE /solicitacoes/:id/itens"
          >
            <form className="action-form" onSubmit={handleClassificarSolicitacao}>
              <div className="action-grid">
                <section className="section-block">
                  <div className="section-heading">
                    <h2>Necessidade</h2>
                    <span>{solicitacoesClassificaveis.length} abertas</span>
                  </div>
                  <label>
                    Solicitação
                    <select
                      value={classificacaoForm.solicitacaoId}
                      disabled={actionLocked}
                      onChange={(event) =>
                        handleClassificacaoSolicitacaoChange(event.target.value)
                      }
                    >
                      <option value="" disabled hidden>
                        Selecione uma solicitação
                      </option>
                      <option
                        value={CLASSIFICACAO_CREATE_SOLICITACAO_VALUE}
                        disabled={!defaultUsuarioId}
                      >
                        Criar solicitação
                      </option>
                      {solicitacoesClassificaveis.map((solicitacao) => (
                        <option key={solicitacao.id} value={solicitacao.id}>
                          {solicitacaoClassificacaoOption(solicitacao)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedClassificacaoSolicitacao ? (
                    <>
                      <div className="need-box">
                        <strong>Texto da solicitação</strong>
                        <p>{solicitacaoNecessidade(selectedClassificacaoSolicitacao)}</p>
                      </div>
                      <SummaryCard
                        rows={[
                          ['Numero', solicitacaoNumero(selectedClassificacaoSolicitacao)],
                          [
                            'Solicitante',
                            solicitacaoSolicitante(selectedClassificacaoSolicitacao),
                          ],
                          ['Status', statusText(selectedClassificacaoSolicitacao.status)],
                          ['Itens lancados', itensClassificacao.length],
                        ]}
                      />
                    </>
                  ) : (
                    <EmptyState
                      text={
                        isCreatingClassificacaoSolicitacao
                          ? 'A solicitacao sera criada ao lancar o primeiro item.'
                          : 'Selecione ou crie uma solicitacao para lancar itens.'
                      }
                    />
                  )}
                </section>

                <section className="section-block">
                  <div className="section-heading">
                    <h2>{isEditingClassificacaoItem ? 'Editar item' : 'Lancar item'}</h2>
                    <span>{itensAtivos.length} itens ativos</span>
                  </div>
                  <label>
                    Item correspondente
                    <select
                      value={classificacaoForm.itemId}
                      onChange={(event) =>
                        setClassificacaoForm((current) => ({
                          ...current,
                          itemId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione um item</option>
                      {itensAtivos.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.codigo ? `${item.codigo} - ${item.descricao}` : item.descricao}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="form-grid single-column">
                    <label>
                      Quantidade
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={classificacaoForm.quantidade}
                        onChange={(event) =>
                          setClassificacaoForm((current) => ({
                            ...current,
                            quantidade: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Observacoes do item
                      <textarea
                        value={classificacaoForm.observacoes}
                        onChange={(event) =>
                          setClassificacaoForm((current) => ({
                            ...current,
                            observacoes: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="form-actions form-actions-centered">
                    <button
                      type="button"
                      disabled={actionLocked}
                      onClick={() => navigateToTab('solicitacoes')}
                    >
                      Voltar a solicitacao
                    </button>
                    {isEditingClassificacaoItem && (
                      <button
                        type="button"
                        disabled={actionLocked}
                        onClick={handleCancelEditClassificacaoItem}
                      >
                        Cancelar edicao
                      </button>
                    )}
                    <button
                      type="submit"
                      className="primary"
                      disabled={
                        actionLocked ||
                        !hasClassificacaoSolicitacaoTarget ||
                        !selectedClassificacaoItem ||
                        Number(classificacaoForm.quantidade) <= 0
                      }
                    >
                      <ButtonContent
                        active={
                          pendingAction ===
                          (isEditingClassificacaoItem ? ACTIONS.editarItem : ACTIONS.lancarItem)
                        }
                      >
                        {isEditingClassificacaoItem ? 'Salvar edicao' : 'Lancar item'}
                      </ButtonContent>
                    </button>
                    <button
                      type="button"
                      disabled={
                        actionLocked ||
                        !selectedClassificacaoSolicitacao ||
                        itensClassificacao.length < 1
                      }
                      onClick={goToEnvioCotacao}
                    >
                      Avançar para pedir cotacao
                    </button>
                  </div>
                </section>
              </div>
            </form>

            <section className="section-block">
              <div className="section-heading">
                <h2>Itens lancados</h2>
                <span>{itensClassificacao.length} itens</span>
              </div>
              {itensClassificacao.length > 0 ? (
                <div className="classification-items">
                  {itensClassificacao.map((item) => (
                    <div
                      className={`classification-item-row${
                        Number(classificacaoForm.itemSolicitacaoId) === Number(item.id)
                          ? ' editing'
                          : ''
                      }`}
                      key={item.id}
                    >
                      <div>
                        <strong>{itemSolicitacaoDescricao(item)}</strong>
                        <span>
                          {Number(item.quantidade || 0)} {item.unidade_snapshot || ''}
                        </span>
                      </div>
                      <div className="classification-item-actions">
                        <button
                          type="button"
                          disabled={actionLocked}
                          onClick={() => handleEditClassificacaoItem(item)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={actionLocked}
                          onClick={() => handleRemoveClassificacaoItem(item.id)}
                        >
                          <ButtonContent active={pendingAction === ACTIONS.removerItem}>
                            Remover
                          </ButtonContent>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Nenhum item lancado para esta solicitacao." />
              )}
            </section>
          </ActionScreen>
        )}

        {activeTab === 'enviar-cotacao' && (
          <ActionScreen
            title="Enviar solicitacao para cotacao"
            subtitle="Cria a rodada de cotacao e convida fornecedores"
            endpoint="POST /cotacoes"
          >
            <form className="action-form" onSubmit={enviarSolicitacaoParaCotacao}>
              <div className="action-grid">
                <section className="section-block">
                  <div className="section-heading">
                    <h2>Solicitacao</h2>
                    <span>{solicitacoesCotaveis.length} disponiveis</span>
                  </div>
                  <label>
                    Solicitacao classificada
                    <select
                      value={envioCotacao.solicitacaoId}
                      onChange={(event) =>
                        setEnvioCotacao((current) => ({
                          ...current,
                          solicitacaoId: event.target.value,
                        }))
                      }
                    >
                      {solicitacoesCotaveis.map((solicitacao) => (
                        <option key={solicitacao.id} value={solicitacao.id}>
                          {solicitacaoCotacaoOption(solicitacao)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedEnvioSolicitacao ? (
                    <SummaryCard
                      rows={[
                        ['Numero', solicitacaoNumero(selectedEnvioSolicitacao)],
                        ['Solicitante', solicitacaoSolicitante(selectedEnvioSolicitacao)],
                        ['Status', statusText(selectedEnvioSolicitacao.status)],
                        ['Necessidade', solicitacaoPrincipalItem(selectedEnvioSolicitacao)],
                        ['Itens', solicitacaoResumoItens(selectedEnvioSolicitacao)],
                        ['Urgencia', solicitacaoUrgencia(selectedEnvioSolicitacao) || '-'],
                        ['Centro de custo', solicitacaoCentroCusto(selectedEnvioSolicitacao) || '-'],
                      ]}
                    />
                  ) : (
                    <EmptyState text="Nao ha solicitacao aprovada para cotacao." />
                  )}
                  <label className="full-width-label">
                    Usuario da acao
                    <select
                      value={envioCotacao.usuarioId}
                      onChange={(event) =>
                        setEnvioCotacao((current) => ({
                          ...current,
                          usuarioId: event.target.value,
                        }))
                      }
                    >
                      {usuariosAtivos.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuarioNome(usuario)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="full-width-label">
                    Observacoes
                    <textarea
                      value={envioCotacao.observacoes}
                      onChange={(event) =>
                        setEnvioCotacao((current) => ({
                          ...current,
                          observacoes: event.target.value,
                        }))
                      }
                    />
                  </label>
                </section>

                <section className="section-block">
                  <div className="section-heading">
                    <h2>Fornecedores</h2>
                    <span>convite da cotacao</span>
                  </div>
                  <div className="check-list">
                    {fornecedoresAtivos.map((fornecedor) => (
                      <label className="check-row" key={fornecedor.id}>
                        <input
                          type="checkbox"
                          checked={envioCotacao.fornecedorIds.includes(String(fornecedor.id))}
                          onChange={(event) => {
                            setEnvioCotacao((current) => ({
                              ...current,
                              fornecedorIds: event.target.checked
                                ? [...current.fornecedorIds, String(fornecedor.id)]
                                : current.fornecedorIds.filter(
                                    (id) => id !== String(fornecedor.id),
                                  ),
                            }))
                          }}
                        />
                        <span>
                          <strong>{fornecedorNome(fornecedor)}</strong>
                          <small>{fornecedor.cnpj || fornecedor.email || 'Sem contato'}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      disabled={actionLocked}
                      onClick={() => navigateToTab('solicitacoes')}
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="primary"
                      disabled={
                        actionLocked ||
                        !selectedEnvioSolicitacao ||
                        envioCotacao.fornecedorIds.length < 1 ||
                        !envioCotacao.usuarioId
                      }
                    >
                      <ButtonContent active={pendingAction === ACTIONS.enviarCotacao}>
                        Criar e enviar cotacao
                      </ButtonContent>
                    </button>
                  </div>
                </section>
              </div>
            </form>
          </ActionScreen>
        )}

        {activeTab === 'cotacoes' && (
          <div className="page-section">
            <TableSection
              title="Cotacoes"
              subtitle="Rodadas e respostas registradas"
              rows={cotacaoRows}
              columns={[
                ['numero', 'Numero'],
                ['rodada', 'Rodada'],
                ['respostas', 'Respostas'],
                ['melhorValor', 'Melhor valor', formatCurrency],
                ['status', 'Status', StatusBadge],
              ]}
            />
          </div>
        )}

        {activeTab === 'retorno-cotacao' && (
          <ActionScreen
            title="Lancamento de retorno da cotacao"
            subtitle="Registra a resposta recebida do fornecedor"
            endpoint="POST /cotacoes/:id/fornecedores/:fornecedorId/respostas"
          >
            <form className="action-form" onSubmit={handleRetornoCotacaoSubmit}>
              <div className="action-grid">
                <section className="section-block">
                  <div className="section-heading">
                    <h2>Cotacao</h2>
                    <span>{cotacoesComFornecedores.length} com fornecedores</span>
                  </div>
                  <label>
                    Cotacao
                    <select
                      value={retornoCotacao.cotacaoId}
                      onChange={(event) => handleRetornoCotacaoChange(event.target.value)}
                    >
                      {cotacoesComFornecedores.map((cotacao) => (
                        <option key={cotacao.id} value={cotacao.id}>
                          Solicitação {cotacaoNumero(cotacao)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedRetornoSolicitacao ? (
                    <SummaryCard
                      rows={[
                        ['Solicitacao', solicitacaoNumero(selectedRetornoSolicitacao)],
                        ['Necessidade', solicitacaoPrincipalItem(selectedRetornoSolicitacao)],
                        ['Itens', solicitacaoResumoItens(selectedRetornoSolicitacao)],
                        ['Status cotacao', statusText(selectedRetornoCotacao?.status)],
                      ]}
                    />
                  ) : (
                    <EmptyState text="Nao ha cotacao com fornecedor para registrar retorno." />
                  )}
                </section>

                <section className="section-block">
                  <div className="section-heading">
                    <h2>Fornecedor</h2>
                    <span>resposta recebida</span>
                  </div>
                  <label>
                    Fornecedor da cotacao
                    <select
                      value={retornoCotacao.cotacaoFornecedorId}
                      onChange={(event) => {
                        const fornecedor = (selectedRetornoCotacao?.fornecedores || []).find(
                          (item) => Number(item.id) === Number(event.target.value),
                        )

                        setRetornoCotacao((current) =>
                          withRetornoStatus(
                            {
                              ...current,
                              cotacaoFornecedorId: event.target.value,
                            },
                            retornoStatusFromFornecedor(fornecedor),
                          ),
                        )
                      }}
                    >
                      {(selectedRetornoCotacao?.fornecedores || []).map((fornecedor) => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedorNome(fornecedor)} - {statusText(fornecedor.status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status do retorno
                    <select
                      value={retornoCotacao.status}
                      onChange={(event) =>
                        setRetornoCotacao((current) =>
                          withRetornoStatus(current, event.target.value),
                        )
                      }
                    >
                      <option value="RESPONDIDO">Respondido</option>
                      <option value="RECUSADO">Recusado</option>
                      <option value="SEM_RESPOSTA">Sem resposta</option>
                    </select>
                  </label>
                  <div className="form-grid">
                    <label>
                      Prazo de entrega
                      <input
                        value={retornoCotacao.prazoEntrega}
                        disabled={retornoCotacao.status !== 'RESPONDIDO'}
                        onChange={(event) =>
                          setRetornoCotacao((current) => ({
                            ...current,
                            prazoEntrega: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Forma de pagamento
                      <select
                        value={retornoCotacao.tipoPagamento}
                        disabled={retornoCotacao.status !== 'RESPONDIDO'}
                        onChange={(event) =>
                          setRetornoCotacao((current) => ({
                            ...current,
                            tipoPagamento: event.target.value,
                            parcelasPagamento:
                              event.target.value === 'BOLETO'
                                ? current.parcelasPagamento || DEFAULT_RETORNO_PARCELAS
                                : DEFAULT_RETORNO_PARCELAS,
                          }))
                        }
                      >
                        <option value="BOLETO">Boleto</option>
                        <option value="A_VISTA">À vista</option>
                      </select>
                    </label>
                  </div>
                  {retornoCotacao.tipoPagamento === 'BOLETO' && (
                    <label className="full-width-label">
                      Parcelas do boleto
                      <select
                        value={retornoCotacao.parcelasPagamento}
                        disabled={retornoCotacao.status !== 'RESPONDIDO'}
                        onChange={(event) =>
                          setRetornoCotacao((current) => ({
                            ...current,
                            parcelasPagamento: event.target.value,
                          }))
                        }
                      >
                        {RETORNO_PARCELAS_OPTIONS.map((parcela) => (
                          <option key={parcela} value={parcela}>
                            {parcela}x
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Observacoes
                    <textarea
                      value={retornoCotacao.observacoes}
                      onChange={(event) =>
                        setRetornoCotacao((current) => ({
                          ...current,
                          observacoes: event.target.value,
                        }))
                      }
                    />
                  </label>
                </section>
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Itens cotados</h2>
                  <span>{formatCurrency(retornoTotal)}</span>
                </div>
                {retornoCotacao.itens.length > 0 ? (
                  <div className="quote-items">
                    {retornoCotacao.itens.map((item, index) => {
                      const disabled = retornoCotacao.status !== 'RESPONDIDO'
                      const itemTotal =
                        item.statusItem === 'INDISPONIVEL'
                          ? 0
                          : Number(item.quantidade || 0) * Number(item.valorUnitario || 0)

                      return (
                        <div className="quote-item-row" key={item.solicitacaoItemId || index}>
                          <div>
                            <strong>{item.descricao}</strong>
                            <span>
                              Solicitado: {item.quantidade} {item.unidade}
                            </span>
                          </div>
                          <label>
                            Status
                            <select
                              value={item.statusItem}
                              disabled={disabled}
                              onChange={(event) =>
                                setRetornoCotacao((current) => ({
                                  ...current,
                                  itens: current.itens.map((currentItem, currentIndex) =>
                                    currentIndex === index
                                      ? {
                                          ...currentItem,
                                          statusItem: event.target.value,
                                          valorUnitario:
                                            event.target.value === 'INDISPONIVEL'
                                              ? ''
                                              : currentItem.valorUnitario,
                                        }
                                      : currentItem,
                                  ),
                                }))
                              }
                            >
                              <option value="DISPONIVEL">Disponivel</option>
                              <option value="INDISPONIVEL">Indisponivel</option>
                            </select>
                          </label>
                          <label>
                            Valor unitario
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.valorUnitario}
                              disabled={disabled || item.statusItem === 'INDISPONIVEL'}
                              onChange={(event) =>
                                setRetornoCotacao((current) => ({
                                  ...current,
                                  itens: current.itens.map((currentItem, currentIndex) =>
                                    currentIndex === index
                                      ? { ...currentItem, valorUnitario: event.target.value }
                                      : currentItem,
                                  ),
                                }))
                              }
                            />
                          </label>
                          <b>{formatCurrency(itemTotal)}</b>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState text="Selecione uma cotacao com itens de solicitacao." />
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    disabled={actionLocked}
                    onClick={() => navigateToTab('cotacoes')}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      actionLocked ||
                      !selectedRetornoCotacao ||
                      !selectedRetornoFornecedor ||
                      !defaultUsuarioId
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.registrarRetorno}>
                      Registrar retorno
                    </ButtonContent>
                  </button>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Retornos ja lancados</h2>
                  <span>{respostasDaCotacao.length} registros</span>
                </div>
                <div className="response-history">
                  {respostasDaCotacao.map((fornecedor) => (
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
            </form>
          </ActionScreen>
        )}

        {activeTab === 'aprovar-cotacao' && (
          <ActionScreen
            title="Aprovar cotacao"
            subtitle="Escolhe o fornecedor pelo comparativo e cria a compra"
            endpoint="PATCH /cotacoes/:id/status"
          >
            <form className="action-form" onSubmit={(event) => event.preventDefault()}>
              <div className="action-grid">
                <section className="section-block solicitation-context">
                  <div className="section-heading">
                    <h2>Cotacao em aprovacao</h2>
                    <span>{cotacoesParaAprovacao.length} com resposta</span>
                  </div>
                  <label>
                    Cotacao
                    <select
                      value={aprovacaoCotacao.cotacaoId}
                      onChange={(event) => handleAprovacaoCotacaoChange(event.target.value)}
                    >
                      {cotacoesParaAprovacao.map((cotacao) => (
                        <option key={cotacao.id} value={cotacao.id}>
                          Solicitação {cotacaoNumero(cotacao)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedAprovacaoSolicitacao ? (
                    <>
                      <div className="linked-request-title">
                        <strong>{solicitacaoNumero(selectedAprovacaoSolicitacao)}</strong>
                        <StatusBadge value={selectedAprovacaoSolicitacao.status} />
                      </div>
                      <SummaryCard
                        rows={[
                          ['Necessidade', solicitacaoPrincipalItem(selectedAprovacaoSolicitacao)],
                          ['Itens', solicitacaoResumoItens(selectedAprovacaoSolicitacao)],
                          ['Solicitacao', cotacaoNumero(selectedAprovacaoCotacao)],
                          ['Rodada', selectedAprovacaoCotacao?.numero_rodada || 1],
                        ]}
                      />
                    </>
                  ) : (
                    <EmptyState text="Nao ha cotacao respondida para aprovar." />
                  )}
                </section>

                <section className="section-block comparison-block">
                  <div className="section-heading">
                    <h2>Comparativo de fornecedores</h2>
                    <span>respostas reais da cotacao</span>
                  </div>
                  <div className="supplier-comparison">
                    {(selectedAprovacaoCotacao?.fornecedores || [])
                      .filter((fornecedor) => fornecedor.status === 'RESPONDIDO')
                      .map((fornecedor) => (
                        <label className="supplier-card" key={fornecedor.id}>
                          <input
                            type="radio"
                            name="fornecedor-vencedor"
                            checked={
                              Number(aprovacaoCotacao.fornecedorId) ===
                              Number(fornecedor.fornecedor_id)
                            }
                            onChange={() => {
                              setAprovacaoCotacao((current) => ({
                                ...current,
                                fornecedorId: String(fornecedor.fornecedor_id),
                              }))
                              setConfirmarRecusaCotacao(false)
                            }}
                          />
                          <span>
                            <strong>{fornecedorNome(fornecedor)}</strong>
                            <small>
                              {fornecedor.prazo_entrega || 'Prazo nao informado'} |{' '}
                              {fornecedor.forma_pagamento || 'Pagamento nao informado'}
                            </small>
                          </span>
                          <b>{formatCurrency(cotacaoFornecedorTotal(fornecedor))}</b>
                        </label>
                      ))}
                  </div>
                </section>
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Decisao</h2>
                  <span>compra gerada no backend</span>
                </div>
                <div className="action-grid">
                  <label>
                    Justificativa do aceite
                    <select
                      value={aprovacaoCotacao.justificativaAprovacao}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          justificativaAprovacao: event.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione uma justificativa</option>
                      {APROVACAO_JUSTIFICATIVAS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Justificativa da recusa
                    <select
                      value={aprovacaoCotacao.justificativaRecusa}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          justificativaRecusa: event.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione uma justificativa</option>
                      {RECUSA_JUSTIFICATIVAS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="full-width-label">
                  Comentario
                  <textarea
                    value={aprovacaoCotacao.comentario}
                    onChange={(event) =>
                      setAprovacaoCotacao((current) => ({
                        ...current,
                        comentario: event.target.value,
                      }))
                    }
                    placeholder="Opcional para aceite e recusa"
                  />
                </label>
                <div className="form-actions">
                  <button
                    type="button"
                    disabled={actionLocked}
                    onClick={() => navigateToTab('cotacoes')}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={(event) => aprovarCotacao(event, 'APROVAR')}
                    disabled={
                      actionLocked ||
                      !selectedAprovacaoCotacao ||
                      !(aprovacaoCotacao.usuarioId || defaultUsuarioId) ||
                      !selectedAprovacaoFornecedor ||
                      !aprovacaoCotacao.justificativaAprovacao ||
                      (aprovacaoCotacao.justificativaAprovacao === 'OUTRO' &&
                        !aprovacaoCotacao.comentario.trim())
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.aceitarCotacao}>
                      Aceitar
                    </ButtonContent>
                  </button>
                  <button
                    type="button"
                    className="danger-action"
                    onClick={handleRecusarCotacao}
                    disabled={
                      actionLocked ||
                      !selectedAprovacaoCotacao ||
                      !(aprovacaoCotacao.usuarioId || defaultUsuarioId) ||
                      !aprovacaoCotacao.justificativaRecusa
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.recusarCotacao}>
                      {confirmarRecusaCotacao ? 'Confirmar recusa' : 'Recusar'}
                    </ButtonContent>
                  </button>
                </div>
              </section>
            </form>
          </ActionScreen>
        )}

        {activeTab === 'compras' && (
          <div className="page-section">
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <h2>Ordem de compra</h2>
                  <span>gera ordem para uma compra aprovada sem ordem ativa</span>
                </div>
                <button
                  type="button"
                  className="primary"
                  onClick={createOrdemCompra}
                  disabled={actionLocked || !compraFornecedorElegivel || !defaultUsuarioId}
                >
                  <ButtonContent active={pendingAction === ACTIONS.gerarOrdemCompra}>
                    Gerar ordem de compra
                  </ButtonContent>
                </button>
              </div>
              {compraFornecedorElegivel ? (
                <SummaryCard
                  rows={[
                    ['Solicitacao', compraNumero(compraFornecedorElegivel.compra)],
                    ['Fornecedor', fornecedorNome(compraFornecedorElegivel.fornecedor)],
                    ['Total', formatCurrency(compraTotal(compraFornecedorElegivel.compra))],
                  ]}
                />
              ) : (
                <EmptyState text="Nenhuma compra aprovada pendente de ordem." />
              )}
            </section>
            <TableSection
              title="Compras"
              subtitle="Escolha de fornecedor e aprovacao"
              rows={compraRows}
              columns={[
                ['numero', 'Numero'],
                ['fornecedor', 'Fornecedor'],
                ['aprovador', 'Responsavel'],
                ['total', 'Total', formatCurrency],
                ['status', 'Status', StatusBadge],
              ]}
            />
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
        )}

        {activeTab === 'cadastro-base' && (
          <ActionScreen
            title="Cadastrar fornecedores, contatos e itens"
            subtitle="Cria os cadastros minimos para alimentar o fluxo"
            endpoint="POST /fornecedores, /fornecedores/:id/contatos, /grupos, /itens"
          >
            <div className="action-grid">
              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Fornecedor</h2>
                    <span>POST /fornecedores</span>
                  </div>
                  <strong>{fornecedores.length}</strong>
                </div>
                <form className="compact-form" onSubmit={handleCreateFornecedor}>
                  <label>
                    CNPJ
                    <input
                      value={fornecedorForm.cnpj}
                      onChange={(event) =>
                        setFornecedorForm((current) => ({
                          ...current,
                          cnpj: event.target.value,
                        }))
                      }
                      placeholder="00.000.000/0001-00"
                    />
                  </label>
                  <label>
                    Razao social
                    <input
                      value={fornecedorForm.razaoSocial}
                      onChange={(event) =>
                        setFornecedorForm((current) => ({
                          ...current,
                          razaoSocial: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Nome fantasia
                    <input
                      value={fornecedorForm.nomeFantasia}
                      onChange={(event) =>
                        setFornecedorForm((current) => ({
                          ...current,
                          nomeFantasia: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Telefone
                      <input
                        value={fornecedorForm.telefone}
                        onChange={(event) =>
                          setFornecedorForm((current) => ({
                            ...current,
                            telefone: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      E-mail
                      <input
                        type="email"
                        value={fornecedorForm.email}
                        onChange={(event) =>
                          setFornecedorForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      actionLocked ||
                      !fornecedorForm.cnpj ||
                      !fornecedorForm.razaoSocial
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.cadastrarFornecedor}>
                      Cadastrar fornecedor
                    </ButtonContent>
                  </button>
                </form>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Contato do fornecedor</h2>
                    <span>POST /fornecedores/:id/contatos</span>
                  </div>
                  <strong>{contatosFornecedor.length}</strong>
                </div>
                <form className="compact-form" onSubmit={handleCreateContato}>
                  <label>
                    Fornecedor
                    <select
                      value={contatoForm.fornecedorId}
                      onChange={(event) =>
                        setContatoForm((current) => ({
                          ...current,
                          fornecedorId: event.target.value,
                        }))
                      }
                    >
                      {fornecedoresAtivos.map((fornecedor) => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedorNome(fornecedor)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nome do contato
                    <input
                      value={contatoForm.nome}
                      onChange={(event) =>
                        setContatoForm((current) => ({
                          ...current,
                          nome: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Cargo
                    <input
                      value={contatoForm.cargo}
                      onChange={(event) =>
                        setContatoForm((current) => ({
                          ...current,
                          cargo: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Telefone
                      <input
                        value={contatoForm.telefone}
                        onChange={(event) =>
                          setContatoForm((current) => ({
                            ...current,
                            telefone: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      E-mail
                      <input
                        type="email"
                        value={contatoForm.email}
                        onChange={(event) =>
                          setContatoForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="primary"
                    disabled={actionLocked || !contatoForm.fornecedorId || !contatoForm.nome}
                  >
                    <ButtonContent active={pendingAction === ACTIONS.cadastrarContato}>
                      Cadastrar contato
                    </ButtonContent>
                  </button>
                </form>
              </section>
            </div>

            <div className="action-grid">
              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Grupo de item</h2>
                    <span>POST /grupos</span>
                  </div>
                  <strong>{grupos.length}</strong>
                </div>
                <form className="compact-form" onSubmit={handleCreateGrupo}>
                  <label>
                    Nome do grupo
                    <input
                      value={grupoForm.nome}
                      onChange={(event) =>
                        setGrupoForm({
                          nome: event.target.value,
                        })
                      }
                      placeholder="Manutencao, Almoxarifado, EPIs..."
                    />
                  </label>
                  <button
                    type="submit"
                    className="primary"
                    disabled={actionLocked || !grupoForm.nome}
                  >
                    <ButtonContent active={pendingAction === ACTIONS.cadastrarGrupo}>
                      Cadastrar grupo
                    </ButtonContent>
                  </button>
                </form>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Item de compra</h2>
                    <span>POST /itens</span>
                  </div>
                  <strong>{itens.length}</strong>
                </div>
                <form className="compact-form" onSubmit={handleCreateItem}>
                  <div className="form-grid">
                    <label>
                      Codigo
                      <input
                        value={itemForm.codigo}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            codigo: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Unidade
                      <input
                        value={itemForm.unidade}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            unidade: event.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Descricao
                    <input
                      value={itemForm.descricao}
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          descricao: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Grupo
                      <select
                        value={itemForm.grupoId}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            grupoId: event.target.value,
                          }))
                        }
                      >
                        {gruposAtivos.map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Classificacao
                      <select
                        value={itemForm.classificacao}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            classificacao: event.target.value,
                          }))
                        }
                      >
                        <option value="CUSTO">Custo</option>
                        <option value="DESPESA">Despesa</option>
                        <option value="INVESTIMENTO">Investimento</option>
                        <option value="PLR">PLR</option>
                      </select>
                    </label>
                  </div>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={itemForm.controlaEstoque}
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          controlaEstoque: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      <strong>Controla estoque</strong>
                      <small>Marca o item como controlado no cadastro</small>
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      actionLocked ||
                      !itemForm.codigo ||
                      !itemForm.descricao ||
                      !itemForm.unidade ||
                      !itemForm.grupoId
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.cadastrarItem}>
                      Cadastrar item
                    </ButtonContent>
                  </button>
                </form>
              </section>
            </div>
          </ActionScreen>
        )}

        {activeTab === 'cadastros' && (
          <div className="page-section">
            <section className="catalog-grid">
              <ListBlock title="Fornecedores" items={fornecedores} />
              <ListBlock title="Contatos" items={contatosFornecedor} />
              <ListBlock title="Grupos de item" items={grupos} />
              <ListBlock title="Itens de compra" items={itens} />
              <ListBlock title="Usuarios" items={usuarios} />
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

function StatusBadge(props) {
  const value =
    props && typeof props === 'object' && Object.hasOwn(props, 'value') ? props.value : props

  return <span className={`badge ${statusClass[value] || 'neutral'}`}>{statusText(value)}</span>
}

function ButtonContent({ active, children }) {
  return (
    <span className="button-content">
      {active && <span className="button-spinner" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}

function ActionScreen({ title, subtitle, endpoint, children }) {
  return (
    <div className="page-section">
      <section className="action-header">
        <div>
          <span className="eyebrow">Tela de acao</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <code>{endpoint}</code>
      </section>
      {children}
    </div>
  )
}

function SummaryCard({ rows }) {
  return (
    <dl className="summary-card">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>
}

function TableSection({ title, subtitle, rows, columns }) {
  return (
    <section className="table-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        <strong>{rows.length}</strong>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map(([key, label, formatter]) => (
                  <td key={`${row.id}-${label}`}>
                    {formatter ? formatter(row[key], row) : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ListBlock({ title, items }) {
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
              item.cnpj || item.codigo || item.email || item.unidade || item.cargo,
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

export default App
