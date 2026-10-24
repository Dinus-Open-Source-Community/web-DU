import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type UserIdentityCellProps = {
  name: string
  email: string
  avatar?: string | null
  meta?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserIdentityCell({ name, email, avatar, meta }: UserIdentityCellProps) {
  const avatarSrc = avatar?.trim()
  const hasAvatar = Boolean(
    avatarSrc &&
    avatarSrc !== '' &&
    avatarSrc !== '/Logo.svg' &&
    !avatarSrc.endsWith('/Logo.svg'),
  )

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <Avatar className="size-9 shrink-0 ring-2 ring-ink-900/15 sm:size-10">
        {hasAvatar && avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
        <AvatarFallback className="bg-note-yellow text-ink-900 text-xs font-bold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{name}</p>
        <p className="truncate text-xs text-ink-500">{email}</p>
        {meta ? <p className="mt-0.5 truncate text-xs font-medium text-ink-400">{meta}</p> : null}
      </div>
    </div>
  )
}
