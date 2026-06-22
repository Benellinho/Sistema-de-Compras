import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const comprasApi = {
  listar: () => request(API_ROUTES.compras),
  criar: (data) => jsonRequest(API_ROUTES.compras, 'POST', data),
  adicionarFornecedor: (compraId, data) =>
    jsonRequest(`${API_ROUTES.compras}/${compraId}/fornecedores`, 'POST', data),
  adicionarItem: (compraId, compraFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.compras}/${compraId}/fornecedores/${compraFornecedorId}/itens`,
      'POST',
      data,
    ),
  enviarAprovacao: (compraId, data) =>
    jsonRequest(`${API_ROUTES.compras}/${compraId}/enviar-aprovacao`, 'POST', data),
  aprovar: (compraId, data) =>
    jsonRequest(`${API_ROUTES.compras}/${compraId}/aprovacao`, 'POST', data),
}
