import { useCallback, useMemo } from 'react'
import { UserPlus } from 'lucide-react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useManagedUsers } from '@/hooks/use-managed-users'
import {
  mapManagedUsers,
  toAdminAdministrator,
  toAdminMentor,
  toAdminStudent,
} from '@/lib/user-manage/mappers'
import {
  administratorToRow,
  mentorToRow,
  rowsToPromoteCandidates,
  studentToRow,
  type PromoteCandidate,
} from '@/lib/user-manage/view-models'

export default function AdminAdministratorsPage() {
  const adminsPage = useAdminUserPage({ role: 'admin' })
  const mentorsQuery = useManagedUsers({
    role: 'mentor',
    per_page: 100,
    sort: 'created_at',
    order: 'desc',
  })
  const studentsQuery = useManagedUsers({
    role: 'student',
    per_page: 100,
    sort: 'created_at',
    order: 'desc',
  })

  const rows = useMemo(
    () => mapManagedUsers(adminsPage.users, toAdminAdministrator).map(administratorToRow),
    [adminsPage.users],
  )

  const promoteCandidates = useMemo(() => {
    const mentors = mapManagedUsers(mentorsQuery.data?.users ?? [], toAdminMentor).map(mentorToRow)
    const students = mapManagedUsers(studentsQuery.data?.users ?? [], toAdminStudent).map(studentToRow)

    const mentorCandidates = rowsToPromoteCandidates(mentors, 'Mentor')
    const studentCandidates = rowsToPromoteCandidates(students, 'Siswa')

    return [...mentorCandidates, ...studentCandidates] as PromoteCandidate[]
  }, [mentorsQuery.data?.users, studentsQuery.data?.users])

  const handlePromoteToAdmin = useCallback(
    async (uids: string[]) => {
      await adminsPage.onBatchUpdateRole(uids, 'admin')
    },
    [adminsPage],
  )

  const isInitialLoading = adminsPage.isLoading && rows.length === 0

  const promoteAction = (
    <UserPromoteDialog
      triggerLabel="Jadikan Admin"
      triggerIcon={UserPlus}
      title="Jadikan Admin"
      description="Pilih satu atau beberapa pengguna dari daftar mentor atau siswa untuk dipromosikan menjadi admin."
      confirmLabel="Tetapkan sebagai Admin"
      searchPlaceholder="Cari mentor atau siswa..."
      emptyTitle="Tidak ada calon admin"
      emptyDescription="Semua pengguna yang memenuhi syarat sudah menjadi admin."
      footerHint={(name) => `${name} akan mendapatkan hak akses administratif penuh.`}
      candidates={promoteCandidates}
      onConfirm={handlePromoteToAdmin}
    />
  )

  return (
    <UserManagePageShell kind="admin" isLoading={isInitialLoading} action={promoteAction}>
      <UserManagePanel
        kind="admin"
        rows={rows}
        totalUsers={adminsPage.meta?.total}
        isLoading={adminsPage.isLoading}
        page={adminsPage.page}
        totalPages={adminsPage.totalPages}
        pageSize={adminsPage.pageSize}
        onPageSizeChange={adminsPage.setPageSize}
        onPageChange={adminsPage.setPage}
        onSearch={adminsPage.onSearch}
        onUpdateRole={adminsPage.onUpdateRole}
        onDeleteUser={adminsPage.onDeleteUser}
        isMutating={adminsPage.isMutating}
      />
    </UserManagePageShell>
  )
}
