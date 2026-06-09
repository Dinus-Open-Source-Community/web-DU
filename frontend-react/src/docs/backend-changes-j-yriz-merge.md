# Perubahan Backend — Merge J-yriz (`feature/backend-fajar`)

Dokumen ini merangkum **semua perubahan backend** dari **2 commit terakhir J-yriz** yang sudah di-merge ke branch `features/frontend-sapto`, beserta panduan implementasi di frontend.

**Sumber commit:**

| Commit | Tanggal | Pesan |
|--------|---------|-------|
| `d4e9fe7` | 7 Jun 2026 | `feat: permintaan sapto` |
| `b043d4e` | 9 Jun 2026 | `permintaannya sapto` |

**Envelope respons (semua endpoint):**

```json
{ "success": true, "message": "...", "data": { ... }, "error": null }
```

**Catatan UID:** middleware `ShortenUIDs` memotong UID di response menjadi **8 karakter pertama**. Path parameter tetap bisa pakai prefix 8 char.

**Testing lokal:** jalankan BE dengan `SEED=true` (lihat `.env.example`). Dokumen cURL lengkap ada di `backend/archive/gap-route.md` dan `backend/archive/assignment-submission-attempts-curl.md`.

---

## Ringkasan Cepat

| Area | Endpoint baru / berubah | Status FE saat ini |
|------|-------------------------|-------------------|
| Update kursus | `PUT /courses/:id` | ✅ Service sudah ada (`updateCourse`) |
| Hapus kursus | `DELETE /courses/:id` | 🔴 Belum di-wire |
| Unassign mentor | `POST /courses/:id/mentors/unassign` | 🔴 Belum di-wire |
| Filter katalog kursus | `GET /courses?course_category_id=...` | 🟡 Param sudah dikirim, verifikasi filter |
| Assignment per course | `GET /courses/:id/assignments` | 🔴 Halaman mentor masih mock |
| Assignment siswa lintas kursus | `GET /students/me/assignments` | 🔴 Halaman student masih pakai profil |
| GET submission siswa | `GET /lessons/:id/assignment/submission` | ✅ Mapper sudah disesuaikan (format array) |
| Peserta kursus + kehadiran | `GET /courses/:id/students` | 🟡 Field baru belum dipetakan semua |
| Profil user + assignments | `GET /user/data` → `joined_courses[].assignments` | 🟡 Dipakai student assignments (parsial) |
| Admin dashboard | `GET /admin/dashboard/*` | 🔴 Mock di `pages/admin/Dashboard.tsx` |
| Admin transaksi | `GET /admin/transactions` (+ summary) | 🔴 Mock |
| Admin financial | `GET /admin/financial/summary` | 🔴 Mock |
| Admin reviews | `GET /admin/reviews`, `POST .../reply` | 🔴 Route FE dikomentari |
| Admin Q&A | `GET /admin/qna`, `POST .../replies` | 🔴 Route FE dikomentari |
| Q&A per course | `POST /courses/:id/qna`, `POST .../replies` | 🔴 Belum di-wire |
| Mentor dashboard | `GET /mentor/dashboard/kpis`, `.../schedules` | 🔴 Mock |
| User manage filter admin | `GET /user/manage/all?role=admin` | ✅ Sekarang include `super_admin` |

---

## 1. Commit `d4e9fe7` — Update Metadata Kursus

### `PUT /courses/:id`

| | |
|---|---|
| **Auth** | Super Admin / Admin |
| **Content-Type** | `multipart/form-data` (partial update — hanya field yang dikirim yang diubah) |
| **Handler** | `UpdateAdminCourseFunc` → `backend/internal/service/course.go` |

**Field form yang didukung:**

