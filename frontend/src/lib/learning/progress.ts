const COMPLETE_THRESHOLD = 99.995

function clampProgressPercent(value: number) {
  return Math.min(100, Math.max(0, value))
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100
}

/**
 * Normalizes learning progress to a 0–100 percentage.
 * Backend may send a 0–1 fraction (joined courses) or a 0–100 value (enrollment.progress).
 */
export function toLearningProgressPercent(raw: number | null | undefined) {
  if (raw == null || Number.isNaN(raw)) return 0

  const asPercent = raw <= 1 ? raw * 100 : raw
  return roundToTwoDecimals(clampProgressPercent(asPercent))
}

export function formatLearningProgress(raw: number | null | undefined) {
  return toLearningProgressPercent(raw).toFixed(2)
}

export function formatLearningProgressLabel(raw: number | null | undefined) {
  return `${formatLearningProgress(raw)}%`
}

export function isLearningProgressComplete(raw: number | null | undefined) {
  return toLearningProgressPercent(raw) >= COMPLETE_THRESHOLD
}

export function isLearningProgressNotStarted(raw: number | null | undefined) {
  return toLearningProgressPercent(raw) <= 0
}

export function isLearningProgressInProgress(raw: number | null | undefined) {
  const percent = toLearningProgressPercent(raw)
  return percent > 0 && percent < COMPLETE_THRESHOLD
}
