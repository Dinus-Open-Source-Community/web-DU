import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { AdminCoursesGrid } from './_components/AdminCoursesGrid'

export const metadata: Metadata = {
  title: 'Kursus — Admin',
  description: 'Daftar seluruh kursus Doscom University.',
  robots: { index: false, follow: false },
}

export default function AdminCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Manajemen Kursus"
        subtitle="Telusuri, filter, dan kelola seluruh kursus yang tersedia di platform."
      />
      <AdminCoursesGrid />
    </div>
  )
}
