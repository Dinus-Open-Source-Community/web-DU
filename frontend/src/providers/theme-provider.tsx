import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getStoredTheme,
  persistTheme,
  type AppTheme,
} from '@/lib/theme/app-theme'

type ThemeContextValue = {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => getStoredTheme())

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next)
    persistTheme(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider')
  }
  return ctx
}
