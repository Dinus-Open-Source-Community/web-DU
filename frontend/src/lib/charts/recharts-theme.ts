import type { CSSProperties } from 'react'

export const chartGridStroke = 'var(--border)'
export const chartAxisStroke = 'var(--muted-foreground)'
export const chartCursorFill = 'color-mix(in srgb, var(--primary) 12%, transparent)'

export const chartTooltipContentStyle: CSSProperties = {
  background: 'var(--card)',
  color: 'var(--card-foreground)',
  borderRadius: 12,
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  fontSize: 12,
  padding: '8px 12px',
}
