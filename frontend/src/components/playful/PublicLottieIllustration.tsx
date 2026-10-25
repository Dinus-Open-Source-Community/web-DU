import type { ReactNode } from 'react'
import {
  Award,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FolderOpen,
  ImagePlus,
  MessagesSquare,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StickerSparkle, StickerTape } from './Stickers'

export type PlayfulEmptyVariant =
  | 'todo'
  | 'pending_review'
  | 'done'
  | 'late'
  | 'review'
  | 'gallery'
  | 'qa'
  | 'nothing'

export type PublicLottieIllustrationProps = {
  src?: string
  variant?: PlayfulEmptyVariant
  height?: string
  className?: string
  maxWidthClassName?: string
  fallbackImageSrc?: string
}

type BadgeTheme = {
  icon: ReactNode
  badgeText?: string
  cardBg: string
  iconWrapperBg: string
  iconColor: string
  tilt: string
}

function resolveTheme(src?: string, variant?: PlayfulEmptyVariant): BadgeTheme {
  const key = `${variant ?? ''} ${src ?? ''}`.toLowerCase()

  if (key.includes('happy-nothave-task') || key.includes('todo')) {
    return {
      icon: <CheckCircle2 className="size-8 stroke-[2.2]" />,
      badgeText: 'Santai Dulu',
      cardBg: 'bg-note-mint/25',
      iconWrapperBg: 'bg-note-mint/50 border-emerald-500/20',
      iconColor: 'text-emerald-700',
      tilt: 'rotate-[-2deg]',
    }
  }

  if (key.includes('waiting-review') || key.includes('pending_review')) {
    return {
      icon: <Clock3 className="size-8 stroke-[2.2]" />,
      badgeText: 'Menunggu Ulasan',
      cardBg: 'bg-note-yellow/25',
      iconWrapperBg: 'bg-note-yellow/50 border-amber-500/20',
      iconColor: 'text-amber-800',
      tilt: 'rotate-[2deg]',
    }
  }

  if (key.includes('no-graded') || key.includes('done')) {
    return {
      icon: <Award className="size-8 stroke-[2.2]" />,
      badgeText: 'Belum Dinilai',
      cardBg: 'bg-note-lavender/25',
      iconWrapperBg: 'bg-note-lavender/50 border-purple-500/20',
      iconColor: 'text-purple-800',
      tilt: 'rotate-[-2deg]',
    }
  }

  if (key.includes('calm-duedate-task') || key.includes('late')) {
    return {
      icon: <CalendarCheck2 className="size-8 stroke-[2.2]" />,
      badgeText: 'Jadwal Aman',
      cardBg: 'bg-note-sky/25',
      iconWrapperBg: 'bg-note-sky/50 border-blue-500/20',
      iconColor: 'text-blue-800',
      tilt: 'rotate-[2deg]',
    }
  }

  if (key.includes('review')) {
    return {
      icon: <Star className="size-8 fill-amber-400 text-amber-500 stroke-[2]" />,
      badgeText: 'Belum Ada Ulasan',
      cardBg: 'bg-note-yellow/25',
      iconWrapperBg: 'bg-note-yellow/40 border-amber-400/30',
      iconColor: 'text-amber-600',
      tilt: 'rotate-[-1deg]',
    }
  }

  if (key.includes('gallery')) {
    return {
      icon: <ImagePlus className="size-8 stroke-[2.2]" />,
      badgeText: 'Galeri Kosong',
      cardBg: 'bg-note-mint/25',
      iconWrapperBg: 'bg-note-mint/40 border-emerald-400/30',
      iconColor: 'text-emerald-700',
      tilt: 'rotate-[2deg]',
    }
  }

  if (key.includes('mental-therapy') || key.includes('qa')) {
    return {
      icon: <MessagesSquare className="size-8 stroke-[2.2]" />,
      badgeText: 'Forum Tanya Jawab',
      cardBg: 'bg-note-lavender/25',
      iconWrapperBg: 'bg-note-lavender/40 border-indigo-400/30',
      iconColor: 'text-indigo-700',
      tilt: 'rotate-[-2deg]',
    }
  }

  // Default / nothing
  return {
    icon: <FolderOpen className="size-8 stroke-[2.2]" />,
    badgeText: 'Belum Ada Konten',
    cardBg: 'bg-paper-panel/60',
    iconWrapperBg: 'bg-brand-soft/40 border-brand-blue/20',
    iconColor: 'text-brand-ink',
    tilt: 'rotate-[-1deg]',
  }
}

/**
 * Pengganti Lottie: Ilustrasi berbasis SVG/Lucide murni (< 1KB).
 * Menghilangkan payload animasi JSON besar dan library lottie-web.
 */
export function PlayfulEmptyIllustration({
  src,
  variant,
  className,
  maxWidthClassName = 'max-w-[14rem] sm:max-w-[16rem]',
}: PublicLottieIllustrationProps) {
  const theme = resolveTheme(src, variant)

  return (
    <div
      className={cn(
        'relative inline-flex w-full items-center justify-center py-2 select-none',
        maxWidthClassName,
        className,
      )}
      aria-hidden
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Layer kartu belakang dengan tilt */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl border-2 border-ink-900/10 transition-transform duration-300',
            theme.cardBg,
            theme.tilt,
          )}
        />

        {/* Kartu utama */}
        <div className="relative flex h-32 w-32 sm:h-36 sm:w-36 flex-col items-center justify-center rounded-2xl border-2 border-ink-900/10 bg-paper-white p-4 shadow-paper">
          {/* Sticker selotip kecil */}
          <StickerTape className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-60" />

          {/* Micro Sparkle */}
          <StickerSparkle className="absolute right-2 top-2 size-4 text-brand-blue/60" />

          {/* Icon wrapper */}
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-xl border-2',
              theme.iconWrapperBg,
              theme.iconColor,
            )}
          >
            {theme.icon}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Backward compatibility alias */
export const PublicLottieIllustration = PlayfulEmptyIllustration
