import { useMemo, useState } from 'react'
import { API_BASE_URL } from './config/api'
import { comprasApi } from './services/api'
import {
  demoCompras,
  demoCotacaoRespostas,
  demoCotacoes,
  demoFornecedores,
  demoItens,
  demoOrdensCompra,
  demoSolicitacoes,
  demoUsuarios,
} from './data/demoData'
import './App.css'

const tabs = [
  { id: 'painel', label: 'Painel' },
  { id: 'solicitacoes', label: 'Solicitacoes' },
  { id: 'enviar-cotacao', label: 'Enviar cotacao' },
  { id: 'cotacoes', label: 'Cotacoes' },
  { id: 'retorno-cotacao', label: 'Retorno cotacao' },
  { id: 'aprovar-cotacao', label: 'Aprovar cotacao' },
  { id: 'compras', label: 'Compras' },
  { id: 'cadastros', label: 'Cadastros' },
]

const statusLabels = {
  ABERTA: 'Aberta',
  APROVADA: 'Aprovada',
  EM_COTACAO: 'Em cotacao',
  EM_ANDAMENTO: 'Em andamento',
  COMPRA_APROVADA: 'Compra aprovada',
  EM_MONTAGEM: 'Em montagem',
  GERADA: 'Gerada',
  PENDENTE: 'Pendente',
  RESPONDIDO: 'Respondido',
  RECUSADO: 'Recusado',
  SEM_RESPOSTA: 'Sem resposta',
  DISPONIVEL: 'Disponivel',
  INDISPONIVEL: 'Indisponivel',
  APROVAR: 'Aprovar',
  REPROVAR: 'Reprovar',
}

