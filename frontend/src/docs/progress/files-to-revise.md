# Peta File — Apa yang Perlu Diubah

Living document: **file → task → prioritas → status**.  
Diperbarui setiap ada progress revisi.

**Branch:** `features/frontend-sapto` · **Terakhir diperbarui:** 17 Juni 2026 (sesi 3)

**Cara pakai:**

1. Filter kolom **Prioritas** (`P0` dulu).
2. Baca detail bug di kolom **QA Ref**.
3. Setelah selesai, ubah **Status** ke `✅` dan nama di **Owner**.

---

## Legenda

| Prioritas | Arti |
|-----------|------|
| P0 | Blocker QA / produksi — kerjakan dulu |
| P1 | Gap fitur utama |
| P2 | Fitur sekunder / moderasi |
| P3 | Enhancement / polish |

| Status | Arti |
|--------|------|
| 🔴 Open | Belum dikerjakan |
| 🟡 In Progress | Sedang dikerjakan |
| 🟢 Fixed | Selesai, tunggu retest QA |
| ✅ Verified | QA sudah konfirmasi |
| 🚫 Won't fix | Ditunda / out of scope |

---

## P0 — Gambar Terproteksi (401)

Backend: `GET /files/{bucket}/{object}` · `POST /files/{bucket}/batch`

| Task ID | File | Perubahan yang dibutuhkan | QA Ref | Owner | Status |
|---------|------|---------------------------|--------|-------|--------|
| IMG-01 | `services/file-proxy.ts` **(baru)** | Service GET blob + POST batch → data URL | QA-C-01 | FE | 🟢 Fixed |
| IMG-02 | `services/api-path.ts` | Pastikan `files.batchByBucket(bucket)` ada | QA-C-01 | FE | 🟢 Fixed |
| IMG-03 | `lib/files/*` **(baru)** | Parser URL `/files/...`, kumpulkan referensi, apply ke objek API | QA-C-01 | FE | 🟢 Fixed |
| IMG-04 | `hooks/files/use-protected-file.ts` **(baru)** | Hook single GET untuk 1 gambar | QA-C-01 | FE | 🟢 Fixed |
| IMG-05 | `hooks/files/use-protected-file-map.ts` **(baru)** | Hook batch per bucket | QA-C-01 | FE | 🟢 Fixed |
| IMG-06 | `hooks/use-course.ts` | Resolve `cover_url`, `thumbnail_url`, avatar setelah fetch | QA-C-01 | FE | 🟢 Fixed |
| IMG-07 | `providers/auth-provider.tsx` | Resolve gambar profil + joined courses (batch) | QA-C-01 | FE | 🟢 Fixed |
| IMG-08 | `services/auth.ts` | Pertimbangkan pindah resolve avatar ke hook (hindari blob leak) | QA-C-01 | FE | 🟢 Fixed |
| IMG-09 | `components/shared/AuthenticatedImage.tsx` **(baru)** | Komponen `<img>` dengan fetch terautentikasi | QA-C-01 | FE | 🟢 Fixed |
| IMG-10 | `components/shared/AuthenticatedAvatar.tsx` **(baru)** | Wrapper Avatar + AuthenticatedImage | QA-C-01 | FE | 🟢 Fixed |
| IMG-11 | `components/shared/CardCourse.tsx` | Ganti `<img>` → `AuthenticatedImage` | QA-C-01 | FE | 🟢 Fixed |
| IMG-12 | `components/shared/CardMentor.tsx` | Ganti cover/thumbnail | QA-C-01 | FE | 🟢 Fixed |
| IMG-13 | `components/shared/JoinedCourseCard.tsx` | Ganti cover | QA-C-01 | FE | 🟢 Fixed |
| IMG-14 | `components/shared/CourseReviewSection.tsx` | Avatar reviewer & reply | QA-C-01 | FE | 🟢 Fixed |
| IMG-15 | `components/shared/CourseMentorTable.tsx` | Avatar mentor | QA-C-01 | FE | 🟢 Fixed |
| IMG-16 | `components/shared/CourseParticipation.tsx` | `student_avatar_url` | QA-C-01 | FE | 🟢 Fixed |
| IMG-17 | `components/shared/Navbar.tsx` | Avatar session user | QA-C-01 | FE | 🟢 Fixed |
| IMG-18 | `components/shared/AppTopNavbar.tsx` | Avatar sidebar layout | QA-C-01 | FE | 🟢 Fixed |
| IMG-19 | `components/ui/profile.tsx` | Avatar di komponen Profile | QA-C-01 | FE | 🟢 Fixed |
| IMG-20 | `components/profile/Section.tsx` | Avatar halaman profil | QA-C-01 | FE | 🟢 Fixed |
| IMG-21 | `components/courses/detail/*` | Cover & instructor di detail publik | QA-C-01 | FE | 🟢 Fixed |
| IMG-22 | `components/student/TransactionsSection.tsx` | Cover kursus di transaksi | QA-C-01 | FE | 🟢 Fixed |
| IMG-23 | `hooks/use-managed-users.ts` | Resolve avatar list user admin | QA-C-01 | FE | 🟢 Fixed |
| IMG-24 | `components/admin/user-manage/*` | Avatar tabel & detail user | QA-C-01 | FE | 🟢 Fixed |
| IMG-25 | `components/shared/course-detail-manage/*` | Avatar roster & grader | QA-C-01 | FE | 🟢 Fixed |
| IMG-26 | Invoice download | Fetch blob + download, bukan `window.open` | QA-C-07 | FE | 🟢 Fixed |

