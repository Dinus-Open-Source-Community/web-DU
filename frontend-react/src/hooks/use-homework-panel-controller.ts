import {
  applyHomeworkPatch,
  ensureHomeworkDefaults,
} from '@/lib/course-edit/homework'
import { applyHomeworkRulesPatch } from '@/lib/course-edit/homework-rules'
import { getLessonKey } from '@/lib/course-edit/mappers'
import type { EditableLesson } from '@/lib/course-edit/types'
import type { HomeworkTaskType } from '@/lib/types/lesson'

type PatchAssignmentFn = (
  lessonId: string,
  updater: (lesson: EditableLesson) => EditableLesson,
) => void

export function useHomeworkPanelController(
  lesson: EditableLesson,
  onPatchAssignment: PatchAssignmentFn,
) {
  const lessonKey = getLessonKey(lesson)
  const homeworkLesson = ensureHomeworkDefaults(lesson)
  const homeworkType = homeworkLesson.homeworkType ?? 'text'
  const rules = homeworkLesson.homeworkRules!
  const persistedLessonUid = lesson.uid ?? null
  const hasPersistedAssignment = Boolean(homeworkLesson.homeworkAssignmentUid)
  const canSaveAssignment = Boolean(persistedLessonUid)

  const patchLesson = (updater: (current: EditableLesson) => EditableLesson) => {
    onPatchAssignment(lessonKey, updater)
  }

  const patchHomework = (patch: Parameters<typeof applyHomeworkPatch>[1]) => {
    patchLesson((current) => applyHomeworkPatch(current, patch))
  }

  const patchRules = (patch: Parameters<typeof applyHomeworkRulesPatch>[1]) => {
    patchLesson((current) => applyHomeworkRulesPatch(current, patch))
  }

  const setHomeworkType = (type: HomeworkTaskType) => {
    patchHomework({ homeworkType: type })
  }

  return {
    lessonKey,
    homeworkLesson,
    homeworkType,
    rules,
    hasPersistedAssignment,
    canSaveAssignment,
    patchHomework,
    patchRules,
    setHomeworkType,
  }
}
