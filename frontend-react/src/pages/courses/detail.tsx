import { CourseDetailLayout } from '@/components/courses/DetailCourse'
import { LottieOverlay } from '@/components/shared/Loader'
import { Button } from '@/components/ui/button'
import { useCourseDetailWithCategories } from '@/hooks/use-course'
import { Link, useParams } from 'react-router-dom'

export default function PublicCourseDetailPage() {
  const { courseUid } = useParams()
  const { courseCategories, courseDetail, popularCourses, isLoading } = useCourseDetailWithCategories(courseUid ?? '')

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }

  if (!courseDetail.data) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-5 text-center text-slate-600">Course tidak ditemukan.</div>
      </main>
    )
  }

  const course = courseDetail.data

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
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
          sidebarCta: (
            <Button className="w-full rounded-lg px-4 py-2 text-white">
              <Link to={`/checkout/${course.uid}`}>Daftar Sekarang</Link>
            </Button>
          ),
          PopularCourse: popularCourses.data?.courses ?? [],
        }}
      />
    </main>
  )
}
