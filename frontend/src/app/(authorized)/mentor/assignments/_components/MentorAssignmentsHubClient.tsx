'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookMarked, ChevronRight, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { CARD_PANEL_CLASS } from '@/components/ui/card'
import type { IMentorCourse } from '@/lib/types'
import { getMergedMentorCourses } from '@/lib/mentorCourseStorage'
import { countAssignmentsForCourse } from '@/lib/mentorAssignmentsData'
import { cn } from '@/lib/utils'

export function MentorAssignmentsHubClient() {
  const [courses, setCourses] = useState<IMentorCourse[]>([])

  const load = useCallback(() => {
    setCourses(getMergedMentorCourses())
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
    }
  }, [load])

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Tugas"
        subtitle="Pilih kursus untuk membuka halaman kelola tugas: buat dan sunting tugas, lalu tinjau kiriman peserta di sana."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Kursus</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const n = countAssignmentsForCourse(c.uid)
            return (
              <div
                key={c.uid}
                className={cn(
                  CARD_PANEL_CLASS,
                  'flex flex-col overflow-hidden border-slate-200/80 shadow-none transition-colors hover:border-slate-300/90'
                )}>
                <div className="relative aspect-16/10 w-full bg-slate-100">
                  {c.image?.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-full w-full object-cover" />
                  ) : c.image ? (
                    <Image src={c.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center text-slate-300">
                      <BookMarked className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{c.title}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">{c.header}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium tabular-nums text-slate-800">
                      <ScrollText className="h-4 w-4 text-slate-400" aria-hidden />
                      {n} tugas
                    </span>
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Button asChild className="flex-1 rounded-xl sm:flex-none">
                      <Link href={`/mentor/courses/${c.uid}/assignments`} className="gap-1">
                        Kelola tugas
                        <ChevronRight className="h-4 w-4 opacity-80" aria-hidden />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl shadow-none">
                      <Link href={`/mentor/courses/${c.uid}/assignments?new=1`}>Buat tugas</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {courses.length === 0 && (
        <p className="text-center text-sm text-slate-500">Belum ada kursus. Buat kursus di menu Courses.</p>
      )}
    </section>
  )
}
