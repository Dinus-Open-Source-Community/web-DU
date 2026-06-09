# TODO & Backlog — FE vs BE

Dokumen **living backlog** untuk PM, FE, dan QA.  
**Aturan:** item requirement lama **tidak dihapus** — hanya diubah statusnya.

**Terakhir diperbarui:** 9 Juni 2026 (BE: `graded_by` submission + verifikasi D12) · branch `features/frontend-sapto`  
**Status lengkap:** [integration-status.md](./integration-status.md)

---

## Legenda Status

| Status | Arti |
|--------|------|
| ✅ Selesai | Sudah diimplementasikan & bisa diuji di FE |
| 🟡 Partial | Sebagian jalan; ada gap UX, data, atau endpoint |
| 🔴 Belum | Belum diimplementasikan / masih mock |
| ⏳ Tunggu BE | FE siap atau hampir siap; blocker di backend |
| 🚫 Out of scope | Sengaja ditunda di luar sesi ini |

---

## A. Requirement Sesi Tab Tugas & Penilaian (Staff)

Requirement dari sesi implementasi tab **Tugas** di detail kursus admin/mentor.

| # | Requirement | Status | Catatan |
|---|-------------|--------|---------|
| A1 | Tab **Tugas** di detail course admin/mentor | ✅ Selesai | `CourseDetailAssignmentsTab` |
| A2 | Daftar tugas per lesson (overview + filter kuis/teks) | ✅ Selesai | `CourseAssignmentOverviewRow` |
| A3 | Avatar semua peserta terdaftar di konteks tugas | ✅ Selesai | `AssignmentSubmitterAvatarGroup` |
| A4 | Roster pengumpulan **tabel saja** (tanpa variant card/KPI) | ✅ Selesai | `CourseAssignmentRosterTable` |
| A5 | Navigasi: tab tugas → daftar pengumpulan → detail jawaban siswa | ✅ Selesai | Routes admin & mentor |
| A6 | Halaman detail submission: **navbar saja** (tanpa sidebar utama) | ✅ Selesai | `CourseAssignmentSubmissionDetailView` |
| A7 | Layout detail: kiri konten jawaban + kanan daftar siswa | ✅ Selesai | Sidebar siswa + main panel |
| A8 | Penilaian **inline** di halaman (bukan modal) | ✅ Selesai | `StaffSubmissionInlineGradePanel` |
| A9 | Feedback **bukan modal**; style mirip reply review | ✅ Selesai | `StaffSubmissionFeedbackSection` |
| A10 | Feedback **timpa** (1 field `feedback` — selaras BE) | ✅ Selesai | PUT grade kirim `feedback` |
| A11 | UI flat — tanpa card-dalam-card / container bertumpuk | ✅ Selesai | Token `manage-detail-layout` |
| A12 | Tampilkan profil pemberi feedback lengkap | 🟡 Partial | BE kirim `graded_by` object; FE perlu mapper di `staff-submission-mapper.ts` |
| A13 | Validator Zod strict untuk request tugas/kehadiran | ✅ Selesai | `lib/validator/lesson-assignment/`, `lesson-attendance/` |
| A14 | Jangan ubah backend untuk fitur profil penilai | ✅ Selesai | Relasi `GradedBy` di-revert; FE menyesuaikan |

---

## B. Requirement Sesi Sebelumnya (Jangan Dihapus)

Item dari sesi integrasi awal & course editor — tetap dilacak.

