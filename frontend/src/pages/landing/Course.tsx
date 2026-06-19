import { useMemo } from 'react'

import { LottieOverlay } from '@/components/shared/Loader'
import CourseSection1 from '../../components/courses/course'
import GuestLayout from '../../components/layouts/GuestLayouts'
import { useCombinedCourseCategoriesAndTypes } from '@/hooks/use-course'
import type { ICategoryItem, ICourseItem } from '@/lib/types/course'
import { useAuth } from '@/providers/auth-provider'
import { filterAvailableCourses } from '@/lib/course-catalog/available-courses'

export default function CoursePage() {
  const { isLoading: isAuthLoading, profile } = useAuth()
  const { courses, courseCategories, isLoading } = useCombinedCourseCategoriesAndTypes()
  const availableCourses = useMemo(
    () => filterAvailableCourses(courses?.courses ?? [], profile?.joined_courses),
    [courses?.courses, profile?.joined_courses],
  )

  if (isLoading || isAuthLoading) {
    return <LottieOverlay visible />
  }
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <CourseSection1
          Data={availableCourses as ICourseItem[]}
          Categories={courseCategories?.course_categories as ICategoryItem[]}
        />
      </GuestLayout>
    </main>
  )
}
