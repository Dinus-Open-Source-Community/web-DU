import { UPCOMING_PANEL_HEIGHT_CLASS, type UpcomingGroups } from '@/lib/func/calendar'
import { mentorCalendarLayout } from '@/lib/layout/mentor-calendar-layout'
import { cn } from '@/lib/utils'
import UpcomingGroup from './UpComingGroup'

interface UpcomingSessionsAsideProps {
  groups: UpcomingGroups
}

export default function UpcomingSessionsAside({ groups }: UpcomingSessionsAsideProps) {
  return (
    <aside className={cn(mentorCalendarLayout.aside, UPCOMING_PANEL_HEIGHT_CLASS)}>
      <div>
        <h3 className="text-lg font-bold font-headline text-ink-900">Sesi Mendatang</h3>
        <p className="mt-1 text-sm font-medium text-ink-500">Timeline hari ini dan minggu ini.</p>
      </div>

      <div className="mt-5 min-h-0 space-y-5 overflow-y-auto pr-1">
        <UpcomingGroup title="Hari ini" entries={groups.today} />
        <UpcomingGroup title="Besok" entries={groups.tomorrow} />
        <UpcomingGroup title="Minggu ini" entries={groups.thisWeek} />
      </div>
    </aside>
  )
}