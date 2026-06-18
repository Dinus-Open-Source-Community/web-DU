import { DotLottieReact } from '@lottiefiles/dotlottie-react'

import { cn } from '@/lib/utils'

type PaymentMotionLottieProps = {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function PaymentMotionLottie({
  src,
  className,
  loop = true,
  autoplay = true,
}: PaymentMotionLottieProps) {
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={cn('h-full w-full', className)}
    />
  )
}
