import type { IModule, ICourseModulesState, IMentorCourse, CourseCategory, CourseLevel, CourseClassType } from '@/lib/types'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { listCourses, listCoursesByMentor, getCourseByUid, toMentorCourseView } from '@/lib/data/repository'
import { getActiveUser } from '@/lib/data/dummyUsers'

const STORAGE_KEY = 'mentor_courses_extra'
const PUBLISHED_OVERRIDES_KEY = 'mentor_course_published_overrides'
const DELETED_COURSES_KEY = 'mentor_course_deleted_ids'
const SESSION_META_PREFIX = 'mentor_course_meta_'
const SESSION_MODULES_PREFIX = 'mentor_course_modules_v2_'
const COURSE_MODULES_VERSION = 2 as const
type CourseScope = 'mentor' | 'all'

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
    hasHomework: false,
    homeworkType: 'text',
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: { questions: [], passingScore: 70 },
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
      ? m.lessons.map((l, j) => ({
          ...l,
          order: j + 1,
          hasHomework: l.hasHomework ?? false,
          homeworkType: l.homeworkType ?? 'text',
          homeworkDescriptionHtml: l.homeworkDescriptionHtml ?? '<p></p>',
          homeworkQuiz: l.homeworkQuiz ?? { questions: [], passingScore: 70 },
        }))
      : [createDefaultLesson(1)],
  }))
}

function getBaseCourses(scope: CourseScope): IMentorCourse[] {
  if (scope === 'all') {
    return listCourses().map(toMentorCourseView)
  }
  const user = getActiveUser()
  return listCoursesByMentor(user.id).map(toMentorCourseView)
}

function getDeletedCourseIdsSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(DELETED_COURSES_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function saveDeletedCourseIdsSet(ids: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DELETED_COURSES_KEY, JSON.stringify(Array.from(ids)))
}

function isCourseDeleted(uid: string): boolean {
  return getDeletedCourseIdsSet().has(uid)
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

type SessionCourseMeta = Pick<IMentorCourse, 'title' | 'header' | 'image'> & {
  description?: string
  published?: boolean
  meetingCount?: number
  category?: CourseCategory
  level?: CourseLevel
  classType?: CourseClassType
  price?: number
  strikePrice?: number
  whatYouLearn?: string[]
}

export function setSessionCourseMeta(uid: string, data: SessionCourseMeta) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`${SESSION_META_PREFIX}${uid}`, JSON.stringify(data))
}

export function getSessionCourseMeta(uid: string): SessionCourseMeta | null {
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
    const course = isCourseDeleted(uid) ? undefined : getCourseByUid(uid)
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

export function getMergedManagedCourses(scope: CourseScope = 'mentor'): IMentorCourse[] {
  if (typeof window === 'undefined') {
    return isMockDataEnabled() ? getBaseCourses(scope) : []
  }

  const extra = getExtraCourses()
  const deletedIds = getDeletedCourseIdsSet()

  if (!isMockDataEnabled()) {
    return extra.filter((course) => !deletedIds.has(course.uid))
  }

  const overrides = getPublishedOverrides()
  const base = getBaseCourses(scope)
    .map((c) => ({
      ...c,
      published: overrides[c.uid] !== undefined ? overrides[c.uid] : c.published,
    }))
    .filter((course) => !deletedIds.has(course.uid))

  const baseIds = new Set(base.map((c) => c.uid))
  const extrasOnly = extra.filter((e) => !baseIds.has(e.uid) && !deletedIds.has(e.uid))
  return [...base, ...extrasOnly]
}

export function getMergedMentorCourses(): IMentorCourse[] {
  return getMergedManagedCourses('mentor')
}

export function getManagedCourseByUid(uid: string, scope: CourseScope = 'mentor'): IMentorCourse | null {
  if (isCourseDeleted(uid)) return null

  const merged = getMergedManagedCourses(scope)
  const fromList = merged.find((course) => course.uid === uid)
  if (fromList) return fromList

  const fromSession = getSessionCourseMeta(uid)
  if (!fromSession) return null

  return {
    uid,
    title: fromSession.title,
    header: fromSession.header,
    description: fromSession.description ?? fromSession.header,
    image: fromSession.image,
    published: fromSession.published ?? false,
    moduleCount: 0,
    meetingCount: fromSession.meetingCount ?? 8,
    studentCount: 0,
    rating: 0,
    totalReviews: 0,
    updatedAt: 'Baru',
    category: fromSession.category,
    level: fromSession.level,
    classType: fromSession.classType,
    price: fromSession.price,
    strikePrice: fromSession.strikePrice,
    whatYouLearn: fromSession.whatYouLearn,
  }
}

export function getMentorCourseByUid(uid: string): IMentorCourse | null {
  return getManagedCourseByUid(uid, 'mentor')
}

export function setManagedCoursePublished(uid: string, published: boolean) {
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

export function setMentorCoursePublished(uid: string, published: boolean) {
  setManagedCoursePublished(uid, published)
}

export function publishMentorCourse(uid: string) {
  setMentorCoursePublished(uid, true)
}

export function deleteManagedCourse(uid: string) {
  if (typeof window === 'undefined') return

  const remainingExtraCourses = getExtraCourses().filter((course) => course.uid !== uid)
  saveExtraCourses(remainingExtraCourses)

  const deletedIds = getDeletedCourseIdsSet()
  deletedIds.add(uid)
  saveDeletedCourseIdsSet(deletedIds)

  const overrides = getPublishedOverrides()
  if (Object.prototype.hasOwnProperty.call(overrides, uid)) {
    delete overrides[uid]
    localStorage.setItem(PUBLISHED_OVERRIDES_KEY, JSON.stringify(overrides))
  }

  sessionStorage.removeItem(`${SESSION_META_PREFIX}${uid}`)
  sessionStorage.removeItem(`${SESSION_MODULES_PREFIX}${uid}`)
}
