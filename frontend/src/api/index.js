import { request } from './apiClient'
import { fornecedoresApi } from './fornecedores.api'
import { gruposApi } from './grupos.api'
import { itensApi } from './itens.api'
import { usuariosApi } from './usuarios.api'
import { solicitacoesApi } from './solicitacoes.api'
import { cotacoesApi } from './cotacoes.api'
import { comprasApi as comprasModuleApi } from './compras.api'
import { ordensCompraApi } from './ordensCompra.api'
import { API_ROUTES } from '../config/api'

export const sistemaComprasApi = {
  health: () => request(API_ROUTES.health),
  listarFornecedores: fornecedoresApi.listar,
  criarFornecedor: fornecedoresApi.criar,
  listarContatosFornecedor: fornecedoresApi.listarContatos,
  criarContatoFornecedor: fornecedoresApi.criarContato,
  listarItens: itensApi.listar,
  criarItem: itensApi.criar,
  listarSolicitacoes: solicitacoesApi.listar,
  buscarSolicitacao: solicitacoesApi.buscar,
  criarSolicitacao: solicitacoesApi.criar,
  limparSolicitacoesTeste: solicitacoesApi.limparTestes,
  adicionarItemSolicitacao: solicitacoesApi.adicionarItem,
  atualizarItemSolicitacao: solicitacoesApi.atualizarItem,
  removerItemSolicitacao: solicitacoesApi.removerItem,
  decidirSolicitacao: solicitacoesApi.decidir,
  listarCotacoes: cotacoesApi.listar,
  buscarCotacao: cotacoesApi.buscar,
  criarCotacao: cotacoesApi.criar,
  atualizarCotacaoStatus: cotacoesApi.atualizarStatus,
  adicionarFornecedorCotacao: cotacoesApi.adicionarFornecedor,
  marcarEnvioFornecedorCotacao: cotacoesApi.marcarEnvioFornecedor,
  atualizarFornecedorCotacaoStatus: cotacoesApi.atualizarFornecedorStatus,
  registrarRespostaCotacao: cotacoesApi.registrarResposta,
  listarCompras: comprasModuleApi.listar,
  criarCompra: comprasModuleApi.criar,
  adicionarFornecedorCompra: comprasModuleApi.adicionarFornecedor,
  adicionarItemCompra: comprasModuleApi.adicionarItem,
  enviarCompraAprovacao: comprasModuleApi.enviarAprovacao,
  aprovarCompra: comprasModuleApi.aprovar,
  listarOrdensCompra: ordensCompraApi.listar,
  criarOrdemCompra: ordensCompraApi.criar,
  listarUsuarios: usuariosApi.listar,
  listarGrupos: gruposApi.listar,
  criarGrupo: gruposApi.criar,
}

export {
  comprasModuleApi as comprasApi,
  cotacoesApi,
  fornecedoresApi,
  gruposApi,
  itensApi,
  ordensCompraApi,
  solicitacoesApi,
  usuariosApi,
}
