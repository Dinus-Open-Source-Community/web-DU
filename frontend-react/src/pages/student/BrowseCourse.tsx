import { LottieOverlay } from '@/components/shared/Loader'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import Section from '@/components/student/BrowseCourseSection'
import type { ICategoryItem, ICourseItem } from '@/lib/types/course'
import { useCombinedCourseCategoriesAndTypes } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

const BrowseCourse = () => {
  const sidebarUser = useSidebarUser('student')
  const { isLoading, courses, courseCategories } = useCombinedCourseCategoriesAndTypes()

  if (isLoading) {
    return <LottieOverlay visible={isLoading} message="Loading courses..." />
  }
  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <Section dataCategories={courseCategories?.course_categories as ICategoryItem[]} dataCourses={courses?.courses as ICourseItem[]} />
    </AppSidebarProvider>
  )
}

export default BrowseCourse
