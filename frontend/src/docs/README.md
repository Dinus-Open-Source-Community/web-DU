# Dokumentasi Kekurangan Frontend ↔ Backend

Dokumen ini merangkum **gap integrasi** antara halaman di `frontend-react/src/pages/` dengan API backend (`backend/internal/handler/routes/`).

**Audiens:** Backend engineer, PM, dan frontend engineer yang mengerjakan integrasi berikutnya.

**Terakhir diperbarui:** 17 Juni 2026 (branch `features/frontend-sapto`)

---

## Cara Membaca

| Simbol | Arti |
|--------|------|
| ✅ | Sudah terintegrasi API (live) |
| 🟡 | Sebagian terintegrasi / ada celah payload |
| 🔴 | Masih mock/hardcode atau endpoint BE belum ada |
| 🚫 | Route FE ada, tapi tidak terdaftar di router / tidak bisa diakses |

Setiap gap punya:
- **Halaman terdampak** — file di `pages/`
- **Yang dibutuhkan FE** — route/payload/response
- **Kondisi BE saat ini** — apa yang sudah / belum ada
- **Dampak ke user** — kenapa ini penting untuk PM

---

## Daftar Isi

### Progress & implementasi (PM · QA · Reviewer · FE)

| Dokumen | Isi |
|---------|-----|
| [**progress/revision-guide.md**](./progress/revision-guide.md) | **Panduan revisi** — prioritas P0–P3, sudah vs belum, arah fix |
| [**progress/files-to-revise.md**](./progress/files-to-revise.md) | **Peta file** — file yang perlu diubah + task ID + status |
| [**progress/integration-status.md**](./progress/integration-status.md) | **Status FE↔BE** — fitur, API dipakai/belum, gap |
| [**progress/README.md**](./progress/README.md) | Ringkasan kemajuan & indeks progress |
| [**qa/README.md**](./qa/README.md) | **Indeks QA** — cara baca temuan, lapor bug baru |
| [**qa/qa-status-board.md**](./qa/qa-status-board.md) | **Papan status bug** — Open / Fixed / Verified |

### Performance (FE audit)

| Dokumen | Isi |
|---------|-----|
| [**performance/README.md**](./performance/README.md) | **Indeks audit performa** — ringkasan score & halaman kritis |
| [performance/audit-report.md](./performance/audit-report.md) | Budget bundle, CRP, gambar, font, caching, Core Web Vitals |
| [performance/react-review.md](./performance/react-review.md) | Code splitting, hooks gambar, memo, list, anti-pattern React |
| [performance/action-backlog.md](./performance/action-backlog.md) | Backlog PERF-01…21 prioritas P0–P3 |

### Security (FE audit)

| Dokumen | Isi |
|---------|-----|
| [**security/README.md**](./security/README.md) | **Indeks audit keamanan** — ringkasan OWASP & halaman kritis |
| [security/pages-security-matrix.md](./security/pages-security-matrix.md) | Matriks keamanan per halaman di `pages/` |
| [security/audit-report.md](./security/audit-report.md) | Temuan SEC-01…18: XSS, auth, IDOR, payment |
| [security/action-backlog.md](./security/action-backlog.md) | Backlog SEC-01…18 prioritas P1–P3 + checklist verifikasi |

| [backend-changes-j-yriz-merge.md](./backend-changes-j-yriz-merge.md) | Perubahan BE merge J-yriz + kontrak endpoint |
| [progress/implementation-log.md](./progress/implementation-log.md) | Kronologi fase kerja dari awal sesi |
| [progress/workflows.md](./progress/workflows.md) | Diagram alur fitur yang sudah di-wire |
| [progress/architecture.md](./progress/architecture.md) | Struktur folder & pola arsitektur |
| [progress/files-changed.md](./progress/files-changed.md) | Peta file baru/diubah untuk code review |
| [progress/qa-checklist.md](./progress/qa-checklist.md) | Skenario uji manual fitur live |
| [progress/todo-backlog.md](./progress/todo-backlog.md) | **TODO & kekurangan FE vs BE** (requirement lama + baru) |
| [progress/assignment-staff-session.md](./progress/assignment-staff-session.md) | Sesi tab Tugas staff, roster, penilaian |

