'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'sidebar-minimized'

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Restore minimized state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') setIsMinimized(true)
    } catch {
      // SSR or storage unavailable
    }
  }, [])

  const toggleOpen = useCallback(() => setIsOpen((v) => !v), [])
  const close = useCallback(() => setIsOpen(false), [])

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // Storage unavailable
      }
      return next
    })
  }, [])

  return { isOpen, isMinimized, toggleOpen, close, toggleMinimize } as const
}
