import type { ReactNode } from 'react'

import { UserManageTableSkeleton } from '@/components/admin/user-manage/UserManageTableSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import {
  appPageSubtitleClassName,
  appPageTitleClassName,
} from '@/lib/design/app-shell-tokens'
import { userManageLayout } from '@/lib/user-manage/layout'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'

type UserManageSkeletonProps = {
  kind: UserManageKind
  message?: string
  /** Jumlah baris placeholder tabel (default 10 = pageSize awal). */
  rows?: number
}

/** Skeleton konten tabel user (tanpa judul halaman). */
export function UserManageContentSkeleton({ kind, message, rows }: UserManageSkeletonProps) {
  return <UserManageTableSkeleton kind={kind} rows={rows} message={message} />
}

/** Judul + subjudul halaman manajemen user. */
export function UserManagePageHeader({
  kind,
  action,
}: {
  kind: UserManageKind
  action?: ReactNode
}) {
  const config = getUserManageConfig(kind)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={appPageTitleClassName}>{config.pageTitle}</h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {config.pageSubtitle ? (
        <p className={appPageSubtitleClassName}>{config.pageSubtitle}</p>
      ) : null}
    </div>
  )
}

/**
 * Kerangka utuh halaman manajemen user (judul + subjudul + skeleton tabel).
 *
 * Dipakai sebagai fallback Suspense route lazy manajemen user, supaya saat
 * refresh tidak muncul dua skeleton berurutan (skeleton generik tanpa sidebar
 * lalu skeleton halaman). Bentuk dan chrome-nya sama persis dengan kondisi
 * loading milik `UserManagePageShell`, jadi transisinya mulus.
 */
export function UserManagePageSkeleton({ kind, message, rows }: UserManageSkeletonProps) {
  return (
    <div className={userManageLayout.page}>
      <UserManagePageHeader kind={kind} />
      <UserManageContentSkeleton kind={kind} message={message} rows={rows} />
    </div>
  )
}

/** Fallback Suspense route manajemen user: chrome (sidebar + navbar) + skeleton. */
export function UserManagePageFallback({ kind }: { kind: UserManageKind }) {
  const { role, user } = useAdminAppSidebar()

  return (
    <AppSidebarProvider role={role} user={user}>
      <UserManagePageSkeleton kind={kind} />
    </AppSidebarProvider>
  )
}
