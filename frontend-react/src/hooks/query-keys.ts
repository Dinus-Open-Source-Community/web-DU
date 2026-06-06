import type { IQueryParamsPayload } from '@/services/api-path'

export const courseKeys = {
  all: ['courses'] as const,
  list: (params?: IQueryParamsPayload) => ['courses', params] as const,
  detail: (uid: string) => ['courses', uid] as const,
  students: (courseUid: string) => ['course-students', courseUid] as const,
  categories: (params?: IQueryParamsPayload) => ['course-categories', params] as const,
  category: (id: string) => ['course-category', id] as const,
  types: (params?: IQueryParamsPayload) => ['course-types', params] as const,
  edit: (courseUid: string) => ['courses', 'edit', courseUid] as const,
}

export const moduleKeys = {
  all: ['modules'] as const,
  byCourse: (courseUid: string, params?: IQueryParamsPayload) =>
    ['modules', courseUid, params] as const,
}

export const lessonKeys = {
  all: ['lessons'] as const,
  byModule: (moduleUid: string, params?: IQueryParamsPayload) =>
    ['lessons', 'module', moduleUid, params] as const,
  detail: (uid: string) => ['lesson', uid] as const,
  reading: (uid: string) => ['lessons', 'readings', uid] as const,
}

export const paymentKeys = {
  all: ['payment'] as const,
}

export const authKeys = {
  session: ['auth', 'session'] as const,
}
