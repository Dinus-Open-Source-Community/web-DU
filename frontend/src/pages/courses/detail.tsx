import { Link, useParams } from 'react-router-dom'

import { CourseDetailLayout } from '@/components/courses/DetailCourse'
import GuestLayout from '@/components/layouts/GuestLayouts'
import { LottieOverlay } from '@/components/shared/Loader'
import { Button } from '@/components/ui/button'
import { useCourseDetailWithCategories } from '@/hooks/use-course'
import { ROUTES } from '@/lib/routes'
import { useAuth } from '@/providers/auth-provider'

export default function PublicCourseDetailPage() {
  const { courseUid } = useParams()
  const { isAuthenticated } = useAuth()
  const { courseCategories, courseDetail, popularCourses, isLoading } = useCourseDetailWithCategories(courseUid ?? '')

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }

  if (!courseDetail.data) {
    return (
      <GuestLayout>
        <main className="min-h-[100dvh] bg-[#f5f5f5]">
          <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4 text-center text-slate-600 sm:px-6">
            Kursus tidak ditemukan.
          </div>
        </main>
      </GuestLayout>
    )
  }

  const course = courseDetail.data

  return (
    <GuestLayout>
      <main className="min-h-[100dvh] bg-[#f5f5f5]">
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
            backHref: ROUTES.courses,
            backLabel: 'Kembali ke kursus',
            sidebarCta: (
              <Button asChild className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
                <Link
                  to={isAuthenticated ? ROUTES.checkout(course.uid) : ROUTES.login}
                  state={
                    isAuthenticated
                      ? undefined
                      : { from: { pathname: ROUTES.checkout(course.uid) } }
                  }
                >
                  Daftar sekarang
                </Link>
              </Button>
            ),
            PopularCourse: popularCourses.data?.courses ?? [],
          }}
        />
      </main>
    </GuestLayout>
  )
}
