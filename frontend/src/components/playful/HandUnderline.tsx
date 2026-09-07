import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const PATH = 'M4 10 C 60 4, 150 4, 216 8'

type HandUnderlineProps = { className?: string; draw?: boolean }

export default function HandUnderline({ className, draw = false }: HandUnderlineProps) {
  const reduceMotion = useReducedMotion()
  if (!draw || reduceMotion) {
    return (
      <svg
        aria-hidden
        viewBox="0 0 220 14"
        preserveAspectRatio="none"
        className={cn('h-[10px] w-full text-brand-blue animate-drift', className)}
      >
        <path d={PATH} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      className={cn('h-[10px] w-full text-brand-blue', className)}
    >
      <motion.path
        d={PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
      />
    </svg>
  )
}
