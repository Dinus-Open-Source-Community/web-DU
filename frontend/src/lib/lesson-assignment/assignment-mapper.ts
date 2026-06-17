import type { LessonAssignmentApiRaw } from '@/lib/lesson-assignment/api-types'
import { normalizeInstructionAttachments } from '@/lib/course-edit/instruction-attachments'
import type { LessonAssignmentStatus, LessonDetailAssignment } from '@/lib/types/lesson'

function parseAssignmentBoolean(value: boolean | number | string | undefined): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0' || normalized === '') return false
  }

  return false
}

function normalizeAssignmentStatus(value: string | undefined): LessonAssignmentStatus {
  if (value === 'TERBIT' || value === 'DITUTUP') return value
  return 'DRAFT'
}

export function mapLessonDetailAssignment(raw: LessonAssignmentApiRaw | null | undefined): LessonDetailAssignment | null {
  if (!raw) return null

  return {
    uid: String(raw.uid ?? ''),
    lesson_uid: String(raw.lesson_uid ?? ''),
    title: String(raw.title ?? ''),
    task_type: raw.task_type === 'quiz' ? 'quiz' : 'text',
    task_description: raw.task_description ?? null,
    quiz_payload: raw.quiz_payload ?? null,
    allow_file_submission: parseAssignmentBoolean(raw.allow_file_submission),
    allow_plain_text_submission: parseAssignmentBoolean(raw.allow_plain_text_submission),
    allow_rich_text_submission: parseAssignmentBoolean(raw.allow_rich_text_submission),
    require_file_description: parseAssignmentBoolean(raw.require_file_description),
    instruction_attachments: normalizeInstructionAttachments(raw.instruction_attachments),
    deadline_at: String(raw.deadline_at ?? ''),
    status: normalizeAssignmentStatus(raw.status),
    auto_close_after_deadline: parseAssignmentBoolean(raw.auto_close_after_deadline),
    allow_resubmit: parseAssignmentBoolean(raw.allow_resubmit),
    max_resubmit_count:
      typeof raw.max_resubmit_count === 'number' ? raw.max_resubmit_count : null,
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}
