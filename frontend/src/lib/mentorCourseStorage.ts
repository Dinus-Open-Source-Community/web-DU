import type { ICourseModule, ICourseModulesState, IMentorCourse } from '@/lib/types'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { mentorCoursesDummy } from '@/lib/dummyData'

const STORAGE_KEY = 'mentor_courses_extra'
const PUBLISHED_OVERRIDES_KEY = 'mentor_course_published_overrides'
const SESSION_META_PREFIX = 'mentor_course_meta_'
const SESSION_CONTENT_PREFIX = 'mentor_course_content_'
const SESSION_MODULES_PREFIX = 'mentor_course_modules_v1_'
const COURSE_MODULES_VERSION = 1 as const

function createModuleId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `module_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultModule(order = 1): ICourseModule {
  return {
    id: createModuleId(),
    title: `Modul ${order}`,
    order,
  }
}

function normalizeModules(modules: ICourseModule[]): ICourseModule[] {
  if (!modules.length) return [createDefaultModule(1)]
  return modules.map((module, index) => ({
    id: module.id || createModuleId(),
    title: module.title?.trim() ? module.title : `Modul ${index + 1}`,
    order: index + 1,
  }))
}

function createModulesStateFromLegacy(uid: string): ICourseModulesState {
  const defaultModule = createDefaultModule(1)
  const legacyHtml = getSessionEditorContent(uid) ?? ''
  return {
    version: COURSE_MODULES_VERSION,
    modules: [defaultModule],
    contents: { [defaultModule.id]: legacyHtml },
  }
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

/** Default jumlah pertemuan jika tidak diset pada metadata kursus. */
export function getCourseMeetingCount(course: IMentorCourse): number {
  if (course.meetingCount != null && course.meetingCount >= 1) return course.meetingCount
  if (course.moduleCount > 0) return Math.max(1, course.moduleCount)
  return 8
}

export function setSessionCourseMeta(
  uid: string,
  data: Pick<IMentorCourse, 'title' | 'header' | 'image'> & { published?: boolean; meetingCount?: number }
) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(
    `${SESSION_META_PREFIX}${uid}`,
    JSON.stringify(data)
  )
}

export function getSessionCourseMeta(uid: string): (Pick<
  IMentorCourse,
  'title' | 'header' | 'image'
> & { published?: boolean; meetingCount?: number }) | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${SESSION_META_PREFIX}${uid}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSessionEditorContent(uid: string, html: string) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`${SESSION_CONTENT_PREFIX}${uid}`, html)
}

export function getSessionEditorContent(uid: string): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(`${SESSION_CONTENT_PREFIX}${uid}`)
}

export function setSessionCourseModules(uid: string, state: ICourseModulesState) {
  if (typeof window === 'undefined') return
  const normalizedModules = normalizeModules(state.modules)
  const normalizedContents = normalizedModules.reduce<Record<string, string>>((acc, module) => {
    acc[module.id] = state.contents[module.id] ?? ''
    return acc
  }, {})
  const payload: ICourseModulesState = {
    version: COURSE_MODULES_VERSION,
    modules: normalizedModules,
    contents: normalizedContents,
  }
  sessionStorage.setItem(`${SESSION_MODULES_PREFIX}${uid}`, JSON.stringify(payload))
}

export function getSessionCourseModules(uid: string): ICourseModulesState {
  if (typeof window === 'undefined') {
    const defaultModule = createDefaultModule(1)
    return {
      version: COURSE_MODULES_VERSION,
      modules: [defaultModule],
      contents: { [defaultModule.id]: '' },
    }
  }

  const key = `${SESSION_MODULES_PREFIX}${uid}`
  try {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ICourseModulesState>
      const modules = Array.isArray(parsed.modules) ? normalizeModules(parsed.modules as ICourseModule[]) : [createDefaultModule(1)]
      const contents = modules.reduce<Record<string, string>>((acc, module) => {
        const value = parsed.contents && typeof parsed.contents === 'object' ? parsed.contents[module.id] : ''
        acc[module.id] = typeof value === 'string' ? value : ''
        return acc
      }, {})
      return {
        version: COURSE_MODULES_VERSION,
        modules,
        contents,
      }
    }
  } catch {
    // fallback ke migrasi legacy di bawah
  }

  const migrated = createModulesStateFromLegacy(uid)
  setSessionCourseModules(uid, migrated)
  return migrated
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

/** Gabungan fixture (jika mock aktif) + kursus dari penyimpanan lokal + override publish */
export function getMergedMentorCourses(): IMentorCourse[] {
  if (typeof window === 'undefined') {
    return isMockDataEnabled() ? mentorCoursesDummy : []
  }
  const extra = getExtraCourses()
  if (!isMockDataEnabled()) {
    return extra
  }
  const overrides = getPublishedOverrides()
  const dummyIds = new Set(mentorCoursesDummy.map((c) => c.uid))
  const base = mentorCoursesDummy.map((c) => ({
    ...c,
    published: overrides[c.uid] !== undefined ? overrides[c.uid] : c.published,
  }))
  const extrasOnly = extra.filter((e) => !dummyIds.has(e.uid))
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

/** Ubah status terbit/draf (fixture → override; kursus buatan → upsert extra). */
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

/** Tandai kursus sebagai dipublikasikan (dummy → override; buatan user → upsert extra). */
export function publishMentorCourse(uid: string) {
  setMentorCoursePublished(uid, true)
}
