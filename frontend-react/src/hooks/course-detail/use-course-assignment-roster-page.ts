import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { lessonAssignmentKeys } from '@/hooks/query-keys'
import {
  buildAssignmentSubmissionDetailHref,
  buildCourseDetailAssignmentsHref,
  type StaffAssignmentRole,
} from '@/lib/course-detail/course-assignment-navigation'
import {
  buildAssignmentRoster,
  filterRosterBySearch,
  filterRosterByStatus,
} from '@/lib/course-detail/course-assignment-roster-presenter'
import type { CourseAssignmentRosterPageViewModel } from '@/lib/course-detail/course-assignment-roster-view-model'
import type { AssignmentRosterStatusFilter } from '@/lib/types/features/course-detail-assignments'
import type { IMentorCourseStudent, IModulesData } from '@/lib/types/course'
import { deriveLessonsFromModules } from '@/lib/course-detail/derive-lessons-from-modules'
import { fetchLessonAssignment } from '@/services/lesson-assignment-admin'
import { fetchLessonAssignmentSubmissions } from '@/services/lesson-assignment-submission'

type UseCourseAssignmentRosterPageOptions = {
  courseUid: string
  lessonUid: string
  role: StaffAssignmentRole
  courseTitle: string
  modules: IModulesData[]
  students: IMentorCourseStudent[]
}

export function useCourseAssignmentRosterPage({
  courseUid,
  lessonUid,
  role,
  courseTitle,
  modules,
  students,
}: UseCourseAssignmentRosterPageOptions): CourseAssignmentRosterPageViewModel {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AssignmentRosterStatusFilter>('all')

  const lessonRef = useMemo(() => {
    const lessons = deriveLessonsFromModules(modules)
    return lessons.find((lesson) => lesson.uid === lessonUid) ?? null
  }, [lessonUid, modules])

  const assignmentQuery = useQuery({
    queryKey: lessonAssignmentKeys.detail(lessonUid),
    queryFn: () => fetchLessonAssignment(lessonUid),
    enabled: Boolean(lessonUid),
    staleTime: 30_000,
    retry: false,
  })

  const submissionsQuery = useQuery({
    queryKey: lessonAssignmentKeys.staffSubmissions(lessonUid),
    queryFn: () =>
      fetchLessonAssignmentSubmissions(lessonUid, {
        lessonTitle: lessonRef?.title ?? 'Lesson',
        moduleTitle: lessonRef?.moduleTitle ?? 'Modul',
        assignment: assignmentQuery.data!,
      }),
    enabled: Boolean(lessonUid && assignmentQuery.data),
    staleTime: 30_000,
    retry: false,
  })

  const rosterRows = useMemo(
    () => buildAssignmentRoster(students, submissionsQuery.data ?? []),
    [students, submissionsQuery.data],
  )

  const filteredRosterRows = useMemo(() => {
    const bySearch = filterRosterBySearch(rosterRows, searchQuery)
    return filterRosterByStatus(bySearch, statusFilter)
  }, [rosterRows, searchQuery, statusFilter])

  const buildSubmissionDetailHref = useCallback(
    (submissionUid: string) =>
      buildAssignmentSubmissionDetailHref(role, courseUid, lessonUid, submissionUid),
    [courseUid, lessonUid, role],
  )

  return {
    courseUid,
    courseTitle,
    lessonUid,
    lessonTitle: lessonRef?.title ?? 'Lesson',
    moduleTitle: lessonRef?.moduleTitle ?? 'Modul',
    assignment: assignmentQuery.data ?? null,
    rosterRows,
    filteredRosterRows,
    isLoading: assignmentQuery.isLoading || submissionsQuery.isLoading,
    isError: assignmentQuery.isError || submissionsQuery.isError,
    errorMessage:
      (assignmentQuery.error as Error | undefined)?.message ??
      (submissionsQuery.error as Error | undefined)?.message ??
      null,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    backHref: buildCourseDetailAssignmentsHref(role, courseUid),
    buildSubmissionDetailHref,
  }
}
