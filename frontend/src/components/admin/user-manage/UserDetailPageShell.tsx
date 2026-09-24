import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import type { SidebarUser } from '@/components/shared/Sidebar'
import { Button } from '@/components/ui/button'
import { userManageLayout } from '@/lib/user-manage/layout'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import { getUserManageConfig } from '@/lib/user-manage/page-config'

type UserDetailPageShellProps = {
  kind: UserManageKind
  user: SidebarUser
  backHref: string
  isLoading?: boolean
  loadingMessage?: string
  children?: ReactNode
}

export function UserDetailPageShell({
  kind,
  user,
  backHref,
  isLoading = false,
  loadingMessage,
  children,
}: UserDetailPageShellProps) {
  const config = getUserManageConfig(kind)

  return (
    <AppSidebarProvider role="super_admin" user={user}>
      <div className={userManageLayout.page}>
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-fit gap-2 px-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            asChild
          >
            <Link to={backHref}>
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke {config.navLabel.toLowerCase()}
            </Link>
          </Button>
          {isLoading ? (
            <PageSkeleton message={loadingMessage ?? 'Memuat detail user...'} />
          ) : (
            children
          )}
        </div>
      </div>
    </AppSidebarProvider>
  )
}
