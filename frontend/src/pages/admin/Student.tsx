import { useMemo } from 'react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { mapManagedUsers, toAdminStudent } from '@/lib/user-manage/mappers'
import { studentToRow } from '@/lib/user-manage/view-models'

export default function AdminStudentsPage() {
  const pageState = useAdminUserPage({ role: 'student' })

  const rows = useMemo(
    () => mapManagedUsers(pageState.users, toAdminStudent).map(studentToRow),
    [pageState.users],
  )

  const isInitialLoading = pageState.isLoading && rows.length === 0

  return (
    <UserManagePageShell kind="student" isLoading={isInitialLoading}>
      <UserManagePanel
        kind="student"
        rows={rows}
        totalUsers={pageState.meta?.total}
        isLoading={pageState.isLoading}
        page={pageState.page}
        totalPages={pageState.totalPages}
        pageSize={pageState.pageSize}
        onPageSizeChange={pageState.setPageSize}
        onPageChange={pageState.setPage}
        onSearch={pageState.onSearch}
        onUpdateRole={pageState.onUpdateRole}
        onDeleteUser={pageState.onDeleteUser}
        isMutating={pageState.isMutating}
      />
    </UserManagePageShell>
  )
}
