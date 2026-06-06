# QA Checklist — Fitur yang Sudah Diimplementasikan

Panduan uji manual untuk QA. Setiap skenario punya **precondition**, **langkah**, **expected**, dan **known issues**.

**Environment:** butuh BE running + akun admin (idealnya juga `super_admin` untuk uji promote admin).

---

## A. Manajemen User Admin

### A1 — List siswa dengan pagination

| | |
|---|---|
| **Route** | `/admin/users/students` |
| **Precondition** | Login sebagai admin |
| **Langkah** | 1. Buka halaman 2. Scroll ke footer tabel 3. Klik halaman 2 |
| **Expected** | Data user role student dari API; footer "Halaman X dari Y"; ganti halaman tanpa full reload |
| **Known issue** | Kolom `totalSpent` selalu Rp 0 (BE tidak kirim) |

### A2 — Search siswa

| | |
|---|---|
| **Langkah** | Ketik nama/email di search → Enter atau submit |
| **Expected** | List terfilter; kembali ke halaman 1 |
| **Edge case** | Search >200 karakter → validator FE tolak (jika dipanggil langsung di service) |

### A3 — Ubah role siswa → mentor

| | |
|---|---|
| **Langkah** | Menu baris → Ubah role → pilih Mentor → konfirmasi |
| **Expected** | Toast sukses; user hilang dari list siswa (atau role berubah jika masih difilter) |
| **API** | `PATCH /user/role/:uid` body `{ "role": "mentor" }` |

### A4 — Promote siswa ke mentor (dialog khusus)

| | |
|---|---|
| **Route** | `/admin/users/mentors` |
| **Langkah** | Klik "Promosikan siswa" → pilih siswa → konfirmasi |
| **Expected** | Siswa menjadi mentor; muncul di list mentor |

### A5 — Promote ke admin (butuh super_admin)

| | |
|---|---|
| **Route** | `/admin/users/administrators` |
| **Precondition** | Login sebagai **super_admin** |
| **Langkah** | Promote user → pilih mentor/siswa → jadikan admin |
| **Expected** | Toast sukses |
| **Known issue** | Admin biasa → **403** "Only super_admin can assign the admin role" |

### A6 — Hapus user

| | |
|---|---|
| **Langkah** | Menu baris → Hapus → konfirmasi |
| **Expected** | Toast sukses; baris hilang |
| **Edge case** | Hapus akun sendiri → BE 400 "Cannot delete your own account" |

### A7 — Halaman administrator incomplete

| | |
|---|---|
| **Known issue** | User `super_admin` tidak muncul saat filter `role=admin` |
| **Verifikasi** | Bandingkan jumlah user di DB vs UI |

---

## B. Course Master

### B1 — CRUD kategori

| | |
|---|---|
| **Route** | `/admin/course-categories` |
| **Langkah** | Tambah → isi nama → simpan / Edit / Hapus |
| **Expected** | Perubahan persist; nama kosong ditolak validator |
| **Validasi** | Nama max 120 karakter |

### B2 — CRUD tipe kursus

| | |
|---|---|
| **Route** | `/admin/course-types` |
| **Langkah** | Sama seperti B1 |
| **Expected** | Identik flow kategori |

---

## C. Kursus Admin

### C1 — List kursus

| | |
|---|---|
| **Route** | `/admin/courses` |
| **Expected** | Kartu kursus dari `GET /courses` |
| **Filter** | Segmen Semua/Aktif/Draf — client-side only |

### C2 — Buat kursus baru

| | |
|---|---|
| **Langkah** | Tambah Kursus → isi form wajib → simpan |
| **Expected** | Kursus baru muncul di list |
| **Validasi FE** | Judul, deskripsi, kategori, tipe, harga wajib |

### C3 — Detail kursus admin

| | |
|---|---|
| **Route** | `/admin/courses/:courseUid` |
| **Expected** | Overview, kurikulum, peserta, review, mentor tabs |
| **Data** | Course detail + students + modules dari API |

### C4 — Publish kursus

| | |
|---|---|
| **Langkah** | Klik publish → konfirmasi |
| **Expected** | `PATCH /courses/:uid/status` sukses; badge status berubah |

