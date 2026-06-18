import { useEffect, useState } from 'react'

export function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetcher()

        if (active) {
          setData(result)
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
    // O chamador controla explicitamente quando refazer a busca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { data, loading, error }
}