### Dokumen QA per fitur

| Dokumen | Isi |
|---------|-----|
| [qa/qa-course.md](./qa/qa-course.md) | Bug course — gambar 401, payment, assignments |
| [qa/qa-module.md](./qa/qa-module.md) | Modul duplikat |
| [qa/qa-category.md](./qa/qa-category.md) | UX kategori |
| [qa/qa-couse-type.md](./qa/qa-couse-type.md) | UX tipe kursus |
| [qa/request.md](./qa/request.md) | Permintaan enhancement (nuqs, dll.) |

### Gap & backlog (PM · BE)

| Dokumen | Isi |
|---------|-----|
| [page-coverage.md](./page-coverage.md) | Matriks semua halaman: status integrasi, sumber data, route |
| [api-route-gaps.md](./api-route-gaps.md) | Endpoint yang **belum ada di BE** atau **salah dipanggil FE** |
| [payload-gaps.md](./payload-gaps.md) | Ketidakselarasan **request/response** antara FE dan BE |
| [priority-backlog.md](./priority-backlog.md) | Urutan prioritas implementasi untuk BE & PM |

### Dokumen Admin (legacy, sudah diperbarui sebagian)

| Dokumen | Isi |
|---------|-----|
| [routes-pages/admin-routes.md](./routes-pages/admin-routes.md) | Route admin saja |
| [routes-pages/admin-be-gaps.md](./routes-pages/admin-be-gaps.md) | Gap BE khusus admin (legacy) |
| [routes-pages/admin-request-response.md](./routes-pages/admin-request-response.md) | Kontrak request/response admin |

> **Catatan:** Untuk analisis terbaru, utamakan dokumen di root `docs/` di atas. File di `routes-pages/` akan digantikan bertahap.

---

## Ringkasan Eksekutif (untuk PM)

### Sudah live (bisa dipakai end-to-end)

- Manajemen user admin (list, search, pagination, ubah role, hapus)
- CRUD kategori & tipe kursus
- List kursus admin + create kursus + publish status
- Detail kursus admin + assign mentor + edit metadata kursus (UI)
- Editor kurikulum (module/lesson) admin & mentor
- Browse kursus publik & student
- Profil user (nama, avatar) via `GET /user/data`
- Auth login, register, OAuth Google

### Blocker utama (harus dari BE dulu)

1. **`PUT /courses/:id`** — FE sudah memanggil update kursus, BE belum punya route
2. **`POST /courses/:id/mentors/unassign`** — tombol "Lepas mentor" ada di UI, BE belum ada
3. **Admin transactions & financial** — seluruh halaman masih mock
4. **Reviews & Q&A moderation** — route FE di-comment, data mock, BE tidak punya list endpoint
5. **Forgot/reset password** — UI ada, BE tidak punya endpoint
6. **Sertifikat** — halaman ada, BE tidak punya domain certificate sama sekali
7. **`GET /payment` list** — FE mengira ini list transaksi; BE hanya detail by `reference` / `enrollmentId`

### Risiko payload (BE ada tapi bentuknya tidak cocok UI)

- Peserta kursus: UI butuh **kehadiran** (`attendance`), BE hanya kirim `progress` + `status`
- Ganti password: BE wajib `old_password`, form FE tidak mengirim
- Filter kursus by kategori: FE kirim `course_category_id`, BE tidak mendukung query itu
- Halaman administrator: filter `role=admin` tidak menangkap user `super_admin`

---

## Referensi Kode

| Area | Lokasi |
|------|--------|
| Halaman | `frontend-react/src/pages/` |
| Route app | `frontend-react/src/App.tsx`, `lib/routes.ts` |
| API path FE | `frontend-react/src/services/api-path.ts` |
| Service layer | `frontend-react/src/services/` |
| Validator payload | `frontend-react/src/lib/validator/` |
| Route BE | `backend/internal/handler/routes/` |
