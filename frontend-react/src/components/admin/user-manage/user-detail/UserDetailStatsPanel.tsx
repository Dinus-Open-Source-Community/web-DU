import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import type { ManagedUserDetailStat } from '@/lib/user-manage/user-detail-types'

type UserDetailStatsPanelProps = {
  stats: ManagedUserDetailStat[]
}

export function UserDetailStatsPanel({ stats }: UserDetailStatsPanelProps) {
  return (
    <section className={userDetailLayout.statsGrid} aria-label="Ringkasan aktivitas user">
      {stats.map((stat) => (
        <div key={stat.id}>
          <p className={userDetailLayout.statLabel}>{stat.label}</p>
          <p className={userDetailLayout.statValue}>{stat.value}</p>
        </div>
      ))}
    </section>
  )
}
