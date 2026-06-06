import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type UserIdentityCellProps = {
  name: string
  email: string
  avatar: string
  meta?: string
}

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'U'
}

export function UserIdentityCell({ name, email, avatar, meta }: UserIdentityCellProps) {
  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-600">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{email}</p>
        {meta ? <p className="mt-0.5 truncate text-xs font-medium text-slate-400">{meta}</p> : null}
      </div>
    </div>
  )
}
