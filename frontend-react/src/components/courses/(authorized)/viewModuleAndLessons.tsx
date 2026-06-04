import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight, FileText, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import '@/styles/tiptap-editor.css'
import { EmptyState } from '@/components/shared/EmptyState'
import type { ICourseDetailItem, IModulesDetail, LessonContentType } from '@/lib/types/course'
import type { ICardData } from '@/lib/types/utils'
import { Link } from 'react-router-dom'

export type CourseModulePreviewVariant = 'mentor' | 'student' | 'admin'

type CourseModulePreviewProps = {
  courseUid: string
  variant: CourseModulePreviewVariant
  mentorCourse: ICourseDetailItem
  repoCourse?: ICardData
  storedModules: IModulesDetail[]
}

const ICON_MAP: Record<LessonContentType, typeof FileText> = {
  video: Film,
  text: FileText,
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      if (match) return `https://player.vimeo.com/video/${match[1]}`
    }
  } catch {
    return null
  }
  return null
}

export function CourseModulePreview({ courseUid, variant, mentorCourse, repoCourse, storedModules }: CourseModulePreviewProps) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const courseTitle = mentorCourse?.title ?? repoCourse?.title ?? ''
  const modulesState = storedModules

  const effectiveActiveLessonId = useMemo(() => {
    return activeLessonId ?? storedModules?.[0]?.lessons[0]?.uid ?? null
  }, [activeLessonId, storedModules])

  const effectiveExpandedModules = useMemo(() => {
    if (expandedModules.size > 0) return expandedModules
    const firstModuleId = storedModules?.[0]?.uid
    return firstModuleId ? new Set([firstModuleId]) : expandedModules
  }, [expandedModules, storedModules])

  const activeLesson = useMemo(() => {
    if (!modulesState || !effectiveActiveLessonId) return null

    for (const mod of modulesState) {
      const lesson = mod.lessons.find((l) => l.uid === effectiveActiveLessonId)
      if (lesson) return lesson
    }
    return null
  }, [modulesState, effectiveActiveLessonId])

  const activeModuleForLesson = useMemo(() => {
    if (!modulesState || !effectiveActiveLessonId) return null

    return modulesState.find((mod) => mod.lessons.some((l) => l.uid === effectiveActiveLessonId)) ?? null
  }, [modulesState, effectiveActiveLessonId])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  if (courseTitle === undefined || !modulesState) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat preview kursus…</p>
      </section>
    )
  }

  if (courseTitle === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link to={variant === 'mentor' ? `/mentor/courses/${courseUid}` : '/student/learning'}>Kembali</Link>
        </Button>
      </section>
    )
  }

  const backHref = variant === 'mentor' ? `/mentor/courses/${courseUid}` : variant === 'admin' ? `/admin/courses/${courseUid}` : '/student/learning'

  return (
    <section className="flex w-full flex-col gap-8 px-8 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="w-fit gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground">
          <Link to={backHref}>
            <ArrowLeft className="size-3.5 opacity-80" aria-hidden />
            Kembali
          </Link>
        </Button>
        <h1 className="text-sm font-semibold text-slate-700">{courseTitle}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 lg:sticky lg:top-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Daftar materi</p>
          <div className="space-y-1">
            {modulesState.map((mod, mi) => {
              const isExpanded = effectiveExpandedModules.has(mod.uid)
              return (
                <div key={mod.uid}>
                  <button type="button" onClick={() => toggleModule(mod.uid)} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left hover:bg-slate-50">
                    {isExpanded ? <ChevronDown className="size-3 shrink-0 text-slate-400" /> : <ChevronRight className="size-3 shrink-0 text-slate-400" />}
                    <span className="flex-1 text-xs font-semibold text-slate-700">
                      {mi + 1}. {mod.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{mod.lessons.length}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5 pb-1">
                      {mod.lessons.map((lesson) => {
                        const isActive = lesson.uid === effectiveActiveLessonId
                        const Icon = ICON_MAP[lesson.content_type]
                        return (
                          <button
                            key={lesson.uid}
                            type="button"
                            onClick={() => {
                              setActiveLessonId(lesson.uid)
                              setExpandedModules((prev) => new Set(prev).add(mod.uid))
                            }}
                            className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              isActive ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                            }`}>
                            <Icon className="size-3 shrink-0" />
                            <span className="flex-1 truncate">{lesson.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {variant === 'mentor' ||
            (variant === 'admin' && activeModuleForLesson && (
              <Button asChild className="mt-4 w-full rounded-xl" size="sm">
                <Link to={`/mentor/courses/${courseUid}/edit?moduleId=${activeModuleForLesson.uid}`}>Edit Module</Link>
              </Button>
            ))}
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {activeLesson?.content_type === 'video' ? 'Video' : activeLesson?.content_type === 'text' ? 'Text' : 'Quiz'}
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">{activeLesson?.title ?? 'Pilih lesson'}</h2>
            </div>
          </div>

          {activeLesson ? (
            <>
              {activeLesson.content_type === 'text' &&
                (activeLesson.content ? (
                  <div className="tiptap-editor-root tiptap-preview">
                    <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                ) : (
                  <EmptyState title="Type bukan html" />
                ))}

              {activeLesson.content_type === 'video' && (
                <div className="space-y-4">
                  {(() => {
                    const embed = getEmbedUrl(activeLesson.video_url)
                    if (embed) {
                      return (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              src={embed}
                              title={activeLesson.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 h-full w-full"
                            />
                          </div>
                        </div>
                      )
                    }
                    if (activeLesson.video_url) {
                      return (
                        <video controls className="w-full rounded-xl">
                          <source src={activeLesson.video_url} />
                        </video>
                      )
                    }
                    return <EmptyState title="Video not found" />
                  })()}
                  {activeLesson.content && (
                    <div className="tiptap-editor-root tiptap-preview">
                      <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Bentar Mikir Dulu" />
          )}
        </div>
      </div>
    </section>
  )
}
