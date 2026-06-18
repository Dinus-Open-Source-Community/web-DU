import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { lessonAssignmentKeys } from '@/hooks/query-keys'
import type { IGradeStaffSubmissionPayload } from '@/lib/types/features/course-detail-assignments'
import type { ILessonDetailAssignment } from '@/lib/types/lesson'
import { Message, resolveActionError } from '@/lib/Message'
import { gradeLessonAssignmentSubmission } from '@/services/lesson-assignment-submission'

type GradeSubmissionInput = {
  lessonUid: string
  submissionUid: string
  payload: IGradeStaffSubmissionPayload
  context: {
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  }
  successMessage?: string
}

export function useGradeLessonSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: GradeSubmissionInput) =>
      gradeLessonAssignmentSubmission(
        input.lessonUid,
        input.submissionUid,
        input.payload,
        input.context,
      ),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonAssignmentKeys.staffSubmissions(variables.lessonUid),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonAssignmentKeys.overviewSubmissions(variables.lessonUid),
        }),
      ])
      toast.success(variables.successMessage ?? Message.grade.saved)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.grade.saveFailed))
    },
  })
}
