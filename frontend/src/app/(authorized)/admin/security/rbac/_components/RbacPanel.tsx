'use client'

import { useState } from 'react'
import { Check, Plus, Shield, ShieldCheck, Users2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { listPermissionGroups, listRoles } from '@/lib/data/repository'
import type { AdminRole } from '@/lib/types'

export function RbacPanel() {
  const roles = listRoles()
  const permissionGroups = listPermissionGroups()
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0].uid)
  const role = roles.find((r) => r.uid === selectedRoleId) ?? roles[0]

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Roles</h2>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Tambah Role
          </Button>
        </div>

        <ul className="flex flex-col gap-2">
          {roles.map((r) => (
            <li key={r.uid}>
              <RoleButton
                role={r}
                active={r.uid === selectedRoleId}
                onSelect={() => setSelectedRoleId(r.uid)}
              />
            </li>
          ))}
        </ul>
      </aside>

      <PermissionsMatrix role={role} />
    </section>
  )
}

function RoleButton({
  role,
  active,
  onSelect,
}: {
  role: AdminRole
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors',
        active
          ? 'border-primary/40 bg-primary/5'
          : 'border-slate-200/80 bg-white hover:border-slate-300/90'
      )}>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
        )}>
        <Shield className="h-4 w-4" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">{role.name}</span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Users2 className="h-3 w-3" aria-hidden />
            {role.membersCount}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-slate-500">{role.description}</p>
      </div>
    </button>
  )
}

function PermissionsMatrix({ role }: { role: AdminRole }) {
  const permissionGroups = listPermissionGroups()
  const has = (perm: string) => role.permissions.includes(perm)

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              {role.name}
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">{role.description}</p>
        </div>
        <Button size="sm" className="h-9 rounded-xl">
          Simpan perubahan
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {permissionGroups.map((group) => (
          <div
            key={group.group}
            className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.group}
              </h3>
              <span className="text-[10px] font-medium text-slate-400">
                {group.items.filter(has).length}/{group.items.length}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {group.items.map((perm) => (
                <li
                  key={perm}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                  <label
                    htmlFor={`perm-${perm}`}
                    className="flex-1 cursor-pointer truncate font-mono text-xs text-slate-700">
                    {perm}
                  </label>
                  <Checkbox
                    id={`perm-${perm}`}
                    checked={has(perm)}
                    onCheckedChange={() => {
                      /* Read-only display for fixture data */
                    }}
                  />
                  {has(perm) && (
                    <Check className="hidden h-3 w-3 text-emerald-500" aria-hidden />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