| Field | Keterangan |
|-------|------------|
| `cover` / `thumbnail` | Upload gambar cover |
| `title` | Wajib non-kosong jika dikirim |
| `subtitle` / `header` | Alias subtitle |
| `description` | Wajib non-kosong jika dikirim |
| `slug` | Dicek unik |
| `category_uid` | UID kategori |
| `course_type_uid` / `class_type_uid` | UID tipe kelas |
| `level` | `PEMULA` \| `MENENGAH` \| `LANJUTAN` |
| `price`, `price_strike` | Angka ≥ 0 |
| `what_you_learn` | JSON array string, atau `what_you_learn[]` |
| `slot` | Integer ≥ 0 (0 = unlimited) |
| `is_premium` | Boolean |

**Tidak bisa diubah lewat endpoint ini:** `status`, `is_published` → tetap pakai `PATCH /courses/:id/status`.

**Response sukses:** `data` = objek course (sama seperti `courseResponse()`).

**Implementasi FE:**

- ✅ Sudah: `services/course.ts` → `updateCourse()`, validator `lib/validator/course-form/`, hook `useUpdateCourse()`
- Halaman: `CourseFormDialog`, `admin/DetailCourse`, `mentor/DetailCourse`

**Perubahan internal (bukan API):** entity `Lesson` — hapus method `Scan`/`Value` custom untuk JSONB (tidak mempengaruhi kontrak HTTP).

---

## 2. Commit `b043d4e` — Operasional Course

### 2.1 `DELETE /courses/:id` — Soft delete

| | |
|---|---|
| **Auth** | Super Admin / Admin |
| **Body** | Tidak ada |
| **Perilaku** | `status → TIDAK ACTIVE`, `is_published → false` (bukan hard delete) |

**Response:**

```json
{
  "data": { "uid": "a1b2c3d4", "status": "TIDAK ACTIVE" }
}
```

**Implementasi FE yang disarankan:**

1. Tambah `deleteCourse(uid)` di `services/course.ts`
2. Tambah validator minimal (UID saja)
3. Hook `useDeleteCourse()` + konfirmasi dialog di `admin/ManageCourse` atau `DetailCourse`
4. Invalidate query `courses` setelah sukses

---

### 2.2 `POST /courses/:id/mentors/unassign`

| | |
|---|---|
| **Auth** | Super Admin / Admin |
| **Body** | `{ "mentor_uids": ["uid1", "uid2"] }` |

**Response:**

```json
{
  "data": {
    "course_uid": "a1b2c3d4",
    "removed_mentor_uids": ["e5f6g7h8"]
  }
}
```

**Implementasi FE:**

1. Service `unassignMentorsFromCourse(courseUid, mentorUids)` di `services/course.ts`
2. Wire tombol **Lepas** di `CourseMentorTable` / `AssignCourseMentorDialog`
3. Invalidate `courses/:uid/mentor` setelah sukses

---

### 2.3 `GET /courses` — Filter diperkaya

Query param baru yang **sekarang dibaca BE**:

| Param FE | Alias BE | Contoh |
|----------|----------|--------|
| `course_category_id` | `category_uid` | `?course_category_id=abc12345` |
| `course_type_id` | `class_type_id` | `?course_type_id=def67890` |
| `status` | — | `ACTIVE`, dll. |
| `sort_by`, `sort_order` | — | `sort_by=price&sort_order=asc` |

**Implementasi FE:** verifikasi filter di `landing/Course`, `student/Browse`, `admin/Courses` — param sudah ada di service, pastikan hasil filter benar setelah merge.

---

### 2.4 `GET /courses/:id/students` — Field kehadiran baru

Tiap item di `data.enrollments[]` sekarang menyertakan:

```ts
interface CourseEnrollmentStudent {
  enrollment_uid: string
  student_uid: string
  student_name: string
  student_avatar_url?: string
  enrolled_at: string
  progress: number        // 0.0–1.0
  status: string
  attendance_present: number   // ← BARU
  attendance_total: number     // ← BARU (jumlah lesson di kursus)
  last_active_at?: string      // ← BARU (MAX lesson_reads.read_at)
}
```

**Implementasi FE:**