| # | Requirement | Status | Catatan |
|---|-------------|--------|---------|
| B1 | Manajemen user admin (siswa/mentor/administrator) | ✅ Selesai | Fase 1 |
| B2 | CRUD kategori & tipe kursus | ✅ Selesai | Fase 5–7 |
| B3 | Katalog & detail kursus admin | ✅ Selesai | Partial di B6, B7 |
| B4 | Assign mentor ke kursus | ✅ Selesai | Fase 2 |
| B5 | Editor kurikulum module/lesson | ✅ Selesai | Fase 10 |
| B6 | **Update metadata kursus** (`PUT /courses/:id`) | ✅ Selesai | Fase 13 — `updateCourse` live |
| B7 | **Lepas mentor** dari kursus | ✅ Selesai | Fase 13 — `unassignMentorsFromCourse` live |
| B8 | **Reply review** tersimpan ke API | 🔴 Belum | Handler masih `console.log` |
| B9 | Validator payload domain lama (user, course, lesson) | ✅ Selesai | Fase 7 |
| B10 | Dokumentasi gap FE↔BE | ✅ Selesai | `docs/*.md` |
| B11 | Sidebar layout fix breakpoint `lg` | ✅ Selesai | Fase 3 |
| B12 | Panel tugas di **course editor** (CRUD assignment per lesson) | ✅ Selesai | `course-editor-ux-session.md` |
| B13 | Student module viewer — kerja tugas & submit | ✅ Selesai | `use-lesson-assignment`, `LessonAssignmentWork` |
| B14 | Mark lesson as read (siswa) | ✅ Selesai | `use-course-lesson-reading` |
| B15 | Tab **Kehadiran** di detail course (admin) | 🟡 Partial | Lihat C4 |
| B16 | Mentor detail course pakai API live | 🔴 Belum | Masih mock — backlog Fase 1.4 |
| B17 | Mentor list courses pakai API live | 🔴 Belum | Masih mock — backlog Fase 1.5 |
| B18 | Halaman `student/Assignments` aggregate lintas kursus | ✅ Selesai | Fase 13 — `GET /students/me/assignments` |
| B19 | Halaman `mentor/.../assignments` (route terpisah) | 🔴 Belum | Masih mock; tab Tugas di detail course sudah live |
| B26 | **Halaman detail user admin** (`GET /user/:uid`) | ✅ Selesai | Fase 14 — `UserDetailView` + progress bar |
| B27 | **Publish kursus** selaras BE (`PATCH /courses/:id/status`) | ✅ Selesai | Fase 16 — `isCoursePublished()`, label Terbit/Draft |
| B28 | **Hapus / nonaktifkan kursus** (`DELETE /courses/:id`) | ✅ Selesai | Fase 16 — dialog + redirect daftar kursus |
| B29 | Tombol **Terbit** disembunyikan setelah kursus publish | ✅ Selesai | Fase 16 — header, mobile, editor kurikulum |
| B20 | Admin dashboard / transactions / financial | 🔴 Belum | Masih mock |
| B21 | Forgot / reset password | 🔴 Belum | Tidak ada endpoint BE |
| B22 | Sertifikat siswa | 🔴 Belum | Tidak ada domain BE |
| B23 | Ganti password kirim `old_password` | 🔴 Belum | `profile` partial |
| B24 | Tab peserta — bar kehadiran akurat | ⏳ Tunggu BE | `attendance_*` tidak ada di `GET /courses/:id/students` |
| B25 | Halaman administrator tampilkan `super_admin` | ✅ Selesai | BE fix: `role=admin` include `super_admin` |

---

## C. Endpoint BE Sudah Ada — FE Belum / Partial

Prioritas untuk tim FE. Endpoint diverifikasi dari `backend/internal/handler/routes/`.

