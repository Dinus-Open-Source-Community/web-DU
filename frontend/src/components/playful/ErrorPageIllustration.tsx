import { useEffect, useMemo, useRef, useState } from 'react'
import { useLottie, type LottieRefCurrentProps } from 'lottie-react'
import { useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

type IllustrationVariant = 'not-found' | 'error' | 'forbidden'

type ErrorPageIllustrationProps = {
  variant?: IllustrationVariant
  className?: string
}

/** 404: https://lottiefiles.com/free-animation/404-error-not-found-1dvbamWpXT */
const LOTTIE_SRC: Record<IllustrationVariant, string> = {
  'not-found': '/lotties/404-error-not-found.json',
  error: '/lotties/error-animation.json',
  forbidden: '/lotties/forbidden.json',
}

const LOTTIE_HEIGHT: Record<IllustrationVariant, string> = {
  'not-found': '280px',
  error: '340px',
  forbidden: '300px',
}

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

export function ErrorPageIllustration({
  variant = 'not-found',
  className,
}: ErrorPageIllustrationProps) {
  const reduceMotion = useReducedMotion()
  const [animationData, setAnimationData] = useState<object | null>(null)

  useEffect(() => {
    let cancelled = false
    setAnimationData(null)

    fetch(LOTTIE_SRC[variant])
      .then((response) => {
        if (!response.ok) throw new Error('Lottie fetch failed')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null)
      })

    return () => {
      cancelled = true
    }
  }, [variant])

  const containerStyle = {
    '--lottie-animation-container-width': '100%',
    '--lottie-animation-container-height': LOTTIE_HEIGHT[variant],
    '--lottie-animation-container-background-color': 'transparent',
    '--lottie-animation-margin': '0',
  } as React.CSSProperties

  return (
    <div
      className={cn(
        'relative inline-flex w-full max-w-[20rem] items-center justify-center sm:max-w-[22rem]',
        className,
      )}
      aria-hidden
    >
      <div className="lottie-animation-container" style={containerStyle}>
        {animationData ? (
          <LottieAnimation animationData={animationData} reduceMotion={reduceMotion} />
        ) : (
          <div className="size-full animate-pulse rounded-2xl bg-muted/30" />
        )}
      </div>
    </div>
  )
}
