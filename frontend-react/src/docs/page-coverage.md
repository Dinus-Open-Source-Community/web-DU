# Matriks Cakupan Halaman

Status integrasi setiap halaman di `frontend-react/src/pages/` per Juni 2026.

**Keterangan status:**
- **Live** — data dari API, flow utama berfungsi
- **Partial** — sebagian API, sebagian mock atau ada gap payload
- **Mock** — data hardcoded / kosong, belum panggil service
- **Unregistered** — file page ada, route tidak aktif di `App.tsx`

---

## Public & Landing

| Route | Page | Status | Sumber Data | Catatan |
|-------|------|--------|-------------|---------|
| `/` | `landing/Home.tsx` | Mock | `Data={[]}` hardcoded | Hero statis; feature/benefit kosong |
| `/course` | `landing/Course.tsx` | Live | `GET /courses`, `GET /course-categories` | Filter kategori di UI belum sinkron query BE (lihat payload-gaps) |
| `/course/:courseUid` | `courses/detail.tsx` | Live | `GET /courses/:uid`, `GET /course-categories/:id` | Popular courses pakai query `course_category_id` yang BE abaikan |
| `/course/:courseUid/view` | `courses/view.tsx` | Live | `GET /courses/:uid`, `GET /modules/course/:id`, `GET /lessons` | Dipakai student/mentor/admin untuk preview modul |

---

## Auth

| Route | Page | Status | Sumber Data | Catatan |
|-------|------|--------|-------------|---------|
| `/auth/login` | `auth/Login.tsx` | Live | `POST /login` | — |
| `/auth/register` | `auth/Register.tsx` | Live | `POST /register` | — |
| `/auth/oauth/callback` | `auth/Oauth.tsx` | Live | `GET /oauth/google/callback` | — |
| `/auth/forgot-password` | `auth/ForgotPass.tsx` | Mock | Tidak ada API call | Hanya set state lokal `submitted=true` |
| `/auth/reset-password` | `auth/ResetPass.tsx` | Mock | Tidak ada API call | Baca `?token=` tapi tidak POST ke BE |

---

## Profile (semua role)

| Route | Page | Status | Sumber Data | Catatan |
|-------|------|--------|-------------|---------|
| `/profile` | `profile/Profile.tsx` | Partial | `GET /user/data`, `PATCH /user/profile`, `POST /avatar` | Ganti password: payload FE tidak kirim `old_password` (lihat payload-gaps) |

---

## Admin

| Route | Page | Status | Sumber Data | Catatan |
|-------|------|--------|-------------|---------|
| `/admin/dashboard` | `admin/Dashboard.tsx` | Mock | KPI, tickets, transactions hardcoded/kosong | Butuh endpoint aggregate (lihat api-route-gaps) |
| `/admin/users/students` | `admin/Student.tsx` | Live | `GET /user/manage/all`, `PATCH /user/role/:id`, `DELETE /user/manage/:id` | `totalSpent` di-map ke `0` (BE tidak kirim) |
| `/admin/users/mentors` | `admin/Mentors.tsx` | Live | Sama + promote dari list siswa | `totalCourses`, `rating`, `studentsCount` = 0 |
| `/admin/users/administrators` | `admin/Admin.tsx` | Partial | `GET /user/manage/all?role=admin` | User `super_admin` tidak muncul di filter `admin` |
| `/admin/courses` | `admin/Courses.tsx` | Live | `GET /courses` | Filter Aktif/Draf client-side; tidak ada delete course |
| `/admin/courses/:courseUid` | `admin/DetailCourse.tsx` | Partial | `GET /courses/:uid`, `GET /courses/:uid/students`, modules | Assign mentor live; lepas mentor & reply review belum |
| `/admin/courses/:courseUid/edit` | `admin/CourseEdit.tsx` | Live | modules, lessons CRUD | Update metadata kursus via `PUT /courses/:uid` → **BE belum ada** |
| `/admin/course-categories` | `admin/CourseCategories.tsx` | Live | CRUD `/course-categories` | — |
| `/admin/course-types` | `admin/CourseTypes.tsx` | Live | CRUD `/course-types` | — |
| `/admin/transactions` | `admin/Transactions.tsx` | Mock | Array hardcoded di page | `GET /payment` di FE salah kontrak |
| `/admin/financial` | `admin/Financial.tsx` | Mock | Chart/KPI hardcoded | Tidak ada endpoint financial |
| `/admin/reviews-and-qa` | `admin/ReviewsQA.tsx` | Unregistered | Mock di file page | Route di-**comment** di `App.tsx`; tidak ada di sidebar |

