import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const gruposApi = {
  listar: () => request(API_ROUTES.grupos),
  criar: (data) => jsonRequest(API_ROUTES.grupos, 'POST', data),
}
