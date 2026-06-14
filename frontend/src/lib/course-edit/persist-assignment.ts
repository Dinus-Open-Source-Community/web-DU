import { isHomeworkConfigured } from '@/lib/course-edit/homework'
import {
  buildAssignmentUpsertPayload,
  validateHomeworkForSave,
} from '@/lib/course-edit/homework-rules'
import type { EditableLesson } from '@/lib/course-edit/types'
import {
  createLessonAssignment,
  deleteLessonAssignment,
  updateLessonAssignment,
} from '@/services/lesson-assignment-admin'

export type PersistAssignmentResult = {
  assignmentUid: string | null
}

export async function persistAssignment(
  lessonUid: string,
  lesson: EditableLesson,
): Promise<PersistAssignmentResult> {
  const configured = isHomeworkConfigured(lesson)
  const existingUid = lesson.homeworkAssignmentUid ?? null

  if (!configured) {
    if (existingUid) {
      await deleteLessonAssignment(lessonUid)
    }
    return { assignmentUid: null }
  }

  const validationError = validateHomeworkForSave(lesson)
  if (validationError) {
    throw new Error(validationError)
  }

  const payload = buildAssignmentUpsertPayload(lesson)

  if (existingUid) {
    const updated = await updateLessonAssignment(lessonUid, payload)
    return { assignmentUid: updated.uid }
  }

  try {
    const created = await createLessonAssignment(lessonUid, payload)
    return { assignmentUid: created.uid }
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('already has an assignment')) {
      const updated = await updateLessonAssignment(lessonUid, payload)
      return { assignmentUid: updated.uid }
    }
    throw error
  }
}
