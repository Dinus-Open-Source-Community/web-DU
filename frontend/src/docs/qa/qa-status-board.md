# QA Status Board

Papan status bug dan enhancement — **living document**.  
Update kolom **Status** dan **Owner** setiap ada progress.

**Terakhir diperbarui:** 17 Juni 2026 (sesi 3) · **Branch:** `features/frontend-sapto`

---

## Legenda Status

| Status | Arti |
|--------|------|
| 🔴 Open | Belum dikerjakan |
| 🟡 In Progress | Sedang dikerjakan |
| 🟢 Fixed | FE/BE selesai — **tunggu retest QA** |
| ✅ Verified | QA konfirmasi di environment |
| 🚫 Won't fix | Ditunda / out of scope |
| ⏳ Blocked BE | Menunggu endpoint/kontrak BE |

---

## P0 — Blocker

| ID | Temuan | Role | Owner | Status | File / Area | Detail |
|----|--------|------|-------|--------|-------------|--------|
| QA-C-01 | Gambar course tidak load (401) | Admin, Mentor, Student | FE | 🟢 Fixed | `hooks/files/*`, `CourseCardCover`, `UserAvatarImage` | Resolve via service+hooks; fallback UI di card |
| QA-C-07 | Download invoice gagal (401) | Student | FE | 🟢 Fixed | `use-invoice-download.ts`, `lib/files/download-protected-file.ts` | Axios blob download + trigger file save |

---

## P1 — Course & Integrasi

| ID | Temuan | Role | Owner | Status | File / Area | Detail |
|----|--------|------|-------|--------|-------------|--------|
| QA-C-02 | Kursus baru sudah punya rating | Admin | FE | 🟢 Fixed | `CourseDetailInfoCard`, `course-rating.ts` | Hapus fallback 4.8; tampil hanya jika ada review |
| QA-C-03 | Modul duplikat saat dibuat | Admin | FE | 🟢 Fixed | `use-course-edit-controller.ts` | Dedup modul by `uid` saat init state |
| QA-C-04 | Hanya satu mentor ditampilkan | Admin | FE | 🟢 Fixed | `CourseCardProfiles`, `course-profile.ts` | Multi-mentor di card & detail publik |
| QA-C-08 | Reply review tidak tersimpan | Admin | FE | 🟢 Fixed | `useReplyCourseReview`, `CourseReviewSection` | Ter-wire ke API + invalidate cache |
| QA-M-01 | Sidebar tidak aktif di kelola kursus | Mentor | FE | 🟢 Fixed | `Sidebar.tsx` | Prefix match pada `SidebarNavItem` |
| QA-M-02 | Legacy assignments masih mock | Mentor | FE | 🟢 Fixed | `mentor/CourseAssignments.tsx` | Redirect ke `?tab=assignments` |

---

## P1 — Student & Payment

| ID | Temuan | Role | Owner | Status | File / Area | Detail |
|----|--------|------|-------|--------|-------------|--------|
| QA-C-05 | Label "Enroll" → "Daftar" | Student | FE | 🟢 Fixed | `CardCourse.tsx` | Tombol aksi non-enrolled = "Daftar" |
| QA-C-06 | Card terlalu rapat dengan navbar | Student | FE | 🟢 Fixed | `BrowseCourseSection.tsx` | Tambah `pt-4` pada section utama |
| QA-C-11 | Sidebar module tidak scroll | Student | FE | 🟢 Fixed | `LessonSidebar.tsx` | `flex flex-col overflow-hidden` pada aside & sheet |

---

## Retest — Kemungkinan Sudah Fixed

| ID | Temuan | Role | Owner | Status | Catatan |
|----|--------|------|-------|--------|---------|
| QA-C-09 | Riwayat transaksi tanpa pending | Student | FE | 🟢 Fixed | Normalisasi status `pending`/`unpaid` di `filter-transactions.ts` — **perlu retest QA** |
| QA-C-10 | Halaman tugas student kosong | Student | FE | 🟢 Fixed | `GET /students/me/assignments` live — **perlu retest QA** |
| QA-C-12 | Redirect setelah pembayaran salah | Student | FE/BE | 🟢 Fixed | Checkout Fase 20–21 — **perlu retest QA** |
| QA-C-13 | Logo React di halaman pembayaran | Student | FE | 🟢 Fixed | Fallback cover diganti — **perlu retest QA** |

