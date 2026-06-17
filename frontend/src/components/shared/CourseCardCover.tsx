import { useEffect, useState, type ReactNode } from 'react'

import { useProtectedFile } from '@/hooks/files/use-protected-file'
import { isResolvableProtectedFileReference } from '@/lib/files/parse-protected-file-reference'
import { cn } from '@/lib/utils'

import { CourseCardCoverFallback } from './CourseCardCoverFallback'

/** Frame default cover kursus — ratio 16:9. */
export const COURSE_CARD_COVER_FRAME_CLASS =
  'relative aspect-video w-full overflow-hidden rounded-[10px]'

/** Wrapper standar di card kursus (`CardCourse`, `JoinedCourseCard`, `CardMentor`, dll.). */
export const COURSE_CARD_COVER_CARD_WRAPPER_CLASS =
  'relative aspect-video w-full shrink-0 overflow-hidden rounded-[10px]'

/** Wrapper compact untuk thumbnail (transaksi, ringkasan, dll.). */
export const COURSE_CARD_COVER_COMPACT_WRAPPER_CLASS =
  'relative aspect-video shrink-0 overflow-hidden'

/** Gambar di dalam frame — ratio tetap, isi penuh. */
export const COURSE_CARD_COVER_IMAGE_CLASS =
  'h-full w-full rounded-[10px] object-cover object-center'

type CourseCardCoverFrameProps = {
  className?: string
  children: ReactNode
}

/** Frame cover kursus — bungkus `CourseCardCover` dengan `fill`. */
export function CourseCardCoverFrame({ className, children }: CourseCardCoverFrameProps) {
  return <div className={cn(COURSE_CARD_COVER_CARD_WRAPPER_CLASS, className)}>{children}</div>
}

/** Frame compact — thumbnail transaksi / ringkasan. */
export function CourseCardCoverCompactFrame({ className, children }: CourseCardCoverFrameProps) {
  return <div className={cn(COURSE_CARD_COVER_COMPACT_WRAPPER_CLASS, className)}>{children}</div>
}

type CourseCardCoverProps = {
  src?: string | null
  alt: string
  /** Isi frame parent — wajib untuk semua card kursus. */
  fill?: boolean
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
}

function hasDisplayableSrc(src?: string | null) {
  return Boolean(src?.trim())
}

export function CourseCardCover({
  src,
  alt,
  fill = false,
  className,
  imgClassName,
  loading = 'lazy',
  fetchPriority,
  sizes,
}: CourseCardCoverProps) {
  const [hasError, setHasError] = useState(false)
  const { displayUrl, isLoading } = useProtectedFile(src)

  useEffect(() => {
    setHasError(false)
  }, [displayUrl, src])

  const isProtected = isResolvableProtectedFileReference(src)
  const isWaitingProtected = isProtected && isLoading && !hasDisplayableSrc(displayUrl)
  const showImage = hasDisplayableSrc(displayUrl) && !hasError && !isWaitingProtected

  const mediaClassName = cn(COURSE_CARD_COVER_IMAGE_CLASS, imgClassName, fill ? className : undefined)

  const content = showImage ? (
    <img
      src={displayUrl!}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      sizes={sizes}
      className={mediaClassName}
      onError={() => setHasError(true)}
    />
  ) : (
    <CourseCardCoverFallback className={cn('h-full w-full', fill ? className : undefined)} />
  )

  if (fill) {
    return content
  }

  return <div className={cn(COURSE_CARD_COVER_FRAME_CLASS, className)}>{content}</div>
}
