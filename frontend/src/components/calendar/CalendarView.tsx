'use client'

import { useMemo, useState } from 'react'
import { IScheduleItem } from '@/lib/types'
import { convertScheduleToCalendarEvents, normalizeCalendarEvents, sortCalendarEvents } from './calendarUtils'
import { CalendarClassFilter, CalendarViewMode } from './types'
import { addDays, addMonths, buildRangeLabel } from './dateUtils'
import { groupUpcomingEvents } from './eventUtils'
import CalendarToolbar from './CalendarToolbar'
import CalendarMainViews from './CalendarMainViews'
import UpcomingSessionsAside from './UpcomingSessionsAside'

interface CalendarViewProps {
  schedules: IScheduleItem[]
}

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

  const rangeLabel = useMemo(() => buildRangeLabel(cursorDate, viewMode), [cursorDate, viewMode])

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

  return (
    <section className="space-y-6">
      <CalendarToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        rangeLabel={rangeLabel}
        onPrev={() => moveCursor(-1)}
        onNext={() => moveCursor(1)}
        onToday={() => setCursorDate(new Date())}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CalendarMainViews viewMode={viewMode} cursorDate={cursorDate} events={filteredEvents} />
        </div>

        <UpcomingSessionsAside groups={upcomingGroups} />
      </div>
    </section>
  )
}
