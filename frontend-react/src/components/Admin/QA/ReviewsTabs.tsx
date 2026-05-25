import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewsPanel } from './Panel'
import type { AdminQaThread, AdminReview } from '@/lib/types/course'
import { QaForum } from './Forum'

interface ReviewsQaTabsProps {
  courseUid: string
  dataAdminReviews: AdminReview[]
  dataAdminQaThreads: AdminQaThread[]
}

export function ReviewsQaTabs({ courseUid, dataAdminReviews, dataAdminQaThreads }: ReviewsQaTabsProps) {
  return (
    <Tabs defaultValue="reviews" className="flex flex-col gap-4">
      <TabsList variant="line" className="w-full justify-start border-b border-slate-100 px-0 pb-0 rounded-none">
        <TabsTrigger value="reviews" className="text-sm">
          Reviews
        </TabsTrigger>
        <TabsTrigger value="qa" className="text-sm">
          Q&amp;A
        </TabsTrigger>
      </TabsList>
      <TabsContent value="reviews" className="mt-2">
        <ReviewsPanel courseUid={courseUid} dataAdminReviews={dataAdminReviews} />
      </TabsContent>
      <TabsContent value="qa" className="mt-2">
        <QaForum AdminQaThreadsData={dataAdminQaThreads} />
      </TabsContent>
    </Tabs>
  )
}
