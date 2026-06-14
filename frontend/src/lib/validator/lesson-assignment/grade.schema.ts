import { z } from 'zod'

const MAX_FEEDBACK_LENGTH = 50_000

function roundScorePercent(value: number) {
  return Math.round(value * 1000) / 1000
}

/** Payload PUT `/lessons/:id/assignment/submissions/:submissionUid/grade` — selaras `dto.LessonAssignmentSubmissionGradeRequest`. */
export const gradeStaffSubmissionPayloadSchema = z
  .object({
    score_percent: z
      .number({ message: 'score_percent wajib diisi' })
      .finite('score_percent harus berupa angka valid')
      .min(0, 'score_percent minimal 0')
      .max(100, 'score_percent maksimal 100')
      .transform(roundScorePercent),
    feedback: z
      .string()
      .max(MAX_FEEDBACK_LENGTH, `feedback maksimal ${MAX_FEEDBACK_LENGTH} karakter`)
      .optional(),
    passed: z.boolean().optional(),
  })
  .strict()
  .transform((data) => ({
    score_percent: data.score_percent,
    ...(data.feedback !== undefined ? { feedback: data.feedback } : {}),
    ...(data.passed !== undefined ? { passed: data.passed } : {}),
  }))

export type GradeStaffSubmissionPayloadValidated = z.infer<typeof gradeStaffSubmissionPayloadSchema>
