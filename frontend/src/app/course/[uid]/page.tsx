import type { Metadata } from 'next'
import GuestLayout from '@/components/layout/GuestLayout'
import { SuspenseLoader } from '@/components/feedback/SuspenseLoader'
import CourseDetailClient from './_components/CourseDetailClient'

export const metadata: Metadata = {
  title: 'Detail Kursus — Doscom University',
}

interface PageProps {
  params: Promise<{ uid: string }>
}

export default async function PublicCourseDetailPage({ params }: PageProps) {
  const { uid } = await params

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <SuspenseLoader label="Memuat detail kursus">
          <CourseDetailClient uid={uid} />
        </SuspenseLoader>
      </GuestLayout>
    </main>
  )
}
