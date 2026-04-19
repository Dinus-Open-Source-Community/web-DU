'use client'

import { useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Film,
  FolderOpen,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import type { IModule, LessonContentType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createDefaultLesson, createDefaultModule } from '@/lib/mentorCourseStorage'

const LESSON_TYPE_ICON: Record<LessonContentType, typeof FileText> = {
  tiptap: FileText,
  video: Film,
  quiz: HelpCircle,
}

const LESSON_TYPE_LABEL: Record<LessonContentType, string> = {
  tiptap: 'Teks',
  video: 'Video',
  quiz: 'Quiz',
}

const LESSON_TYPE_COLOR: Record<LessonContentType, string> = {
  tiptap: 'bg-sky-50 text-sky-600',
  video: 'bg-violet-50 text-violet-600',
  quiz: 'bg-amber-50 text-amber-600',
}

type EditingTarget =
  | { kind: 'module'; moduleId: string }
  | { kind: 'lesson'; moduleId: string; lessonId: string }

type CourseModuleOutlineProps = {
  modules: IModule[]
  activeLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  onModulesChange: (modules: IModule[]) => void
}

export function CourseModuleOutline({
  modules,
  activeLessonId,
  onSelectLesson,
  onModulesChange,
}: CourseModuleOutlineProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const m of modules) {
      for (const l of m.lessons) {
        if (l.id === activeLessonId) {
          initial.add(m.id)
          break
        }
      }
    }
    if (initial.size === 0 && modules.length > 0) initial.add(modules[0].id)
    return initial
  })

  const [editing, setEditing] = useState<EditingTarget | null>(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEditModule = (moduleId: string, currentTitle: string) => {
    setEditing({ kind: 'module', moduleId })
    setDraft(currentTitle)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const startEditLesson = (moduleId: string, lessonId: string, currentTitle: string) => {
    setEditing({ kind: 'lesson', moduleId, lessonId })
    setDraft(currentTitle)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitRename = () => {
    if (!editing) return
    const trimmed = draft.trim()

    if (editing.kind === 'module') {
      const mod = modules.find((m) => m.id === editing.moduleId)
      const finalTitle = trimmed || mod?.title || `Modul`
      onModulesChange(
        modules.map((m) => (m.id === editing.moduleId ? { ...m, title: finalTitle } : m)),
      )
    } else {
      const mod = modules.find((m) => m.id === editing.moduleId)
      const lesson = mod?.lessons.find((l) => l.id === editing.lessonId)
      const finalTitle = trimmed || lesson?.title || `Lesson`
      onModulesChange(
        modules.map((m) =>
          m.id === editing.moduleId
            ? { ...m, lessons: m.lessons.map((l) => (l.id === editing.lessonId ? { ...l, title: finalTitle } : l)) }
            : m,
        ),
      )
    }
    setEditing(null)
  }

  const cancelRename = () => setEditing(null)

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelRename()
    }
  }

  const isEditingModule = (moduleId: string) =>
    editing?.kind === 'module' && editing.moduleId === moduleId

  const isEditingLesson = (moduleId: string, lessonId: string) =>
    editing?.kind === 'lesson' && editing.moduleId === moduleId && editing.lessonId === lessonId

  const toggleExpand = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const handleAddModule = () => {
    const nextOrder = modules.length + 1
    const newModule = createDefaultModule(nextOrder)
    const next = [...modules, newModule]
    onModulesChange(next)
    setExpandedModules((prev) => new Set(prev).add(newModule.id))
    onSelectLesson(newModule.lessons[0].id)
  }

  const handleDeleteModule = (moduleId: string) => {
    const next = modules.filter((m) => m.id !== moduleId).map((m, i) => ({ ...m, order: i + 1 }))
    onModulesChange(next.length > 0 ? next : [createDefaultModule(1)])
    if (next.length > 0) {
      onSelectLesson(next[0].lessons[0]?.id ?? '')
    }
  }

  const handleAddLesson = (moduleId: string) => {
    const next = modules.map((m) => {
      if (m.id !== moduleId) return m
      const nextOrder = m.lessons.length + 1
      const newLesson = createDefaultLesson(nextOrder)
      return { ...m, lessons: [...m.lessons, newLesson] }
    })
    onModulesChange(next)
    const mod = next.find((m) => m.id === moduleId)
    if (mod) {
      const lastLesson = mod.lessons[mod.lessons.length - 1]
      onSelectLesson(lastLesson.id)
      setExpandedModules((prev) => new Set(prev).add(moduleId))
    }
  }

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    const next = modules.map((m) => {
      if (m.id !== moduleId) return m
      const filtered = m.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, order: i + 1 }))
      if (filtered.length === 0) {
        const fallback = createDefaultLesson(1)
        return { ...m, lessons: [fallback] }
      }
      return { ...m, lessons: filtered }
    })
    onModulesChange(next)
  }

  const handleChangeLessonType = (moduleId: string, lessonId: string, newType: LessonContentType) => {
    const next = modules.map((m) => {
      if (m.id !== moduleId) return m
      return {
        ...m,
        lessons: m.lessons.map((l) => {
          if (l.id !== lessonId) return l
          const base = { id: l.id, title: l.title, order: l.order, durationMinutes: l.durationMinutes }
          switch (newType) {
            case 'tiptap':
              return { ...base, contentType: 'tiptap' as const, contentHtml: '' }
            case 'video':
              return { ...base, contentType: 'video' as const, videoUrl: '', contentHtml: '' }
            case 'quiz':
              return { ...base, contentType: 'quiz' as const, quiz: { questions: [], passingScore: 70 } }
          }
        }),
      }
    })
    onModulesChange(next)
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white lg:sticky lg:top-6">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <FolderOpen className="size-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900">Struktur Kursus</h3>
            <p className="text-[11px] text-slate-400">
              {modules.length} modul &middot; {totalLessons} lesson
            </p>
          </div>
        </div>
      </div>

      {/* Module list */}
      <div className="space-y-0.5 p-2">
        {modules.map((mod, mi) => {
          const isExpanded = expandedModules.has(mod.id)
          const editingThisModule = isEditingModule(mod.id)
          const hasActiveLesson = mod.lessons.some((l) => l.id === activeLessonId)

          return (
            <div
              key={mod.id}
              className={cn(
                'overflow-hidden rounded-xl transition-colors',
                hasActiveLesson && !isExpanded ? 'bg-primary/3' : '',
              )}
            >
              {/* Module header */}
              <div className="group/mod flex items-center gap-1.5 rounded-xl px-2.5 py-2 hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => toggleExpand(mod.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600"
                >
                  {isExpanded
                    ? <ChevronDown className="size-3.5" />
                    : <ChevronRight className="size-3.5" />}
                </button>

                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                  {mi + 1}
                </span>

                {editingThisModule ? (
                  <div className="flex flex-1 items-center gap-1">
                    <input
                      ref={inputRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-primary/30 bg-white px-2 py-1 text-xs font-medium text-slate-900 outline-none ring-2 ring-primary/10 placeholder:text-slate-300"
                      placeholder="Nama modul..."
                    />
                    <button
                      type="button"
                      onClick={commitRename}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-colors hover:bg-primary/90"
                      title="Simpan"
                    >
                      <Check className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                      title="Batal"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleExpand(mod.id)}
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    >
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {mod.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        ({mod.lessons.length})
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/mod:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEditModule(mod.id, mod.title)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        title="Rename modul"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Hapus modul"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Expanded lesson list */}
              {isExpanded && (
                <div className="ml-[18px] border-l-2 border-slate-100 pb-1 pl-3 pr-2">
                  <div className="space-y-0.5 pt-0.5">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId
                      const Icon = LESSON_TYPE_ICON[lesson.contentType]
                      const editingThisLesson = isEditingLesson(mod.id, lesson.id)
                      const typeColor = LESSON_TYPE_COLOR[lesson.contentType]

                      return (
                        <div key={lesson.id} className="group/lesson">
                          {editingThisLesson ? (
                            <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                              <Icon className={cn('size-3.5 shrink-0', typeColor.split(' ')[1])} />
                              <input
                                ref={inputRef}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={handleRenameKeyDown}
                                autoFocus
                                className="min-w-0 flex-1 rounded-md border border-primary/30 bg-white px-2 py-0.5 text-xs text-slate-900 outline-none ring-2 ring-primary/10 placeholder:text-slate-300"
                                placeholder="Nama lesson..."
                              />
                              <button
                                type="button"
                                onClick={commitRename}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-colors hover:bg-primary/90"
                                title="Simpan"
                              >
                                <Check className="size-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelRename}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-500 transition-colors hover:bg-slate-300"
                                title="Batal"
                              >
                                <X className="size-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                'flex items-center gap-1.5 rounded-lg transition-colors',
                                isActive
                                  ? 'bg-primary/[0.07]'
                                  : 'hover:bg-slate-50/80',
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => onSelectLesson(lesson.id)}
                                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left"
                              >
                                {isActive && (
                                  <span className="h-4 w-0.5 shrink-0 rounded-full bg-primary" />
                                )}
                                <span className={cn(
                                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md',
                                  typeColor,
                                )}>
                                  <Icon className="size-3" />
                                </span>
                                <span className={cn(
                                  'flex-1 truncate text-xs',
                                  isActive ? 'font-medium text-slate-900' : 'text-slate-600',
                                )}>
                                  {lesson.title}
                                </span>
                              </button>

                              {/* Lesson actions */}
                              <div className="flex shrink-0 items-center gap-0.5 pr-1 opacity-100">
                                <select
                                  value={lesson.contentType}
                                  onChange={(e) => handleChangeLessonType(mod.id, lesson.id, e.target.value as LessonContentType)}
                                  className="h-5 cursor-pointer rounded-md border-0 bg-slate-100 px-1 text-[10px] font-medium text-slate-500 outline-none hover:bg-slate-200"
                                  title="Ubah tipe konten"
                                >
                                  <option value="tiptap">{LESSON_TYPE_LABEL.tiptap}</option>
                                  <option value="video">{LESSON_TYPE_LABEL.video}</option>
                                  <option value="quiz">{LESSON_TYPE_LABEL.quiz}</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => startEditLesson(mod.id, lesson.id, lesson.title)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                  title="Rename lesson"
                                >
                                  <Pencil className="size-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                  title="Hapus lesson"
                                >
                                  <Trash2 className="size-2.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddLesson(mod.id)}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                  >
                    <Plus className="size-3" />
                    Tambah lesson
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add module button */}
      <div className="border-t border-slate-100 p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddModule}
          className="w-full rounded-xl border-dashed border-slate-300 bg-transparent text-xs font-medium text-slate-500 hover:border-primary/40 hover:text-primary"
        >
          <Plus className="size-3.5" />
          Tambah modul baru
        </Button>
      </div>
    </aside>
  )
}
