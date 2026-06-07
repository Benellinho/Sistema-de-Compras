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
    let message = `API respondeu com status ${response.status}`

    try {
      const data = await response.json()
      message = data?.error || data?.message || message
    } catch {
      // Some infrastructure errors can return an empty or non-JSON body.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function jsonRequest(path, method, body) {
  return request(path, {
    method,
    body: JSON.stringify(body),
  })
}

export const comprasApi = {
  health: () => request(API_ROUTES.health),
  listarFornecedores: () => request(API_ROUTES.fornecedores),
  criarFornecedor: (data) => jsonRequest(API_ROUTES.fornecedores, 'POST', data),
  listarContatosFornecedor: (fornecedorId) =>
    request(`${API_ROUTES.fornecedores}/${fornecedorId}/contatos`),
  criarContatoFornecedor: (fornecedorId, data) =>
    jsonRequest(`${API_ROUTES.fornecedores}/${fornecedorId}/contatos`, 'POST', data),
  listarItens: () => request(API_ROUTES.itens),
  criarItem: (data) => jsonRequest(API_ROUTES.itens, 'POST', data),
  listarSolicitacoes: () => request(API_ROUTES.solicitacoes),
  listarCotacoes: () => request(API_ROUTES.cotacoes),
  listarCompras: () => request(API_ROUTES.compras),
  listarOrdensCompra: () => request(API_ROUTES.ordensCompra),
  listarUsuarios: () => request(API_ROUTES.usuarios),
  listarGrupos: () => request(API_ROUTES.grupos),
  criarGrupo: (data) => jsonRequest(API_ROUTES.grupos, 'POST', data),
  buscarSolicitacao: (id) => request(`${API_ROUTES.solicitacoes}/${id}`),
  criarSolicitacao: (data) => jsonRequest(API_ROUTES.solicitacoes, 'POST', data),
  adicionarItemSolicitacao: (solicitacaoId, data) =>
    jsonRequest(`${API_ROUTES.solicitacoes}/${solicitacaoId}/itens`, 'POST', data),
  decidirSolicitacao: (solicitacaoId, data) =>
    jsonRequest(`${API_ROUTES.solicitacoes}/${solicitacaoId}/aprovacao`, 'POST', data),
  buscarCotacao: (id) => request(`${API_ROUTES.cotacoes}/${id}`),
  criarCotacao: (data) => jsonRequest(API_ROUTES.cotacoes, 'POST', data),
  atualizarCotacaoStatus: (cotacaoId, data) =>
    jsonRequest(`${API_ROUTES.cotacoes}/${cotacaoId}/status`, 'PATCH', data),
  adicionarFornecedorCotacao: (cotacaoId, data) =>
    jsonRequest(`${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores`, 'POST', data),
  marcarEnvioFornecedorCotacao: (cotacaoId, cotacaoFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/envio`,
      'PATCH',
      data,
    ),
  atualizarFornecedorCotacaoStatus: (cotacaoId, cotacaoFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/status`,
      'PATCH',
      data,
    ),
  registrarRespostaCotacao: (cotacaoId, cotacaoFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.cotacoes}/${cotacaoId}/fornecedores/${cotacaoFornecedorId}/respostas`,
      'POST',
      data,
    ),
  criarCompra: (data) => jsonRequest(API_ROUTES.compras, 'POST', data),
  adicionarFornecedorCompra: (compraId, data) =>
    jsonRequest(`${API_ROUTES.compras}/${compraId}/fornecedores`, 'POST', data),
  adicionarItemCompra: (compraId, compraFornecedorId, data) =>
    jsonRequest(
      `${API_ROUTES.compras}/${compraId}/fornecedores/${compraFornecedorId}/itens`,
      'POST',
      data,
    ),
  enviarCompraAprovacao: (compraId, data) =>
    jsonRequest(`${API_ROUTES.compras}/${compraId}/enviar-aprovacao`, 'POST', data),
  aprovarCompra: (compraId, data) =>
    jsonRequest(`${API_ROUTES.compras}/${compraId}/aprovacao`, 'POST', data),
  criarOrdemCompra: (data) => jsonRequest(API_ROUTES.ordensCompra, 'POST', data),
}
