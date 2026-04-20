'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IMentorCourse } from '@/lib/types'
import { deleteManagedCourse, getManagedCourseByUid } from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyDeleted, notifyError } from '@/lib/notify'

export default function AdminDeleteCoursePage() {
  const confirm = useConfirm()
  const router = useRouter()
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)

  useEffect(() => {
    if (!courseUid) return
    setCourse(getManagedCourseByUid(courseUid, 'all'))
  }, [courseUid])

  const handleDelete = async () => {
    if (!courseUid || !course) return
    const ok = await confirm({
      title: 'Hapus kursus ini?',
      description: `Kursus "${course.title}" akan dihapus dari pengelolaan frontend.`,
      confirmLabel: 'Hapus',
      variant: 'destructive',
    })
    if (!ok) return

    try {
      deleteManagedCourse(courseUid)
      notifyDeleted()
      router.push('/admin/courses')
      router.refresh()
    } catch {
      notifyError('Gagal menghapus kursus.')
    }
  }

  if (!courseUid) return null

  if (course === undefined) {
    return (
      <section className="py-10">
        <p className="text-sm text-slate-500">Memuat detail kursus…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-600">Kursus tidak ditemukan atau sudah dihapus.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/admin/courses">Kembali ke daftar kursus</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-rose-200/70 bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Hapus kursus</h1>
          <p className="mt-1 text-sm text-slate-500">Tindakan ini hanya mengubah data frontend/local storage pada mode saat ini.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kursus</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{course.title}</p>
        <p className="mt-1 text-sm text-slate-600">{course.header}</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <Button asChild variant="outline" className="rounded-xl shadow-none">
          <Link href={`/admin/courses/${courseUid}`}>Batal</Link>
        </Button>
        <Button type="button" variant="destructive" className="rounded-xl" onClick={() => void handleDelete()}>
          Hapus Kursus
        </Button>
      </div>
    </section>
  )
}
