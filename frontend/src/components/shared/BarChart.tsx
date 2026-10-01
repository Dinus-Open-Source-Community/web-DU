'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  chartAxisStroke,
  chartCursorFill,
  chartGridStroke,
  chartTooltipContentStyle,
} from '@/lib/charts/recharts-theme'
import type { CategoryPoint } from '../../lib/types/utils'
import { EmptyState } from './EmptyState'

interface CategoryBarChartProps {
  data: CategoryPoint[]
  height?: number
  color?: string
  valueFormatter?: (value: number) => string
  orientation?: 'horizontal' | 'vertical'
}

export function CategoryBarChart({ data, height = 280, color = 'var(--chart-1)', valueFormatter, orientation = 'horizontal' }: CategoryBarChartProps) {
  const fmt = valueFormatter ?? ((v: number) => v.toLocaleString('id-ID'))
  if (!data || data.length === 0) {
    return <EmptyState title="Tidak ada data " />
  }
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {orientation === 'horizontal' ? (
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
            <CartesianGrid horizontal={false} stroke={chartGridStroke} strokeDasharray="4 4" />
            <XAxis type="number" stroke={chartAxisStroke} tickLine={false} axisLine={false} fontSize={11} tickFormatter={fmt} />
            <YAxis type="category" dataKey="label" stroke={chartAxisStroke} tickLine={false} axisLine={false} fontSize={12} width={140} />
            <Tooltip
              cursor={{ fill: chartCursorFill }}
              contentStyle={chartTooltipContentStyle}
              formatter={(value) => [fmt(Number(value)), 'Value']}
            />
            <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke={chartGridStroke} strokeDasharray="4 4" />
            <XAxis dataKey="label" stroke={chartAxisStroke} tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
            <YAxis stroke={chartAxisStroke} tickLine={false} axisLine={false} fontSize={11} tickFormatter={fmt} width={56} />
            <Tooltip
              cursor={{ fill: chartCursorFill }}
              contentStyle={chartTooltipContentStyle}
              formatter={(value) => [fmt(Number(value)), 'Value']}
            />
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} isAnimationActive={false} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
