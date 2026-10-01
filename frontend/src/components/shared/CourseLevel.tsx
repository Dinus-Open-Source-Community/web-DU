import type { CourseApiLevel } from '@/lib/types/user'
import type { JoinedCourse } from '@/lib/types/user'
import { apiLevelToUi } from '@/lib/course-form/level'
import { cn } from '@/lib/utils'

function parseApiLevel(level?: string): CourseApiLevel | null {
  const upper = level?.trim().toUpperCase()
  if (upper === 'PEMULA' || upper === 'MENENGAH' || upper === 'LANJUTAN') return upper
  return null
}

const LEVEL_ACCENT: Record<CourseApiLevel, string> = {
  PEMULA: 'border-l-emerald-500',
  MENENGAH: 'border-l-sky-500',
  LANJUTAN: 'border-l-violet-500',
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
    return <span className="text-xs text-slate-400">-</span>
  }

  const label = apiLevelToUi(apiLevel)
  const accent = LEVEL_ACCENT[apiLevel]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border border-ink-900/10 border-l-[3px] bg-paper-paper/90 px-2.5 py-1',
        accent,
        className,
      )}
    >
      {!compact ? (
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Level</span>
      ) : null}
      <span className="text-xs font-semibold text-ink-800">{label}</span>
    </span>
  )
}

/** @deprecated Gunakan `CourseLevelLabel` — nama lama, tampilan sudah bukan sinyal. */
export const CourseLevelSignal = CourseLevelLabel
