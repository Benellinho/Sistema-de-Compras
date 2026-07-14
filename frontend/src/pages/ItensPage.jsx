import { ButtonContent } from '../components/ui/Button'
import { ActionFeedback } from '../components/ui/ActionFeedback'
import { ListBlock } from '../components/ui/ListBlock'
import { ACTIONS } from '../utils/constants'
import { useSistemaCompras } from '../context/comprasContext'

export default function ItensPage() {
  const {
    grupos,
    itens,
    gruposAtivos,
    grupoForm,
    itemForm,
    actionLocked,
    pendingAction,
    setGrupoForm,
    setItemForm,
    handleCreateGrupo,
    handleCreateItem,
  } = useSistemaCompras()

  return (
    <div className="page-section">
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
            <button type="submit" className="primary" disabled={actionLocked || !grupoForm.nome}>
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
            <ActionFeedback actions={ACTIONS.cadastrarItem} />
          </form>
        </section>
      </div>

      <section className="catalog-grid">
        <ListBlock title="Grupos de item" items={grupos} />
        <ListBlock title="Itens de compra" items={itens} />
      </section>
    </div>
  )
}
