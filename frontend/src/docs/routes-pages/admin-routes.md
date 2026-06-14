# Admin Routes Coverage (Legacy)

> **Perbarui:** Lihat [../page-coverage.md](../page-coverage.md) untuk matriks lengkap semua role.

Dokumen ringkas route admin saja — Juni 2026.

## Registered Routes

| Route | Page | Status FE | Data |
|-------|------|-----------|------|
| `/admin/dashboard` | `Dashboard.tsx` | 🔴 Mock | KPI, tickets, transactions hardcoded |
| `/admin/users/students` | `Student.tsx` | ✅ Live | `GET /user/manage/all?role=student` |
| `/admin/users/mentors` | `Mentors.tsx` | ✅ Live | + promote siswa → mentor |
| `/admin/users/administrators` | `Admin.tsx` | 🟡 Partial | `role=admin` — `super_admin` tidak ikut |
| `/admin/courses` | `Courses.tsx` | ✅ Live | `GET /courses` |
| `/admin/courses/:courseUid` | `DetailCourse.tsx` | 🟡 Partial | API live; unassign/reply belum |
| `/admin/courses/:courseUid/edit` | `CourseEdit.tsx` | ✅ Live | Kurikulum; update metadata butuh `PUT /courses/:id` |
| `/admin/course-categories` | `CourseCategories.tsx` | ✅ Live | CRUD |
| `/admin/course-types` | `CourseTypes.tsx` | ✅ Live | CRUD |
| `/admin/transactions` | `Transactions.tsx` | 🔴 Mock | — |
| `/admin/financial` | `Financial.tsx` | 🔴 Mock | — |
| `/admin/reviews-and-qa` | `ReviewsQA.tsx` | 🚫 Unregistered | Comment di `App.tsx` |

## Navigation Gaps

- `/admin/reviews-and-qa` — tidak di sidebar, tidak di router
- Link salah di dashboard components (lihat `page-coverage.md`)

## API Routes Admin (sudah dipakai)

```
GET    /user/manage/all
PATCH  /user/role/:id
DELETE /user/manage/:id
GET    /courses
POST   /courses
GET    /courses/:uid
PATCH  /courses/:uid/status
POST   /courses/:uid/mentors/assign
GET    /courses/:uid/students
POST/PUT/DELETE /course-categories, /course-types
POST/PUT/DELETE /modules, /lessons
```

## API Routes Admin (dibutuhkan, belum ada)

```
PUT    /courses/:id
POST   /courses/:id/mentors/unassign
GET    /admin/transactions
GET    /admin/transactions/summary
GET    /admin/financial/summary
GET    /admin/dashboard/kpis
GET    /admin/reviews
GET    /admin/qna
```
