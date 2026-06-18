# Dokumentasi QA — Web DU Frontend

Indeks temuan QA, status perbaikan, dan cara melaporkan bug baru.

**Branch:** `features/frontend-sapto`  
**Terakhir diperbarui:** 18 Juni 2026

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
├── qa-global.md           ← Bug global (revalidate data, dll.)
├── qa-course.md           ← Bug course student (sesi QA terbaru)
└── assets/                ← Screenshot QA
```

---

## Papan Status Cepat

Lihat **[qa-status-board.md](./qa-status-board.md)** untuk tabel lengkap.

| Kategori | Open | Fixed | Verified |
|----------|------|-------|----------|
| Gambar / file 401 | 0 | 2 | 0 |
| Course & student | 0 | 4 | 0 |
| Global revalidate | 0 | 1 | 0 |
| Student / payment (retest) | 0 | 4 | 0 |
| Admin UX | 0 | 4 | 0 |
| Enhancement | 0 | 4 | 0 |

> Angka sinkron dengan [qa-status-board.md](./qa-status-board.md) — sesi 5, 18 Jun 2026.

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
| QA-C-09 | Transaksi pending tidak tampil | Normalisasi status di `filter-transactions.ts` |
| QA-C-12 | Redirect setelah pembayaran salah | Checkout + Tripay Fase 20–21 |

**Regresi (18 Jun 2026):** QA-C-10 (assignments kosong) dan QA-C-13 (placeholder payment) dibuka kembali — lihat QA-C-15/16/17 di status board.

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
| [qa-global.md](./qa-global.md) | Revalidate otomatis setelah update data | Semua |
| [qa-course.md](./qa-course.md) | Kursus populer, payment placeholder, assignments learning | Student |

> Temuan lama (gambar 401, modul duplikat, kategori, nuqs, dll.) tetap tercatat di [qa-status-board.md](./qa-status-board.md).

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
