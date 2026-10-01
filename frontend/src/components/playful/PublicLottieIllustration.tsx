import { useEffect, useMemo, useRef, useState } from 'react'
import { useLottie, type LottieRefCurrentProps } from 'lottie-react'
import { useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

function LottieAnimation({
  animationData,
  reduceMotion,
}: {
  animationData: object
  reduceMotion: boolean | null
}) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  const options = useMemo(
    () => ({
      animationData,
      loop: !reduceMotion,
      autoplay: !reduceMotion,
      lottieRef,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    }),
    [animationData, reduceMotion],
  )

  const { View, play, goToAndStop } = useLottie(options, {
    width: '100%',
    height: '100%',
  })

  useEffect(() => {
    if (reduceMotion) {
      goToAndStop(0, true)
      return
    }
    play()
  }, [goToAndStop, play, reduceMotion])

  return View
}

export type PublicLottieIllustrationProps = {
  src: string
  height?: string
  className?: string
  maxWidthClassName?: string
  /** Ditampilkan jika fetch `src` gagal (mis. file belum ada di `public/`). */
  fallbackImageSrc?: string
}

export function PublicLottieIllustration({
  src,
  height = '200px',
  className,
  maxWidthClassName = 'max-w-[16rem] sm:max-w-[18rem]',
  fallbackImageSrc,
}: PublicLottieIllustrationProps) {
  const reduceMotion = useReducedMotion()
  const [animationData, setAnimationData] = useState<object | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setAnimationData(null)
    setLoadFailed(false)

    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error('Lottie fetch failed')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        if (!cancelled) {
          setAnimationData(null)
          setLoadFailed(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [src])

  const containerStyle = {
    '--lottie-animation-container-width': '100%',
    '--lottie-animation-container-height': height,
    '--lottie-animation-container-background-color': 'transparent',
    '--lottie-animation-margin': '0',
  } as React.CSSProperties

  return (
    <div
      className={cn(
        'relative inline-flex w-full items-center justify-center',
        maxWidthClassName,
        className,
      )}
      aria-hidden
    >
      <div className="lottie-animation-container" style={containerStyle}>
        {animationData ? (
          <LottieAnimation animationData={animationData} reduceMotion={reduceMotion} />
        ) : loadFailed && fallbackImageSrc ? (
          <img
            src={fallbackImageSrc}
            alt=""
            className="mx-auto h-full w-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="size-full animate-pulse rounded-2xl bg-muted/30" />
        )}
      </div>
    </div>
  )
}
