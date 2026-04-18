import type { Metadata } from 'next'
import GuestLayout from "@/components/layout/GuestLayout"
import Section1 from "./_components/Section1"
import { listCourses } from "@/lib/data/repository"
import { isMockDataEnabled } from "@/lib/config/mock-data"

export const metadata: Metadata = {
  title: 'Katalog Kursus',
  description: 'Jelajahi kursus yang tersedia.',
}

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <Section1 Data={isMockDataEnabled() ? listCourses() : []} />
      </GuestLayout>
    </main>
  )
}
