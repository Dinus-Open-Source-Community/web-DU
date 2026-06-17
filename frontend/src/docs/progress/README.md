# Progress Report — Frontend Integration

Dokumentasi kemajuan implementasi frontend pada branch `features/frontend-sapto`, mulai dari sesi integrasi awal hingga kondisi terkini.

**Audiens:** PM · QA · Code Reviewer · Backend · **FE Junior/Senior**

**Dokumen utama status FE↔BE:** [integration-status.md](./integration-status.md)  
**Panduan revisi (developer):** [revision-guide.md](./revision-guide.md) · [files-to-revise.md](./files-to-revise.md)  
**Status bug QA:** [../qa/qa-status-board.md](../qa/qa-status-board.md)  
**Perubahan backend merge J-yriz:** [backend-changes-j-yriz-merge.md](../backend-changes-j-yriz-merge.md)

**Cara pakai dokumen ini:**

| Peran | Mulai dari |
|-------|------------|
| **FE Junior** | [revision-guide.md](./revision-guide.md) → [files-to-revise.md](./files-to-revise.md) → [../qa/qa-status-board.md](../qa/qa-status-board.md) |
| **FE Senior** | [integration-status.md](./integration-status.md) §7 → [architecture.md](./architecture.md) |
| **PM** | [integration-status.md](./integration-status.md) §1–§7 → [implementation-log.md](./implementation-log.md) |
| **QA** | [../qa/README.md](../qa/README.md) → [qa-checklist.md](./qa-checklist.md) |
| **Reviewer** | [architecture.md](./architecture.md) → [files-changed.md](./files-changed.md) |
| **Backend** | [integration-status.md](./integration-status.md) §3–§5 → backend-changes doc |

---

## Ringkasan Eksekutif

### Apa yang sudah selesai diimplementasikan?

| Area | Status | Dampak bisnis |
|------|--------|---------------|
| Manajemen user admin (siswa, mentor, administrator) | ✅ Live | Admin bisa lihat, cari, paginate, ubah role, hapus user |
| **Detail user admin** (profil, kursus, ulasan, transaksi) | ✅ Live | `GET /user/:uid` — navigasi SegmentedFilter, progress bar |
| CRUD kategori & tipe kursus | ✅ Live | Master data kursus terkelola dari panel admin |
| Katalog & detail kursus admin | ✅ Live | List kursus, detail, publish, hapus (soft delete), assign/unassign mentor |
| Form buat/edit metadata kursus | ✅ Live | `PUT /courses/:uid` sudah di-wire |
| Editor kurikulum (module/lesson) | ✅ Live | Admin & mentor bisa kelola konten kursus |
| Tab Tugas staff di detail course (admin) | ✅ Live | Bulk assignments + roster + penilaian inline |
| **Tugas siswa lintas kursus** | ✅ Live | `GET /students/me/assignments` → `student/Assignments.tsx` |
| Penilaian & feedback submission inline | ✅ Live | `PUT .../submissions/:uid/grade` |
| Student module viewer — kerja & submit tugas | ✅ Live | Multi-attempt GET submission |
| **Checkout & join kursus** | ✅ Live | Route `/checkout/:courseUid`; join + `POST /payment` → detail Tripay |
| **Katalog available-only** | ✅ Live | Student/login hanya lihat kursus yang belum active/completed; guest tetap lihat semua |
| **Detail pembayaran siswa** (Tripay) | ✅ Live | Polling status, Suspense skeleton, status animation, invoice, kode bayar, instruksi |
| **Redesign payment detail** | ✅ Live | Hero status terpusat, progress navigation, responsive summary, komponen terpisah per file |
| **Refactor TransactionsSection** | ✅ Live | Ekstrak view model + label bahasa Indonesia |
| **Admin dashboard** (KPI, chart, transaksi terbaru) | ✅ Live | `GET /admin/dashboard/*`, `/admin/financial/summary` |
| **Admin transaksi & financial** | ✅ Live | `GET /admin/transactions`, summary, financial charts |
| **Mentor dashboard** (KPI + jadwal kelas) | ✅ Live | `GET /mentor/dashboard/kpis`, `.../schedules` |
| Validator payload (Zod) | ✅ Live | + domain `lesson-assignment` (dan `lesson-attendance` — kode ada, fitur ditunda) |
| Layout sidebar | ✅ Fixed | Sidebar konsisten di breakpoint `lg` (1024px) |
| Publish & hapus kursus admin | ✅ Live | `PATCH/DELETE /courses/:uid`; label Terbit/Draft; tombol Terbit hanya draft |
| Dokumentasi gap FE↔BE | ✅ Done | [integration-status.md](./integration-status.md) |

### Apa yang belum?

