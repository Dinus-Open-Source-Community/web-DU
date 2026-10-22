import type { StudentProgressDistribution } from '@/services/admin-dashboard-analytics'
import { ChartBarIncreasing } from 'lucide-react'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

interface StudentProgressProps {
  data?: StudentProgressDistribution[]
  isLoading?: boolean
}

const STATUS_CONFIG: Record<
  string,
  { dotClass: string; barClass: string }
> = {
  'Belum mulai': {
    dotClass: 'bg-ink-400',
    barClass: 'bg-ink-400',
  },
  'Sedang berjalan': {
    dotClass: 'bg-brand-blue',
    barClass: 'bg-brand-blue',
  },
  'Hampir selesai': {
    dotClass: 'bg-amber-500',
    barClass: 'bg-amber-400',
  },
  'Selesai': {
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
  },
}

export function StudentProgressCard({ data, isLoading }: StudentProgressProps) {
  const total = data?.reduce((sum, item) => sum + item.count, 0) || 0

  if (isLoading) {
    return (
      <div className={cn(appCardClassName, 'p-4 sm:p-6')}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-44 rounded bg-line-light" />
          <div className="h-3.5 w-60 rounded bg-line-light" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-paper-panel" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(appCardClassName, 'p-4 sm:p-6')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <ChartBarIncreasing className="size-4 text-ink-400" aria-hidden="true" />
            Distribusi Progress Siswa
          </div>
          <p className="text-xs font-medium text-ink-500 mt-1 leading-relaxed">
            Status pembelajaran siswa saat ini
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!data || data.length === 0 ? (
          <p className="text-center py-6 text-xs font-medium text-ink-500">Tidak ada data</p>
        ) : (
          data.map((item, idx) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0
            const config = STATUS_CONFIG[item.status] || {
              dotClass: 'bg-ink-400',
              barClass: 'bg-brand-blue',
            }

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <div className="flex items-center gap-2 font-medium text-ink-800">
                    <span className={cn('size-1.5 rounded-full shrink-0', config.dotClass)} aria-hidden="true" />
                    <span>{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-ink-900">{item.count} <span className="font-normal text-ink-500">siswa</span></span>
                    <span className="text-ink-400">·</span>
                    <span className="text-ink-500">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full bg-paper-paper rounded-full h-1.5 overflow-hidden border border-line-light/50">
                  <div
                    className={`${config.barClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
