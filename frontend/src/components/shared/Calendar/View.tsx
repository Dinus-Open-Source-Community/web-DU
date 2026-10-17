import { useMemo, useState } from 'react'
import type { IScheduleItem } from '@/lib/types/utils'
import type { ClassType } from '@/lib/types/course'
import {
  addDays,
  addMonths,
  convertScheduleToCalendarEvents,
  groupUpcomingEvents,
  normalizeCalendarEvents,
  sortCalendarEvents,
} from '@/lib/func/calendar'
import { CalendarControls } from '@/components/shared/Calendar/CalendarControls'
import CalendarMainViews from './MainViews'
import UpcomingSessionsAside from '../UpcomingSession'

interface CalendarViewProps {
  schedules: IScheduleItem[]
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'
export type CalendarClassFilter = 'all' | ClassType

export default function CalendarView({ schedules }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [cursorDate, setCursorDate] = useState(new Date())
  const [classFilter, setClassFilter] = useState<CalendarClassFilter>('all')

  const events = useMemo(() => {
    return normalizeCalendarEvents(convertScheduleToCalendarEvents(schedules, 'backend'))
  }, [schedules])

  const filteredEvents = useMemo(() => {
    const source = classFilter === 'all' ? events : events.filter((event) => event.resource.classType === classFilter)
    return sortCalendarEvents(source)
  }, [classFilter, events])

  const upcomingGroups = useMemo(() => {
    return groupUpcomingEvents(filteredEvents)
  }, [filteredEvents])

  const moveCursor = (direction: 1 | -1) => {
    if (viewMode === 'month') {
      setCursorDate(addMonths(cursorDate, direction))
      return
    }

    if (viewMode === 'day') {
      setCursorDate(addDays(cursorDate, direction))
      return
    }

    setCursorDate(addDays(cursorDate, direction * 7))
  }

  const onToday = () => setCursorDate(new Date())

  return (
    <section className="flex flex-col gap-4">
      <CalendarControls
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        cursorDate={cursorDate}
        onPrevious={() => moveCursor(-1)}
        onNext={() => moveCursor(1)}
        onToday={onToday}
        onPickDate={setCursorDate}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="min-w-0 lg:col-span-2">
          <CalendarMainViews viewMode={viewMode} cursorDate={cursorDate} events={filteredEvents} />
        </div>

        <UpcomingSessionsAside groups={upcomingGroups} />
      </div>
    </section>
  )
}