| Area | Status | Blocker |
|------|--------|---------|
| **Gambar terproteksi (401)** | 🔴 Open | `<img>` tanpa Bearer — lihat [revision-guide.md](./revision-guide.md) P0 |
| Hapus kursus dari daftar (`ManageCourse` kartu) | 🟡 | Hapus hanya dari halaman detail; kartu belum punya aksi |
| Mentor list & detail kursus | ✅ Live | `mentor/Courses.tsx`, `DetailCourse.tsx` — API via `useMentorCourses` |
| Halaman `mentor/.../assignments` (legacy) | 🔴 Mock | Tab Tugas di detail course sudah live |
| Reviews & Q&A moderasi admin | 🔴 Mock | Route dikomentari |
| Sertifikat, forgot password | 🔴 | Tidak ada domain BE |
| Kehadiran (attendance) | 🚫 Ditunda | Sengaja dikeluarkan dari tracking progress — menunggu keputusan selanjutnya |

Detail lengkap: [integration-status.md](./integration-status.md)

---

## Daftar Isi Folder `progress/`

| File | Isi |
|------|-----|
| **[revision-guide.md](./revision-guide.md)** | **Panduan revisi** — prioritas, sudah vs belum, arah fix |
| **[files-to-revise.md](./files-to-revise.md)** | **Peta file** — file mana diubah, task ID, status |
| **[integration-status.md](./integration-status.md)** | **Status FE↔BE: fitur, API dipakai/belum, gap** |
| [implementation-log.md](./implementation-log.md) | Kronologi pekerjaan per fase |
| [workflows.md](./workflows.md) | Diagram alur fitur yang sudah di-wire ke API |
| [architecture.md](./architecture.md) | Struktur folder & pola clean architecture |
| [files-changed.md](./files-changed.md) | Peta file utama yang ditambah/diubah |
| [qa-checklist.md](./qa-checklist.md) | Skenario uji untuk fitur yang sudah live |
| [course-editor-ux-session.md](./course-editor-ux-session.md) | Sesi course editor |
| [assignment-staff-session.md](./assignment-staff-session.md) | Sesi tab Tugas staff |
| [todo-backlog.md](./todo-backlog.md) | TODO & kekurangan FE vs BE |
| **[admin-financial-transactions-spec.md](./admin-financial-transactions-spec.md)** | **Spesifikasi requirement `/admin/transactions` & `/admin/financial`** |

### Dokumen terkait (di luar folder progress)

| File | Isi |
|------|-----|
| [../backend-changes-j-yriz-merge.md](../backend-changes-j-yriz-merge.md) | Perubahan BE merge J-yriz + checklist |
| [../README.md](../README.md) | Indeks dokumentasi gap |
| [../page-coverage.md](../page-coverage.md) | Status semua halaman |
| [../api-route-gaps.md](../api-route-gaps.md) | Endpoint yang belum ada di BE |
| [../payload-gaps.md](../payload-gaps.md) | Ketidakselarasan request/response |
| [../priority-backlog.md](../priority-backlog.md) | Prioritas pekerjaan berikutnya |

---

## Metrik Singkat

| Metrik | Nilai |
|--------|-------|
| Halaman admin terintegrasi API | 13+ dari 15 route utama |
| Halaman mentor terintegrasi API | 4 dari 6 route utama |
| Domain validator | 6+ |
| Endpoint assignment dipakai FE | 8+ |
| Service baru post-merge | `admin-dashboard`, `admin-transactions`, `mentor-dashboard`, `course-assignments`, `student-assignments`, payment (Tripay + checkout) |
| Branch | `features/frontend-sapto` |

---

## Status per Halaman (kondisi Juni 2026)

```
✅  /admin/users/students|mentors|administrators
✅  /admin/users/students/:uid  (detail user)
✅  /admin/users/mentors/:uid
✅  /admin/users/administrators/:uid
✅  /admin/course-categories
✅  /admin/course-types
✅  /admin/courses
✅  /admin/courses/:uid          (Tugas + publish + hapus live)
✅  /admin/courses/.../submissions & /submissions/:uid
✅  /admin/courses/:uid/edit     (kurikulum + PUT metadata live)
✅  /admin/dashboard              (KPI, chart, transaksi terbaru — Fase 18)
✅  /admin/transactions           (list + summary + filter — Fase 18)
✅  /admin/financial              (revenue chart + KPI — Fase 18)
🔴 /admin/reviews-and-qa

✅  /student/assignments         (GET /students/me/assignments)
✅  /student/learning + module viewer
✅  /student/browse              (available-only dari joined_courses — Fase 21)
✅  /student/transactions/payment     (detail + polling + redesign — Fase 17/21)
✅  /checkout/:courseUid              (join kursus + pilih metode bayar — Fase 20)
🟡 /student/dashboard

🟡 /course                       (enrollment-aware ✅; filter kategori perlu verifikasi)
✅  /course/:courseUid            (guest CTA login → kembali ke checkout — Fase 21)

✅  /mentor/dashboard            (KPI + jadwal — Fase 19)
✅  /mentor/courses               (API live — useMentorCourses)
✅  /mentor/courses/:uid          (detail live — tab Tugas + kurikulum)
🔴 /mentor/courses/:uid/assignments       (legacy mock)
```

Legenda: ✅ live · 🟡 partial · 🔴 mock
