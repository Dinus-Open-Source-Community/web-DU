import { useMemo } from 'react'
import { UserPlus } from 'lucide-react'

import { PersonSelectionDialog } from '@/components/shared/PersonSelection'
import { Badge } from '@/components/ui/badge'
import { useAssignMentorsToCourse } from '@/hooks/use-course-mutations'
import { useManagedUsers } from '@/hooks/use-managed-users'
import { mapManagedUsers, toAdminMentor } from '@/lib/user-manage/mappers'
import type { PersonSelectionItem } from '@/lib/types/utils'

type AssignCourseMentorDialogProps = {
  courseUid: string
  assignedMentorUids: string[]
}

export function AssignCourseMentorDialog({
  courseUid,
  assignedMentorUids,
}: AssignCourseMentorDialogProps) {
  const mentorsQuery = useManagedUsers({
    role: 'mentor',
    per_page: 100,
    sort: 'created_at',
    order: 'desc',
  })
  const assignMentors = useAssignMentorsToCourse()

  const assignedUidSet = useMemo(() => new Set(assignedMentorUids), [assignedMentorUids])

  const items: PersonSelectionItem[] = useMemo(() => {
    const mentors = mapManagedUsers(mentorsQuery.data?.users ?? [], toAdminMentor)
    return mentors
      .filter((mentor) => !assignedUidSet.has(mentor.uid))
      .map((mentor) => ({
        uid: mentor.uid,
        name: mentor.name,
        email: mentor.email,
        avatar: mentor.avatar,
        detail: `Bergabung ${mentor.joinedAt}`,
        meta: <Badge variant="userRole">Mentor</Badge>,
      }))
  }, [assignedUidSet, mentorsQuery.data?.users])

  return (
    <PersonSelectionDialog
      triggerLabel="Assign mentor"
      triggerIcon={UserPlus}
      title="Tugaskan mentor"
      description="Pilih mentor yang akan ditambahkan ke tim pengajar kursus ini."
      confirmLabel="Tugaskan mentor"
      searchPlaceholder="Cari nama, email, atau ID mentor..."
      items={items}
      emptyTitle={mentorsQuery.isLoading ? 'Memuat mentor...' : 'Semua mentor sudah ditugaskan'}
      emptyDescription={
        mentorsQuery.isLoading
          ? 'Mohon tunggu sebentar.'
          : 'Tidak ada mentor lain yang tersedia untuk kursus ini.'
      }
      renderFooterHint={(item) => (
        <span>
          <strong className="font-semibold text-slate-900">{item.name}</strong> akan ditugaskan sebagai
          mentor kursus.
        </span>
      )}
      onConfirm={async (item) => {
        await assignMentors.mutateAsync({
          courseUid,
          payload: { mentor_uids: [item.uid] },
        })
      }}
    />
  )
}
