import { ClassType } from '@/lib/types'
import { MentorCalendarEvent } from './calendarUtils'
import { MONTH_LABELS } from './constants'
import { addDays, endOfDay, endOfWeek, isDateInRange, startOfDay } from './dateUtils'

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
