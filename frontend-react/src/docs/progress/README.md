# Progress Report — Frontend Integration

Dokumentasi kemajuan implementasi frontend pada branch `features/frontend-sapto`, mulai dari sesi integrasi awal hingga kondisi terkini.

**Audiens:** PM · QA · Code Reviewer · Backend

**Cara pakai dokumen ini:**

| Peran | Mulai dari |
|-------|------------|
| **PM** | [Ringkasan Eksekutif](#ringkasan-eksekutif) → [implementation-log.md](./implementation-log.md) |
| **QA** | [qa-checklist.md](./qa-checklist.md) → [workflows.md](./workflows.md) |
| **Reviewer** | [architecture.md](./architecture.md) → [files-changed.md](./files-changed.md) |

---

## Ringkasan Eksekutif

### Apa yang sudah selesai diimplementasikan?

| Area | Status | Dampak bisnis |
|------|--------|---------------|
| Manajemen user admin (siswa, mentor, administrator) | ✅ Live | Admin bisa lihat, cari, paginate, ubah role, hapus user |
| CRUD kategori & tipe kursus | ✅ Live | Master data kursus terkelola dari panel admin |
| Katalog & detail kursus admin | ✅ Live | List kursus, detail, publish, assign mentor |
| Form buat/edit metadata kursus | 🟡 Partial | UI + validator siap; **update kursus butuh `PUT /courses/:id` dari BE** |
| Editor kurikulum (module/lesson) | ✅ Live | Admin & mentor bisa kelola konten kursus |
| Editor kurikulum — tab Tugas & save kontekstual | ✅ Live | Simpan/hapus lesson vs tugas per tab + guard unsaved |
| Editor kurikulum — rename judul inline + API | ✅ Live | Ubah nama lesson langsung `PUT /lessons/:uid` |
| Tab Tugas staff di detail course (admin/mentor) | ✅ Live | Overview tugas, roster pengumpulan, detail jawaban + penilaian |
| Penilaian & feedback submission inline | ✅ Live | `PUT .../submissions/:uid/grade` — feedback timpa 1 field |
| Tab Kehadiran admin (detail course) | 🟡 Partial | List + update + delete ✅; create manual & note UI ❌ |
| Validator payload (Zod) | ✅ Live | + domain `lesson-assignment`, `lesson-attendance` |
| Layout sidebar | ✅ Fixed | Sidebar konsisten di breakpoint `lg` (1024px) |
| Dokumentasi gap FE↔BE | ✅ Done | PM/BE tahu apa yang masih kurang |
| TODO & backlog terpusat | ✅ Done | [todo-backlog.md](./todo-backlog.md) |

### Apa yang belum (sengaja di luar scope sesi ini)?

Lihat [../priority-backlog.md](../priority-backlog.md) — contoh: admin transactions/financial (mock), mentor pages (sebagian mock), sertifikat, forgot password, unassign mentor.

---

## Daftar Isi Folder `progress/`

| File | Isi |
|------|-----|
| [implementation-log.md](./implementation-log.md) | Kronologi pekerjaan per fase (dari awal chat) |
| [workflows.md](./workflows.md) | Diagram alur fitur yang sudah di-wire ke API |
| [architecture.md](./architecture.md) | Struktur folder & pola clean architecture |
| [files-changed.md](./files-changed.md) | Peta file utama yang ditambah/diubah |
| [qa-checklist.md](./qa-checklist.md) | Skenario uji untuk fitur yang sudah live |
| [course-editor-ux-session.md](./course-editor-ux-session.md) | Sesi course editor: tugas lesson, tab save, rename inline |
| [assignment-staff-session.md](./assignment-staff-session.md) | Sesi tab Tugas staff, roster, penilaian inline, validator |
| [todo-backlog.md](./todo-backlog.md) | **TODO & kekurangan FE vs BE** (requirement lama + baru) |

### Dokumen terkait (di luar folder progress)

| File | Isi |
|------|-----|
| [../README.md](../README.md) | Indeks dokumentasi gap |
| [../page-coverage.md](../page-coverage.md) | Status semua halaman |
| [../api-route-gaps.md](../api-route-gaps.md) | Endpoint yang belum ada di BE |
| [../payload-gaps.md](../payload-gaps.md) | Ketidakselarasan request/response |
| [../priority-backlog.md](../priority-backlog.md) | Prioritas pekerjaan berikutnya |

---

## Metrik Singkat

| Metrik | Nilai |
|--------|-------|
| Halaman admin terintegrasi API | 7+ dari 12 (detail course +2 subflow tugas) |
| Domain validator | 6 (user-manage, course-master, course-mentor, course-form, lesson-assignment, lesson-attendance) |
| Endpoint BE assignment/attendance dipakai FE | 6+ |
| Komponen user-manage baru | ~10 |
| Branch | `features/frontend-sapto` |

---

## Status per Halaman (yang dikerjakan di sesi ini)

```
✅  /admin/users/students
✅  /admin/users/mentors
✅  /admin/users/administrators
✅  /admin/course-categories
✅  /admin/course-types
✅  /admin/courses
🟡 /admin/courses/:uid          (tab Tugas + Kehadiran partial live; lepas mentor & reply review belum)
🟡 /admin/courses/.../submissions & /submissions/:uid  (roster + penilaian live)
🟡 /admin/courses/:uid/edit     (kurikulum live; update metadata tunggu BE)
🔴 /admin/dashboard|transactions|financial  (belum disentuh — masih mock)
```

Legenda: ✅ live · 🟡 partial · 🔴 mock