### C5 — Assign mentor

| | |
|---|---|
| **Tab** | Mentor → Assign mentor |
| **Langkah** | Pilih mentor yang belum assigned → konfirmasi |
| **Expected** | Mentor muncul di tabel tim pengajar |
| **Edge case** | Assign UID invalid → error dari BE |

### C6 — Lepas mentor (NEGATIVE — belum implement)

| | |
|---|---|
| **Langkah** | Klik "Lepas" |
| **Expected saat ini** | **Tidak ada aksi** — tombol tidak wired |
| **Status** | 🔴 Known gap |

### C7 — Edit metadata kursus (NEGATIVE — tunggu BE)

| | |
|---|---|
| **Langkah** | Edit → ubah judul → simpan |
| **Expected saat ini** | **Gagal** — `PUT /courses/:id` belum ada di BE |
| **Verifikasi FE** | Validasi form tetap jalan sebelum request |

### C8 — Tab peserta — kehadiran

| | |
|---|---|
| **Tab** | Peserta |
| **Known issue** | Bar kehadiran salah/kosong — BE tidak kirim `attendance_*` fields |
| **Yang benar** | Progress % dari `enrollment.progress` |

---

## D. Editor Kurikulum

### D1 — Admin edit kurikulum

| | |
|---|---|
| **Route** | `/admin/courses/:uid/edit` |
| **Langkah** | Tambah module → tambah lesson text → simpan |
| **Expected** | Module/lesson tersimpan via API |

### D2 — Navigasi unsaved

| | |
|---|---|
| **Langkah** | Edit lesson tanpa simpan → pindah lesson |
| **Expected** | Dialog unsaved muncul |

### D3 — Mentor edit kurikulum

| | |
|---|---|
| **Route** | `/mentor/courses/:uid/edit` |
| **Expected** | Sama seperti admin edit (live) |

---

## E. Layout & UX

### E1 — Sidebar breakpoint

| | |
|---|---|
| **Langkah** | Resize viewport 768px, 1024px, 1280px |
| **Expected** | Sidebar tidak menyebabkan horizontal scroll pada main content |
| **Perbaikan** | Fase 3 sesi ini |

### E2 — Pagination di tabel user

| | |
|---|---|
| **Expected** | Pagination di footer tabel dengan border; konsisten dengan course master |

---

## F. Validator (Negative Tests)

### F1 — Assign mentor tanpa pilihan

| | |
|---|---|
| **Expected** | FE tidak submit; atau error min 1 mentor |

### F2 — Create kategori nama kosong

| | |
|---|---|
| **Expected** | Toast error "Nama wajib diisi" |

### F3 — Role invalid

| | |
|---|---|
| **Expected** | Validator tolak sebelum API jika role di luar enum |

---

## G. Regresi — Halaman yang Masih Mock (jangan expect API)

| Route | Status |
|-------|--------|
| `/admin/dashboard` | Mock KPI |
| `/admin/transactions` | Mock |
| `/admin/financial` | Mock |
| `/mentor/courses` | Mock list |
| `/mentor/courses/:uid` | Mock detail |
| `/mentor/courses/:uid/assignments` | Mock |
| `/student/assignments` | Mock |
| `/student/certificates` | Empty |
| `/auth/forgot-password` | Tidak hit API |
| `/admin/reviews-and-qa` | Route tidak aktif |

---

## H. Smoke Test Sequence (15 menit)

Urutan cepat untuk regression smoke:

```
1. Login admin
2. /admin/users/students → cek data + pagination
3. /admin/users/mentors → promote (opsional)
4. /admin/course-categories → buat kategori test
5. /admin/courses → buat kursus (jika staging allow)
6. /admin/courses/:uid → assign mentor
7. /admin/courses/:uid/edit → tambah module+lesson
8. Publish kursus dari detail
9. Resize sidebar 1024px
10. Logout
```

---

## Pelaporan Bug

Saat menemukan bug, sertakan:

1. Route & role user
2. Request network (method, path, body) dari DevTools
3. Response status + message BE
4. Screenshot UI
5. Apakah sudah tercatat di [payload-gaps.md](../payload-gaps.md) atau [api-route-gaps.md](../api-route-gaps.md)
