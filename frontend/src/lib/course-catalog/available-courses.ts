import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type { ICourseItem } from '@/lib/types/course'
import type { IJoinedCourse } from '@/lib/types/user'

const OWNED_ENROLLMENT_STATUSES = new Set(['active', 'completed'])

export function filterPublishedCourses(courses: ICourseItem[]): ICourseItem[] {
  return courses.filter((course) => isCoursePublished(course))
}

export function filterAvailableCourses(
  courses: ICourseItem[],
  joinedCourses: IJoinedCourse[] = [],
) {
  const ownedCourseUids = new Set(
    joinedCourses
      .filter((course) => OWNED_ENROLLMENT_STATUSES.has(course.enrollment_status))
      .map((course) => course.uid),
  )

  return filterPublishedCourses(courses).filter(
    (course) => !ownedCourseUids.has(course.uid),
  )
}
