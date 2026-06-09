import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { lessonAssignmentKeys } from '@/hooks/query-keys'
import type {
  ICourseDetailLessonRef,
  ICourseLessonAssignmentBundle,
  ICourseStaffSubmission,
} from '@/lib/types/features/course-detail-assignments'
import { fetchLessonAssignment } from '@/services/lesson-assignment-admin'
import { fetchLessonAssignmentSubmissions } from '@/services/lesson-assignment-submission'

export function useCourseStaffAssignmentsData(lessons: ICourseDetailLessonRef[], enabled = true) {
  const assignmentQueries = useQueries({
    queries: lessons.map((lesson) => ({
      queryKey: lessonAssignmentKeys.detail(lesson.uid),
      queryFn: () => fetchLessonAssignment(lesson.uid),
      enabled: enabled && Boolean(lesson.uid),
      staleTime: 30_000,
      retry: false,
    })),
  })

  const lessonsWithAssignment = useMemo(() => {
    return lessons
      .map((lesson, index) => ({
        lesson,
        assignment: assignmentQueries[index]?.data ?? null,
      }))
      .filter((entry) => entry.assignment !== null)
  }, [assignmentQueries, lessons])

  const submissionQueries = useQueries({
    queries: lessonsWithAssignment.map(({ lesson, assignment }) => ({
      queryKey: lessonAssignmentKeys.staffSubmissions(lesson.uid),
      queryFn: () =>
        fetchLessonAssignmentSubmissions(lesson.uid, {
          lessonTitle: lesson.title,
          moduleTitle: lesson.moduleTitle,
          assignment: assignment!,
        }),
      enabled: enabled && Boolean(assignment?.uid),
      staleTime: 30_000,
      retry: false,
    })),
  })

  const bundles = useMemo(() => {
    return lessonsWithAssignment.map((entry, index) => ({
      lessonUid: entry.lesson.uid,
      lessonTitle: entry.lesson.title,
      moduleTitle: entry.lesson.moduleTitle,
      moduleUid: entry.lesson.moduleUid,
      orderIndex: entry.lesson.orderIndex,
      assignment: entry.assignment,
      submissions: submissionQueries[index]?.data ?? [],
    }))
  }, [lessonsWithAssignment, submissionQueries])

  const submissions = useMemo(() => {
    const result: ICourseStaffSubmission[] = []

    bundles.forEach((bundle) => {
      result.push(...bundle.submissions)
    })

    return result.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
  }, [bundles])

  const isLoading =
    assignmentQueries.some((query) => query.isLoading) ||
    submissionQueries.some((query) => query.isLoading)

  const isError =
    assignmentQueries.some((query) => query.isError) ||
    submissionQueries.some((query) => query.isError)

  const error =
    assignmentQueries.find((query) => query.error)?.error ??
    submissionQueries.find((query) => query.error)?.error

  return {
    bundles: bundles as ICourseLessonAssignmentBundle[],
    submissions,
    assignmentCount: lessonsWithAssignment.length,
    isLoading,
    isError,
    error,
  }
}
