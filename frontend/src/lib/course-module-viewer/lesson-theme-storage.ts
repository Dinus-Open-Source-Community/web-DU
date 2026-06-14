import type { LessonThemeMode } from '@/components/courses/module-viewer/utils'

export const LESSON_THEME_STORAGE_KEY = 'course-module-viewer-theme'

export function readStoredLessonTheme(): LessonThemeMode {
  if (typeof window === 'undefined') return 'dark'

  const storedTheme = window.localStorage.getItem(LESSON_THEME_STORAGE_KEY)
  return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark'
}

export function hasStoredLessonTheme(): boolean {
  if (typeof window === 'undefined') return true
  return Boolean(window.localStorage.getItem(LESSON_THEME_STORAGE_KEY))
}

export function persistLessonTheme(theme: LessonThemeMode): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LESSON_THEME_STORAGE_KEY, theme)
}
