import { useMemo } from 'react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { mapManagedUsers, toAdminStudent } from '@/lib/user-manage/mappers'
import { studentToRow } from '@/lib/user-manage/view-models'

export default function AdminStudentsPage() {
  const sidebarUser = useSidebarUser('admin')
  const pageState = useAdminUserPage({ role: 'student' })

  const rows = useMemo(
    () => mapManagedUsers(pageState.users, toAdminStudent).map(studentToRow),
    [pageState.users],
  )

  const isInitialLoading = pageState.isLoading && rows.length === 0

  return (
    <UserManagePageShell kind="student" user={sidebarUser} isLoading={isInitialLoading}>
      <UserManagePanel
        kind="student"
        rows={rows}
        totalUsers={pageState.meta?.total}
        isLoading={pageState.isLoading}
        page={pageState.page}
        totalPages={pageState.totalPages}
        onPageChange={pageState.setPage}
        onSearch={pageState.onSearch}
        onUpdateRole={pageState.onUpdateRole}
        onDeleteUser={pageState.onDeleteUser}
        isMutating={pageState.isMutating}
      />
    </UserManagePageShell>
  )
}
