import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { CategoryManager } from './_components/CategoryManager'

export const metadata: Metadata = {
  title: 'Kategori Kursus — Admin',
  robots: { index: false, follow: false },
}

export default function AdminCourseCategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Kategori Kursus"
        subtitle="Susun taksonomi kursus agar mudah ditemukan oleh siswa."
      />
      <CategoryManager />
    </div>
  )
}
