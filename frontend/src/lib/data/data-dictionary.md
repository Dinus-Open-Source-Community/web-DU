# Data dictionary — `seed-data.json`

Dokumen ini menjelaskan struktur **satu file** seed frontend (`src/lib/data/json/seed-data.json`), relasi antar entitas, dan pemetaan ke **halaman / route** yang memakai data tersebut lewat [`repository.ts`](./repository.ts).

> **Catatan:** JSON tidak mendukung komentar inline. Gunakan file ini sebagai sumber kebenaran untuk dokumentasi backend/API.

---

## Ringkasan

| Bagian JSON              | Jumlah baris logis | Fungsi                                                                        |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------- |
| `categories`             | 5                  | Kategori kursus (FK `id` → `courses[].categoryId`)                            |
| `users`                  | 18                 | Identitas login + profil dasar (`id` unik; dipakai mentor/admin/siswa)        |
| `mentors`                | 5                  | Profil ekstensi mentor (`id` = `users.id` untuk role mentor)                  |
| `students`               | 5                  | Ringkasan admin untuk siswa (`uid` = `users.id` siswa seed)                   |
| `administrators`         | 5                  | Tabel admin (`uid` = `users.id` admin seed)                                   |
| `courses`                | 5                  | Katalog + **modules + lessons** (tiptap / video / quiz)                       |
| `reviews`                | 5                  | Ulasan per kursus (`courseUid`, `studentUid`)                                 |
| `qaThreads`              | 5                  | Forum Q&A (`courseUid`, `authorUid`)                                          |
| `transactions`           | 5 + 5 + 5          | `recent`, `history`, `admin` — masing-masing punya `courseUid` + `studentUid` |
| `certificates`           | 5                  | Sertifikat (`courseUid`, `studentUid`)                                        |
| `schedules`              | 5                  | Jadwal mentor (`courseId` = `courses[].uid`)                                  |
| `studentEnrolledCourses` | 5                  | Enrollment dummy (`courseUid`, `studentUid`)                                  |
| `tickets`                | 5                  | Tiket support (`studentUid`)                                                  |
| `payouts`                | 5                  | Payout mentor (`mentorUid`)                                                   |
| `coupons`                | 5                  | Kupon                                                                         |
| `auditLogs`              | 5                  | Audit trail (`resource` + `resourceId` polimorfik)                            |
| `analytics`              | objek agregat      | KPI + deret chart (bukan 5 baris per chart — disederhanakan)                  |
| `dashboard`              | objek              | Statistik siswa, resume kursus, deadline, feedback, profile, mentorStats      |
| `rbac`                   | objek              | `permissionGroups` + `roles`                                                  |
| `programFeatures`        | 4                  | Fitur landing (ikon = string, di-map di UI)                                   |
| `courseExtras`           | objek              | `whatYouLearn`, `feedbackBreakdown`, `mentorSpecColors`                       |

**Course UIDs untuk uji preview materi:** `crs-001` … `crs-005` — setiap kursus punya 2 modul × beberapa lesson (tiptap, video YouTube, quiz).

**User dev (middleware / `useUser`):** `usr-student-01`, `usr-mentor-01`, `usr-admin-01` — harus tetap ada di `users` agar [`dummyUsers.ts`](./dummyUsers.ts) berfungsi.

**Mentor dev & kursus:** `usr-mentor-01` punya baris di `mentors[]` dan memiliki **`crs-001`** (`mentorId`), agar login mentor demo melihat kursus yang sama di hub/editor.

---

## Relasi utama (FK)

```
categories.id  ←──  courses.categoryId
users.id       ←──  mentors.id
users.id       ←──  courses.mentorId   (mentorUid di response join)
users.id       ←──  students.uid        (siswa seed stu-001 …)
users.id       ←──  administrators.uid

courses.uid    ←──  reviews.courseUid
students.uid   ←──  reviews.studentUid

courses.uid    ←──  qaThreads.courseUid
users.id       ←──  qaThreads.authorUid (biasanya stu-*)

courses.uid    ←──  transactions.*.courseUid
students.uid   ←──  transactions.*.studentUid

courses.uid    ←──  certificates.courseUid
students.uid   ←──  certificates.studentUid

courses.uid    ←──  attendance.courseId
courses.uid    ←──  schedules.courseId

courses.uid    ←──  studentEnrolledCourses.courseUid
students.uid   ←──  studentEnrolledCourses.studentUid

students.uid   ←──  tickets.studentUid
mentors.id     ←──  payouts.mentorUid
```

