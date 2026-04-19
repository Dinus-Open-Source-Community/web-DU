'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenuePoint } from '@/lib/types/components/charts'

export type { RevenuePoint }

interface RevenueLineChartProps {
  data: RevenuePoint[]
  height?: number
}

const rupiahCompact = (value: number) => {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`
  return `Rp${value}`
}

const rupiahFull = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

export function RevenueLineChart({ data, height = 280 }: RevenueLineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={rupiahCompact}
            width={64}
          />
          <Tooltip
            cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontSize: 12,
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            formatter={(value) => [rupiahFull(Number(value)), 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#revenueFill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
