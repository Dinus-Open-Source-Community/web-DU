import type { LessonDetailItem } from '@/lib/types/lesson'

type ResolveActiveLessonOptions = {
  /** List lesson dari `GET /lessons` tidak memuat assignment — jangan dipakai untuk student. */
  allowListFallback?: boolean
}

export function resolveActiveLessonDetail(
  activeLessonId: string | null,
  detailByUid: ReadonlyMap<string, LessonDetailItem>,
  fetchedDetail: LessonDetailItem | null | undefined,
  fallbackLesson: LessonDetailItem | null | undefined,
  options: ResolveActiveLessonOptions = {},
): LessonDetailItem | null {
  if (!activeLessonId) return null

  const allowListFallback = options.allowListFallback !== false

  const cachedDetail = detailByUid.get(activeLessonId)
  if (cachedDetail) return cachedDetail

  if (fetchedDetail?.uid === activeLessonId) return fetchedDetail

  if (allowListFallback && fallbackLesson?.uid === activeLessonId) {
    return fallbackLesson
  }

  return fetchedDetail ?? (allowListFallback ? fallbackLesson ?? null : null)
}

export function hasResolvedLessonDetail(
  activeLessonId: string | null,
  detailByUid: ReadonlyMap<string, LessonDetailItem>,
  fetchedDetail: LessonDetailItem | null | undefined,
): boolean {
  if (!activeLessonId) return false
  if (detailByUid.has(activeLessonId)) return true
  return fetchedDetail?.uid === activeLessonId
}

export function isActiveLessonDetailPending(
  activeLessonId: string | null,
  detailByUid: ReadonlyMap<string, LessonDetailItem>,
  fetchedDetail: LessonDetailItem | null | undefined,
  isPrefetchLoading: boolean,
  isFetchedDetailLoading: boolean,
): boolean {
  if (!activeLessonId) return false
  if (hasResolvedLessonDetail(activeLessonId, detailByUid, fetchedDetail)) return false
  return isPrefetchLoading || isFetchedDetailLoading
}
