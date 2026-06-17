import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
}

export function ReviewsQaTabs({
  courseUid,
  reviews,
  qnaThreads,
  isLoadingReviews = false,
  isLoadingQna = false,
}: ReviewsQaTabsProps) {
  const [activeTab, setActiveTab] = useQueryStateEnum(
    'section',
    MODERATION_TAB_VALUES,
    'reviews',
  )

  return (
    <Tabs
      value={activeTab ?? 'reviews'}
      onValueChange={(value) => setActiveTab(value as ModerationTabValue)}
      className="flex flex-col gap-4"
    >
      <TabsList variant="line" className="w-full justify-start rounded-none border-b border-slate-100 px-0 pb-0">
        <TabsTrigger value="reviews" className="text-sm">
          Reviews
        </TabsTrigger>
        <TabsTrigger value="qa" className="text-sm">
          Q&amp;A
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="mt-2">
        <ReviewsPanel
          courseUid={courseUid}
          reviews={reviews}
          isLoading={isLoadingReviews}
        />
      </TabsContent>

      <TabsContent value="qa" className="mt-2">
        <QaForum threads={qnaThreads} isLoading={isLoadingQna} />
      </TabsContent>
    </Tabs>
  )
}
