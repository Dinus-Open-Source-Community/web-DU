'use client'

import { createContext, useContext } from 'react'

interface SidebarSessionUser {
  name: string
  email: string
  role: string
  avatar?: string
}

interface SidebarSessionContextValue {
  user: SidebarSessionUser
  onLogout: () => void
  onProfile: () => void
}

const SidebarSessionContext = createContext<SidebarSessionContextValue | undefined>(undefined)

export function SidebarSessionProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: SidebarSessionContextValue
}) {
  return <SidebarSessionContext.Provider value={value}>{children}</SidebarSessionContext.Provider>
}

export function useSidebarSession() {
  const context = useContext(SidebarSessionContext)
  if (!context) {
    throw new Error('useSidebarSession must be used within SidebarSessionProvider')
  }
  return context
}
