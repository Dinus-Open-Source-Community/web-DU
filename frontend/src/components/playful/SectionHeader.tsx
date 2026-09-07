import { cn } from '@/lib/utils'
import Reveal from './Reveal'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  copy?: string
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
          'text-sm font-extrabold tracking-[0.2em] uppercase italic',
          dark ? 'text-brand-soft' : 'text-brand-ink',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-5xl leading-[0.95] font-bold text-balance md:text-6xl',
          dark ? 'text-paper-white' : 'text-ink-900',
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p className={cn('mt-4 text-lg leading-relaxed', dark ? 'text-paper-white/80' : 'text-ink-600')}>
          {copy}
        </p>
      ) : null}
    </Reveal>
  )
}
