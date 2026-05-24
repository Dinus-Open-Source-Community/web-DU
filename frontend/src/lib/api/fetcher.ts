/**
 * Pengganti HTTP client — tidak ada `fetch()` ke backend.
 * Untuk path katalog/mater, data diisi dari `lib/data/repository` agar selaras dengan dummy seed.
 */
import { getCourseByUid, listCourses, listMentors } from '@/lib/data/repository'
import { getAuthUser } from '@/lib/auth/session'
import type { ICardData } from '@/lib/types'
import type { ILesson, IModule } from '@/lib/types/course'

export type Envelope<T = unknown> = {
  success: boolean
  message: string
  data: T
  error: unknown
}

export type PaginatedEnvelope<K extends string, T> = Envelope<
  { meta: PaginationMeta } & Record<K, T[]>
>

export type PaginationMeta = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type PaginationParams = {
  page?: number
  per_page?: number
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function emptyMeta(): PaginationMeta {
  return { page: 1, per_page: 20, total: 0, total_pages: 0 }
}

function env<T>(data: T): Envelope<T> {
  return {
    success: true,
    message: 'dummy',
    data,
    error: null,
  }
}

function sessionUserPayload() {
  const u = getAuthUser()
  return {
    uid: u?.uid ?? 'dummy-user',
    name: u?.nama ?? 'Pengguna',
    email: u?.email ?? 'user@dummy.local',
    avatar_url: u?.avatar ?? '',
    role: u?.role ?? 'admin',
    is_verified: true,
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    joined_courses: [],
    course_reviews: [],
    review_summary: {},
    enrollment_summary: {},
    mentored_courses: [],
    transaction_history: [],
  }
}

function wireCourseCatalogRow(c: ICardData): Record<string, unknown> {
  return {
    uid: c.uid,
    title: c.title,
    subtitle: c.subtitle ?? null,
    description: c.description,
    what_you_learn: c.whatYouLearn ?? [],
    is_premium: c.variantBadge === 'premium',
    is_published: c.status === 'published',
    category: c.category,
    mentors: [{ uid: c.mentorUid, name: c.author.name, avatar_url: c.author.avatar }],
    rating: c.rating,
    total_reviews: c.totalReviews,
    cover_url: c.image,
    thumbnail_url: c.image,
    price: c.price,
    price_strike: c.strikePrice,
    enrolled_count: c.enrolled,
    duration: c.duration,
    status: c.status,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }
}

/** Modul seperti respons API penyuntingan kursus (tanpa menyematkan lesson penuh). */
function wireModuleApi(courseUid: string, mod: IModule, course: Pick<ICardData, 'createdAt' | 'updatedAt'>): Record<string, unknown> {
  return {
    uid: mod.id,
    id: mod.id,
    course_uid: courseUid,
    title: mod.title,
    order_index: mod.order,
    lessons_count: mod.lessons.length,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
  }
}

/** Lesson seperti respons API penyuntingan materi */
function wireLessonApi(moduleUid: string, lesson: ILesson, course: Pick<ICardData, 'createdAt' | 'updatedAt'>): Record<string, unknown> {
  const base: Record<string, unknown> = {
    uid: lesson.id,
    id: lesson.id,
    module_uid: moduleUid,
    title: lesson.title,
    order_index: lesson.order,
    duration_minutes: lesson.durationMinutes,
    has_homework: lesson.hasHomework ?? false,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
  }

  if (lesson.contentType === 'video') {
    return {
      ...base,
      content_type: 'video',
      video_url: lesson.videoUrl,
      content: lesson.contentHtml ?? '',
    }
  }
  if (lesson.contentType === 'quiz') {
    return {
      ...base,
      content_type: 'quiz',
      content: { quiz: lesson.quiz },
    }
  }
  return {
    ...base,
    content_type: 'text',
    content: lesson.contentHtml ?? '',
  }
}

function findModuleContext(moduleUid: string): { course: ICardData; module: IModule } | null {
  for (const c of listCourses()) {
    const mod = c.modules.find((m) => m.id === moduleUid)
    if (mod) return { course: c, module: mod }
  }
  return null
}

function findLessonContext(lessonId: string): { course: ICardData; module: IModule; lesson: ILesson } | null {
  for (const c of listCourses()) {
    for (const m of c.modules) {
      const lesson = m.lessons.find((l) => l.id === lessonId)
      if (lesson) return { course: c, module: m, lesson }
    }
  }
  return null
}

function pickPaging(params?: Record<string, string | number | boolean | undefined>): { page: number; perPage: number } {
  const page = Math.max(1, Number(params?.page ?? 1) || 1)
  const perPage = Math.min(500, Math.max(1, Number(params?.per_page ?? 50) || 50))
  return { page, perPage }
}

function collectLessonRows(filters: { moduleUid?: string; name?: string }): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []
  for (const c of listCourses()) {
    for (const m of c.modules) {
      if (filters.moduleUid && m.id !== filters.moduleUid) continue
      for (const lesson of m.lessons) {
        if (filters.name && !lesson.title.toLowerCase().includes(filters.name.toLowerCase())) continue
        rows.push(wireLessonApi(m.id, lesson, c))
      }
    }
  }
  return rows
}

