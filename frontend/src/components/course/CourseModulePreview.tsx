'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronRight, FileText, Film, HelpCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ICourseModulesState, ILesson, IModule, LessonContentType } from '@/lib/types'
import { getMentorCourseByUid, getSessionCourseModules } from '@/lib/mentorCourseStorage'
import { getCourseByUid } from '@/lib/data/repository'
import '@/styles/tiptap-editor.css'

export type CourseModulePreviewVariant = 'mentor' | 'student' | 'admin'

type CourseModulePreviewProps = {
  courseUid: string
  variant: CourseModulePreviewVariant
}

const ICON_MAP: Record<LessonContentType, typeof FileText> = {
  tiptap: FileText,
  video: Film,
  quiz: HelpCircle,
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
    /* invalid url */
  }
  return null
}

function QuizViewer({ lesson }: { lesson: Extract<ILesson, { contentType: 'quiz' }> }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const { quiz } = lesson
  const score = useMemo(() => {
    if (!submitted) return 0
    let correct = 0
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctOptionId) correct++
    }
    return quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0
  }, [submitted, answers, quiz])

  const passed = score >= (quiz.passingScore ?? 70)

  return (
    <div className="space-y-4">
      {quiz.questions.map((q, qi) => {
        const userAnswer = answers[q.id]
        return (
          <div key={q.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-sm font-medium text-slate-800">
              <span className="mr-1.5 text-xs font-bold text-slate-500">Q{qi + 1}</span>
              {q.prompt}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt) => {
                const isSelected = userAnswer === opt.id
                const isCorrect = submitted && opt.id === q.correctOptionId
                const isWrong = submitted && isSelected && opt.id !== q.correctOptionId
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : isWrong
                          ? 'border-red-300 bg-red-50 text-red-800'
                          : isSelected
                            ? 'border-slate-400 bg-slate-100 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isCorrect && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
                    {isWrong && <XCircle className="size-4 shrink-0 text-red-500" />}
                    {!isCorrect && !isWrong && (
                      <span className={`flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${isSelected ? 'border-slate-400 bg-slate-200' : 'border-slate-300'}`}>
                        {String.fromCharCode(65 + q.options.indexOf(opt))}
                      </span>
                    )}
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">{q.explanation}</p>
            )}
          </div>
        )
      })}

      {!submitted ? (
        <Button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < quiz.questions.length}
          className="w-full rounded-xl"
        >
          Submit Quiz
        </Button>
      ) : (
        <div className={`rounded-xl border px-4 py-3 text-center text-sm font-semibold ${passed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          Skor: {score}% — {passed ? 'Lulus!' : 'Belum lulus, coba lagi.'}
          {!passed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-3 rounded-lg"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
              }}
            >
              Ulangi
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function CourseModulePreview({ courseUid, variant }: CourseModulePreviewProps) {
  const [courseTitle, setCourseTitle] = useState<string | null | undefined>(undefined)
  const [modulesState, setModulesState] = useState<ICourseModulesState | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    const mentorCourse = getMentorCourseByUid(courseUid)
    const repoCourse = getCourseByUid(courseUid)
    const storedModules = getSessionCourseModules(courseUid)

    setCourseTitle(mentorCourse?.title ?? repoCourse?.title ?? null)
    setModulesState(storedModules)

    const firstLesson = storedModules.modules[0]?.lessons[0]?.id ?? null
    setActiveLessonId(firstLesson)
    if (storedModules.modules[0]) {
      setExpandedModules(new Set([storedModules.modules[0].id]))
    }
  }, [courseUid])

  const activeLesson = useMemo<ILesson | null>(() => {
    if (!modulesState || !activeLessonId) return null
    for (const m of modulesState.modules) {
      const l = m.lessons.find((l) => l.id === activeLessonId)
      if (l) return l
    }
    return null
  }, [modulesState, activeLessonId])

  const activeModuleForLesson = useMemo<IModule | null>(() => {
    if (!modulesState || !activeLessonId) return null
    for (const m of modulesState.modules) {
      if (m.lessons.some((l) => l.id === activeLessonId)) return m
    }
    return null
  }, [modulesState, activeLessonId])

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
          <Link href={variant === 'mentor' ? `/mentor/courses/${courseUid}` : '/student/learning'}>
            Kembali
          </Link>
        </Button>
      </section>
    )
  }

  const backHref = variant === 'mentor' ? `/mentor/courses/${courseUid}` : variant === 'admin' ? `/course/${courseUid}` : '/student/learning'

  return (
    <section className="flex w-full flex-col gap-8 px-8 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="w-fit gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground">
          <Link href={backHref}>
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
            {modulesState.modules.map((mod, mi) => {
              const isExpanded = expandedModules.has(mod.id)
              return (
                <div key={mod.id}>
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                  >
                    {isExpanded ? <ChevronDown className="size-3 shrink-0 text-slate-400" /> : <ChevronRight className="size-3 shrink-0 text-slate-400" />}
                    <span className="flex-1 text-xs font-semibold text-slate-700">
                      {mi + 1}. {mod.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{mod.lessons.length}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5 pb-1">
                      {mod.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLessonId
                        const Icon = ICON_MAP[lesson.contentType]
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              setActiveLessonId(lesson.id)
                              setExpandedModules((prev) => new Set(prev).add(mod.id))
                            }}
                            className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              isActive ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="size-3 shrink-0" />
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <span className="text-[10px] text-slate-400">{lesson.durationMinutes}m</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {variant === 'mentor' && activeModuleForLesson && (
            <Button asChild className="mt-4 w-full rounded-xl" size="sm">
              <Link href={`/mentor/courses/${courseUid}/edit?moduleId=${activeModuleForLesson.id}`}>
                Edit Module
              </Link>
            </Button>
          )}
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {activeLesson?.contentType === 'video' ? 'Video' : activeLesson?.contentType === 'quiz' ? 'Quiz' : 'Materi'}
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">{activeLesson?.title ?? 'Pilih lesson'}</h2>
            </div>
          </div>

          {activeLesson ? (
            <>
              {activeLesson.contentType === 'tiptap' && (
                activeLesson.contentHtml ? (
                  <div className="tiptap-editor-root tiptap-preview">
                    <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: activeLesson.contentHtml }} />
                  </div>
                ) : (
                  <EmptyContent />
                )
              )}

              {activeLesson.contentType === 'video' && (
                <div className="space-y-4">
                  {(() => {
                    const embed = getEmbedUrl(activeLesson.videoUrl)
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
                    if (activeLesson.videoUrl) {
                      return (
                        <video controls className="w-full rounded-xl">
                          <source src={activeLesson.videoUrl} />
                        </video>
                      )
                    }
                    return <EmptyContent />
                  })()}
                  {activeLesson.contentHtml && (
                    <div className="tiptap-editor-root tiptap-preview">
                      <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: activeLesson.contentHtml }} />
                    </div>
                  )}
                </div>
              )}

              {activeLesson.contentType === 'quiz' && (
                <QuizViewer lesson={activeLesson} />
              )}
            </>
          ) : (
            <EmptyContent />
          )}
        </div>
      </div>
    </section>
  )
}

function EmptyContent() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">
      Belum ada konten untuk ditampilkan.
    </div>
  )
}

