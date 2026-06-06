import { editableLessonToPayloadInput } from '@/lib/course-edit/mappers'
import type { EditableLesson, EditableModule } from '@/lib/course-edit/types'
import { parseLessonPayloadInput } from '@/lib/validator/lessons'
import {
  createPersistedModule,
  updatePersistedModule,
} from '@/lib/course-edit/persist-module'
import { createLesson, updateLesson } from '@/services/lessons'

type PersistLessonContext = {
  courseUid: string
  module: EditableModule
  lesson: EditableLesson
  persistedModuleUids: Set<string>
  persistedLessonUids: Set<string>
  modifiedModuleUids: Set<string>
}

export type PersistLessonResult = {
  module: EditableModule
  lesson: EditableLesson
  previousLessonId: string
  nextLessonId: string
  createdModuleUid?: string
}

export async function persistLesson({
  courseUid,
  module,
  lesson,
  persistedModuleUids,
  persistedLessonUids,
  modifiedModuleUids,
}: PersistLessonContext): Promise<PersistLessonResult> {
  let moduleUid = module.uid
  if (!moduleUid) {
    throw new Error('Modul lesson belum memiliki uid.')
  }

  const previousLessonId = lesson.uid ?? lesson.id
  let workingModule: EditableModule = { ...module }

  if (!persistedModuleUids.has(moduleUid)) {
    const existingLessons = workingModule.lessons
    const persisted = await createPersistedModule({
      courseUid,
      title: workingModule.title,
      orderIndex: workingModule.order_index,
    })

    moduleUid = persisted.uid!
    workingModule = { ...persisted, lessons: existingLessons }
    persistedModuleUids.add(moduleUid)
    modifiedModuleUids.delete(moduleUid)
  } else if (modifiedModuleUids.has(moduleUid)) {
    await updatePersistedModule({
      moduleUid,
      title: workingModule.title,
      orderIndex: workingModule.order_index,
    })
    modifiedModuleUids.delete(moduleUid)
  }

  const payload = parseLessonPayloadInput(
    editableLessonToPayloadInput(lesson, moduleUid),
    'Data lesson tidak valid',
  )

  let savedLesson = lesson

  if (persistedLessonUids.has(previousLessonId)) {
    const updated = await updateLesson(previousLessonId, payload)
    savedLesson = {
      ...lesson,
      uid: updated.uid,
      id: updated.uid,
    }
  } else {
    const created = await createLesson(payload)
    savedLesson = {
      ...lesson,
      uid: created.uid,
      id: created.uid,
    }
    persistedLessonUids.add(created.uid)
  }

  return {
    module: workingModule,
    lesson: savedLesson,
    previousLessonId,
    nextLessonId: savedLesson.uid ?? savedLesson.id,
    createdModuleUid: workingModule.uid !== module.uid ? workingModule.uid : undefined,
  }
}