---

## P1 — Fitur & Integrasi

| Task ID | File | Perubahan yang dibutuhkan | QA Ref | Owner | Status |
|---------|------|---------------------------|--------|-------|--------|
| FE-01 | `pages/mentor/CourseAssignments.tsx` | Hapus mock / redirect ke tab Tugas detail | — | FE | 🟢 Fixed |
| FE-02 | `components/shared/CourseReviewSection.tsx` | Wire `replyToCourseReview` ke API | B8 | FE | 🟢 Fixed |
| FE-03 | `components/shared/ManageCourse.tsx` | Tombol hapus kursus di kartu (opsional) | — | FE | 🔴 Open |
| FE-04 | `pages/admin/ReviewsQA.tsx` | Ganti mock → API admin reviews/Q&A | — | FE | 🟢 Fixed |
| FE-05 | `App.tsx` | Aktifkan route `/admin/reviews-and-qa` | — | FE | 🟢 Fixed |
| FE-06 | `components/shared/CardCourse.tsx` | Label "Enroll" → "Daftar" | QA-C-05 | FE | 🟢 Fixed |
| FE-07 | `hooks/course-detail/use-course-detail-tab.ts` | Sync tab ke URL (`?tab=`) | REQ-01 | FE | 🟢 Fixed |

---

## P2 — UX & Data Partial

| Task ID | File | Perubahan yang dibutuhkan | QA Ref | Owner | Status |
|---------|------|---------------------------|--------|-------|--------|
| UX-01 | `components/admin/CourseCategories.tsx` | Tombol "Tambah" keluar dari tabel | QA-CAT-01 | FE | 🟢 Fixed |
| UX-02 | `components/admin/CourseTypes.tsx` | Tombol "Tambah" keluar dari tabel | QA-TYPE-01 | FE | 🟢 Fixed |
| UX-03 | `pages/mentor/Courses.tsx` / `Sidebar` | Highlight menu aktif di kelola kursus | QA-M-01 | FE | 🟢 Fixed |
| UX-04 | `components/shared/DetailCourseComponents.tsx` | Rating kursus baru harus 0 / tidak ada | QA-C-02 | FE/BE | 🟢 Fixed |
| UX-05 | `hooks/use-course-edit-data.ts` | Dedup modul duplikat dari API | QA-C-03 | FE | 🟢 Fixed |
| UX-06 | `components/shared/CardCourse.tsx` / mentor list | Tampilkan semua mentor, bukan satu | QA-C-04 | FE | 🟢 Fixed |
| UX-07 | `pages/profile/Profile.tsx` | Form ganti password + `old_password` | B23 | FE | 🟢 Fixed |
| UX-08 | `lib/course-detail/staff-submission-mapper.ts` | Map `graded_by` object dari BE | A12 | FE | 🟡 Partial |

