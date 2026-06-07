import { normalizeInstructionAttachments } from '@/lib/course-edit/instruction-attachments'
import type { LessonAssignmentStatus, LessonDetailAssignment } from '@/lib/types/lesson'

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
    allow_file_submission: Boolean(data.allow_file_submission),
    allow_plain_text_submission: Boolean(data.allow_plain_text_submission),
    allow_rich_text_submission: Boolean(data.allow_rich_text_submission),
    require_file_description: Boolean(data.require_file_description),
    instruction_attachments: normalizeInstructionAttachments(data.instruction_attachments),
    deadline_at: String(data.deadline_at ?? ''),
    status: normalizeAssignmentStatus(data.status),
    auto_close_after_deadline: Boolean(data.auto_close_after_deadline),
    allow_resubmit: Boolean(data.allow_resubmit),
    max_resubmit_count:
      typeof data.max_resubmit_count === 'number' ? data.max_resubmit_count : null,
    created_at: String(data.created_at ?? ''),
    updated_at: String(data.updated_at ?? ''),
  }
}