| # | Method | Endpoint BE | Status FE | Halaman / Catatan | Prioritas |
|---|--------|-------------|-----------|-------------------|-----------|
| C1 | `GET` | `/lessons/:id/assignment/submissions/:submissionUid` | 🔴 Belum | Staff detail saat ini ambil dari list, bukan GET by UID | Rendah |
| C2 | `POST` | `/lessons/attendances` | 🔴 Belum | Check-in siswa; tidak ada service/UI | Tinggi |
| C3 | `GET` | `/lessons/attendances/check-status` | 🔴 Belum | Siswa cek sudah absen | Tinggi |
| C4 | `GET` | `/lessons/attendances/lesson/:lesson_id` | 🟡 Partial | Tab Kehadiran admin: list + update + delete ✅; **create manual admin** ❌ | Sedang |
| C5 | `PUT` | `/lessons/attendances/:id` | 🟡 Partial | Update status ✅; field **note** belum ada di UI | Sedang |
| C6 | `DELETE` | `/lessons/attendances/:id` | ✅ Selesai | Tab Kehadiran admin | — |
| C7 | `GET` | `/lessons/attendances/my-history` | 🔴 Belum | Riwayat absensi siswa | Sedang |
| C8 | `GET` | `/lessons/attendances/:id` | 🔴 Belum | Detail satu record absensi | Rendah |
| C9 | `GET` | `/lessons/readings/lesson/:lesson_id` | 🔴 Belum | Admin/mentor lihat siapa sudah baca lesson | Sedang |
| C10 | `GET` | `/lessons/readings/my-history` | 🔴 Belum | Service ada, route BE bermasalah (komentar di FE) | Rendah |
| C11 | `GET` | `/courses/:uid/progress` | ✅ Selesai | `use-course-lesson-reading.ts` | — |
| C12 | `GET` | `/courses/:uid/mentor` | 🔴 Belum | List mentor kursus (terpisah dari detail) | Rendah |
| C13 | `POST` | `/courses/:uid/review/:id/reply` | 🔴 Belum | Endpoint ada; FE belum wire | Tinggi |
| C14 | `GET` | `/user/:uid` | ✅ Selesai | Halaman detail user admin (Fase 14) | — |
| C15 | `GET` | `/invoices/:enrollmentUid` | 🔴 Belum | Invoice enrollment | Rendah |
| C16 | `GET` | `/mentor/all`, `/mentor/:id` | 🔴 Belum | Landing mentor publik | Rendah |
| C17 | `POST` | `/lessons/:id/assignment/submission` (siswa) | ✅ Selesai | Module viewer assignment work | — |
| C18 | `PUT` | `/lessons/:id/assignment/submissions/:uid/grade` | ✅ Selesai | Detail submission staff | — |
| C19 | `GET` | `/lessons/:id/assignment/submissions` | ✅ Selesai | Roster & tab tugas | — |
| C20 | `POST/PUT` | `/lessons/:id/assignment` | ✅ Selesai | Course editor + validator | — |

---

## D. Endpoint / Fitur BE Belum Ada — FE Menunggu

| # | Kebutuhan | Dampak FE | Status | Ref |
|---|-----------|-----------|--------|-----|
| D1 | `PUT /courses/:id` update metadata | Edit kursus gagal | ✅ Selesai | Fase 13 |
| D2 | `POST /courses/:id/mentors/unassign` | Tombol Lepas mentor | ✅ Selesai | Fase 13 |
| D3 | `GET /courses/:courseUid/assignments` aggregate | `mentor/CourseAssignments` mock | 🟡 Partial | Service live; legacy page masih mock |
| D4 | `GET /students/me/assignments` aggregate | `student/Assignments` mock | ✅ Selesai | Fase 13 |
| D5 | `GET /admin/transactions` + summary | Admin transactions mock | ⏳ Tunggu FE | BE ada; service admin belum |
| D6 | `GET /admin/financial/summary` | Admin financial mock | ⏳ Tunggu FE | BE ada; service admin belum |
| D7 | `GET /admin/dashboard/kpis` | Admin dashboard mock | ⏳ Tunggu FE | BE ada; service admin belum |
| D8 | `attendance_*` di `GET /courses/:id/students` | Bar kehadiran tab Peserta salah | 🟡 Partial | BE kirim field; FE belum mapper |
| D9 | Profil user penilai (`graded_by` object) di response submission | Profil feedback staff selalu lengkap | 🟡 Partial | BE kirim `graded_by` di list/get/grade submission; FE perlu wire mapper |
| D10 | Forgot / reset password | Auth recovery mock | ⏳ Tunggu BE | `api-route-gaps.md` §9 |
| D11 | Domain sertifikat | `student/Certificates` mock | ⏳ Tunggu BE | `api-route-gaps.md` §10 |
| D12 | Domain Q&A / moderation lintas kursus | `admin/ReviewsQA` unregistered | ⏳ Tunggu FE | BE ada: `GET/POST /admin/reviews`, `GET/POST /admin/qna`, `POST /courses/:id/qna` |
| D13 | `GET /courses?category_uid=` filter | Filter kategori browse tidak akurat | 🟡 Partial | Param dikirim; verifikasi hasil filter |
| D14 | `DELETE /courses/:id` | Tidak ada hapus kursus di UI | ✅ Selesai | Fase 16 — `deleteCourse`, `useDeleteCourse`, dialog admin |
| D15 | Admin reviews & Q&A moderasi | `ReviewsQA` mock | ⏳ Tunggu FE | BE ada; route dikomentari |
| D16 | Mentor dashboard KPI + jadwal | `mentor/Dashboard` mock | ⏳ Tunggu FE | BE ada; service belum |
| D17 | Q&A per course (student) | Tidak ada UI | ⏳ Tunggu FE | BE ada; belum di api-path |

