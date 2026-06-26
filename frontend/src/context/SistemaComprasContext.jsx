import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL, API_ROUTES } from '../config/api'
import { sistemaComprasApi as comprasApi } from '../api'
import { SistemaComprasContext } from './comprasContext'
import {
  ACTIONS,
  DEFAULT_APROVACAO_OBSERVACAO,
  CENTROS_CUSTO_ORDEM_COMPRA,
  DEFAULT_ENVIO_OBSERVACOES,
  DEFAULT_RETORNO_OBSERVACOES,
  DEFAULT_RETORNO_PARCELAS,
  DEFAULT_RETORNO_PRAZO,
  DEFAULT_RETORNO_TIPO_PAGAMENTO,
  DEFAULT_URGENCIA,
  SCREEN_ROUTES,
  CLASSIFICACAO_CREATE_SOLICITACAO_VALUE,
  finalCotacaoStatuses,
  routeToScreen,
} from '../utils/constants'
import {
  aprovacaoObservacao,
  buildRetornoItens,
  buildSolicitacaoObservacoes,
  calculateResponseTotal,
  compraNumero,
  compraTotal,
  cotacaoMelhorValor,
  cotacaoNumero,
  fornecedorNome,
  formatCurrency,
  formatDate,
  isActiveFornecedor,
  isActiveItem,
  isActiveUsuario,
  ordemNumero,
  ordemTotal,
  retornoFormaPagamentoText,
  retornoStatusFromFornecedor,
  solicitacaoItensCatalogados,
  solicitacaoNumero,
  solicitacaoPrincipalItem,
  solicitacaoSolicitante,
  usuarioNome,
  withRetornoStatus,
} from '../utils/formatters'

