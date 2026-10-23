import { useCallback, useMemo } from 'react'
import { UserPlus } from 'lucide-react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useManagedUsers } from '@/hooks/use-managed-users'
import { mapManagedUsers, toAdminMentor, toAdminStudent } from '@/lib/user-manage/mappers'
import { mentorToRow, rowsToPromoteCandidates, studentToRow } from '@/lib/user-manage/view-models'

export default function AdminMentorsPage() {
  const mentorsPage = useAdminUserPage({ role: 'mentor' })
  const studentsQuery = useManagedUsers({
    role: 'student',
    per_page: 100,
    sort: 'created_at',
    order: 'desc',
  })

  const rows = useMemo(
    () => mapManagedUsers(mentorsPage.users, toAdminMentor).map(mentorToRow),
    [mentorsPage.users],
  )

  const promoteCandidates = useMemo(() => {
    const students = mapManagedUsers(studentsQuery.data?.users ?? [], toAdminStudent).map(studentToRow)
    return rowsToPromoteCandidates(students, 'Siswa')
  }, [studentsQuery.data?.users])

  const handlePromoteStudent = useCallback(
    async (uids: string[]) => {
      await mentorsPage.onBatchUpdateRole(uids, 'mentor')
    },
    [mentorsPage],
  )

  const isInitialLoading = mentorsPage.isLoading && rows.length === 0

  const promoteAction = (
    <UserPromoteDialog
      triggerLabel="Jadikan Mentor"
      triggerIcon={UserPlus}
      title="Jadikan Mentor"
      description="Pilih satu atau beberapa pengguna dari daftar siswa untuk dipromosikan menjadi mentor."
      confirmLabel="Tetapkan sebagai Mentor"
      searchPlaceholder="Cari siswa..."
      emptyTitle="Tidak ada calon mentor"
      emptyDescription="Semua siswa sudah menjadi mentor atau belum ada siswa terdaftar."
      footerHint={(name) => `${name} akan mendapatkan akses dashboard mentor.`}
      candidates={promoteCandidates}
      onConfirm={handlePromoteStudent}
    />
  )

  return (
    <UserManagePageShell kind="mentor" isLoading={isInitialLoading} action={promoteAction}>
      <UserManagePanel
        kind="mentor"
        rows={rows}
        totalUsers={mentorsPage.meta?.total}
        isLoading={mentorsPage.isLoading}
        page={mentorsPage.page}
        totalPages={mentorsPage.totalPages}
        pageSize={mentorsPage.pageSize}
        onPageSizeChange={mentorsPage.setPageSize}
        onPageChange={mentorsPage.setPage}
        onSearch={mentorsPage.onSearch}
        onUpdateRole={mentorsPage.onUpdateRole}
        onDeleteUser={mentorsPage.onDeleteUser}
        isMutating={mentorsPage.isMutating}
      />
    </UserManagePageShell>
  )
}
