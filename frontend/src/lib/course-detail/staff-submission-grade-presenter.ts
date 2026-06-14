import type { ICourseStaffSubmission } from '@/lib/types/features/course-detail-assignments'

export type StaffSubmissionGradeDraft = {
  scorePercent: number
  passed: boolean
}

export function buildGradeDraftFromSubmission(
  submission: ICourseStaffSubmission,
): StaffSubmissionGradeDraft {
  return {
    scorePercent:
      submission.scorePercent !== null ? Math.round(submission.scorePercent) : 70,
    passed: submission.passed ?? true,
  }
}

export function buildGradePayloadFromSubmission(
  submission: ICourseStaffSubmission,
  draft: StaffSubmissionGradeDraft,
  feedback?: string,
) {
  return {
    score_percent: draft.scorePercent,
    passed: draft.passed,
    feedback: feedback ?? submission.feedback ?? undefined,
  }
}
