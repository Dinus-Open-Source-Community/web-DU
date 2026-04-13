'use client'

import { useMentorDashboard } from '@/hooks/useMentorDashboard'
import { Bolt, NotebookPen } from 'lucide-react'
import QuickStats from './QuickStats'
import CalendarView from '@/components/calendar/CalendarView'
import RecentSubmissions from './RecentSubmissions'
import QuickActions from './QuickActions'

export default function MentorDashboardContent() {
  const { stats, schedules, submissions, isLoading, isRefreshing } = useMentorDashboard()

  return (
    <section className="pt-10 px-8 pb-12">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Welcome back, Mentor</h1>
        <p className="text-on-surface-variant mt-1">Here&apos;s an overview of your teaching activities.</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-10">
        <QuickStats stats={stats} />
      </div>

      {/* Calendar View */}
      <div className="mb-10">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <p className="text-sm text-slate-500">Loading calendar events...</p>
          </div>
        ) : (
          <>
            <CalendarView schedules={schedules} />
            {isRefreshing && <p className="mt-2 text-xs text-slate-500">Refreshing latest events...</p>}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
          <Bolt size={20} className="text-primary" />
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Recent Submissions */}
      <div>
        <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
          <NotebookPen size={20} className="text-primary" />
          Recent Submissions
        </h2>
        <RecentSubmissions submissions={submissions.slice(0, 6)} />
      </div>
    </section>
  )
}
