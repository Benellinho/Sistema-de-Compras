import { apiUrl } from '../config/api'

export async function request(path, options = {}) {
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
      // Algumas falhas de infraestrutura podem voltar sem JSON.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function jsonRequest(path, method, body) {
  return request(path, {
    method,
    body: JSON.stringify(body),
  })
}