export function SistemaComprasProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = routeToScreen(location.pathname)
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
  })
  const [ordemCompraForm, setOrdemCompraForm] = useState({
    compraFornecedorIds: [],
    centroCusto: CENTROS_CUSTO_ORDEM_COMPRA[0],
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
    solicitacaoItemId: '',
    itemFornecedorIds: {},
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

  const itensAprovacaoCotacao = useMemo(
    () => solicitacaoItensCatalogados(selectedAprovacaoSolicitacao),
    [selectedAprovacaoSolicitacao],
  )

  const selectedAprovacaoItem = useMemo(
    () =>
      itensAprovacaoCotacao.find(
        (item) => Number(item.id) === Number(aprovacaoCotacao.solicitacaoItemId),
      ) || itensAprovacaoCotacao[0],
    [aprovacaoCotacao.solicitacaoItemId, itensAprovacaoCotacao],
  )

  const fornecedoresAprovacaoItem = useMemo(
    () =>
      (selectedAprovacaoCotacao?.fornecedores || [])
        .filter((fornecedor) => fornecedor.status === 'RESPONDIDO')
        .map((fornecedor) => ({
          fornecedor,
          respostaItem: (fornecedor.itens || []).find(
            (item) =>
              Number(item.solicitacao_item_id) === Number(selectedAprovacaoItem?.id) &&
              item.status_item === 'DISPONIVEL',
          ),
        }))
        .filter((item) => item.respostaItem),
    [selectedAprovacaoCotacao, selectedAprovacaoItem],
  )

  const selectedAprovacaoFornecedor = useMemo(
    () =>
      fornecedoresAprovacaoItem.find(
        ({ fornecedor }) =>
          Number(fornecedor.fornecedor_id) === Number(aprovacaoCotacao.fornecedorId),
      ),
    [aprovacaoCotacao.fornecedorId, fornecedoresAprovacaoItem],
  )

  const escolhasAprovacaoItens = useMemo(
    () =>
      itensAprovacaoCotacao.map((item) => {
        const fornecedorId = aprovacaoCotacao.itemFornecedorIds[String(item.id)]
        const fornecedor = (selectedAprovacaoCotacao?.fornecedores || []).find(
          (cotacaoFornecedor) =>
            Number(cotacaoFornecedor.fornecedor_id) === Number(fornecedorId),
        )
        const respostaItem = (fornecedor?.itens || []).find(
          (resposta) =>
            Number(resposta.solicitacao_item_id) === Number(item.id) &&
            resposta.status_item === 'DISPONIVEL',
        )

        return {
          item,
          fornecedor: respostaItem ? fornecedor : null,
          respostaItem,
        }
      }),
    [aprovacaoCotacao.itemFornecedorIds, itensAprovacaoCotacao, selectedAprovacaoCotacao],
  )

  const aprovacaoItensPendentes = useMemo(
    () => escolhasAprovacaoItens.filter((item) => !item.fornecedor),
    [escolhasAprovacaoItens],
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

  const compraFornecedoresElegiveis = useMemo(() => {
    const ordensAtivas = new Set(
      ordensCompra
        .filter((ordem) => ordem.status === 'GERADA')
        .map((ordem) => Number(ordem.compra_fornecedor_id)),
    )
    const elegiveis = []

    for (const compra of compras) {
      if (compra.status !== 'APROVADA') {
        continue
      }

      for (const fornecedor of compra.fornecedores || []) {
        if (!ordensAtivas.has(Number(fornecedor.id))) {
          elegiveis.push({ compra, fornecedor })
        }
      }
    }

    return elegiveis
  }, [compras, ordensCompra])
  const compraFornecedorElegivel = compraFornecedoresElegiveis[0] || null
  const selectedCompraFornecedoresOrdem = useMemo(
    () =>
      compraFornecedoresElegiveis.filter((item) =>
        ordemCompraForm.compraFornecedorIds.includes(String(item.fornecedor.id)),
      ),
    [compraFornecedoresElegiveis, ordemCompraForm.compraFornecedorIds],
  )

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
    })
  }

  function resetOrdemCompraForm() {
    setOrdemCompraForm({
      compraFornecedorIds: compraFornecedoresElegiveis[0]?.fornecedor?.id
        ? [String(compraFornecedoresElegiveis[0].fornecedor.id)]
        : [],
      centroCusto: CENTROS_CUSTO_ORDEM_COMPRA[0],
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
      return
    }

    if (tabId === 'compras') {
      resetOrdemCompraForm()
    }
  }

  function navigateToTab(tabId, { clearFeedback = true } = {}) {
    if (tabId !== activeTab) {
      resetTabState(activeTab)

      if (clearFeedback) {
        setActionFeedback('')
      }
    }

    navigate(SCREEN_ROUTES[tabId] || SCREEN_ROUTES.painel)
  }

  function syncFormDefaults({
    usuariosData,
    fornecedoresData,
    gruposData,
    itensData,
    solicitacoesData,
    cotacoesData,
    comprasData,
    ordensData,
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
    const nextOrdensAtivas = new Set(
      ordensData
        .filter((ordem) => ordem.status === 'GERADA')
        .map((ordem) => Number(ordem.compra_fornecedor_id)),
    )
    const nextCompraFornecedorIdsElegiveis = comprasData
      .filter((compra) => compra.status === 'APROVADA')
      .flatMap((compra) => compra.fornecedores || [])
      .filter((fornecedor) => !nextOrdensAtivas.has(Number(fornecedor.id)))
      .map((fornecedor) => String(fornecedor.id))

    setDraft((current) => {
      const userIsValid = nextUsuariosAtivos.some(
        (usuario) => Number(usuario.id) === Number(current.solicitanteId),
      )

      return {
        ...current,
        solicitanteId: userIsValid ? current.solicitanteId : nextDefaultUsuarioId,
      }
    })

    setOrdemCompraForm((current) => {
      const compraFornecedorIds = current.compraFornecedorIds.filter((id) =>
        nextCompraFornecedorIdsElegiveis.includes(String(id)),
      )

      return {
        centroCusto: CENTROS_CUSTO_ORDEM_COMPRA.includes(current.centroCusto)
          ? current.centroCusto
          : CENTROS_CUSTO_ORDEM_COMPRA[0],
        compraFornecedorIds:
          compraFornecedorIds.length > 0
            ? compraFornecedorIds
            : nextCompraFornecedorIdsElegiveis[0]
              ? [nextCompraFornecedorIdsElegiveis[0]]
              : [],
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
      const solicitacaoAtual = solicitacoesData.find(
        (solicitacao) => Number(solicitacao.id) === Number(cotacaoAtual?.solicitacao_id),
      )
      const itensAprovacao = solicitacaoItensCatalogados(solicitacaoAtual)
      const itemAtual =
        itensAprovacao.find((item) => Number(item.id) === Number(current.solicitacaoItemId)) ||
        itensAprovacao[0]
      const itemIdsValidos = new Set(itensAprovacao.map((item) => String(item.id)))
      const fornecedorIdsRespondidos = new Set(
        fornecedoresRespondidos.map((fornecedor) => String(fornecedor.fornecedor_id)),
      )
      const itemFornecedorIds = Object.fromEntries(
        Object.entries(current.itemFornecedorIds || {}).filter(
          ([itemId, fornecedorId]) =>
            itemIdsValidos.has(String(itemId)) &&
            fornecedorIdsRespondidos.has(String(fornecedorId)),
        ),
      )

      return {
        ...current,
        cotacaoId: cotacaoAtual?.id ? String(cotacaoAtual.id) : '',
        fornecedorId: '',
        solicitacaoItemId: itemAtual?.id ? String(itemAtual.id) : '',
        itemFornecedorIds,
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
        comprasData,
        ordensData,
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
          }),
        })

        setDraft((current) => ({
          ...current,
          descricaoNecessidade: '',
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

        if (!aprovacaoCotacao.justificativaAprovacao) {
          throw new Error('Selecione uma justificativa para aceitar a cotacao.')
        }

        if (aprovacaoCotacao.justificativaAprovacao === 'OUTRO' && !comentario) {
          throw new Error('Informe um comentario para a justificativa Outro.')
        }

        if (itensAprovacaoCotacao.length < 1) {
          throw new Error('Cotacao sem itens catalogados para aprovar.')
        }

        if (aprovacaoItensPendentes.length > 0) {
          throw new Error('Escolha um fornecedor para todos os itens antes de aceitar.')
        }

        const compra = await comprasApi.aprovarCotacaoPorItens(selectedAprovacaoCotacao.id, {
          usuario_id: Number(usuarioAprovadorId),
          observacao,
          justificativas: [aprovacaoCotacao.justificativaAprovacao],
          itens: itensAprovacaoCotacao.map((item) => ({
            solicitacao_item_id: Number(item.id),
            fornecedor_id: Number(aprovacaoCotacao.itemFornecedorIds[String(item.id)]),
          })),
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
        if (selectedCompraFornecedoresOrdem.length < 1) {
          throw new Error('Selecione ao menos uma ordem pendente para gerar.')
        }

        if (!CENTROS_CUSTO_ORDEM_COMPRA.includes(ordemCompraForm.centroCusto)) {
          throw new Error('Selecione um centro de custo valido.')
        }

        for (const item of selectedCompraFornecedoresOrdem) {
          await comprasApi.criarOrdemCompra({
            compra_fornecedor_id: Number(item.fornecedor.id),
            usuario_id: Number(defaultUsuarioId),
            observacoes: `Centro de custo: ${ordemCompraForm.centroCusto}. Ordem gerada pelo prototipo.`,
          })
        }

        await loadBackendData({
          silent: true,
          successMessage: `${selectedCompraFornecedoresOrdem.length} ordem(ns) de compra gerada(s) para ${ordemCompraForm.centroCusto}.`,
        })
        setOrdemCompraForm((current) => ({
          ...current,
          compraFornecedorIds: [],
        }))
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
    const solicitacao = solicitacoes.find(
      (item) => Number(item.id) === Number(cotacao?.solicitacao_id),
    )
    const firstItem = solicitacaoItensCatalogados(solicitacao)[0]

    setAprovacaoCotacao((current) => ({
      ...current,
      cotacaoId,
      fornecedorId: '',
      solicitacaoItemId: firstItem?.id ? String(firstItem.id) : '',
      itemFornecedorIds: {},
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


  const value = {
    activeTab,
    usuarios,
    fornecedores,
    contatosFornecedor,
    grupos,
    itens,
    solicitacoes,
    cotacoes,
    compras,
    ordensCompra,
    loadingData,
    pendingAction,
    actionFeedback,
    apiStatus,
    draft,
    classificacaoForm,
    envioCotacao,
    retornoCotacao,
    aprovacaoCotacao,
    ordemCompraForm,
    confirmarRecusaCotacao,
    fornecedorForm,
    contatoForm,
    grupoForm,
    itemForm,
    usuariosAtivos,
    fornecedoresAtivos,
    gruposAtivos,
    itensAtivos,
    defaultUsuario,
    defaultUsuarioId,
    actionLocked,
    solicitacoesClassificaveis,
    solicitacoesCotaveis,
    cotacoesAbertas,
    cotacoesComFornecedores,
    cotacoesParaAprovacao,
    selectedEnvioSolicitacao,
    selectedClassificacaoSolicitacao,
    selectedClassificacaoItem,
    itensClassificacao,
    isEditingClassificacaoItem,
    isCreatingClassificacaoSolicitacao,
    hasClassificacaoSolicitacaoTarget,
    selectedRetornoCotacao,
    selectedRetornoSolicitacao,
    selectedRetornoFornecedor,
    selectedAprovacaoCotacao,
    selectedAprovacaoSolicitacao,
    itensAprovacaoCotacao,
    selectedAprovacaoItem,
    fornecedoresAprovacaoItem,
    selectedAprovacaoFornecedor,
    escolhasAprovacaoItens,
    aprovacaoItensPendentes,
    respostasDaCotacao,
    retornoTotal,
    compraFornecedorElegivel,
    compraFornecedoresElegiveis,
    selectedCompraFornecedoresOrdem,
    comprasPorId,
    metrics,
    solicitacaoRows,
    cotacaoRows,
    compraRows,
    ordemRows,
    setDraft,
    setClassificacaoForm,
    setEnvioCotacao,
    setRetornoCotacao,
    setAprovacaoCotacao,
    setOrdemCompraForm,
    setConfirmarRecusaCotacao,
    setFornecedorForm,
    setContatoForm,
    setGrupoForm,
    setItemForm,
    setActionFeedback,
    navigateToTab,
    loadBackendData,
    handleLoadBackendData,
    checkApi,
    handleCreateSolicitacao,
    handleClassificacaoSolicitacaoChange,
    handleClassificarSolicitacao,
    handleEditClassificacaoItem,
    handleCancelEditClassificacaoItem,
    handleRemoveClassificacaoItem,
    handleLimparSolicitacoesTeste,
    enviarSolicitacaoParaCotacao,
    handleRetornoCotacaoSubmit,
    aprovarCotacao,
    createOrdemCompra,
    handleCreateFornecedor,
    handleCreateContato,
    handleCreateGrupo,
    handleCreateItem,
    handleRetornoCotacaoChange,
    handleAprovacaoCotacaoChange,
    goToEnvioCotacao,
    handleRecusarCotacao,
  }

  return (
    <SistemaComprasContext.Provider value={value}>
      {children}
    </SistemaComprasContext.Provider>
  )
}