---

## P3 — Polish & Enhancement

| Task ID | File | Perubahan yang dibutuhkan | QA Ref | Owner | Status |
|---------|------|---------------------------|--------|-------|--------|
| POL-01 | `pages/landing/Home.tsx` | Wire data kursus/mentor dari API | — | FE | 🟢 Fixed |
| POL-02 | `pages/landing/Course.tsx` | Verifikasi filter kategori | — | FE | 🟡 Partial |
| POL-03 | `student/Certificates.tsx` | Tunggu API sertifikat BE | B22 | BE | 🚫 Won't fix |
| POL-04 | `pages/auth/ForgotPass.tsx` | Tunggu API reset password | B21 | BE | 🚫 Won't fix |
| POL-05 | `lib/nuqs-react-router.ts` **(baru)** | Adapter nuqs untuk React Router | REQ-01 | FE | 🟢 Fixed |
| POL-06 | `lib/transactions/filter-transactions.ts` | Normalisasi status pending/unpaid | QA-C-09 | FE | 🟢 Fixed |
| POL-07 | `hooks/landing/use-landing-community-stats.ts` **(baru)** | Stat komunitas landing dari API | REQ-03 | FE | 🟢 Fixed |
| POL-08 | `components/home/Community.tsx` | Terima props stats live | REQ-03 | FE | 🟢 Fixed |
| POL-09 | `lib/admin-moderation/*`, `services/admin-moderation.ts` | Layer moderasi admin reviews/Q&A | QA-ADM-01 | FE | 🟢 Fixed |

---

## File yang Sudah Benar (Jangan Rusak)

| Area | File kunci | Status |
|------|------------|--------|
| Checkout | `hooks/use-checkout.ts`, `pages/checkout/Checkout.tsx` | ✅ Live |
| Payment detail | `pages/student/TransactionPayment.tsx` | ✅ Live |
| Student assignments | `hooks/student-assignments/*`, `student/Assignments.tsx` | ✅ Live |
| Admin dashboard | `hooks/use-admin-dashboard.ts`, `admin/Dashboard.tsx` | ✅ Live |
| Mentor dashboard | `hooks/use-mentor-dashboard.ts` | ✅ Live |
| Mentor courses | `hooks/mentor-courses/use-mentor-courses.ts` | ✅ Live |
| Course edit | `hooks/use-course-edit-data.ts`, `CourseEdit.tsx` | ✅ Live |
| User manage | `hooks/use-managed-users.ts`, `services/user-manage.ts` | ✅ Live (kecuali gambar) |

---

## Checklist Sebelum PR

- [x] `npm run build` sukses
- [ ] Tidak ada secret di commit (`.env`, token)
- [x] Status di [qa-status-board.md](../qa/qa-status-board.md) diperbarui
- [x] Baris task di tabel ini diubah ke `🟢 Fixed` atau `✅ Verified`

---

## Sinkronisasi

Saat menutup task, perbarui juga:

| Dokumen | Path |
|---------|------|
| Panduan revisi | [revision-guide.md](./revision-guide.md) |
| TODO backlog | [todo-backlog.md](./todo-backlog.md) |
| Integration status | [integration-status.md](./integration-status.md) |
| QA status board | [../qa/qa-status-board.md](../qa/qa-status-board.md) |
