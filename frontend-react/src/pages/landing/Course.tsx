import { LottieOverlay } from '@/components/shared/Loader'
import CourseSection1 from '../../components/courses/course'
import GuestLayout from '../../components/layouts/GuestLayouts'
import { useCombinedCourseCategoriesAndTypes } from '@/services/course'
import type { ICategoryItem, ICourseItem } from '@/lib/types/course'

export default function CoursePage() {
  const { courses, courseCategories, isLoading } = useCombinedCourseCategoriesAndTypes()

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <CourseSection1 Data={courses?.courses as ICourseItem[]} Categories={courseCategories?.course_categories as ICategoryItem[]} />
      </GuestLayout>
    </main>
  )
}
