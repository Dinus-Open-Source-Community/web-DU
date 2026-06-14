import { useMemo } from 'react'

import { LottieOverlay } from '@/components/shared/Loader'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import Section from '@/components/student/BrowseCourseSection'
import type { ICategoryItem, ICourseItem } from '@/lib/types/course'
import { useCombinedCourseCategoriesAndTypes } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'
import { filterAvailableCourses } from '@/lib/course-catalog/available-courses'

const BrowseCourse = () => {
  const sidebarUser = useSidebarUser('student')
  const { profile, isLoading: isAuthLoading } = useAuth()
  const { isLoading, courses, courseCategories } = useCombinedCourseCategoriesAndTypes()
  const availableCourses = useMemo(
    () => filterAvailableCourses(courses?.courses ?? [], profile?.joined_courses),
    [courses?.courses, profile?.joined_courses],
  )

  if (isLoading || isAuthLoading) {
    return <LottieOverlay visible message="Loading courses..." />
  }
  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <Section
        dataCategories={courseCategories?.course_categories as ICategoryItem[]}
        dataCourses={availableCourses as ICourseItem[]}
      />
    </AppSidebarProvider>
  )
}

export default BrowseCourse
