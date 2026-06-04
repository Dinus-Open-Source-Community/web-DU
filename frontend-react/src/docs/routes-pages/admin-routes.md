# Admin Routes Coverage

Dokumen ini merangkum route admin yang sudah tersedia di frontend berdasarkan:

- `frontend-react/src/lib/routes.ts`
- `frontend-react/src/lib/navigation.tsx`
- `frontend-react/src/App.tsx`
- `frontend-react/src/pages/admin/*`

## Registered Routes

| Route | Page | Role | Navigation | Status FE |
| --- | --- | --- | --- | --- |
| `/admin/dashboard` | `pages/admin/Dashboard.tsx` | `admin` | Ada | Ada, tetapi data KPI/tiket/transaksi masih lokal/mock |
| `/admin/users/students` | `pages/admin/Student.tsx` | `admin` | Ada | Ada, data masih lokal/mock |
| `/admin/users/mentors` | `pages/admin/Mentors.tsx` | `admin` | Ada | Ada, data masih lokal/mock |
| `/admin/users/administrators` | `pages/admin/Admin.tsx` | `admin` | Ada | Ada, data masih lokal/mock |
| `/admin/courses` | `pages/admin/Courses.tsx` | `admin` | Ada | Ada, data masih lokal/mock |
| `/admin/courses/:courseUid` | `pages/admin/DetailCourse.tsx` | `admin` | Tidak langsung | Ada, data masih lokal/mock |
| `/admin/courses/:courseUid/edit` | `pages/admin/CourseEdit.tsx` | `admin` | Tidak langsung | Ada, data masih lokal/mock |
| `/admin/transactions` | `pages/admin/Transactions.tsx` | `admin` | Ada | Ada, data masih lokal/mock |
| `/admin/financial` | `pages/admin/Financial.tsx` | `admin` | Ada | Ada, data chart/KPI masih lokal/mock |
| `/admin/reviews-and-qa` | `pages/admin/ReviewsQA.tsx` | `admin` | Tidak ada di sidebar | Ada, data masih lokal/mock; mendukung query `?courseUid=` |

## Navigation Gaps

Route yang ada di router tetapi belum muncul di sidebar admin:

- `/admin/reviews-and-qa`
- `/admin/courses/:courseUid`
- `/admin/courses/:courseUid/edit`

Route detail/edit kursus wajar tidak muncul di sidebar karena bersifat contextual. Namun `Reviews & Q&A` sebaiknya ditambahkan ke navigation jika memang menjadi fitur admin utama.

## Route Links Yang Tidak Selaras

Ada link di komponen dashboard yang mengarah ke route yang belum terdaftar:

| File | Link | Masalah |
| --- | --- | --- |
| `components/Admin/Dashboard/Ticket.tsx` | `/admin/security/audit-logs` | Route tidak ada di `ROUTES` dan `App.tsx` |
| `components/Admin/Dashboard/RecentTransactions.tsx` | `/admin/finance/transactions` | Route tidak ada; route transaksi yang benar adalah `/admin/transactions` |

## Current Admin Pages Data Source

Mayoritas page admin belum memakai service/API live:

- `Dashboard.tsx`: KPI mock, tickets kosong, recent transactions kosong.
- `Student.tsx`: mock `AdminStudent[]`.
- `Mentors.tsx`: mock `AdminMentor[]` dan mock `AdminStudent[]`.
- `Admin.tsx`: mock administrators, mentors, students.
- `Courses.tsx`: mock `CourseListResponse`.
- `DetailCourse.tsx`: mock course detail dan mock course students.
- `CourseEdit.tsx`: mock course detail.
- `Transactions.tsx`: mock transactions, ratio, timeline.
- `Financial.tsx`: mock chart/KPI.
- `ReviewsQA.tsx`: mock reviews dan Q&A.

## API Routes Already Declared

Endpoint path yang sudah tersedia di `API_ROUTES` dan bisa dipakai untuk sebagian admin page:

- Users:
  - `GET /user/manage/all`
  - `DELETE /user/manage/:uid`
  - `PATCH /user/role/:uid`
  - `GET /user/:uid`
- Mentors:
  - `GET /mentor/all`
  - `GET /mentor/:uid`
- Courses:
  - `GET /courses`
  - `POST /courses`
  - `GET /courses/:uid`
  - `PATCH /courses/:uid/status`
  - `POST /courses/:uid/mentors/assign`
  - `GET /courses/:uid/students`
  - `POST /courses/:uid/review`
  - `POST /courses/:courseUid/review/:reviewUid/reply`
- Modules/Lessons:
  - CRUD modules
  - CRUD lessons
  - Lesson assignment/submission/attendance routes
- Payment:
  - `GET /payment`
  - `POST /payment/create`
  - `POST /payment/tripay`
- Invoices:
  - `GET /invoices/url`
  - `GET /invoices/:enrollmentUid`

## Recommended Route Additions

Jika fitur admin dashboard ingin lengkap, pertimbangkan menambahkan:

| Route | Tujuan |
| --- | --- |
| `/admin/support-tickets` | List dan detail tiket support |
| `/admin/support-tickets/:ticketUid` | Detail tiket dan aksi resolve |
| `/admin/reviews-and-qa` di sidebar | Akses langsung moderation review/Q&A |
| `/admin/users/students/:studentUid` | Detail siswa |
| `/admin/users/mentors/:mentorUid` | Detail mentor |
| `/admin/users/administrators/:adminUid` | Detail admin/staff |
| `/admin/audit-logs` | Audit aktivitas admin/platform |
| `/admin/categories` | CRUD kategori course |
| `/admin/course-types` | CRUD tipe course |
