# Progress Report — Frontend Integration

Dokumentasi kemajuan implementasi frontend pada branch `features/frontend-sapto`, mulai dari sesi integrasi awal hingga kondisi terkini.

**Audiens:** PM · QA · Code Reviewer · Backend

**Dokumen utama status FE↔BE:** [integration-status.md](./integration-status.md)  
**Perubahan backend merge J-yriz:** [backend-changes-j-yriz-merge.md](../backend-changes-j-yriz-merge.md)

**Cara pakai dokumen ini:**

| Peran | Mulai dari |
|-------|------------|
| **PM** | [integration-status.md](./integration-status.md) §1–§7 → [implementation-log.md](./implementation-log.md) |
| **QA** | [qa-checklist.md](./qa-checklist.md) → [workflows.md](./workflows.md) |
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
| Tab Kehadiran admin (detail course) | 🟡 Partial | List + update + delete ✅; create manual & note UI ❌ |
| Validator payload (Zod) | ✅ Live | + domain `lesson-assignment`, `lesson-attendance` |
| Layout sidebar | ✅ Fixed | Sidebar konsisten di breakpoint `lg` (1024px) |
| Publish & hapus kursus admin | ✅ Live | `PATCH/DELETE /courses/:uid`; label Terbit/Draft; tombol Terbit hanya draft |
| Dokumentasi gap FE↔BE | ✅ Done | [integration-status.md](./integration-status.md) |

### Apa yang belum?

| Area | Status | Blocker |
|------|--------|---------|
| Hapus kursus dari daftar (`ManageCourse` kartu) | 🟡 | Hapus hanya dari halaman detail; kartu belum punya aksi |
| Admin dashboard | 🔴 Mock | Service admin belum dibuat |
| Admin transactions / financial | 🔴 Mock | BE ✅ — lihat [admin-financial-transactions-spec.md](./admin-financial-transactions-spec.md) |
| Mentor dashboard & list/detail kursus | 🔴 Mock | Halaman belum pakai hook API |
| Reviews & Q&A moderasi admin | 🔴 Mock | Route dikomentari |
| Checkout & payment flow | 🔴 | Route `/checkout/*` tidak ada |
| Attendance bar di tab Peserta | 🟡 | Mapper field `attendance_*` belum |
| Sertifikat, forgot password | 🔴 | Tidak ada domain BE |

Detail lengkap: [integration-status.md](./integration-status.md)

---

## Daftar Isi Folder `progress/`

| File | Isi |
|------|-----|
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
| Halaman admin terintegrasi API | 10+ dari 15 route utama |
| Domain validator | 6+ |
| Endpoint assignment/attendance dipakai FE | 10+ |
| Service baru post-merge | `course-assignments`, `student-assignments`, user detail |
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
🟡 /admin/courses/:uid          (Tugas + publish + hapus live; Kehadiran partial; attendance bar belum map)
✅  /admin/courses/.../submissions & /submissions/:uid
✅  /admin/courses/:uid/edit     (kurikulum + PUT metadata live)
🔴 /admin/dashboard|transactions|financial|reviews-and-qa

✅  /student/assignments         (GET /students/me/assignments)
✅  /student/learning + module viewer
🟡 /student/dashboard|transactions

🔴 /mentor/dashboard|courses|courses/:uid  (mock — edit & submissions route live)
🔴 /mentor/courses/:uid/assignments       (legacy mock)
```

Legenda: ✅ live · 🟡 partial · 🔴 mock
