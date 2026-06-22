import { API_ROUTES } from '../config/api'
import { jsonRequest, request } from './apiClient'

export const ordensCompraApi = {
  listar: () => request(API_ROUTES.ordensCompra),
  criar: (data) => jsonRequest(API_ROUTES.ordensCompra, 'POST', data),
}
