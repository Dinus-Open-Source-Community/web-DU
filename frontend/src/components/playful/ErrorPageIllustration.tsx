import { Compass, ShieldAlert, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StickerSparkle, StickerTape } from './Stickers'

type IllustrationVariant = 'not-found' | 'error' | 'forbidden'

type ErrorPageIllustrationProps = {
  variant?: IllustrationVariant
  className?: string
}

export function ErrorPageIllustration({
  variant = 'not-found',
  className,
}: ErrorPageIllustrationProps) {
  return (
    <div
      className={cn(
        'relative inline-flex w-full max-w-[20rem] items-center justify-center sm:max-w-[22rem]',
        className,
      )}
      aria-hidden
    >
      {/* Playful layered paper illustration card */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Background tilted card */}
        <div
          className={cn(
            'absolute inset-0 rounded-3xl border-2 border-ink-900/10 bg-paper-paper transition-transform duration-300',
            variant === 'not-found' && 'rotate-[-3deg] bg-note-sky/30',
            variant === 'forbidden' && 'rotate-[3deg] bg-note-yellow/30',
            variant === 'error' && 'rotate-[-2deg] bg-note-peach/30',
          )}
        />

        {/* Foreground main card */}
        <div className="relative flex h-52 w-52 sm:h-56 sm:w-56 flex-col items-center justify-center rounded-3xl border-2 border-ink-900/10 bg-paper-white p-6 shadow-paper">
          {/* Top tape sticker */}
          <StickerTape className="absolute -top-2.5 left-1/2 -translate-x-1/2 opacity-70" />

          {/* Decorative Sparkles */}
          <StickerSparkle className="absolute right-4 top-4 size-5 text-brand-blue/70" />
          <StickerSparkle className="absolute bottom-4 left-4 size-4 text-note-pink/70" />

          {variant === 'not-found' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-brand-blue/20 bg-brand-soft/40 text-brand-ink">
                <Compass className="size-10 stroke-[2.2] animate-bounce-soft" />
              </div>
              <span className="inline-flex -rotate-2 rounded-full border border-brand-blue/30 bg-brand-blue px-3 py-1 font-display text-xs font-bold tracking-wider text-paper-white shadow-sm">
                404 NOT FOUND
              </span>
            </div>
          )}

          {variant === 'forbidden' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-amber-500/20 bg-note-yellow/40 text-amber-700">
                <ShieldAlert className="size-10 stroke-[2.2]" />
              </div>
              <span className="inline-flex rotate-2 rounded-full border border-amber-500/30 bg-amber-500 px-3 py-1 font-display text-xs font-bold tracking-wider text-paper-white shadow-sm">
                403 FORBIDDEN
              </span>
            </div>
          )}

          {variant === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-destructive/20 bg-note-peach/40 text-destructive">
                <AlertTriangle className="size-10 stroke-[2.2]" />
              </div>
              <span className="inline-flex -rotate-1 rounded-full border border-destructive/30 bg-destructive px-3 py-1 font-display text-xs font-bold tracking-wider text-paper-white shadow-sm">
                500 ERROR
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
