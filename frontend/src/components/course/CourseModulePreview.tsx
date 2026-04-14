'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ICourseModule, ICourseModulesState, IMentorCourse } from '@/lib/types'
import { getMentorCourseByUid, getSessionCourseModules } from '@/lib/mentorCourseStorage'
import '@/styles/tiptap-editor.css'

export type CourseModulePreviewVariant = 'mentor' | 'student'

type CourseModulePreviewProps = {
  courseUid: string
  variant: CourseModulePreviewVariant
}

export function CourseModulePreview({ courseUid, variant }: CourseModulePreviewProps) {
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [modulesState, setModulesState] = useState<ICourseModulesState | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  useEffect(() => {
    const foundCourse = getMentorCourseByUid(courseUid)
    const storedModules = getSessionCourseModules(courseUid)

    setCourse(foundCourse)
    setModulesState(storedModules)
    setActiveModuleId(storedModules.modules[0]?.id ?? null)
  }, [courseUid])

  const activeModule = useMemo<ICourseModule | null>(() => {
    if (!modulesState || !activeModuleId) return null
    return modulesState.modules.find((module) => module.id === activeModuleId) ?? null
  }, [modulesState, activeModuleId])

  const activeHtml = useMemo(() => {
    if (!modulesState || !activeModuleId) return ''
    return modulesState.contents[activeModuleId] ?? ''
  }, [modulesState, activeModuleId])

  if (course === undefined || !modulesState) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat preview kursus…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href={variant === 'mentor' ? `/mentor/courses/${courseUid}` : '/student/learning'}>{variant === 'mentor' ? 'Kembali ke kursus' : 'Kembali ke kursus saya'}</Link>
        </Button>
      </section>
    )
  }

  const backHref = variant === 'mentor' ? `/mentor/courses/${courseUid}` : '/student/learning'
  const backLabel = 'Kembali'

  return (
    <section className="flex w-full flex-col gap-8 px-8 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="w-fit gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground">
          <Link href={backHref}>
            <ArrowLeft className="size-3.5 opacity-80" aria-hidden />
            {backLabel}
          </Link>
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Daftar modul</p>
          <div className="mt-3 space-y-1.5">
            {modulesState.modules.map((module, index) => {
              const isActive = module.id === activeModuleId
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModuleId(module.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${isActive ? 'border-slate-300 bg-slate-50/80' : 'border-slate-200/70 bg-white hover:bg-slate-50/60'}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Modul {index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{module.title}</p>
                </button>
              )
            })}
          </div>

          {variant === 'mentor' && activeModuleId && (
            <Button asChild className="mt-4 w-full rounded-xl">
              <Link href={`/mentor/courses/${courseUid}/edit?moduleId=${activeModuleId}`}>Edit Module</Link>
            </Button>
          )}
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview materi</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">{activeModule?.title ?? 'Modul'}</h2>
            </div>
          </div>

          {activeHtml ? (
            <div className="tiptap-editor-root tiptap-preview">
              <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: activeHtml }} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">Modul ini belum memiliki konten.</div>
          )}
        </div>
      </div>
    </section>
  )
}
