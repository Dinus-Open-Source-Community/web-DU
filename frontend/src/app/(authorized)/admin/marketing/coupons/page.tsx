import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { CouponsTable } from './_components/CouponsTable'

export const metadata: Metadata = {
  title: 'Kupon & Promosi — Admin',
  robots: { index: false, follow: false },
}

export default function AdminCouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Kupon & Promosi"
        subtitle="Kelola kode promo, diskon, dan periode berlaku kupon untuk kampanye pemasaran."
      />
      <CouponsTable />
    </div>
  )
}
