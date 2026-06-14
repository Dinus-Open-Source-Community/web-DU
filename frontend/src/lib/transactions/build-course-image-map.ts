import type { IUserData } from '@/lib/types/user'

export function buildCourseImageMap(profile: IUserData | null | undefined): Map<string, string> {
  const invoiceCourses = (profile?.enrollment_invoices ?? [])
    .map((invoice) => invoice.course)
    .filter((course): course is NonNullable<typeof course> => Boolean(course?.uid))

  const joinedCourses = (profile?.joined_courses ?? []).filter((course) => Boolean(course?.uid))
  const courses = [...joinedCourses, ...invoiceCourses]

  return new Map(
    courses.map((course) => [course.uid, course.cover_url || course.thumbnail_url || '']),
  )
}
