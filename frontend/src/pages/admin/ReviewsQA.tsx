import { ReviewsQaTabs } from '@/components/Admin/QA/ReviewsTabs'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminQnaThreads, useAdminReviews } from '@/hooks/use-admin-moderation'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useSearchParams } from 'react-router-dom'

export default function AdminReviewsQaPage() {
  const sidebarUser = useSidebarUser('admin')
  const [searchParams] = useSearchParams()
  const courseUid = searchParams.get('courseUid')?.trim() || undefined

  const reviewsQuery = useAdminReviews({
    per_page: 50,
    ...(courseUid ? { courseUid } : {}),
  })

  const qnaQuery = useAdminQnaThreads({
    per_page: 50,
    ...(courseUid ? { courseUid } : {}),
  })

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Reviews & Q&A"
          subtitle="Pantau review peserta, berikan balasan, dan tindak lanjuti diskusi Q&A secara terpusat."
        />
        <ReviewsQaTabs
          courseUid={courseUid}
          reviews={reviewsQuery.data?.reviews ?? []}
          qnaThreads={qnaQuery.data?.threads ?? []}
          isLoadingReviews={reviewsQuery.isLoading}
          isLoadingQna={qnaQuery.isLoading}
        />
      </div>
    </AppSidebarProvider>
  )
}
