import type { CourseLevel } from '@/lib/types/course'
import type { CourseApiLevel } from './types'

const API_TO_UI: Record<CourseApiLevel, CourseLevel> = {
  PEMULA: 'Pemula',
  MENENGAH: 'Menengah',
  LANJUTAN: 'Lanjutan',
}

const UI_TO_API: Record<CourseLevel, CourseApiLevel> = {
  Pemula: 'PEMULA',
  Menengah: 'MENENGAH',
  Lanjutan: 'LANJUTAN',
}

export const COURSE_FORM_LEVELS: CourseLevel[] = ['Pemula', 'Menengah', 'Lanjutan']

export function normalizeApiLevel(raw: string | undefined): CourseApiLevel {
  const upper = (raw ?? 'PEMULA').toUpperCase() as CourseApiLevel
  if (upper in API_TO_UI) return upper
  return 'PEMULA'
}

export function apiLevelToUi(level: string | undefined): CourseLevel {
  return API_TO_UI[normalizeApiLevel(level)]
}

export function uiLevelToApi(level: CourseLevel): CourseApiLevel {
  return UI_TO_API[level]
}
