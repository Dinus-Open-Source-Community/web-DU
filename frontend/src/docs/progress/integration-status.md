# Status Integrasi FE ↔ BE

Dokumen **living status** untuk branch `features/frontend-sapto`.  
Memetakan apa yang sudah diimplementasikan, apa yang belum, API mana yang dipakai FE, dan gap FE↔BE.

**Referensi backend:** `backend/internal/handler/routes/` (kontrak API)  
**Terakhir diperbarui:** 14 Juni 2026 (Fase 21: katalog enrollment-aware + redesign detail pembayaran)

---

## Cara Membaca

| Simbol | Arti |
|--------|------|
| ✅ | Live — service + hook/halaman terhubung API |
| 🟡 | Partial — sebagian jalan, ada gap data/UX/mapper |
| 🔴 | Mock / belum di-wire — UI ada, data hardcode atau tidak panggil API |
| ⏳ | FE siap / hampir siap, blocker di BE atau route belum ada di `api-path.ts` |
| 🚫 | Sengaja tidak diimplementasikan (BE atau produk) |

**Layer yang dicek:** `api-path.ts` → `services/*.ts` → `hooks/**` → `pages/**` / komponen.

---

## Metrik Ringkas

| Metrik | Nilai |
|--------|-------|
| Halaman admin terintegrasi API (live/partial) | 13+ dari 15 route utama |
| Halaman student live/partial | 6 dari 8 |
| Halaman mentor live/partial | 4 dari 6 |
| Service domain (`services/*.ts`) | 17 file |
| Endpoint di `api-path.ts` | ~60 path |
| Endpoint BE merge J-yriz belum di-wire FE | 5+ (admin reviews/Q&A, course Q&A) |
| Halaman masih mock penuh | Mentor courses/detail, legacy assignments, landing Home, auth recovery, sertifikat |

---

## 1. Matriks Fitur — Sudah vs Belum Diimplementasikan

### Admin

| Fitur | Halaman / Komponen | Status | Catatan |
|-------|-------------------|--------|---------|
| List & kelola siswa | `admin/Student.tsx` | ✅ | Search, pagination, role, delete |
| List & kelola mentor | `admin/Mentors.tsx` | ✅ | Promote dari siswa |
| List administrator | `admin/Admin.tsx` | 🟡 | `role=admin` sekarang include `super_admin` (BE fix) |
| **Detail user** (profil, kursus, ulasan, transaksi) | `admin/*Detail.tsx` → `UserDetailView` | ✅ | `GET /user/:uid`, SegmentedFilter navigasi |
| CRUD kategori & tipe kursus | `CourseCategories`, `CourseTypes` | ✅ | — |
| Katalog kursus admin | `admin/Courses.tsx` | ✅ | Filter Aktif/Draf via `isCoursePublished()`; hapus hanya dari detail |
| Detail kursus admin | `admin/DetailCourse.tsx` | ✅ | Tugas + roster + penilaian ✅; publish + hapus ✅ |
| Edit kurikulum | `admin/CourseEdit.tsx` | ✅ | Module/lesson CRUD |
| Update metadata kursus | `CourseFormDialog`, `EditCourseDialog` | ✅ | `PUT /courses/:uid` |
| Publish / status kursus | `DetailCourseComponents`, editor kurikulum | ✅ | `PATCH /courses/:uid/status` → `ACTIVE` + `is_published=true`; tombol **Terbit** hanya saat draft |
| Assign mentor | `AssignCourseMentorDialog` | ✅ | — |
| **Unassign mentor** | `CourseMentorTable` | ✅ | `POST /courses/:uid/mentors/unassign` |
| **Hapus / nonaktifkan kursus** | `DetailCourseComponents` | ✅ | `DELETE /courses/:id` — soft delete; dialog konfirmasi; redirect ke `/admin/courses` |
| Tab Tugas (overview + roster + grade) | `CourseDetailAssignmentsTab` + routes submissions | ✅ | Bulk `GET /courses/:id/assignments` + hydrate per lesson |
| Balas review per course | `CourseReviewSection` | 🟡 | Service `replyToCourseReview` ada; verifikasi handler tidak `console.log` |
| Dashboard KPI + chart | `admin/Dashboard.tsx` | ✅ | `GET /admin/dashboard/kpis`, recent-transactions, financial summary, popular courses |
| Transaksi admin | `admin/Transactions.tsx` | ✅ | `GET /admin/transactions` + summary — filter, pagination, chart |
| Financial analytics | `admin/Financial.tsx` | ✅ | `GET /admin/financial/summary` |
| Reviews & Q&A moderasi | `admin/ReviewsQA.tsx` | 🔴 | Mock; route dikomentari di `App.tsx` |

