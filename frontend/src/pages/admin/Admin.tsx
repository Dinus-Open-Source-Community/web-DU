import { useCallback, useMemo } from 'react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useManagedUsers } from '@/hooks/use-managed-users'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
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
  const sidebarUser = useSidebarUser('admin')
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
    async (uid: string) => {
      await adminsPage.onUpdateRole(uid, 'admin')
    },
    [adminsPage],
  )

  const isInitialLoading = adminsPage.isLoading && rows.length === 0

  return (
    <UserManagePageShell kind="admin" user={sidebarUser} isLoading={isInitialLoading}>
      <UserManagePanel
        kind="admin"
        rows={rows}
        totalUsers={adminsPage.meta?.total}
        isLoading={adminsPage.isLoading}
        page={adminsPage.page}
        totalPages={adminsPage.totalPages}
        onPageChange={adminsPage.setPage}
        onSearch={adminsPage.onSearch}
        onUpdateRole={adminsPage.onUpdateRole}
        onDeleteUser={adminsPage.onDeleteUser}
        isMutating={adminsPage.isMutating}
        promoteCandidates={promoteCandidates}
        onPromote={handlePromoteToAdmin}
      />
    </UserManagePageShell>
  )
}
