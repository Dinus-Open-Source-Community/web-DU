import { useCallback, useState } from 'react'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'
import {
  hasStoredLessonTheme,
  persistLessonTheme,
  readStoredLessonTheme,
} from '@/lib/course-module-viewer/lesson-theme-storage'

export function useLessonTheme() {
  const [theme, setTheme] = useState<LessonThemeMode>(() => readStoredLessonTheme())
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(() => !hasStoredLessonTheme())

  const updateTheme = useCallback((nextTheme: LessonThemeMode) => {
    setTheme(nextTheme)
    persistLessonTheme(nextTheme)
  }, [])

  return {
    theme,
    isThemeDialogOpen,
    setIsThemeDialogOpen,
    updateTheme,
  }
}
