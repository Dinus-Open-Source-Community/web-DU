# Panduan Revisi — Frontend Web DU

Dokumen **utama untuk developer** (FE junior, FE senior, BE) yang menjelaskan:

- progress apa yang sudah selesai vs perlu direvisi
- file mana yang harus diubah
- prioritas kerja dan dependensi FE↔BE

**Branch:** `features/frontend-sapto`  
**Terakhir diperbarui:** 17 Juni 2026

---

## Mulai dari Mana? (Panduan per Peran)

| Peran | Baca dulu | Lalu kerjakan |
|-------|-----------|---------------|
| **FE Junior** | [Prioritas P0](#prioritas-p0--wajib-dulu) → [Peta file cepat](./files-to-revise.md) | Ambil 1 baris task, baca detail di `../qa/`, implement, update status board |
| **FE Senior** | [Status integrasi](./integration-status.md) §7 → [Arsitektur](./architecture.md) | Review arsitektur fix (mis. file proxy), pecah PR kecil, update dokumen |
| **BE** | [Matriks API §5](./integration-status.md#5-matriks-api--fe-mengharapkan-be-belum--tidak-lengkap) | Endpoint yang FE butuh; konfirmasi kontrak file proxy & payload |
| **QA** | [QA README](../qa/README.md) → [Status board](../qa/qa-status-board.md) | Retest setelah FE centang status; lapor bug baru pakai format di QA README |

---

## Legenda Status

| Simbol | Arti |
|--------|------|
| ✅ | Selesai / live — bisa diuji end-to-end |
| 🟡 | Partial — jalan sebagian, ada gap UX/data |
| 🔴 | Belum / mock — UI ada, API belum terhubung |
| 🚫 | Sengaja ditunda (produk/BE) |

---

## Ringkasan: Sudah Selesai vs Perlu Revisi

### ✅ Sudah live (Juni 2026)

| Area | Halaman / Hook utama | Catatan |
|------|----------------------|---------|
| Manajemen user admin | `admin/Student`, `Mentors`, `Admin` | Search, pagination, role, delete |
| Detail user admin | `admin/*Detail.tsx` | `GET /user/:uid` |
| Kategori & tipe kursus | `CourseCategories`, `CourseTypes` | CRUD master data |
| Katalog & detail kursus admin | `admin/Courses`, `DetailCourse` | Publish, hapus, tab Tugas |
| Editor kurikulum | `CourseEdit` (admin & mentor) | Module/lesson CRUD |
| **Mentor list & detail kursus** | `mentor/Courses`, `DetailCourse` | `useMentorCourses`, `useCourseDetailAdminAndMentor` — **sudah API live** |
| Tab Tugas staff | `CourseDetailAssignmentsTab` | Bulk assignments + roster + grade |
| Tugas siswa lintas kursus | `student/Assignments` | `GET /students/me/assignments` |
| Checkout & pembayaran | `checkout/Checkout`, `TransactionPayment` | Tripay + polling |
| Admin dashboard & transaksi | `admin/Dashboard`, `Transactions`, `Financial` | KPI, chart, filter |
| Mentor dashboard | `mentor/Dashboard` | KPI + jadwal kelas |

> **Catatan:** `progress/README.md` masih menyebut mentor courses sebagai mock — **itu sudah tidak akurat**. Mentor courses & detail sudah live; yang masih mock adalah `mentor/CourseAssignments.tsx` (legacy).

### 🔴 / 🟡 Perlu revisi (prioritas)

Lihat [files-to-revise.md](./files-to-revise.md) untuk tabel lengkap per file.

| Prioritas | Area | Masalah utama | Owner |
|-----------|------|---------------|-------|
| **P0** | Gambar terproteksi (401) | `<img src="/files/...">` tanpa Bearer | FE |
| **P1** | Legacy mentor assignments | `mentor/CourseAssignments.tsx` masih mock | FE |
| **P1** | Reply review | Handler masih `console.log`, belum hit API | FE |
| **P2** | Reviews & Q&A admin | `ReviewsQA.tsx` mock, route dikomentari | FE + BE |
| **P2** | Ganti password | Form tidak kirim `old_password` | FE |
| **P3** | URL tab state (`nuqs`) | Tab detail course tidak tersimpan di URL | FE |
| **P3** | Landing home | Data hardcode/kosong | FE |

---

## Prioritas P0 — Wajib Dulu

### QA-C-01: Gambar course / avatar 401

**Gejala:** Cover kursus, thumbnail, avatar di kartu/daftar tidak muncul; log BE `401` pada `GET /files/...`.

**Penyebab:** Endpoint file proxy **wajib Bearer JWT**. Tag `<img>` dan `window.open()` tidak mengirim header `Authorization`.

**Backend (sudah ada — jangan ubah kecuali kontrak):**

| Skenario | Endpoint |
|----------|----------|
| Satu file | `GET /files/{bucket}/{object}` |
| Banyak file (max 50) | `POST /files/{bucket}/batch` body `{ objects: string[] }` |

Route: `backend/internal/handler/routes/file_proxy.go`

**Frontend saat ini:**

- ✅ Avatar profil di `getAuthenticatedUser()` — fetch blob di `services/auth.ts`
- 🔴 Cover kursus, avatar mentor, invoice PDF — masih URL mentah di `<img>`

**Arah fix yang disarankan (FE senior):**

```
lib/files/           → parse URL, kumpulkan referensi gambar
services/file-proxy.ts → GET single + POST batch
hooks/files/         → useProtectedFile (single), useProtectedFileMap (batch)
hooks/use-course.ts  → resolve gambar setelah fetch data
components/shared/   → AuthenticatedImage / AuthenticatedAvatar
```

**File terdampak:** lihat baris `IMG-*` di [files-to-revise.md](./files-to-revise.md).

**Yang perlu dicek BE:** Format `cover_url` dari API harus `/files/{bucket}/{object}` atau URL penuh ke backend (`BASE_URL/files/...`). Bucket umum: `avatars`, `courses`, `invoices`.

---

## Prioritas P1 — Gap Utama

### Mentor legacy assignments

- **File:** `pages/mentor/CourseAssignments.tsx`
- **Status:** Mock hardcode
- **Solusi:** Arahkan ke tab **Tugas** di `mentor/DetailCourse` (sudah live) atau hapus route legacy

### Reply review course

- **File:** `components/shared/CourseReviewSection.tsx`
- **API:** `POST /courses/:uid/review/:id/reply` (sudah di `api-path.ts`)
- **Status:** Handler submit kemungkinan belum memanggil service

### Hapus kursus dari kartu daftar

- **File:** `components/shared/ManageCourse.tsx`, `CardMentor.tsx`
- **Status:** Hapus hanya dari halaman detail; kartu belum punya aksi delete

---

## Prioritas P2 — Moderasi & Auth

| Item | FE | BE |
|------|----|----|
| Admin reviews & Q&A | Wire `ReviewsQA.tsx`, aktifkan route di `App.tsx` | Endpoint sudah ada (`/admin/reviews`, `/admin/qna`) |
| Ganti password profil | Tambah field `old_password` di form | Validator BE sudah wajibkan field ini |
| Objek `graded_by` lengkap di submission | Mapper di `staff-submission-mapper.ts` | Saat ini hanya `graded_by_uid` |

---

## Prioritas P3 — Enhancement

- **nuqs / URL tab** — permintaan QA di [request.md](../qa/request.md) §1
- **Q&A per course (student)** — endpoint BE ada, UI belum
- **Landing `Home.tsx`** — masih mock

---

## Yang Butuh Backend (cek sebelum FE lanjut)

| Kebutuhan FE | Status BE | Dampak |
|--------------|-----------|--------|
| Domain sertifikat | 🔴 Tidak ada | `student/Certificates` mock |
| Forgot / reset password | 🔴 Tidak ada | Halaman auth recovery mock |
| `GET /admin/dashboard/support-tickets` | 🚫 Tidak direncanakan | Widget tiket kosong |
| Invite user admin baru | 🔴 Tidak ada | Hanya promote role existing |
| Filter kursus `course_category_id` | 🟡 Perlu verifikasi | Filter kategori landing |

---

## Alur Kerja Revisi (FE)

1. Pilih task dari [files-to-revise.md](./files-to-revise.md) (mulai P0).
2. Baca detail bug di `src/docs/qa/qa-*.md`.
3. Implementasi mengikuti [architecture.md](./architecture.md) (service → hook → komponen).
4. Update status di [qa-status-board.md](../qa/qa-status-board.md).
5. Centang item terkait di [todo-backlog.md](./todo-backlog.md) jika selesai.
6. Jalankan `npm run build` sebelum PR.

---

## Dokumen Terkait

| Dokumen | Path |
|---------|------|
| Status integrasi lengkap | [integration-status.md](./integration-status.md) |
| Peta file per task | [files-to-revise.md](./files-to-revise.md) |
| TODO & backlog | [todo-backlog.md](./todo-backlog.md) |
| Checklist uji manual | [qa-checklist.md](./qa-checklist.md) |
| Status bug QA | [../qa/qa-status-board.md](../qa/qa-status-board.md) |
| Perubahan BE merge | [../backend-changes-j-yriz-merge.md](../backend-changes-j-yriz-merge.md) |

---

*Setelah menutup item revisi, perbarui dokumen ini dan status board QA agar tim lain tidak mengerjakan ulang.*