### Mentor

| Fitur | Halaman | Status | Catatan |
|-------|---------|--------|---------|
| Dashboard KPI + jadwal | `mentor/Dashboard.tsx` | ✅ | `GET /mentor/dashboard/kpis`, `GET /mentor/dashboard/schedules` |
| List kursus | `mentor/Courses.tsx` | 🔴 | Hardcode; `fetchCourses` tersedia |
| Detail kursus | `mentor/DetailCourse.tsx` | 🔴 | Data kursus & siswa mock; tab Tugas bisa jalan jika UID valid |
| Edit kurikulum | `mentor/CourseEdit.tsx` | ✅ | Sama pola admin |
| Roster & penilaian submission | `mentor/AssignmentSubmissions*.tsx` | ✅ | Lesson-level API |
| Legacy halaman assignments | `mentor/CourseAssignments.tsx` | 🔴 | Mock; deprecate ke tab Tugas detail |

### Student

| Fitur | Halaman | Status | Catatan |
|-------|---------|--------|---------|
| Dashboard | `student/Dashboard.tsx` | 🟡 | `GET /user/data` |
| Learning (kursus diikuti) | `student/Learning.tsx` | ✅ | `joined_courses` dari profil |
| Module viewer + submit tugas | `courses/view.tsx` | ✅ | Submission POST/PUT live |
| **Assignments lintas kursus** | `student/Assignments.tsx` | ✅ | `GET /students/me/assignments` |
| Browse kursus | `student/BrowseCourse.tsx` | ✅ | `GET /courses`; enrollment active/completed disembunyikan |
| Transaksi | `student/Transactions.tsx` | ✅ | Refactor view model; detail pembayaran via Tripay (Fase 17) |
| **Detail pembayaran** | `student/TransactionPayment.tsx` | ✅ | Polling pending, Suspense skeleton, status animation, modular responsive UI |
| **Checkout join kursus** | `checkout/Checkout.tsx` | ✅ | `POST /courses/:uid/join` + `POST /payment` + redirect ke detail Tripay |
| Sertifikat | `student/Certificates.tsx` | 🔴 | Mock kosong; tidak ada API BE |

### Public & Auth

| Fitur | Halaman | Status | Catatan |
|-------|---------|--------|---------|
| Landing home | `landing/Home.tsx` | 🔴 | Data kosong/hardcode |
| Katalog publik | `landing/Course.tsx` | 🟡 | Enrollment-aware ✅; filter kategori masih perlu verifikasi |
| Detail kursus publik | `courses/detail.tsx` | ✅ | Guest diarahkan login sebelum checkout |
| Login / register / OAuth | `auth/*` | ✅ | Login mempertahankan tujuan checkout melalui route state |
| Forgot / reset password | `auth/ForgotPass`, `ResetPass` | 🔴 | Tidak ada API |
| Profil user | `profile/Profile.tsx` | 🟡 | Update profil ✅; ganti password tanpa `old_password` |

---

## 2. Matriks API — BE Ada & FE Sudah Pakai

Endpoint dari merge J-yriz dan route existing yang **sudah di-wire** ke service + halaman.

