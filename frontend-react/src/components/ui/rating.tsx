import { Star } from 'lucide-react'

interface RatingProps {
  rating: number
  totalReviews: number
}

function Rating({ rating, totalReviews }: RatingProps) {
  const formattedReviews = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(totalReviews)

  return (
    <div className="flex items-center gap-0.5 text-sm">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />

      <span className="leading-[1.3] font-normal text-[var(--text-secondary)]">{rating.toFixed(1)}</span>
      <span className="leading-[1.3] font-normal text-[var(--text-secondary)]">({formattedReviews})</span>
    </div>
  )
}

export { Rating }
