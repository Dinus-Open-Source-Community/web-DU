'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Film, HelpCircle, Plus, Trash2, GripVertical } from 'lucide-react'
import type { IModule, ILesson, LessonContentType } from '@/lib/types'
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

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 lg:sticky lg:top-6">
      <div className="mb-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Struktur kursus</p>
        <h3 className="text-sm font-semibold text-slate-900">Modul &amp; Lesson</h3>
      </div>

      <div className="space-y-1">
        {modules.map((mod, mi) => {
          const isExpanded = expandedModules.has(mod.id)
          return (
            <div key={mod.id} className="rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-1 px-2 py-2">
                <button type="button" onClick={() => toggleExpand(mod.id)} className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600">
                  {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                </button>
                <GripVertical className="size-3 shrink-0 text-slate-300" />
                <span className="flex-1 truncate text-xs font-semibold text-slate-700">
                  {mi + 1}. {mod.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteModule(mod.id)}
                  className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  title="Hapus modul"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 px-2 pb-2 pt-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId
                    const Icon = LESSON_TYPE_ICON[lesson.contentType]
                    return (
                      <div key={lesson.id} className="group flex items-center gap-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => onSelectLesson(lesson.id)}
                          className={cn(
                            'flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
                            isActive ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <Icon className="size-3 shrink-0" />
                          <span className="flex-1 truncate">{lesson.title}</span>
                        </button>
                        <select
                          value={lesson.contentType}
                          onChange={(e) => handleChangeLessonType(mod.id, lesson.id, e.target.value as LessonContentType)}
                          className="h-5 rounded border-0 bg-transparent px-0 text-[10px] text-slate-400 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                          title="Tipe konten"
                        >
                          <option value="tiptap">{LESSON_TYPE_LABEL.tiptap}</option>
                          <option value="video">{LESSON_TYPE_LABEL.video}</option>
                          <option value="quiz">{LESSON_TYPE_LABEL.quiz}</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                          className="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                          title="Hapus lesson"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => handleAddLesson(mod.id)}
                    className="mt-1 flex w-full items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  >
                    <Plus className="size-3" /> Tambah lesson
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={handleAddModule} className="mt-3 w-full rounded-xl border-slate-300 bg-transparent text-xs">
        <Plus className="size-4" />
        Tambah modul
      </Button>
    </aside>
  )
}