| Method | Endpoint | Service | Hook / Halaman utama |
|--------|----------|---------|----------------------|
| `GET` | `/user/manage/all` | `user-manage.ts` | `admin/Student`, `Mentors`, `Admin` |
| `GET` | `/user/:uid` | `user-manage.ts` | `UserDetailView` (detail siswa/mentor/admin) |
| `PATCH` | `/user/role/:uid` | `user-manage.ts` | User manage + detail |
| `DELETE` | `/user/manage/:uid` | `user-manage.ts` | User manage + detail |
| `GET` | `/user/data` | `auth.ts` | Auth, student dashboard/learning/transactions |
| `GET` | `/courses` | `course.ts` | Admin/landing/student browse |
| `GET` | `/courses/:uid` | `course.ts` | Detail course semua role |
| `POST` | `/courses` | `course.ts` | Create course admin |
| `PUT` | `/courses/:uid` | `course.ts` | Update metadata kursus |
| `PATCH` | `/courses/:uid/status` | `course.ts` | Publish (`ACTIVE` + `is_published=true`) |
| `DELETE` | `/courses/:uid` | `course.ts` | Hapus/nonaktifkan kursus admin |
| `POST` | `/courses/:uid/mentors/assign` | `course.ts` | Assign mentor |
| `POST` | `/courses/:uid/mentors/unassign` | `course.ts` | `CourseMentorTable` |
| `GET` | `/courses/:uid/students` | `course.ts` | Admin detail, roster |
| `GET` | `/courses/:uid/progress` | `course.ts` | `use-course-lesson-reading` |
| `GET` | `/courses/:uid/assignments` | `course-assignments.ts` | Tab Tugas staff (admin) |
| `GET` | `/students/me/assignments` | `student-assignments.ts` | `student/Assignments.tsx` |
| `GET/POST/PUT/DELETE` | `/modules/*`, `/lessons/*` | `module.ts`, `lessons.ts` | Course edit |
| `GET/POST/PUT/DELETE` | `/lessons/:id/assignment` | `lesson-assignment-admin.ts` | Editor + staff |
| `GET/POST/PUT` | `/lessons/:id/assignment/submission` | `lesson-assignment.ts` | Module viewer siswa |
| `GET` | `/lessons/:id/assignment/submissions` | `lesson-assignment-submission.ts` | Roster staff |
| `PUT` | `.../submissions/:uid/grade` | `lesson-assignment-submission.ts` | Penilaian inline |
| `POST` | `/courses/:uid/join` | `course.ts` | Checkout — enrollment sebelum bayar |
| `GET` | `/payment/method` | `payment.ts` | Checkout — daftar metode bayar Tripay |
| `POST` | `/payment` | `payment.ts` | Checkout — buat transaksi Tripay |
| `GET` | `/payment/tripay?reference=&merchant_ref=` | `payment.ts` | Detail pembayaran siswa (Fase 17) |
| CRUD | `/course-categories`, `/course-types` | `course-master.ts` | Admin master data |
| `POST` | `/courses/:uid/review/:id/reply` | `course.ts` | Review reply (perlu verifikasi UI) |
| `GET` | `/admin/dashboard/kpis` | `admin-dashboard.ts` | `admin/Dashboard.tsx` |
| `GET` | `/admin/dashboard/recent-transactions` | `admin-dashboard.ts` | `admin/Dashboard.tsx` |
| `GET` | `/admin/transactions` | `admin-transactions.ts` | `admin/Transactions.tsx` |
| `GET` | `/admin/transactions/summary` | `admin-dashboard.ts`, `admin-transactions.ts` | Dashboard + Transactions |
| `GET` | `/admin/financial/summary` | `admin-dashboard.ts` | `admin/Dashboard.tsx`, `admin/Financial.tsx` |
| `GET` | `/admin/courses/popular` | `admin-dashboard.ts` | `admin/Dashboard.tsx` |
| `GET` | `/mentor/dashboard/kpis` | `mentor-dashboard.ts` | `mentor/Dashboard.tsx` |
| `GET` | `/mentor/dashboard/schedules` | `mentor-dashboard.ts` | `mentor/Dashboard.tsx` |

