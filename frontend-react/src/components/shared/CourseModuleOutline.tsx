'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown, ChevronRight, FileText, Film, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { LessonContentType } from '../../lib/types/course'
import type { IModulesData } from '../../lib/types/api'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

const LESSON_TYPE_ICON: Record<LessonContentType, typeof FileText> = {
  text: FileText,
  video: Film,
}

const LESSON_TYPE_LABEL: Record<LessonContentType, string> = {
  text: 'Teks',
  video: 'Video',
}

const LESSON_TYPE_COLOR: Record<LessonContentType, string> = {
  text: 'bg-sky-50 text-sky-600',
  video: 'bg-violet-50 text-violet-600',
}

function createLessonId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `les_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function createModuleId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `mod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function CreateDefaultLesson(order_index = 1): IModulesData['lessons'][number] {
  return {
    uid: createLessonId(),
    title: `Lesson ${order_index}`,
    order_index,
    module_uid: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // durationMinutes: 10,
    // hasHomework: false,
    // homeworkType: 'text',
    // homeworkDescriptionHtml: '<p></p>',
    // homeworkQuiz: { questions: [], passingScore: 70 },
    content_type: 'text',
    // contentHtml: '',
  }
}

export function CreateDefaultModule(order_index = 1): IModulesData {
  return {
    uid: createModuleId(),
    title: `Modul ${order_index}`,
    order_index,
    course_uid: '',
    created_at: new Date().toISOString(),
    lessons: [CreateDefaultLesson(1)],
  }
}

type EditingTarget = { kind: 'module'; moduleId: string } | { kind: 'lesson'; moduleId: string; lessonId: string }

type CourseModuleOutlineProps = {
  modules: IModulesData[]
  activeLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  onModulesChange: (modules: IModulesData[]) => void
}

