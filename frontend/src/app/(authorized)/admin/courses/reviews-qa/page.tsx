import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { ReviewsQaTabs } from './_components/ReviewsQaTabs'

export const metadata: Metadata = {
  title: 'Reviews & Q&A — Admin',
  description: 'Kelola review dan diskusi peserta untuk seluruh course.',
  robots: { index: false, follow: false },
}

export default function AdminReviewsQaPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <AdminPageHeader title="Reviews & Q&A" subtitle="Pantau review peserta, berikan balasan, dan tindak lanjuti diskusi Q&A secara terpusat." />
      <ReviewsQaTabs />
    </div>
  )
}
