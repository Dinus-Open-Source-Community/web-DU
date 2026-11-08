import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import type { ManagedUserDetailStat } from '@/lib/user-manage/user-detail-types'
import { cn } from '@/lib/utils'

const STAT_ACCENT_CLASSES = [
  'border-l-brand-blue',
  'border-l-note-mint',
  'border-l-note-yellow',
  'border-l-note-sky',
  'border-l-note-lavender',
] as const

type UserDetailStatsPanelProps = {
  stats: ManagedUserDetailStat[]
}

export function UserDetailStatsPanel({ stats }: UserDetailStatsPanelProps) {
  if (stats.length === 0) return null

  return (
    <section className={userDetailLayout.statsGrid} aria-label="Ringkasan aktivitas user">
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className={cn(
            userDetailLayout.statCard,
            STAT_ACCENT_CLASSES[index % STAT_ACCENT_CLASSES.length],
          )}
        >
          <p className={userDetailLayout.statLabel}>{stat.label}</p>
          <p className={userDetailLayout.statValue}>{stat.value}</p>
        </div>
      ))}
    </section>
  )
}
