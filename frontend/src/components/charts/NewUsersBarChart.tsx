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

export interface NewUsersPoint {
  label: string
  value: number
}

interface NewUsersBarChartProps {
  data: NewUsersPoint[]
  height?: number
}

export function NewUsersBarChart({ data, height = 280 }: NewUsersBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="#eef2f7" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickMargin={8}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={48}
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
            formatter={(value) => [`${Number(value).toLocaleString('id-ID')} user`, 'Pendaftar']}
          />
          <Bar
            dataKey="value"
            fill="var(--chart-1)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
