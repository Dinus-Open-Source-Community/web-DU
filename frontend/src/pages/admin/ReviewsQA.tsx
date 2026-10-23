import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ReviewsQaTabs } from '@/components/Admin/QA/ReviewsTabs'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminQnaThreads, useAdminReviews } from '@/hooks/use-admin-moderation'
import { useAdminAppSidebar, useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'

export default function ReviewsQaPage() {
  const { role: authRole } = useAuth()
  const isMentor = authRole === 'mentor'
  const adminSidebar = useAdminAppSidebar()
  const mentorUser = useSidebarUser('mentor')
  const shellRole = isMentor ? 'mentor' : adminSidebar.role
  const sidebarUser = isMentor ? mentorUser : adminSidebar.user

  const [searchParams] = useSearchParams()
  const courseUid = searchParams.get('courseUid')?.trim() || undefined

  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsPageSize, setReviewsPageSize] = useState(10)
  const [qnaPage, setQnaPage] = useState(1)
  const [qnaPageSize, setQnaPageSize] = useState(10)

  useEffect(() => {
    setReviewsPage(1)
    setQnaPage(1)
  }, [courseUid])

  const reviewsQuery = useAdminReviews({
    page: reviewsPage,
    per_page: reviewsPageSize,
    ...(courseUid ? { courseUid } : {}),
  })

  const qnaQuery = useAdminQnaThreads({
    page: qnaPage,
    per_page: qnaPageSize,
    ...(courseUid ? { courseUid } : {}),
  })

  const reviewsTotalPages = reviewsQuery.data?.meta.total_pages ?? 1
  const reviewsTotal = reviewsQuery.data?.meta.total ?? 0
  const qnaTotalPages = qnaQuery.data?.meta.total_pages ?? 1
  const qnaTotal = qnaQuery.data?.meta.total ?? 0

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className="relative z-[1] flex w-full flex-col gap-6">
        <PageHeader
          className="mb-0 space-y-1.5"
          title="Ulasan & Tanya Jawab"
          subtitle={
            isMentor
              ? 'Balas ulasan dan tanya jawab pada kursus yang Anda bimbing.'
              : 'Pantau ulasan peserta, berikan balasan, dan tindak lanjuti diskusi tanya jawab secara terpusat.'
          }
        />
        <ReviewsQaTabs
          courseUid={courseUid}
          reviews={reviewsQuery.data?.reviews ?? []}
          qnaThreads={qnaQuery.data?.threads ?? []}
          isLoadingReviews={reviewsQuery.isLoading}
          isLoadingQna={qnaQuery.isLoading}
          reviewsPage={reviewsPage}
          reviewsTotalPages={reviewsTotalPages}
          reviewsTotal={reviewsTotal}
          reviewsPageSize={reviewsPageSize}
          onReviewsPageChange={setReviewsPage}
          onReviewsPageSizeChange={(newSize) => {
            setReviewsPageSize(newSize)
            setReviewsPage(1)
          }}
          qnaPage={qnaPage}
          qnaTotalPages={qnaTotalPages}
          qnaTotal={qnaTotal}
          qnaPageSize={qnaPageSize}
          onQnaPageChange={setQnaPage}
          onQnaPageSizeChange={(newSize) => {
            setQnaPageSize(newSize)
            setQnaPage(1)
          }}
        />
      </div>
    </AppSidebarProvider>
  )
}