| Target | File yang perlu disentuh |
|--------|--------------------------|
| Tab Kehadiran / roster siswa admin | `use-course-attendance-data.ts`, mapper enrollment |
| `AttendanceBar` di kartu kursus | Map `attendance_present` → `student_attendance_present` (nama field FE saat ini berbeda) |
| Mentor detail course (mock attendance) | `pages/mentor/DetailCourse.tsx` — ganti hardcode dengan data API |

---

### 2.5 `GET /courses/:id/assignments` — Daftar tugas per kursus

| | |
|---|---|
| **Auth** | Admin / Mentor yang di-assign ke kursus |
| **Query** | `page`, `per_page` (max 100), `status` (`DRAFT` \| `TERBIT` \| `DITUTUP`) |

**Response:**

```ts
interface CourseAssignmentsResponse {
  assignments: Array<{
    uid: string
    lesson_uid: string
    lesson_title: string
    lesson_order_index: number
    module_uid: string
    module_title: string
    module_order_index: number
    course_uid: string
    course_title: string
    meeting_number: number      // alias lesson_order_index
    title: string
    task_type: 'text' | 'quiz' | 'hybrid'
    status: string
    deadline_at: string
    allow_file_submission: boolean
    allow_plain_text_submission: boolean
    allow_rich_text_submission: boolean
    require_file_description: boolean
    auto_close_after_deadline: boolean
    allow_resubmit: boolean
    max_resubmit_count: number | null
    submission_count: number    // total submission semua siswa
  }>
  meta: { total, per_page, current_page, total_pages }
}
```

**Implementasi FE:**

1. Service baru: `services/course-assignments.ts` (atau extend `services/course.ts`)
2. Hook: `useCourseAssignments(courseUid)`
3. Ganti mock di `pages/mentor/CourseAssignments.tsx` — saat ini masih hardcode `IMentorCourseAssignment[]`
4. **Alternatif:** halaman legacy bisa di-deprecate karena tab Tugas di detail course (`CourseDetailAssignmentsTab`) sudah live via lesson-level API

---

## 3. Assignment & Submission

### 3.1 `GET /students/me/assignments` — Tugas siswa lintas kursus

| | |
|---|---|
| **Auth** | Student only |
| **Route file** | `backend/internal/handler/routes/student.go` (**baru**) |
| **Query** | `page`, `per_page` (max 100) |

**Response:**

```ts
interface StudentMyAssignmentsResponse {
  assignments: Array<{
    course_uid: string
    course_title: string
    assignment: { /* sama seperti course assignments list item */ }
    latest_submission: {
      uid: string
      attempt_count: number
      score_percent: number | null
      passed: boolean | null
      is_auto_graded: boolean
      submitted_at: string
      graded_at: string | null
    } | null
  }>
  meta: { total, per_page, current_page, total_pages }
}
```

Hanya assignment berstatus **`TERBIT`** dari kursus yang di-enroll (status enrollment: pending/active/completed).

**Implementasi FE:**

| Langkah | Detail |
|---------|--------|
| 1 | Buat `services/student-assignments.ts` + `GET /students/me/assignments` |
| 2 | Mapper ke `StudentAssignmentSectionItem` (ganti `mapJoinedCourseAssignments`) |
| 3 | Hook `useStudentMyAssignments()` dengan TanStack Query |
| 4 | Update `pages/student/Assignments.tsx` — saat ini baca `profile.joined_courses[].assignments` via `useStudentAssignmentItems` |

> **Catatan:** `GET /user/data` juga mengembalikan `joined_courses[].assignments`, tapi hanya submission yang **sudah ada**. Endpoint `/students/me/assignments` lebih lengkap (termasuk tugas belum dikerjakan).

---

### 3.2 `GET /lessons/:id/assignment/submission` — **BREAKING CHANGE**

**Sebelum:** `data` = satu objek submission + grading flat.

**Sesudah:** `data` = wrapper dengan array attempt:

