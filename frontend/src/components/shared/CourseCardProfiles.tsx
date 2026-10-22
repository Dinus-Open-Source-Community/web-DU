import { useState } from 'react'
import { Users } from 'lucide-react'
import type { CourseProfile } from '@/lib/course-detail/course-profile'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Profile } from '../ui/profile'
import { UserAvatarImage } from './UserAvatarImage'
import { cn } from '@/lib/utils'

type CourseCardProfilesProps = {
  profiles: CourseProfile[]
  compact?: boolean
  className?: string
}

function buildMentorGroupLabel(profiles: CourseProfile[]) {
  const [primary, ...rest] = profiles

  if (rest.length === 1) {
    return `${primary.name} & ${rest[0].name}`
  }

  return `${primary.name} +${rest.length} lainnya`
}

export function CourseCardProfiles({ profiles, compact = false, className }: CourseCardProfilesProps) {
  const [open, setOpen] = useState(false)

  if (profiles.length === 0) return null

  if (profiles.length === 1) {
    const profile = profiles[0]
    return (
      <Profile
        image={profile.avatar_url?.trim() ?? ''}
        name={profile.name}
        compact={compact}
        className={className}
      />
    )
  }

  const label = buildMentorGroupLabel(profiles)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex min-w-0 items-center cursor-pointer transition-opacity hover:opacity-80',
            compact ? 'max-w-[140px] gap-1.5 sm:max-w-[160px]' : 'w-full gap-2',
            className,
          )}
        >
          <div className={cn('flex shrink-0', compact ? '-space-x-1.5' : '-space-x-2')}>
            {profiles.slice(0, 3).map((profile) => (
              <UserAvatarImage
                key={profile.uid ?? profile.name}
                src={profile.avatar_url?.trim() ?? ''}
                alt={profile.name}
                size={compact ? 24 : 28}
                className="ring-2 ring-white"
              />
            ))}
          </div>
          <p
            className={cn(
              'truncate font-medium',
              compact ? 'text-xs text-ink-700' : 'line-clamp-1 text-base text-[var(--text-secondary)]',
            )}
          >
            {label}
          </p>
          <span
            className={cn(
              'shrink-0 bg-paper-paper font-medium text-ink-600',
              compact ? 'ml-0.5 rounded-md border border-ink-900/10 px-1.5 py-0.5 text-[10px]' : 'ml-auto rounded-full px-2 py-0.5 text-xs',
            )}
          >
            <Users className={cn('inline mr-0.5', compact ? 'size-2.5' : 'size-3')} />
            {profiles.length}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daftar Mentor</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <div key={profile.uid ?? profile.name} className="flex items-center gap-3">
              <UserAvatarImage
                src={profile.avatar_url?.trim() ?? ''}
                alt={profile.name}
                size={40}
                className="ring-2 ring-border/50"
              />
              <div className="flex flex-col">
                <span className="font-medium text-ink-900">{profile.name}</span>
                {profile.role && (
                  <span className="text-xs text-ink-500">{profile.role}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
