'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Clock, ExternalLink, X, BookMarked } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listCourses } from '@/lib/data/repository'
import { formatRupiah } from '@/lib/func'

export function PendingApprovalsList() {
  const adminCourses = listCourses()
  const pending = adminCourses.filter((c) => c.status === 'pending')

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={<Check className="h-5 w-5" />}
        title="Tidak ada pengajuan tertunda"
        description="Semua pengajuan kursus baru sudah ditinjau dan diproses."
      />
    )
  }

  return (
    <section className="flex flex-col gap-4">
      {pending.map((c) => (
        <article
          key={c.uid}
          className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:flex-row md:items-stretch md:gap-5">
          <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl md:h-auto md:w-56">
            <Image src={c.image} alt={c.title} fill className="object-cover" sizes="224px" />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="coursePending">Pending Review</Badge>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {c.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" aria-hidden />
                  Diajukan {c.submittedAt ?? c.updatedAt}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="relative h-6 w-6 overflow-hidden rounded-full bg-slate-100">
                  <Image
                    src={c.author.avatar}
                    alt={c.author.name}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
                <span className="font-medium">{c.author.name}</span>
              </div>
              <span className="inline-flex items-center gap-1">
                <BookMarked className="h-3 w-3" aria-hidden /> {c.modules.length} modul • {c.duration}
              </span>
              <span className="font-semibold text-slate-700">
                {c.price === 0 ? 'Gratis' : formatRupiah(c.price)}
              </span>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                <Link href={`/admin/courses/${c.uid}`}>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Review
                </Link>
              </Button>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg border-rose-200 px-3 text-xs font-semibold text-rose-700 shadow-none hover:bg-rose-50">
                  <X className="h-3.5 w-3.5" aria-hidden /> Tolak
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-none hover:bg-emerald-700">
                  <Check className="h-3.5 w-3.5" aria-hidden /> Setujui
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
