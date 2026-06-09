import { useParams } from 'react-router-dom'

import { UserDetailPageShell } from '@/components/admin/user-manage/UserDetailPageShell'
import { UserDetailView } from '@/components/admin/user-manage/UserDetailView'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { useAdminUserDetailPage } from '@/hooks/use-admin-user-detail-page'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { UserManageKind } from '@/lib/user-manage/page-config'

type AdminUserDetailPageProps = {
  kind: UserManageKind
}

export default function AdminUserDetailPage({ kind }: AdminUserDetailPageProps) {
  const { userUid = '' } = useParams<{ userUid: string }>()
  const sidebarUser = useSidebarUser('admin')
  const pageState = useAdminUserDetailPage({ kind, uid: userUid })

  const isInitialLoading = pageState.isLoading && !pageState.viewModel

  if (!userUid) {
    return (
      <UserDetailPageShell kind={kind} user={sidebarUser} backHref={pageState.config.path}>
        <EmptyState
          title="User tidak ditemukan"
          description="ID user tidak valid atau tidak tersedia di URL."
        />
      </UserDetailPageShell>
    )
  }

  if (pageState.isError && !pageState.viewModel) {
    return (
      <UserDetailPageShell kind={kind} user={sidebarUser} backHref={pageState.config.path}>
        <EmptyState
          title="Gagal memuat detail user"
          description={
            pageState.error instanceof Error
              ? pageState.error.message
              : 'Terjadi kesalahan saat mengambil data.'
          }
          action={
            <Button type="button" size="sm" onClick={() => void pageState.refetch()}>
              Coba lagi
            </Button>
          }
        />
      </UserDetailPageShell>
    )
  }

  if (!pageState.viewModel || !pageState.selectedUser) {
    return (
      <UserDetailPageShell
        kind={kind}
        user={sidebarUser}
        backHref={pageState.config.path}
        isLoading={isInitialLoading}
      />
    )
  }

  return (
    <UserDetailPageShell
      kind={kind}
      user={sidebarUser}
      backHref={pageState.config.path}
      isLoading={isInitialLoading}
    >
      <UserDetailView
        kind={kind}
        viewModel={pageState.viewModel}
        selectedUser={pageState.selectedUser}
        roleDialogUser={pageState.roleDialogUser}
        deleteDialogUser={pageState.deleteDialogUser}
        onOpenRoleDialog={() => pageState.setRoleDialogUser(pageState.selectedUser)}
        onCloseRoleDialog={() => pageState.setRoleDialogUser(null)}
        onOpenDeleteDialog={() => pageState.setDeleteDialogUser(pageState.selectedUser)}
        onCloseDeleteDialog={() => pageState.setDeleteDialogUser(null)}
        onUpdateRole={pageState.onUpdateRole}
        onDeleteUser={pageState.onDeleteUser}
        isMutating={pageState.isMutating}
      />
    </UserDetailPageShell>
  )
}
