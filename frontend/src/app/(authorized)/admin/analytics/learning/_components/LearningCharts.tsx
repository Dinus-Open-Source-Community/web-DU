'use client'

import { CategoryBarChart } from '@/components/charts/CategoryBarChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { TimelineAreaChart } from '@/components/charts/TimelineAreaChart'
import { getCompletionRateByCategory, getDropOffFunnel, getLearningEngagementTrend } from '@/lib/data/repository'

export function EngagementCharts() {
  const engagementTrend = getLearningEngagementTrend()
  const completionRate = getCompletionRateByCategory()
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <ChartCard
        title="Engagement & Completion Trend"
        subtitle="Siswa aktif vs siswa yang menyelesaikan modul per minggu."
        className="xl:col-span-2">
        <TimelineAreaChart
          data={engagementTrend}
          height={300}
          series={[
            { dataKey: 'active', label: 'Active', color: 'var(--chart-1)' },
            { dataKey: 'completed', label: 'Completed', color: 'var(--chart-5)' },
          ]}
        />
      </ChartCard>
      <ChartCard
        title="Completion Rate / Category"
        subtitle="Persentase siswa yang menyelesaikan kursus.">
        <CategoryBarChart
          data={completionRate}
          height={300}
          orientation="horizontal"
          valueFormatter={(v) => `${v}%`}
        />
      </ChartCard>
    </section>
  )
}

export function LearnerFunnel() {
  const dropOffFunnel = getDropOffFunnel()
  const funnelMax = Math.max(...dropOffFunnel.map((s) => s.value))

  return (
    <ChartCard
      title="Learner Funnel"
      subtitle="Tahapan siswa dari kunjungan kursus hingga penyelesaian."
      contentClassName="px-5 py-5">
      <ul className="flex flex-col gap-2">
        {dropOffFunnel.map((step, idx) => {
          const pct = (step.value / funnelMax) * 100
          const prev = idx === 0 ? null : dropOffFunnel[idx - 1].value
          const dropPct = prev ? 100 - (step.value / prev) * 100 : 0
          return (
            <li
              key={step.label}
              className="flex flex-col gap-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-800">{step.label}</span>
                <span className="tabular-nums text-slate-700">
                  {step.value.toLocaleString('id-ID')}
                  {prev && (
                    <span className="ml-2 text-xs font-normal text-rose-500">
                      -{dropPct.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200/70">
                <div
                  className="h-2 rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </ChartCard>
  )
}
