export function hasPublishedCourseReviews(totalReviews?: number | null): boolean {
  return (totalReviews ?? 0) > 0
}

/**
 * Format angka rating ke 1 digit desimal bila ada koma (contoh: 4.7),
 * menjaga tampilan rating tetap rapi dan konsisten di seluruh aplikasi.
 */
export function formatCourseRatingLabel(rating?: number | string | null): string {
  if (rating == null) return '0.0'
  const val = typeof rating === 'string' ? parseFloat(rating) : rating
  if (Number.isNaN(val) || !Number.isFinite(val)) return '0.0'
  return val.toFixed(1)
}
