import type { Metadata } from 'next'
import MentorCoursesSection from '../../mentor/courses/_components/MentorCoursesSection'

export const metadata: Metadata = {
  title: 'Kursus — Admin',
  description: 'Daftar seluruh kursus Doscom University.',
  robots: { index: false, follow: false },
}

export default function AdminCoursesPage() {
  return (
    <section className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <MentorCoursesSection role="admin" />
    </section>
  )
}
