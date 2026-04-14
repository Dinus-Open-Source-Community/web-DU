'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { getMergedMentorCourses } from '@/lib/mentorCourseStorage'
import type { IMentorCourse } from '@/lib/types'
import { getTodayMentorClassCards, upsertMentorClassSchedule } from '@/lib/mentorAttendanceStorage'

const WEEKDAYS = [
  { v: 0, label: 'Minggu' },
  { v: 1, label: 'Senin' },
  { v: 2, label: 'Selasa' },
  { v: 3, label: 'Rabu' },
  { v: 4, label: 'Kamis' },
  { v: 5, label: 'Jumat' },
  { v: 6, label: 'Sabtu' },
] as const

export function MentorAttendanceHubClient() {
  const [cards, setCards] = useState(() => getTodayMentorClassCards())
  const [dialogOpen, setDialogOpen] = useState(false)

  const refresh = useCallback(() => {
    setCards(getTodayMentorClassCards())
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [refresh])

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Absensi kelas"
          subtitle="Kelas yang dijadwalkan hari ini. Tambah jadwal untuk kursus yang sudah ada agar muncul di hari yang dipilih."
        />
        <Button type="button" className="h-11 shrink-0 gap-2 rounded-xl px-5 font-semibold shadow-none" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah jadwal
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/90 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-600">Tidak ada kelas terjadwal untuk hari ini.</p>
          <p className="mt-2 text-sm text-slate-500">Tambah jadwal atau ubah hari di sistem untuk melihat kartu kelas.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <li key={`${c.scheduleId}-${c.courseUid}`}>
              <Link
                href={`/mentor/attendance/${c.courseUid}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-none transition-colors hover:border-slate-300">
                <div className="relative aspect-[2.2/1] w-full border-b border-slate-100 bg-slate-50">
                  <Image
                    src={c.image || 'https://picsum.photos/seed/attendance/640/360'}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.timeLabel}</p>
                  <h2 className="text-base font-semibold leading-snug tracking-tight text-slate-900">{c.title}</h2>
                  <p className="line-clamp-2 text-sm text-slate-500">{c.header}</p>
                  <span className="mt-auto pt-3 text-xs font-medium text-primary">Kelola absensi →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {dialogOpen && <AddScheduleDialog onClose={() => setDialogOpen(false)} onSaved={refresh} />}
    </section>
  )
}

function AddScheduleDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const publishedCourses = useMemo(() => getMergedMentorCourses().filter((c: IMentorCourse) => c.published), [])
  const [courseUid, setCourseUid] = useState(publishedCourses[0]?.uid ?? '')
  const [weekday, setWeekday] = useState(() => new Date().getDay())
  const [timeLabel, setTimeLabel] = useState('09:00')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseUid) return
    upsertMentorClassSchedule({ courseUid, weekday, timeLabel: timeLabel.trim() || '—' })
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-label="Tutup" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tambah jadwal kelas</h2>
            <p className="mt-1 text-sm text-slate-500">Pilih kursus yang sudah dipublikasikan, hari, dan jam tampilan.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="sch-course" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Kursus
            </label>
            <select
              id="sch-course"
              value={courseUid}
              onChange={(e) => setCourseUid(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              {publishedCourses.length === 0 ? (
                <option value="">Tidak ada kursus aktif</option>
              ) : (
                publishedCourses.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sch-day" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hari
            </label>
            <select
              id="sch-day"
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              {WEEKDAYS.map((d) => (
                <option key={d.v} value={d.v}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sch-time" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Jam (label)
            </label>
            <input
              id="sch-time"
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              placeholder="09:00"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl shadow-none" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="rounded-xl shadow-none" disabled={!courseUid}>
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
