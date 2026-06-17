import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'

import { useProtectedFile } from '@/hooks/files/use-protected-file'
import { cn } from '@/lib/utils'

type UserAvatarImageProps = {
  src?: string | null
  alt: string
  className?: string
  iconClassName?: string
  size?: number
}

function hasDisplayableSrc(src?: string | null) {
  return Boolean(src?.trim())
}

export function UserAvatarImage({
  src,
  alt,
  className,
  iconClassName,
  size = 28,
}: UserAvatarImageProps) {
  const [hasError, setHasError] = useState(false)
  const { displayUrl } = useProtectedFile(src)

  useEffect(() => {
    setHasError(false)
  }, [displayUrl, src])

  const showImage = hasDisplayableSrc(displayUrl) && !hasError

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={displayUrl!}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
          onError={() => setHasError(true)}
        />
      ) : (
        <UserRound className={cn('size-4', iconClassName)} aria-hidden />
      )}
    </div>
  )
}
