import type { ImgHTMLAttributes, ReactNode } from 'react'

import { resolveSafeImageSrc } from '@/lib/security/safe-external-url'
import { cn } from '@/lib/utils'

type SafeExternalImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string
  fallback?: ReactNode
}

export function SafeExternalImage({
  src,
  alt,
  className,
  fallback = null,
  ...props
}: SafeExternalImageProps) {
  const safeSrc = resolveSafeImageSrc(src)

  if (!safeSrc) {
    return fallback
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={cn(className)}
      {...props}
    />
  )
}
