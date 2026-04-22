'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
)

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

  return <DotLottieReact src={src} loop={loop} autoplay={autoplay} className={cn('h-full w-full', className)} />
}
