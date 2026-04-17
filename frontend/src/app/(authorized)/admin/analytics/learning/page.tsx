import type { Metadata } from 'next'
import { CheckCircle2, GraduationCap, TrendingUp, Users2 } from 'lucide-react'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'

import { EngagementCharts, LearnerFunnel } from './_components/LearningCharts'

export const metadata: Metadata = {
  title: 'Learning Metrics — Admin',
  robots: { index: false, follow: false },
}

export default function AdminLearningAnalyticsPage() {
  const totalActiveLearners = 3840
  const avgCompletionRate = 74.6
  const avgEngagementHours = 5.2

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Learning Metrics"
        subtitle="Monitor engagement siswa, tingkat kelulusan, dan corong pembelajaran."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="kpi"
          label="Active Learners"
          value={totalActiveLearners.toLocaleString('id-ID')}
          trendValue={6.8}
          trendDirection="up"
          trendLabel="vs 30 hari lalu"
          icon={<Users2 className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Avg Completion Rate"
          value={`${avgCompletionRate.toFixed(1)}%`}
          trendValue={2.3}
          trendDirection="up"
          trendLabel="vs 30 hari lalu"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Avg Study Time / Student"
          value={`${avgEngagementHours} jam`}
          trendValue={1.6}
          trendDirection="up"
          trendLabel="minggu ini"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          variant="kpi"
          label="Certificates Issued"
          value="1.248"
          trendValue={9.4}
          trendDirection="up"
          trendLabel="bulan ini"
          icon={<GraduationCap className="h-5 w-5" />}
        />
      </section>

      <EngagementCharts />
      <LearnerFunnel />
    </div>
  )
}
