import { useEffect, useState } from 'react'
import { AlertTriangle, UserCog } from 'lucide-react'

import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { userManageLayout } from '@/lib/user-manage/layout'
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from '@/lib/user-manage/page-config'
import type { AssignableUserRole } from '@/lib/user-manage/types'
import type { ManagedUserRow } from '@/lib/user-manage/view-models'
import { cn } from '@/lib/utils'

type UserManageRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ManagedUserRow | null
  roleTargets: AssignableUserRole[]
  onConfirm: (uid: string, role: AssignableUserRole) => Promise<void>
  isSubmitting?: boolean
}

export function UserManageRoleDialog({
  open,
  onOpenChange,
  user,
  roleTargets,
  onConfirm,
  isSubmitting = false,
}: UserManageRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AssignableUserRole | null>(null)

  useEffect(() => {
    if (!open) return
    setSelectedRole(roleTargets[0] ?? null)
  }, [open, roleTargets])

  const handleConfirm = async () => {
    if (!user || !selectedRole) return
    await onConfirm(user.uid, selectedRole)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserCog className="size-5 text-primary" aria-hidden />
            Ubah role user
          </DialogTitle>
          <DialogDescription>
            Pilih role baru untuk akun ini. Perubahan berlaku segera setelah disimpan.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-5 px-6 py-5">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3">
              <UserIdentityCell
                name={user.name}
                email={user.email}
                avatar={user.avatar}
                meta={user.roleLabel ? `Role saat ini: ${user.roleLabel}` : undefined}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Role tujuan</p>
              <div className="space-y-2">
                {roleTargets.map((role) => {
                  const selected = selectedRole === role
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        userManageLayout.roleOption,
                        selected ? userManageLayout.roleOptionActive : userManageLayout.roleOptionIdle,
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                          selected ? 'border-primary bg-primary' : 'border-slate-300 bg-white',
                        )}
                      >
                        {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">
                          {ROLE_LABELS[role]}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedRole === 'admin' ? (
              <div className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>
                  Hanya super admin yang dapat menetapkan role administrator. Jika Anda bukan super
                  admin, permintaan ini akan ditolak oleh sistem.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl"
            onClick={() => void handleConfirm()}
            disabled={!user || !selectedRole || isSubmitting}
          >
            Simpan perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