---

## 3. Matriks API — BE Ada, FE Belum Pakai

Endpoint tersedia di backend (post-merge) tapi **belum** ada di `api-path.ts` dan/atau `services/*.ts`.

| Method | Endpoint | Status FE | Halaman terdampak | Prioritas |
|--------|----------|-----------|---------------------|-----------|
| `GET` | `/admin/reviews` | 🔴 | `ReviewsQA.tsx` | P2 |
| `POST` | `/admin/reviews/:id/reply` | 🔴 | `ReviewsQA.tsx` | P2 |
| `GET` | `/admin/qna` | 🔴 | `ReviewsQA.tsx` | P2 |
| `POST` | `/admin/qna/:id/replies` | 🔴 | `ReviewsQA.tsx` | P2 |
| `POST` | `/courses/:id/qna` | 🔴 | Belum ada UI | P3 |
| `POST` | `/courses/:id/qna/:id/replies` | 🔴 | Belum ada UI | P3 |

---

## 4. Matriks API — Ada di `api-path.ts`, Belum Dipakai Service

Route sudah dideklarasikan tapi **tidak ada** pemanggilan di `services/*.ts`.

| Route constant | Path | Keterangan |
|----------------|------|------------|
| `courses.getMentorByUid` | `GET /courses/:uid/mentor` | — |
| `courses.createReviewByUid` | `POST /courses/:uid/review` | Form review siswa belum wire |
| `mentor.getAll`, `getByUid` | `/mentor/all`, `/mentor/:id` | Landing mentor publik |
| `modules.getByUid` | `GET /modules/:uid` | — |
| `lessons.readings.*` | readings endpoints | — |
| `lessons.assignment.submissions.getByUid` | GET submission by UID | Roster pakai list saja |
| `invoices.*` | invoice URL / by enrollment | Diganti `GET /payment/tripay` (Fase 17); route invoice lama tidak terpakai |
| `files.getByBucketAndObject` | file proxy | — |

**Catatan:** `payment.create`, `payment.method`, dan `payment.tripay` dipakai halaman checkout + detail pembayaran (Fase 17–20). `payment.getAll` punya service tapi tidak dipakai halaman manapun.

---

## 5. Matriks API — FE Mengharapkan, BE Belum / Tidak Lengkap

| Kebutuhan FE | Status BE | Dampak |
|--------------|-----------|--------|
| `GET /admin/dashboard/support-tickets` | 🚫 Sengaja tidak ada | `UnresolvedTickets` selalu kosong |
| Invite / create user admin baru | 🔴 Tidak ada | Hanya promote role user existing |
| Objek `graded_by` lengkap di submission | 🔴 Hanya `graded_by_uid` | Profil penilai terbatas di UI staff |
| Domain sertifikat | 🔴 Tidak ada | `student/Certificates` mock |
| Forgot / reset password | 🔴 Tidak ada / tidak wire | Auth recovery mock |
| `GET /payment` sebagai list transaksi admin | 🟡 Kontrak salah | BE wajib `?reference=`; admin butuh `/admin/transactions` |
| `revenueSource` di financial summary | 🟡 Placeholder BE | Chart sumber penjualan tidak akurat |

---

## 6. Catatan Historis Integrasi

Ringkasan delta dari merge awal — **status FE saat ini** (Juni 2026):

