import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { RbacPanel } from './_components/RbacPanel'

export const metadata: Metadata = {
  title: 'RBAC — Admin',
  robots: { index: false, follow: false },
}

export default function AdminRbacPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Role & Permissions"
        subtitle="Atur peran dan izin akses setiap pengguna pada modul sistem."
      />
      <RbacPanel />
    </div>
  )
}
