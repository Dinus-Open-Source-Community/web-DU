import { useEffect, useState } from 'react'

const STORAGE_KEY = 'simulate_empty_landing_data'

/**
 * Returns whether simulated empty data is active.
 * Default is `true` to allow immediate previewing of empty fallback states.
 */
export function getSimulateEmpty(): boolean {
  if (typeof window === 'undefined') return true
  const urlParam = new URLSearchParams(window.location.search).get('empty')
  if (urlParam === 'true') return true
  if (urlParam === 'false') return false

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    return stored === 'true'
  }
  return true
}

export function setSimulateEmpty(val: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(val))
  window.dispatchEvent(new Event('simulate-empty-change'))
}

export function useSimulateEmpty(): [boolean, (val: boolean) => void] {
  const [empty, setEmpty] = useState<boolean>(getSimulateEmpty)

  useEffect(() => {
    const handleUpdate = () => {
      setEmpty(getSimulateEmpty())
    }
    window.addEventListener('simulate-empty-change', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('simulate-empty-change', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return [empty, setSimulateEmpty]
}