```json
{
  "lesson_uid": "fda62f5d",
  "assignment_uid": "170bef64",
  "submission_uid": "7c5b9436",
  "total_attempts": 2,
  "latest_attempt_number": 2,
  "max_attempts": 4,
  "submissions": [
    {
      "uid": "attempt-uid",
      "attempt_number": 1,
      "submitted_at": "2026-06-04T09:00:00Z",
      "plain_text": "...",
      "rich_text": null,
      "file_url": "",
      "file_original_filename": "",
      "file_description": "",
      "quiz_answers": null,
      "grading": {
        "score_percent": 100,
        "passed": true,
        "feedback": "...",
        "has_feedback": true,
        "is_graded": true,
        "graded_at": "2026-06-04T09:28:57Z",
        "is_auto_graded": false,
        "quiz_correct_count": null,
        "quiz_question_count": null
      }
    }
  ]
}
```

**POST/PUT submission** — **tidak berubah**: masih return entity `row` langsung di `data` (bukan wrapper array).

**Entity baru:** `lesson_assignment_submission_attempts` — setiap resubmit menambah baris attempt; GET mengembalikan semua attempt.

**Implementasi FE:**

| Status | File |
|--------|------|
| ✅ Sudah | `lib/lesson-assignment/mappers.ts` — `extractSubmissionPayload()` ambil attempt terbaru |
| 🟡 Opsional | `lib/lesson-assignment/submission-history.ts` — tampilkan semua attempt di UI riwayat, bukan hanya 1 baris |
| 🟡 Opsional | Tampilkan `max_attempts` / sisa attempt di `LessonAssignmentWork` |

---

### 3.3 Staff submission — tidak berubah

Route berikut **sudah ada sebelumnya** dan tetap sama (sudah di-wire di tab Tugas staff):

- `GET /lessons/:id/assignment/submissions`
- `GET /lessons/:id/assignment/submissions/:submissionUid`
- `PUT /lessons/:id/assignment/submissions/:submissionUid/grade`

---

## 4. Profil User — `joined_courses[].assignments`

Di `GET /user/data` (dan profil student), setiap item `joined_courses[]` sekarang punya:

```ts
assignments: Array<{
  submission_uid: string
  attempt_count: number
  score_percent: number | null
  passed: boolean | null
  is_auto_graded: boolean
  submitted_at: string
  graded_at: string | null
  assignment: { uid, title, status, task_type, deadline_at }
  lesson: { uid, title, order_index }
  module: { uid, title, order_index }
}>
```

**Implementasi FE:**

- Type sudah ada: `lib/types/data/enrollment-assignment.ts` (`IJoinedCourseAssignmentEntry`)
- Mapper sudah ada: `lib/student-assignments/map-joined-course-assignments.ts`
- Dashboard/Learning section bisa pakai data ini untuk kartu tugas ringkas

---

## 5. Route Admin Baru

**Route file baru:** `backend/internal/handler/routes/admin.go`  
**Auth:** Admin / Super Admin (JWT)

### 5.1 Dashboard

| Method | Path | Query | Response `data` |
|--------|------|-------|-----------------|
| `GET` | `/admin/dashboard/kpis` | `period`: `7d` \| `30d` \| `90d` \| `12m` | Array `AdminKpi[]` — **cocok dengan** `components/Admin/Dashboard/Kpi.tsx` |
| `GET` | `/admin/dashboard/recent-transactions` | `limit` (default 5) | Array `TransactionHistoryItem[]` |

**Bentuk KPI (contoh):**

```json
{
  "id": "gross-revenue",
  "label": "Gross Revenue",
  "value": "Rp128.750.000",
  "trendValue": 12.4,
  "trendDirection": "up",
  "trendLabel": "30 hari terakhir",
  "iconName": "revenue"
}
```

**Implementasi FE:** ganti mock di `pages/admin/Dashboard.tsx` — kontrak sudah didokumentasikan di `routes-pages/admin-request-response.md`.

> 🔴 `GET /admin/dashboard/support-tickets` — **sengaja tidak diimplementasikan** di BE.

---

### 5.2 Transaksi

