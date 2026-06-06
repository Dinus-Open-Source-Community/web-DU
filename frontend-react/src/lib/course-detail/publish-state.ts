/** Field yang dipakai BE untuk menandai kursus aktif / draf. */
export type CoursePublishFields = {
  is_published?: boolean
  status?: string
}

/**
 * PATCH /courses/:id/status hanya mengubah `status` menjadi ACTIVE (tanpa body).
 * Field `is_published` tidak di-set oleh endpoint tersebut.
 */
export function isCoursePublished(course: CoursePublishFields): boolean {
  const status = (course.status ?? '').trim().toUpperCase()
  return Boolean(course.is_published) || status === 'ACTIVE' || status === 'PUBLISHED'
}
