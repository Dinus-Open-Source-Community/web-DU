import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronRight, Circle, Play } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { Progress } from '@/components/ui/progress'
import { useCourseEditData } from '@/hooks/use-course'
import { useCourseLessonReading } from '@/hooks/use-course-lesson-reading'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { flattenLessons, getLessonIcon, moduleProgress } from '@/lib/course-module-viewer/lesson-viewer-utils'
import { formatLearningProgress } from '@/lib/learning/progress'
import { ROUTES } from '@/lib/routes'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'

/** Aturan Lanjutkan: lesson pertama yang belum selesai setelah yang terakhir selesai. */
function findResumeLessonUid(
  lessonUidsInOrder: string[],
  readLessonIds: ReadonlySet<string>,
): string | null {
  return lessonUidsInOrder.find((uid) => !readLessonIds.has(uid)) ?? null
}

export default function CourseLessonsPage() {
  const { courseUid } = useParams()
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  const { courseDetail, modules, lessonsByModule, isLoading } = useCourseEditData(courseUid ?? '')

  const storedModules = useMemo<IModulesDetail[]>(
    () =>
      modules.map((module) => ({
        ...module,
        lessons: lessonsByModule[module.uid] ?? [],
      })),
    [modules, lessonsByModule],
  )

  const { readLessonIds, completedLessonsCount, progressPercent } = useCourseLessonReading({
    courseUid: courseUid ?? '',
    modules: storedModules,
    enabled: isStudent,
  })

  const lessonEntries = useMemo(() => flattenLessons(storedModules), [storedModules])
  const resumeLessonUid = useMemo(
    () =>
      findResumeLessonUid(
        lessonEntries.map((entry) => entry.lesson.uid),
        readLessonIds,
      ),
    [lessonEntries, readLessonIds],
  )

  if (isLoading) {
    return <PageSkeleton message="Memuat daftar materi..." />
  }

  if (!courseUid || !courseDetail.data) {
    return <NotFoundContent />
  }

  const course = courseDetail.data as ICourseDetailItem
  if (isStudent && !isCoursePublished(course)) {
    return <NotFoundContent />
  }

  const viewerHref = ROUTES.viewModuleAndLessons(courseUid)
  const lessonHref = (lessonUid: string) => `${viewerHref}?lesson=${encodeURIComponent(lessonUid)}`
  const allDone = lessonEntries.length > 0 && resumeLessonUid === null

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to={viewerHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Kembali ke materi
        </Link>

        <header className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Daftar Materi
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{course.title}</h1>
          <div className="space-y-2 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-medium text-muted-foreground">
                {completedLessonsCount} dari {lessonEntries.length} materi selesai
              </p>
              <span className="font-semibold tabular-nums text-primary">
                {formatLearningProgress(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} aria-label={`Progres belajar ${formatLearningProgress(progressPercent)} persen`} />
          </div>
          {allDone ? (
            <p className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium">
              <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
              Semua materi selesai. Silakan ulas kembali dari daftar di bawah.
            </p>
          ) : null}
        </header>

        {lessonEntries.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Belum ada materi"
              description="Modul dan lesson untuk kursus ini belum tersedia."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {storedModules.map((mod, moduleIndex) => {
              const lessons = mod.lessons ?? []
              if (lessons.length === 0) return null
              const progress = moduleProgress(mod, readLessonIds)

              return (
                <section key={mod.uid} aria-label={`Modul ${moduleIndex + 1}: ${mod.title}`}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                    <h2 className="min-w-0 truncate text-sm font-semibold sm:text-base">
                      <span className="mr-2 text-muted-foreground">Modul {moduleIndex + 1}</span>
                      {mod.title}
                    </h2>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                      {progress.completedCount}/{progress.totalCount} selesai
                    </span>
                  </div>

                  <ol className="space-y-2">
                    {lessons.map((lesson) => {
                      const isDone = readLessonIds.has(lesson.uid)
                      const isResume = lesson.uid === resumeLessonUid
                      const LessonIcon = getLessonIcon(lesson.content_type)
                      const globalNumber =
                        lessonEntries.findIndex((entry) => entry.lesson.uid === lesson.uid) + 1

                      return (
                        <li key={lesson.uid}>
                          <Link
                            to={lessonHref(lesson.uid)}
                            aria-label={`${isDone ? 'Sudah selesai' : isResume ? 'Lanjutkan' : 'Belum dipelajari'}: ${lesson.title}`}
                            className={cn(
                              'flex items-center gap-3 rounded-xl border bg-card px-3 py-3 transition sm:px-4',
                              'hover:border-primary/50 hover:bg-primary/5',
                              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                              isResume && 'border-primary/60 bg-primary/5',
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
                            ) : (
                              <Circle
                                className={cn(
                                  'size-5 shrink-0',
                                  isResume ? 'text-primary' : 'text-muted-foreground',
                                )}
                                aria-hidden
                              />
                            )}

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                                  {String(globalNumber).padStart(2, '0')}
                                </span>
                                <span className="truncate text-sm font-semibold sm:text-[15px]">
                                  {lesson.title}
                                </span>
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <LessonIcon className="size-3.5" aria-hidden />
                                {lesson.content_type === 'video' ? 'Video' : 'Teks'}
                              </span>
                            </span>

                            {isResume ? (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                                <Play className="size-3.5" aria-hidden />
                                Lanjutkan
                              </span>
                            ) : isDone ? (
                              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                                <CheckCircle2 className="size-4" aria-hidden />
                                Selesai
                              </span>
                            ) : (
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
