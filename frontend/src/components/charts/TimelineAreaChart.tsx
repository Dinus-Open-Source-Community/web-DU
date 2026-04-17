'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface TimelinePoint {
  label: string
  [key: string]: string | number
}

export interface TimelineSeries {
  dataKey: string
  label: string
  color: string
}

interface TimelineAreaChartProps {
  data: TimelinePoint[]
  series: TimelineSeries[]
  height?: number
}

export function TimelineAreaChart({ data, series, height = 280 }: TimelineAreaChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.dataKey} id={`tl-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.24} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
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
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} width={48} />
          <Tooltip
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontSize: 12,
              padding: '8px 12px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#475569' }}
          />
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
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