| Item di doc backend-changes | Status doc lama | Status FE sekarang |
|----------------------------|-----------------|-------------------|
| `PUT /courses/:id` | ✅ Service ada | ✅ Live di form edit |
| `DELETE /courses/:id` | 🔴 Belum wire | ✅ Live (`deleteCourse`, `useDeleteCourse`) |
| `PATCH /courses/:id/status` + `is_published` | Hanya set status | ✅ BE + FE selaras (`publish-state.ts`) |
| `POST .../mentors/unassign` | 🔴 Belum wire | ✅ Live |
| `GET /students/me/assignments` | 🔴 Mock | ✅ Live |
| `GET /courses/:id/assignments` | 🔴 Mock mentor | ✅ Live (tab admin); legacy page mock |
| GET submission format array | ✅ Mapper | ✅ Live |
| `GET /user/:uid` detail | — | ✅ Live (halaman detail user) |
| `joined_courses[].assignments` di profil | 🟡 Parsial | 🟡 Dipakai user detail; **tidak** dipakai halaman Assignments lagi |
| Admin dashboard/transactions/financial | 🔴 Mock | ✅ Live (Fase 18) |
| Admin/mentor reviews & Q&A | 🔴 | 🔴 Masih mock |
| Mentor dashboard | 🔴 Mock | ✅ Live (Fase 19) |
| `role=admin` include super_admin | ✅ | ✅ BE fixed |

---

## 7. Prioritas Implementasi Berikutnya

### P0 — Selesai (Juni 2026)

- [x] `PUT /courses/:id` — update metadata
- [x] `POST /courses/:uid/mentors/unassign`
- [x] `GET /students/me/assignments` → `student/Assignments.tsx`
- [x] Tab Tugas admin — bulk assignments + roster + grade
- [x] Parser GET submission multi-attempt
- [x] Halaman detail user admin — `GET /user/:uid`
- [x] `DELETE /courses/:id` — soft delete + dialog konfirmasi admin
- [x] Publish kursus — selaras BE (`status` + `is_published`); label UI **Terbit** / **Draft**; tombol Terbit disembunyikan setelah publish
- [x] Detail pembayaran siswa — `GET /payment/tripay`; halaman `TransactionPayment.tsx` + refactor `TransactionsSection`
- [x] Admin dashboard — KPI, chart revenue, transaksi terbaru, kursus populer (Fase 18)
- [x] Admin transactions & financial — list, summary, filter, chart (Fase 18)
- [x] Mentor dashboard — KPI + jadwal kelas (Fase 19)
- [x] Checkout join kursus — route `/checkout/:courseUid`, `joinCourse` + `createPayment` → detail Tripay (Fase 20)
- [x] Katalog enrollment-aware + login redirect kembali ke checkout (Fase 21)
- [x] Detail pembayaran: polling pending, Suspense skeleton, redesign modular, status animation (Fase 21)

### P1 — Gap utama

- [ ] Samakan `mentor/Courses.tsx` & `mentor/DetailCourse.tsx` dengan pola admin API
- [ ] Deprecate atau rewire `mentor/CourseAssignments.tsx`

### P2 — Admin moderasi (BE sudah ada)

- [ ] Aktifkan route `ReviewsQA` + wire reviews/Q&A moderasi

### P3 — Enhancement

- [ ] Q&A per course (student-facing)
- [ ] UI riwayat multi-attempt penuh di module viewer
- [ ] Wire `GET .../submissions/:submissionUid` untuk refresh detail

### P4 — Ditunda (kehadiran)

Fitur **kehadiran / attendance** sengaja **dikeluarkan dari tracking progress** — menunggu keputusan selanjutnya. Kode partial (tab admin, validator, service) tetap ada di repo.

---

## 8. Sinkronisasi Dokumen

Saat menutup item di dokumen ini, perbarui juga:

| Dokumen | Path |
|---------|------|
| Progress README | [README.md](./README.md) |
| Panduan revisi | [revision-guide.md](./revision-guide.md) |
| Peta file | [files-to-revise.md](./files-to-revise.md) |
| QA status board | [../qa/qa-status-board.md](../qa/qa-status-board.md) |

---

*Scan statis codebase — verifikasi runtime butuh BE lokal dengan `SEED=true`.*
