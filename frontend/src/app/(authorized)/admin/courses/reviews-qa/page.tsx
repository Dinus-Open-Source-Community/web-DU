import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { ReviewsQaTabs } from './_components/ReviewsQaTabs'

export const metadata: Metadata = {
  title: 'Reviews & Q&A — Admin',
  robots: { index: false, follow: false },
}

export default function AdminReviewsQaPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reviews & Q&A"
        subtitle="Pantau umpan balik siswa dan bantu jawab pertanyaan yang masuk ke forum kursus."
      />
      <ReviewsQaTabs />
    </div>
  )
}
