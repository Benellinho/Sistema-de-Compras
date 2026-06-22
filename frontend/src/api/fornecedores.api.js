import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const fornecedoresApi = {
  listar: () => request(API_ROUTES.fornecedores),
  criar: (data) => jsonRequest(API_ROUTES.fornecedores, 'POST', data),
  listarContatos: (fornecedorId) =>
    request(`${API_ROUTES.fornecedores}/${fornecedorId}/contatos`),
  criarContato: (fornecedorId, data) =>
    jsonRequest(`${API_ROUTES.fornecedores}/${fornecedorId}/contatos`, 'POST', data),
}
