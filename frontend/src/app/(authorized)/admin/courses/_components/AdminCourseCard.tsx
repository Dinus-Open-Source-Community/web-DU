import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Clock, Eye, Star, Users2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AdminCourse } from '@/lib/types'
import { formatRupiah } from '@/lib/func'

const statusVariantMap = {
  published: 'coursePublished',
  draft: 'courseDraft',
  pending: 'coursePending',
  rejected: 'courseRejected',
} as const

interface AdminCourseCardProps {
  course: AdminCourse
}

export function AdminCourseCard({ course }: AdminCourseCardProps) {
  const statusVariant = statusVariantMap[course.status]

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-colors hover:border-slate-300/90">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <Badge variant={statusVariant}>{course.status}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {course.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold text-slate-700">{course.rating.toFixed(1)}</span>
            <span>({course.totalReviews})</span>
          </div>
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-slate-900">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="relative h-5 w-5 overflow-hidden rounded-full bg-slate-100">
            <Image
              src={course.author.avatar}
              alt={course.author.name}
              fill
              className="object-cover"
              sizes="20px"
            />
          </div>
          <span className="font-medium text-slate-600">{course.author.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" aria-hidden /> {course.modules.length} modul
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users2 className="h-3 w-3" aria-hidden />{' '}
            {course.enrolled.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-base font-bold tracking-tight text-slate-900">
            {course.price === 0 ? 'Gratis' : formatRupiah(course.price)}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
            <Link href={`/admin/courses/${course.uid}`}>
              <Eye className="h-3.5 w-3.5" aria-hidden /> Lihat
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
