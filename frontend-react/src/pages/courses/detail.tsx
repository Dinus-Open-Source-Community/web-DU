import { CourseDetailLayout } from '@/components/courses/DetailCourse'
import GuestLayout from '@/components/layouts/GuestLayouts'
import { LottieOverlay } from '@/components/shared/Loader'
import { useGetCourseDetailWithCategories } from '@/services/course'
import { useParams } from 'react-router-dom'

export default function PublicCourseDetailPage() {
  const { courseUid } = useParams()
  const { courseCategories, courseDetail, popularCourses, isLoading } = useGetCourseDetailWithCategories(courseUid ?? '')

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }

  if (!courseDetail.data) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <GuestLayout>
          <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-5 text-center text-slate-600">Course tidak ditemukan.</div>
        </GuestLayout>
      </main>
    )
  }

  const course = courseDetail.data

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <CourseDetailLayout
          data={{
            ...course,
            title: course.title ?? '',
            description: course.description ?? '',
            category: courseCategories.data ?? course.category,
            rating: course.rating ?? 0,
            price: course.price ?? 0,
            price_strike: course.price_strike ?? 0,
            cover_url: course.cover_url ?? '',
            what_you_learn: course.what_you_learn ?? [],
            mentors: course.mentors ?? [],
            totalReviews: course.total_reviews ?? 0,
            // feedbackBreakdown: courseDetail.data?.feedback_breakdown ?? [],
            // syllabus: courseDetail.data?.syllabus ?? [],
            sidebarCta: <button className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Daftar Sekarang</button>,
            PopularCourse: popularCourses.data?.courses ?? [],
          }}
        />
      </GuestLayout>
    </main>
  )
}