/** Isi GET /dummy sesuai path (relative ke API router hooks). */
function dummyGetEnvelope(path: string, params?: Record<string, string | number | boolean | undefined>): unknown {
  const p = path.startsWith('/') ? path : `/${path}`
  const parts = p.split('/').filter(Boolean)

  if (parts[0] === 'user' && parts[1] === 'data') {
    return env(sessionUserPayload())
  }

  if (parts[0] === 'user' && parts[1] === 'manage' && parts[2] === 'all') {
    return env({
      users: [] as Record<string, unknown>[],
      meta: emptyMeta(),
    })
  }

  if (parts[0] === 'user' && parts.length === 2) {
    const uid = parts[1]
    return env({ ...sessionUserPayload(), uid })
  }

  if (parts[0] === 'mentor' && parts[1] === 'all') {
    const mentors = listMentors().map((m) => ({
      uid: m.uid,
      name: m.name,
      email: m.email,
      avatar_url: m.avatar,
      description: m.bio ?? '',
      is_verified: true,
      total_courses: m.totalCourses,
      total_students: m.studentsCount,
      created_at: m.joinedAt,
    }))
    const n = mentors.length
    return env({
      mentors,
      meta: { page: 1, per_page: Math.max(n, 1), total: n, total_pages: 1 },
    })
  }

  if (parts[0] === 'mentor' && parts.length === 2) {
    const uid = parts[1]
    const m = listMentors().find((x) => x.uid === uid)
    if (m) {
      return env({
        uid: m.uid,
        name: m.name,
        email: m.email,
        avatar_url: m.avatar,
        role: 'mentor',
        description: m.bio ?? '',
        assignments: [],
        review_summary: {},
        course_reviews: [],
      })
    }
    return env({
      uid,
      name: 'Mentor Dummy',
      email: `mentor-${uid}@dummy.local`,
      avatar_url: '',
      role: 'mentor_role',
      description: '',
      assignments: [],
      review_summary: {},
      course_reviews: [],
    })
  }

  if (parts[0] === 'courses' && parts.length === 1) {
    let courses = listCourses()
    const mentorId = params?.mentor_id !== undefined ? String(params.mentor_id) : ''
    const titleFilter = params?.title !== undefined ? String(params.title) : ''
    if (mentorId) courses = courses.filter((x) => x.mentorUid === mentorId)
    if (titleFilter) courses = courses.filter((x) => x.title.toLowerCase().includes(titleFilter.toLowerCase()))
    const rows = courses.map(wireCourseCatalogRow)
    const n = rows.length
    return env({
      courses: rows,
      meta: { page: 1, per_page: Math.max(n, 1), total: n, total_pages: 1 },
    })
  }

  if (parts[0] === 'courses' && parts.length === 3 && parts[2] === 'students') {
    return env({
      enrollments: [],
      meta: emptyMeta(),
    })
  }

  if (parts[0] === 'courses' && parts.length === 2) {
    const c = getCourseByUid(parts[1])
    if (!c) return env({ uid: parts[1] } as Record<string, unknown>)
    const modules = c.modules.map((m) => wireModuleApi(c.uid, m, c))
    return env({
      ...wireCourseCatalogRow(c),
      modules,
    } as Record<string, unknown>)
  }

  if (parts[0] === 'modules' && parts[1] === 'course' && parts[2]) {
    const c = getCourseByUid(parts[2])
    if (!c) {
      return env({
        modules: [] as Record<string, unknown>[],
        meta: { page: 1, per_page: 0, total: 0, total_pages: 1 },
      })
    }
    const modules = c.modules.map((m) => wireModuleApi(c.uid, m, c))
    const n = modules.length
    return env({
      modules,
      meta: { page: 1, per_page: Math.max(n, 1), total: n, total_pages: 1 },
    })
  }

  if (parts[0] === 'modules' && parts.length === 2) {
    const ctx = findModuleContext(parts[1])
    if (!ctx) return env({ uid: parts[1] } as Record<string, unknown>)
    return env(wireModuleApi(ctx.course.uid, ctx.module, ctx.course))
  }

  if (parts[0] === 'lessons' && parts.length === 1) {
    const { page, perPage } = pickPaging(params)
    const moduleUidRaw = params?.module_uid ?? params?.module_id
    const moduleUid = moduleUidRaw !== undefined && String(moduleUidRaw).length > 0 ? String(moduleUidRaw) : undefined
    const nameRaw = params?.name
    const name = nameRaw !== undefined && String(nameRaw).length > 0 ? String(nameRaw) : undefined
    const allRows = collectLessonRows({ moduleUid, name })
    const total = allRows.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const start = (page - 1) * perPage
    const lessons = allRows.slice(start, start + perPage)
    return env({
      lessons,
      meta: { page, per_page: perPage, total, total_pages: totalPages },
    })
  }

  if (parts[0] === 'lessons' && parts[1] === 'attendances' && parts[2] === 'check-status') {
    return env({})
  }

  if (parts[0] === 'lessons' && parts[1] === 'attendances' && parts[2] === 'my-history') {
    return env([])
  }

  if (parts[0] === 'lessons' && parts[1] === 'attendances' && parts[2] === 'lesson' && parts[3]) {
    return env([])
  }

  if (parts[0] === 'lessons' && parts[1] === 'attendances' && parts.length === 3) {
    return env({})
  }

  if (parts[0] === 'lessons' && parts.length === 3 && parts[2] === 'assignment') {
    return env({ uid: `${parts[1]}-assignment` } as Record<string, unknown>)
  }

  if (parts[0] === 'lessons' && parts.length === 2) {
    const ctx = findLessonContext(parts[1])
    if (!ctx) return env({ uid: parts[1] } as Record<string, unknown>)
    return env(wireLessonApi(ctx.module.id, ctx.lesson, ctx.course))
  }

  if (parts[0] === 'course-categories' && parts.length === 1) {
    return env({
      course_categories: [],
      meta: emptyMeta(),
    })
  }

  if (parts[0] === 'course-categories' && parts.length === 2) {
    return env({
      uid: parts[1],
      name: 'Kategori',
      description: '',
      is_active: true,
      courses: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  if (parts[0] === 'course-types' && parts.length === 1) {
    return env({
      course_types: [],
      meta: emptyMeta(),
    })
  }

  if (parts[0] === 'course-types' && parts.length === 2) {
    return env({
      uid: parts[1],
      name: 'Tipe',
      description: '',
      is_active: true,
      courses: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  if (parts[0] === 'payment' && parts.length === 1) {
    return env({ reference: 'dummy', status: 'dummy' } as Record<string, unknown>)
  }

  if (parts[0] === 'invoices' && parts[1] === 'url') {
    return env({
      enrollment_uid: 'dummy',
      user_uid: 'dummy',
      course_uid: 'dummy',
      filename: 'dummy.pdf',
      invoice_url: '#',
      enrolled_at: new Date().toISOString(),
    })
  }

  if (parts[0] === 'invoices' && parts.length === 2) {
    return env({
      enrollment_uid: parts[1],
      user_uid: 'dummy',
      course_uid: 'dummy',
      filename: 'dummy.pdf',
      invoice_url: '#',
      enrolled_at: new Date().toISOString(),
    })
  }

  return env(null)
}

export async function get<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  await Promise.resolve()
  return dummyGetEnvelope(path, params) as T
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  void path
  void body
  await Promise.resolve()
  return env(null) as unknown as T
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  void path
  void body
  await Promise.resolve()
  return env(null) as unknown as T
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  void path
  void body
  await Promise.resolve()
  return env({}) as unknown as T
}

export async function del<T>(path: string): Promise<T> {
  void path
  await Promise.resolve()
  return env(null) as unknown as T
}

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  void path
  void formData
  await Promise.resolve()
  return env({ avatar_url: '' }) as unknown as T
}
