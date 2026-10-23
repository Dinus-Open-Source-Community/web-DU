import { cva } from 'class-variance-authority'

export const BadgeVariants = cva('inline-flex items-center justify-center font-medium transition-colors', {
  variants: {
    variant: {
      // Course (kartu kursus / browse)
      event: 'rounded-md border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-950/40 dark:border-purple-800/40 dark:text-purple-300',
      draft: 'rounded-md border border-line-light bg-paper-paper px-2.5 py-0.5 text-xs font-medium text-ink-600 dark:border-ink-800 dark:text-ink-300',
      outline: 'rounded-md border border-line-light bg-transparent px-2.5 py-0.5 text-xs font-medium text-ink-700',
      // Mentor — siklus tugas
      assignmentDraft: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      assignmentPublished: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      assignmentClosed: 'rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-600',
      // Mentor — tenggat
      deadlineOverdue: 'rounded-md border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800',
      deadlineDueSoon: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      // Mentor — review kiriman
      reviewPending: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      reviewGraded: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      reviewReturned: 'rounded-md border border-purple-200/80 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800',
      demo: 'rounded-md border border-purple-200/80 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800',
      // Mentor — status kartu kursus (Aktif / Draf)
      mentorLive: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      mentorDraft: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      // Kalender — tipe kelas
      classOnline: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      classOffline: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      // Admin — pengguna
      userRole: 'rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-700',
      // Progress / selesai (kartu resume)
      progressComplete: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800',
      // Mentor absensi — status peserta kursus (tabel / kartu)
      attendanceStudentActive: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      attendanceStudentComplete: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      attendanceStudentLate: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      attendanceStudentNotStarted: 'rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-600',
      // Mentor — status peserta kursus
      courseParticipantActive: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      courseParticipantComplete: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      courseParticipantLate: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      courseParticipantNotStarted: 'rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-600',
      // Ajuan absensi menunggu review
      attendanceAjuanPending: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      // Admin — severity (support tickets)
      severityHigh: 'rounded-md border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800',
      severityMedium: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      severityLow: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      // Admin — audit
      auditCreate: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      auditUpdate: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      auditDelete: 'rounded-md border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800',
      auditView: 'rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-600',
      // Admin — course status
      coursePublished: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      courseDraft: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      coursePending: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      courseRejected: 'rounded-md border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800',
      // Admin — QA
      qaAnswered: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      qaUnanswered: 'rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800',
      // Category chips (multi badge untuk mentor specialization)
      categoryDev: 'rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800',
      categoryDesign: 'rounded-md border border-purple-200/80 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800',
      categoryData: 'rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800',
      categoryMarketing: 'rounded-md border border-orange-200/80 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800',
      categoryBusiness: 'rounded-md border border-indigo-200/80 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800',
      categoryLanguage: 'rounded-md border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800',
      categoryDefault: 'rounded-md border border-line-light bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-600',
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
})
