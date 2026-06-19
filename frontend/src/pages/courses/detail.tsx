import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { CourseDetailLayout } from '@/components/courses/DetailCourse'
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog'
import GuestLayout from '@/components/layouts/GuestLayouts'
import { LottieOverlay } from '@/components/shared/Loader'
import { Button } from '@/components/ui/button'
import { useCourseDetailWithCategories } from '@/hooks/use-course'
import { filterPublishedCourses } from '@/lib/course-catalog/available-courses'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { ROUTES } from '@/lib/routes'
import { useAuth } from '@/providers/auth-provider'

export default function PublicCourseDetailPage() {
  const { courseUid } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const { courseCategories, courseDetail, popularCourses, isLoading } = useCourseDetailWithCategories(courseUid ?? '')

  const handleEnrollClick = useCallback(() => {
    if (!courseDetail.data) return

    if (!isAuthenticated) {
      navigate(ROUTES.login, {
        state: { from: { pathname: ROUTES.courseDetail(courseDetail.data.uid) } },
      })
      return
    }

    setCheckoutOpen(true)
  }, [courseDetail.data, isAuthenticated, navigate])

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }

  if (!courseDetail.data || !isCoursePublished(courseDetail.data)) {
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
  const publishedPopularCourses = filterPublishedCourses(popularCourses.data?.courses ?? [])

  const enrollButton = (
    <Button
      type="button"
      className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
      onClick={handleEnrollClick}
    >
      Daftar sekarang
    </Button>
  )

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
            sidebarCta: enrollButton,
            PopularCourse: publishedPopularCourses,
          }}
        />

        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          courseUid={course.uid}
        />
      </main>
    </GuestLayout>
  )
}
