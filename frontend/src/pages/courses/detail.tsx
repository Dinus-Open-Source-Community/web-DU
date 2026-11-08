import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { CourseDetailLayout } from '@/components/courses/DetailCourse'
import GuestLayout from '@/components/layouts/GuestLayouts'
import { Button } from '@/components/ui/button'
import { StickerStar, StickerSparkle } from '@/components/playful/Stickers'
import { useCourseDetailWithCategories } from '@/hooks/use-course'
import { filterPublishedCourses } from '@/lib/course-catalog/available-courses'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { Message } from '@/lib/Message'
import { ROUTES } from '@/lib/routes'
import { useAuth } from '@/providers/auth-provider'

export default function PublicCourseDetailPage() {
  const { courseUid } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, profile } = useAuth()
  const { courseCategories, courseDetail, popularCourses, isLoading } = useCourseDetailWithCategories(courseUid ?? '')

  const isEnrolled = Boolean(
    courseDetail.data &&
      profile?.joined_courses?.some(
        (c) =>
          c.uid === courseDetail.data?.uid &&
          (c.enrollment_status === 'active' || c.enrollment_status === 'completed'),
      ),
  )
  const isCourseFull = Boolean(
    courseDetail.data?.slot &&
      courseDetail.data.slot > 0 &&
      (courseDetail.data.enrolled_count ?? 0) >= courseDetail.data.slot,
  )

  const handleEnrollClick = useCallback(() => {
    if (!courseDetail.data) return

    if (!isAuthenticated) {
      navigate(ROUTES.register, {
        state: { from: { pathname: ROUTES.student.redeem } },
      })
      return
    }

    if (isEnrolled) {
      navigate(ROUTES.student.learningCourse(courseDetail.data.uid))
      return
    }

    if (profile?.role && profile.role !== 'student') {
      toast.error('Gunakan akun siswa untuk menukarkan kode redeem.')
      return
    }

    navigate(ROUTES.student.redeem)
  }, [courseDetail.data, isAuthenticated, isCourseFull, isEnrolled, navigate, profile?.role])

  if (isLoading) {
    return (
      <GuestLayout navbarAuthVariant="home" marketingSurface>
        <main className="w-full">
          <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />
          </section>
        </main>
      </GuestLayout>
    )
  }

  if (!courseDetail.data || !isCoursePublished(courseDetail.data)) {
    return (
      <GuestLayout navbarAuthVariant="home" marketingSurface>
        <main className="w-full">
          <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="relative z-1 mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4 pt-24 text-center font-bold text-ink-600 sm:px-6">
              {Message.course.notFound}
            </div>
          </section>
        </main>
      </GuestLayout>
    )
  }

  const course = courseDetail.data
  const publishedPopularCourses = filterPublishedCourses(popularCourses.data?.courses ?? [])
    .filter((popularCourse) => popularCourse.uid !== course.uid)

  const enrollButton = (
    <Button
      type="button"
      className="h-12 w-full rounded-xl border-2 border-ink-900 bg-brand-blue hover:bg-brand-hover text-white font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer"
      disabled={isCourseFull && !isEnrolled}
      onClick={handleEnrollClick}
    >
      {isEnrolled ? 'Lanjut Belajar' : isCourseFull ? 'Kuota Penuh' : 'Daftar sekarang'}
    </Button>
  )

  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
          {/* Garis batas atas kertas */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />

          {/* Pola titik dot grid khas materi pembelajaran */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* Dekorasi stiker playful */}
          <StickerStar className="pointer-events-none absolute right-[5%] top-24 hidden size-10 rotate-12 opacity-80 md:block" />
          <StickerSparkle className="pointer-events-none absolute left-[4%] top-36 hidden size-8 -rotate-12 opacity-70 md:block" />

          <CourseDetailLayout
            data={{
              ...course,
              title: course.title ?? '',
              description: course.description ?? '',
              category: courseCategories.data ?? course.category,
              course_type: course.course_type,
              rating: course.rating ?? 0,
              cover_url: course.cover_url ?? '',
              what_you_learn: course.what_you_learn ?? [],
              mentors: course.mentors ?? [],
              modules: course.modules ?? [],
              slot: course.slot ?? 0,
              totalReviews: course.total_reviews ?? 0,
              backHref: ROUTES.courses,
              backLabel: 'Kembali ke katalog',
              sidebarCta: enrollButton,
              PopularCourse: publishedPopularCourses,
              isEnrolled,
            }}
          />
        </section>
      </main>
    </GuestLayout>
  )
}
