import type { Metadata } from 'next'
import GuestLayout from '@/components/layout/GuestLayout'
import { SuspenseLoader } from '@/components/feedback/SuspenseLoader'
import CourseCatalogClient from './_components/CourseCatalogClient'

export const metadata: Metadata = {
  title: 'Katalog Kursus',
  description: 'Jelajahi kursus yang tersedia.',
}

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <SuspenseLoader label="Memuat katalog kursus">
          <CourseCatalogClient />
        </SuspenseLoader>
      </GuestLayout>
    </main>
  )
}
