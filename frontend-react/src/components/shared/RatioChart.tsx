import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TransactionRatioPoint } from '../../lib/types/utils'

interface TransactionRatioChartProps {
  data: TransactionRatioPoint[]
  height?: number
}

const defaultColors = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-2)']

export function TransactionRatioChart({ data, height = 280 }: TransactionRatioChartProps) {
  const hasData = data.length > 0
  const total = hasData ? data.reduce((acc, d) => acc + d.value, 0) : 0
  const chartData = hasData
    ? data.map((entry, i) => ({
        ...entry,
        fill: entry.color ?? defaultColors[i % defaultColors.length],
      }))
    : [
        {
          label: 'Belum ada data ratio',
          value: 1,
          fill: 'var(--chart-4, #e2e8f0)',
        },
      ]
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={1}
            stroke="#fff"
            strokeWidth={3}
            isAnimationActive={false}
            label={false}
          />
          {hasData ? (
            <Tooltip
              contentStyle={{
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                fontSize: 12,
                padding: '8px 12px',
              }}
              formatter={(value, _name, props) => {
                const num = Number(value)
                const pct = total ? ((num / total) * 100).toFixed(1) : '0.0'
                const label = (props as { payload?: { label?: string } })?.payload?.label ?? ''
                return [`${num.toLocaleString('id-ID')} (${pct}%)`, label]
              }}
            />
          ) : null}
          <Legend verticalAlign="bottom" align="center" iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
