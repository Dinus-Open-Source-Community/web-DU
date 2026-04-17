import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { IntegrationsPanel } from './_components/IntegrationsPanel'

export const metadata: Metadata = {
  title: 'Integrasi — Admin',
  robots: { index: false, follow: false },
}

export default function AdminIntegrationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Integrasi"
        subtitle="Kelola koneksi payment gateway, email provider, dan webhook platform."
      />
      <IntegrationsPanel />
    </div>
  )
}
