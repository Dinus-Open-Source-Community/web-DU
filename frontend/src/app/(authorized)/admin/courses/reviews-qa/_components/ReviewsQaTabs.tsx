'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { QaForum } from './QaForum'
import { ReviewsPanel } from './ReviewsPanel'

export function ReviewsQaTabs() {
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
        <ReviewsPanel />
      </TabsContent>
      <TabsContent value="qa" className="mt-2">
        <QaForum />
      </TabsContent>
    </Tabs>
  )
}
