import type { CourseApiLevel, CourseUiLevel } from '@/lib/types'

const API_TO_UI: Record<CourseApiLevel, CourseUiLevel> = {
  PEMULA: 'Pemula',
  MENENGAH: 'Menengah',
  LANJUTAN: 'Lanjutan',
}

const UI_TO_API: Record<CourseUiLevel, CourseApiLevel> = {
  Pemula: 'PEMULA',
  Menengah: 'MENENGAH',
  Lanjutan: 'LANJUTAN',
}

export const COURSE_FORM_LEVELS: CourseUiLevel[] = ['Pemula', 'Menengah', 'Lanjutan']

export function normalizeApiLevel(raw: string | undefined): CourseApiLevel {
  const upper = (raw ?? 'PEMULA').toUpperCase() as CourseApiLevel
  if (upper in API_TO_UI) return upper
  return 'PEMULA'
}

export function apiLevelToUi(level: string | undefined): CourseUiLevel {
  return API_TO_UI[normalizeApiLevel(level)]
}

export function uiLevelToApi(level: CourseUiLevel): CourseApiLevel {
  return UI_TO_API[level]
}
