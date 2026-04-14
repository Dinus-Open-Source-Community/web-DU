import type { Metadata } from 'next'
import SectionPage from './_components/SectionPage'

export const metadata: Metadata = {
  title: 'Dashboard Siswa',
  description: 'Ringkasan pembelajaran, tenggat, dan kursus Anda.',
  robots: { index: false, follow: false },
}

const page = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface">
      <SectionPage />
    </main>
  )
}

export default page
