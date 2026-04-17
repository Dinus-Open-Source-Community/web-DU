import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const statCardShellVariants = cva(
  'rounded-2xl border border-slate-100 bg-white flex items-center justify-between',
  {
    variants: {
      variant: {
        default: 'w-72 h-32 p-6 mt-5',
        compact: 'p-6 shadow-2xs',
        legacy: 'w-72 h-32 p-6 mt-5 border-gray-400',
        kpi: 'w-full p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-slate-200/80 flex-col items-start gap-3',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export type TrendDirection = 'up' | 'down' | 'neutral'

export type StatCardProps = {
  title?: string
  label?: string
  value: string | number
  icon?: ReactNode
  themeIcon?: string
  colorClass?: string
  bgClass?: string
  className?: string
  /** KPI: delta dalam persen, mis. 12.4 */
  trendValue?: number
  /** Arah tren — up / down / neutral */
  trendDirection?: TrendDirection
  /** Label kecil di bawah value (hanya varian `kpi`), mis. "vs bulan lalu" */
  trendLabel?: string
} & VariantProps<typeof statCardShellVariants>

function formatTrend(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return null
  const abs = Math.abs(value)
  const rounded = abs >= 10 ? abs.toFixed(0) : abs.toFixed(1)
  return `${rounded}%`
}

export function StatCard({
  title,
  label,
  value,
  icon,
  themeIcon,
  variant,
  size,
  className,
  trendValue,
  trendDirection,
  trendLabel,
}: StatCardProps) {
  const displayLabel = label || title

  if (variant === 'kpi') {
    const direction: TrendDirection =
      trendDirection ??
      (trendValue === undefined || trendValue === 0
        ? 'neutral'
        : trendValue > 0
          ? 'up'
          : 'down')

    const trendColor =
      direction === 'up'
        ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
        : direction === 'down'
          ? 'text-rose-700 bg-rose-50 border-rose-100'
          : 'text-slate-600 bg-slate-50 border-slate-100'

    const TrendIcon =
      direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus
    const trendText = formatTrend(trendValue)

    return (
      <div className={cn(statCardShellVariants({ variant, size: undefined }), className)}>
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {displayLabel}
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
          </div>
          {icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        {(trendText || trendLabel) && (
          <div className="flex w-full items-center gap-2">
            {trendText && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold',
                  trendColor
                )}>
                <TrendIcon className="h-3.5 w-3.5" aria-hidden />
                {trendText}
              </span>
            )}
            {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(statCardShellVariants({ variant, size }), 'shadow-sm', className)}>
      <div className="flex flex-col">
        <span
          className={cn(
            'mb-1 font-semibold uppercase tracking-wider',
            variant === 'legacy' ? 'text-lg text-gray-500' : 'text-xs text-slate-400'
          )}>
          {displayLabel}
        </span>
        <span
          className={cn(
            'font-bold',
            variant === 'legacy' ? 'text-xl text-gray-800' : 'text-2xl text-slate-900'
          )}>
          {value}
        </span>
      </div>
      {icon && (
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl',
            variant === 'legacy'
              ? `p-2 bg-blue-100 ${themeIcon}`
              : `h-11 w-11 bg-primary/10 text-primary`
          )}>
          {icon}
        </div>
      )}
    </div>
  )
}
