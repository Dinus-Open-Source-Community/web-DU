import { createDefaultQuiz } from './mappers'
import {
  createDefaultHomeworkRules,
  ensureHomeworkRules,
  mapAssignmentToHomeworkRules,
} from './homework-rules'
import type { EditableLesson } from './types'
import type { HomeworkTaskType, LessonDetailAssignment } from '@/lib/types/lesson'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function isHomeworkConfigured(lesson: EditableLesson): boolean {
  const type = lesson.homeworkType ?? 'text'

  if (type === 'quiz') {
    return (lesson.homeworkQuiz?.questions.length ?? 0) > 0
  }

  return stripHtml(lesson.homeworkDescriptionHtml ?? '').length > 0
}

export function ensureHomeworkDefaults(lesson: EditableLesson): EditableLesson {
  const homeworkType = lesson.homeworkType ?? 'text'
  return {
    ...lesson,
    homeworkTitle: lesson.homeworkTitle ?? lesson.title,
    homeworkType,
    homeworkDescriptionHtml: lesson.homeworkDescriptionHtml ?? '<p></p>',
    homeworkQuiz: lesson.homeworkQuiz ?? createDefaultQuiz(),
    homeworkRules: ensureHomeworkRules(lesson),
  }
}

export function applyHomeworkFromAssignment(
  lesson: EditableLesson,
  assignment: LessonDetailAssignment | null,
): EditableLesson {
  if (!assignment) {
    return ensureHomeworkDefaults({
      ...lesson,
      homeworkAssignmentUid: null,
      hasHomework: false,
    })
  }

  const taskDescription = assignment.task_description
  const homeworkDescriptionHtml =
    typeof taskDescription?.contentHtml === 'string'
      ? taskDescription.contentHtml
      : '<p></p>'

  return ensureHomeworkDefaults({
    ...lesson,
    hasHomework: true,
    homeworkTitle: assignment.title,
    homeworkAssignmentUid: assignment.uid,
    homeworkType: assignment.task_type,
    homeworkDescriptionHtml,
    homeworkQuiz: assignment.quiz_payload ?? createDefaultQuiz(),
    homeworkRules: mapAssignmentToHomeworkRules(assignment),
  })
}

export function applyHomeworkPatch(
  lesson: EditableLesson,
  patch: {
    homeworkTitle?: string
    homeworkType?: HomeworkTaskType
    homeworkDescriptionHtml?: string
    homeworkQuiz?: EditableLesson['homeworkQuiz']
    homeworkRules?: EditableLesson['homeworkRules']
  },
): EditableLesson {
  const homeworkType = patch.homeworkType ?? lesson.homeworkType ?? 'text'
  const next = ensureHomeworkDefaults({
    ...lesson,
    ...patch,
    homeworkRules:
      patch.homeworkType != null && patch.homeworkRules == null
        ? createDefaultHomeworkRules(homeworkType)
        : patch.homeworkRules ?? lesson.homeworkRules,
  })

  return {
    ...next,
    hasHomework: isHomeworkConfigured(next),
  }
}
