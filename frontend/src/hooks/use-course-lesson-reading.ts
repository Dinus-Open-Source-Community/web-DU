import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { toLearningProgressPercent } from '@/lib/learning/progress'
import {
  markLessonReadingInCache,
  revertLessonReadingInCache,
} from '@/lib/lesson-reading/lesson-cache'
import { findLessonModuleUid, mergeReadLessonIds } from '@/lib/lesson-reading/lesson-read-state'
import { isForbiddenApiError } from '@/services/api-error'
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
  const [markedLessonState, setMarkedLessonState] = useState(() => ({
    courseUid,
    ids: new Set<string>() as ReadonlySet<string>,
  }))
  const trackingRef = useRef({
    courseUid,
    attempted: new Set<string>(),
    forbidden: false,
  })
  const markedLessonIds = useMemo(
    () => markedLessonState.courseUid === courseUid ? markedLessonState.ids : new Set<string>(),
    [courseUid, markedLessonState],
  )
  const getTracking = useCallback(() => {
    if (trackingRef.current.courseUid !== courseUid) {
      trackingRef.current = { courseUid, attempted: new Set(), forbidden: false }
    }
    return trackingRef.current
  }, [courseUid])

  const progressQuery = useQuery({
    queryKey: courseKeys.progress(courseUid),
    enabled: enabled && !!courseUid,
    queryFn: () => fetchCourseProgress(courseUid),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && isForbiddenApiError(error)) {
        getTracking().forbidden = true
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
  const markMutationRef = useRef<UseMutationResult<Awaited<ReturnType<typeof markLessonAsRead>>, Error, string> | null>(null)

  useEffect(() => {
    trackingRef.current = { courseUid, attempted: new Set(), forbidden: false }
  }, [courseUid])

  useEffect(() => {
    readLessonIdsRef.current = readLessonIds
  }, [readLessonIds])

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

      setMarkedLessonState((current) => {
        const ids = current.courseUid === courseUid ? current.ids : new Set<string>()
        if (ids.has(lessonUid)) return current
        const next = new Set(ids)
        next.add(lessonUid)
        return { courseUid, ids: next }
      })
    },
    onError: (error: Error, lessonUid) => {
      if (isAxiosError(error) && isForbiddenApiError(error)) {
        getTracking().forbidden = true
      }

      setMarkedLessonState((current) => {
        if (current.courseUid !== courseUid || !current.ids.has(lessonUid)) return current
        const next = new Set(current.ids)
        next.delete(lessonUid)
        return { courseUid, ids: next }
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

  useEffect(() => {
    markMutationRef.current = markMutation
  }, [markMutation])

  const markLessonIfUnread = useCallback(
    async (lessonUid: string) => {
      if (!enabled || !lessonUid) return
      const tracking = getTracking()
      if (
        tracking.forbidden ||
        (isAxiosError(progressQuery.error) && isForbiddenApiError(progressQuery.error)) ||
        readLessonIdsRef.current.has(lessonUid)
      ) return
      if (tracking.attempted.has(lessonUid)) return

      tracking.attempted.add(lessonUid)
      try {
        await markMutationRef.current?.mutateAsync(lessonUid)
      } catch {
        // Handled in onError callback; avoid unhandled rejection
      }
    },
    [enabled, getTracking, progressQuery.error],
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
