import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toLearningProgressPercent } from '@/lib/learning/progress'
import {
  markLessonReadingInCache,
  MODULE_LESSONS_QUERY_PARAMS,
} from '@/lib/lesson-reading/lesson-cache'
import { findLessonModuleUid, mergeReadLessonIds } from '@/lib/lesson-reading/lesson-read-state'
import type { IModulesDetail } from '@/lib/types/course'
import { markLessonAsRead } from '@/services/lesson-reading'
import { fetchCourseProgress } from '@/services/course'
import { authKeys, courseKeys, lessonKeys } from './query-keys'

type UseCourseLessonReadingOptions = {
  courseUid: string
  modules: IModulesDetail[]
  enabled: boolean
}

export function useCourseLessonReading({
  courseUid,
  modules,
  enabled,
}: UseCourseLessonReadingOptions) {
  const queryClient = useQueryClient()
  const [markedLessonIds, setMarkedLessonIds] = useState<ReadonlySet<string>>(() => new Set())

  const progressQuery = useQuery({
    queryKey: courseKeys.progress(courseUid),
    enabled: enabled && !!courseUid,
    queryFn: () => fetchCourseProgress(courseUid),
    staleTime: 60_000,
  })

  const readLessonIds = useMemo(
    () => mergeReadLessonIds(modules, markedLessonIds),
    [markedLessonIds, modules],
  )

  const totalLessons = useMemo(
    () => modules.reduce((count, module) => count + (module.lessons?.length ?? 0), 0),
    [modules],
  )

  const completedLessonsCount = progressQuery.data?.lessons_read ?? readLessonIds.size

  const progressPercent = useMemo(() => {
    if (progressQuery.data) {
      return toLearningProgressPercent(progressQuery.data.progress)
    }

    if (totalLessons === 0) return 0
    return toLearningProgressPercent(readLessonIds.size / totalLessons)
  }, [progressQuery.data, readLessonIds.size, totalLessons])

  const markMutation = useMutation({
    mutationFn: markLessonAsRead,
    onMutate: (lessonUid) => {
      const moduleUid = findLessonModuleUid(modules, lessonUid)
      if (moduleUid) {
        markLessonReadingInCache(queryClient, moduleUid, lessonUid)
      }

      setMarkedLessonIds((current) => {
        const next = new Set(current)
        next.add(lessonUid)
        return next
      })
    },
    onError: (_error, lessonUid) => {
      setMarkedLessonIds((current) => {
        if (!current.has(lessonUid)) return current
        const next = new Set(current)
        next.delete(lessonUid)
        return next
      })

      const moduleUid = findLessonModuleUid(modules, lessonUid)
      if (moduleUid) {
        void queryClient.invalidateQueries({
          queryKey: lessonKeys.byModule(moduleUid, MODULE_LESSONS_QUERY_PARAMS),
        })
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.progress(courseUid) }),
        queryClient.invalidateQueries({ queryKey: authKeys.session }),
      ])
    },
  })

  const markLessonIfUnread = useCallback(
    async (lessonUid: string) => {
      if (!enabled || !lessonUid) return
      if (readLessonIds.has(lessonUid)) return
      if (markMutation.isPending && markMutation.variables === lessonUid) return

      await markMutation.mutateAsync(lessonUid)
    },
    [enabled, markMutation, readLessonIds],
  )

  return {
    readLessonIds,
    completedLessonsCount,
    progressPercent,
    markLessonIfUnread,
    isMarkingLesson: markMutation.isPending,
    isLoading: progressQuery.isLoading,
  }
}
