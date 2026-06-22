import { createContext, useContext } from 'react'

export const SistemaComprasContext = createContext(null)

export function useSistemaCompras() {
  const context = useContext(SistemaComprasContext)

  if (!context) {
    throw new Error('useSistemaCompras deve ser usado dentro de SistemaComprasProvider.')
  }

  return context
}
