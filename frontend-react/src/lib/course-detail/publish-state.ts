/** Field yang dipakai BE untuk menandai kursus aktif / draf. */
export type CoursePublishFields = {
  is_published?: boolean
  status?: string
}

const INACTIVE_STATUSES = new Set(['TIDAK ACTIVE', 'DRAFT'])

/**
 * Selaras BE:
 * - `PATCH /courses/:id/status` → `status=ACTIVE` + `is_published=true`
 * - `DELETE /courses/:id` → `status=TIDAK ACTIVE` + `is_published=false`
 * - `PUT /courses/:id` tidak mengubah status / is_published
 */
export function isCoursePublished(course: CoursePublishFields): boolean {
  const status = (course.status ?? '').trim().toUpperCase()
  if (INACTIVE_STATUSES.has(status)) return false
  return Boolean(course.is_published) || status === 'ACTIVE'
}
