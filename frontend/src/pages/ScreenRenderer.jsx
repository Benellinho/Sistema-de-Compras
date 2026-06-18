import { API_BASE_URL, API_ROUTES } from '../config/api'
import { ActionScreen } from '../components/ui/ActionScreen'
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
  CLASSIFICACAO_CREATE_SOLICITACAO_VALUE,
  DEFAULT_RETORNO_PARCELAS,
  RECUSA_JUSTIFICATIVAS,
  RETORNO_PARCELAS_OPTIONS,
} from '../utils/constants'
import {
  compraNumero,
  compraTotal,
  cotacaoFornecedorTotal,
  cotacaoNumero,
  fornecedorNome,
  formatCurrency,
  itemSolicitacaoDescricao,
  retornoStatusFromFornecedor,
  solicitacaoCentroCusto,
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
    selectedAprovacaoCotacao,
    selectedAprovacaoSolicitacao,
    selectedAprovacaoFornecedor,
    respostasDaCotacao,
    retornoTotal,
    compraFornecedorElegivel,
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
    handleAprovacaoCotacaoChange,
    goToEnvioCotacao,
    handleRecusarCotacao,
  } = useSistemaCompras()

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
    </>
  )
}
