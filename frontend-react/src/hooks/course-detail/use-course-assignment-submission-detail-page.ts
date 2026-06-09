import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { lessonAssignmentKeys } from '@/hooks/query-keys'
import { useAuth } from '@/providers/auth-provider'
import { useGradeLessonSubmission } from '@/hooks/use-lesson-submission-grade'
import {
  buildAssignmentSubmissionDetailHref,
  buildAssignmentSubmissionsHref,
  type StaffAssignmentRole,
} from '@/lib/course-detail/course-assignment-navigation'
import {
  buildAssignmentRoster,
  filterRosterBySearch,
} from '@/lib/course-detail/course-assignment-roster-presenter'
import type { CourseAssignmentSubmissionDetailPageViewModel } from '@/lib/course-detail/course-assignment-submission-detail-view-model'
import {
  buildGradeDraftFromSubmission,
  buildGradePayloadFromSubmission,
  type StaffSubmissionGradeDraft,
} from '@/lib/course-detail/staff-submission-grade-presenter'
import type { StaffSubmissionViewer } from '@/lib/course-detail/staff-submission-grader-presenter'
import type { IMentorCourseStudent, IModulesData } from '@/lib/types/course'
import { useCourseDetailLessons } from '@/hooks/course-detail/use-course-detail-lessons'
import { fetchLessonAssignment } from '@/services/lesson-assignment-admin'
import { fetchLessonAssignmentSubmissions } from '@/services/lesson-assignment-submission'

type UseCourseAssignmentSubmissionDetailPageOptions = {
  courseUid: string
  lessonUid: string
  submissionUid: string
  role: StaffAssignmentRole
  courseTitle: string
  modules: IModulesData[]
  students: IMentorCourseStudent[]
}

export function useCourseAssignmentSubmissionDetailPage({
  courseUid,
  lessonUid,
  submissionUid,
  role,
  courseTitle,
  modules,
  students,
}: UseCourseAssignmentSubmissionDetailPageOptions): CourseAssignmentSubmissionDetailPageViewModel {
  const { user } = useAuth()
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  const [savingIntent, setSavingIntent] = useState<'score' | 'feedback' | null>(null)

  const staffViewer = useMemo<StaffSubmissionViewer | null>(() => {
    if (!user) return null

    return {
      uid: user.uid,
      name: user.name,
      avatar_url: user.avatar_url ?? '',
      role: user.role,
    }
  }, [user])

  const { lessons } = useCourseDetailLessons(modules, Boolean(lessonUid))

  const lessonRef = useMemo(
    () => lessons.find((lesson) => lesson.uid === lessonUid) ?? null,
    [lessonUid, lessons],
  )

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

  const sidebarRows = useMemo(
    () => filterRosterBySearch(rosterRows, sidebarSearchQuery),
    [rosterRows, sidebarSearchQuery],
  )

  const submission = useMemo(
    () => submissionsQuery.data?.find((item) => item.uid === submissionUid) ?? null,
    [submissionUid, submissionsQuery.data],
  )

  const gradeMutation = useGradeLessonSubmission()

  const buildSubmissionDetailHref = useCallback(
    (targetSubmissionUid: string) =>
      buildAssignmentSubmissionDetailHref(role, courseUid, lessonUid, targetSubmissionUid),
    [courseUid, lessonUid, role],
  )

  const persistGrade = useCallback(
    async (
      draft: StaffSubmissionGradeDraft,
      feedback: string | undefined,
      intent: 'score' | 'feedback',
    ) => {
      if (!submission || !assignmentQuery.data) return

      setSavingIntent(intent)
      try {
        await gradeMutation.mutateAsync({
          lessonUid,
          submissionUid: submission.uid,
          payload: buildGradePayloadFromSubmission(submission, draft, feedback),
          context: {
            lessonTitle: lessonRef?.title ?? submission.lessonTitle,
            moduleTitle: lessonRef?.moduleTitle ?? submission.moduleTitle,
            assignment: assignmentQuery.data,
          },
          successMessage:
            intent === 'score' ? 'Nilai berhasil disimpan' : 'Feedback berhasil disimpan',
        })
      } finally {
        setSavingIntent(null)
      }
    },
    [assignmentQuery.data, gradeMutation, lessonRef, lessonUid, submission],
  )

  const handleSubmitScore = useCallback(
    async (draft: StaffSubmissionGradeDraft) => {
      if (!submission) return
      await persistGrade(draft, submission.feedback ?? undefined, 'score')
    },
    [persistGrade, submission],
  )

  const handleSubmitFeedback = useCallback(
    async (feedback: string) => {
      if (!submission) return
      const draft = buildGradeDraftFromSubmission(submission)
      await persistGrade(draft, feedback, 'feedback')
    },
    [persistGrade, submission],
  )

  return {
    courseUid,
    courseTitle,
    lessonUid,
    lessonTitle: lessonRef?.title ?? submission?.lessonTitle ?? 'Lesson',
    moduleTitle: lessonRef?.moduleTitle ?? submission?.moduleTitle ?? 'Modul',
    assignment: assignmentQuery.data ?? null,
    submission,
    staffViewer,
    activeSubmissionUid: submissionUid,
    sidebarRows,
    sidebarSearchQuery,
    onSidebarSearchQueryChange: setSidebarSearchQuery,
    buildSubmissionDetailHref,
    isLoading: assignmentQuery.isLoading || submissionsQuery.isLoading,
    isError: assignmentQuery.isError || submissionsQuery.isError,
    errorMessage:
      (assignmentQuery.error as Error | undefined)?.message ??
      (submissionsQuery.error as Error | undefined)?.message ??
      null,
    backHref: buildAssignmentSubmissionsHref(role, courseUid, lessonUid),
    onSubmitScore: handleSubmitScore,
    onSubmitFeedback: handleSubmitFeedback,
    isSavingScore: gradeMutation.isPending && savingIntent === 'score',
    isSavingFeedback: gradeMutation.isPending && savingIntent === 'feedback',
  }
}
