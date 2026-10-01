export function PaymentSkeletonBone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted/60 ${className ?? ''}`} />
  )
}
