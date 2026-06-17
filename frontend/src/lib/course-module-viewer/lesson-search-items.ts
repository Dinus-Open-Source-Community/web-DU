import type { NavbarSearchItem } from '@/providers/navbar-search-provider'

import { getLessonIcon, type LessonEntry } from '@/lib/course-module-viewer/lesson-viewer-utils'

export function buildLessonSearchItems(
  lessonEntries: LessonEntry[],
  onSelectLesson: (lessonId: string, moduleId: string) => void,
): NavbarSearchItem[] {
  return lessonEntries.map((entry) => ({
    id: entry.lesson.uid,
    label: entry.lesson.title,
    description: `${entry.module.title} - Lesson ${entry.lessonIndex + 1}`,
    icon: getLessonIcon(entry.lesson.content_type),
    keywords: [
      entry.module.title,
      entry.lesson.content_type,
      String(entry.moduleIndex + 1),
      String(entry.lessonIndex + 1),
    ],
    onSelect: () => onSelectLesson(entry.lesson.uid, entry.module.uid),
  }))
}

export function filterLessonSearchItems(items: NavbarSearchItem[], searchQuery: string): NavbarSearchItem[] {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return items.slice(0, 8)

  return items
    .filter((item) =>
      [item.label, item.description, ...(item.keywords ?? [])]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    )
    .slice(0, 8)
}

export function findLessonSearchItemByQuery(
  items: NavbarSearchItem[],
  query: string,
): NavbarSearchItem | undefined {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return undefined

  return items.find((item) =>
    [item.label, item.description, ...(item.keywords ?? [])]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery)),
  )
}
