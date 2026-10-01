import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  chartAxisStroke,
  chartGridStroke,
  chartTooltipContentStyle,
} from '@/lib/charts/recharts-theme'
import type { TimelinePoint, TimelineSeries } from '../../lib/types/utils'
interface TimelineAreaChartProps {
  data: TimelinePoint[]
  series: TimelineSeries[]
  height?: number
}

export function TimelineAreaChart({ data, series, height = 280 }: TimelineAreaChartProps) {
  const hasData = Array.isArray(data) && data.length > 0
  const fallbackPoint = series.reduce<Record<string, number | string>>(
    (acc, s) => {
      acc[s.dataKey] = 0
      return acc
    },
    { label: '' },
  )
  const chartData = hasData ? data : [fallbackPoint as TimelinePoint]

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.dataKey} id={`tl-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.24} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke={chartGridStroke} strokeDasharray="4 4" />
          <XAxis dataKey="label" stroke={chartAxisStroke} tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
          <YAxis stroke={chartAxisStroke} tickLine={false} axisLine={false} fontSize={11} width={48} />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={chartTooltipContentStyle}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
          {series.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#tl-${s.dataKey})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
