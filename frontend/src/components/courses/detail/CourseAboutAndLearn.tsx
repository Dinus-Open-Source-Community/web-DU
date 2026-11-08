import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { StickerTape } from '@/components/playful/Stickers'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

interface CourseAboutAndLearnProps {
  description?: string
  descriptionContent?: ReactNode
  items?: string[]
  className?: string
}

export function CourseAboutAndLearn({
  description,
  descriptionContent,
  items = [],
  className,
}: CourseAboutAndLearnProps) {
  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding, className)}>
      <StickerTape className="absolute -top-2.5 left-6 -rotate-1" />

      {/* Bagian Tentang Kursus */}
      <div className="flex flex-col gap-3">
        <h2 className={detailLayout.sectionTitle}>Tentang Kursus Ini</h2>
        <div className={cn(detailLayout.body, 'text-ink-700 leading-relaxed space-y-3')}>
          {descriptionContent ?? (description ? <p>{description}</p> : null)}
        </div>
      </div>

      {/* Bagian Yang Akan Kamu Pelajari */}
      {items.length > 0 && (
        <div className="mt-8 border-t-2 border-dashed border-ink-900/15 pt-6">
          <h3 className="mb-4 font-display text-lg font-bold text-ink-900 sm:text-xl">
            Yang Akan Kamu Pelajari
          </h3>

          <ul className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-800">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-ink-900 bg-note-mint text-ink-900 shadow-2xs">
                  <Check className="size-3 stroke-[3]" />
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
