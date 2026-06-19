import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { lessonKeys } from '@/hooks/query-keys'
import { fetchLessonByUid } from '@/services/lessons'
import type { LessonDetailItem } from '@/lib/types/lesson'

const STUDENT_LESSON_DETAIL_STALE_MS = 60_000

export function useStudentLessonDetails(lessonUids: string[], enabled: boolean) {
  const uniqueUids = useMemo(
    () => [...new Set(lessonUids.filter(Boolean))],
    [lessonUids],
  )

  const queries = useQueries({
    queries: uniqueUids.map((uid) => ({
      queryKey: lessonKeys.detail(uid),
      queryFn: () => fetchLessonByUid(uid),
      enabled: enabled && !!uid,
      staleTime: STUDENT_LESSON_DETAIL_STALE_MS,
    })),
  })

  const detailsByUid = useMemo(() => {
    const map = new Map<string, LessonDetailItem>()
    uniqueUids.forEach((uid, index) => {
      const data = queries[index]?.data
      if (data) map.set(uid, data)
    })
    return map
  }, [queries, uniqueUids])

  const isActiveDetailLoading = (activeUid: string | null) => {
    if (!enabled || !activeUid) return false
    const index = uniqueUids.indexOf(activeUid)
    if (index < 0) return false
    const query = queries[index]
    return query.isLoading || query.isFetching
  }

  const isLoading = enabled && queries.some((query) => query.isLoading)

  return {
    detailsByUid,
    isLoading,
    isActiveDetailLoading,
  }
}
