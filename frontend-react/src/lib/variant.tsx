import { cva } from 'class-variance-authority'

export const BadgeVariants = cva('inline-flex items-center justify-center font-medium transition-colors', {
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
      assignmentClosed: 'rounded-full border border-slate-300/70 bg-linear-to-br from-slate-100 to-slate-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-slate-800',
      // Mentor — tenggat
      deadlineOverdue: 'rounded-full border border-rose-300/80 bg-linear-to-br from-rose-50 to-red-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-rose-900',
      deadlineDueSoon: 'rounded-full border border-orange-300/80 bg-linear-to-br from-orange-50 to-amber-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-orange-900',
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
      progressComplete: 'rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 shadow-sm',
      // Mentor absensi — status peserta kursus (tabel / kartu)
      attendanceStudentActive: 'rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800',
      attendanceStudentComplete: 'rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800',
      attendanceStudentLate: 'rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900',
      attendanceStudentNotStarted: 'rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600',
      // Ajuan absensi menunggu review
      attendanceAjuanPending: 'rounded-md border border-amber-200/90 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-950',
      // Admin — severity (support tickets)
      severityHigh: 'rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700',
      severityMedium: 'rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700',
      severityLow: 'rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700',
      // Admin — payout
      payoutRequested: 'rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700',
      payoutApproved: 'rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
      payoutPaid: 'rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700',
      payoutRejected: 'rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700',
      // Admin — audit
      auditCreate: 'rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
      auditUpdate: 'rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700',
      auditDelete: 'rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700',
      auditView: 'rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600',
      // Admin — coupons
      couponActive: 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
      couponExpired: 'rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500',
      couponScheduled: 'rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700',
      // Admin — course status
      coursePublished: 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
      courseDraft: 'rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700',
      coursePending: 'rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700',
      courseRejected: 'rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700',
      // Admin — QA
      qaAnswered: 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
      qaUnanswered: 'rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700',
      // Category chips (multi badge untuk mentor specialization)
      categoryDev: 'rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700',
      categoryDesign: 'rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700',
      categoryData: 'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700',
      categoryMarketing: 'rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700',
      categoryBusiness: 'rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700',
      categoryLanguage: 'rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700',
      categoryDefault: 'rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600',
    },
  },
  defaultVariants: {
    variant: 'free',
  },
})
