import { API_ROUTES, apiUrl } from '../config/api'

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API respondeu com status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const comprasApi = {
  health: () => request(API_ROUTES.health),
  listarFornecedores: () => request(API_ROUTES.fornecedores),
  listarItens: () => request(API_ROUTES.itens),
  listarSolicitacoes: () => request(API_ROUTES.solicitacoes),
  listarCotacoes: () => request(API_ROUTES.cotacoes),
  listarCompras: () => request(API_ROUTES.compras),
  listarOrdensCompra: () => request(API_ROUTES.ordensCompra),
}
