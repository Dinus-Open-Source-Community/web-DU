import { cn } from '@/lib/utils'
import { useReducedMotion } from 'motion/react'

type TickerTapeProps = { items: readonly string[]; className?: string }

/**
 * Pita tinta berjalan. Konten = frasa khas DOSCOM dari LANDING_COPY.ticker.
 * Duplikasi konten (half) butuh teksnya sama persis agar marquee mulus;
 * span kedua aria-hidden supaya tidak dibaca dua kali oleh screen reader.
 * Reduced-motion: teks statis yang dibungkus rapi, tanpa duplikasi.
 */
export default function TickerTape({ items, className }: TickerTapeProps) {
  const reduceMotion = useReducedMotion()
  if (items.length === 0) return null

  const textClass = 'shrink-0 text-sm font-extrabold tracking-[0.15em] uppercase text-ink-900'

  if (reduceMotion) {
    return (
      <div className={cn('overflow-hidden border-y-2 border-ink-900 bg-note-yellow py-3', className)}>
        <p className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-4 text-center">
          {items.map((item) => (
            <span key={item} className={cn(textClass, 'shrink')}>
              {item}
            </span>
          ))}
        </p>
      </div>
    )
  }

  const half = (items.join('  ✦  ') + '  ✦  ').repeat(4)
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
