const DEFAULT_API_BASE_URL = 'https://sistema-de-compra-api.onrender.com'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')

export const API_ROUTES = {
  health: '/health',
  usuarios: '/usuarios',
  fornecedores: '/fornecedores',
  grupos: '/grupos',
  itens: '/itens',
  solicitacoes: '/solicitacoes',
  cotacoes: '/cotacoes',
  compras: '/compras',
  ordensCompra: '/ordens-compra',
}

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
