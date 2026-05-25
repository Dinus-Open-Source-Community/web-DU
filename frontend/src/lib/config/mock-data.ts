/**
 * Mode aplikasi tanpa backend: semua data dari fixture/mock lokal.
 * Tidak ada `fetch` ke API aplikasi dari hooks — lihat `lib/api/fetcher.ts`.
 *
 * Untuk akses middleware / RBAC tanpa credential sungguhan: set cookie role
 * `du_auth_role` (AUTH_COOKIE_ROLE) ke `student` | `mentor` | `admin` sebelum login dummy,
 * lalu masuk lewat form login — `lib/auth/api.ts` membaca role dari cookie tersebut.
 */
export function isMockDataEnabled(): boolean {
  return true
}