Response **join** ke frontend (contoh `listCourses()`): `ICardData` memuat `category` (nama) dan `categoryId`, `author` (nama + avatar dari `users`), `modules` embedded.

---

## Pemetaan: bagian JSON → halaman / fitur

| Key / area                                                 | Fungsi repository (utama)                                                                             | Route / area UI                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `courses`, `categories`, `users` + `mentors`               | `listCourses`, `listCategories`, `getCourseByUid`, `listMentors`, `getSyllabusFromCourse`             | `/`, `/course`, `/course/[uid]`                                                     |
| `courseExtras`                                             | `getCourseWhatYouLearn`, `getCourseFeedbackBreakdown`                                                 | `/course/[uid]` (detail)                                                            |
| `programFeatures`                                          | `getProgramFeatures`                                                                                  | `/` (landing)                                                                       |
| `courses` (modules)                                        | `getCourseByUid` + [`mentorCourseStorage`](../mentorCourseStorage.ts)                                 | `/course/[uid]/view` — **CourseModulePreview**; `/mentor/courses/.../edit`          |
| `certificates`                                             | `listCertificates`, `getCertificateByUid`                                                             | `/certificate/[uid]`, `/student/certificates`                                       |
| `dashboard`                                                | `getDashboardStats`, `getResumeCourses`, `getDeadlines`, `getFeedbacks`, `getProfileData`             | `/student/dashboard`, hooks `useDashboard`                                          |
| `dashboard.mentorStats`, `schedules`                       | `getMentorDashboardStats`, `listSchedules`                                                            | `/mentor/dashboard`, `useMentorDashboard`                                           |
| `analytics`                                                | `getDashboardKpis`, `getRevenueLine30d`, `getNewUsersWeek`, `getTopCoursesByEnrolment`, …             | `/admin/dashboard`, `/admin/financial`, `/admin/transactions`, `/admin/analytics/*` |
| `transactions`                                             | `listRecentTransactions`, `listHistoryTransactions`, `listAdminTransactions`, `getTransactionsSource` | Admin dashboard widget, `/admin/transactions`, `/student/transactions`              |
| `tickets`                                                  | `listTickets`                                                                                         | `/admin/dashboard` (widget)                                                         |
| `courses`                                                  | `listCourses`, `listAdminCategories`                                                                  | `/admin/courses`                                                                    |
| `reviews`, `qaThreads`                                     | `listAllReviews`, `listAllQaThreads`                                                                  | `/admin/courses/reviews-qa`                                                         |
| `students`, `transactions.admin`, `studentEnrolledCourses` | `listStudents`, `listAdminTransactions`, `listStudentEnrolledCourses`                                 | `/admin/users/students`, `/admin/users/students/[uid]`                              |
| `mentors`, `courseExtras.mentorSpecColors`                 | `listMentors`, `getMentorSpecColors`, `listCourses`                                                   | `/admin/users/mentors`, detail mentor                                               |
| `administrators`                                           | `listAdministrators`                                                                                  | `/admin/users/administrators`                                                       |
| `payouts`                                                  | `listPayouts`                                                                                         | Admin finance / payout UI                                                           |
| `coupons`                                                  | `listCoupons`                                                                                         | Admin marketing                                                                     |
| `auditLogs`                                                | `listAuditLogs`                                                                                       | `/admin/security` (audit)                                                           |
| `rbac`                                                     | `listRoles`, `listPermissionGroups`                                                                   | `/admin/security` (RBAC)                                                            |
| `users`                                                    | `listUsers`                                                                                           | `dummyUsers`, middleware, `useUser`                                                 |

---

## Petunjuk API backend

1. **Satu endpoint bundle (opsional):** `GET /api/seed` atau gunakan endpoint per-domain yang mirror struktur key di atas.
2. **Course detail + kurikulum:** `GET /courses/:uid` mengembalikan metadata + `modules[]` dengan discriminated union lesson (`contentType`: `tiptap` | `video` | `quiz`).
3. **Konsistensi FK:** response boleh menyertakan field denormalized (`courseName`, `studentName`) untuk UI, tetapi **sumber kanonik** tetap `courseUid` / `studentUid` / `categoryId` / `mentorId`.
4. **Preview tanpa edit:** pastikan lesson di DB/API sama struktur dengan seed agar `/course/[uid]/view` tidak bergantung pada `sessionStorage` mentor.

---

## File terkait

- [`repository.ts`](./repository.ts) — baca `seed-data.json`, join, ekspor fungsi sinkron.
- [`../types/index.ts`](../types/index.ts) — tipe TypeScript (`ICardData`, `TransactionHistoryItem`, dll.) termasuk field FK opsional baru.
