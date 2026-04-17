import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { GeneralSettingsForm } from './_components/GeneralSettingsForm'

export const metadata: Metadata = {
  title: 'Pengaturan Umum — Admin',
  robots: { index: false, follow: false },
}

export default function AdminGeneralSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pengaturan Umum"
        subtitle="Identitas brand, regional, dan konfigurasi dasar platform."
      />
      <GeneralSettingsForm />
    </div>
  )
}
