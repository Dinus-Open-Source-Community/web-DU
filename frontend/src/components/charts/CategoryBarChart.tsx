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

export interface CategoryPoint {
  label: string
  value: number
}

interface CategoryBarChartProps {
  data: CategoryPoint[]
  height?: number
  /** Warna bar via CSS var, mis. "var(--chart-1)" */
  color?: string
  valueFormatter?: (value: number) => string
  orientation?: 'horizontal' | 'vertical'
}

export function CategoryBarChart({
  data,
  height = 280,
  color = 'var(--chart-1)',
  valueFormatter,
  orientation = 'horizontal',
}: CategoryBarChartProps) {
  const fmt = valueFormatter ?? ((v: number) => v.toLocaleString('id-ID'))
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {orientation === 'horizontal' ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
            <CartesianGrid horizontal={false} stroke="#eef2f7" strokeDasharray="4 4" />
            <XAxis
              type="number"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={fmt}
            />
            <YAxis
              type="category"
              dataKey="label"
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={140}
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
              formatter={(value) => [fmt(Number(value)), 'Value']}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[0, 6, 6, 0]}
              maxBarSize={22}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
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
              tickFormatter={fmt}
              width={56}
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
              formatter={(value) => [fmt(Number(value)), 'Value']}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