const statusClass = {
  ABERTA: 'info',
  APROVADA: 'success',
  EM_COTACAO: 'warning',
  EM_ANDAMENTO: 'warning',
  COMPRA_APROVADA: 'success',
  EM_MONTAGEM: 'info',
  GERADA: 'success',
  PENDENTE: 'warning',
  RESPONDIDO: 'success',
  RECUSADO: 'danger',
  SEM_RESPOSTA: 'neutral',
  DISPONIVEL: 'success',
  INDISPONIVEL: 'danger',
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function statusText(status) {
  return statusLabels[status] || status
}

function buildRetornoItens(cotacao, solicitacoes) {
  const solicitacao = solicitacoes.find((item) => item.numero === cotacao?.solicitacao)

  if (!solicitacao) {
    return []
  }

  return [
    {
      descricao: solicitacao.item,
      quantidade: solicitacao.quantidade,
      unidade: solicitacao.unidade,
      statusItem: 'DISPONIVEL',
      valorUnitario: '',
      observacoes: '',
    },
  ]
}

function calculateResponseTotal(itens) {
  return itens.reduce((sum, item) => {
    if (item.statusItem === 'INDISPONIVEL') {
      return sum
    }

    return sum + Number(item.quantidade || 0) * Number(item.valorUnitario || 0)
  }, 0)
}

function App() {
  const [activeTab, setActiveTab] = useState('painel')
  const [solicitacoes, setSolicitacoes] = useState(demoSolicitacoes)
  const [cotacoes, setCotacoes] = useState(demoCotacoes)
  const [cotacaoRespostas, setCotacaoRespostas] = useState(demoCotacaoRespostas)
  const [compras, setCompras] = useState(demoCompras)
  const [ordensCompra, setOrdensCompra] = useState(demoOrdensCompra)
  const [apiStatus, setApiStatus] = useState({
    label: 'Modo demonstracao',
    tone: 'neutral',
  })
  const [draft, setDraft] = useState({
    item: demoItens[0].descricao,
    quantidade: 10,
    centroCusto: 'Manutencao',
    prioridade: 'Normal',
  })
  const [envioCotacao, setEnvioCotacao] = useState({
    solicitacaoId: demoSolicitacoes.find((item) => item.status === 'ABERTA')?.id || '',
    fornecedorIds: demoFornecedores.slice(0, 3).map((item) => String(item.id)),
    prazoResposta: '2026-06-10',
    observacoes: 'Solicitar orcamento formal com prazo de entrega e condicao de pagamento.',
  })
  const [aprovacaoCotacao, setAprovacaoCotacao] = useState({
    cotacaoId: demoCotacoes.find((item) => item.status === 'EM_ANDAMENTO')?.id || '',
    fornecedorId: String(demoFornecedores[1].id),
    decisao: 'APROVAR',
    observacao: 'Melhor valor com fornecedor homologado e prazo compativel.',
  })
  const firstOpenCotacao = demoCotacoes.find((item) => item.status === 'EM_ANDAMENTO')
  const [retornoCotacao, setRetornoCotacao] = useState({
    cotacaoId: firstOpenCotacao?.id || '',
    fornecedorId: String(demoFornecedores[2].id),
    status: 'RESPONDIDO',
    prazoEntrega: '5 dias',
    formaPagamento: '30 dias',
    observacoes: 'Condicoes recebidas por email e lancadas manualmente.',
    anexo: '',
    itens: buildRetornoItens(firstOpenCotacao, demoSolicitacoes),
  })
  const [retornoFeedback, setRetornoFeedback] = useState('')

  const solicitacoesAbertas = useMemo(
    () => solicitacoes.filter((solicitacao) => solicitacao.status === 'ABERTA'),
    [solicitacoes],
  )

  const cotacoesEmAndamento = useMemo(
    () => cotacoes.filter((cotacao) => cotacao.status === 'EM_ANDAMENTO'),
    [cotacoes],
  )

  const selectedEnvioSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => solicitacao.id === Number(envioCotacao.solicitacaoId),
      ),
    [envioCotacao.solicitacaoId, solicitacoes],
  )

  const selectedAprovacaoCotacao = useMemo(
    () =>
      cotacoes.find((cotacao) => cotacao.id === Number(aprovacaoCotacao.cotacaoId)),
    [aprovacaoCotacao.cotacaoId, cotacoes],
  )

  const selectedAprovacaoSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => solicitacao.numero === selectedAprovacaoCotacao?.solicitacao,
      ),
    [selectedAprovacaoCotacao, solicitacoes],
  )

  const selectedRetornoCotacao = useMemo(
    () => cotacoes.find((cotacao) => cotacao.id === Number(retornoCotacao.cotacaoId)),
    [cotacoes, retornoCotacao.cotacaoId],
  )

  const selectedRetornoSolicitacao = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => solicitacao.numero === selectedRetornoCotacao?.solicitacao,
      ),
    [selectedRetornoCotacao, solicitacoes],
  )

  const selectedRetornoFornecedor = useMemo(
    () =>
      demoFornecedores.find(
        (fornecedor) => fornecedor.id === Number(retornoCotacao.fornecedorId),
      ),
    [retornoCotacao.fornecedorId],
  )

  const respostasDaCotacao = useMemo(
    () =>
      cotacaoRespostas.filter(
        (resposta) => resposta.cotacaoId === Number(retornoCotacao.cotacaoId),
      ),
    [cotacaoRespostas, retornoCotacao.cotacaoId],
  )

  const retornoTotal = useMemo(
    () => calculateResponseTotal(retornoCotacao.itens),
    [retornoCotacao.itens],
  )

  const metrics = useMemo(() => {
    const totalSolicitado = solicitacoes.reduce(
      (sum, solicitacao) => sum + solicitacao.valorEstimado,
      0,
    )
    const economiaCotada = cotacoes.reduce(
      (sum, cotacao) => sum + Math.max(0, cotacao.melhorValor * 0.06),
      0,
    )

    return [
      {
        label: 'Solicitacoes abertas',
        value: solicitacoes.filter((item) => item.status === 'ABERTA').length,
        detail: `${solicitacoes.length} no fluxo`,
      },
      {
        label: 'Cotacoes ativas',
        value: cotacoes.filter((item) => item.status !== 'APROVADA').length,
        detail: `${cotacoes.length} rodadas`,
      },
      {
        label: 'Valor em compras',
        value: formatCurrency(totalSolicitado),
        detail: 'base demonstrativa',
      },
      {
        label: 'Economia estimada',
        value: formatCurrency(economiaCotada),
        detail: 'comparativo de cotacao',
      },
    ]
  }, [cotacoes, solicitacoes])

  function handleCreateSolicitacao(event) {
    event.preventDefault()

    const nextId = Math.max(...solicitacoes.map((item) => item.id)) + 1
    const novaSolicitacao = {
      id: nextId,
      numero: `SC-2026-${String(nextId).padStart(6, '0')}`,
      solicitante: 'Usuario demo',
      centroCusto: draft.centroCusto,
      item: draft.item,
      quantidade: Number(draft.quantidade),
      unidade: 'UN',
      status: 'ABERTA',
      prioridade: draft.prioridade,
      valorEstimado: Number(draft.quantidade) * 72,
      data: new Date().toISOString().slice(0, 10),
    }

    setSolicitacoes((current) => [novaSolicitacao, ...current])
    setEnvioCotacao((current) => ({ ...current, solicitacaoId: nextId }))
    setActiveTab('solicitacoes')
  }

  function enviarSolicitacaoParaCotacao(event) {
    event.preventDefault()

    if (!selectedEnvioSolicitacao || selectedEnvioSolicitacao.status !== 'ABERTA') {
      return
    }

    const nextCotacaoId = Math.max(...cotacoes.map((item) => item.id)) + 1
    setSolicitacoes((current) =>
      current.map((item) =>
        item.id === selectedEnvioSolicitacao.id
          ? { ...item, status: 'EM_COTACAO' }
          : item,
      ),
    )
    setCotacoes((current) => [
      {
        id: nextCotacaoId,
        numero: `CT-2026-${String(nextCotacaoId).padStart(6, '0')}`,
        solicitacao: selectedEnvioSolicitacao.numero,
        rodada: 1,
        status: 'EM_ANDAMENTO',
        respostas: 0,
        fornecedores: envioCotacao.fornecedorIds.length,
        melhorValor: Math.round(selectedEnvioSolicitacao.valorEstimado * 0.94),
      },
      ...current,
    ])
    setAprovacaoCotacao((current) => ({ ...current, cotacaoId: nextCotacaoId }))
    setRetornoCotacao((current) => ({
      ...current,
      cotacaoId: nextCotacaoId,
      fornecedorId: envioCotacao.fornecedorIds[0] || String(demoFornecedores[0].id),
      itens: buildRetornoItens(
        {
          solicitacao: selectedEnvioSolicitacao.numero,
        },
        solicitacoes,
      ),
    }))
    setActiveTab('cotacoes')
  }

  function handleRetornoCotacaoSubmit(event) {
    event.preventDefault()

    if (!selectedRetornoCotacao || !selectedRetornoFornecedor) {
      return
    }

    const total =
      retornoCotacao.status === 'RESPONDIDO' ? calculateResponseTotal(retornoCotacao.itens) : 0
    const resposta = {
      id:
        cotacaoRespostas.find(
          (item) =>
            item.cotacaoId === selectedRetornoCotacao.id &&
            item.fornecedorId === selectedRetornoFornecedor.id,
        )?.id || Date.now(),
      cotacaoId: selectedRetornoCotacao.id,
      fornecedorId: selectedRetornoFornecedor.id,
      fornecedor: selectedRetornoFornecedor.razaoSocial,
      status: retornoCotacao.status,
      prazoEntrega: retornoCotacao.prazoEntrega,
      formaPagamento: retornoCotacao.formaPagamento,
      observacoes: retornoCotacao.observacoes,
      anexo: retornoCotacao.anexo || '-',
      total,
      itens: retornoCotacao.itens.map((item) => ({
        ...item,
        valorUnitario: Number(item.valorUnitario || 0),
      })),
    }

    const respostasAtualizadas = [
      resposta,
      ...cotacaoRespostas.filter(
        (item) =>
          item.cotacaoId !== resposta.cotacaoId ||
          item.fornecedorId !== resposta.fornecedorId,
      ),
    ]

    setCotacaoRespostas(respostasAtualizadas)
    setCotacoes((current) =>
      current.map((cotacao) => {
        if (cotacao.id !== selectedRetornoCotacao.id) {
          return cotacao
        }

        const respostasRespondidas = respostasAtualizadas.filter(
          (item) => item.cotacaoId === cotacao.id && item.status === 'RESPONDIDO',
        )
        const melhorValor =
          respostasRespondidas.length > 0
            ? Math.min(...respostasRespondidas.map((item) => item.total))
            : cotacao.melhorValor

        return {
          ...cotacao,
          respostas: respostasRespondidas.length,
          melhorValor,
        }
      }),
    )
    setRetornoFeedback(`Retorno de ${selectedRetornoFornecedor.razaoSocial} salvo.`)
  }

  function aprovarCotacao(event) {
    event.preventDefault()

    if (!selectedAprovacaoCotacao || aprovacaoCotacao.decisao !== 'APROVAR') {
      return
    }

    const nextCompraId = Math.max(...compras.map((item) => item.id)) + 1
    const fornecedorEscolhido =
      demoFornecedores.find(
        (fornecedor) => fornecedor.id === Number(aprovacaoCotacao.fornecedorId),
      ) || demoFornecedores[0]

    setCotacoes((current) =>
      current.map((item) =>
        item.id === selectedAprovacaoCotacao.id
          ? { ...item, status: 'APROVADA', respostas: 3 }
          : item,
      ),
    )
    setSolicitacoes((current) =>
      current.map((item) =>
        item.numero === selectedAprovacaoCotacao.solicitacao
          ? { ...item, status: 'COMPRA_APROVADA' }
          : item,
      ),
    )
    setCompras((current) => [
      {
        id: nextCompraId,
        numero: `CP-2026-${String(nextCompraId).padStart(6, '0')}`,
        solicitacao: selectedAprovacaoCotacao.solicitacao,
        fornecedor: fornecedorEscolhido.razaoSocial,
        status: 'APROVADA',
        total: selectedAprovacaoCotacao.melhorValor,
        aprovador: 'Carla Gestora',
      },
      ...current,
    ])
    setActiveTab('compras')
  }

  function createOrdemCompra() {
    const compra = compras.find(
      (item) =>
        item.status === 'APROVADA' &&
        !ordensCompra.some((ordem) => ordem.compra === item.numero),
    )

    if (!compra) {
      return
    }

    const nextOrdemId = Math.max(...ordensCompra.map((item) => item.id)) + 1
    setOrdensCompra((current) => [
      {
        id: nextOrdemId,
        numero: `OC-2026-${String(nextOrdemId).padStart(6, '0')}`,
        compra: compra.numero,
        fornecedor: compra.fornecedor,
        status: 'GERADA',
        envio: 'PENDENTE',
        total: compra.total,
      },
      ...current,
    ])
  }

  async function checkApi() {
    setApiStatus({ label: 'Consultando API', tone: 'warning' })

    try {
      await comprasApi.health()
      setApiStatus({ label: 'API conectada', tone: 'success' })
    } catch {
      setApiStatus({ label: 'API indisponivel', tone: 'danger' })
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            SC
          </span>
          <div>
            <strong>Sistema de Compras</strong>
            <span>Ambiente preview</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Secoes">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="api-panel">
          <span className={`status-dot ${apiStatus.tone}`}></span>
          <div>
            <strong>{apiStatus.label}</strong>
            <span>{API_BASE_URL}</span>
          </div>
          <button type="button" onClick={checkApi}>
            Checar
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Fluxo demonstrativo</span>
            <h1>Compras, cotacoes e ordens em uma esteira</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" onClick={() => setActiveTab('enviar-cotacao')}>
              Tela de envio
            </button>
            <button type="button" onClick={() => setActiveTab('aprovar-cotacao')}>
              Tela de aprovacao
            </button>
            <button type="button" onClick={() => setActiveTab('retorno-cotacao')}>
              Lancar retorno
            </button>
            <button type="button" className="primary" onClick={createOrdemCompra}>
              Gerar OC
            </button>
          </div>
        </header>

        {activeTab === 'painel' && (
          <div className="page-section">
            <section className="metrics-grid" aria-label="Indicadores">
              {metrics.map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </article>
              ))}
            </section>

            <section className="split-layout">
              <div className="section-block">
                <div className="section-heading">
                  <h2>Esteira de solicitacoes</h2>
                  <span>{solicitacoes.length} registros</span>
                </div>
                <div className="flow-board">
                  {['ABERTA', 'EM_COTACAO', 'COMPRA_APROVADA'].map((status) => (
                    <div className="flow-column" key={status}>
                      <h3>{statusText(status)}</h3>
                      {solicitacoes
                        .filter((solicitacao) => solicitacao.status === status)
                        .map((solicitacao) => (
                          <button
                            type="button"
                            className="request-item"
                            key={solicitacao.id}
                            onClick={() => {
                              if (solicitacao.status === 'ABERTA') {
                                setEnvioCotacao((current) => ({
                                  ...current,
                                  solicitacaoId: solicitacao.id,
                                }))
                                setActiveTab('enviar-cotacao')
                              }
                            }}
                          >
                            <strong>{solicitacao.numero}</strong>
                            <span>{solicitacao.item}</span>
                            <small>{formatCurrency(solicitacao.valorEstimado)}</small>
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              <form className="section-block compact-form" onSubmit={handleCreateSolicitacao}>
                <div className="section-heading">
                  <h2>Nova solicitacao</h2>
                  <span>Demo local</span>
                </div>
                <label>
                  Item
                  <select
                    value={draft.item}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, item: event.target.value }))
                    }
                  >
                    {demoItens.map((item) => (
                      <option key={item.id} value={item.descricao}>
                        {item.descricao}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantidade
                  <input
                    min="1"
                    type="number"
                    value={draft.quantidade}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        quantidade: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Centro de custo
                  <input
                    value={draft.centroCusto}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        centroCusto: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Prioridade
                  <select
                    value={draft.prioridade}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        prioridade: event.target.value,
                      }))
                    }
                  >
                    <option>Normal</option>
                    <option>Media</option>
                    <option>Alta</option>
                  </select>
                </label>
                <button type="submit" className="primary">
                  Criar solicitacao
                </button>
              </form>
            </section>
          </div>
        )}

        {activeTab === 'solicitacoes' && (
          <TableSection
            title="Solicitacoes"
            subtitle="Pedidos de materiais e servicos"
            rows={solicitacoes}
            columns={[
              ['numero', 'Numero'],
              ['solicitante', 'Solicitante'],
              ['centroCusto', 'Centro de custo'],
              ['item', 'Item'],
              ['quantidade', 'Qtd.'],
              ['prioridade', 'Prioridade'],
              ['valorEstimado', 'Estimado', formatCurrency],
              ['status', 'Status', StatusBadge],
            ]}
          />
        )}

        {activeTab === 'enviar-cotacao' && (
          <ActionScreen
            title="Enviar solicitacao para cotacao"
            subtitle="Selecione uma solicitacao aberta e os fornecedores que devem receber a rodada."
            endpoint="POST /cotacoes + POST /cotacoes/:id/fornecedores"
          >
            <form className="action-form" onSubmit={enviarSolicitacaoParaCotacao}>
              <div className="action-grid">
                <section className="section-block">
                  <div className="section-heading">
                    <h2>Solicitacao</h2>
                    <span>{solicitacoesAbertas.length} abertas</span>
                  </div>
                  <label>
                    Solicitacao aberta
                    <select
                      value={envioCotacao.solicitacaoId}
                      onChange={(event) =>
                        setEnvioCotacao((current) => ({
                          ...current,
                          solicitacaoId: event.target.value,
                        }))
                      }
                    >
                      {solicitacoesAbertas.map((solicitacao) => (
                        <option key={solicitacao.id} value={solicitacao.id}>
                          {solicitacao.numero} - {solicitacao.item}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedEnvioSolicitacao ? (
                    <SummaryCard
                      rows={[
                        ['Solicitante', selectedEnvioSolicitacao.solicitante],
                        ['Centro de custo', selectedEnvioSolicitacao.centroCusto],
                        [
                          'Quantidade',
                          `${selectedEnvioSolicitacao.quantidade} ${selectedEnvioSolicitacao.unidade}`,
                        ],
                        [
                          'Estimado',
                          formatCurrency(selectedEnvioSolicitacao.valorEstimado),
                        ],
                        ['Prioridade', selectedEnvioSolicitacao.prioridade],
                      ]}
                    />
                  ) : (
                    <EmptyState text="Nao ha solicitacoes abertas para cotacao." />
                  )}
                </section>

                <section className="section-block">
                  <div className="section-heading">
                    <h2>Fornecedores</h2>
                    <span>{envioCotacao.fornecedorIds.length} selecionados</span>
                  </div>
                  <div className="check-list">
                    {demoFornecedores.map((fornecedor) => (
                      <label className="check-row" key={fornecedor.id}>
                        <input
                          type="checkbox"
                          checked={envioCotacao.fornecedorIds.includes(
                            String(fornecedor.id),
                          )}
                          onChange={(event) => {
                            const fornecedorId = String(fornecedor.id)
                            setEnvioCotacao((current) => ({
                              ...current,
                              fornecedorIds: event.target.checked
                                ? [...current.fornecedorIds, fornecedorId]
                                : current.fornecedorIds.filter((id) => id !== fornecedorId),
                            }))
                          }}
                        />
                        <span>
                          <strong>{fornecedor.razaoSocial}</strong>
                          <small>
                            {fornecedor.classificacao} · prazo medio {fornecedor.prazoMedio}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <section className="section-block">
                <div className="form-grid">
                  <label>
                    Prazo para resposta
                    <input
                      type="date"
                      value={envioCotacao.prazoResposta}
                      onChange={(event) =>
                        setEnvioCotacao((current) => ({
                          ...current,
                          prazoResposta: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Observacoes para fornecedores
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
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setActiveTab('solicitacoes')}>
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      !selectedEnvioSolicitacao || envioCotacao.fornecedorIds.length === 0
                    }
                  >
                    Criar cotacao
                  </button>
                </div>
              </section>
            </form>
          </ActionScreen>
        )}

        {activeTab === 'cotacoes' && (
          <div className="page-section">
            <TableSection
              title="Cotacoes"
              subtitle="Rodadas abertas e comparativos"
              rows={cotacoes}
              columns={[
                ['numero', 'Numero'],
                ['solicitacao', 'Solicitacao'],
                ['rodada', 'Rodada'],
                ['fornecedores', 'Fornecedores'],
                ['respostas', 'Respostas'],
                ['melhorValor', 'Melhor valor', formatCurrency],
                ['status', 'Status', StatusBadge],
              ]}
            />
            <TableSection
              title="Retornos lancados"
              subtitle="Respostas registradas por fornecedor"
              rows={cotacaoRespostas}
              columns={[
                ['fornecedor', 'Fornecedor'],
                ['status', 'Status', StatusBadge],
                ['prazoEntrega', 'Prazo'],
                ['formaPagamento', 'Pagamento'],
                ['total', 'Total', formatCurrency],
                ['anexo', 'Anexo'],
              ]}
            />
          </div>
        )}

        {activeTab === 'retorno-cotacao' && (
          <ActionScreen
            title="Lancar retorno da cotacao"
            subtitle="Registre a resposta do fornecedor com disponibilidade, valores e condicoes comerciais."
            endpoint="POST /cotacoes/:id/fornecedores/:cotacaoFornecedorId/respostas"
          >
            <form className="action-form" onSubmit={handleRetornoCotacaoSubmit}>
              <div className="action-grid">
                <section className="section-block">
                  <div className="section-heading">
                    <h2>Cotacao e fornecedor</h2>
                    <span>{cotacoesEmAndamento.length} em andamento</span>
                  </div>
                  <label>
                    Cotacao
                    <select
                      value={retornoCotacao.cotacaoId}
                      onChange={(event) => {
                        const cotacaoId = Number(event.target.value)
                        const cotacao = cotacoes.find((item) => item.id === cotacaoId)

                        setRetornoCotacao((current) => ({
                          ...current,
                          cotacaoId,
                          itens: buildRetornoItens(cotacao, solicitacoes),
                        }))
                        setRetornoFeedback('')
                      }}
                    >
                      {cotacoesEmAndamento.map((cotacao) => (
                        <option key={cotacao.id} value={cotacao.id}>
                          {cotacao.numero} - {cotacao.solicitacao}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Fornecedor
                    <select
                      value={retornoCotacao.fornecedorId}
                      onChange={(event) => {
                        const fornecedorId = event.target.value
                        const respostaExistente = cotacaoRespostas.find(
                          (item) =>
                            item.cotacaoId === Number(retornoCotacao.cotacaoId) &&
                            item.fornecedorId === Number(fornecedorId),
                        )

                        setRetornoCotacao((current) => ({
                          ...current,
                          fornecedorId,
                          status: respostaExistente?.status || 'RESPONDIDO',
                          prazoEntrega: respostaExistente?.prazoEntrega || '5 dias',
                          formaPagamento: respostaExistente?.formaPagamento || '30 dias',
                          observacoes:
                            respostaExistente?.observacoes ||
                            'Condicoes recebidas por email e lancadas manualmente.',
                          anexo: respostaExistente?.anexo === '-' ? '' : respostaExistente?.anexo || '',
                          itens:
                            respostaExistente?.itens ||
                            buildRetornoItens(selectedRetornoCotacao, solicitacoes),
                        }))
                        setRetornoFeedback('')
                      }}
                    >
                      {demoFornecedores.map((fornecedor) => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.razaoSocial}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedRetornoSolicitacao ? (
                    <SummaryCard
                      rows={[
                        ['Solicitacao', selectedRetornoSolicitacao.numero],
                        ['Item', selectedRetornoSolicitacao.item],
                        [
                          'Quantidade',
                          `${selectedRetornoSolicitacao.quantidade} ${selectedRetornoSolicitacao.unidade}`,
                        ],
                        ['Estimado', formatCurrency(selectedRetornoSolicitacao.valorEstimado)],
                        ['Respostas lancadas', respostasDaCotacao.length],
                      ]}
                    />
                  ) : (
                    <EmptyState text="Nao ha cotacoes em andamento para lancar retorno." />
                  )}
                </section>

                <section className="section-block">
                  <div className="section-heading">
                    <h2>Condicoes comerciais</h2>
                    <span>{formatCurrency(retornoTotal)}</span>
                  </div>
                  <div className="form-grid single-column">
                    <label>
                      Status do retorno
                      <select
                        value={retornoCotacao.status}
                        onChange={(event) =>
                          setRetornoCotacao((current) => ({
                            ...current,
                            status: event.target.value,
                          }))
                        }
                      >
                        <option value="RESPONDIDO">Respondido</option>
                        <option value="RECUSADO">Recusado</option>
                        <option value="SEM_RESPOSTA">Sem resposta</option>
                      </select>
                    </label>
                    <label>
                      Prazo de entrega
                      <input
                        value={retornoCotacao.prazoEntrega}
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
                      <input
                        value={retornoCotacao.formaPagamento}
                        onChange={(event) =>
                          setRetornoCotacao((current) => ({
                            ...current,
                            formaPagamento: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Nome do anexo
                      <input
                        placeholder="orcamento-fornecedor.pdf"
                        value={retornoCotacao.anexo}
                        onChange={(event) =>
                          setRetornoCotacao((current) => ({
                            ...current,
                            anexo: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </section>
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Itens respondidos</h2>
                  <span>Total {formatCurrency(retornoTotal)}</span>
                </div>
                <div className="quote-items">
                  {retornoCotacao.itens.map((item, index) => (
                    <div className="quote-item-row" key={`${item.descricao}-${index}`}>
                      <div>
                        <strong>{item.descricao}</strong>
                        <span>
                          {item.quantidade} {item.unidade}
                        </span>
                      </div>
                      <label>
                        Disponibilidade
                        <select
                          value={item.statusItem}
                          onChange={(event) =>
                            setRetornoCotacao((current) => ({
                              ...current,
                              itens: current.itens.map((candidate, candidateIndex) =>
                                candidateIndex === index
                                  ? { ...candidate, statusItem: event.target.value }
                                  : candidate,
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
                          min="0"
                          step="0.01"
                          type="number"
                          value={item.valorUnitario}
                          disabled={item.statusItem === 'INDISPONIVEL'}
                          onChange={(event) =>
                            setRetornoCotacao((current) => ({
                              ...current,
                              itens: current.itens.map((candidate, candidateIndex) =>
                                candidateIndex === index
                                  ? { ...candidate, valorUnitario: event.target.value }
                                  : candidate,
                              ),
                            }))
                          }
                        />
                      </label>
                      <b>
                        {formatCurrency(
                          item.statusItem === 'INDISPONIVEL'
                            ? 0
                            : Number(item.quantidade || 0) * Number(item.valorUnitario || 0),
                        )}
                      </b>
                    </div>
                  ))}
                </div>
                <label className="full-width-label">
                  Observacoes do retorno
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
                {retornoFeedback && <div className="success-message">{retornoFeedback}</div>}
                <div className="form-actions">
                  <button type="button" onClick={() => setActiveTab('cotacoes')}>
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={!selectedRetornoCotacao || !selectedRetornoFornecedor}
                  >
                    Salvar retorno
                  </button>
                </div>
              </section>

              <section className="table-section">
                <div className="section-heading">
                  <div>
                    <h2>Historico da cotacao selecionada</h2>
                    <span>retornos ja registrados</span>
                  </div>
                  <strong>{respostasDaCotacao.length}</strong>
                </div>
                <div className="response-history">
                  {respostasDaCotacao.length === 0 ? (
                    <EmptyState text="Nenhum retorno lancado para esta cotacao." />
                  ) : (
                    respostasDaCotacao.map((resposta) => (
                      <article className="response-card" key={resposta.id}>
                        <div>
                          <strong>{resposta.fornecedor}</strong>
                          {StatusBadge(resposta.status)}
                        </div>
                        <span>{resposta.prazoEntrega} · {resposta.formaPagamento}</span>
                        <b>{formatCurrency(resposta.total)}</b>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </form>
          </ActionScreen>
        )}

        {activeTab === 'aprovar-cotacao' && (
          <ActionScreen
            title="Aprovar cotacao"
            subtitle="Revise o comparativo, escolha o fornecedor e registre a decisao."
            endpoint="PATCH /cotacoes/:id/status + POST /compras"
          >
            <form className="action-form" onSubmit={aprovarCotacao}>
              <div className="action-grid">
                <section className="section-block">
                  <div className="section-heading">
                    <h2>Cotacao em analise</h2>
                    <span>{cotacoesEmAndamento.length} pendentes</span>
                  </div>
                  <label>
                    Cotacao
                    <select
                      value={aprovacaoCotacao.cotacaoId}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          cotacaoId: event.target.value,
                        }))
                      }
                    >
                      {cotacoesEmAndamento.map((cotacao) => (
                        <option key={cotacao.id} value={cotacao.id}>
                          {cotacao.numero} - {cotacao.solicitacao}
                          {solicitacoes.find(
                            (solicitacao) => solicitacao.numero === cotacao.solicitacao,
                          )?.item
                            ? ` - ${solicitacoes.find(
                                (solicitacao) =>
                                  solicitacao.numero === cotacao.solicitacao,
                              )?.item}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedAprovacaoCotacao ? (
                    <SummaryCard
                      rows={[
                        ['Solicitacao', selectedAprovacaoCotacao.solicitacao],
                        ['Rodada', selectedAprovacaoCotacao.rodada],
                        ['Fornecedores', selectedAprovacaoCotacao.fornecedores],
                        ['Respostas', selectedAprovacaoCotacao.respostas],
                        [
                          'Melhor valor',
                          formatCurrency(selectedAprovacaoCotacao.melhorValor),
                        ],
                      ]}
                    />
                  ) : (
                    <EmptyState text="Nao ha cotacoes em andamento para aprovar." />
                  )}
                </section>

                <section className="section-block solicitation-context">
                  <div className="section-heading">
                    <h2>Solicitacao vinculada</h2>
                    <span>{selectedAprovacaoCotacao?.solicitacao || '-'}</span>
                  </div>
                  {selectedAprovacaoSolicitacao ? (
                    <>
                      <div className="linked-request-title">
                        <strong>{selectedAprovacaoSolicitacao.item}</strong>
                        {StatusBadge(selectedAprovacaoSolicitacao.status)}
                      </div>
                      <SummaryCard
                        rows={[
                          ['Solicitante', selectedAprovacaoSolicitacao.solicitante],
                          ['Centro de custo', selectedAprovacaoSolicitacao.centroCusto],
                          [
                            'Quantidade',
                            `${selectedAprovacaoSolicitacao.quantidade} ${selectedAprovacaoSolicitacao.unidade}`,
                          ],
                          [
                            'Valor estimado',
                            formatCurrency(selectedAprovacaoSolicitacao.valorEstimado),
                          ],
                          ['Prioridade', selectedAprovacaoSolicitacao.prioridade],
                        ]}
                      />
                    </>
                  ) : (
                    <EmptyState text="Nao encontrei a solicitacao vinculada a cotacao selecionada." />
                  )}
                </section>

                <section className="section-block">
                  <div className="section-heading">
                    <h2>Decisao</h2>
                    <span>gera compra aprovada</span>
                  </div>
                  <label>
                    Fornecedor vencedor
                    <select
                      value={aprovacaoCotacao.fornecedorId}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          fornecedorId: event.target.value,
                        }))
                      }
                    >
                      {demoFornecedores.map((fornecedor) => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.razaoSocial}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Decisao
                    <select
                      value={aprovacaoCotacao.decisao}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          decisao: event.target.value,
                        }))
                      }
                    >
                      <option value="APROVAR">Aprovar</option>
                      <option value="REPROVAR">Reprovar</option>
                    </select>
                  </label>
                  <label>
                    Justificativa
                    <textarea
                      value={aprovacaoCotacao.observacao}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          observacao: event.target.value,
                        }))
                      }
                    />
                  </label>
                </section>
              </div>

              <section className="section-block comparison-block">
                <div className="section-heading">
                  <h2>Comparativo de fornecedores</h2>
                  <span>dados demonstrativos</span>
                </div>
                <div className="supplier-comparison">
                  {demoFornecedores.map((fornecedor, index) => {
                    const baseValue = selectedAprovacaoCotacao?.melhorValor || 2100
                    const value = Math.round(baseValue * (1 + index * 0.045))

                    return (
                      <label className="supplier-card" key={fornecedor.id}>
                        <input
                          type="radio"
                          name="fornecedor-vencedor"
                          checked={aprovacaoCotacao.fornecedorId === String(fornecedor.id)}
                          onChange={() =>
                            setAprovacaoCotacao((current) => ({
                              ...current,
                              fornecedorId: String(fornecedor.id),
                            }))
                          }
                        />
                        <span>
                          <strong>{fornecedor.razaoSocial}</strong>
                          <small>{fornecedor.prazoMedio} · {fornecedor.classificacao}</small>
                        </span>
                        <b>{formatCurrency(value)}</b>
                      </label>
                    )
                  })}
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setActiveTab('cotacoes')}>
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      !selectedAprovacaoCotacao || aprovacaoCotacao.decisao !== 'APROVAR'
                    }
                  >
                    Aprovar e gerar compra
                  </button>
                </div>
              </section>
            </form>
          </ActionScreen>
        )}

        {activeTab === 'compras' && (
          <div className="page-section">
            <TableSection
              title="Compras"
              subtitle="Escolha de fornecedor e aprovacao"
              rows={compras}
              columns={[
                ['numero', 'Numero'],
                ['solicitacao', 'Solicitacao'],
                ['fornecedor', 'Fornecedor'],
                ['aprovador', 'Aprovador'],
                ['total', 'Total', formatCurrency],
                ['status', 'Status', StatusBadge],
              ]}
            />
            <TableSection
              title="Ordens de compra"
              subtitle="OCs geradas para envio"
              rows={ordensCompra}
              columns={[
                ['numero', 'Numero'],
                ['compra', 'Compra'],
                ['fornecedor', 'Fornecedor'],
                ['total', 'Total', formatCurrency],
                ['status', 'Status', StatusBadge],
                ['envio', 'Envio', StatusBadge],
              ]}
            />
          </div>
        )}

        {activeTab === 'cadastros' && (
          <div className="page-section">
            <section className="catalog-grid">
              <ListBlock title="Fornecedores" items={demoFornecedores} />
              <ListBlock title="Itens de compra" items={demoItens} />
              <ListBlock title="Usuarios" items={demoUsuarios} />
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

function StatusBadge(value) {
  return <span className={`badge ${statusClass[value] || 'neutral'}`}>{statusText(value)}</span>
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
                    {formatter ? formatter(row[key]) : row[key]}
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
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.razaoSocial || item.descricao || item.nome}</strong>
            <span>
              {item.cnpj || item.codigo || item.email}
              {item.status ? ` · ${item.status}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default App
