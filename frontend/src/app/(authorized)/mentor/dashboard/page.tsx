import type { Metadata } from 'next'
import MentorDashboardContent from './_components/MentorDashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard Mentor',
  description: 'Jadwal mengajar dan ringkasan aktivitas.',
  robots: { index: false, follow: false },
}

export default function MentorDashboardPage() {
  return (
    <main>
      <MentorDashboardContent />
    </main>
  )
}
