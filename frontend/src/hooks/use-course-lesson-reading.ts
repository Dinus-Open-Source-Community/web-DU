import { useCallback, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toLearningProgressPercent } from '@/lib/learning/progress'
import {
  markLessonReadingInCache,
  revertLessonReadingInCache,
} from '@/lib/lesson-reading/lesson-cache'
import { findLessonModuleUid, mergeReadLessonIds } from '@/lib/lesson-reading/lesson-read-state'
import type { IModulesDetail } from '@/lib/types/course'
import { markLessonAsRead } from '@/services/lesson-reading'
import { fetchCourseProgress } from '@/services/course'
import { authKeys, courseKeys } from './query-keys'

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
  const attemptedLessonsRef = useRef<Set<string>>(new Set())
  const isForbiddenRef = useRef(false)

  // Reset tracking state if course changes
  const prevCourseUidRef = useRef(courseUid)
  if (prevCourseUidRef.current !== courseUid) {
    prevCourseUidRef.current = courseUid
    attemptedLessonsRef.current.clear()
    isForbiddenRef.current = false
  }

  const progressQuery = useQuery({
    queryKey: courseKeys.progress(courseUid),
    enabled: enabled && !!courseUid && !isForbiddenRef.current,
    queryFn: () => fetchCourseProgress(courseUid),
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 403 || error?.response?.status === 403) {
        isForbiddenRef.current = true
        return false
      }
      return failureCount < 2
    },
  })

  const readLessonIds = useMemo(
    () => mergeReadLessonIds(modules, markedLessonIds),
    [markedLessonIds, modules],
  )

  const readLessonIdsRef = useRef(readLessonIds)
  readLessonIdsRef.current = readLessonIds

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
    retry: false,
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
    onError: (error: any, lessonUid) => {
      if (error?.status === 403 || error?.response?.status === 403) {
        isForbiddenRef.current = true
      }

      setMarkedLessonIds((current) => {
        if (!current.has(lessonUid)) return current
        const next = new Set(current)
        next.delete(lessonUid)
        return next
      })

      const moduleUid = findLessonModuleUid(modules, lessonUid)
      if (moduleUid) {
        revertLessonReadingInCache(queryClient, moduleUid, lessonUid)
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.progress(courseUid) }),
        queryClient.invalidateQueries({ queryKey: authKeys.session }),
      ])
    },
  })

  const markMutationRef = useRef(markMutation)
  markMutationRef.current = markMutation

  const markLessonIfUnread = useCallback(
    async (lessonUid: string) => {
      if (!enabled || !lessonUid) return
      if (isForbiddenRef.current) return
      if (readLessonIdsRef.current.has(lessonUid)) return
      if (attemptedLessonsRef.current.has(lessonUid)) return

      attemptedLessonsRef.current.add(lessonUid)
      try {
        await markMutationRef.current.mutateAsync(lessonUid)
      } catch {
        // Handled in onError callback; avoid unhandled rejection
      }
    },
    [enabled],
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
