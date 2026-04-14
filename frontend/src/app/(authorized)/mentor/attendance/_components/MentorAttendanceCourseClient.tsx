'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMentorCourseByUid, getCourseMeetingCount } from '@/lib/mentorCourseStorage'
import { getMentorAttendanceSession, setMentorSessionApprovalMode, setMentorSessionMeetingNumber, toISODateLocal } from '@/lib/mentorAttendanceStorage'
import type { MentorAttendanceApprovalMode } from '@/lib/types'
import { CourseStudentsSection } from './CourseStudentsSection'

type MentorAttendanceCourseClientProps = {
  courseUid: string
}

export function MentorAttendanceCourseClient({ courseUid }: MentorAttendanceCourseClientProps) {
  const [isoDate, setIsoDate] = useState(() => toISODateLocal(new Date()))
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const course = useMemo(() => getMentorCourseByUid(courseUid), [courseUid])

  const session = useMemo(() => {
    void version
    return getMentorAttendanceSession(courseUid, isoDate)
  }, [courseUid, isoDate, version])

  const meetingCap = course ? Math.max(1, getCourseMeetingCount(course)) : 1

  const onApprovalChange = (mode: MentorAttendanceApprovalMode) => {
    setMentorSessionApprovalMode(courseUid, isoDate, mode)
    bump()
  }

  const onMeetingChange = (n: number) => {
    setMentorSessionMeetingNumber(courseUid, isoDate, n)
    bump()
  }

  if (!course) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/mentor/attendance">Kembali ke absensi</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start gap-4">
        <Button asChild variant="outline" size="sm" className="w-fit gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground">
          <Link href="/mentor/attendance">
            <ArrowLeft className="size-3.5 opacity-80" aria-hidden />
            Absensi
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-fit rounded-lg border-border bg-card font-medium shadow-none hover:bg-muted/60">
          <Link href={`/mentor/courses/${courseUid}`}>Preview kursus</Link>
        </Button>
      </div>

      <header className="border-b border-slate-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Kelola sesi</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{course.header}</p>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <label htmlFor="att-date" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Tanggal sesi
          </label>
          <input
            id="att-date"
            type="date"
            value={isoDate}
            onChange={(e) => setIsoDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex min-w-[160px] flex-col gap-1.5">
          <label htmlFor="att-meeting" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Pertemuan ke-
          </label>
          <select
            id="att-meeting"
            value={session.meetingNumber}
            onChange={(e) => onMeetingChange(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
            {Array.from({ length: meetingCap }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[220px] flex-col gap-1.5">
          <label htmlFor="att-mode" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Ajuan siswa
          </label>
          <select
            id="att-mode"
            value={session.approvalMode}
            onChange={(e) => onApprovalChange(e.target.value as MentorAttendanceApprovalMode)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="review">Perlu review mentor</option>
            <option value="auto">Otomatis terapkan</option>
          </select>
        </div>
      </div>

      <CourseStudentsSection courseUid={courseUid} isoDate={isoDate} approvalMode={session.approvalMode} session={session} onRefresh={bump} />
    </section>
  )
}
