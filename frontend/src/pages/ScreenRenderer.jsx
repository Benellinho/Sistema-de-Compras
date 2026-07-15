import { API_BASE_URL, API_ROUTES, apiUrl } from '../config/api'
import { ActionScreen } from '../components/ui/ActionScreen'
import { ActionFeedback } from '../components/ui/ActionFeedback'
import { ButtonContent } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ListBlock } from '../components/ui/ListBlock'
import { StatusBadge } from '../components/ui/StatusBadge'
import { SummaryCard } from '../components/ui/SummaryCard'
import { TableSection } from '../components/ui/Table'
import { useSistemaCompras } from '../context/comprasContext'
import {
  ACTIONS,
  APROVACAO_JUSTIFICATIVAS,
  CENTROS_CUSTO_ORDEM_COMPRA,
  CLASSIFICACAO_CREATE_SOLICITACAO_VALUE,
  DEFAULT_RETORNO_PARCELAS,
  RECUSA_JUSTIFICATIVAS,
  RETORNO_PARCELAS_OPTIONS,
} from '../utils/constants'
import {
  compraNumero,
  compraFornecedorTotal,
  cotacaoFornecedorItensRespondidos,
  cotacaoFornecedorTotal,
  cotacaoNumero,
  fornecedorNome,
  formatCurrency,
  itemSolicitacaoDescricao,
  solicitacaoClassificacaoOption,
  solicitacaoCotacaoOption,
  solicitacaoNecessidade,
  solicitacaoNumero,
  solicitacaoPrincipalItem,
  solicitacaoResumoItens,
  solicitacaoSolicitante,
  solicitacaoUrgencia,
  statusText,
  usuarioNome,
  withRetornoStatus,
} from '../utils/formatters'

function normalizeItemSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function classificacaoItemLabel(item) {
  return item.codigo ? `${item.codigo} - ${item.descricao}` : item.descricao
}