---

## E. TODO FE Berikutnya (Rekomendasi Urutan)

Urutan kerja setelah sesi tab Tugas — **tanpa menghapus item lama**.

### Prioritas 1 — Quick wins (endpoint BE sudah ada)

- [ ] **E1** Wire `handleReplyReview` → `POST /courses/:uid/review/:id/reply` (B8, C13)
- [ ] **E2** Form ganti password: kirim `old_password` di `PATCH /user/changePassword` (B23)
- [ ] **E3** Tab Kehadiran: input **note** saat update status (C5)
- [ ] **E4** Service + UI check-in siswa: `POST /lessons/attendances` (C2, C3)
- [ ] **E5** Samakan `mentor/DetailCourse` dengan pola admin API (B16)

### Prioritas 2 — Setelah BE menyediakan endpoint

- [x] **E6** Wire edit metadata kursus setelah `PUT /courses/:id` (B6, D1)
- [x] **E7** Wire unassign mentor setelah endpoint unassign (B7, D2)
- [ ] **E8** Tab Peserta: mapper `attendance_present/total` di students API (B24, D8)
- [x] **E9** `student/Assignments` setelah aggregate API (B18, D4)
- [ ] **E10** Refactor `mentor/CourseAssignments` atau deprecate ke tab detail course (B19, D3)
- [x] **E21** `DELETE /courses/:id` — route, service, dialog hapus (D14, B28)
- [ ] **E22** Halaman detail user — QA skenario lengkap (B26)

### Prioritas 3 — Enhancement tanpa blocker BE besar

- [ ] **E11** Tab Kehadiran untuk **mentor** (saat ini `adminOnly`) (B15)
- [ ] **E12** Admin manual create attendance untuk siswa yang belum check-in (C4)
- [ ] **E13** Tampilkan detail file submission di halaman staff (download/preview)
- [ ] **E14** GET submission by UID untuk refresh detail tanpa reload list (C1)
- [ ] **E15** Halaman riwayat baca lesson untuk admin (`GET /lessons/readings/lesson/:id`) (C9)
- [ ] **E16** QA checklist sesi tugas — jalankan skenario di `qa-checklist.md` §I

### Prioritas 4 — Epic terpisah

- [ ] **E17** Admin transactions & financial (B20, D5, D6)
- [ ] **E18** Forgot/reset password (B21, D10)
- [ ] **E19** Sertifikat (B22, D11)
- [ ] **E20** Reviews & Q&A moderation page (D12)

---

## F. Known Issues / Debt Teknis

| # | Issue | Status | Tindakan |
|---|-------|--------|----------|
| F1 | `mentor/CourseAssignments.tsx` masih mock penuh | 🔴 | Redirect ke detail course tab Tugas atau rewire API |
| F2 | `student/Assignments.tsx` masih mock | ✅ | Selesai — `useStudentMyAssignments` |
| F3 | Profil penilai fallback "Penilai" tanpa avatar | 🟡 Partial | BE kirim `graded_by`; FE belum map ke `presentSubmissionGrader` |
| F4 | Filter `super_admin` di halaman administrator | ✅ | BE fix merge J-yriz (B25) |
| F5 | `GET /lessons/readings/my-history` — komentar broken di BE | 🔴 | Verifikasi dengan tim BE |
| F6 | Perubahan branch belum di-commit | 🟡 | Menunggu permintaan developer |

---

## G. Sinkronisasi Dokumen Terkait

Saat menutup item di dokumen ini, update juga:

| Dokumen | Path |
|---------|------|
| **Integration status** | `progress/integration-status.md` |
| Progress README | `progress/README.md` |
| Implementation log | `progress/implementation-log.md` |
| Backend changes | `../backend-changes-j-yriz-merge.md` |
| QA checklist | `progress/qa-checklist.md` |
| Page coverage | `../page-coverage.md` |
| API route gaps | `../api-route-gaps.md` |
| Admin Transaksi & Financial spec | `progress/admin-financial-transactions-spec.md` |
| Priority backlog | `../priority-backlog.md` |
