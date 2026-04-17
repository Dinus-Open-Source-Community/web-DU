import type { IModule, ICourseModulesState, IMentorCourse } from '@/lib/types'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { listCoursesByMentor, getCourseByUid, toMentorCourseView } from '@/lib/data/repository'
import { getActiveUser } from '@/lib/data/dummyUsers'

const STORAGE_KEY = 'mentor_courses_extra'
const PUBLISHED_OVERRIDES_KEY = 'mentor_course_published_overrides'
const SESSION_META_PREFIX = 'mentor_course_meta_'
const SESSION_MODULES_PREFIX = 'mentor_course_modules_v2_'
const COURSE_MODULES_VERSION = 2 as const

function createLessonId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `les_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function createModuleId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `mod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultLesson(order = 1): IModule['lessons'][number] {
  return {
    id: createLessonId(),
    title: `Lesson ${order}`,
    order,
    durationMinutes: 10,
    contentType: 'tiptap',
    contentHtml: '',
  }
}

export function createDefaultModule(order = 1): IModule {
  return {
    id: createModuleId(),
    title: `Modul ${order}`,
    order,
    lessons: [createDefaultLesson(1)],
  }
}

function normalizeModules(modules: IModule[]): IModule[] {
  if (!modules.length) return [createDefaultModule(1)]
  return modules.map((m, i) => ({
    ...m,
    id: m.id || createModuleId(),
    title: m.title?.trim() ? m.title : `Modul ${i + 1}`,
    order: i + 1,
    lessons: m.lessons?.length
      ? m.lessons.map((l, j) => ({ ...l, order: j + 1 }))
      : [createDefaultLesson(1)],
  }))
}

export function getExtraCourses(): IMentorCourse[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as IMentorCourse[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveExtraCourses(courses: IMentorCourse[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

export function upsertExtraCourse(course: IMentorCourse) {
  const list = getExtraCourses()
  const i = list.findIndex((c) => c.uid === course.uid)
  if (i >= 0) list[i] = course
  else list.push(course)
  saveExtraCourses(list)
}

export function getCourseMeetingCount(course: IMentorCourse): number {
  if (course.meetingCount != null && course.meetingCount >= 1) return course.meetingCount
  if (course.moduleCount > 0) return Math.max(1, course.moduleCount)
  return 8
}

export function setSessionCourseMeta(
  uid: string,
  data: Pick<IMentorCourse, 'title' | 'header' | 'image'> & { published?: boolean; meetingCount?: number },
) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`${SESSION_META_PREFIX}${uid}`, JSON.stringify(data))
}

export function getSessionCourseMeta(
  uid: string,
): (Pick<IMentorCourse, 'title' | 'header' | 'image'> & { published?: boolean; meetingCount?: number }) | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${SESSION_META_PREFIX}${uid}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSessionCourseModules(uid: string, state: ICourseModulesState) {
  if (typeof window === 'undefined') return
  const payload: ICourseModulesState = {
    version: COURSE_MODULES_VERSION,
    modules: normalizeModules(state.modules),
  }
  sessionStorage.setItem(`${SESSION_MODULES_PREFIX}${uid}`, JSON.stringify(payload))
}

export function getSessionCourseModules(uid: string): ICourseModulesState {
  const fallback = (): ICourseModulesState => {
    const course = getCourseByUid(uid)
    if (course && course.modules.length > 0) {
      return { version: COURSE_MODULES_VERSION, modules: course.modules }
    }
    return { version: COURSE_MODULES_VERSION, modules: [createDefaultModule(1)] }
  }

  if (typeof window === 'undefined') return fallback()

  const key = `${SESSION_MODULES_PREFIX}${uid}`
  try {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ICourseModulesState>
      if (Array.isArray(parsed.modules) && parsed.modules.length > 0) {
        return { version: COURSE_MODULES_VERSION, modules: normalizeModules(parsed.modules as IModule[]) }
      }
    }
  } catch {
    // fall through to seed from repository
  }

  const seeded = fallback()
  setSessionCourseModules(uid, seeded)
  return seeded
}

export function getPublishedOverrides(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PUBLISHED_OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function setPublishedOverride(uid: string, published: boolean) {
  if (typeof window === 'undefined') return
  const next = { ...getPublishedOverrides(), [uid]: published }
  localStorage.setItem(PUBLISHED_OVERRIDES_KEY, JSON.stringify(next))
}

export function getMergedMentorCourses(): IMentorCourse[] {
  const user = getActiveUser()
  if (typeof window === 'undefined') {
    return isMockDataEnabled() ? listCoursesByMentor(user.id).map(toMentorCourseView) : []
  }
  const extra = getExtraCourses()
  if (!isMockDataEnabled()) return extra
  const overrides = getPublishedOverrides()
  const base = listCoursesByMentor(user.id).map(toMentorCourseView).map((c) => ({
    ...c,
    published: overrides[c.uid] !== undefined ? overrides[c.uid] : c.published,
  }))
  const baseIds = new Set(base.map((c) => c.uid))
  const extrasOnly = extra.filter((e) => !baseIds.has(e.uid))
  return [...base, ...extrasOnly]
}

export function getMentorCourseByUid(uid: string): IMentorCourse | null {
  const merged = getMergedMentorCourses()
  const fromList = merged.find((course) => course.uid === uid)
  if (fromList) return fromList

  const fromSession = getSessionCourseMeta(uid)
  if (!fromSession) return null

  return {
    uid,
    title: fromSession.title,
    header: fromSession.header,
    description: fromSession.header,
    image: fromSession.image,
    published: fromSession.published ?? false,
    moduleCount: 0,
    meetingCount: fromSession.meetingCount ?? 8,
    studentCount: 0,
    rating: 0,
    totalReviews: 0,
    updatedAt: 'Baru',
  }
}

export function setMentorCoursePublished(uid: string, published: boolean) {
  if (typeof window === 'undefined') return
  const extras = getExtraCourses()
  const fromExtra = extras.find((e) => e.uid === uid)
  if (fromExtra) {
    upsertExtraCourse({
      ...fromExtra,
      published,
      moduleCount: published ? Math.max(1, fromExtra.moduleCount) : fromExtra.moduleCount,
      updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    return
  }
  setPublishedOverride(uid, published)
}

export function publishMentorCourse(uid: string) {
  setMentorCoursePublished(uid, true)
}
