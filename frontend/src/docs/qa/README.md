# Dokumentasi QA — Web DU Frontend

Indeks temuan QA, status perbaikan, dan cara melaporkan bug baru.

**Branch:** `features/frontend-sapto`  
**Terakhir diperbarui:** 17 Juni 2026

---

## Untuk Siapa?

| Peran | Mulai dari |
|-------|------------|
| **QA** | [Status board](./qa-status-board.md) → dokumen detail per fitur |
| **FE Junior** | Status board (kolom Status `🔴`) → [files-to-revise.md](../progress/files-to-revise.md) |
| **FE Senior** | [revision-guide.md](../progress/revision-guide.md) P0 → arsitektur fix |
| **BE** | Bagian "Butuh BE" di status board + detail di `qa-course.md` |

---

## Struktur Folder `qa/`

```
qa/
├── README.md              ← Anda di sini (indeks)
├── qa-status-board.md     ← Papan status semua bug (living doc)
├── qa-course.md           ← Bug & fix course (admin/mentor/student)
├── qa-module.md           ← Bug modul duplikat
├── qa-category.md         ← UX kategori kursus
├── qa-couse-type.md       ← UX tipe kursus
├── request.md             ← Permintaan enhancement (nuqs, dll.)
└── assets/                ← Screenshot QA
```

---

## Papan Status Cepat

Lihat **[qa-status-board.md](./qa-status-board.md)** untuk tabel lengkap.

| Kategori | Open | Fixed | Verified |
|----------|------|-------|----------|
| Gambar / file 401 | 2 | 0 | 0 |
| Course UX | 4 | 0 | 0 |
| Student / payment | 3 | 2 | 0 |
| Admin master data UX | 2 | 0 | 0 |
| Enhancement | 3 | 0 | 0 |

> Angka perkiraan — update di status board saat ada progress.

---

## Bug Kritis (P0) — Baca Dulu

### QA-C-01 · Gambar tidak load (401)

- **Role:** Admin, Mentor, Student
- **Gejala:** Cover kursus / avatar tidak muncul
- **Penyebab:** `<img src="/files/...">` tanpa Bearer token
- **Detail:** [qa-course.md §1](./qa-course.md#1-course-image-tidak-terload-401-unauthorized)
- **Fix FE:** [files-to-revise.md IMG-*](../progress/files-to-revise.md#p0--gambar-terproteksi-401)
- **BE:** Endpoint sudah benar — **bukan bug backend**

### QA-C-07 · Download invoice 401

- **Role:** Student
- **Gejala:** Klik unduh invoice → 401
- **Penyebab:** Sama — file proxy butuh auth
- **Detail:** [qa-course.md §7](./qa-course.md#7-download-invoice-gagal-401-unauthorized)

---

## Bug yang Kemungkinan Sudah Fixed (Perlu Retest)

| ID | Temuan | Alasan |
|----|--------|--------|
| QA-C-08 | Redirect setelah pembayaran salah | Checkout + Tripay Fase 20–21 |
| QA-C-09 | Transaksi pending tidak tampil | Refactor `TransactionsSection` |
| QA-C-10 | Halaman tugas student kosong | `GET /students/me/assignments` live |
| QA-C-06 | Return URL payment | `GET /payment/tripay` + polling |

**Tindakan QA:** Retest di environment staging; jika OK, ubah status ke `✅ Verified` di status board.

---

## Cara Melaporkan Bug Baru

Salin template ini ke issue / chat tim:

```markdown
## [QA-XXX] Judul singkat

**Role:** Admin | Mentor | Student | Guest
**Route:** /path/halaman
**Prioritas:** P0 | P1 | P2 | P3

### Langkah reproduksi
1. Login sebagai ...
2. Buka ...
3. Klik ...

### Expected
...

### Actual
...

### Screenshot / log
(lampirkan ke `qa/assets/` jika perlu)

### Catatan BE (opsional)
Endpoint terkait, response JSON, status HTTP
```

Setelah lapor:

1. Tambah baris di [qa-status-board.md](./qa-status-board.md)
2. Jika butuh perubahan kode, tambah baris di [files-to-revise.md](../progress/files-to-revise.md)

---

## Skenario Uji Manual (Fitur Live)

Untuk regression test fitur yang sudah diimplementasikan, gunakan:

**[progress/qa-checklist.md](../progress/qa-checklist.md)**

---

## Dokumen QA per Fitur

| File | Isi | Role utama |
|------|-----|------------|
| [qa-course.md](./qa-course.md) | Gambar 401, rating, mentor, payment, assignments, scroll | Admin, Mentor, Student |
| [qa-module.md](./qa-module.md) | Modul duplikat saat simpan | Admin |
| [qa-category.md](./qa-category.md) | Tombol tambah di dalam tabel | Admin |
| [qa-couse-type.md](./qa-couse-type.md) | Tombol tambah di dalam tabel | Admin |
| [request.md](./request.md) | nuqs, enhancement navigasi | Semua |

---

## Koordinasi FE ↔ BE

| Topik | FE | BE |
|-------|----|----|
| Gambar 401 | Fetch via Axios + Bearer; batch untuk list | Konfirmasi format `cover_url`, bucket name |
| Invoice 401 | Download blob, bukan `window.open` | Sama endpoint `/files/invoices/...` |
| Rating kursus baru | Sembunyikan jika belum ada review | Pastikan default rating = 0 / null |
| Assignments kosong | Mapper `use-student-assignment-items` | `GET /students/me/assignments` return shape |
| Reviews moderasi | Wire UI | `GET/POST /admin/reviews`, `/admin/qna` |

---

## Link Progress Developer

| Dokumen | Path |
|---------|------|
| Panduan revisi | [../progress/revision-guide.md](../progress/revision-guide.md) |
| Peta file | [../progress/files-to-revise.md](../progress/files-to-revise.md) |
| Status integrasi | [../progress/integration-status.md](../progress/integration-status.md) |

---

*Update status board setiap kali bug ditutup atau ada temuan baru.*
