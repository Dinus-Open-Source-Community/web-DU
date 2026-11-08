import { AdminUnderlineTabs } from '@/components/admin/AdminUnderlineTabs'
import { useQueryStateEnum } from '@/lib/nuqs-react-router'
import type { AdminQaThread, AdminReview } from '@/lib/types/course'

import { QaForum } from './Forum'
import { ReviewsPanel } from './Panel'

const MODERATION_TAB_VALUES = ['reviews', 'qa'] as const
type ModerationTabValue = (typeof MODERATION_TAB_VALUES)[number]

interface ReviewsQaTabsProps {
  courseUid?: string
  reviews: AdminReview[]
  qnaThreads: AdminQaThread[]
  isLoadingReviews?: boolean
  isLoadingQna?: boolean
  reviewsPage?: number
  reviewsTotalPages?: number
  reviewsTotal?: number
  reviewsPageSize?: number
  onReviewsPageChange?: (page: number) => void
  onReviewsPageSizeChange?: (pageSize: number) => void
  qnaPage?: number
  qnaTotalPages?: number
  qnaTotal?: number
  qnaPageSize?: number
  onQnaPageChange?: (page: number) => void
  onQnaPageSizeChange?: (pageSize: number) => void
}

export function ReviewsQaTabs({
  courseUid,
  reviews,
  qnaThreads,
  isLoadingReviews = false,
  isLoadingQna = false,
  reviewsPage,
  reviewsTotalPages,
  reviewsTotal,
  reviewsPageSize,
  onReviewsPageChange,
  onReviewsPageSizeChange,
  qnaPage,
  qnaTotalPages,
  qnaTotal,
  qnaPageSize,
  onQnaPageChange,
  onQnaPageSizeChange,
}: ReviewsQaTabsProps) {
  const [activeTab, setActiveTab] = useQueryStateEnum(
    'section',
    MODERATION_TAB_VALUES,
    'reviews',
  )

  const tab = activeTab ?? 'reviews'

  return (
    <div className="flex flex-col gap-4">
      <AdminUnderlineTabs
        variant="pill"
        className="w-fit"
        value={tab}
        ariaLabel="Ulasan dan tanya jawab"
        items={[
          { value: 'reviews', label: 'Ulasan' },
          { value: 'qa', label: 'Tanya Jawab' },
        ]}
        onChange={(value) => setActiveTab(value as ModerationTabValue)}
      />

      {tab === 'reviews' ? (
        <ReviewsPanel
          courseUid={courseUid}
          reviews={reviews}
          isLoading={isLoadingReviews}
          page={reviewsPage}
          totalPages={reviewsTotalPages}
          total={reviewsTotal}
          pageSize={reviewsPageSize}
          onPageChange={onReviewsPageChange}
          onPageSizeChange={onReviewsPageSizeChange}
        />
      ) : (
        <QaForum
          threads={qnaThreads}
          isLoading={isLoadingQna}
          page={qnaPage}
          totalPages={qnaTotalPages}
          total={qnaTotal}
          pageSize={qnaPageSize}
          onPageChange={onQnaPageChange}
          onPageSizeChange={onQnaPageSizeChange}
        />
      )}
    </div>
  )
}
