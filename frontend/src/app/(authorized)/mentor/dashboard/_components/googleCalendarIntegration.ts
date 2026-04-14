'use client'

import React, { useMemo } from 'react'
import { IScheduleItem } from '@/lib/types'
import { convertScheduleToCalendarEvents } from '@/components/calendar/calendarUtils'

/**
 * Google Calendar Integration Hook
 *
 * Flow:
 * 1. User clicks "Sync with Google" button
 * 2. Triggers Google OAuth login
 * 3. Fetch events from mentee's primary calendar
 * 4. Merge with local schedule data
 * 5. Display in calendar view with sync indicator
 *
 * Setup requirements:
 * - Google Cloud Console project created
 * - Google Calendar API enabled
 * - OAuth 2.0 Client ID created (Web app)
 * - @react-oauth/google installed
 * - Environment variables set (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
 */

interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime: string }
  end: { dateTime: string }
  location?: string
}

interface GoogleCalendarConfig {
  clientId: string
  apiKey: string
  scopes: string[]
}

const GOOGLE_CALENDAR_CONFIG: GoogleCalendarConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
  scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
}

/**
 * Convert Google Calendar event to internal calendar event format
 */
const convertGoogleCalendarEvent = (gcEvent: GoogleCalendarEvent) => {
  return {
    id: gcEvent.id,
    title: gcEvent.summary,
    start: new Date(gcEvent.start.dateTime),
    end: new Date(gcEvent.end.dateTime),
    resource: {
      courseId: gcEvent.id,
      courseName: gcEvent.summary,
      classType: (gcEvent.location?.includes('Zoom') ? 'online' : 'offline') as 'online' | 'offline',
      location: gcEvent.location || 'TBD',
      studentCount: 0,
      description: gcEvent.description,
    },
  }
}

/**
 * Initialize Google Calendar API
 */
const initGoogleCalendarAPI = async () => {
  return new Promise((resolve) => {
    // Load Google API script
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      // @ts-ignore
      gapi.load('client:auth2', () => {
        // @ts-ignore
        gapi.client
          .init({
            apiKey: GOOGLE_CALENDAR_CONFIG.apiKey,
            clientId: GOOGLE_CALENDAR_CONFIG.clientId,
            scope: GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          })
          .then(() => {
            resolve(true)
          })
          .catch((err: Error) => {
            console.error('Google Calendar API init error:', err)
            resolve(false)
          })
      })
    }
    document.body.appendChild(script)
  })
}

/**
 * Fetch events from Google Calendar
 */
export const fetchGoogleCalendarEvents = async (startDate: Date, endDate: Date) => {
  try {
    const response = await (window as any).gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.result.items?.map(convertGoogleCalendarEvent) || []
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error)
    return []
  }
}

/**
 * Hook for managing Google Calendar sync
 */
export const useGoogleCalendarSync = (localSchedules: IScheduleItem[]) => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false)
  const [events, setEvents] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  // Convert local schedules to calendar events
  const localEvents = useMemo(() => convertScheduleToCalendarEvents(localSchedules), [localSchedules])

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    setIsLoading(true)
    try {
      const initialized = await initGoogleCalendarAPI()
      if (initialized) {
        // @ts-ignore
        const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()

        if (!isSignedIn) {
          // @ts-ignore
          await gapi.auth2.getAuthInstance().signIn()
        }

        // Fetch events for current month
        const startDate = new Date(2026, 3, 1)
        const endDate = new Date(2026, 4, 1)
        const googleEvents = await fetchGoogleCalendarEvents(startDate, endDate)

        // Merge local + Google events
        const merged = [...localEvents, ...googleEvents]
        setEvents(merged)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect from Google Calendar
  const disconnectGoogleCalendar = () => {
    try {
      // @ts-ignore
      gapi.auth2.getAuthInstance().signOut()
      setIsConnected(false)
      setEvents(localEvents)
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error)
    }
  }

  return {
    events: isConnected ? events : localEvents,
    isConnected,
    isLoading,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  }
}

/**
 * Create event in Google Calendar
 */
export const createGoogleCalendarEvent = async (eventData: { title: string; description?: string; startTime: Date; endTime: Date; location?: string }) => {
  try {
    const response = await (window as any).gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: { dateTime: eventData.startTime.toISOString() },
        end: { dateTime: eventData.endTime.toISOString() },
      },
    })

    return response.result
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error)
    throw error
  }
}

/**
 * Delete event from Google Calendar
 */
export const deleteGoogleCalendarEvent = async (eventId: string) => {
  try {
    await (window as any).gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId,
    })

    return true
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error)
    return false
  }
}
