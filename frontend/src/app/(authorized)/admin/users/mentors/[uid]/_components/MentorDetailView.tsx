'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, KeyRound, Mail, Star, CalendarDays, BookMarked, Users2 } from 'lucide-react'

import { ResetCredentialsDialog } from '@/components/admin/ResetCredentialsDialog'
import { Badge, type AppBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMentorSpecColors, listCourses } from '@/lib/data/repository'
import type { AdminMentor } from '@/lib/types'
import { formatRupiah } from '@/lib/func'

interface MentorDetailViewProps {
  mentor: AdminMentor
}

const statusMap: Record<
  AdminMentor['status'],
  { variant: 'userActive' | 'userInactive' | 'userPending'; label: string }
> = {
  active: { variant: 'userActive', label: 'Aktif' },
  inactive: { variant: 'userInactive', label: 'Nonaktif' },
  pending: { variant: 'userPending', label: 'Pending' },
}

export function MentorDetailView({ mentor }: MentorDetailViewProps) {
  const [resetOpen, setResetOpen] = useState(false)

  const courses = listCourses()
  const specColors = getMentorSpecColors()

  const ownedCourses = courses.filter((c) => c.mentorUid === mentor.uid)
  const status = statusMap[mentor.status]

  return (
    <div className="flex flex-col gap-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900">
        <Link href="/admin/users/mentors">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Kembali ke daftar mentor
        </Link>
      </Button>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
            <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{mentor.name}</h2>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {mentor.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Bergabung {mentor.joinedAt}
              </span>
            </div>
            {mentor.bio && <p className="text-sm leading-relaxed text-slate-600">{mentor.bio}</p>}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mentor.specializations.map((s) => (
                <Badge key={s} variant={specColors[s] as AppBadgeVariant}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-10 shrink-0 gap-1.5 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50"
          onClick={() => setResetOpen(true)}>
          <KeyRound className="h-4 w-4" aria-hidden />
          Reset Credentials
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total Kursus" value={mentor.totalCourses.toString()} />
        <StatTile
          label="Total Siswa"
          value={mentor.studentsCount.toLocaleString('id-ID')}
        />
        <StatTile
          label="Rating"
          value={
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {mentor.rating.toFixed(1)}
            </span>
          }
        />
        <StatTile label="Total Review" value={mentor.totalReviews.toLocaleString('id-ID')} />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Kursus yang Dimiliki
            </h3>
            <p className="text-xs text-slate-500">
              Seluruh kursus yang diampu oleh {mentor.name}.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {ownedCourses.length} kursus
          </span>
        </header>

        <div className="p-5">
          {ownedCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
              Mentor ini belum memiliki kursus yang diampu.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {ownedCourses.map((c) => (
                <Link
                  key={c.uid}
                  href={`/admin/courses/${c.uid}`}
                  className="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-slate-300">
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                    <Image src={c.image} alt={c.title} fill className="object-cover" sizes="128px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary">
                        {c.title}
                      </h4>
                      <Badge
                        variant={
                          c.status === 'published'
                            ? 'coursePublished'
                            : c.status === 'draft'
                              ? 'courseDraft'
                              : c.status === 'pending'
                                ? 'coursePending'
                                : 'courseRejected'
                        }>
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <BookMarked className="h-3 w-3" aria-hidden /> {c.modules.length} modul
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users2 className="h-3 w-3" aria-hidden />{' '}
                        {c.enrolled.toLocaleString('id-ID')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                        {c.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-sm font-bold tracking-tight text-slate-900">
                        {c.price === 0 ? 'Gratis' : formatRupiah(c.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <ResetCredentialsDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        userName={mentor.name}
        initialEmail={mentor.email}
      />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">{value}</span>
    </div>
  )
}
