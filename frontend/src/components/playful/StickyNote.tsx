import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const NOTE_BG = [
  'bg-note-yellow',
  'bg-note-mint',
  'bg-note-peach',
  'bg-note-pink',
  'bg-note-sky',
  'bg-note-lavender',
] as const

const NOTE_ROTATE = [
  '-rotate-2',
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  'rotate-[1.5deg]',
  '-rotate-[1.5deg]',
] as const

type StickyNoteProps = {
  title: string
  copy?: string
  icon?: ReactNode
  index?: number
  draggable?: boolean
  className?: string
}

export default function StickyNote({
  title,
  copy,
  icon,
  index = 0,
  draggable = false,
  className,
}: StickyNoteProps) {
  const reduceMotion = useReducedMotion()
  const slot = index % NOTE_BG.length
  return (
    <motion.div
      drag={draggable && !reduceMotion}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.6}
      whileDrag={{ scale: 1.05, rotate: 0, cursor: 'grabbing' }}
      whileHover={draggable ? { scale: 1.03 } : undefined}
      className={cn(
        'relative min-w-42.5 px-5 pt-6 pb-4 shadow-paper',
        NOTE_BG[slot],
        NOTE_ROTATE[slot],
        !reduceMotion && 'animate-float',
        draggable && !reduceMotion && 'cursor-grab touch-none',
        className,
      )}
      style={!reduceMotion ? { animationDelay: `${slot * -0.9}s` } : undefined}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-[18px] w-[62px] -translate-x-1/2 -rotate-3 bg-[rgba(111,119,128,0.28)]"
      />
      <div className="flex items-center gap-2">
        {icon ? <span className="text-ink-900 [&_svg]:size-5">{icon}</span> : null}
        <p className="text-sm font-extrabold text-ink-900">{title}</p>
      </div>
      {copy ? <p className="mt-1 text-xs leading-snug text-ink-900/80">{copy}</p> : null}
    </motion.div>
  )
}
