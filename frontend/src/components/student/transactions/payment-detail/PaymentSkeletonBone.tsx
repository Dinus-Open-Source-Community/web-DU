export function PaymentSkeletonBone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200/60 ${className ?? ''}`} />
  )
}
