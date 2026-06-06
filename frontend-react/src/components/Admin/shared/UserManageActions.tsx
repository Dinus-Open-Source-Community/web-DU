import { useState } from 'react'
import { MoreHorizontal, Trash2, UserCog } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AssignableUserRole } from '@/lib/user-manage/types'

type UserManageActionsProps = {
  uid: string
  name: string
  roleTargets: AssignableUserRole[]
  onUpdateRole: (uid: string, role: AssignableUserRole) => Promise<void>
  onDeleteUser: (uid: string) => Promise<void>
  disabled?: boolean
}

const ROLE_LABELS: Record<AssignableUserRole, string> = {
  student: 'Student',
  mentor: 'Mentor',
  admin: 'Admin',
}

export function UserManageActions({
  uid,
  name,
  roleTargets,
  onUpdateRole,
  onDeleteUser,
  disabled = false,
}: UserManageActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const handleUpdateRole = async (role: AssignableUserRole) => {
    setIsBusy(true)
    try {
      await onUpdateRole(uid, role)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDelete = async () => {
    setIsBusy(true)
    try {
      await onDeleteUser(uid)
      setDeleteOpen(false)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-slate-200"
            disabled={disabled || isBusy}
            aria-label={`Kelola akun ${name}`}
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-slate-500">Kelola user</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roleTargets.map((role) => (
            <DropdownMenuItem
              key={role}
              disabled={isBusy}
              onClick={() => {
                void handleUpdateRole(role)
              }}
            >
              <UserCog className="mr-2 size-4" aria-hidden />
              Jadikan {ROLE_LABELS[role]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-rose-600 focus:text-rose-600"
            disabled={isBusy}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 size-4" aria-hidden />
            Hapus akun
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus user?"
        description={`Akun "${name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </>
  )
}