export function ScreenRenderer({ screenId }) {
  const activeTab = screenId
  const {
    usuarios,
    fornecedores,
    contatosFornecedor,
    grupos,
    itens,
    solicitacoes,
    loadingData,
    pendingAction,
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
    defaultUsuarioId,
    actionLocked,
    solicitacoesClassificaveis,
    solicitacoesCotaveis,
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
    fornecedoresRetornoDisponiveis,
    selectedAprovacaoCotacao,
    selectedAprovacaoSolicitacao,
    itensAprovacaoCotacao,
    selectedAprovacaoItem,
    fornecedoresAprovacaoItem,
    escolhasAprovacaoItens,
    aprovacaoItensPendentes,
    respostasDaCotacao,
    retornoTotal,
    compraFornecedoresElegiveis,
    selectedCompraFornecedoresOrdem,
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
    navigateToTab,
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
    handleRetornoFornecedorChange,
    handleEditarRetorno,
    handleCancelarEdicaoRetorno,
    handleAprovacaoCotacaoChange,
    goToEnvioCotacao,
    handleRecusarCotacao,
  } = useSistemaCompras()

  const classificacaoSearchTerms = normalizeItemSearch(classificacaoForm.itemBusca).split(/\s+/).filter(Boolean)
  const itensClassificacaoFiltrados = classificacaoSearchTerms.length > 0
    ? itensAtivos.filter((item) => {
        const searchable = normalizeItemSearch([
          item.codigo,
          item.descricao,
          item.grupo_nome,
          item.unidade,
        ].filter(Boolean).join(' '))

        return classificacaoSearchTerms.every((term) => searchable.includes(term))
      })
    : itensAtivos
  const mostrarResultadosClassificacao = !classificacaoForm.itemId

  return (
    <>
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
                  <ActionFeedback actions={ACTIONS.criarSolicitacao} />
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
                <ActionFeedback actions={ACTIONS.limparSolicitacoes} />
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
                    <input
                      type="search"
                      value={classificacaoForm.itemBusca}
                      placeholder="Digite parte do codigo, descricao ou grupo"
                      autoComplete="off"
                      aria-autocomplete="list"
                      aria-controls="classificacao-item-resultados"
                      aria-expanded={mostrarResultadosClassificacao}
                      onChange={(event) =>
                        setClassificacaoForm((current) => ({
                          ...current,
                          itemBusca: event.target.value,
                          itemId: '',
                        }))
                      }
                    />
                  </label>
                  {mostrarResultadosClassificacao && (
                    <div
                      id="classificacao-item-resultados"
                      className="item-search-results"
                      role="listbox"
                      aria-label="Itens compativeis"
                    >
                      {itensClassificacaoFiltrados.length > 0 ? (
                        <>
                          <span className="item-search-count">
                            {itensClassificacaoFiltrados.length} item(ns) compativel(is)
                          </span>
                          {itensClassificacaoFiltrados.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              role="option"
                              aria-selected="false"
                              onClick={() =>
                                setClassificacaoForm((current) => ({
                                  ...current,
                                  itemId: String(item.id),
                                  itemBusca: classificacaoItemLabel(item),
                                }))
                              }
                            >
                              <strong>{classificacaoItemLabel(item)}</strong>
                              <span>
                                {[item.grupo_nome, item.unidade].filter(Boolean).join(' | ')}
                              </span>
                            </button>
                          ))}
                        </>
                      ) : (
                        <span className="item-search-empty">Nenhum item compativel encontrado.</span>
                      )}
                    </div>
                  )}
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
                  <ActionFeedback
                    actions={[ACTIONS.criarSolicitacao, ACTIONS.lancarItem, ACTIONS.editarItem]}
                  />
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
              <ActionFeedback
                actions={[ACTIONS.carregarEdicaoItem, ACTIONS.removerItem]}
              />
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
                  <ActionFeedback actions={ACTIONS.enviarCotacao} />
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
                [
                  'cotacaoFornecedorId',
                  'Modelo PDF',
                  (cotacaoFornecedorId, row) =>
                    cotacaoFornecedorId ? (
                      <a
                        className="table-action-link"
                        href={apiUrl(
                          `/cotacoes/${row.id}/fornecedores/${cotacaoFornecedorId}/pdf`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        title="Abre o PDF real usando o primeiro fornecedor convidado"
                      >
                        Ver modelo PDF
                      </a>
                    ) : (
                      <span className="table-action-unavailable">Sem fornecedor</span>
                    ),
                ],
              ]}
            />
            <ActionFeedback actions={[ACTIONS.enviarCotacao, ACTIONS.recusarCotacao]} />
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
                      disabled={fornecedoresRetornoDisponiveis.length === 0}
                      onChange={(event) => handleRetornoFornecedorChange(event.target.value)}
                    >
                      {fornecedoresRetornoDisponiveis.length === 0 && (
                        <option value="">Todos os fornecedores ja responderam</option>
                      )}
                      {fornecedoresRetornoDisponiveis.length > 0 &&
                        !retornoCotacao.cotacaoFornecedorId && (
                          <option value="">Selecione um fornecedor</option>
                        )}
                      {fornecedoresRetornoDisponiveis.map((fornecedor) => {
                        const itensRespondidos = cotacaoFornecedorItensRespondidos(fornecedor)
                        const statusEfetivo =
                          fornecedor.status === 'RESPONDIDO' &&
                          itensRespondidos < retornoCotacao.itens.length
                            ? 'PENDENTE'
                            : fornecedor.status

                        return (
                          <option key={fornecedor.id} value={fornecedor.id}>
                            {fornecedorNome(fornecedor)} - {statusText(statusEfetivo)}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                  <label>
                    Status do retorno
                    <select
                      value={retornoCotacao.status}
                      disabled={retornoCotacao.editando}
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
                              Solicitado: {item.quantidadeSolicitada ?? item.quantidade} {item.unidade}
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
                              min="0.01"
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
                      {retornoCotacao.editando ? 'Salvar alteracoes' : 'Registrar retorno'}
                    </ButtonContent>
                  </button>
                  {retornoCotacao.editando && (
                    <button
                      type="button"
                      disabled={actionLocked}
                      onClick={handleCancelarEdicaoRetorno}
                    >
                      Cancelar edicao
                    </button>
                  )}
                </div>
                <ActionFeedback actions={ACTIONS.registrarRetorno} />
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Retornos ja lancados</h2>
                  <span>{respostasDaCotacao.length} registros</span>
                </div>
                <div className="response-history">
                  {respostasDaCotacao.map((fornecedor) => {
                    const itensRespondidos = cotacaoFornecedorItensRespondidos(fornecedor)
                    const statusEfetivo =
                      fornecedor.status === 'RESPONDIDO' &&
                      itensRespondidos < retornoCotacao.itens.length
                        ? 'PENDENTE'
                        : fornecedor.status

                    return (
                    <article className="response-card" key={fornecedor.id}>
                      <div>
                        <StatusBadge value={statusEfetivo} />
                        <span>{fornecedorNome(fornecedor)}</span>
                      </div>
                      <span>
                        Respondido: {itensRespondidos}/{retornoCotacao.itens.length}{' '}
                        itens
                      </span>
                      <span>{fornecedor.prazo_entrega || '-'}</span>
                      <b>{formatCurrency(cotacaoFornecedorTotal(fornecedor))}</b>
                      {fornecedor.status === 'RESPONDIDO' ? (
                        <button
                          type="button"
                          disabled={actionLocked}
                          onClick={() => handleEditarRetorno(fornecedor)}
                        >
                          Editar
                        </button>
                      ) : (
                        <span />
                      )}
                    </article>
                    )
                  })}
                </div>
              </section>
            </form>
          </ActionScreen>
        )}

        {activeTab === 'aprovar-cotacao' && (
          <ActionScreen
            title="Aprovar cotacao"
            subtitle="Escolhe o fornecedor por item e cria a compra"
            endpoint="POST /cotacoes/:id/aprovacao-itens"
          >
            <form className="action-form" onSubmit={(event) => event.preventDefault()}>
              <div className="action-grid">
                <section className="section-block solicitation-context">
                  <div className="section-heading">
                    <h2>Cotacao e itens</h2>
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
                    <br/>
                      {itensAprovacaoCotacao.length > 0 ? (
                        <div className="approval-item-list">
                          {itensAprovacaoCotacao.map((item) => {
                            const escolha = escolhasAprovacaoItens.find(
                              ({ item: escolhaItem }) => Number(escolhaItem.id) === Number(item.id),
                            )
                            const isSelected =
                              Number(selectedAprovacaoItem?.id) === Number(item.id)
                            const unidade = item.unidade_snapshot || item.unidade || ''

                            return (
                              <button
                                type="button"
                                className={`approval-item-card${isSelected ? ' selected' : ''}`}
                                key={item.id}
                                disabled={actionLocked}
                                onClick={() =>
                                  setAprovacaoCotacao((current) => ({
                                    ...current,
                                    solicitacaoItemId: String(item.id),
                                    fornecedorId: escolha?.fornecedor?.fornecedor_id
                                      ? String(escolha.fornecedor.fornecedor_id)
                                      : '',
                                  }))
                                }
                              >
                                <strong>{itemSolicitacaoDescricao(item)}</strong>
                                <span>
                                  Solicitado: {Number(item.quantidade || 0)} {unidade}
                                </span>
                                <small>
                                  {escolha?.fornecedor
                                    ? `Selecionado: ${fornecedorNome(escolha.fornecedor)}`
                                    : 'Pendente de fornecedor'}
                                </small>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <EmptyState text="A cotacao nao tem itens catalogados para aprovar." />
                      )}
                    </>
                  ) : (
                    <EmptyState text="Nao ha cotacao respondida para aprovar." />
                  )}
                </section>

                <section className="section-block comparison-block">
                  <div className="section-heading">
                    <h2>Fornecedores do item</h2>
                    <span>
                      {selectedAprovacaoItem
                        ? itemSolicitacaoDescricao(selectedAprovacaoItem)
                        : 'selecione um item'}
                    </span>
                  </div>
                  {selectedAprovacaoItem ? (
                    fornecedoresAprovacaoItem.length > 0 ? (
                      <div className="supplier-comparison">
                        {fornecedoresAprovacaoItem.map(({ fornecedor, respostaItem }) => {
                          const fornecedorSelecionado =
                            Number(
                              aprovacaoCotacao.itemFornecedorIds[
                                String(selectedAprovacaoItem.id)
                              ],
                            ) === Number(fornecedor.fornecedor_id)
                          const quantidade = Number(
                            selectedAprovacaoItem.quantidade || respostaItem.quantidade || 0,
                          )
                          const unidade =
                            selectedAprovacaoItem.unidade_snapshot ||
                            selectedAprovacaoItem.unidade ||
                            respostaItem.unidade ||
                            ''
                          const valorUnitario = Number(respostaItem.valor_unitario || 0)
                          const valorTotal = Number(
                            respostaItem.valor_total || quantidade * valorUnitario,
                          )

                          return (
                            <label
                              className={`supplier-card approval-supplier-card${
                                fornecedorSelecionado ? ' selected' : ''
                              }`}
                              key={fornecedor.id}
                            >
                              <input
                                type="radio"
                                name={`fornecedor-item-${selectedAprovacaoItem.id}`}
                                checked={fornecedorSelecionado}
                                onChange={() => {
                                  setAprovacaoCotacao((current) => ({
                                    ...current,
                                    fornecedorId: String(fornecedor.fornecedor_id),
                                    itemFornecedorIds: {
                                      ...current.itemFornecedorIds,
                                      [String(selectedAprovacaoItem.id)]: String(
                                        fornecedor.fornecedor_id,
                                      ),
                                    },
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
                                {respostaItem.observacoes && (
                                  <small>{respostaItem.observacoes}</small>
                                )}
                              </span>
                              <div className="approval-supplier-values">
                                <small>
                                  {quantidade} {unidade}
                                </small>
                                <b>{formatCurrency(valorUnitario)} un.</b>
                                <strong>{formatCurrency(valorTotal)}</strong>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <EmptyState text="Nenhum fornecedor respondeu este item como disponivel." />
                    )
                  ) : (
                    <EmptyState text="Selecione um item da solicitacao." />
                  )}
                </section>
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Itens para aprovar</h2>
                  <span>
                    {itensAprovacaoCotacao.length - aprovacaoItensPendentes.length}/
                    {itensAprovacaoCotacao.length} selecionados
                  </span>
                </div>
                {escolhasAprovacaoItens.length > 0 ? (
                  <div className="response-history">
                    {escolhasAprovacaoItens.map(({ item, fornecedor, respostaItem }) => {
                      const quantidade = Number(item.quantidade || respostaItem?.quantidade || 0)
                      const unidade =
                        item.unidade_snapshot || item.unidade || respostaItem?.unidade || ''
                      const valorUnitario = Number(respostaItem?.valor_unitario || 0)
                      const valorTotal = respostaItem
                        ? Number(respostaItem.valor_total || quantidade * valorUnitario)
                        : 0

                      return (
                        <article className="response-card approval-summary-card" key={item.id}>
                          <div>
                            <StatusBadge value={fornecedor ? 'SELECIONADO' : 'PENDENTE'} />
                            <span>
                              <strong>{itemSolicitacaoDescricao(item)}</strong>
                              <small>
                                {fornecedor
                                  ? fornecedorNome(fornecedor)
                                  : 'Aguardando escolha do fornecedor'}
                              </small>
                            </span>
                          </div>
                          <span>
                            {quantidade} {unidade} | {formatCurrency(valorUnitario)} un.
                          </span>
                          <b>{formatCurrency(valorTotal)}</b>
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState text="Selecione uma cotacao com itens para aprovar." />
                )}
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <h2>Decisao</h2>
                  <span>compra gerada no backend</span>
                </div>
                <div className="action-grid">
                  <label>
                    Justificativa do aceite por fornecedor
                    <select
                      value={aprovacaoCotacao.justificativaAprovacao}
                      onChange={(event) =>
                        setAprovacaoCotacao((current) => ({
                          ...current,
                          justificativaAprovacao: event.target.value,
                          justificativaRecusa: event.target.value
                            ? ''
                            : current.justificativaRecusa,
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
                          justificativaAprovacao: event.target.value
                            ? ''
                            : current.justificativaAprovacao,
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
                      itensAprovacaoCotacao.length < 1 ||
                      aprovacaoItensPendentes.length > 0 ||
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
                <ActionFeedback actions={[ACTIONS.aceitarCotacao, ACTIONS.recusarCotacao]} />
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
                {compraFornecedoresElegiveis.length > 0 && (
                  <label className="order-cost-center">
                    Centro de custo
                    <select
                      value={ordemCompraForm.centroCusto}
                      disabled={actionLocked}
                      onChange={(event) =>
                        setOrdemCompraForm((current) => ({
                          ...current,
                          centroCusto: event.target.value,
                        }))
                      }
                    >
                      {CENTROS_CUSTO_ORDEM_COMPRA.map((centroCusto) => (
                        <option key={centroCusto} value={centroCusto}>
                          {centroCusto}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <ActionFeedback actions={ACTIONS.aceitarCotacao} />
              {compraFornecedoresElegiveis.length > 0 ? (
                <>
                  <div className="order-transfer-grid">
                    <section className="order-transfer-panel">
                      <div className="order-transfer-heading">
                        <div>
                          <h3>Disponiveis</h3>
                          <span>
                            {
                              compraFornecedoresElegiveis.filter(
                                ({ fornecedor }) =>
                                  !ordemCompraForm.compraFornecedorIds.includes(
                                    String(fornecedor.id),
                                  ),
                              ).length
                            }{' '}
                            pendentes
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={actionLocked}
                          onClick={() =>
                            setOrdemCompraForm((current) => ({
                              ...current,
                              compraFornecedorIds: compraFornecedoresElegiveis.map(
                                ({ fornecedor }) => String(fornecedor.id),
                              ),
                            }))
                          }
                        >
                          Adicionar todos
                        </button>
                      </div>
                      <div className="order-transfer-list">
                        {compraFornecedoresElegiveis
                          .filter(
                            ({ fornecedor }) =>
                              !ordemCompraForm.compraFornecedorIds.includes(
                                String(fornecedor.id),
                              ),
                          )
                          .map(({ compra, fornecedor }) => {
                            const compraFornecedorId = String(fornecedor.id)

                            return (
                              <article className="order-transfer-item" key={compraFornecedorId}>
                                <div>
                                  <strong>Solicitacao {compraNumero(compra)}</strong>
                                  <span>{fornecedorNome(fornecedor)}</span>
                                  <small>{formatCurrency(compraFornecedorTotal(fornecedor))}</small>
                                  <details className="order-item-details">
                                    <summary>Itens ({fornecedor.itens?.length || 0})</summary>
                                    <ul>
                                      {(fornecedor.itens || []).map((item) => (
                                        <li key={item.id || item.solicitacao_item_id}>
                                          <span>{itemSolicitacaoDescricao(item)}</span>
                                          <small>
                                            {Number(item.quantidade_pedida || 0)}{' '}
                                            {item.unidade_snapshot || item.unidade || ''}
                                            {' | '}
                                            {formatCurrency(item.valor_total)}
                                          </small>
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                                <button
                                  type="button"
                                  disabled={actionLocked}
                                  onClick={() =>
                                    setOrdemCompraForm((current) => ({
                                      ...current,
                                      compraFornecedorIds: [
                                        ...new Set([
                                          ...current.compraFornecedorIds,
                                          compraFornecedorId,
                                        ]),
                                      ],
                                    }))
                                  }
                                >
                                  Adicionar
                                </button>
                              </article>
                            )
                          })}
                      </div>
                    </section>

                    <section className="order-transfer-panel selected">
                      <div className="order-transfer-heading">
                        <div>
                          <h3>Para gerar</h3>
                          <span>{selectedCompraFornecedoresOrdem.length} selecionadas</span>
                        </div>
                        <button
                          type="button"
                          disabled={actionLocked || selectedCompraFornecedoresOrdem.length < 1}
                          onClick={() =>
                            setOrdemCompraForm((current) => ({
                              ...current,
                              compraFornecedorIds: [],
                            }))
                          }
                        >
                          Limpar
                        </button>
                      </div>
                      <div className="order-transfer-list">
                        {selectedCompraFornecedoresOrdem.length > 0 ? (
                          selectedCompraFornecedoresOrdem.map(({ compra, fornecedor }) => {
                            const compraFornecedorId = String(fornecedor.id)

                            return (
                              <article className="order-transfer-item" key={compraFornecedorId}>
                                <div>
                                  <strong>Solicitacao {compraNumero(compra)}</strong>
                                  <span>{fornecedorNome(fornecedor)}</span>
                                  <small>{formatCurrency(compraFornecedorTotal(fornecedor))}</small>
                                  <details className="order-item-details">
                                    <summary>Itens ({fornecedor.itens?.length || 0})</summary>
                                    <ul>
                                      {(fornecedor.itens || []).map((item) => (
                                        <li key={item.id || item.solicitacao_item_id}>
                                          <span>{itemSolicitacaoDescricao(item)}</span>
                                          <small>
                                            {Number(item.quantidade_pedida || 0)}{' '}
                                            {item.unidade_snapshot || item.unidade || ''}
                                            {' | '}
                                            {formatCurrency(item.valor_total)}
                                          </small>
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                                <button
                                  type="button"
                                  disabled={actionLocked}
                                  onClick={() =>
                                    setOrdemCompraForm((current) => ({
                                      ...current,
                                      compraFornecedorIds: current.compraFornecedorIds.filter(
                                        (id) => id !== compraFornecedorId,
                                      ),
                                    }))
                                  }
                                >
                                  Remover
                                </button>
                              </article>
                            )
                          })
                        ) : (
                          <EmptyState text="Nenhuma ordem selecionada para gerar." />
                        )}
                      </div>
                    </section>
                  </div>
                  <SummaryCard
                    rows={[
                      [
                        'Centro de custo',
                        ordemCompraForm.centroCusto,
                      ],
                      [
                        'Total selecionado',
                        formatCurrency(
                          selectedCompraFornecedoresOrdem.reduce(
                            (sum, item) => sum + compraFornecedorTotal(item.fornecedor),
                            0,
                          ),
                        ),
                      ],
                    ]}
                  />
                  <div className="form-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={createOrdemCompra}
                      disabled={
                        actionLocked ||
                        selectedCompraFornecedoresOrdem.length < 1 ||
                        !defaultUsuarioId
                      }
                    >
                      <ButtonContent active={pendingAction === ACTIONS.gerarOrdemCompra}>
                        Gerar ordem de compra
                      </ButtonContent>
                    </button>
                  </div>
                  <ActionFeedback actions={ACTIONS.gerarOrdemCompra} />
                </>
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
                  <ActionFeedback actions={ACTIONS.cadastrarFornecedor} />
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
                  <ActionFeedback actions={ACTIONS.cadastrarContato} />
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
                  <div className="form-grid">
                    <label>
                      Nome do grupo
                      <input
                        value={grupoForm.nome}
                        onChange={(event) =>
                          setGrupoForm((current) => ({ ...current, nome: event.target.value }))
                        }
                        placeholder="Manutencao, Almoxarifado, EPIs..."
                      />
                    </label>
                    <label>
                      Codigo (sigla)
                      <input
                        value={grupoForm.codigo}
                        onChange={(event) =>
                          setGrupoForm((current) => ({
                            ...current,
                            codigo: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                          }))
                        }
                        placeholder="MAN"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="primary"
                    disabled={actionLocked || !grupoForm.nome || !grupoForm.codigo}
                  >
                    <ButtonContent active={pendingAction === ACTIONS.cadastrarGrupo}>
                      Cadastrar grupo
                    </ButtonContent>
                  </button>
                  <ActionFeedback actions={ACTIONS.cadastrarGrupo} />
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
                            {grupo.codigo} - {grupo.nome}
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
                      !itemForm.descricao ||
                      !itemForm.unidade ||
                      !itemForm.grupoId
                    }
                  >
                    <ButtonContent active={pendingAction === ACTIONS.cadastrarItem}>
                      Cadastrar item
                    </ButtonContent>
                  </button>
                  <ActionFeedback actions={ACTIONS.cadastrarItem} />
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
    </>
  )
}
