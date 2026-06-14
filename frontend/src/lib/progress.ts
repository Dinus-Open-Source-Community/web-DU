/** Normalisasi progress API (0.0–1.0) ke rasio 0–1. */
export function normalizeProgressRatio(progress: number): number {
  const ratio = progress <= 1 ? progress : progress / 100
  return Math.min(1, Math.max(0, ratio))
}

/** Konversi progress API ke persen bulat untuk tampilan UI (0–100). */
export function progressToPercent(progress: number): number {
  return Math.round(normalizeProgressRatio(progress) * 100)
}

export function isProgressComplete(progress: number): boolean {
  return normalizeProgressRatio(progress) >= 1
}

export function isProgressStarted(progress: number): boolean {
  return normalizeProgressRatio(progress) > 0
}

export function isProgressInProgress(progress: number): boolean {
  const ratio = normalizeProgressRatio(progress)
  return ratio > 0 && ratio < 1
}
