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

export type NavbarCourseBreadcrumb = {
  courseUid: string
  label: string
}

type NavbarSearchContextValue = {
  localSearch: NavbarLocalSearch | null
  registerLocalSearch: (search: NavbarLocalSearch) => () => void
  courseBreadcrumb: NavbarCourseBreadcrumb | null
  registerCourseBreadcrumb: (breadcrumb: NavbarCourseBreadcrumb) => () => void
}

const NavbarSearchContext = createContext<NavbarSearchContextValue | undefined>(undefined)

export function NavbarSearchProvider({ children }: { children: ReactNode }) {
  const [localSearch, setLocalSearch] = useState<NavbarLocalSearch | null>(null)
  const [courseBreadcrumb, setCourseBreadcrumb] = useState<NavbarCourseBreadcrumb | null>(null)

  const registerLocalSearch = useCallback((search: NavbarLocalSearch) => {
    setLocalSearch(search)

    return () => {
      setLocalSearch((current) => (current?.id === search.id ? null : current))
    }
  }, [])

  const registerCourseBreadcrumb = useCallback((breadcrumb: NavbarCourseBreadcrumb) => {
    setCourseBreadcrumb(breadcrumb)

    return () => {
      setCourseBreadcrumb((current) =>
        current?.courseUid === breadcrumb.courseUid ? null : current,
      )
    }
  }, [])

  const value = useMemo(
    () => ({
      localSearch,
      registerLocalSearch,
      courseBreadcrumb,
      registerCourseBreadcrumb,
    }),
    [localSearch, registerLocalSearch, courseBreadcrumb, registerCourseBreadcrumb],
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
