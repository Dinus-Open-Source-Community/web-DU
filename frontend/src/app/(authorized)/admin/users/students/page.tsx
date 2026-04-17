import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { StudentsTable } from './_components/StudentsTable'

export const metadata: Metadata = {
  title: 'Siswa — Admin',
  description: 'Manajemen siswa Doscom University.',
  robots: { index: false, follow: false },
}

export default function AdminStudentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Manajemen Siswa"
        subtitle="Daftar siswa terdaftar, progres belajar, dan kredensial akun."
      />
      <StudentsTable />
    </div>
  )
}
