import type { CalendarViewMode } from '@/components/shared/Calendar/View'
import type { IScheduleItem } from '../types/utils'
import type { ClassType } from '../types/course'

export type CalendarSource = 'google' | 'backend' | 'local'

export const VIEW_OPTIONS: Array<{ label: string; value: CalendarViewMode }> = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Day', value: 'day' },
  { label: 'Agenda', value: 'agenda' },
]

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Keep this fixed so aside height remains stable while content scrolls.
export const UPCOMING_PANEL_HEIGHT_CLASS = 'xl:h-[700px]'

export interface MentorCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  source: CalendarSource
  updatedAt: string
  timezone: string
  status: 'confirmed' | 'pending' | 'cancelled'
  resource: {
    courseId: string
    courseName: string
    classType: 'online' | 'offline'
    location: string
    studentCount: number
  }
}

// Backward-compatible alias for existing imports in the codebase.
export type CalendarEvent = MentorCalendarEvent

const MONTH_NAME_TO_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  januari: 0,
  feb: 1,
  february: 1,
  februari: 1,
  mar: 2,
  march: 2,
  maret: 2,
  apr: 3,
  april: 3,
  may: 4,
  mei: 4,
  jun: 5,
  june: 5,
  juni: 5,
  jul: 6,
  july: 6,
  juli: 6,
  aug: 7,
  august: 7,
  agustus: 7,
  sep: 8,
  september: 8,
  oct: 9,
  october: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
  desember: 11,
}

const parseNamedDate = (rawDate: string): Date | null => {
  const parts = rawDate.trim().split(/\s+/)
  if (parts.length < 3) {
    return null
  }

  const day = Number(parts[0])
  const monthToken = parts[1].toLowerCase()
  const year = Number(parts[2])
  const monthIndex = MONTH_NAME_TO_INDEX[monthToken]

  if (!Number.isFinite(day) || !Number.isFinite(year) || monthIndex === undefined) {
    return null
  }

  return new Date(year, monthIndex, day)
}

const parseScheduleDate = (scheduleDate: string): Date | null => {
  // Handles YYYY-MM-DD and full ISO date strings from backend payloads.
  if (/^\d{4}-\d{2}-\d{2}/.test(scheduleDate)) {
    const normalized = scheduleDate.includes('T') ? scheduleDate : `${scheduleDate}T00:00:00`
    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return parseNamedDate(scheduleDate)
}

const parseTimeParts = (rawTime: string): { hours: number; minutes: number } => {
  const [hoursRaw, minutesRaw] = rawTime.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  return {
    hours: Number.isFinite(hours) ? Math.min(Math.max(hours, 0), 23) : 0,
    minutes: Number.isFinite(minutes) ? Math.min(Math.max(minutes, 0), 59) : 0,
  }
}

const buildDateTime = (baseDate: Date, rawTime: string): Date => {
  const { hours, minutes } = parseTimeParts(rawTime)
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0, 0)
}

export const convertScheduleToCalendarEvents = (schedules: IScheduleItem[], source: CalendarSource = 'local'): MentorCalendarEvent[] => {
  return schedules.map((schedule) => {
    const parsedDate = parseScheduleDate(schedule.scheduleDate) ?? new Date()
    const start = buildDateTime(parsedDate, schedule.scheduleTime)
    const end = buildDateTime(parsedDate, schedule.endTime)

    return {
      id: schedule.uid,
      title: schedule.courseName,
      start,
      end,
      source,
      updatedAt: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      status: 'confirmed',
      resource: {
        courseId: schedule.courseId,
        courseName: schedule.courseName,
        classType: schedule.classType,
        location: schedule.location,
        studentCount: schedule.studentCount,
      },
    }
  })
}

export const sortCalendarEvents = (events: MentorCalendarEvent[]): MentorCalendarEvent[] => {
  return [...events].sort((left, right) => left.start.getTime() - right.start.getTime())
}

export const normalizeCalendarEvents = (events: MentorCalendarEvent[]): MentorCalendarEvent[] => {
  const deduped = new Map<string, MentorCalendarEvent>()

  for (const event of events) {
    const key = `${event.id}-${event.start.toISOString()}-${event.end.toISOString()}`
    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, event)
      continue
    }

    const existingUpdatedAt = Date.parse(existing.updatedAt)
    const incomingUpdatedAt = Date.parse(event.updatedAt)

    if (Number.isNaN(existingUpdatedAt) || incomingUpdatedAt > existingUpdatedAt) {
      deduped.set(key, event)
    }
  }

  return sortCalendarEvents(Array.from(deduped.values()))
}

export const isSameCalendarDay = (left: Date, right: Date): boolean => {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
export const endOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)
export const addDays = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const addMonths = (date: Date, months: number): Date => new Date(date.getFullYear(), date.getMonth() + months, 1)

export const startOfWeek = (date: Date): Date => {
  const dayIndex = date.getDay()
  return addDays(startOfDay(date), -dayIndex)
}

export const endOfWeek = (date: Date): Date => {
  return endOfDay(addDays(startOfWeek(date), 6))
}

export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
}

export const buildRangeLabel = (cursorDate: Date, mode: CalendarViewMode): string => {
  if (mode === 'month') {
    return `${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
  }

  if (mode === 'day') {
    return `${WEEKDAY_LABELS[cursorDate.getDay()]}, ${cursorDate.getDate()} ${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
  }

  const weekStart = startOfWeek(cursorDate)
  const weekEnd = addDays(weekStart, 6)

  if (mode === 'agenda') {
    const agendaEnd = addDays(startOfDay(cursorDate), 13)
    return `${cursorDate.getDate()} ${MONTH_LABELS[cursorDate.getMonth()]} - ${agendaEnd.getDate()} ${MONTH_LABELS[agendaEnd.getMonth()]} ${agendaEnd.getFullYear()}`
  }

  return `${weekStart.getDate()} ${MONTH_LABELS[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_LABELS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
}

export interface UpcomingGroups {
  today: MentorCalendarEvent[]
  tomorrow: MentorCalendarEvent[]
  thisWeek: MentorCalendarEvent[]
}

export const formatTime = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const formatCompactDate = (date: Date): string => {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`
}

export const getTypeStyles = (classType: ClassType): string => {
  return classType === 'online' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
}

export const groupUpcomingEvents = (events: MentorCalendarEvent[]): UpcomingGroups => {
  const now = new Date()
  const todayStart = startOfDay(now)
  const tomorrowStart = addDays(todayStart, 1)
  const nextDayStart = addDays(todayStart, 2)
  const weekEnd = endOfWeek(now)

  const upcoming = events.filter((event) => event.start.getTime() >= now.getTime())

  return {
    today: upcoming.filter((event) => isDateInRange(event.start, todayStart, endOfDay(todayStart))),
    tomorrow: upcoming.filter((event) => isDateInRange(event.start, tomorrowStart, endOfDay(tomorrowStart))),
    thisWeek: upcoming.filter((event) => isDateInRange(event.start, nextDayStart, weekEnd)),
  }
}
