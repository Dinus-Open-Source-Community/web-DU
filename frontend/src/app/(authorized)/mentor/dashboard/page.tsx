import type { Metadata } from 'next'
import { SuspenseLoader } from '@/components/feedback/SuspenseLoader'
import MentorDashboardContent from './_components/MentorDashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard Mentor',
  description: 'Jadwal mengajar dan ringkasan aktivitas.',
  robots: { index: false, follow: false },
}

export default function MentorDashboardPage() {
  return (
    <main>
      <SuspenseLoader label="Memuat dashboard mentor">
        <MentorDashboardContent />
      </SuspenseLoader>
    </main>
  )
}
