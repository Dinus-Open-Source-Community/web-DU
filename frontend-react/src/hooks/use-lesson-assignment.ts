import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { canStartAssignmentWork, getAssignmentSubmissionBlockReason } from '@/lib/lesson-assignment/assignment-rules'
import { sanitizeSubmissionPayload } from '@/lib/lesson-assignment/submission-draft'
import { normalizeQuizPayload } from '@/lib/lesson-assignment/quiz-payload'
import { buildQuizReviewSummary } from '@/lib/lesson-assignment/quiz-review'
import {
  deriveSubmissionPhase,
  getSubmissionStatusLabel,
  isAssignmentVisibleToStudent,
} from '@/lib/lesson-assignment/submission-status'
import type { IQuiz, LessonDetailAssignment, LessonDetailItem } from '@/lib/types/lesson'
import {
  fetchMyLessonAssignmentSubmission,
  submitLessonAssignment,
  type SubmitLessonAssignmentInput,
} from '@/services/lesson-assignment'
import { lessonAssignmentKeys } from './query-keys'

type UseLessonAssignmentOptions = {
  lesson: LessonDetailItem | null | undefined
  enabled: boolean
}

export function useLessonAssignment({ lesson, enabled }: UseLessonAssignmentOptions) {
  const queryClient = useQueryClient()
  const lessonUid = lesson?.uid ?? ''
  const assignment = lesson?.assignment ?? null
  const quiz = useMemo(
    () => normalizeQuizPayload((assignment?.quiz_payload as IQuiz | null) ?? null),
    [assignment?.quiz_payload],
  )

  const submissionQuery = useQuery({
    queryKey: lessonAssignmentKeys.mySubmission(lessonUid),
    enabled: enabled && !!lessonUid && isAssignmentVisibleToStudent(assignment),
    queryFn: () => fetchMyLessonAssignmentSubmission(lessonUid),
    staleTime: 30_000,
  })

  const submission = submissionQuery.data ?? null

  const phase = useMemo(
    () => (assignment ? deriveSubmissionPhase(assignment, submission) : 'not_submitted'),
    [assignment, submission],
  )

  const statusLabel = useMemo(
    () => (assignment ? getSubmissionStatusLabel(assignment, phase) : ''),
    [assignment, phase],
  )

  const canStart = useMemo(
    () => (assignment ? canStartAssignmentWork(assignment, submission, new Date()) : false),
    [assignment, submission],
  )

  const submissionBlockReason = useMemo(
    () => (assignment ? getAssignmentSubmissionBlockReason(assignment, submission, new Date()) : null),
    [assignment, submission],
  )

  const quizReview = useMemo(
    () =>
      assignment?.task_type === 'quiz'
        ? buildQuizReviewSummary(
            (assignment?.quiz_payload as IQuiz | null) ?? null,
            submission?.quizAnswers ?? {},
            submission?.grading,
          )
        : null,
    [assignment?.quiz_payload, assignment?.task_type, submission?.grading, submission?.quizAnswers],
  )

  const submitMutation = useMutation({
    mutationFn: (input: SubmitLessonAssignmentInput) => {
      if (!assignment) {
        throw new Error('Data tugas belum tersedia.')
      }

      const sanitized = sanitizeSubmissionPayload(assignment, input)
      return submitLessonAssignment(lessonUid, sanitized, {
        assignment,
        priorFileUrl: submission?.fileUrl ?? null,
        hasExistingSubmission: Boolean(submission),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: lessonAssignmentKeys.mySubmission(lessonUid) })
    },
  })

  return {
    assignment: assignment as LessonDetailAssignment | null,
    quiz,
    submission,
    phase,
    statusLabel,
    canStart,
    submissionBlockReason,
    quizReview,
    isLoading: submissionQuery.isLoading,
    isSubmitting: submitMutation.isPending,
    submitAssignment: submitMutation.mutateAsync,
    refetchSubmission: submissionQuery.refetch,
  }
}
