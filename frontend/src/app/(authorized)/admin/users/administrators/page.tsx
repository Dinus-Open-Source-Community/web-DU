import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { AdministratorsTable } from './_components/AdministratorsTable'

export const metadata: Metadata = {
  title: 'Administrator — Admin',
  description: 'Manajemen administrator platform.',
  robots: { index: false, follow: false },
}

export default function AdminAdministratorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Administrator Platform"
        subtitle="Daftar staf internal dengan akses panel admin. Kelola role dan kredensial mereka."
      />
      <AdministratorsTable />
    </div>
  )
}
