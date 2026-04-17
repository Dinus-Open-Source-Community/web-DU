import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { MentorsTable } from './_components/MentorsTable'

export const metadata: Metadata = {
  title: 'Mentor — Admin',
  description: 'Manajemen mentor Doscom University.',
  robots: { index: false, follow: false },
}

export default function AdminMentorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Manajemen Mentor"
        subtitle="Daftar mentor beserta spesialisasi, performa kelas, dan rating siswa."
      />
      <MentorsTable />
    </div>
  )
}
