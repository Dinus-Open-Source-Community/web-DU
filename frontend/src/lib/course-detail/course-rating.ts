export function hasPublishedCourseReviews(totalReviews?: number | null): boolean {
  return (totalReviews ?? 0) > 0
}

export function formatCourseRatingLabel(rating?: number | null): string {
  if (rating == null || Number.isNaN(rating)) return '0.0'
  return rating.toFixed(1)
}
