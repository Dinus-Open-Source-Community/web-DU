'use client'

import { createContext, useContext } from 'react'
import { useSidebar } from '@/hooks/use-sidebar'

export interface SidebarStateContextValue {
  isOpen: boolean
  isMinimized: boolean
  toggleOpen: () => void
  close: () => void
  toggleMinimize: () => void
}

const SidebarStateContext = createContext<SidebarStateContextValue | undefined>(undefined)

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const value = useSidebar()
  return <SidebarStateContext.Provider value={value}>{children}</SidebarStateContext.Provider>
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext)
  if (!context) {
    throw new Error('useSidebarState must be used within SidebarStateProvider')
  }
  return context
}
