import { PublicLottieIllustration } from './PublicLottieIllustration'

type NothingTransactionLottieIllustrationProps = {
  className?: string
  height?: string
}

export function NothingTransactionLottieIllustration({
  className,
  height = '200px',
}: NothingTransactionLottieIllustrationProps) {
  return (
    <PublicLottieIllustration
      src="/lotties/nothing-transaction.json"
      height={height}
      className={className}
    />
  )
}
