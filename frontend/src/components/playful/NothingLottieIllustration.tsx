import { PublicLottieIllustration } from './PublicLottieIllustration'
import { cn } from '@/lib/utils'

type NothingLottieIllustrationProps = {
  className?: string
}

export function NothingLottieIllustration({ className }: NothingLottieIllustrationProps) {
  return (
    <PublicLottieIllustration
      src="/lotties/nothing.json"
      className={cn('mb-4', className)}
    />
  )
}
