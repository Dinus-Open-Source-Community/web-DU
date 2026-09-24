import { cn } from '@/lib/utils'
import Reveal from './Reveal'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  copy?: string
  /** align='left' dipakai section yang komposisinya tidak sentris (variasi irama). */
  align?: 'center' | 'left'
  dark?: boolean
  className?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  copy,
  align = 'center',
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <p
        className={cn(
          'text-xs font-extrabold tracking-[0.2em] uppercase italic sm:text-sm',
          dark ? 'text-brand-soft' : 'text-brand-ink',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-[clamp(2rem,7.5vw,3.75rem)] leading-[1] font-bold text-balance md:text-6xl',
          dark ? 'text-paper-white' : 'text-ink-900',
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cn(
            'mt-3 text-base leading-relaxed md:mt-4 md:text-lg',
            dark ? 'text-paper-white/80' : 'text-ink-600',
          )}
        >
          {copy}
        </p>
      ) : null}
    </Reveal>
  )
}
