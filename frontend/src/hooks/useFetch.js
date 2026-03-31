import { useState, useEffect, useCallback, useRef } from 'react'

const BASE = import.meta.env.VITE_API_URL || ''

export default function useFetch(url, transform) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const transformRef = useRef(transform)
  transformRef.current = transform

  const retry = useCallback(() => setAttempt(n => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setErrorType(null)
    setData(null)

    fetch(`${BASE}${url}`)
      .then(res => {
        if (!res.ok) {
          const err = new Error(`Server error ${res.status}`)
          err.status = res.status
          throw err
        }
        return res.json()
      })
      .then(json => {
        if (cancelled) return

        const isEmpty =
          (Array.isArray(json) && json.length === 0) ||
          (json !== null &&
            typeof json === 'object' &&
            !Array.isArray(json) &&
            Object.keys(json).length === 0)

        if (isEmpty) {
          setData(json)
          setErrorType('empty')
        } else {
          setData(transformRef.current ? transformRef.current(json) : json)
        }
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        if (err.status) {
          setErrorType('server')
          setError(`Server error ${err.status} — please try again.`)
        } else {
          setErrorType('network')
          setError('Unable to reach the server. Check your connection.')
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [url, attempt])

  return { data, loading, error, errorType, retry }
}
