import { FileText, Film } from 'lucide-react'

import type { IModulesDetail, LessonDeliveryType, LessonDetailItem } from '@/lib/types/course'

export type LessonThemeMode = 'dark' | 'light'

export type LessonEntry = {
  lesson: LessonDetailItem
  module: IModulesDetail
  moduleIndex: number
  lessonIndex: number
}

export const LESSON_ICON_MAP: Record<LessonDeliveryType, typeof FileText> = {
  video: Film,
  text: FileText,
}

export function getLessonIcon(contentType?: string) {
  if (contentType === 'video') return Film
  return FileText
}

export function getEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (u.hostname.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      if (match) return `https://player.vimeo.com/video/${match[1]}`
    }
  } catch {
    return null
  }

  return null
}

function moduleLessons(mod: IModulesDetail) {
  return mod.lessons ?? []
}

export function flattenLessons(modules: IModulesDetail[]): LessonEntry[] {
  return modules.flatMap((mod, moduleIndex) =>
    moduleLessons(mod).map((lesson, lessonIndex) => ({
      lesson,
      module: mod,
      moduleIndex,
      lessonIndex,
    })),
  )
}

export function moduleProgress(mod: IModulesDetail, lessonEntries: LessonEntry[], completedLessons: number) {
  const lessons = moduleLessons(mod)
  const completedCount = lessons.filter((lesson) => {
    const globalIndex = lessonEntries.findIndex((entry) => entry.lesson.uid === lesson.uid)

    return globalIndex >= 0 && globalIndex < completedLessons
  }).length

  return {
    completedCount,
    totalCount: lessons.length,
  }
}