export function CourseModuleOutline({ modules, activeLessonId, onSelectLesson, onModulesChange }: CourseModuleOutlineProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const m of modules) {
      for (const l of m.lessons) {
        if (l.uid === activeLessonId) {
          initial.add(m.uid)
          break
        }
      }
    }
    if (initial.size === 0 && modules.length > 0) initial.add(modules[0].uid)
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
      const mod = modules.find((m) => m.uid === editing.moduleId)
      const finalTitle = trimmed || mod?.title || `Modul`
      onModulesChange(modules.map((m) => (m.uid === editing.moduleId ? { ...m, title: finalTitle } : m)))
    } else {
      const mod = modules.find((m) => m.uid === editing.moduleId)
      const lesson = mod?.lessons.find((l) => l.uid === editing.lessonId)
      const finalTitle = trimmed || lesson?.title || `Lesson`
      onModulesChange(modules.map((m) => (m.uid === editing.moduleId ? { ...m, lessons: m.lessons.map((l) => (l.uid === editing.lessonId ? { ...l, title: finalTitle } : l)) } : m)))
    }
    setEditing(null)
  }

  const cancelRename = () => setEditing(null)

  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelRename()
    }
  }

  const isEditingModule = (moduleId: string) => editing?.kind === 'module' && editing.moduleId === moduleId

  const isEditingLesson = (moduleId: string, lessonId: string) => editing?.kind === 'lesson' && editing.moduleId === moduleId && editing.lessonId === lessonId

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
    const newModule = CreateDefaultModule(nextOrder)
    const next = [...modules, newModule]
    onModulesChange(next)
    setExpandedModules((prev) => new Set(prev).add(newModule.uid))
    onSelectLesson(newModule.lessons[0].uid)
  }

  const handleDeleteModule = (moduleId: string) => {
    const next = modules.filter((m) => m.uid !== moduleId).map((m, i) => ({ ...m, order_index: i + 1 }))
    onModulesChange(next.length > 0 ? next : [CreateDefaultModule(1)])
    if (next.length > 0) {
      onSelectLesson(next[0].lessons[0]?.uid ?? '')
    }
  }

  const handleAddLesson = (moduleId: string) => {
    const next = modules.map((m) => {
      if (m.uid !== moduleId) return m
      const nextOrder = m.lessons.length + 1
      const newLesson = CreateDefaultLesson(nextOrder)
      return { ...m, lessons: [...m.lessons, newLesson] }
    })
    onModulesChange(next)
    const mod = next.find((m) => m.uid === moduleId)
    if (mod) {
      const lastLesson = mod.lessons[mod.lessons.length - 1]
      onSelectLesson(lastLesson.uid)
      setExpandedModules((prev) => new Set(prev).add(moduleId))
    }
  }

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    const next = modules.map((m) => {
      if (m.uid !== moduleId) return m
      const filtered = m.lessons.filter((l) => l.uid !== lessonId).map((l, i) => ({ ...l, order_index: i + 1 }))
      if (filtered.length === 0) {
        const fallback = CreateDefaultLesson(1)
        return { ...m, lessons: [fallback] }
      }
      return { ...m, lessons: filtered }
    })
    onModulesChange(next)
  }

  const handleChangeLessonType = (moduleId: string, lessonId: string, newType: LessonContentType) => {
    const next = modules.map((m) => {
      if (m.uid !== moduleId) return m
      return {
        ...m,
        lessons: m.lessons.map((l) => {
          if (l.uid !== lessonId) return l
          const content_type: IModulesData['lessons'][number]['content_type'] = newType === 'video' ? 'video' : 'text'
          const base = { ...l, contentType: newType, content_type }
          switch (newType) {
            case 'text':
              return { ...base, contentHtml: '' }
            case 'video':
              return { ...base, videoUrl: '', contentHtml: '' }
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
          const isExpanded = expandedModules.has(mod.uid)
          const editingThisModule = isEditingModule(mod.uid)
          const hasActiveLesson = mod.lessons.some((l) => l.uid === activeLessonId)

          return (
            <div key={mod.uid} className={cn('overflow-hidden rounded-xl transition-colors', hasActiveLesson && !isExpanded ? 'bg-primary/3' : '')}>
              {/* Module header */}
              <div className="group/mod flex items-center gap-1.5 rounded-xl px-2.5 py-2 hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => toggleExpand(mod.uid)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600">
                  {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                </button>

                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">{mi + 1}</span>

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
                      title="Simpan">
                      <Check className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                      title="Batal">
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => toggleExpand(mod.uid)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                      <span className="truncate text-xs font-semibold text-slate-700">{mod.title}</span>
                      <span className="shrink-0 text-[10px] text-slate-400">({mod.lessons.length})</span>
                    </button>

                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/mod:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEditModule(mod.uid, mod.title)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        title="Rename modul">
                        <Pencil className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.uid)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Hapus modul">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Expanded lesson list */}
              {isExpanded && (
                <div className="ml-4.5 border-l-2 border-slate-100 pb-1 pl-3 pr-2">
                  <div className="space-y-0.5 pt-0.5">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.uid === activeLessonId
                      const lessonType: LessonContentType = lesson.content_type === 'video' ? 'video' : 'text'
                      const Icon = LESSON_TYPE_ICON[lessonType]
                      const editingThisLesson = isEditingLesson(mod.uid, lesson.uid)
                      const typeColor = LESSON_TYPE_COLOR[lessonType]

                      return (
                        <div key={lesson.uid} className="group/lesson">
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
                                title="Simpan">
                                <Check className="size-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelRename}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-500 transition-colors hover:bg-slate-300"
                                title="Batal">
                                <X className="size-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div className={cn('flex items-center gap-1.5 rounded-lg transition-colors', isActive ? 'bg-primary/[0.07]' : 'hover:bg-slate-50/80')}>
                              <button type="button" onClick={() => onSelectLesson(lesson.uid)} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left">
                                {isActive && <span className="h-4 w-0.5 shrink-0 rounded-full bg-primary" />}
                                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md', typeColor)}>
                                  <Icon className="size-3" />
                                </span>
                                <span className={cn('flex-1 truncate text-xs', isActive ? 'font-medium text-slate-900' : 'text-slate-600')}>{lesson.title}</span>
                              </button>

                              {/* Lesson actions */}
                              <div className="flex shrink-0 items-center gap-0.5 pr-1 opacity-100">
                                <select
                                  value={lessonType}
                                  onChange={(e) => handleChangeLessonType(mod.uid, lesson.uid, e.target.value as LessonContentType)}
                                  className="h-5 cursor-pointer rounded-md border-0 bg-slate-100 px-1 text-[10px] font-medium text-slate-500 outline-none hover:bg-slate-200"
                                  title="Ubah tipe konten">
                                  <option value="text">{LESSON_TYPE_LABEL.text}</option>
                                  <option value="video">{LESSON_TYPE_LABEL.video}</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => startEditLesson(mod.uid, lesson.uid, lesson.title)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                  title="Rename lesson">
                                  <Pencil className="size-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(mod.uid, lesson.uid)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                  title="Hapus lesson">
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
                    onClick={() => handleAddLesson(mod.uid)}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
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
          className="w-full rounded-xl border-dashed border-slate-300 bg-transparent text-xs font-medium text-slate-500 hover:border-primary/40 hover:text-primary">
          <Plus className="size-3.5" />
          Tambah modul baru
        </Button>
      </div>
    </aside>
  )
}
