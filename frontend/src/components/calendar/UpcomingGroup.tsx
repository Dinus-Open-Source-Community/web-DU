import { MapPin, Users } from 'lucide-react'
import { MentorCalendarEvent } from './calendarUtils'
import { formatTime, formatCompactDate } from './eventUtils'
import { ClassTypeBadge } from '@/components/ui/badge'

interface UpcomingGroupProps {
  title: string
  entries: MentorCalendarEvent[]
}

export default function UpcomingGroup({ title, entries }: UpcomingGroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</h4>
        <span className="text-xs text-slate-400">{entries.length}</span>
      </div>

      {entries.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">No session</p>}

      <div className="space-y-2">
        {entries.map((event) => (
          <div key={`${title}-${event.id}-${event.start.toISOString()}`} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{formatTime(event.start)}</p>
                <p className="text-xs text-slate-500">{formatCompactDate(event.start)}</p>
              </div>
              <ClassTypeBadge classType={event.resource.classType} />
            </div>

            <h5 className="mt-2 text-sm font-semibold text-slate-900 line-clamp-2">{event.title}</h5>

            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p className="flex items-center gap-1">
                <MapPin size={13} />
                {event.resource.location}
              </p>
              <p className="flex items-center gap-1">
                <Users size={13} />
                {event.resource.studentCount} students
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
