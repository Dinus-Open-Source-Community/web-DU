import { UserAvatarImage } from '@/components/shared/UserAvatarImage'
import { cn } from '@/lib/utils'

function Profile({
  image,
  name,
  compact = false,
  className,
}: {
  image: string
  name: string
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2',
        compact ? 'max-w-[140px] sm:max-w-[160px]' : 'w-full',
        className,
      )}
    >
      <UserAvatarImage src={image} alt={name} size={compact ? 24 : 28} />
      <p
        className={cn(
          'truncate text-left font-medium',
          compact ? 'text-xs text-ink-700' : 'text-base text-[var(--text-secondary)]',
        )}
      >
        {name}
      </p>
    </div>
  )
}

export { Profile }

