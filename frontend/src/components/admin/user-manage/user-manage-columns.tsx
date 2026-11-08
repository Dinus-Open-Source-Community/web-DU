import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, UserCog } from 'lucide-react'

import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { UserStatusBadge } from '@/components/admin/user-manage/UserStatusBadge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import {
  getUserManageColumnSpecs,
  type UserManageColumnId,
} from '@/lib/user-manage/table-columns'
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
  const cells: Record<UserManageColumnId, (row: ManagedUserRow) => ReactNode> = {
    user: (row) => (
      <UserIdentityCell
        name={row.name}
        email={row.email}
        avatar={row.avatar}
        meta={row.roleLabel}
      />
    ),
    verified: (row) => <UserStatusBadge isVerified={row.isVerified} />,
    courses: (row) => (
      <span className="tabular-nums text-foreground">{row.enrolledCourses ?? 0}</span>
    ),
    joined: (row) => <span className="text-muted-foreground">{row.joinedAt}</span>,
    actions: (row) => (
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

  return getUserManageColumnSpecs(kind).map((spec) => ({
    id: spec.id,
    header: spec.header,
    align: spec.align,
    cell: cells[spec.id],
  }))
}

export function getUserDetailPath(kind: UserManageKind, uid: string) {
  if (kind === 'student') return ROUTES.admin.users.studentDetail(uid)
  if (kind === 'mentor') return ROUTES.admin.users.mentorDetail(uid)
  return ROUTES.admin.users.administratorDetail(uid)
}
