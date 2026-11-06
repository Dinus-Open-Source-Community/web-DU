import { Check } from 'lucide-react'

import { StickerTape } from '@/components/playful/Stickers'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

interface CourseWhatYouLearnProps {
  title?: string
  items: string[]
}

export function CourseWhatYouLearn({ title = 'Yang akan kamu pelajari', items }: CourseWhatYouLearnProps) {
  if (items.length === 0) return null

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding)}>
      <StickerTape className="absolute -top-2.5 left-6 -rotate-1" />
      <h2 className={cn(detailLayout.sectionTitle, 'mb-5')}>{title}</h2>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-3.5 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-800">
            <span className="grid size-5 shrink-0 place-items-center rounded-md border border-ink-900 bg-note-mint text-ink-900 shadow-2xs mt-0.5">
              <Check className="size-3 stroke-[3]" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
