export type AppTheme = 'light' | 'dark'

const STORAGE_KEY = 'doscom-ui-theme'
const THEME_TRANSITION_MS = 380

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light'
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

type ApplyThemeOptions = {
  /** Transisi warna halus saat user mengganti tema (bukan saat bootstrap). */
  animate?: boolean
}

export function applyTheme(theme: AppTheme, options: ApplyThemeOptions = {}) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const nextDark = theme === 'dark'
  const wasDark = root.classList.contains('dark')

  const applyClasses = () => {
    root.classList.toggle('dark', nextDark)
    root.style.colorScheme = nextDark ? 'dark' : 'light'
  }

  if (options.animate && wasDark !== nextDark) {
    root.classList.add('theme-transition')
    requestAnimationFrame(() => {
      applyClasses()
    })
    window.setTimeout(() => {
      root.classList.remove('theme-transition')
    }, THEME_TRANSITION_MS)
    return
  }

  applyClasses()
}

export function persistTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore quota / private mode */
  }
  applyTheme(theme, { animate: true })
}

/** Panggil sebelum React mount agar tidak kedip saat load. */
export function bootstrapTheme() {
  applyTheme(getStoredTheme(), { animate: false })
}
