'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import type { ICourseModule, IMentorCourse } from '@/lib/types'
import {
  getMergedMentorCourses,
  getSessionCourseModules,
  getSessionCourseMeta,
  publishMentorCourse,
  setSessionCourseModules,
  setSessionEditorContent,
  upsertExtraCourse,
} from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyPublished, notifySaved } from '@/lib/notify'
import { CourseTipTapEditor } from './CourseTipTapEditor'
import { CourseModuleOutline } from './CourseModuleOutline'

type CourseCreateClientProps = {
  courseUid: string
  initialModuleId?: string
}

export function CourseCreateClient({ courseUid, initialModuleId }: CourseCreateClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [modules, setModules] = useState<ICourseModule[]>([])
  const [moduleContents, setModuleContents] = useState<Record<string, string>>({})
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [editorHtml, setEditorHtml] = useState('')
  const [editorReady, setEditorReady] = useState(false)

  const createModuleId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return `module_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  }

  useEffect(() => {
    const merged = getMergedMentorCourses()
    const fromList = merged.find((c) => c.uid === courseUid)
    const session = getSessionCourseMeta(courseUid)
    const storedModules = getSessionCourseModules(courseUid)
    const selectedFromQuery = initialModuleId && storedModules.modules.some((module) => module.id === initialModuleId) ? initialModuleId : null
    const initialActiveModule = selectedFromQuery ?? storedModules.modules[0]?.id ?? null

    setModules(storedModules.modules)
    setModuleContents(storedModules.contents)
    setActiveModuleId(initialActiveModule)
    setEditorHtml(initialActiveModule ? storedModules.contents[initialActiveModule] ?? '' : '')
    setEditorReady(true)

    if (fromList) {
      setCourse(fromList)
    } else if (session) {
      setCourse({
        uid: courseUid,
        title: session.title,
        header: session.header,
        description: session.header,
        image: session.image,
        published: session.published ?? false,
        moduleCount: 0,
        studentCount: 0,
        rating: 0,
        totalReviews: 0,
        updatedAt: 'Baru',
      })
    } else {
      setCourse(null)
    }
  }, [courseUid, initialModuleId])

  const buildNextContents = (currentHtml: string) => {
    if (!activeModuleId) return moduleContents
    return {
      ...moduleContents,
      [activeModuleId]: currentHtml,
    }
  }

  const handleSave = (opts?: { silent?: boolean; redirect?: boolean }) => {
    if (!modules.length || !activeModuleId) return
    const nextContents = buildNextContents(editorHtml)
    setModuleContents(nextContents)
    setSessionCourseModules(courseUid, { version: 1, modules, contents: nextContents })
    setSessionEditorContent(courseUid, nextContents[activeModuleId] ?? '')
    if (!opts?.silent) notifySaved("Perubahan modul berhasil disimpan.")
    if (opts?.redirect !== false) {
      router.push(`/mentor/courses/${courseUid}`)
      router.refresh()
    }
  }

  const handleSaveClick = async () => {
    const ok = await confirm({
      title: "Simpan modul?",
      description: "Konten modul yang sedang diedit akan disimpan ke sesi lokal.",
      confirmLabel: "Simpan",
    })
    if (!ok) return
    handleSave({ redirect: true })
  }

  const handlePublish = () => {
    handleSave({ silent: true, redirect: false })
    const moduleCount = Math.max(1, modules.length)
    if (course) {
      upsertExtraCourse({
        ...course,
        moduleCount,
        updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      })
      setCourse((prev) => (prev ? { ...prev, moduleCount } : prev))
    }
    publishMentorCourse(courseUid)
    notifyPublished()
    router.push('/mentor/courses')
    router.refresh()
  }

  const handlePublishClick = async () => {
    const ok = await confirm({
      title: "Publikasikan kursus?",
      description: "Kursus akan ditandai aktif dan muncul di daftar kursus mentor.",
      confirmLabel: "Publish",
    })
    if (!ok) return
    handlePublish()
  }

  const persistEditorBuffer = (html: string) => {
    setEditorHtml(html)
  }

  const handleSelectModule = (targetModuleId: string) => {
    if (targetModuleId === activeModuleId) return
    const nextContents = buildNextContents(editorHtml)
    setModuleContents(nextContents)
    setActiveModuleId(targetModuleId)
    setEditorHtml(nextContents[targetModuleId] ?? '')
  }

  const handleAddModule = () => {
    const nextContents = buildNextContents(editorHtml)
    const nextOrder = modules.length + 1
    const newModule: ICourseModule = {
      id: createModuleId(),
      title: `Modul ${nextOrder}`,
      order: nextOrder,
    }
    const nextModules = [...modules, newModule]
    setModules(nextModules)
    setModuleContents({
      ...nextContents,
      [newModule.id]: '',
    })
    setActiveModuleId(newModule.id)
    setEditorHtml('')
  }

  if (course === undefined) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau setelah membuat kursus baru.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title={course.title} subtitle={course.header} />
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              course.published ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}>
            {course.published ? 'Aktif' : 'Belum dipublikasikan'}
          </span>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/mentor/courses/${courseUid}`}>Kembali</Link>
          </Button>
          {!course.published && (
            <Button type="button" className="rounded-xl" onClick={() => void handlePublishClick()}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {course.image && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.image} alt="" className="max-h-56 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Konten modul</h2>
            <p className="text-sm leading-6 text-slate-500">Fokuskan materi per modul. Sisipkan video dengan tombol YouTube lalu tempel URL.</p>
            {activeModuleId && (
              <p className="text-sm font-medium text-slate-700">
                Sedang mengedit: <span className="text-slate-900">{modules.find((module) => module.id === activeModuleId)?.title}</span>
              </p>
            )}
          </div>

          {editorReady && activeModuleId && <CourseTipTapEditor key={activeModuleId} initialContent={editorHtml} onChange={persistEditorBuffer} />}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Semua perubahan disimpan ke sesi lokal setelah menekan tombol Simpan.</p>
            <Button type="button" className="rounded-xl px-5" onClick={() => void handleSaveClick()}>
              Save
            </Button>
          </div>
        </div>

        <CourseModuleOutline modules={modules} activeModuleId={activeModuleId} onSelectModule={handleSelectModule} onAddModule={handleAddModule} />
      </div>
    </section>
  )
}
