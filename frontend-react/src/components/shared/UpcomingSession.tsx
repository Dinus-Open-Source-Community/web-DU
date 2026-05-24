import { UPCOMING_PANEL_HEIGHT_CLASS, type UpcomingGroups } from '@/lib/func/calendar'
import UpcomingGroup from './UpComingGroup'

interface UpcomingSessionsAsideProps {
  groups: UpcomingGroups
}

export default function UpcomingSessionsAside({ groups }: UpcomingSessionsAsideProps) {
  return (
    <aside className={`rounded-2xl shadow-md bg-white p-5 flex flex-col min-h-0 ${UPCOMING_PANEL_HEIGHT_CLASS}`}>
      <div>
        <h3 className="text-lg font-bold font-headline text-slate-900">Upcoming Sessions</h3>
        <p className="text-sm text-slate-500 mt-1">Structured timeline for today and this week.</p>
      </div>

      <div className="mt-5 space-y-5 overflow-y-auto min-h-0 pr-1">
        <UpcomingGroup title="Today" entries={groups.today} />
        <UpcomingGroup title="Tomorrow" entries={groups.tomorrow} />
        <UpcomingGroup title="This Week" entries={groups.thisWeek} />
      </div>
    </aside>
  )
}
