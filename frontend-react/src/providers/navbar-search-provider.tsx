import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type NavbarSearchItem = {
  id: string
  label: string
  description?: string
  path?: string
  icon?: LucideIcon
  keywords?: string[]
  onSelect?: () => void
}

export type NavbarLocalSearch = {
  id: string
  placeholder?: string
  items?: NavbarSearchItem[]
  onSearch?: (query: string) => void
}

type NavbarSearchContextValue = {
  localSearch: NavbarLocalSearch | null
  registerLocalSearch: (search: NavbarLocalSearch) => () => void
}

const NavbarSearchContext = createContext<NavbarSearchContextValue | undefined>(undefined)

export function NavbarSearchProvider({ children }: { children: ReactNode }) {
  const [localSearch, setLocalSearch] = useState<NavbarLocalSearch | null>(null)

  const registerLocalSearch = useCallback((search: NavbarLocalSearch) => {
    setLocalSearch(search)

    return () => {
      setLocalSearch((current) => (current?.id === search.id ? null : current))
    }
  }, [])

  const value = useMemo(
    () => ({
      localSearch,
      registerLocalSearch,
    }),
    [localSearch, registerLocalSearch],
  )

  return <NavbarSearchContext.Provider value={value}>{children}</NavbarSearchContext.Provider>
}

export function useNavbarSearch() {
  const context = useContext(NavbarSearchContext)
  if (!context) {
    throw new Error('useNavbarSearch must be used within NavbarSearchProvider')
  }

  return context
}

export function useOptionalNavbarSearch() {
  return useContext(NavbarSearchContext)
}
