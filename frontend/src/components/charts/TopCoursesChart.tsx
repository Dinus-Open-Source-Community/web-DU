'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TopCoursePoint } from '@/lib/types/components/charts'

export type { TopCoursePoint }

interface TopCoursesChartProps {
  data: TopCoursePoint[]
  height?: number
}

export function TopCoursesChart({ data, height = 280 }: TopCoursesChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" strokeDasharray="4 4" />
          <XAxis
            type="number"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#475569"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={150}
          />
          <Tooltip
            cursor={{ fill: 'rgba(10,132,220,0.08)' }}
            contentStyle={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontSize: 12,
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            formatter={(value) => [`${Number(value).toLocaleString('id-ID')} siswa`, 'Enrolment']}
          />
          <Bar
            dataKey="value"
            fill="var(--chart-1)"
            radius={[0, 6, 6, 0]}
            maxBarSize={22}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
