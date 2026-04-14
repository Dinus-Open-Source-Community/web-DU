import type { Metadata } from 'next'
import GuestLayout from "@/components/layout/GuestLayout"
import Section1 from "./_components/Section1"
import { DataCourse } from "@/lib/dummyData"
import { isMockDataEnabled } from "@/lib/config/mock-data"

export const metadata: Metadata = {
  title: 'Katalog Kursus',
  description: 'Jelajahi kursus yang tersedia.',
}

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <Section1 Data={isMockDataEnabled() ? DataCourse : []} />
      </GuestLayout>
    </main>
  )
}
