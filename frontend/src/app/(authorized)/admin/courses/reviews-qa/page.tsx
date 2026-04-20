import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Reviews & Q&A — Admin',
  robots: { index: false, follow: false },
}

export default function AdminReviewsQaPage() {
  redirect('/admin/courses')
}
