import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type { ICourseItem } from '@/lib/types/course'

export const FEATURED_COURSE_LIMIT = 3

export function pickTopRatedCourses(
  courses: ICourseItem[],
  limit = FEATURED_COURSE_LIMIT,
): ICourseItem[] {
  return [...courses]
    .filter((course) => isCoursePublished(course))
    .sort((left, right) => {
      const ratingDiff = (right.rating ?? 0) - (left.rating ?? 0)
      if (ratingDiff !== 0) return ratingDiff

      const leftCreatedAt = left.created_at ? Date.parse(left.created_at) : 0
      const rightCreatedAt = right.created_at ? Date.parse(right.created_at) : 0
      return rightCreatedAt - leftCreatedAt
    })
    .slice(0, limit)
}
