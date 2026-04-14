'use client'

import { createContext, useContext } from 'react'
import { useSidebar } from '@/hooks/use-sidebar'

// Create context for sidebar state to be shared with child layouts
export interface SidebarContextType {
  isOpen: boolean
  isMinimized: boolean
  toggleOpen: () => void
  close: () => void
  toggleMinimize: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within AuthorizedLayout')
  }
  return context
}

// Root layout untuk semua authorized routes
// Manages sidebar state yang bisa diakses oleh semua role-specific child layouts
export default function AuthorizedLayout({ children }: { children: React.ReactNode }) {
  const sidebarState = useSidebar()

  return <SidebarContext.Provider value={sidebarState}>{children}</SidebarContext.Provider>
}
