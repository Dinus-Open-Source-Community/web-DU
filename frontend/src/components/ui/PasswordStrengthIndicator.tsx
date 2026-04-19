'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

interface CriteriaResult {
  label: string
  met: boolean
}

const STRENGTH_LEVELS = [
  { label: 'Sangat Lemah', color: 'bg-rose-500' },
  { label: 'Lemah', color: 'bg-orange-500' },
  { label: 'Cukup', color: 'bg-amber-500' },
  { label: 'Kuat', color: 'bg-emerald-500' },
  { label: 'Sangat Kuat', color: 'bg-emerald-600' },
] as const

function evaluatePassword(password: string) {
  const criteria: CriteriaResult[] = [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Huruf besar (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Huruf kecil (a-z)', met: /[a-z]/.test(password) },
    { label: 'Angka (0-9)', met: /\d/.test(password) },
    { label: 'Karakter spesial (!@#$%...)', met: /[^A-Za-z0-9]/.test(password) },
  ]

  const metCount = criteria.filter((c) => c.met).length
  const strengthIndex = Math.max(0, metCount - 1)

  return { criteria, metCount, strengthIndex }
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const { criteria, metCount, strengthIndex } = useMemo(() => evaluatePassword(password), [password])

  if (!password) return null

  const level = STRENGTH_LEVELS[strengthIndex]
  const segments = 4

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Kekuatan Password
        </span>
        <span className={cn('text-[11px] font-bold', strengthIndex >= 3 ? 'text-emerald-600' : strengthIndex >= 2 ? 'text-amber-600' : 'text-rose-500')}>
          {level.label}
        </span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full transition-all duration-300 ease-out', i < metCount ? level.color : 'bg-transparent')}
              style={{ width: i < metCount ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-1">
        {criteria.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            {c.met ? (
              <Check className="size-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            ) : (
              <X className="size-3.5 shrink-0 text-slate-300" strokeWidth={2.5} />
            )}
            <span className={cn('text-xs', c.met ? 'font-medium text-slate-700' : 'text-slate-400')}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
