import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'

import { courseKeys, lessonAssignmentKeys } from '@/hooks/query-keys'
import {
  buildOverviewSourcesFromBulk,
  fetchSubmissionSummariesForAssignment,
} from '@/lib/course-detail/adapters/course-assignments-overview-adapter'
import type { CourseAssignmentOverviewSource } from '@/lib/course-detail/assignment-overview-types'
import { fetchCourseAssignments } from '@/services/course-assignments'

type CourseAssignmentsOverviewParams = {
  page: number
  per_page: number
  task_type?: string
}

export function useCourseAssignmentsOverview(
  courseUid: string,
  enabled = true,
  params: CourseAssignmentsOverviewParams = { page: 1, per_page: 10 },
) {
  const bulkQuery = useQuery({
    queryKey: courseKeys.assignments(courseUid, params),
    queryFn: () => fetchCourseAssignments(courseUid, params),
    enabled: enabled && Boolean(courseUid),
    staleTime: 60_000,
    retry: false,
  })

  const assignments = useMemo(
    () => bulkQuery.data?.assignments ?? [],
    [bulkQuery.data?.assignments],
  )

  const assignmentsNeedingSubmissions = useMemo(
    () => assignments.filter((assignment) => assignment.submissionCount > 0),
    [assignments],
  )

  const submissionQueries = useQueries({
    queries: assignmentsNeedingSubmissions.map((assignment) => ({
      queryKey: lessonAssignmentKeys.overviewSubmissions(assignment.lessonUid),
      queryFn: () => fetchSubmissionSummariesForAssignment(assignment),
      enabled: enabled && bulkQuery.isSuccess,
      staleTime: 30_000,
      retry: false,
    })),
  })

  const sources = useMemo((): CourseAssignmentOverviewSource[] => {
    const submissionResults = new Map<string, CourseAssignmentOverviewSource['submissions']>()
    const loadingLessonUids = new Set<string>()

    assignmentsNeedingSubmissions.forEach((assignment, index) => {
      const query = submissionQueries[index]
      if (!query) return

      if (query.isLoading) {
        loadingLessonUids.add(assignment.lessonUid)
        return
      }

      if (query.data) {
        submissionResults.set(assignment.lessonUid, query.data)
      }
    })

    return buildOverviewSourcesFromBulk(assignments, submissionResults, loadingLessonUids)
  }, [assignments, assignmentsNeedingSubmissions, submissionQueries])

  const isHydratingSubmissions = submissionQueries.some((query) => query.isLoading)

  const isError = bulkQuery.isError || submissionQueries.some((query) => query.isError)

  const error =
    bulkQuery.error ?? submissionQueries.find((query) => query.error)?.error ?? null

  return {
    sources,
    meta: bulkQuery.data?.meta,
    isLoading: bulkQuery.isLoading,
    isHydratingSubmissions,
    isError,
    error,
  }
}
