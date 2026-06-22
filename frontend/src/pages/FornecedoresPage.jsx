import { ButtonContent } from '../components/ui/Button'
import { ListBlock } from '../components/ui/ListBlock'
import { ACTIONS } from '../utils/constants'
import { fornecedorNome } from '../utils/formatters'
import { useSistemaCompras } from '../context/comprasContext'

export default function FornecedoresPage() {
  const {
    fornecedores,
    contatosFornecedor,
    fornecedoresAtivos,
    fornecedorForm,
    contatoForm,
    actionLocked,
    pendingAction,
    setFornecedorForm,
    setContatoForm,
    handleCreateFornecedor,
    handleCreateContato,
  } = useSistemaCompras()

  return (
    <div className="page-section">
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
              disabled={actionLocked || !fornecedorForm.cnpj || !fornecedorForm.razaoSocial}
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

      <section className="catalog-grid">
        <ListBlock title="Fornecedores" items={fornecedores} />
        <ListBlock title="Contatos" items={contatosFornecedor} />
      </section>
    </div>
  )
}
