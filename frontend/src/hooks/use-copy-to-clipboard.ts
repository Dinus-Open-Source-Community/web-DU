import { useCallback, useState } from 'react'

export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setCopiedKey(null)
    }
  }, [])

  return { copiedKey, copy }
}
