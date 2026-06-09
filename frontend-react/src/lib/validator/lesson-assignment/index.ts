import type { LessonDetailAssignment } from '@/lib/types/lesson'
import type { LessonAssignmentUpsertPayload } from '@/lib/course-edit/homework-rules'
import type { IGradeStaffSubmissionPayload } from '@/lib/types/features/course-detail-assignments'
import { beResolvableUidSchema } from '../common'
import { parseWithValidationMessage } from '../errors'
import {
  lessonAssignmentUpsertRequestSchema,
  type LessonAssignmentUpsertRequestValidated,
} from './assignment.schema'
import {
  createLessonAssignmentSubmissionInputSchema,
  type LessonAssignmentSubmissionInput,
  type LessonAssignmentSubmissionInputValidated,
  type LessonAssignmentSubmissionValidationContext,
} from './submission.schema'
import {
  gradeStaffSubmissionPayloadSchema,
  type GradeStaffSubmissionPayloadValidated,
} from './grade.schema'

export * from './assignment.schema'
export * from './submission.schema'
export * from './grade.schema'

export function parseLessonAssignmentUpsertRequest(
  payload: LessonAssignmentUpsertPayload,
  fallback = 'Payload tugas tidak valid',
): LessonAssignmentUpsertRequestValidated {
  return parseWithValidationMessage(lessonAssignmentUpsertRequestSchema, payload, fallback)
}

export function parseLessonAssignmentSubmissionInput(
  input: LessonAssignmentSubmissionInput,
  context: LessonAssignmentSubmissionValidationContext,
  fallback = 'Jawaban tugas tidak valid',
): LessonAssignmentSubmissionInputValidated {
  const schema = createLessonAssignmentSubmissionInputSchema(context)
  return parseWithValidationMessage(schema, input, fallback)
}

export function parseGradeStaffSubmissionPayload(
  payload: IGradeStaffSubmissionPayload,
  fallback = 'Payload penilaian tidak valid',
): GradeStaffSubmissionPayloadValidated {
  return parseWithValidationMessage(gradeStaffSubmissionPayloadSchema, payload, fallback)
}

export function parseLessonUidParam(uid: string, fallback = 'UID lesson tidak valid'): string {
  return parseWithValidationMessage(beResolvableUidSchema, uid, fallback)
}

export function parseSubmissionUidParam(uid: string, fallback = 'UID submission tidak valid'): string {
  return parseWithValidationMessage(beResolvableUidSchema, uid, fallback)
}

export function buildSubmissionValidationContext(
  assignment: LessonDetailAssignment,
  priorFileUrl?: string | null,
): LessonAssignmentSubmissionValidationContext {
  return {
    assignment: {
      task_type: assignment.task_type,
      allow_file_submission: assignment.allow_file_submission,
      allow_plain_text_submission: assignment.allow_plain_text_submission,
      allow_rich_text_submission: assignment.allow_rich_text_submission,
      require_file_description: assignment.require_file_description,
      quiz_payload: assignment.quiz_payload,
    },
    priorFileUrl,
  }
}
