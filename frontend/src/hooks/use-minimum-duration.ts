import { useEffect, useRef, useState } from 'react'

export function useMinimumDuration(active: boolean, minMs: number) {
  const [visible, setVisible] = useState(active)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (active) {
      startedAtRef.current = Date.now()
      setVisible(true)
      return
    }

    if (startedAtRef.current === null) {
      setVisible(false)
      return
    }

    const elapsed = Date.now() - startedAtRef.current
    const remaining = Math.max(0, minMs - elapsed)
    const timer = window.setTimeout(() => {
      setVisible(false)
      startedAtRef.current = null
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [active, minMs])

  return visible
}
