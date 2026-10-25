import { useMemo, useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, FileText, Film, Layers3, PencilLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ICourseDetailModule, IModulesData } from '../../lib/types/course'
import type { CourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { appCardHeaderClassName, appToolbarPrimaryButtonClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { CourseDetailTabSectionIntro } from '@/components/shared/course-detail-manage/CourseDetailTabSectionIntro'
import { useModulesByCourse } from '@/hooks/use-modules'

type CourseCurriculumTabProps = {
  modules: Array<ICourseDetailModule | IModulesData>
  courseUid: string
  editHref: string
  editNavigationState?: CourseEditNavigationState
}

const LESSON_TYPE_CONFIG = {
  video: { icon: Film, label: 'Video', className: 'bg-violet-50 text-violet-600' },
  text: { icon: FileText, label: 'Teks', className: 'bg-sky-50 text-sky-600' },
} as const

export function CourseCurriculumTab({ modules, courseUid, editHref, editNavigationState }: CourseCurriculumTabProps) {
  const fullModulesQuery = useModulesByCourse(courseUid, { page: 1, per_page: 100 })
  const displayModules = fullModulesQuery.data?.modules ?? modules
  const totalModules = fullModulesQuery.data?.meta.total ?? displayModules.length
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() => new Set(displayModules[0] ? [displayModules[0].uid] : []))

  const totalLessons = useMemo(() => displayModules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0), [displayModules])
  const allExpanded = displayModules.length > 0 && expandedModuleIds.size === displayModules.length

  const toggleModule = (moduleUid: string) => {
    setExpandedModuleIds((current) => {
      const next = new Set(current)
      if (next.has(moduleUid)) next.delete(moduleUid)
      else next.add(moduleUid)
      return next
    })
  }

  const toggleAll = () => {
    setExpandedModuleIds(allExpanded ? new Set() : new Set(displayModules.map((module) => module.uid)))
  }

  const moduleEditorHref = (moduleUid: string) => `${editHref}?moduleId=${encodeURIComponent(moduleUid)}`

  return (
    <section className={manageDetailLayout.sectionCard}>
      <div
        className={cn(
          'flex flex-col gap-4 px-4 py-4 sm:px-5',
          appCardHeaderClassName,
          'border-b pb-4',
        )}
      >
        <CourseDetailTabSectionIntro
          icon={Layers3}
          title="Struktur kurikulum"
          description="Lihat modul dan lesson yang tersusun dalam kursus ini."
          aside={
            <>
              {displayModules.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-sm border-ink-900/10 px-3 text-xs font-semibold text-ink-600 shadow-none"
                  onClick={toggleAll}
                >
                  {allExpanded ? 'Tutup semua' : 'Buka semua'}
                </Button>
              ) : null}
              <Button asChild size="sm" className={cn(appToolbarPrimaryButtonClassName, 'h-9 px-3 text-xs')}>
                <Link to={editHref} state={editNavigationState}>
                  <PencilLine className="size-3.5" />
                  Edit kurikulum
                </Link>
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3 text-sm font-bold text-ink-600">
            <Layers3 className="size-4 text-primary opacity-70" />
            {totalModules} Modul
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-ink-600">
            <BookOpen className="size-4 text-primary opacity-70" />
            {totalLessons} Lesson
          </div>
        </div>
      </div>

      {displayModules.length === 0 ? (
        <div className="px-4 py-12 text-center sm:px-5">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-paper-paper text-ink-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Belum ada modul</h3>
              <p className="mt-1 text-sm leading-6 text-ink-500">Tambahkan modul di editor agar kurikulum dapat ditampilkan.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-line-light">
          {displayModules.map((module, moduleIndex) => {
            const lessons = module.lessons ?? []
            const expanded = expandedModuleIds.has(module.uid)
            const moduleNumber = module.order_index ?? moduleIndex + 1
            const ModuleChevron = expanded ? ChevronDown : ChevronRight

            return (
              <article key={module.uid}>
                <div className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-paper-paper/70 sm:px-5">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.uid)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={expanded}
                    aria-label={expanded ? `Tutup lesson ${module.title}` : `Buka lesson ${module.title}`}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-paper-paper text-xs font-bold tabular-nums text-ink-600">{moduleNumber}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-ink-900 transition-colors group-hover:text-primary">{module.title}</h4>
                        <span className="shrink-0 text-xs font-normal tabular-nums text-ink-500">· {lessons.length} lesson</span>
                      </div>
                    </div>
                    <ModuleChevron className="size-4 shrink-0 text-ink-400 transition-transform duration-200" />
                  </button>

                  <Button asChild variant="outline" size="sm" className="h-8 shrink-0 rounded-sm border-line-light px-3 text-xs font-semibold text-ink-600 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <Link to={moduleEditorHref(module.uid)}>
                      <PencilLine className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                </div>

                {expanded ? (
                  <div className="border-t border-line-light bg-paper-paper/50 px-4 pb-4 pt-2 sm:px-5">
                    {lessons.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-line-light bg-paper-white px-4 py-5 text-center text-sm text-ink-500">Belum ada lesson di modul ini.</div>
                    ) : (
                      <ol className="ml-4 space-y-1 border-l-2 border-line-light pl-4">
                        {lessons.map((lesson, lessonIndex) => {
                          const lessonNumber = lesson.order_index ?? lessonIndex + 1
                          const lessonType = lesson.content_type === 'video' ? 'video' : 'text'
                          const { icon: LessonIcon, label, className } = LESSON_TYPE_CONFIG[lessonType]

                          return (
                            <li key={lesson.uid}>
                              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-paper-white">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-paper-white text-[11px] font-bold tabular-nums text-ink-500 shadow-xs">{lessonNumber}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <LessonIcon className={cn('size-3.5 shrink-0', className.split(' ')[1])} />
                                    <p className="truncate text-sm font-medium text-ink-900">{lesson.title}</p>
                                  </div>
                                </div>
                                <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold', className)}>{label}</span>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    )}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
