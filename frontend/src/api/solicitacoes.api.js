import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const solicitacoesApi = {
  listar: () => request(API_ROUTES.solicitacoes),
  buscar: (id) => request(`${API_ROUTES.solicitacoes}/${id}`),
  criar: (data) => jsonRequest(API_ROUTES.solicitacoes, 'POST', data),
  limparTestes: () =>
    jsonRequest(`${API_ROUTES.solicitacoes}/limpar-testes`, 'DELETE', {
      confirmacao: 'LIMPAR_SOLICITACOES',
    }),
  adicionarItem: (solicitacaoId, data) =>
    jsonRequest(`${API_ROUTES.solicitacoes}/${solicitacaoId}/itens`, 'POST', data),
  atualizarItem: (solicitacaoId, itemSolicitacaoId, data) =>
    jsonRequest(
      `${API_ROUTES.solicitacoes}/${solicitacaoId}/itens/${itemSolicitacaoId}`,
      'PUT',
      data,
    ),
  removerItem: (solicitacaoId, itemSolicitacaoId) =>
    request(`${API_ROUTES.solicitacoes}/${solicitacaoId}/itens/${itemSolicitacaoId}`, {
      method: 'DELETE',
    }),
  decidir: (solicitacaoId, data) =>
    jsonRequest(`${API_ROUTES.solicitacoes}/${solicitacaoId}/aprovacao`, 'POST', data),
}
