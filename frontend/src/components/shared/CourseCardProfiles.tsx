import type { CourseProfile } from '@/lib/course-detail/course-profile'

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
  if (profiles.length === 0) return null

  if (profiles.length === 1) {
    const profile = profiles[0]
    return <Profile image={profile.avatar_url?.trim() ?? ''} name={profile.name} />
  }

  const label = buildMentorGroupLabel(profiles)

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
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
    </div>
  )
}
