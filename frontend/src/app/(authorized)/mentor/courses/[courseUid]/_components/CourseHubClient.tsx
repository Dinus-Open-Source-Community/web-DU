'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, ClipboardList, Clock, Eye, GraduationCap, Layers, Pencil, Sparkles, Tag, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IMentorCourse } from '@/lib/types'
import { getManagedCourseByUid, getSessionCourseModules, publishMentorCourse, upsertExtraCourse } from '@/lib/mentorCourseStorage'
import { countAssignmentsForCourse } from '@/lib/mentorAssignmentsData'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyPublished } from '@/lib/notify'
import { formatRupiah } from '@/lib/func'
import Image from 'next/image'
import { CourseParticipantsSection } from './CourseParticipantsSection'

type CourseHubClientProps = {
  courseUid: string
  role?: 'mentor' | 'admin'
}

export function CourseHubClient({ courseUid, role = 'mentor' }: CourseHubClientProps) {
  const isAdmin = role === 'admin'
  const confirm = useConfirm()
  const router = useRouter()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [moduleCount, setModuleCount] = useState(0)
  const [assignmentCount, setAssignmentCount] = useState(0)

  useEffect(() => {
    const load = () => {
      const found = getManagedCourseByUid(courseUid, isAdmin ? 'all' : 'mentor')
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
  }, [courseUid, isAdmin])

  const handlePublish = async () => {
    if (!course || !isAdmin) return
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan bisa diakses peserta.',
      confirmLabel: 'Publish',
    })
    if (!ok) return
    upsertExtraCourse({
      ...course,
      moduleCount: Math.max(1, moduleCount),
      updatedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    })
    publishMentorCourse(courseUid)
    notifyPublished()
    setCourse((prev) => (prev ? { ...prev, published: true } : prev))
    router.refresh()
  }

  if (course === undefined) {
    return (
      <section className="space-y-6 py-10">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
          <BookOpen className="size-7 text-slate-400" />
        </div>
        <p className="text-sm text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="rounded-xl shadow-none">
          <Link href={isAdmin ? '/admin/courses' : '/mentor/courses'}>Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  const hasDetails = course.category || course.classType || course.price != null || course.level
  const priceLabel = course.price != null ? (course.price === 0 ? 'Gratis' : formatRupiah(course.price)) : null

  const stats = [
    {
      icon: Layers,
      value: moduleCount,
      label: 'Modul',
      accent: 'bg-blue-50 text-blue-600',
    },
    {
      icon: ClipboardList,
      value: assignmentCount,
      label: 'Tugas',
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Users,
      value: course.studentCount,
      label: 'Peserta',
      accent: 'bg-emerald-50 text-emerald-600',
    },
  ]

  const actions = [
    {
      icon: Pencil,
      label: 'Edit Konten',
      description: 'Buka editor modul untuk mengedit materi kursus.',
      href: `${isAdmin ? '/admin' : '/mentor'}/courses/${courseUid}/edit`,
      accent: 'group-hover:bg-blue-50 group-hover:text-blue-600',
    },
    {
      icon: Eye,
      label: 'Preview Materi',
      description: 'Lihat tampilan materi seperti yang dilihat peserta.',
      href: `/course/${courseUid}/view`,
      accent: 'group-hover:bg-violet-50 group-hover:text-violet-600',
    },
    isAdmin
      ? {
          icon: Trash2,
          label: 'Hapus Kursus',
          description: 'Hapus kursus dari pengelolaan platform.',
          href: `/admin/courses/${courseUid}/delete`,
          accent: 'group-hover:bg-rose-50 group-hover:text-rose-600',
        }
      : {
          icon: ClipboardList,
          label: 'Kelola Tugas',
          description: 'Buat, sunting tugas, dan tinjau kiriman peserta.',
          href: `/mentor/courses/${courseUid}/assignments`,
          accent: 'group-hover:bg-amber-50 group-hover:text-amber-600',
        },
  ]

  return (
    <section className="flex w-full flex-col gap-6">
      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        {course.image && (
          <div className="absolute inset-0 opacity-[0.04]">
            <Image src={course.image} width={384} height={256} loading="lazy" alt={course.title} className="h-full w-full object-cover blur-2xl" />
          </div>
        )}

        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6">
          {course.image && (
            <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200/60 shadow-xs">
              <Image src={course.image} width={384} height={256} loading="lazy" alt={course.title} className="h-32 w-48 object-cover sm:h-36 sm:w-52" />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{course.title}</h1>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{course.header}</p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                  course.published ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'
                }`}>
                {course.published ? 'Published' : 'Draft'}
              </span>
            </div>

            {hasDetails && (
              <div className="flex flex-wrap items-center gap-1.5">
                {course.category && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <Tag className="size-2.5" /> {course.category}
                  </span>
                )}
                {course.classType && <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{course.classType}</span>}
                {course.level && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    <GraduationCap className="size-2.5" /> {course.level}
                  </span>
                )}
                {priceLabel && <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">{priceLabel}</span>}
              </div>
            )}

            {!course.published && isAdmin && (
              <div className="pt-1">
                <Button type="button" size="sm" className="h-9 gap-1.5 rounded-xl px-5 text-xs font-semibold" onClick={() => void handlePublish()}>
                  <Sparkles className="size-3.5" />
                  Publish Kursus
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${s.accent}`}>
              <s.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions grid ── */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Kelola kursus</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors hover:border-slate-300/90">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors ${action.accent}`}>
                <action.icon className="size-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CourseParticipantsSection courseUid={courseUid} />
    </section>
  )
}
