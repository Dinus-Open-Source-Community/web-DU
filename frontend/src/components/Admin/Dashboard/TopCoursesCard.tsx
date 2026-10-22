import type { TopCourse } from '@/services/admin-dashboard-analytics'
import { GraduationCap } from 'lucide-react'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

interface TopCoursesProps {
  courses?: TopCourse[]
  isLoading?: boolean
}

export function TopCoursesCard({ courses, isLoading }: TopCoursesProps) {
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
            <GraduationCap className="size-4 text-ink-400" aria-hidden="true" />
            Kursus Top Enrollment
          </div>
          <p className="text-xs font-medium text-ink-500 mt-1 leading-relaxed">
            Kursus dengan jumlah siswa terbanyak dan tingkat penyelesaian
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line-light bg-paper-white hidden md:block">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom min-w-[540px] text-left text-sm">
            <thead>
              <tr className="border-b border-line-light text-ink-500">
                <th className="h-9 text-left align-middle whitespace-nowrap w-[46%] px-4 py-2 text-xs font-medium text-ink-500">
                  Kursus
                </th>
                <th className="h-9 text-right align-middle whitespace-nowrap w-[18%] px-4 py-2 text-xs font-medium text-ink-500">
                  Siswa
                </th>
                <th className="h-9 text-right align-middle whitespace-nowrap w-[18%] px-4 py-2 text-xs font-medium text-ink-500">
                  Selesai
                </th>
                <th className="h-9 text-right align-middle whitespace-nowrap w-[18%] px-4 py-2 text-xs font-medium text-ink-500">
                  Tingkat selesai
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {!courses || courses.length === 0 ? (
                <tr className="border-b border-line-light">
                  <td colSpan={4} className="px-5 py-6 text-center text-xs font-medium text-ink-500">
                    Tidak ada data kursus
                  </td>
                </tr>
              ) : (
                courses.map((course, idx) => (
                  <tr key={idx} className="border-b border-line-light transition-colors hover:bg-paper-paper/40">
                    <td className="px-4 py-3 align-middle">
                      <p className="font-medium text-ink-900 truncate max-w-[260px]">{course.course_name}</p>
                    </td>
                    <td className="px-4 py-3 align-middle text-right text-xs font-medium tabular-nums text-ink-600">
                      {course.students}
                    </td>
                    <td className="px-4 py-3 align-middle text-right text-xs font-medium tabular-nums text-ink-600">
                      {course.completed}
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <span className="text-xs font-semibold tabular-nums text-ink-900">
                        {course.completion_rate}%
                      </span>
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
        {!courses || courses.length === 0 ? (
          <li className="py-6 text-center text-xs font-medium text-ink-500">
            Tidak ada data kursus
          </li>
        ) : (
          courses.map((course, idx) => (
            <li key={idx} className="py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">{course.course_name}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-ink-500">Siswa:</span>{' '}
                    <span className="font-medium tabular-nums text-ink-700">{course.students}</span>
                  </div>
                  <div>
                    <span className="text-ink-500">Selesai:</span>{' '}
                    <span className="font-medium tabular-nums text-ink-700">{course.completed}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-500">Selesai:</span>{' '}
                    <span className="font-semibold tabular-nums text-ink-900">{course.completion_rate}%</span>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
