import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { lessonKeys } from '@/hooks/query-keys'
import type { ICourseDetailLessonRef } from '@/lib/types/features/course-detail-assignments'
import type { IModulesData } from '@/lib/types/course'
import { fetchLessonsByModuleUid } from '@/services/lessons'

export function useCourseDetailLessons(modules: IModulesData[], enabled = true) {
  const moduleList = useMemo(
    () => modules.filter((module) => Boolean(module.uid)),
    [modules],
  )

  const lessonQueries = useQueries({
    queries: moduleList.map((module) => ({
      queryKey: lessonKeys.byModule(module.uid, { per_page: 100 }),
      queryFn: () => fetchLessonsByModuleUid(module.uid, { per_page: 100 }),
      enabled: enabled && Boolean(module.uid),
      staleTime: 60_000,
    })),
  })

  const lessons = useMemo(() => {
    const result: ICourseDetailLessonRef[] = []

    moduleList.forEach((module, index) => {
      const query = lessonQueries[index]
      const lessonItems = query?.data?.lessons ?? []

      lessonItems.forEach((lesson) => {
        result.push({
          uid: lesson.uid,
          title: lesson.title,
          moduleUid: module.uid,
          moduleTitle: module.title,
          orderIndex: lesson.order_index,
        })
      })
    })

    return result.sort((a, b) => a.orderIndex - b.orderIndex)
  }, [lessonQueries, moduleList])

  const isLoading = lessonQueries.some((query) => query.isLoading)
  const isError = lessonQueries.some((query) => query.isError)
  const error = lessonQueries.find((query) => query.error)?.error

  return {
    lessons,
    isLoading,
    isError,
    error,
  }
}
