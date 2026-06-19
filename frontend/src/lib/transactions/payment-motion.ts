export type PaymentMotionStatus = 'pending' | 'success' | 'failed'

export type PaymentMotionOverlayMode = 'loading' | 'status'

export const PAYMENT_LOTTIE_ASSETS: Record<PaymentMotionStatus, string> = {
  pending: '/Card-swiping.lottie',
  success: '/Payment-Success.lottie',
  failed: '/Payment-Failed.lottie',
}

export const PAYMENT_MOTION_DURATION_MS = 1000

export const PAYMENT_MOTION_MIN_LOADER_MS = 900

export const PAYMENT_MOTION_TIMING = {
  pendingDisplay: 4200,
  terminalDisplay: 3600,
  exit: PAYMENT_MOTION_DURATION_MS,
  enter: PAYMENT_MOTION_DURATION_MS,
} as const

type PaymentMotionTheme = {
  background: string
  ring: string
  badge: string
}

export const PAYMENT_MOTION_THEME: Record<PaymentMotionStatus, PaymentMotionTheme> = {
  pending: {
    background: 'bg-sky-600',
    ring: 'ring-white/20',
    badge: 'bg-white/15 text-white',
  },
  success: {
    background: 'bg-green-600',
    ring: 'ring-white/20',
    badge: 'bg-white/15 text-white',
  },
  failed: {
    background: 'bg-red-600',
    ring: 'ring-white/20',
    badge: 'bg-white/15 text-white',
  },
}

type PaymentMotionCopy = {
  title: string
  description: string
  hint: string
  ariaLabel: string
}

export const PAYMENT_MOTION_LOADER_COPY: PaymentMotionCopy = {
  title: 'Memuat pembayaran',
  description: 'Mohon tunggu sebentar, detail transaksi sedang disiapkan.',
  hint: '',
  ariaLabel: 'Memuat detail pembayaran',
}

export const PAYMENT_MOTION_COPY: Record<PaymentMotionStatus, PaymentMotionCopy> = {
  pending: {
    title: 'Pembayaran Tertunda',
    description:
      'Selesaikan langkah pembayaran Anda. Status akan diperbarui otomatis setelah transaksi dikonfirmasi.',
    hint: 'Ketuk untuk melihat instruksi pembayaran',
    ariaLabel: 'Menunggu konfirmasi pembayaran',
  },
  success: {
    title: 'Pembayaran berhasil',
    description: 'Transaksi telah diverifikasi. Detail pembayaran siap ditinjau.',
    hint: 'Ketuk untuk melanjutkan',
    ariaLabel: 'Pembayaran berhasil',
  },
  failed: {
    title: 'Pembayaran gagal',
    description: 'Transaksi belum dapat diselesaikan. Periksa detail untuk langkah berikutnya.',
    hint: 'Ketuk untuk melanjutkan',
    ariaLabel: 'Pembayaran gagal',
  },
}

export function getPaymentMotionDisplayMs(status: PaymentMotionStatus): number {
  return status === 'pending'
    ? PAYMENT_MOTION_TIMING.pendingDisplay
    : PAYMENT_MOTION_TIMING.terminalDisplay
}
