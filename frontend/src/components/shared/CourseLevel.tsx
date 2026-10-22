import type { CourseApiLevel } from '@/lib/types/user'
import type { JoinedCourse } from '@/lib/types/user'
import { apiLevelToUi } from '@/lib/course-form/level'
import { cn } from '@/lib/utils'

function parseApiLevel(level?: string): CourseApiLevel | null {
  const upper = level?.trim().toUpperCase()
  if (upper === 'PEMULA' || upper === 'MENENGAH' || upper === 'LANJUTAN') return upper
  return null
}

type CourseLevelLabelProps = {
  level?: JoinedCourse['level'] | string
  className?: string
  /** Tanpa kata "Level" — hanya teks tingkat (ruang sempit). */
  compact?: boolean
}

/** Tampilan level kursus: label meta ber-border, bukan indikator bar/sinyal. */
export function CourseLevelLabel({ level, className, compact = false }: CourseLevelLabelProps) {
  const apiLevel = parseApiLevel(level)
  if (!apiLevel) {
    return <span className="text-xs text-ink-400">-</span>
  }

  const label = apiLevelToUi(apiLevel)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-ink-600',
        className,
      )}
    >
      {!compact ? (
        <span className="text-ink-400">Level:</span>
      ) : null}
      <span className="font-semibold text-ink-800">{label}</span>
    </span>
  )
}

/** @deprecated Gunakan `CourseLevelLabel` — nama lama, tampilan sudah bukan sinyal. */
export const CourseLevelSignal = CourseLevelLabel
