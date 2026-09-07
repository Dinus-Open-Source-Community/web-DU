import { cn } from '@/lib/utils'

type DoodleArrowProps = {
  variant?: 'right' | 'down' | 'loop'
  className?: string
}

const PATHS: Record<NonNullable<DoodleArrowProps['variant']>, { body: string; head: string }> = {
  right: {
    body: 'M10 70 C 28 32, 70 10, 108 32',
    head: 'M 92 22 L108 32 L 95 48',
  },
  down: {
    body: 'M20 6 C 30 44, 30 82, 22 106',
    head: 'M13 94 L22 107 L32 95',
  },
  loop: {
    body: 'M10 60 C 10 20, 90 10, 100 50 C 106 76, 70 88, 52 70',
    head: 'M44 60 L52 71 L63 62',
  },
}

export default function DoodleArrow({ variant = 'right', className }: DoodleArrowProps) {
  const { body, head } = PATHS[variant]
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      fill="none"
      className={cn('animate-wiggle text-ink-900', className)}
    >
      <path d={body} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d={head} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
