import type { MentorActivity } from '@/services/admin-dashboard-analytics'
import { UserCheck } from 'lucide-react'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

interface MentorActivityProps {
  mentors?: MentorActivity[]
  isLoading?: boolean
}

export function MentorActivityCard({ mentors, isLoading }: MentorActivityProps) {
  if (isLoading) {
    return (
      <div className={cn(appCardClassName, 'p-4 sm:p-6')}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-44 rounded bg-line-light" />
          <div className="h-3.5 w-60 rounded bg-line-light" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-paper-panel" />
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
            <UserCheck className="size-4 text-ink-400" aria-hidden="true" />
            Mentor Paling Aktif
          </div>
          <p className="text-xs font-medium text-ink-500 mt-1 leading-relaxed">
            Top mentors berdasarkan jumlah kursus yang dibimbing
          </p>
        </div>
      </div>

      <div className="divide-y divide-line-light">
        {!mentors || mentors.length === 0 ? (
          <p className="text-center py-6 text-xs font-medium text-ink-500">Tidak ada data mentor</p>
        ) : (
          mentors.map((mentor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-ink-900 truncate">{mentor.mentor_name}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {mentor.students} siswa dibimbing
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold tabular-nums text-ink-900">{mentor.courses}</span>
                <span className="ml-1 text-xs text-ink-500">kursus</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
