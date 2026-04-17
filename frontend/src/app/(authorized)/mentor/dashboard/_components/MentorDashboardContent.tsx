'use client'

import { useMentorDashboard } from '@/hooks/useMentorDashboard'
import QuickStats from './QuickStats'
import CalendarView from '@/components/calendar/CalendarView'
import { PageHeader } from '@/components/layout/PageHeader'

export default function MentorDashboardContent() {
  const { stats, schedules, isLoading, isRefreshing } = useMentorDashboard()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader title="Halo Mentor Budi!" subtitle="Selamat datang di dashboard Anda." />
      <div className="mb-10">
        <QuickStats stats={stats} />
      </div>

      <div>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <p className="text-sm text-slate-500">Memuat jadwal…</p>
          </div>
        ) : (
          <>
            <CalendarView schedules={schedules} />
            {isRefreshing && <p className="mt-2 text-xs text-slate-500">Memperbarui jadwal…</p>}
          </>
        )}
      </div>
    </section>
  )
}
