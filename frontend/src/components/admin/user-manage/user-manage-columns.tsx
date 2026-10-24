import { Link } from 'react-router-dom'
import { Trash2, UserCog } from 'lucide-react'

import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { UserStatusBadge } from '@/components/admin/user-manage/UserStatusBadge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import type { ManagedUserRow } from '@/lib/user-manage/view-models'
import { userManageLayout } from '@/lib/user-manage/layout'

type BuildColumnsOptions = {
  kind: UserManageKind
  detailPath: (uid: string) => string
  onChangeRole: (user: ManagedUserRow) => void
  onDelete: (user: ManagedUserRow) => void
  disabled?: boolean
}

export function buildUserManageColumns({
  kind,
  detailPath,
  onChangeRole,
  onDelete,
  disabled = false,
}: BuildColumnsOptions) {
  const baseColumns = [
    {
      id: 'user',
      header: 'User',
      cell: (row: ManagedUserRow) => (
        <UserIdentityCell
          name={row.name}
          email={row.email}
          avatar={row.avatar}
          meta={row.roleLabel}
        />
      ),
    },
    {
      id: 'verified',
      header: 'Verifikasi Email',
      cell: (row: ManagedUserRow) => <UserStatusBadge isVerified={row.isVerified} />,
    },
  ]

  const kindColumns =
    kind === 'student'
      ? [
          {
            id: 'courses',
            header: 'Kursus',
            align: 'center' as const,
            cell: (row: ManagedUserRow) => (
              <span className="tabular-nums text-foreground">{row.enrolledCourses ?? 0}</span>
            ),
          },
          {
            id: 'joined',
            header: 'Bergabung',
            cell: (row: ManagedUserRow) => (
              <span className="text-muted-foreground">{row.joinedAt}</span>
            ),
          },
        ]
      : [
          {
            id: 'joined',
            header: 'Bergabung',
            cell: (row: ManagedUserRow) => (
              <span className="text-muted-foreground">{row.joinedAt}</span>
            ),
          },
        ]

  const actionColumn = {
    id: 'actions',
    header: 'Aksi',
    align: 'right' as const,
    cell: (row: ManagedUserRow) => (
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={userManageLayout.tableActionButton}
          asChild
        >
          <Link to={detailPath(row.uid)}>Detail</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={userManageLayout.tableActionButton}
          onClick={() => onChangeRole(row)}
          disabled={disabled}
        >
          <UserCog className="mr-1.5 size-3.5" aria-hidden />
          Ubah role
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`${userManageLayout.tableActionButton} ${userManageLayout.tableDestructiveActionButton}`}
          onClick={() => onDelete(row)}
          disabled={disabled}
        >
          <Trash2 className="mr-1.5 size-3.5" aria-hidden />
          Hapus
        </Button>
      </div>
    ),
  }

  if (kind === 'admin') {
    return [...baseColumns, ...kindColumns, actionColumn]
  }

  return [...baseColumns, ...kindColumns, actionColumn]
}

export function getUserDetailPath(kind: UserManageKind, uid: string) {
  if (kind === 'student') return ROUTES.admin.users.studentDetail(uid)
  if (kind === 'mentor') return ROUTES.admin.users.mentorDetail(uid)
  return ROUTES.admin.users.administratorDetail(uid)
}
