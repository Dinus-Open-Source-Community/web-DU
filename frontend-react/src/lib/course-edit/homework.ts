import { createDefaultQuiz } from './mappers'
import type { EditableLesson } from './types'
import type { HomeworkTaskType } from '@/lib/types/lesson'

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
  return {
    ...lesson,
    homeworkType: lesson.homeworkType ?? 'text',
    homeworkDescriptionHtml: lesson.homeworkDescriptionHtml ?? '<p></p>',
    homeworkQuiz: lesson.homeworkQuiz ?? createDefaultQuiz(),
  }
}

export function applyHomeworkPatch(
  lesson: EditableLesson,
  patch: {
    homeworkType?: HomeworkTaskType
    homeworkDescriptionHtml?: string
    homeworkQuiz?: EditableLesson['homeworkQuiz']
  },
): EditableLesson {
  const next = ensureHomeworkDefaults({
    ...lesson,
    ...patch,
  })

  return {
    ...next,
    hasHomework: isHomeworkConfigured(next),
  }
}
