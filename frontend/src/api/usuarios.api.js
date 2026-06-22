import { API_ROUTES } from '../config/api'
import { request } from './apiClient'

export const usuariosApi = {
  listar: () => request(API_ROUTES.usuarios),
}
