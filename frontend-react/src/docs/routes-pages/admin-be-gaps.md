# Admin Backend Gaps

Dokumen ini mencatat kekurangan backend yang terlihat dari kebutuhan route/page admin frontend.

## High Priority

### 1. Belum ada endpoint dashboard aggregate

`pages/admin/Dashboard.tsx` membutuhkan:

- KPI platform (`AdminKpi[]`)
- recent transactions
- unresolved support tickets

Saat ini semua masih mock/kosong.

Endpoint yang disarankan:

- `GET /admin/dashboard/kpis`
- `GET /admin/dashboard/recent-transactions`
- `GET /admin/dashboard/support-tickets`

### 2. Belum ada endpoint financial analytics

`pages/admin/Financial.tsx` membutuhkan:

- KPI revenue
- monthly revenue
- revenue by category
- revenue source ratio

Saat ini data masih hardcoded.

Endpoint yang disarankan:

- `GET /admin/financial/summary`

### 3. Belum ada endpoint support tickets

Komponen `UnresolvedTickets` sudah ada, tetapi:

- Data masih kosong.
- Link "Lihat semua" mengarah ke `/admin/security/audit-logs`, route ini belum ada.
- Belum ada API support tickets di `API_ROUTES`.

Endpoint yang disarankan:

- `GET /admin/support-tickets`
- `GET /admin/support-tickets/:ticketUid`
- `PATCH /admin/support-tickets/:ticketUid/status`

Route yang disarankan:

- `/admin/support-tickets`
- `/admin/support-tickets/:ticketUid`

### 4. Users management masih mock

Halaman ini masih pakai data lokal:

- `/admin/users/students`
- `/admin/users/mentors`
- `/admin/users/administrators`

`API_ROUTES` sudah punya beberapa endpoint user:

- `GET /user/manage/all`
- `DELETE /user/manage/:uid`
- `PATCH /user/role/:uid`
- `GET /user/:uid`

Namun FE membutuhkan response role-specific yang cocok dengan:

- `AdminStudent`
- `AdminMentor`
- `AdminAdministrator`

Kekurangan BE yang perlu dipastikan:

- filter by role
- search by name/email
- pagination
- sort
- status update
- invite/create admin
- detail user by uid dengan summary progress/spending/courses

### 5. Course admin masih mock di beberapa page

Halaman berikut belum memakai API live:

- `/admin/courses`
- `/admin/courses/:courseUid`
- `/admin/courses/:courseUid/edit`

`API_ROUTES` sudah punya:

- `GET /courses`
- `POST /courses`
- `GET /courses/:uid`
- `PATCH /courses/:uid/status`
- `POST /courses/:uid/mentors/assign`
- `GET /courses/:uid/students`

Kekurangan yang perlu dipastikan dari BE:

- update course detail (`PATCH /courses/:uid`) belum ada di `API_ROUTES`.
- delete course belum ada di `API_ROUTES`.
- course edit membutuhkan update module/lesson yang stabil.
- `GET /courses/:uid/students` harus mengembalikan progress, attendance, status, dan last active.

## Medium Priority

### 6. Reviews & Q&A moderation belum punya endpoint admin khusus

`/admin/reviews-and-qa` masih mock.

Saat ini `API_ROUTES` hanya punya:

- `POST /courses/:uid/review`
- `POST /courses/:courseUid/review/:reviewUid/reply`

Kekurangan BE:

- list semua reviews lintas course
- filter by courseUid/rating/hasReply
- list Q&A thread
- reply Q&A sebagai admin
- mark Q&A answered/unanswered
- moderation action untuk hide/delete review/Q&A jika dibutuhkan

Endpoint yang disarankan:

- `GET /admin/reviews`
- `POST /admin/reviews/:reviewUid/reply`
- `GET /admin/qna`
- `POST /admin/qna/:threadUid/replies`
- `PATCH /admin/qna/:threadUid/status`

### 7. Transactions admin response belum match UI

`API_ROUTES.payment.getAll()` sudah ada, tetapi dashboard admin transaksi membutuhkan:

- student name/avatar
- course image/name
- payment method label
- payment status
- timeline paid/pending/failed
- ratio paid/pending/failed
- summary gross revenue

Endpoint yang disarankan:

- `GET /admin/transactions`
- `GET /admin/transactions/summary`

Atau `GET /payment` diperluas dengan response admin-specific saat role admin.

### 8. Route link tidak sesuai

Perlu dirapikan antara frontend route dan backend feature:

- `/admin/finance/transactions` tidak ada. Gunakan `/admin/transactions`.
- `/admin/security/audit-logs` tidak ada. Jika dibutuhkan, tambahkan route dan endpoint audit logs.

## Low Priority

### 9. Category dan course type admin belum ada halaman khusus

`API_ROUTES` sudah punya CRUD:

- `/course-categories`
- `/course-types`

Namun belum ada route admin untuk mengelola kategori dan tipe course.

Route yang disarankan:

- `/admin/course-categories`
- `/admin/course-types`

### 10. Audit logs belum ada

Untuk admin platform, audit logs biasanya dibutuhkan untuk:

- login admin
- update role
- publish/unpublish course
- delete/update resource
- payment status manual action

Endpoint yang disarankan:

- `GET /admin/audit-logs`

Response minimal:

```ts
interface AdminAuditLog {
  uid: string
  actorUid: string
  actorName: string
  action: string
  resourceType: string
  resourceUid?: string
  metadata?: Record<string, unknown>
  createdAt: string
}
```

## Summary Prioritas BE

Urutan implementasi yang paling berdampak untuk admin dashboard:

1. `GET /admin/dashboard/kpis`
2. `GET /admin/dashboard/recent-transactions`
3. `GET /admin/dashboard/support-tickets`
4. `GET /admin/transactions` + summary
5. `GET /admin/financial/summary`
6. `GET /user/manage/all` dengan filter role/pagination yang stabil
7. `GET /admin/reviews` dan `GET /admin/qna`
8. Support tickets detail/status routes
9. Audit logs
10. Category/course type admin pages
