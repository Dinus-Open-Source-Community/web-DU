import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import { mentorInitials, type LandingMentor } from '@/lib/landing/mentors'

const AVATAR_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach', 'bg-note-pink', 'bg-note-sky', 'bg-note-lavender'] as const

type MentorCardProps = { mentor: LandingMentor; index?: number; className?: string }

export default function MentorCard({ mentor, index = 0, className }: MentorCardProps) {
  return (
    <Reveal delay={(index % 4) * 0.1} className={className}>
      <article className="flex h-full flex-col items-center rounded-[20px] border-2 border-ink-900 bg-paper-white px-6 py-8 text-center shadow-paper transition-transform hover:-translate-y-1">
        <div
          className={cn(
            'flex size-20 items-center justify-center rounded-full border-2 border-ink-900 font-display text-2xl font-bold text-ink-900',
            AVATAR_BG[index % AVATAR_BG.length],
          )}
        >
          {mentorInitials(mentor.name)}
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-ink-900">{mentor.name}</h3>
        <p className="mt-1 text-sm font-bold text-brand-ink">{mentor.role}</p>
      </article>
    </Reveal>
  )
}
