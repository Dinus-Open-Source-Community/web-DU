import type { ReactNode } from 'react'

import {
  UserManageContentSkeleton,
  UserManagePageHeader,
} from '@/components/admin/user-manage/UserManagePageSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { userManageLayout } from '@/lib/user-manage/layout'
import type { UserManageKind } from '@/lib/user-manage/page-config'

type UserManagePageShellProps = {
  kind: UserManageKind
  isLoading?: boolean
  loadingMessage?: string
  /** Jumlah baris skeleton saat loading — isi dengan pageSize aktif. */
  skeletonRows?: number
  action?: ReactNode
  children: ReactNode
}

export function UserManagePageShell({
  kind,
  isLoading = false,
  loadingMessage,
  skeletonRows,
  action,
  children,
}: UserManagePageShellProps) {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className={userManageLayout.page}>
        <UserManagePageHeader kind={kind} action={action} />

        {isLoading ? (
          <UserManageContentSkeleton
            kind={kind}
            message={loadingMessage}
            rows={skeletonRows}
          />
        ) : (
          children
        )}
      </div>
    </AppSidebarProvider>
  )
}
