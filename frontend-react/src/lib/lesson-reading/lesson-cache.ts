import type { QueryClient } from '@tanstack/react-query'

import { lessonKeys } from '@/hooks/query-keys'
import type { LessonDetailItem } from '@/lib/types/course'
import type { LessonDetailListResponse } from '@/lib/types/lesson'

export const MODULE_LESSONS_QUERY_PARAMS = { per_page: 100 } as const

function patchLessonReadingFlag(lesson: LessonDetailItem, lessonUid: string) {
  if (lesson.uid !== lessonUid) return lesson
  return { ...lesson, is_reading: true }
}

export function markLessonReadingInCache(
  queryClient: QueryClient,
  moduleUid: string,
  lessonUid: string,
) {
  const moduleLessonsKey = lessonKeys.byModule(moduleUid, MODULE_LESSONS_QUERY_PARAMS)

  queryClient.setQueryData<LessonDetailListResponse>(moduleLessonsKey, (current) => {
    if (!current?.lessons?.length) return current

    return {
      ...current,
      lessons: current.lessons.map((lesson) => patchLessonReadingFlag(lesson, lessonUid)),
    }
  })

  queryClient.setQueryData<LessonDetailItem>(lessonKeys.detail(lessonUid), (current) => {
    if (!current) return current
    return { ...current, is_reading: true }
  })
}
