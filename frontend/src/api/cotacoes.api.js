import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const cotacoesApi = {
  listar: () => request(API_ROUTES.cotacoes),
  buscar: (id) => request(`${API_ROUTES.cotacoes}/${id}`),
  criar: (data) => jsonRequest(API_ROUTES.cotacoes, 'POST', data),
  atualizarStatus: (cotacaoId, data) =>
    jsonRequest(`${API_ROUTES.cotacoes}/${cotacaoId}/status`, 'PATCH', data),
  adicionarFornecedor: (cotacaoId, data) =>
    jsonRequest(`${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores`, 'POST', data),
  marcarEnvioFornecedor: (cotacaoId, cotacaoFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/envio`,
      'PATCH',
      data,
    ),
  atualizarFornecedorStatus: (cotacaoId, cotacaoFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/status`,
      'PATCH',
      data,
    ),
  registrarResposta: (cotacaoId, cotacaoFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/respostas`,
      'POST',
      data,
    ),
}
