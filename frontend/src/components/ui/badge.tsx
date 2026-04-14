import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/lib/types'
import type { PaymentStatus } from '@/lib/types'
import { paymentStatusLabels } from '@/lib/constants/payment-status'
import type { ClassType } from '@/lib/types'

/**
 * Semua varian badge aplikasi — satu sumber untuk gaya & konsistensi (presentasi UI).
 * Gunakan `children` untuk menimpa label bawaan jika perlu.
 */
export const appBadgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        // Course (kartu kursus / browse)
        free: 'rounded-[9px] bg-[#DCF8DA] px-3 py-1 text-sm leading-[1.3] text-[#54CD4C]',
        premium: 'rounded-[9px] bg-[#E2F7FF] px-3 py-1 text-sm leading-[1.3] text-[#2290DF]',
        event: 'rounded-[9px] bg-[#D8DEFF] px-3 py-1 text-sm leading-[1.3] text-[#B922DF]',
        draft: 'rounded-[9px] bg-gray-100 px-3 py-1 text-sm leading-[1.3] text-gray-600',
        // Payment (transaksi)
        paymentPaid: 'rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide border-emerald-200 bg-emerald-50 text-emerald-700',
        paymentPending: 'rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide border-amber-200 bg-amber-50 text-amber-700',
        paymentFailed: 'rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide border-rose-200 bg-rose-50 text-rose-700',
        // Mentor — siklus tugas
        assignmentDraft:
          'rounded-full border border-amber-300/80 bg-linear-to-br from-amber-50 to-orange-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
        assignmentPublished:
          'rounded-full border border-emerald-300/80 bg-linear-to-br from-emerald-50 to-teal-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
        assignmentClosed:
          'rounded-full border border-slate-300/70 bg-linear-to-br from-slate-100 to-slate-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-slate-800',
        // Mentor — tenggat
        deadlineOverdue:
          'rounded-full border border-rose-300/80 bg-linear-to-br from-rose-50 to-red-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-rose-900',
        deadlineDueSoon:
          'rounded-full border border-orange-300/80 bg-linear-to-br from-orange-50 to-amber-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-orange-900',
        // Mentor — review kiriman
        reviewPending:
          'rounded-full border border-sky-300/80 bg-linear-to-br from-sky-50 to-cyan-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-sky-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
        reviewGraded:
          'rounded-full border border-emerald-300/80 bg-linear-to-br from-emerald-50 to-green-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
        reviewReturned:
          'rounded-full border border-violet-300/80 bg-linear-to-br from-violet-50 to-fuchsia-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-violet-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
        demo: 'rounded-full border border-indigo-300/80 bg-linear-to-r from-indigo-50 to-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
        // Mentor — status kartu kursus (Aktif / Draf)
        mentorLive: 'rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
        mentorDraft: 'rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800',
        // Kalender — tipe kelas
        classOnline: 'rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700',
        classOffline: 'rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700',
        // Admin — pengguna
        userActive: 'rounded-full bg-[#E6F9EE] px-3 py-1 text-xs font-semibold leading-tight text-[#22C55E]',
        userInactive: 'rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold leading-tight text-[#6B7280]',
        userPending: 'rounded-full bg-[#FFF7E6] px-3 py-1 text-xs font-semibold leading-tight text-[#F59E0B]',
        userRole: 'rounded-full bg-[#E9EAF0] px-3 py-1 text-xs font-semibold leading-tight text-[#4B5563]',
        // Progress / selesai (kartu resume)
        progressComplete:
          'rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 shadow-sm',
        // Mentor absensi — status peserta kursus (tabel / kartu)
        attendanceStudentActive:
          'rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800',
        attendanceStudentComplete:
          'rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800',
        attendanceStudentLate:
          'rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900',
        attendanceStudentNotStarted:
          'rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600',
        // Ajuan absensi menunggu review
        attendanceAjuanPending:
          'rounded-md border border-amber-200/90 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-950',
      },
    },
    defaultVariants: {
      variant: 'free',
    },
  }
)

export type AppBadgeVariant = NonNullable<VariantProps<typeof appBadgeVariants>['variant']>

const defaultLabel: Partial<Record<AppBadgeVariant, string>> = {
  free: 'Free',
  premium: 'Premium',
  event: 'Event',
  draft: 'Draft',
  paymentPaid: paymentStatusLabels.PAID,
  paymentPending: paymentStatusLabels.PENDING,
  paymentFailed: paymentStatusLabels.FAILED,
  assignmentDraft: 'Draf',
  assignmentPublished: 'Terbit',
  assignmentClosed: 'Ditutup',
  deadlineOverdue: 'Lewat tenggat',
  deadlineDueSoon: 'Mendekati tenggat',
  reviewPending: 'Menunggu review',
  reviewGraded: 'Selesai dinilai',
  reviewReturned: 'Minta revisi',
  demo: 'Demo',
  mentorLive: 'Aktif',
  mentorDraft: 'Draf',
  classOnline: 'online',
  classOffline: 'offline',
  progressComplete: 'Selesai',
  attendanceStudentActive: 'Aktif',
  attendanceStudentComplete: 'Selesai',
  attendanceStudentLate: 'Terlambat',
  attendanceStudentNotStarted: 'Belum mulai',
  attendanceAjuanPending: 'Menunggu',
}

export type BadgeProps = {
  variant: AppBadgeVariant
  className?: string
  children?: React.ReactNode
} & React.ComponentProps<'span'>

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  const text = children ?? defaultLabel[variant]
  return (
    <span className={cn(appBadgeVariants({ variant }), className)} {...props}>
      {text}
    </span>
  )
}

/** Kompatibilitas: varian kursus dari `BadgeVariant` (free | premium | event | draft) */
export function CourseBadge({ variant, className }: { variant: BadgeVariant; className?: string }) {
  return <Badge variant={variant} className={className} />
}

/** Status pembayaran dengan gaya badge aplikasi. */
export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const v =
    status === 'PAID' ? 'paymentPaid' : status === 'PENDING' ? 'paymentPending' : 'paymentFailed'
  return (
    <Badge variant={v} className={className}>
      {paymentStatusLabels[status]}
    </Badge>
  )
}

/** Kalender: online / offline */
export function ClassTypeBadge({ classType, className }: { classType: ClassType; className?: string }) {
  const v = classType === 'online' ? 'classOnline' : 'classOffline'
  return (
    <Badge variant={v} className={className}>
      {classType}
    </Badge>
  )
}

export type { VariantProps }
