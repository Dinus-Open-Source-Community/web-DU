import type { RecentEnrollment } from '@/services/admin-dashboard-analytics'
import { UserPlus } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { id } from 'date-fns/locale'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

function formatEnrollDate(rawDate?: string) {
  if (!rawDate) return '-'
  try {
    const d = parseISO(rawDate)
    if (!isValid(d)) return rawDate
    return format(d, 'd MMM yyyy', { locale: id })
  } catch {
    return rawDate
  }
}

interface RecentEnrollmentsProps {
  enrollments?: RecentEnrollment[]
  isLoading?: boolean
}

export function RecentEnrollmentsCard({ enrollments, isLoading }: RecentEnrollmentsProps) {
  if (isLoading) {
    return (
      <div className={cn(appCardClassName, 'p-4 sm:p-6')}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-44 rounded bg-line-light" />
          <div className="h-3.5 w-60 rounded bg-line-light" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-paper-panel" />
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
            <UserPlus className="size-4 text-ink-400" aria-hidden="true" />
            Pendaftaran Terbaru
          </div>
          <p className="text-xs font-medium text-ink-500 mt-1 leading-relaxed">
            Siswa yang baru saja mendaftar kursus di platform
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line-light bg-paper-white hidden md:block">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom min-w-[540px] text-left text-sm">
            <thead>
              <tr className="border-b border-line-light text-ink-500">
                <th className="h-9 text-left align-middle whitespace-nowrap w-[35%] px-4 py-2 text-xs font-medium text-ink-500">
                  Siswa
                </th>
                <th className="h-9 text-left align-middle whitespace-nowrap w-[45%] px-4 py-2 text-xs font-medium text-ink-500">
                  Kursus
                </th>
                <th className="h-9 text-right align-middle whitespace-nowrap w-[20%] px-4 py-2 text-xs font-medium text-ink-500">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {!enrollments || enrollments.length === 0 ? (
                <tr className="border-b border-line-light">
                  <td colSpan={3} className="px-5 py-6 text-center text-xs font-medium text-ink-500">
                    Tidak ada pendaftaran terbaru
                  </td>
                </tr>
              ) : (
                enrollments.map((enroll, idx) => (
                  <tr key={idx} className="border-b border-line-light transition-colors hover:bg-paper-paper/40">
                    <td className="px-4 py-3 align-middle">
                      <p className="font-medium text-ink-900">{enroll.student_name}</p>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-xs text-ink-700 truncate max-w-[240px]">{enroll.course_name}</p>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <p className="text-xs text-ink-500 tabular-nums">{formatEnrollDate(enroll.enrolled_at)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <ul className="flex flex-col divide-y divide-line-light md:hidden">
        {!enrollments || enrollments.length === 0 ? (
          <li className="py-6 text-center text-xs font-medium text-ink-500">
            Tidak ada pendaftaran terbaru
          </li>
        ) : (
          enrollments.map((enroll, idx) => (
            <li key={idx} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900 truncate">{enroll.student_name}</p>
                  <p className="text-xs text-ink-500 truncate">{enroll.course_name}</p>
                </div>
                <span className="text-xs text-ink-500 tabular-nums shrink-0">
                  {formatEnrollDate(enroll.enrolled_at)}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
