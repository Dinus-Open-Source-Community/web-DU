import { BookOpen, FolderTree, Layers3 } from 'lucide-react'

import { Badge, type AppBadgeVariant } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { COURSE_MASTER_LABELS, type CourseMasterKind } from '@/lib/course-master/types'
import type { ICourseItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

type CourseMasterUsageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: CourseMasterKind
  name: string
  courses: ICourseItem[]
}

const COURSE_STATUS_BADGES: Record<string, { variant: AppBadgeVariant; label: string }> = {
  published: { variant: 'coursePublished', label: 'Terbit' },
  aktif: { variant: 'coursePublished', label: 'Terbit' },
  active: { variant: 'coursePublished', label: 'Terbit' },
  draft: { variant: 'courseDraft', label: 'Draf' },
  draf: { variant: 'courseDraft', label: 'Draf' },
  pending: { variant: 'coursePending', label: 'Menunggu' },
  rejected: { variant: 'courseRejected', label: 'Ditolak' },
  archived: { variant: 'draft', label: 'Arsip' },
  arsip: { variant: 'draft', label: 'Arsip' },
}

const COURSE_LEVEL_LABELS: Record<string, string> = {
  pemula: 'Pemula',
  beginner: 'Pemula',
  menengah: 'Menengah',
  intermediate: 'Menengah',
  lanjutan: 'Lanjutan',
  advanced: 'Lanjutan',
}

function resolveStatusBadge(status?: string) {
  const normalized = (status ?? '').trim().toLowerCase()
  return COURSE_STATUS_BADGES[normalized] ?? { variant: 'outline' as AppBadgeVariant, label: status || '-' }
}

function resolveMetaLabel(course: ICourseItem) {
  const level = course.level ? COURSE_LEVEL_LABELS[course.level.trim().toLowerCase()] ?? course.level : ''
  if (level) return `Level ${level}`
  return course.slug ? `/${course.slug}` : 'Kursus'
}

function CourseUsageRow({ course }: { course: ICourseItem }) {
  const thumbnail = course.thumbnail_url || course.cover_url
  const badge = resolveStatusBadge(course.status)

  return (
    <li className="flex items-center gap-3 rounded-xl border border-line-light bg-paper-white p-2.5 transition-colors hover:border-ink-900/20 hover:bg-paper-paper/60">
      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper-paper ring-1 ring-inset ring-ink-900/5">
        {thumbnail ? (
          <img src={thumbnail} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <BookOpen className="size-4 text-ink-400" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{course.title}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-ink-500">{resolveMetaLabel(course)}</p>
      </div>

      <Badge variant={badge.variant} className="shrink-0">
        {badge.label}
      </Badge>
    </li>
  )
}

/**
 * Daftar kursus yang masih memakai sebuah kategori/tipe kursus. Dibuka langsung
 * dari kolom jumlah kursus (tanpa harus mencoba menghapus lebih dulu) dan juga
 * dipakai saat penghapusan ditolak backend karena masih terpakai.
 */
export function CourseMasterUsageDialog({
  open,
  onOpenChange,
  kind,
  name,
  courses,
}: CourseMasterUsageDialogProps) {
  const labels = COURSE_MASTER_LABELS[kind]
  const Icon = kind === 'category' ? FolderTree : Layers3

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-3 text-left">
          <div className="flex items-start gap-3 pr-8">
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-xl ring-1',
                kind === 'category'
                  ? 'bg-sky-50 text-sky-600 ring-sky-200/70'
                  : 'bg-violet-50 text-violet-600 ring-violet-200/70',
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="font-heading text-base leading-snug font-semibold text-ink-900">
                {labels.singular} masih digunakan
              </DialogTitle>
              <DialogDescription className="text-pretty">
                {name ? (
                  <>
                    <span className="font-semibold text-ink-800">&ldquo;{name}&rdquo;</span> dipakai oleh{' '}
                    {courses.length} kursus berikut. Pindahkan kursus ke {labels.singular.toLowerCase()} lain
                    sebelum menghapusnya.
                  </>
                ) : (
                  `Belum ada kursus yang memakai ${labels.singular.toLowerCase()} ini.`
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Dipakai oleh
            </span>
            <span className="rounded-full bg-paper-paper px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink-700">
              {courses.length} kursus
            </span>
          </div>

          {courses.length > 0 ? (
            <ul className="max-h-[min(60vh,22rem)] space-y-2 overflow-y-auto pr-1">
              {courses.map((course) => (
                <CourseUsageRow key={course.uid} course={course} />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line-light bg-paper-paper/50 px-4 py-6 text-center text-sm font-medium text-ink-500">
              Tidak ada kursus yang memakai {labels.singular.toLowerCase()} ini.
            </p>
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
