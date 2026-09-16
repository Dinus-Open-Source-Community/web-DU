import { Link } from 'react-router-dom'
import { Trash2, UserCog } from 'lucide-react'

import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { UserStatusBadge } from '@/components/admin/user-manage/UserStatusBadge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import type { ManagedUserRow } from '@/lib/user-manage/view-models'
import { formatLearningProgressLabel, toLearningProgressPercent } from '@/lib/learning/progress'

type BuildColumnsOptions = {
  kind: UserManageKind
  detailPath: (uid: string) => string
  onChangeRole: (user: ManagedUserRow) => void
  onDelete: (user: ManagedUserRow) => void
  disabled?: boolean
}

function ProgressCell({ value }: { value: number }) {
  const progressPercent = toLearningProgressPercent(value)
  return (
    <div className="flex min-w-[120px] flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground tabular-nums">{formatLearningProgressLabel(value)}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
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
      id: 'status',
      header: 'Status',
      cell: (row: ManagedUserRow) => <UserStatusBadge status={row.status} />,
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
            id: 'progress',
            header: 'Progres rata-rata',
            cell: (row: ManagedUserRow) => <ProgressCell value={row.averageProgress ?? 0} />,
          },
        ]
      : kind === 'mentor'
        ? [
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
          {
            id: 'lastActive',
            header: 'Terakhir aktif',
            cell: (row: ManagedUserRow) => (
              <span className="text-muted-foreground">{row.lastActive ?? '-'}</span>
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
          className="h-8 rounded-sm px-3 text-xs font-semibold"
          asChild
        >
          <Link to={detailPath(row.uid)}>Detail</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-sm px-3 text-xs font-semibold"
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
          className="h-8 rounded-sm px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
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
