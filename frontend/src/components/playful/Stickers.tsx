import { cn } from '@/lib/utils'

type StickerProps = { className?: string }

export function StickerStar({ className }: StickerProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn('animate-float text-ink-900', className)}>
      <path
        d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17 L6 21.5 L8 14 L2 9.5 L9.5 9 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StickerSparkle({ className, twinkle = false }: StickerProps & { twinkle?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn(twinkle ? 'animate-twinkle' : 'animate-float', 'text-brand-blue', className)}
    >
      <path
        d="M12 2 C 13 8, 16 11, 22 12 C 16 13, 13 16, 12 22 C 11 16, 8 13, 2 12 C 8 11, 11 8, 12 2 Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function StickerSquiggle({ className }: StickerProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      className={cn('animate-drift text-brand-ink', className)}
    >
      <path
        d="M4 14 C 24 4, 44 22, 64 12 S 104 6, 116 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StickerCircle({ className }: StickerProps) {
  return (
    <svg aria-hidden viewBox="0 0 60 60" className={cn('animate-wiggle text-brand-blue', className)}>
      <path
        d="M30 5 C 45 5, 55 16, 54 31 C 53 46, 42 55, 28 54 C 14 53, 5 43, 6 29 C 7 15, 17 6, 31 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StickerTape({ className }: StickerProps) {
  return (
    <span
      aria-hidden
      className={cn('block h-[18px] w-[62px] -rotate-3 bg-[rgba(111,119,128,0.28)]', className)}
    />
  )
}

export function StickerPin({ className }: StickerProps) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={cn('text-destructive', className)}>
      <circle cx="10" cy="7" r="5" fill="currentColor" />
      <path d="M10 12 L10 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