| Method | Path | Query |
|--------|------|-------|
| `GET` | `/admin/transactions` | `page`, `per_page`, `status`, `search`, `date_from`, `date_to` |
| `GET` | `/admin/transactions/summary` | — |

**Response `GET /admin/transactions`:**

```ts
{
  transactions: TransactionHistoryItem[]
  meta: { current_page, per_page, total, total_pages }
  summary: {
    grossRevenue: number
    paidCount: number
    pendingCount: number
    failedCount: number
  }
}
```

**Implementasi FE:** `pages/admin/Transactions.tsx` + `components/Admin/Transactions/*` — masih mock.

---

### 5.3 Financial

| Method | Path |
|--------|------|
| `GET` | `/admin/financial/summary` |

**Response `data`:**

```ts
{
  kpis: AdminKpi[]
  monthlyRevenue: Array<{ label: string; value: number }>
  revenueByCategory: Array<{ label: string; value: number }>
  revenueSource: Array<{ label: string; value: number; color: string }>
}
```

> `revenueSource` masih placeholder (100% Website) — belum ada kolom sumber penjualan di DB.

**Implementasi FE:** `pages/admin/Financial.tsx` — masih mock.

---

### 5.4 Reviews (moderasi admin)

| Method | Path | Body / Query |
|--------|------|--------------|
| `GET` | `/admin/reviews` | `courseUid`, `rating`, `has_reply`, `page`, `per_page` |
| `POST` | `/admin/reviews/:review_id/reply` | `{ "comment": "..." }` |

**Item review:**

```ts
{
  uid: string
  courseUid: string
  studentUid: string
  courseTitle: string
  studentName: string
  studentAvatar: string
  rating: number
  comment: string
  createdAt: string
  reply?: { author: string; comment: string; createdAt: string }
}
```

**Implementasi FE:**

- Uncomment route `ReviewsQA` di `App.tsx`
- Buat `services/admin-reviews.ts` + halaman `pages/admin/ReviewsQA.tsx`

---

### 5.5 Q&A (moderasi admin)

| Method | Path | Body / Query |
|--------|------|--------------|
| `GET` | `/admin/qna` | `courseUid`, `status` (`answered` \| `unanswered`), `page`, `per_page` |
| `POST` | `/admin/qna/:thread_id/replies` | `{ "body": "..." }` |

**Entity baru:** `course_qa_threads`, `course_qa_replies`

**Implementasi FE:** sama seperti reviews — service + halaman admin.

---

## 6. Q&A per Course (Student / Mentor)

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/courses/:id/qna` | Student terdaftar | `{ "title": "...", "body": "..." }` |
| `POST` | `/courses/:id/qna/:thread_id/replies` | Student / Mentor / Admin | `{ "body": "..." }` |

**Implementasi FE:** belum ada UI — bisa ditambahkan di tab diskusi detail course publik atau halaman Q&A terpisah.

---

## 7. Mentor Dashboard

| Method | Path | Query |
|--------|------|-------|
| `GET` | `/mentor/dashboard/kpis` | — |
| `GET` | `/mentor/dashboard/schedules` | `from`, `to` (tanggal, opsional) |

**Response KPI (`data`):**

```ts
{
  pendingGrading: number    // submission teks belum dinilai
  unansweredQA: number      // thread Q&A tanpa balasan staff
  activeStudents: number
  totalCourses: number
}
```

**Response jadwal (`data` — array):**

```ts
Array<{
  uid: string           // lesson_uid
  courseId: string
  courseName: string
  scheduleDate: string  // YYYY-MM-DD
  scheduleTime: string  // HH:MM
  endTime: string
  location: string
  classType: string
  studentCount: number
}>
```

Sumber jadwal: `lessons.start_time` / `end_time` dari kursus yang di-assign ke mentor.

**Implementasi FE:** ganti mock di `pages/mentor/Dashboard.tsx` — type `IMentorStats` dan `IScheduleItem` sudah cocok.

---

## 8. User Management — Perbaikan Kecil

`GET /user/manage/all?role=admin` sekarang **menyertakan** user ber-role `super_admin` (sebelumnya hanya `admin` literal).

**Implementasi FE:** halaman `pages/admin/Admin.tsx` — tidak perlu perubahan query, daftar administrator akan lebih lengkap.

---

## 9. Seeder & Data Dummy Baru

Commit `b043d4e` memperkaya `backend/internal/database/seeder.go`:

- Transaksi pembayaran contoh (`TRX-SEED-...`)
- Review kursus (≥ 7 item)
- Thread Q&A (≥ 5 item)
- Submission multi-attempt untuk testing

**Kredensial seed:**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@doscom.id` | `superadmin123` |
| Admin | `admin@doscom.id` | `admin123` |
| Student | `budi@doscom.id` / `siti@doscom.id` | `student123` |
| Mentor | `andi.mentor@doscom.id` | `mentor123` |

