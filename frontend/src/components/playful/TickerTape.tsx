import { cn } from '@/lib/utils'

type TickerTapeProps = { items: string[]; className?: string }

export default function TickerTape({ items, className }: TickerTapeProps) {
  const half = (items.join('  ✦  ') + '  ✦  ').repeat(4)
  const textClass = 'shrink-0 text-sm font-extrabold tracking-[0.15em] uppercase text-ink-900'
  return (
    <div className={cn('overflow-hidden border-y-2 border-ink-900 bg-note-yellow py-3', className)}>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <span className={textClass}>{half}</span>
        <span aria-hidden className={textClass}>
          {half}
        </span>
      </div>
    </div>
  )
}
