import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const itensApi = {
  listar: () => request(API_ROUTES.itens),
  criar: (data) => jsonRequest(API_ROUTES.itens, 'POST', data),
}