---

## 10. Checklist Implementasi FE (Prioritas)

Urutan disarankan setelah merge:

### P0 — Sudah / kritis

- [x] `PUT /courses/:id` — sudah di-wire
- [x] Parser GET submission format array attempt — `mappers.ts`

### P1 — Halaman utama masih mock

- [ ] `GET /students/me/assignments` → `student/Assignments.tsx`
- [ ] `GET /courses/:id/assignments` → `mentor/CourseAssignments.tsx` (atau deprecate halaman)
- [ ] `POST /courses/:id/mentors/unassign` → tombol Lepas mentor
- [ ] `DELETE /courses/:id` → hapus/nonaktifkan kursus admin
- [ ] Map `attendance_present` / `attendance_total` di roster & `AttendanceBar`

### P2 — Admin analytics

- [ ] `GET /admin/dashboard/kpis` + `recent-transactions`
- [ ] `GET /admin/transactions` + summary
- [ ] `GET /admin/financial/summary`
- [ ] `GET/POST /admin/reviews`
- [ ] `GET/POST /admin/qna`

### P3 — Mentor & fitur tambahan

- [ ] `GET /mentor/dashboard/kpis` + `schedules`
- [ ] `POST /courses/:id/qna` + replies (student-facing)
- [ ] UI riwayat multi-attempt di module viewer assignment

---

## 11. File Backend Kunci (Referensi)

| Area | Path |
|------|------|
| Update/delete course | `backend/internal/service/course.go` |
| Unassign mentor | `backend/internal/service/mentor.go` |
| Course assignments | `backend/internal/service/course_assignments.go` |
| Student routes | `backend/internal/handler/routes/student.go` |
| Admin routes | `backend/internal/handler/routes/admin.go` |
| Submission attempts | `backend/internal/service/lesson_assignment_submission_attempt.go` |
| GET my submission | `backend/internal/service/lesson_assignment_submission.go` |
| Admin dashboard | `backend/internal/service/admin_dashboard.go` |
| Admin transactions | `backend/internal/service/admin_transactions.go` |
| Admin financial | `backend/internal/service/admin_financial.go` |
| Admin reviews | `backend/internal/service/admin_reviews.go` |
| Admin Q&A | `backend/internal/service/admin_qna.go` |
| Course Q&A | `backend/internal/service/course_qna.go` |
| Mentor dashboard | `backend/internal/service/mentor_dashboard.go` |
| User assignments di profil | `backend/internal/service/user.go` |
| Swagger | `backend/docs/swagger.yaml` |

---

## 12. Yang Masih Belum Ada di BE

| Kebutuhan | Status |
|-----------|--------|
| `GET /admin/dashboard/support-tickets` | 🔴 Tidak diimplementasikan (sengaja) |
| Invite / create user admin | 🔴 Tidak ada |
| Objek `graded_by` lengkap di submission | 🔴 Hanya `graded_by_uid` |
| `student_attendance_*` di `joined_courses` profil | 🔴 Hanya di `GET /courses/:id/students` |

---

*Terakhir diperbarui: 9 Juni 2026 — setelah merge `d3759e3` + fix mapper `84c0dd9`.*
