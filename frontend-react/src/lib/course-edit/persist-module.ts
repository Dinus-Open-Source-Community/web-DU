import { createFallbackLesson } from '@/lib/course-edit/mappers'
import type { EditableModule } from '@/lib/course-edit/types'
import type { ICourseDetailModule } from '@/lib/types/module'
import { createModule, deleteModule, updateModule } from '@/services/module'

export function normalizeModuleTitle(title: string, fallback: string): string {
  const trimmed = title.trim()
  return trimmed || fallback
}

export function assertPersistableModuleTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) {
    throw new Error('Judul modul wajib diisi.')
  }
  return trimmed
}

export function toEditableModuleFromApi(
  apiModule: ICourseDetailModule,
  orderIndex: number,
): EditableModule {
  if (!apiModule.uid) {
    throw new Error('Backend tidak mengembalikan uid untuk modul baru.')
  }

  return {
    uid: apiModule.uid,
    course_uid: apiModule.course_uid ?? '',
    title: apiModule.title,
    order_index: Number(apiModule.order_index ?? orderIndex) || orderIndex,
    created_at: apiModule.created_at ?? new Date().toISOString(),
    updated_at: apiModule.updated_at,
    lessons: [createFallbackLesson(1)],
  }
}

export type CreatePersistedModuleInput = {
  courseUid: string
  title: string
  orderIndex: number
}

export async function createPersistedModule(
  input: CreatePersistedModuleInput,
): Promise<EditableModule> {
  const title = assertPersistableModuleTitle(
    normalizeModuleTitle(input.title, `Modul ${input.orderIndex}`),
  )

  const created = await createModule({
    course_uid: input.courseUid,
    title,
    order_index: input.orderIndex,
  })

  return toEditableModuleFromApi(created, input.orderIndex)
}

export type UpdatePersistedModuleInput = {
  moduleUid: string
  title: string
  orderIndex: number
}

export async function updatePersistedModule(
  input: UpdatePersistedModuleInput,
): Promise<ICourseDetailModule> {
  const title = assertPersistableModuleTitle(input.title)

  return updateModule(input.moduleUid, {
    title,
    order_index: input.orderIndex,
  })
}

export async function deletePersistedModule(moduleUid: string): Promise<void> {
  if (!moduleUid.trim()) {
    throw new Error('UID modul tidak valid.')
  }

  await deleteModule(moduleUid)
}

export function isOnlyUnpersistedFallbackModule(
  modules: EditableModule[],
  persistedModuleUids: Set<string>,
): boolean {
  if (modules.length !== 1) return false

  const [module] = modules
  if (!module.uid) return false

  return !persistedModuleUids.has(module.uid)
}
