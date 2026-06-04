import { LottieOverlay } from '@/components/shared/Loader'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import Section from '@/components/student/BrowseCourseSection'
import type { ICategoryItem, ICourseItem } from '@/lib/types/course'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'
import { useCombinedCourseCategoriesAndTypes } from '@/services/course'

const BrowseCourse = () => {
  const { user } = useAuth()
  const { isLoading, courses, courseCategories } = useCombinedCourseCategoriesAndTypes()

  if (isLoading) {
    return <LottieOverlay visible={isLoading} message="Loading courses..." />
  }
  return (
    <AppSidebarProvider role="student" user={user as IUserData}>
      <Section dataCategories={courseCategories?.course_categories as ICategoryItem[]} dataCourses={courses?.courses as ICourseItem[]} />
    </AppSidebarProvider>
  )
}

export default BrowseCourse
