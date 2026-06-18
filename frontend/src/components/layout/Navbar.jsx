import { ButtonContent } from '../ui/Button'
import { useSistemaCompras } from '../../context/comprasContext'

export function Navbar() {
  const { actionLocked, loadingData, handleLoadBackendData, navigateToTab } = useSistemaCompras()

  return (
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
  )
}
