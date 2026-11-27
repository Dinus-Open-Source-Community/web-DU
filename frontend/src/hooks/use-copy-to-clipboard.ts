import { useCallback, useState } from 'react'

export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)

  const copy = useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setFailedKey(null)
      window.setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setCopiedKey(null)
      setFailedKey(key)
      window.setTimeout(() => setFailedKey(null), 2000)
    }
  }, [])

  return { copiedKey, failedKey, copy }
}