---

## Mentor

| Route | Page | Status | Sumber Data | Catatan |
|-------|------|--------|-------------|---------|
| `/mentor/dashboard` | `mentor/Dashboard.tsx` | Mock | Stats `0`, jadwal hardcoded | Tidak ada endpoint dashboard mentor |
| `/mentor/courses` | `mentor/Courses.tsx` | Mock | `ICourseItem[]` hardcoded | Seharusnya `GET /courses?mentor_id={uid}` |
| `/mentor/courses/:courseUid` | `mentor/DetailCourse.tsx` | Mock | Course & students hardcoded | Admin detail sudah live; mentor belum disamakan |
| `/mentor/courses/:courseUid/edit` | `mentor/CourseEdit.tsx` | Live | Sama seperti admin edit | — |
| `/mentor/courses/:courseUid/assignments` | `mentor/CourseAssignments.tsx` | Mock | Assignment & submission hardcoded | BE punya lesson assignment API, belum di-wire |

---

## Student

| Route | Page | Status | Sumber Data | Catatan |
|-------|------|--------|-------------|---------|
| `/student/dashboard` | `student/Dashboard.tsx` | Partial | `GET /user/data` via auth profile | Dashboard section pakai data profil, bukan endpoint dashboard khusus |
| `/student/learning` | `student/Learning.tsx` | Partial | `joined_courses` dari `GET /user/data` | — |
| `/student/learning/course/:courseUid` | `courses/view.tsx` (reuse) | Live | course + modules + lessons | — |
| `/student/browse` | `student/BrowseCourse.tsx` | Live | `GET /courses`, categories | — |
| `/student/assignments` | `student/Assignments.tsx` | Mock | Array hardcoded di page | BE punya submission endpoints per lesson |
| `/student/certificates` | `student/Certificates.tsx` | Mock | `certificateRows = []` kosong | Tidak ada API certificate di BE |
| `/student/transactions` | `student/Transactions.tsx` | Partial | `transaction_history` dari `GET /user/data` | Tidak pakai `GET /payment`; filter/pagination client-side |

---

## Route Link yang Salah (bukan page, tapi mempengaruhi navigasi)

| Komponen | Link salah | Seharusnya |
|----------|------------|------------|
| `Admin/Dashboard/Ticket.tsx` | `/admin/security/audit-logs` | Route tidak terdaftar — perlu dibuat atau ganti link |
| `Admin/Dashboard/RecentTransactions.tsx` | `/admin/finance/transactions` | `/admin/transactions` |

---

## Perbandingan Admin vs Mentor (detail kursus)

| Fitur | Admin `DetailCourse.tsx` | Mentor `DetailCourse.tsx` |
|-------|--------------------------|---------------------------|
| Fetch API | ✅ `useCourseDetailAdminAndMentor` | 🔴 Mock array |
| Peserta | ✅ `GET /courses/:id/students` | 🔴 Mock `IMentorCourseStudent` dengan field lama |
| Assign mentor | ✅ (admin only) | N/A |
| Publish | ✅ `PATCH /courses/:id/status` | Sama komponen, tapi data mock |
| Edit metadata | ✅ Dialog (API update belum di BE) | Sama komponen, data mock |

**Rekomendasi FE:** Samakan mentor detail dengan pola admin (hook yang sama + filter mentor ownership).
