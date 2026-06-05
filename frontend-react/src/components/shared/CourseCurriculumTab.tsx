import { useMemo, useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, FileText, Film, Layers3, PencilLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CourseDetailModule, IModulesData } from '../../lib/types/course'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

type CourseCurriculumTabProps = {
  modules: Array<CourseDetailModule | IModulesData>
  editHref: string
}

const LESSON_TYPE_CONFIG = {
  video: { icon: Film, label: 'Video', className: 'bg-violet-50 text-violet-600' },
  text: { icon: FileText, label: 'Teks', className: 'bg-sky-50 text-sky-600' },
} as const

export function CourseCurriculumTab({ modules, editHref }: CourseCurriculumTabProps) {
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() => new Set(modules[0] ? [modules[0].uid] : []))

  const totalLessons = useMemo(() => modules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0), [modules])
  const allExpanded = modules.length > 0 && expandedModuleIds.size === modules.length

  const toggleModule = (moduleUid: string) => {
    setExpandedModuleIds((current) => {
      const next = new Set(current)
      if (next.has(moduleUid)) next.delete(moduleUid)
      else next.add(moduleUid)
      return next
    })
  }

  const toggleAll = () => {
    setExpandedModuleIds(allExpanded ? new Set() : new Set(modules.map((module) => module.uid)))
  }

  const moduleEditorHref = (moduleUid: string) => `${editHref}?moduleId=${encodeURIComponent(moduleUid)}`

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Layers3 className="size-4 text-slate-500" />
              Struktur kurikulum
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">Lihat modul dan lesson yang tersusun dalam kursus ini.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {modules.length > 0 ? (
              <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600" onClick={toggleAll}>
                {allExpanded ? 'Tutup semua' : 'Buka semua'}
              </Button>
            ) : null}
            <Button asChild size="sm" className="h-9 rounded-xl px-3 text-xs font-semibold">
              <Link to={editHref}>
                <PencilLine className="size-3.5" />
                Edit kurikulum
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <Layers3 className="size-4 text-primary opacity-70" />
            {modules.length} Modul
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <BookOpen className="size-4 text-primary opacity-70" />
            {totalLessons} Lesson
          </div>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="px-4 py-12 text-center sm:px-5">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Belum ada modul</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">Tambahkan modul di editor agar kurikulum dapat ditampilkan.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {modules.map((module, moduleIndex) => {
            const lessons = module.lessons ?? []
            const expanded = expandedModuleIds.has(module.uid)
            const moduleNumber = module.order_index ?? moduleIndex + 1
            const ModuleChevron = expanded ? ChevronDown : ChevronRight

            return (
              <article key={module.uid}>
                <div className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:px-5">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.uid)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={expanded}
                    aria-label={expanded ? `Tutup lesson ${module.title}` : `Buka lesson ${module.title}`}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold tabular-nums text-slate-600">{moduleNumber}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-slate-950 transition-colors group-hover:text-primary">{module.title}</h4>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{lessons.length} lesson</span>
                      </div>
                    </div>
                    <ModuleChevron className="size-4 shrink-0 text-slate-400 transition-transform duration-200" />
                  </button>

                  <Button asChild variant="outline" size="sm" className="h-8 shrink-0 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <Link to={moduleEditorHref(module.uid)}>
                      <PencilLine className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                </div>

                {expanded ? (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4 pt-2 sm:px-5">
                    {lessons.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-500">Belum ada lesson di modul ini.</div>
                    ) : (
                      <ol className="ml-4 space-y-1 border-l-2 border-slate-200 pl-4">
                        {lessons.map((lesson, lessonIndex) => {
                          const lessonNumber = lesson.order_index ?? lessonIndex + 1
                          const lessonType = lesson.content_type === 'video' ? 'video' : 'text'
                          const { icon: LessonIcon, label, className } = LESSON_TYPE_CONFIG[lessonType]

                          return (
                            <li key={lesson.uid}>
                              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-bold tabular-nums text-slate-500 shadow-xs">{lessonNumber}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <LessonIcon className={cn('size-3.5 shrink-0', className.split(' ')[1])} />
                                    <p className="truncate text-sm font-medium text-slate-900">{lesson.title}</p>
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
