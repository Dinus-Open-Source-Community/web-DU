/** Konfigurasi polling realtime halaman detail pembayaran Tripay. */
export const PAYMENT_DETAIL_REALTIME = {
  /** Interval polling saat status masih pending (ms). */
  pollIntervalMs: 2_000,
  /** Data selalu dianggap stale agar refetch interval tidak tertahan. */
  staleTimeMs: 0,
  /** Tetap poll meski tab tidak aktif. */
  refetchInBackground: true,
} as const
