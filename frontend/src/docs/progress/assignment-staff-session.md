# Progress — Tab Tugas Staff, Roster & Penilaian Submission

Dokumentasi sesi implementasi **tab Tugas** di detail kursus (admin/mentor), alur roster pengumpulan, halaman detail jawaban siswa, penilaian inline, feedback, dan validator request.

**Tanggal:** 9 Juni 2026  
**Branch:** `features/frontend-sapto`  
**Audiens:** PM · QA · Code Reviewer · Backend

**Backlog & TODO lengkap:** [todo-backlog.md](./todo-backlog.md)

---

## Ringkasan Eksekutif

| Area | Status | Dampak |
|------|--------|--------|
| Tab Tugas di detail course admin/mentor | ✅ Done | Staff lihat semua assignment per lesson |
| Roster pengumpulan (tabel) | ✅ Done | Status sudah/belum kumpul per siswa terdaftar |
| Halaman detail submission per siswa | ✅ Done | Review jawaban + penilaian + feedback |
| Penilaian inline + feedback timpa | ✅ Done | Selaras `PUT .../grade` BE |
| Layout flat (tanpa nested card) | ✅ Done | UI konsisten dengan design system manage-detail |
| Validator Zod tugas & kehadiran | ✅ Done | Request invalid ditangkap sebelum hit API |
| Profil penilai di feedback | 🟡 Partial | Hanya lengkap jika `graded_by_uid` = user login |
| Tab Kehadiran admin | 🟡 Partial | Update/delete ✅; create & note UI ❌ |

---

## Alur Navigasi

```
Detail Course → Tab Tugas
  → Pilih lesson / Lihat pengumpulan
    → Roster tabel (semua siswa)
      → Lihat jawaban (per siswa)
        → Halaman detail (navbar only)
          ├── Main: jawaban + penilaian + feedback
          └── Sidebar: daftar siswa + search
```

**Routes:**

| Role | Roster | Detail submission |
|------|--------|-------------------|
| Admin | `/admin/courses/:courseUid/lessons/:lessonUid/submissions` | `.../submissions/:submissionUid` |
| Mentor | `/mentor/courses/:courseUid/lessons/:lessonUid/submissions` | `.../submissions/:submissionUid` |

---

## API yang Dipakai

### Staff — list & penilaian

```
GET  /lessons/:lessonUid/assignment
GET  /lessons/:lessonUid/assignment/submissions
PUT  /lessons/:lessonUid/assignment/submissions/:submissionUid/grade
     body: { score_percent, feedback?, passed? }
```

### Siswa — pengumpulan (sudah ada sebelumnya, tetap dipakai)

```
GET  /lessons/:lessonUid/assignment/submission
POST /lessons/:lessonUid/assignment/submission
PUT  /lessons/:lessonUid/assignment/submission
```

### Kehadiran (tab admin)

```
GET    /lessons/attendances/lesson/:lessonUid
PUT    /lessons/attendances/:attendanceUid
DELETE /lessons/attendances/:attendanceUid
```

---

## Arsitektur Layer

| Layer | Path utama |
|-------|------------|
| Pages | `pages/admin/AssignmentSubmissions.tsx`, `AssignmentSubmissionDetail.tsx` (+ mentor) |
| View | `components/shared/course-detail-manage/CourseAssignment*` |
| Hooks | `hooks/course-detail/use-course-assignment-*` |
| Presenter / VM | `lib/course-detail/course-assignment-*-presenter.ts`, `*-view-model.ts` |
| Mapper | `lib/course-detail/staff-submission-mapper.ts` |
| Services | `services/lesson-assignment-submission.ts`, `lesson-attendance.ts` |
| Validator | `lib/validator/lesson-assignment/`, `lesson-attendance/` |
| Types | `lib/types/features/course-detail-assignments.ts` |

**Pola penilaian & feedback (1 endpoint BE):**

- Simpan nilai: kirim `score_percent` + `passed` + `feedback` existing
- Simpan feedback: kirim `feedback` baru + `score_percent`/`passed` existing
- Feedback **menimpa** field sebelumnya (bukan thread multi-reply)

---

## Validator (selaras BE)

| Parser | Schema | Service |
|--------|--------|---------|
| `parseLessonAssignmentUpsertRequest` | `assignment.schema.ts` | `lesson-assignment-admin.ts` |
| `parseLessonAssignmentSubmissionInput` | `submission.schema.ts` | `lesson-assignment.ts` |
| `parseGradeStaffSubmissionPayload` | `grade.schema.ts` | `lesson-assignment-submission.ts` |
| `parseUpdateAttendancePayload` | `attendance.schema.ts` | `lesson-attendance.ts` |

Aturan kunci:

- Assignment title max **200** char (varchar BE)
- File submission max **10 MB**
- `score_percent` 0–100, dibulatkan 3 desimal
- Attendance status: `present` \| `late` \| `absent` \| `excused`
- UID path: full UUID atau prefix hex ≥4 (`beResolvableUidSchema`)

---

## Keputusan FE ↔ BE

| Topik | Keputusan |
|-------|-----------|
| Profil penilai | BE hanya `graded_by_uid` — FE resolve profil dari session user jika UID cocok |
| Relasi `graded_by` di entity | **Tidak** ditambah di BE (permintaan eksplisit user) |
| Modal penilaian | Dihapus — diganti inline panel |
| Roster variant card/KPI | Dihapus — **tabel saja** |
| Feedback multi-reply | Tidak — selaras 1 field `feedback` di BE |

---

## Yang Belum (lihat todo-backlog.md)

- Profil penilai lengkap untuk penilai lain → butuh BE preload user grader
- Tab Kehadiran: create absen manual, input note, akses mentor
- `GET /submissions/:uid` — FE pakai data dari list
- `mentor/CourseAssignments` route terpisah masih mock
- `student/Assignments` aggregate masih mock

---

## Draft Commit Message

```
feat(course-detail): tab tugas staff, roster submission, penilaian inline, dan validator assignment
```
