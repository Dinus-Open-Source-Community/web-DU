import { normalizeInstructionAttachments } from '@/lib/course-edit/instruction-attachments'
import type { LessonAssignmentStatus, LessonDetailAssignment } from '@/lib/types/lesson'

function parseAssignmentBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0' || normalized === '') return false
  }

  return false
}

function normalizeAssignmentStatus(value: unknown): LessonAssignmentStatus {
  if (value === 'TERBIT' || value === 'DITUTUP') return value
  return 'DRAFT'
}

export function mapLessonDetailAssignment(raw: unknown): LessonDetailAssignment | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as Record<string, unknown>

  return {
    uid: String(data.uid ?? ''),
    lesson_uid: String(data.lesson_uid ?? ''),
    title: String(data.title ?? ''),
    task_type: data.task_type === 'quiz' ? 'quiz' : 'text',
    task_description: (data.task_description as LessonDetailAssignment['task_description']) ?? null,
    quiz_payload: (data.quiz_payload as LessonDetailAssignment['quiz_payload']) ?? null,
    allow_file_submission: parseAssignmentBoolean(data.allow_file_submission),
    allow_plain_text_submission: parseAssignmentBoolean(data.allow_plain_text_submission),
    allow_rich_text_submission: parseAssignmentBoolean(data.allow_rich_text_submission),
    require_file_description: parseAssignmentBoolean(data.require_file_description),
    instruction_attachments: normalizeInstructionAttachments(data.instruction_attachments),
    deadline_at: String(data.deadline_at ?? ''),
    status: normalizeAssignmentStatus(data.status),
    auto_close_after_deadline: parseAssignmentBoolean(data.auto_close_after_deadline),
    allow_resubmit: parseAssignmentBoolean(data.allow_resubmit),
    max_resubmit_count:
      typeof data.max_resubmit_count === 'number' ? data.max_resubmit_count : null,
    created_at: String(data.created_at ?? ''),
    updated_at: String(data.updated_at ?? ''),
  }
}
