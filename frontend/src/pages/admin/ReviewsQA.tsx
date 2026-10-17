import { ReviewsQaTabs } from '@/components/Admin/QA/ReviewsTabs'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminQnaThreads, useAdminReviews } from '@/hooks/use-admin-moderation'
import { useAdminAppSidebar, useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'
import { appShellGridOverlayClassName, appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'

export default function ReviewsQaPage() {
  const { role: authRole } = useAuth()
  const isMentor = authRole === 'mentor'
  const adminSidebar = useAdminAppSidebar()
  const mentorUser = useSidebarUser('mentor')
  const shellRole = isMentor ? 'mentor' : adminSidebar.role
  const sidebarUser = isMentor ? mentorUser : adminSidebar.user

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
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <div aria-hidden className={appShellGridOverlayClassName} />
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
        />
      </div>
    </AppSidebarProvider>
  )
}
