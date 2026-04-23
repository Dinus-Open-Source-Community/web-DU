import type { Metadata } from 'next'
import { SuspenseLoader } from '@/components/feedback/SuspenseLoader'
import SectionPage from './_components/SectionPage'

export const metadata: Metadata = {
  title: 'Dashboard Siswa',
  description: 'Ringkasan pembelajaran, tenggat, dan kursus Anda.',
  robots: { index: false, follow: false },
}

export default function StudentDashboardPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface">
      <SuspenseLoader label="Memuat dashboard">
        <SectionPage />
      </SuspenseLoader>
    </main>
  )
}
