import { useMemo, useState } from 'react'
import { Shield, UserPlus, UserRound, UsersRound } from 'lucide-react'

import {
  buildUserManageColumns,
  getUserDetailPath,
} from '@/components/admin/user-manage/user-manage-columns'
import { UserManageRoleDialog } from '@/components/admin/user-manage/UserManageRoleDialog'
import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { AdminDataTable } from '@/components/shared/AdminDataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchForm } from '@/components/shared/SearchForm'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'
import type { AssignableUserRole } from '@/lib/user-manage/types'
import type { ManagedUserRow, PromoteCandidate } from '@/lib/user-manage/view-models'

type UserManagePanelProps = {
  kind: UserManageKind
  rows: ManagedUserRow[]
  totalUsers?: number
  isLoading?: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onUpdateRole: (uid: string, role: AssignableUserRole) => Promise<void>
  onDeleteUser: (uid: string) => Promise<void>
  isMutating?: boolean
  promoteCandidates?: PromoteCandidate[]
  onPromote?: (uid: string) => Promise<void>
}

type RoleDialogState = ManagedUserRow | null
type DeleteDialogState = ManagedUserRow | null

const EMPTY_ICONS = {
  student: UserRound,
  mentor: UsersRound,
  admin: Shield,
} as const

export function UserManagePanel({
  kind,
  rows,
  totalUsers,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  onSearch,
  onUpdateRole,
  onDeleteUser,
  isMutating = false,
  promoteCandidates = [],
  onPromote,
}: UserManagePanelProps) {
  const config = getUserManageConfig(kind)
  const [search, setSearch] = useState('')
  const [roleTarget, setRoleTarget] = useState<RoleDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteDialogState>(null)

  const columns = useMemo(
    () =>
      buildUserManageColumns({
        kind,
        detailPath: (uid) => getUserDetailPath(kind, uid),
        onChangeRole: setRoleTarget,
        onDelete: setDeleteTarget,
        disabled: isMutating,
      }),
    [kind, isMutating],
  )

  const EmptyIcon = EMPTY_ICONS[kind]

  const handleDelete = async () => {
    if (!deleteTarget) return
    await onDeleteUser(deleteTarget.uid)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminDataTable
        columns={columns}
        data={rows}
        keyField={(row) => row.uid}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        toolbar={
          <>
            <SearchForm
              value={search}
              onChange={(value) => {
                setSearch(value)
                if (value === '') onSearch('')
              }}
              onSubmit={() => onSearch(search)}
              placeholder={config.searchPlaceholder}
              submitLabel="Cari"
              className="min-w-[240px] flex-1"
            />

            {config.promote && onPromote ? (
              <UserPromoteDialog
                triggerLabel={config.promote.triggerLabel}
                triggerIcon={UserPlus}
                title={config.promote.dialogTitle}
                description={config.promote.dialogDescription}
                confirmLabel={config.promote.confirmLabel}
                searchPlaceholder={config.promote.searchPlaceholder}
                emptyTitle={config.promote.emptyTitle}
                emptyDescription={config.promote.emptyDescription}
                footerHint={config.promote.footerHint}
                candidates={promoteCandidates}
                onConfirm={onPromote}
              />
            ) : null}

            {totalUsers != null ? (
              <p className="ml-auto text-sm text-slate-500">
                Total <span className="font-semibold tabular-nums text-slate-800">{totalUsers}</span>{' '}
                {config.navLabel.toLowerCase()}
              </p>
            ) : null}
          </>
        }
        emptyState={
          isLoading ? (
            <p className="text-sm text-slate-500">Memuat data...</p>
          ) : (
            <EmptyState
              icon={<EmptyIcon className="size-5" />}
              title={config.emptyTitle}
              description={config.emptyDescription}
              action={
                search ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary hover:underline"
                    onClick={() => {
                      setSearch('')
                      onSearch('')
                      onPageChange(1)
                    }}
                  >
                    Reset pencarian
                  </button>
                ) : undefined
              }
            />
          )
        }
      />

      <UserManageRoleDialog
        open={Boolean(roleTarget)}
        onOpenChange={(open) => {
          if (!open) setRoleTarget(null)
        }}
        user={roleTarget}
        roleTargets={config.roleTargets}
        onConfirm={onUpdateRole}
        isSubmitting={isMutating}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus user?"
        description={
          deleteTarget
            ? `Akun "${deleteTarget.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </div>
  )
}
