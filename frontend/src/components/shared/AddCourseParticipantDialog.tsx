import { useCallback, useMemo } from 'react'
import { UserPlus } from 'lucide-react'

import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { useCourseCandidateStudents } from '@/hooks/use-course'
import { useAddCourseParticipants } from '@/hooks/use-course-mutations'
import { mapManagedUsers, toAdminStudent } from '@/lib/user-manage/mappers'
import { rowsToPromoteCandidates, studentToRow } from '@/lib/user-manage/view-models'

type AddCourseParticipantDialogProps = {
  courseUid: string
  triggerClassName?: string
}

export function AddCourseParticipantDialog({
  courseUid,
  triggerClassName,
}: AddCourseParticipantDialogProps) {
  const candidatesQuery = useCourseCandidateStudents(courseUid)
  const addParticipants = useAddCourseParticipants()

  const candidates = useMemo(() => {
    const rawUsers = candidatesQuery.data?.users ?? []
    const students = mapManagedUsers(rawUsers, toAdminStudent).map(studentToRow)
    return rowsToPromoteCandidates(students, 'Siswa')
  }, [candidatesQuery.data?.users])

  const handleConfirm = useCallback(
    async (uids: string[]) => {
      await addParticipants.mutateAsync({
        courseUid,
        payload: { student_uids: uids },
      })
    },
    [addParticipants, courseUid],
  )

  return (
    <UserPromoteDialog
      triggerLabel="Tambah Peserta"
      triggerIcon={UserPlus}
      triggerClassName={triggerClassName}
      title="Tambah Peserta"
      description="Pilih satu atau beberapa pengguna dari daftar siswa untuk ditambahkan ke kursus ini."
      confirmLabel="Tambah Peserta"
      searchPlaceholder="Cari siswa..."
      emptyTitle={candidatesQuery.isLoading ? 'Memuat siswa...' : 'Tidak ada calon peserta'}
      emptyDescription={
        candidatesQuery.isLoading
          ? 'Mohon tunggu sebentar.'
          : 'Semua siswa sudah terdaftar pada kursus ini atau belum ada siswa terdaftar.'
      }
      footerHint={(name) => `${name} akan didaftarkan sebagai peserta kursus ini.`}
      candidates={candidates}
      onConfirm={handleConfirm}
    />
  )
}
