'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, ClipboardList, Eye, Pencil, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/card'
import type { IMentorCourse } from '@/lib/types'
import { getMentorCourseByUid, getSessionCourseModules, publishMentorCourse, upsertExtraCourse } from '@/lib/mentorCourseStorage'
import { countAssignmentsForCourse } from '@/lib/mentorAssignmentsData'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyPublished } from '@/lib/notify'

type CourseHubClientProps = {
  courseUid: string
}

export function CourseHubClient({ courseUid }: CourseHubClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [moduleCount, setModuleCount] = useState(0)
  const [assignmentCount, setAssignmentCount] = useState(0)

  useEffect(() => {
    const load = () => {
      const found = getMentorCourseByUid(courseUid)
      setCourse(found)
      if (found) {
        const mods = getSessionCourseModules(courseUid)
        setModuleCount(mods.modules.length || found.moduleCount)
        setAssignmentCount(countAssignmentsForCourse(courseUid))
      }
    }
    load()
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
    }
  }, [courseUid])

  const handlePublish = async () => {
    if (!course) return
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan bisa diakses peserta.',
      confirmLabel: 'Publish',
    })
    if (!ok) return
    upsertExtraCourse({
      ...course,
      moduleCount: Math.max(1, moduleCount),
      updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    publishMentorCourse(courseUid)
    notifyPublished()
    setCourse((prev) => (prev ? { ...prev, published: true } : prev))
    router.refresh()
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
        <p className="text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  const actions = [
    {
      icon: Pencil,
      label: 'Edit Konten',
      description: 'Buka editor modul untuk mengedit materi kursus.',
      href: `/mentor/courses/${courseUid}/edit`,
    },
    {
      icon: Eye,
      label: 'Preview Materi',
      description: 'Lihat tampilan materi seperti yang dilihat peserta.',
      href: `/mentor/courses/${courseUid}/preview`,
    },
    {
      icon: ClipboardList,
      label: 'Kelola Tugas',
      description: 'Buat, sunting tugas, dan tinjau kiriman peserta.',
      href: `/mentor/courses/${courseUid}/assignments`,
    },
  ]

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="w-fit gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground">
          <Link href="/mentor/courses">
            <ArrowLeft className="size-3.5 opacity-80" aria-hidden />
            Kembali
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {course.image && (
            <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.image} alt="" className="h-28 w-44 object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PageHeader title={course.title} subtitle={course.header} />
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                  course.published
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}>
                {course.published ? 'Aktif' : 'Draf'}
              </span>
            </div>
          </div>
        </div>
        {!course.published && (
          <Button type="button" className="shrink-0 rounded-xl" onClick={() => void handlePublish()}>
            Publish Kursus
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Modul" value={moduleCount} icon={<BookOpen className="h-6 w-6" />} />
        <StatCard label="Tugas" value={assignmentCount} icon={<ClipboardList className="h-6 w-6" />} />
        <StatCard label="Peserta" value={course.studentCount} icon={<Users className="h-6 w-6" />} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Kelola kursus</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors hover:border-slate-300/90 hover:bg-slate-50/60">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <action.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
