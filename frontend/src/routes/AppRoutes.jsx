import { Navigate, Route, Routes } from 'react-router-dom'
import AprovarCotacaoPage from '../pages/AprovarCotacaoPage'
import CadastroBasePage from '../pages/CadastroBasePage'
import CadastrosPage from '../pages/CadastrosPage'
import ClassificarSolicitacaoPage from '../pages/ClassificarSolicitacaoPage'
import CompraDetalhePage from '../pages/CompraDetalhePage'
import ComprasPage from '../pages/ComprasPage'
import CotacaoDetalhePage from '../pages/CotacaoDetalhePage'
import CotacoesPage from '../pages/CotacoesPage'
import Dashboard from '../pages/Dashboard'
import EnviarCotacaoPage from '../pages/EnviarCotacaoPage'
import FornecedoresPage from '../pages/FornecedoresPage'
import ItensPage from '../pages/ItensPage'
import OrdemCompraDetalhePage from '../pages/OrdemCompraDetalhePage'
import OrdensCompraPage from '../pages/OrdensCompraPage'
import RetornoCotacaoPage from '../pages/RetornoCotacaoPage'
import SolicitacaoDetalhePage from '../pages/SolicitacaoDetalhePage'
import SolicitacoesPage from '../pages/SolicitacoesPage'
import StatusApiPage from '../pages/StatusApiPage'
import UsuariosPage from '../pages/UsuariosPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/status-api" element={<StatusApiPage />} />
      <Route path="/fornecedores" element={<FornecedoresPage />} />
      <Route path="/itens" element={<ItensPage />} />
      <Route path="/usuarios" element={<UsuariosPage />} />
      <Route path="/solicitacoes" element={<SolicitacoesPage />} />
      <Route path="/solicitacoes/classificar" element={<ClassificarSolicitacaoPage />} />
      <Route path="/solicitacoes/:id" element={<SolicitacaoDetalhePage />} />
      <Route path="/cotacoes" element={<CotacoesPage />} />
      <Route path="/cotacoes/enviar" element={<EnviarCotacaoPage />} />
      <Route path="/cotacoes/retorno" element={<RetornoCotacaoPage />} />
      <Route path="/cotacoes/aprovar" element={<AprovarCotacaoPage />} />
      <Route path="/cotacoes/:id" element={<CotacaoDetalhePage />} />
      <Route path="/compras" element={<ComprasPage />} />
      <Route path="/compras/:id" element={<CompraDetalhePage />} />
      <Route path="/ordens-compra" element={<OrdensCompraPage />} />
      <Route path="/ordens-compra/:id" element={<OrdemCompraDetalhePage />} />
      <Route path="/cadastros" element={<CadastrosPage />} />
      <Route path="/cadastros/novo" element={<CadastroBasePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
