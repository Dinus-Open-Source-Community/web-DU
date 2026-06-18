import { useState } from 'react'
import { Users } from 'lucide-react'
import type { CourseProfile } from '@/lib/course-detail/course-profile'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Profile } from '../ui/profile'
import { UserAvatarImage } from './UserAvatarImage'

type CourseCardProfilesProps = {
  profiles: CourseProfile[]
}

function buildMentorGroupLabel(profiles: CourseProfile[]) {
  const [primary, ...rest] = profiles

  if (rest.length === 1) {
    return `${primary.name} & ${rest[0].name}`
  }

  return `${primary.name} +${rest.length} lainnya`
}

export function CourseCardProfiles({ profiles }: CourseCardProfilesProps) {
  const [open, setOpen] = useState(false)

  if (profiles.length === 0) return null

  if (profiles.length === 1) {
    const profile = profiles[0]
    return <Profile image={profile.avatar_url?.trim() ?? ''} name={profile.name} />
  }

  const label = buildMentorGroupLabel(profiles)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full min-w-0 items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex shrink-0 -space-x-2">
            {profiles.slice(0, 3).map((profile) => (
              <UserAvatarImage
                key={profile.uid ?? profile.name}
                src={profile.avatar_url?.trim() ?? ''}
                alt={profile.name}
                size={28}
                className="ring-2 ring-white"
              />
            ))}
          </div>
          <p className="line-clamp-1 text-base font-medium text-[var(--text-secondary)]">{label}</p>
          <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            <Users className="inline size-3 mr-0.5" />
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
                className="ring-2 ring-slate-100"
              />
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{profile.name}</span>
                {profile.role && (
                  <span className="text-xs text-slate-500">{profile.role}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
