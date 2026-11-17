import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, ClipboardList, Film, FileText } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { getCourseModuleViewerBackHref, type CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'
import { lessonViewerSurfaceClassName } from '@/lib/course-module-viewer/lesson-viewer-surface'
import { LESSON_SIDEBAR_WIDTH_PX, type LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'
import type { LessonDeliveryType } from '@/lib/types/course'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useAppTheme } from '@/providers/theme-provider'

import { LessonViewerHeader } from './LessonViewerHeader'

const LESSON_SIDEBAR_TOGGLE_PX = 28
const noop = () => {}

type LessonViewerSkeletonProps = {
  backHref: string
  theme: LessonThemeMode
  lessonType?: LessonDeliveryType
  pane?: 'lesson' | 'assignment' | 'assignment-detail' | 'assignment-work'
  taskType?: 'text' | 'quiz'
}

type LessonContentSkeletonProps = {
  theme: LessonThemeMode
  type?: LessonDeliveryType
}

/**
 * Fallback Suspense route `/dashboard/learning/courses/:courseUid(/:lessonUid)` dan
 * `/course/:courseUid/view(/:lessonUid)`. Memakai kerangka `LessonViewerSkeleton`
 * yang identik dengan kondisi loading di `CourseViewPage`, sehingga saat refresh
 * pengguna hanya melihat satu skeleton tanpa `PageSkeleton` generik di awal.
 */
export function LessonViewerRouteFallback() {
  const location = useLocation()
  const { role } = useAuth()
  const { theme } = useAppTheme()

  const courseUid = extractCourseUidFromPathname(location.pathname)
  const searchParams = new URLSearchParams(location.search)
  const pane = searchParams.get('pane') === 'assignment' ? 'assignment' : 'lesson'
  const backHref = getCourseModuleViewerBackHref(
    (role ?? 'student') as CourseModulePreviewVariant,
    courseUid,
    location.pathname,
  )

  return <LessonViewerSkeleton backHref={backHref} theme={theme} pane={pane} />
}

function extractCourseUidFromPathname(pathname: string): string {
  const dashboardPrefix = '/dashboard/learning/courses/'
  if (pathname.startsWith(dashboardPrefix)) {
    return pathname.slice(dashboardPrefix.length).split('/')[0] ?? ''
  }

  const coursePrefix = '/course/'
  if (pathname.startsWith(coursePrefix)) {
    return pathname.slice(coursePrefix.length).split('/')[0] ?? ''
  }

  return ''
}

export function LessonViewerSkeleton({
  backHref,
  theme,
  lessonType = 'text',
  pane = 'lesson',
  taskType,
}: LessonViewerSkeletonProps) {
  const isDark = theme === 'dark'

  return (
    <section
      role="status"
      aria-busy="true"
      className={cn(
        lessonViewerSurfaceClassName,
        'relative min-h-dvh overflow-hidden bg-background text-foreground',
      )}
      data-lesson-theme={theme}
    >
      <span className="sr-only">Memuat lesson...</span>

      <LessonViewerHeader
        backHref={backHref}
        theme={theme}
        onOpenSearch={noop}
        onOpenModules={noop}
      />

      <div className="lg:ml-[348px]">
        {pane === 'lesson' ? (
          <LessonContentSkeleton theme={theme} type={lessonType} />
        ) : (
          <LessonAssignmentSkeleton theme={theme} pane={pane} taskType={taskType} />
        )}
      </div>

      {pane === 'lesson' || pane === 'assignment' ? (
        <footer
          className={cn(
            'fixed right-0 bottom-0 left-0 z-40 border-t pb-[env(safe-area-inset-bottom)]',
            isDark
              ? 'border-zinc-800 bg-zinc-950 text-zinc-100'
              : 'border-line-light bg-paper-white text-ink-900',
          )}
        >
          <div className="flex min-h-[4.25rem] items-center justify-between gap-2 px-3 py-2 sm:min-h-[4.75rem] sm:gap-3 sm:px-6 sm:py-0">
            <div className="flex min-w-0 max-w-[42%] items-center gap-2 px-1 py-1 sm:max-w-[34%] sm:gap-3 sm:px-2 sm:py-2">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border sm:h-9 sm:w-9',
                  isDark ? 'border-zinc-700 bg-zinc-900' : 'border-line-light bg-paper-paper',
                )}
              >
                <ChevronLeft className="h-4 w-4 opacity-40" aria-hidden />
              </span>
              <div className="hidden min-w-0 space-y-1 sm:block">
                <Skeleton className="h-3.5 w-16 rounded-sm" />
                <Skeleton className="h-4 w-36 rounded-sm" />
              </div>
            </div>

            <div
              className={cn(
                'hidden max-w-[26%] border px-3 py-1.5 md:block md:px-4 md:py-2',
                isDark ? 'border-zinc-800 bg-zinc-900' : 'border-line-light bg-paper-paper',
              )}
            >
              <Skeleton className="h-4 w-40 rounded-sm" />
            </div>

            <div className="flex min-w-0 max-w-[42%] items-center justify-end gap-2 px-1 py-1 sm:max-w-[34%] sm:gap-3 sm:px-2 sm:py-2">
              <div className="hidden min-w-0 space-y-1 text-right sm:block">
                <Skeleton className="ml-auto h-3.5 w-16 rounded-sm" />
                <Skeleton className="ml-auto h-4 w-36 rounded-sm" />
              </div>
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border sm:h-9 sm:w-9',
                  isDark ? 'border-zinc-700 bg-zinc-900' : 'border-line-light bg-paper-paper',
                )}
              >
                <ChevronRight className="h-4 w-4 opacity-40" aria-hidden />
              </span>
            </div>
          </div>
        </footer>
      ) : null}

      <div
        className="fixed top-16 left-0 z-30 hidden h-[calc(100dvh-4rem)] lg:block"
        style={{ width: LESSON_SIDEBAR_WIDTH_PX + LESSON_SIDEBAR_TOGGLE_PX }}
      >
        <aside
          className={cn(
            'absolute top-0 left-0 flex h-full flex-col overflow-hidden border-r',
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-zinc-100'
              : 'border-line-light bg-paper-white text-ink-900',
          )}
          style={{ width: LESSON_SIDEBAR_WIDTH_PX }}
        >
          <div
            className={cn(
              'border-b px-4 py-4 sm:px-5 sm:py-5',
              isDark ? 'border-zinc-800' : 'border-line-light',
            )}
          >
            <Skeleton className="h-6 w-3/4 rounded-sm" />
          </div>

          <div
            className={cn(
              'border-b px-4 py-3 sm:px-5 sm:py-4',
              isDark ? 'border-zinc-800' : 'border-line-light',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-ink-600')}>
                Progress belajar
              </p>
              <Skeleton className="h-5 w-10 rounded-sm" />
            </div>
            <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
            <div
              className={cn(
                'border-b py-2',
                isDark ? 'border-zinc-800 bg-zinc-800/60' : 'border-line-light bg-paper-paper',
              )}
            >
              <div className="flex w-full items-start gap-3 rounded-md px-3 py-3">
                <ChevronDown
                  aria-hidden
                  className={cn('mt-1 h-4 w-4 shrink-0', isDark ? 'text-zinc-200' : 'text-ink-700')}
                />
                <Skeleton className="my-1 h-4 flex-1 rounded-sm" />
                <Skeleton className="my-1 h-4 w-8 shrink-0 rounded-sm" />
              </div>

              <div
                className={cn(
                  'ml-6 border-l pb-2 pl-4',
                  isDark ? 'border-zinc-700' : 'border-line-light',
                )}
              >
                {[0, 1, 2, 3].map((index) => {
                  const isActiveRow = index === (pane === 'lesson' ? 0 : 1)
                  return (
                    <div
                      key={index}
                      className={cn(
                        'relative flex w-full items-start gap-3 px-3 py-2 text-left text-sm leading-6',
                        isActiveRow && (isDark ? 'bg-zinc-800' : 'bg-paper-paper'),
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-3 -left-[23px] flex h-3.5 w-3.5 items-center justify-center',
                          isDark ? 'bg-zinc-800' : 'bg-paper-paper',
                        )}
                      >
                        {index === 0 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden />
                        ) : (
                          <Circle
                            className={cn(
                              'h-2.5 w-2.5',
                              isDark
                                ? 'fill-muted-foreground text-muted-foreground'
                                : 'fill-ink-400 text-ink-400',
                            )}
                            aria-hidden
                          />
                        )}
                      </span>
                      {index === 1 ? (
                        <ClipboardList
                          className={cn(
                            'mt-1 h-4 w-4 shrink-0',
                            pane !== 'lesson'
                              ? 'text-primary'
                              : isDark
                                ? 'text-zinc-500'
                                : 'text-ink-400',
                          )}
                          aria-hidden
                        />
                      ) : index === 2 && lessonType === 'video' ? (
                        <Film
                          className={cn(
                            'mt-1 h-4 w-4 shrink-0',
                            isDark ? 'text-zinc-500' : 'text-ink-400',
                          )}
                          aria-hidden
                        />
                      ) : (
                        <FileText
                          className={cn(
                            'mt-1 h-4 w-4 shrink-0',
                            index === 0 && pane === 'lesson'
                              ? 'text-primary'
                              : isDark
                                ? 'text-zinc-500'
                                : 'text-ink-400',
                          )}
                          aria-hidden
                        />
                      )}
                      <Skeleton
                        className={cn(
                          'my-1 h-4 rounded-sm',
                          index === 0 ? 'w-40' : index === 1 ? 'w-36' : index === 2 ? 'w-44' : 'w-32',
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {[0, 1].map((index) => (
              <div
                key={index}
                className={cn(
                  'border-b py-2 last:border-b-0',
                  isDark ? 'border-zinc-800' : 'border-line-light',
                )}
              >
                <div className="flex w-full items-start gap-3 rounded-md px-3 py-3">
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'mt-1 h-4 w-4 shrink-0 -rotate-90',
                      isDark ? 'text-zinc-400' : 'text-ink-400',
                    )}
                  />
                  <Skeleton className="my-1 h-4 flex-1 rounded-sm" />
                  <Skeleton className="my-1 h-4 w-8 shrink-0 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div
          className={cn(
            'absolute top-1/2 z-40 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0',
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-zinc-400 shadow-[2px_0_6px_rgba(0,0,0,0.3)]'
              : 'border-line-light bg-paper-white text-ink-400 shadow-[2px_0_5px_rgba(15,23,42,0.06)]',
          )}
          style={{ left: LESSON_SIDEBAR_WIDTH_PX - 1 }}
          aria-hidden
        >
          <ChevronLeft className="size-3.5" />
        </div>
      </div>
    </section>
  )
}

export function LessonContentSkeleton({ theme, type = 'text' }: LessonContentSkeletonProps) {
  const isDark = theme === 'dark'

  return (
    <main
      role="status"
      aria-busy="true"
      className="min-h-dvh px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-28 md:px-8 lg:px-10 lg:pt-26"
    >
      <span className="sr-only">Memuat konten lesson...</span>
      <div className="mx-auto flex w-full max-w-7xl justify-center">
        <article className="w-full max-w-[920px]">
          {type === 'video' ? (
            <div
              className={cn(
                'mx-auto w-full max-w-[920px] overflow-hidden rounded-lg border',
                isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-line-light bg-paper-paper',
              )}
            >
              <Skeleton className="aspect-video w-full rounded-none" />
            </div>
          ) : (
            <LessonRichTextSkeleton isDark={isDark} />
          )}
        </article>
      </div>
    </main>
  )
}

/**
 * Kerangka konten artikel lesson (`LessonRichContent` / `.ProseMirror`):
 * judul `h2` · paragraf pembuka · subjudul `h3` + daftar poin (`ul > li`) ·
 * subjudul `h3` + paragraf + kotak tips (`blockquote`) · subjudul `h3` + ringkasan.
 */
function LessonRichTextSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-4">
      {/* h2 judul lesson */}
      <Skeleton className="mt-4 mb-2 h-8 w-80 max-w-[85%] rounded-sm" />

      {/* paragraf pembuka */}
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-full rounded-sm" />
        <Skeleton className="h-4 w-[88%] rounded-sm" />
      </div>

      {/* h3 Tujuan Pembelajaran + ul > li */}
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-6 w-48 rounded-sm" />
        <div className="space-y-2.5 pl-6">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Skeleton className="size-1.5 shrink-0 rounded-full" />
              <Skeleton
                className={cn(
                  'h-4 rounded-sm',
                  item === 0 ? 'w-[62%]' : item === 1 ? 'w-[74%]' : 'w-[58%]',
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* h3 Materi Inti + paragraf + blockquote */}
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-6 w-32 rounded-sm" />
        <Skeleton className="h-4 w-full rounded-sm" />
        <Skeleton className="h-4 w-[90%] rounded-sm" />
        <div
          className={cn(
            'my-3 space-y-2 rounded-lg border-l-[3px] px-4 py-3.5',
            isDark ? 'border-zinc-700 bg-primary/14' : 'border-primary bg-primary/10',
          )}
        >
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-[72%] rounded-sm" />
        </div>
      </div>

      {/* h3 Ringkasan + paragraf penutup */}
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-6 w-28 rounded-sm" />
        <Skeleton className="h-4 w-full rounded-sm" />
        <Skeleton className="h-4 w-[82%] rounded-sm" />
      </div>
    </div>
  )
}

export function LessonAssignmentSkeleton({
  theme,
  pane,
  taskType,
  withSidebar = false,
}: {
  theme: LessonThemeMode
  pane: 'assignment' | 'assignment-detail' | 'assignment-work'
  taskType?: 'text' | 'quiz'
  withSidebar?: boolean
}) {
  const isDark = theme === 'dark'

  return (
    <main
      role="status"
      aria-busy="true"
      className={cn(
        'min-h-dvh px-4 pt-20 pb-28 sm:px-6 sm:pt-24 md:px-8 lg:px-10',
        withSidebar && 'lg:ml-[348px] lg:pt-26',
      )}
    >
      <span className="sr-only">Memuat data tugas...</span>
      <div
        className={cn(
          'mx-auto w-full max-w-3xl',
          pane === 'assignment' ? 'space-y-8' : 'space-y-6',
        )}
      >
        {pane === 'assignment-detail' ? (
          <>
            <Skeleton className="-ml-2 h-9 w-36 rounded-sm" />
            <header className="space-y-3">
              <Skeleton className="h-4 w-36 rounded-sm" />
              <Skeleton className="h-8 w-2/3 max-w-md rounded-sm sm:h-9" />
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-5 w-48 rounded-sm" />
                <Skeleton className="h-5 w-24 rounded-sm" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </header>
            <section
              className={cn(
                'min-h-56 space-y-4 rounded-2xl border p-5',
                isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-line-light bg-paper-white',
              )}
            >
              <Skeleton className="h-5 w-36 rounded-sm" />
              <Skeleton className="h-4 w-full rounded-sm" />
              <Skeleton className="h-4 w-[82%] rounded-sm" />
            </section>
          </>
        ) : pane === 'assignment' ? (
          <>
            {/* Header LessonAssignmentOverview */}
            <header className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-36 shrink-0 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-2/3 max-w-md rounded-sm sm:h-9" />
                <Skeleton className="h-5 w-52 rounded-sm" />
              </div>
            </header>

            {/* Section Instruksi */}
            <section
              className={cn(
                'space-y-3 border-t pt-5',
                isDark ? 'border-zinc-800' : 'border-ink-900/10',
              )}
            >
              <Skeleton className="h-5 w-20 rounded-sm" />
              <div className="space-y-2.5">
                <Skeleton className="h-6 w-64 max-w-[80%] rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-[88%] rounded-sm" />
              </div>
              <div
                className={cn(
                  'my-3 space-y-2 rounded-lg border-l-[3px] px-4 py-3.5',
                  isDark ? 'border-zinc-700 bg-primary/14' : 'border-primary bg-primary/10',
                )}
              >
                <Skeleton className="h-4 w-[84%] rounded-sm" />
              </div>
              <Skeleton className="h-5 w-36 rounded-sm" />
            </section>

            {/* Section Riwayat pengumpulan (AssignmentSubmissionHistorySection) */}
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-6 w-44 rounded-sm" />
                  <Skeleton className="h-5 w-72 max-w-full rounded-sm" />
                </div>
                <Skeleton className="h-9 w-full shrink-0 rounded-sm sm:w-32" />
              </div>
              <div
                className={cn(
                  'rounded-xl border px-4 py-8',
                  isDark ? 'border-zinc-800' : 'border-line-light',
                )}
              >
                <Skeleton className="mx-auto h-5 w-44 rounded-sm" />
              </div>
            </section>
          </>
        ) : (
          /* pane === 'assignment-work' (LessonAssignmentWork) */
          <>
            <header className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-sm" />
                  <Skeleton className="h-8 w-64 max-w-full rounded-sm" />
                </div>
                <Skeleton className="h-8 w-36 shrink-0 rounded-lg" />
              </div>
            </header>

            <section
              className={cn(
                'space-y-4 border-t pt-6',
                isDark ? 'border-zinc-800' : 'border-ink-900/10',
              )}
            >
              <Skeleton className="h-5 w-32 rounded-sm" />
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-[88%] rounded-sm" />
              </div>
            </section>

            {taskType === 'quiz' ? (
              <section
                className={cn(
                  'space-y-8 border-t pt-6',
                  isDark ? 'border-zinc-800' : 'border-input',
                )}
              >
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className={cn(
                      'space-y-4 border-b pb-8 last:border-b-0 last:pb-0',
                      isDark ? 'border-zinc-800' : 'border-input',
                    )}
                  >
                    <Skeleton className="h-5 w-[78%] rounded-sm" />
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((option) => (
                        <div
                          key={option}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        >
                          <Skeleton className="size-4 shrink-0 rounded-full" />
                          <Skeleton
                            className={cn('h-4 rounded-sm', option % 2 ? 'w-36' : 'w-48')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <section
                className={cn(
                  'space-y-6 border-t pt-6',
                  isDark ? 'border-zinc-800' : 'border-input',
                )}
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20 rounded-sm" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-20 rounded-sm" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded-sm" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </div>
                </div>
              </section>
            )}

            <div
              className={cn(
                'flex flex-wrap justify-end gap-2 border-t pt-6',
                isDark ? 'border-zinc-800' : 'border-input',
              )}
            >
              <Skeleton className="h-9 w-24 rounded-sm" />
              <Skeleton className="h-9 w-28 rounded-sm" />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
