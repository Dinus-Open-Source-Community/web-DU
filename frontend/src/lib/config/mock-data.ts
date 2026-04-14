/**
 * Fixture data (dummyData / localStorage seed) aktif jika:
 * - `NEXT_PUBLIC_USE_MOCK_DATA=true`, atau
 * - variabel tidak diset dan build bukan production (pengembangan lokal).
 *
 * Set `NEXT_PUBLIC_USE_MOCK_DATA=false` pada build produksi agar UI memakai empty state hingga API tersedia.
 */
export function isMockDataEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_USE_MOCK_DATA
  if (v === 'true') return true
  if (v === 'false') return false
  return process.env.NODE_ENV !== 'production'
}
