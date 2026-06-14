import { Suspense, lazy, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

const DotLottieReact = lazy(() => import('@lottiefiles/dotlottie-react').then((mod) => ({ default: mod.DotLottieReact })))

interface SafeLottieProps {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function SafeLottie({ src, className, loop = true, autoplay = true }: SafeLottieProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div aria-hidden className={cn('h-full w-full animate-pulse rounded-xl bg-slate-200/70', className)} />
  }

  return (
    <Suspense fallback={<div aria-hidden className={cn('h-full w-full animate-pulse rounded-xl bg-slate-200/70', className)} />}>
      <DotLottieReact src={src} loop={loop} autoplay={autoplay} className={cn('h-full w-full', className)} />
    </Suspense>
  )
}
