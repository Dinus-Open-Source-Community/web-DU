import { MapPin, Users } from 'lucide-react'
import { ClassTypeBadge } from '@/components/ui/badge'
import { formatTime, type MentorCalendarEvent } from '@/lib/func/calendar'
import { mentorCalendarLayout } from '@/lib/layout/mentor-calendar-layout'

interface UpcomingGroupProps {
  title: string
  entries: MentorCalendarEvent[]
}

export default function UpcomingGroup({ title, entries }: UpcomingGroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-500">{title}</h4>
        <span className="text-xs text-ink-400">{entries.length}</span>
      </div>

      {entries.length === 0 && <p className="rounded-lg border border-dashed border-line-light px-3 py-2 text-xs text-ink-400">Tidak ada sesi</p>}

      <div className="space-y-2">
        {entries.map((event) => (
          <div key={`${title}-${event.id}-${event.start.toISOString()}`} className={mentorCalendarLayout.eventCard}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink-900">{formatTime(event.start)}</p>
              </div>
              <ClassTypeBadge classType={event.resource.classType} />
            </div>

            <h5 className="mt-2 text-sm font-semibold text-ink-900 line-clamp-2">{event.title}</h5>

            <div className="mt-3  flex gap-2 items-center justify-start text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {event.resource.location}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {event.resource.studentCount} siswa
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
