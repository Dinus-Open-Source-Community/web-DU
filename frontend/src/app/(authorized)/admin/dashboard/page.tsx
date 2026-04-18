import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ChartCard } from '@/components/charts/ChartCard'
import { NewUsersBarChart } from '@/components/charts/NewUsersBarChart'
import { RevenueLineChart } from '@/components/charts/RevenueLineChart'
import { TopCoursesChart } from '@/components/charts/TopCoursesChart'
import {
  getNewUsersWeek,
  getRevenueLine30d,
  getTopCoursesByEnrolment,
} from '@/lib/data/repository'

import { KpiGrid } from './_components/KpiGrid'
import { RecentTransactions } from './_components/RecentTransactions'
import { UnresolvedTickets } from './_components/UnresolvedTickets'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
  description: 'Ringkasan aktivitas platform.',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  const revenueLine30d = getRevenueLine30d()
  const newUsersWeek = getNewUsersWeek()
  const topCoursesByEnrolment = getTopCoursesByEnrolment()

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Welcome back, Admin"
        subtitle="Ringkasan performa platform, transaksi, dan aktivitas siswa terbaru."
      />

      <KpiGrid />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Revenue (30 Hari)"
          subtitle="Pendapatan kotor harian dari seluruh transaksi."
          className="xl:col-span-2">
          <RevenueLineChart data={revenueLine30d} height={280} />
        </ChartCard>

        <ChartCard
          title="New Users"
          subtitle="Pendaftar siswa baru 7 hari terakhir.">
          <NewUsersBarChart data={newUsersWeek} height={280} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Top Courses"
          subtitle="Kursus dengan enrolment tertinggi bulan ini."
          className="xl:col-span-2">
          <TopCoursesChart data={topCoursesByEnrolment} height={300} />
        </ChartCard>

        <UnresolvedTickets />
      </section>

      <RecentTransactions />
    </div>
  )
}
