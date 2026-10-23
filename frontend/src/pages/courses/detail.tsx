import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { CourseDetailLayout } from '@/components/courses/DetailCourse'
import GuestLayout from '@/components/layouts/GuestLayouts'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { Button } from '@/components/ui/button'
import { authKeys, courseKeys } from '@/hooks/query-keys'
import { useCourseDetailWithCategories } from '@/hooks/use-course'
import { filterPublishedCourses } from '@/lib/course-catalog/available-courses'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { Message, resolveApiActionError } from '@/lib/Message'
import { ROUTES } from '@/lib/routes'
import { useAuth } from '@/providers/auth-provider'
import { joinCourse } from '@/services/course'

export default function PublicCourseDetailPage() {
  const { courseUid } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const { courseCategories, courseDetail, popularCourses, isLoading } = useCourseDetailWithCategories(courseUid ?? '')

  const joinMutation = useMutation({
    mutationFn: (uid: string) => joinCourse(uid),
    onSuccess: async (_data, uid) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(uid) }),
        queryClient.invalidateQueries({ queryKey: authKeys.session }),
      ])
      toast.success('Berhasil mendaftar kursus.')
      navigate(ROUTES.student.learningCourse(uid))
    },
    onError: (error) => {
      toast.error(resolveApiActionError(error, 'Gagal mendaftar kursus. Silakan coba lagi.'))
    },
  })

  const handleEnrollClick = useCallback(() => {
    if (!courseDetail.data) return

    if (!isAuthenticated) {
      navigate(ROUTES.login, {
        state: { from: { pathname: ROUTES.courseDetail(courseDetail.data.uid) } },
      })
      return
    }

    joinMutation.mutate(courseDetail.data.uid)
  }, [courseDetail.data, isAuthenticated, joinMutation, navigate])

  if (isLoading) {
    return <PageSkeleton message="Memuat course..." />
  }

  if (!courseDetail.data || !isCoursePublished(courseDetail.data)) {
    return (
      <GuestLayout>
        <main className="min-h-[100dvh] bg-[#f5f5f5]">
          <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4 text-center text-ink-600 sm:px-6">
            {Message.course.notFound}
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
      className="w-full rounded-sm px-4 py-2.5 text-sm font-semibold text-white"
      disabled={joinMutation.isPending}
      onClick={handleEnrollClick}
    >
      {joinMutation.isPending ? 'Mendaftarkan...' : 'Daftar sekarang'}
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
      </main>
    </GuestLayout>
  )
}
