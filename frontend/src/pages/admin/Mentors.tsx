import { useCallback, useMemo } from 'react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useManagedUsers } from '@/hooks/use-managed-users'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { mapManagedUsers, toAdminMentor, toAdminStudent } from '@/lib/user-manage/mappers'
import { mentorToRow, rowsToPromoteCandidates, studentToRow } from '@/lib/user-manage/view-models'

export default function AdminMentorsPage() {
  const sidebarUser = useSidebarUser('admin')
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
    async (uid: string) => {
      await mentorsPage.onUpdateRole(uid, 'mentor')
    },
    [mentorsPage],
  )

  const isInitialLoading = mentorsPage.isLoading && rows.length === 0

  return (
    <UserManagePageShell kind="mentor" user={sidebarUser} isLoading={isInitialLoading}>
      <UserManagePanel
        kind="mentor"
        rows={rows}
        totalUsers={mentorsPage.meta?.total}
        isLoading={mentorsPage.isLoading}
        page={mentorsPage.page}
        totalPages={mentorsPage.totalPages}
        onPageChange={mentorsPage.setPage}
        onSearch={mentorsPage.onSearch}
        onUpdateRole={mentorsPage.onUpdateRole}
        onDeleteUser={mentorsPage.onDeleteUser}
        isMutating={mentorsPage.isMutating}
        promoteCandidates={promoteCandidates}
        onPromote={handlePromoteStudent}
      />
    </UserManagePageShell>
  )
}
