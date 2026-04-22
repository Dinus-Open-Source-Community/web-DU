'use client'

import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { listMentors, listStudents } from '@/lib/data/repository'

import { PersonSelectionDialog, type PersonSelectionItem } from '@/components/admin/PersonSelectionDialog'

type InvitePersonItem = PersonSelectionItem & {
  kind: 'student' | 'mentor'
}

export function InviteAdminDialog() {
  const adminItems: InvitePersonItem[] = listMentors().map((mentor) => ({
    uid: mentor.uid,
    name: mentor.name,
    email: mentor.email,
    avatar: mentor.avatar,
    kind: 'mentor',
    detail: `${mentor.status} • bergabung ${mentor.joinedAt}`,
    meta: <Badge variant="userRole">Mentor</Badge>,
  }))

  const studentItems: InvitePersonItem[] = listStudents().map((student) => ({
    uid: student.uid,
    name: student.name,
    email: student.email,
    avatar: student.avatar,
    kind: 'student',
    detail: `${student.enrolledCourses} kursus • progres rata-rata ${student.averageProgress}%`,
    meta: <Badge variant="userActive">Student</Badge>,
  }))

  const items = [...adminItems, ...studentItems]

  return (
    <PersonSelectionDialog<InvitePersonItem>
      triggerLabel="Undang Admin"
      triggerIcon={UserPlus}
      title="Undang Administrator"
      description="Cari user yang ingin dijadikan administrator. Daftar menampilkan seluruh admin dan student agar mudah menelusuri kandidat yang tepat."
      confirmLabel="Kirim undangan"
      searchPlaceholder="Cari nama, email, atau ID user..."
      items={items}
      emptyTitle="Tidak ada user cocok"
      emptyDescription="Coba ubah kata kunci pencarian untuk melihat kandidat lain."
      renderFooterHint={(item) =>
        item.kind === 'student' ? (
          <span>
            <strong className="font-semibold text-slate-900">{item.name}</strong> akan menerima undangan dan akses administrator baru.
          </span>
        ) : (
          <span>
            <strong className="font-semibold text-slate-900">{item.name}</strong> sudah berstatus admin; undangan ulang tetap bisa diproses bila diperlukan.
          </span>
        )
      }
      onConfirm={async (item) => {
        if (item.kind === 'student') {
          toast.success(`${item.name} dipilih untuk diundang menjadi admin.`)
          return
        }

        toast.success(`${item.name} dipilih untuk pengelolaan admin.`)
      }}
    />
  )
}
