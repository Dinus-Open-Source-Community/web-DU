import { StickerTape } from '@/components/playful/Stickers'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

interface CourseInstructorCardProps {
  name: string
  role: string
  avatar?: string
  className?: string
}

export function CourseInstructorCard({
  name,
  role,
  avatar,
  className,
}: CourseInstructorCardProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding, className)}>
      <StickerTape className="absolute -top-2.5 left-8 -rotate-1" />

      <h2 className={cn(detailLayout.sectionTitle, 'mb-6')}>Instruktur Kursus</h2>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-ink-900 bg-note-yellow/60 shadow-2xs sm:size-24">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover"
              sizes="96px"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-2xl font-black text-ink-900">
              {initials}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">{name}</h3>
            <span className="rounded-md border border-ink-900/30 bg-note-mint px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-2xs">
              {role}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-ink-600 sm:text-[15px]">
            Praktisi dan pengajar komunitas Doscom. Berpengalaman dalam membimbing peserta melalui kurikulum berbasis proyek nyata dan standar industri open source.
          </p>
        </div>
      </div>
    </section>
  )
}
