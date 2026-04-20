'use client'

import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { PersonSelectionDialog, type PersonSelectionItem } from '@/components/admin/PersonSelectionDialog'
import { listStudents } from '@/lib/data/repository'

type MentorInviteItem = PersonSelectionItem

export function InviteMentorDialog() {
  const items: MentorInviteItem[] = listStudents().map((student) => ({
    uid: student.uid,
    name: student.name,
    email: student.email,
    avatar: student.avatar,
    detail: `${student.enrolledCourses} kursus • progres rata-rata ${student.averageProgress}%`,
    meta: <Badge variant="userPending">Student</Badge>,
  }))

  return (
    <PersonSelectionDialog<MentorInviteItem>
      triggerLabel="Undang Mentor"
      triggerIcon={UserPlus}
      title="Undang Mentor Baru"
      description="Pilih student yang ingin dipromosikan menjadi mentor. Pencarian membantu menelusuri seluruh student dengan cepat."
      confirmLabel="Jadikan mentor"
      searchPlaceholder="Cari nama, email, atau ID student..."
      items={items}
      emptyTitle="Tidak ada student cocok"
      emptyDescription="Coba kata kunci lain untuk menemukan student yang akan dijadikan mentor."
      renderFooterHint={(item) => (
        <span>
          <strong className="font-semibold text-slate-900">{item.name}</strong> akan diproses sebagai kandidat mentor baru.
        </span>
      )}
      onConfirm={async (item) => {
        toast.success(`${item.name} dipilih sebagai kandidat mentor.`)
      }}
    />
  )
}