---

## P2 — Admin UX

| ID | Temuan | Role | Owner | Status | File / Area | Detail |
|----|--------|------|-------|--------|-------------|--------|
| QA-CAT-01 | Tombol tambah di dalam tabel kategori | Admin | FE | 🟢 Fixed | `CourseMasterManagementPanel.tsx` | Action bar di luar `AdminDataTable` |
| QA-TYPE-01 | Tombol tambah di dalam tabel tipe | Admin | FE | 🟢 Fixed | `CourseMasterManagementPanel.tsx` | Sama — shared panel kategori & tipe |
| QA-ADM-01 | Reviews & Q&A moderasi mock | Admin | FE | 🟢 Fixed | `ReviewsQA.tsx`, `services/admin-moderation.ts` | Live API + route `/admin/reviews-and-qa` aktif |
| QA-ADM-02 | Ganti password tanpa `old_password` | Student | FE | 🟢 Fixed | `profile/Section.tsx`, `use-profile-section-view.ts` | Field "Password Saat Ini" + validasi schema |

---

## P3 — Enhancement (Bukan Bug)

| ID | Permintaan | Role | Owner | Status | Detail |
|----|------------|------|-------|--------|--------|
| REQ-01 | URL tab tersimpan (`nuqs`) | Semua | FE | 🟢 Fixed | Adapter `lib/nuqs-react-router.ts` + `useCourseDetailTab` |
| REQ-02 | Share link langsung ke tab tugas | Admin, Mentor | FE | 🟢 Fixed | `?tab=assignments` di detail kursus + redirect mentor |
| REQ-03 | Landing home data live | Guest | FE | 🟢 Fixed | `useFeaturedCourses` + `useLandingCommunityStats` di `Home.tsx` |

---

## Statistik

| Prioritas | Total | Open | Fixed | Verified |
|-----------|-------|------|-------|----------|
| P0 | 2 | 0 | 2 | 0 |
| P1 | 9 | 0 | 9 | 0 |
| Retest | 4 | 0 | 4 | 0 |
| P2 | 4 | 0 | 4 | 0 |
| P3 | 3 | 0 | 3 | 0 |

**Total item:** 22 · **Open:** 0 · **Fixed (tunggu retest):** 22 · **Verified:** 0

---

## Riwayat Update

| Tanggal | Perubahan |
|---------|-----------|
| 17 Jun 2026 | Board awal dibuat; QA-C-09/10/12/13 ditandai Fixed menunggu retest |
| 17 Jun 2026 | Sesi 2: QA-C-01/02/03/04/05/06/07/08/11, QA-M-01/02, QA-CAT-01, QA-TYPE-01 → 🟢 Fixed |
| 17 Jun 2026 | Sesi 3: QA-ADM-01/02, REQ-01/02/03, QA-C-09 filter pending → 🟢 Fixed; build ✅ |

---

## Cara Update Board

1. QA menemukan bug → tambah baris dengan ID baru (`QA-C-XX`)
2. FE mulai kerja → status `🟡 In Progress`, isi **Owner**
3. FE selesai PR → status `🟢 Fixed`
4. QA retest OK → status `✅ Verified`
5. Sinkronkan [files-to-revise.md](../progress/files-to-revise.md)

---

## Referensi Cepat Developer

| Butuh | Dokumen |
|-------|---------|
| File mana yang diubah | [files-to-revise.md](../progress/files-to-revise.md) |
| Prioritas & arsitektur fix gambar | [revision-guide.md](../progress/revision-guide.md) |
| Skenario uji regression | [qa-checklist.md](../progress/qa-checklist.md) |
