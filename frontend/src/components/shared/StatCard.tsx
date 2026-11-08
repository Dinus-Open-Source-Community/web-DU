import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { appCardClassName, appKpiLabelClassName, appKpiValueClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '../../lib/utils'
import { FormatTrend } from '../../lib/func/func'

const statCardShellVariants = cva('flex items-center justify-between', {
  variants: {
    variant: {
      default: cn(appCardClassName, 'mt-5 h-32 w-72 p-6'),
      compact: cn(appCardClassName, 'p-6 shadow-sm'),
      legacy: 'mt-5 h-32 w-72 rounded-2xl border border-gray-400 bg-white p-6',
      kpi: 'w-full flex-col items-start gap-2.5 rounded-xl border border-line-light bg-paper-white p-4.5',
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
})

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
  /** Garis aksen kiri (varian kpi) — menggantikan ikon dekoratif di kartu metrik. */
  accentClassName?: string
} & VariantProps<typeof statCardShellVariants>

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
  accentClassName,
}: StatCardProps) {
  const displayLabel = label || title

  if (variant === 'kpi') {
    const direction: TrendDirection = trendDirection ?? (trendValue === undefined || trendValue === 0 ? 'neutral' : trendValue > 0 ? 'up' : 'down')

    const trendValueClass =
      direction === 'up'
        ? 'font-semibold tabular-nums text-emerald-700'
        : direction === 'down'
          ? 'font-semibold tabular-nums text-rose-700'
          : 'font-semibold tabular-nums text-ink-500'

    const trendText = FormatTrend(trendValue)

    return (
      <div
        className={cn(
          statCardShellVariants({ variant, size: undefined }),
          accentClassName && 'border-l-4',
          accentClassName,
          className,
        )}
      >
        <div className="flex w-full flex-col gap-1">
          <span className={appKpiLabelClassName}>{displayLabel}</span>
          <span className={appKpiValueClassName}>{value}</span>
        </div>

        {(trendText || trendLabel) && (
          <p className="text-xs leading-relaxed text-ink-500">
            {trendText ? <span className={trendValueClass}>{trendText}</span> : null}
            {trendText && trendLabel ? <span className="text-ink-400"> · </span> : null}
            {trendLabel ? <span>{trendLabel}</span> : null}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn(statCardShellVariants({ variant, size }), 'shadow-sm', className)}>
      <div className="flex flex-col">
        <span className={cn('mb-1 font-semibold uppercase tracking-wider', variant === 'legacy' ? 'text-lg text-muted-foreground' : 'text-xs text-ink-500')}>{displayLabel}</span>
        <span className={cn('font-bold', variant === 'legacy' ? 'text-xl text-foreground' : 'text-2xl text-ink-900')}>{value}</span>
      </div>
      {icon && <div className={cn('flex shrink-0 items-center justify-center rounded-xl', variant === 'legacy' ? `p-2 bg-blue-100 ${themeIcon}` : `h-11 w-11 bg-primary/10 text-primary`)}>{icon}</div>}
    </div>
  )
}
