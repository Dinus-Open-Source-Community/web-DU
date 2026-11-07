import type { ReactNode } from 'react'

import { CourseCardCover, CourseCardCoverFrame } from '@/components/shared/CourseCardCover'
import { StickerTape } from '@/components/playful/Stickers'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { apiLevelToUi } from '@/lib/course-form/level'
import { cn } from '@/lib/utils'

interface CourseDetailSidebarProps {
  title?: string
  description?: string
  category?: string
  courseType?: string
  level?: string
  isEnrolled?: boolean
  previewImage?: string
  enrolledCount?: number
  children: ReactNode
  slot?: number
  className?: string
}

export function CourseDetailSidebar({
  title,
  description,
  category,
  courseType,
  level,
  isEnrolled,
  previewImage,
  enrolledCount = 0,
  children,
  slot,
  className,
}: CourseDetailSidebarProps) {
  const levelLabel = level ? apiLevelToUi(level) : null

  return (
    <aside
      className={cn(
        detailLayout.sectionCard,
        'overflow-hidden shadow-paper transition-all',
        className,
      )}
    >
      <StickerTape className="absolute -top-2.5 right-6 rotate-2 z-10" />

      {/* Frame Gambar Pratinjau */}
      <CourseCardCoverFrame className="rounded-none border-b-2 border-ink-900 bg-note-sky/20">
        <CourseCardCover
          src={previewImage}
          alt="Pratinjau kursus"
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
        />
      </CourseCardCoverFrame>

      {/* Konten Aksi & Informasi Kursus */}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {/* Badges Row */}
        {(category || courseType || levelLabel || isEnrolled) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {category && (
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-yellow px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-ink-900 shadow-2xs -rotate-1">
                {category}
              </span>
            )}

            {courseType && (
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-sky px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-2xs">
                {courseType}
              </span>
            )}

            {levelLabel && (
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-paper-panel px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-800 shadow-2xs">
                Level: {levelLabel}
              </span>
            )}

            {isEnrolled && (
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-mint px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-ink-900 shadow-2xs">
                ✓ Sudah Terdaftar
              </span>
            )}
          </div>
        )}

        {/* Title */}
        {title && (
          <h1 className="font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl lg:text-[2.85rem] leading-[1.12] [text-wrap:balance]">
            {title}
          </h1>
        )}

        {/* Course Subtitle/Description */}
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            {description}
          </p>
        )}

        {/* Action Button Container */}
        <div className="flex flex-col gap-2">
          {children}
        </div>

        {slot && slot > 0 ? (
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border-2 px-3.5 py-2 font-mono text-xs font-bold',
              enrolledCount >= slot
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-ink-900/20 bg-paper-panel/60 text-ink-800',
            )}
            aria-live="polite"
          >
            <span>{enrolledCount >= slot ? 'Kuota Penuh:' : 'Total Peserta:'}</span>
            <span>{enrolledCount} / {slot} Peserta</span>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
