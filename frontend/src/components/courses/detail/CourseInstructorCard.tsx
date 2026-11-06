import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { StickerTape } from '@/components/playful/Stickers'
import { DialogTrigger } from '@/components/ui/dialog'
import MentorDetailModal from '@/components/landing/MentorDetailModal'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import type { LandingMentor } from '@/lib/landing/mentors'
import { cn } from '@/lib/utils'

export interface CourseMentorProfile {
  uid?: string
  name: string
  avatar?: string
  avatar_url?: string
  role?: string
  email?: string
  is_verified?: boolean
  created_at?: string
}

export interface CourseInstructorCardProps {
  mentors?: CourseMentorProfile[]
  name?: string
  role?: string
  avatar?: string
  className?: string
}

function MentorAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const [imgError, setImgError] = useState(false)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-ink-900 bg-note-yellow/60 shadow-2xs sm:size-20">
      {avatar && !imgError ? (
        <img
          src={avatar}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
          sizes="80px"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-xl font-black text-ink-900 sm:text-2xl">
          {initials}
        </div>
      )}
    </div>
  )
}

function toLandingMentorFromProfile(mentor: CourseMentorProfile): LandingMentor {
  return {
    uid: mentor.uid ?? '',
    name: mentor.name,
    email: mentor.email ?? '',
    role: mentor.role ?? 'Mentor Praktisi',
    photo: mentor.avatar_url ?? mentor.avatar ?? '',
    courses: [],
    assignedCourses: 0,
    joinedTeachingCourses: 0,
    isVerified: mentor.is_verified ?? true,
    createdAt: mentor.created_at ?? '',
    socials: [],
  }
}

export function CourseInstructorCard({
  mentors,
  name,
  avatar,
  className,
}: CourseInstructorCardProps) {
  const list: CourseMentorProfile[] =
    mentors && mentors.length > 0
      ? mentors
      : name
        ? [{ name, avatar }]
        : []

  if (list.length === 0) {
    return null
  }

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding, className)}>
      <StickerTape className="absolute -top-2.5 left-8 -rotate-1" />

      <h2 className={cn(detailLayout.sectionTitle, 'mb-5')}>Mentor Kursus</h2>

      <div className="divide-y-2 divide-dashed divide-ink-900/15">
        {list.map((mentor, index) => {
          const landingMentor = toLandingMentorFromProfile(mentor)

          return (
            <div key={mentor.uid ?? mentor.name} className="py-1 first:pt-0 last:pb-0">
              <MentorDetailModal mentor={landingMentor} index={index}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl p-2.5 text-left transition-all hover:bg-paper-panel/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue sm:p-3"
                    aria-label={`Lihat detail profil mentor ${mentor.name}`}
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <MentorAvatar
                        name={mentor.name}
                        avatar={mentor.avatar_url ?? mentor.avatar}
                      />

                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-display text-lg font-medium text-ink-900 sm:text-xl">
                          {mentor.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden font-mono text-xs font-bold text-ink-500 transition-colors group-hover:text-ink-900 sm:inline-block">
                        Lihat Profil
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-ink-900/30 bg-paper-white text-ink-900 shadow-2xs transition-all group-hover:border-ink-900 group-hover:bg-note-yellow group-hover:translate-x-0.5">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </button>
                </DialogTrigger>
              </MentorDetailModal>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export { CourseInstructorCard as CourseMentorSection, CourseInstructorCard as CourseMentorCard }
