import { cn } from '@/lib/utils'

function Print({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 28" className={cn('w-4 text-ink-900/30', className)}>
      <ellipse cx="10" cy="17" rx="6" ry="8" fill="currentColor" />
      <circle cx="4" cy="5" r="2" fill="currentColor" />
      <circle cx="10" cy="3.5" r="2" fill="currentColor" />
      <circle cx="16" cy="5" r="2" fill="currentColor" />
    </svg>
  )
}

export default function Footprints({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-start justify-center gap-3', className)}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Print key={i} className={i % 2 === 0 ? '-rotate-12 -translate-y-1' : 'rotate-12 translate-y-1'} />
      ))}
    </div>
  )
}
