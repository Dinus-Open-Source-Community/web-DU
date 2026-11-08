import { useEffect, useState } from 'react'
import { AlertTriangle, Check, UserCog } from 'lucide-react'

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
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-2 border-ink-900/10 bg-paper-white p-0 text-ink-900 shadow-paper ring-0 sm:max-w-lg">
        <DialogHeader className="border-b border-line-light bg-paper-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ink-900/10 bg-brand-soft text-brand-ink">
              <UserCog className="size-4" aria-hidden />
            </span>
            <DialogTitle className="text-lg font-bold tracking-tight text-ink-900">
              Ubah Role Pengguna
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium leading-relaxed text-ink-500">
            Pilih role baru untuk akun ini. Perubahan berlaku segera setelah disimpan.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-5 bg-paper-white px-6 py-5">
            <div className="rounded-xl border-2 border-ink-900/10 bg-paper-paper px-4 py-3">
              <UserIdentityCell
                name={user.name}
                email={user.email}
                avatar={user.avatar}
                meta={user.roleLabel ? `Role saat ini: ${user.roleLabel}` : undefined}
              />
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Role Tujuan
              </p>
              <div className="space-y-2.5">
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
                          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border-2 shadow-none transition-all',
                          selected
                            ? 'border-ink-900/10 bg-primary text-white'
                            : 'border-line-medium bg-paper-white text-transparent',
                        )}
                      >
                        <Check className={cn('size-3.5 stroke-[2.5]', selected ? 'opacity-100' : 'opacity-0')} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink-900">
                          {ROLE_LABELS[role]}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium leading-relaxed text-ink-500">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedRole === 'admin' ? (
              <div className="flex items-start gap-3 rounded-xl border-2 border-ink-900/10 border-l-4 border-l-note-peach bg-note-yellow/45 px-4 py-3 text-xs font-medium leading-relaxed text-ink-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ink-900" aria-hidden />
                <p>
                  Hanya <strong className="font-bold text-ink-900">Super Admin</strong> yang dapat
                  menetapkan role administrator. Jika Anda bukan Super Admin, permintaan ini akan
                  ditolak oleh sistem.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="border-t border-line-light bg-paper-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-sm border-2 border-ink-900/10 bg-paper-white px-5 font-semibold text-ink-700 shadow-none hover:bg-paper-paper hover:text-ink-900"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-11 shrink-0 gap-2 rounded-sm border-2 border-ink-900/10 bg-primary px-5 font-semibold text-white shadow-none hover:bg-brand-hover"
            onClick={() => void handleConfirm()}
            disabled={!user || !selectedRole || isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
