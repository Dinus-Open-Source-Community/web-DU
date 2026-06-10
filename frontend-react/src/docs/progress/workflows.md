# Workflows — Alur Fitur yang Sudah Diimplementasikan

Diagram alur untuk QA dan reviewer. Setiap workflow menjelaskan **siapa**, **dari mana**, **ke API mana**, dan **apa yang terjadi di UI**.

---

## 1. Manajemen User Admin — List & Search

**Actor:** Admin  
**Route:** `/admin/users/students` · `/admin/users/mentors` · `/admin/users/administrators`

```mermaid
sequenceDiagram
  actor Admin
  participant Page as Page (Student/Mentors/Admin)
  participant Hook as useAdminUserPage
  participant Svc as user-manage.ts
  participant Val as validator/user-manage
  participant API as BE GET /user/manage/all

  Admin->>Page: Buka halaman / ketik search
  Page->>Hook: page, search, role filter
  Hook->>Svc: fetchManagedUsers(params)
  Svc->>Val: parseManagedUserListParams()
  Val-->>Svc: validated params
  Svc->>API: GET dengan query
  API-->>Svc: { users[], meta }
  Svc-->>Hook: data
  Hook-->>Page: users + pagination meta
  Page-->>Admin: Tabel + footer "Halaman X dari Y"
```

**State di UI:**

| State | Perilaku |
|-------|----------|
| Loading awal | Shell loading sampai baris pertama muncul |
| Search | Reset ke halaman 1, debounce via submit search |
| Empty | Pesan empty state dari `page-config.ts` |
| Error | Query error — perlu reload (belum ada retry UI khusus) |

---

## 2. Ubah Role User

**Actor:** Admin  
**Trigger:** Menu aksi baris → "Ubah role" → `UserManageRoleDialog`

```mermaid
sequenceDiagram
  actor Admin
  participant Dialog as UserManageRoleDialog
  participant Mut as useUpdateManagedUserRole
  participant Svc as user-manage.ts
  participant Val as validator/user-manage
  participant API as BE PATCH /user/role/:uid

  Admin->>Dialog: Pilih role baru + konfirmasi
  Dialog->>Mut: mutateAsync({ uid, payload: { role } })
  Mut->>Svc: updateManagedUserRole(uid, payload)
  Svc->>Val: parseManagedUserUidParam + parseUpdateUserRolePayload
  Svc->>API: PATCH body { role }
  alt Sukses
    API-->>Svc: 200 user updated
    Svc-->>Mut: ok
    Mut-->>Dialog: toast sukses
    Mut->>Mut: invalidate userManage + auth session
  else 403 super_admin only
    API-->>Svc: 403
    Svc-->>Mut: Error
    Mut-->>Admin: toast error (hanya super_admin boleh assign admin)
  end
```

**Role yang valid di FE validator:** `student` · `mentor` · `admin`

---

## 3. Promote User (Siswa → Mentor / User → Admin)

**Actor:** Admin  
**Halaman:** Mentors (promote siswa) · Administrators (promote mentor/siswa)

```mermaid
flowchart TD
  A[Klik Promote] --> B[UserPromoteDialog]
  B --> C[Fetch users role sumber<br/>mis. student per_page 100]
  C --> D[Admin pilih kandidat + konfirmasi]
  D --> E[PATCH /user/role/:uid]
  E --> F{Sukses?}
  F -->|Ya| G[Toast + refresh list + tutup dialog]
  F -->|403| H[Toast: butuh super_admin untuk role admin]
```

Ini **bukan** endpoint invite terpisah — hanya PATCH role pada user yang sudah terdaftar.

---

## 4. Hapus User

**Actor:** Admin  
**Trigger:** Menu aksi → Hapus → `ConfirmDialog`

```mermaid
sequenceDiagram
  actor Admin
  participant Confirm as ConfirmDialog
  participant Mut as useDeleteManagedUser
  participant API as BE DELETE /user/manage/:uid

  Admin->>Confirm: Konfirmasi hapus
  Confirm->>Mut: mutateAsync(uid)
  Mut->>API: DELETE
  alt Sukses
    API-->>Mut: 200
    Mut->>Mut: invalidate queries
    Note over Mut: Jika halaman kosong & page>1 → page-1
  else Cannot delete self
    API-->>Admin: 400 Cannot delete your own account
  end
```

---

## 5. CRUD Kategori & Tipe Kursus

**Actor:** Admin  
**Route:** `/admin/course-categories` · `/admin/course-types`

```mermaid
flowchart LR
  subgraph UI
    Panel[CourseMasterManagementPanel]
    Form[CourseMasterFormDialog]
  end

  subgraph Service
    Svc[course-master.ts]
    Val[validator/course-master]
  end

  subgraph API
    Cat[/course-categories/]
    Type[/course-types/]
  end

  Panel -->|create/edit/delete| Form
  Form -->|validate form| Val
  Form -->|submit| Svc
  Svc -->|parse payload + uid| Val
  Svc --> Cat
  Svc --> Type
```

| Aksi | Method | Validasi FE |
|------|--------|-------------|
| Create | POST | nama wajib, max 120 char |
| Update | PUT | min 1 field, nama tidak boleh kosong |
| Delete | DELETE | UID valid |

---

## 6. Buat Kursus (Admin)

**Actor:** Admin  
**Route:** `/admin/courses` → tombol "Tambah Kursus"

```mermaid
sequenceDiagram
  actor Admin
  participant Dialog as CourseFormDialog
  participant Val as validator/course-form
  participant Svc as course.ts
  participant API as BE POST /courses

  Admin->>Dialog: Isi form + submit
  Dialog->>Val: getCourseFormValidationMessage()
  Val-->>Dialog: null = valid
  Dialog->>Svc: createCourse(payload)
  Svc->>Val: parseCreateCoursePayload()
  Svc->>Svc: buildCreateCourseFormData() multipart
  Svc->>API: POST multipart
  API-->>Admin: 201 course created
```

**Catatan:** Create hanya untuk **Super Admin / Admin** di BE. Mentor tidak punya tombol create di flow ini.

---

## 7. Edit Metadata Kursus (Partial — tunggu BE)

**Actor:** Admin  
**Trigger:** Detail course → Edit → `EditCourseDialog`

```mermaid
sequenceDiagram
  participant Dialog as EditCourseDialog
  participant Svc as course.ts
  participant API as BE PUT /courses/:uid

  Dialog->>Svc: updateCourse(uid, payload)
  Svc->>Svc: parseUpdateCoursePayload() ✅ FE
  Svc->>API: PUT multipart
  Note over API: 🔴 Route belum ada di BE
  API-->>Dialog: 404 / tidak ter-route
```

**Status QA:** Form validasi FE jalan; simpan edit metadata **gagal** sampai BE implement `PUT /courses/:id`.

---

## 8. Publish / Aktifkan Kursus

**Actor:** Admin  
**Trigger:** Detail course → Publish → `ConfirmDialog`

```mermaid
sequenceDiagram
  participant Detail as DetailCourseComponents
  participant Mut as useUpdateCourseStatus
  participant API as BE PATCH /courses/:uid/status

  Detail->>Mut: { courseUid }
  Mut->>API: PATCH tanpa body
  API-->>Detail: status → ACTIVE
  Detail->>Detail: invalidate course query
```

UI membaca publish state dari `status` + `is_published` via `isCoursePublished()`.

---

## 9. Assign Mentor ke Kursus

**Actor:** Admin  
**Tab:** Detail course → Mentor → "Assign mentor"

```mermaid
sequenceDiagram
  actor Admin
  participant Dialog as AssignCourseMentorDialog
  participant Users as GET /user/manage/all?role=mentor
  participant Mut as useAssignMentorsToCourse
  participant API as POST /courses/:uid/mentors/assign

  Admin->>Dialog: Buka dialog
  Dialog->>Users: Load mentor list
  Users-->>Dialog: Filter yang belum assigned
  Admin->>Dialog: Pilih mentor + konfirmasi
  Dialog->>Mut: { courseUid, payload: { mentor_uids } }
  Mut->>API: POST
  API-->>Dialog: mentors assigned
  Dialog-->>Admin: Toast + refresh course detail
```

**Filter FE:** Mentor yang sudah di-assign tidak muncul di daftar pilihan.

---

## 10. Editor Kurikulum (Module & Lesson)

**Actor:** Admin / Mentor  
**Route:** `/admin/courses/:uid/edit` · `/mentor/courses/:uid/edit`

```mermaid
flowchart TB
  subgraph Page
    CE[CourseEdit.tsx]
    Shell[CourseEditShell / Chrome]
    WS[CourseLessonWorkspace]
  end

  subgraph Data
    H1[useCourseEditModules]
    H2[use-course-edit-controller]
  end

  subgraph API
    M[/modules CRUD/]
    L[/lessons CRUD/]
  end

  subgraph Validation
    LV[validator/lessons]
  end

  CE --> H1
  H1 --> M
  WS --> H2
  H2 --> LV
  H2 --> L
```

**Fitur editor:** buat/rename module, buat/edit/hapus lesson, switch text/video, unsaved dialog, compact navigation mobile.

---

## 11. Validasi Payload — Pola Umum

Semua service baru mengikuti pola yang sama:

```mermaid
flowchart LR
  A[Component / Hook] --> B[Service function]
  B --> C[parse* dari lib/validator]
  C --> D{Valid?}
  D -->|Ya| E[api.get/post/patch/delete]
  D -->|Tidak| F[throw Error pesan ID]
  F --> G[Toast error di mutation hook]
```

| Domain | Parser entrypoint |
|--------|-------------------|
| User manage | `parseManagedUserListParams`, `parseUpdateUserRolePayload` |
| Course master | `parseCreateCourseMasterPayload`, `parseUpdateCourseMasterPayload` |
| Course form | `parseCreateCoursePayload`, `parseUpdateCoursePayload` |
| Course mentor | `parseAssignMentorsToCoursePayload` |
| Lesson | `parseLessonCreateRequest`, dll. (sudah ada sebelumnya) |
| Lesson assignment | `parseLessonAssignmentUpsertRequest`, `parseLessonAssignmentSubmissionInput`, `parseGradeStaffSubmissionPayload` |
| Lesson attendance | `parseUpdateAttendancePayload`, `parseCreateAttendancePayload` |

---

## 12. Tab Tugas Staff — Detail Course → Roster

**Actor:** Admin / Mentor  
**Tab:** Detail course → **Tugas**

```mermaid
sequenceDiagram
  actor Staff
  participant Tab as CourseDetailAssignmentsTab
  participant Hook as useCourseDetailAssignmentsView
  participant Svc as lesson-assignment-admin + submission
  participant API as GET assignment + submissions

  Staff->>Tab: Buka tab Tugas
  Tab->>Hook: modules + students
  Hook->>API: GET /lessons/:id/assignment (per lesson)
  Hook->>API: GET /lessons/:id/assignment/submissions
  API-->>Tab: overview + jumlah pengumpul
  Staff->>Tab: Lihat pengumpulan
  Tab-->>Staff: Roster tabel (semua siswa terdaftar)
```

---

## 13. Penilaian & Feedback Submission (Staff)

**Actor:** Admin / Mentor  
**Route:** `.../submissions/:submissionUid`

```mermaid
sequenceDiagram
  actor Staff
  participant View as CourseAssignmentSubmissionDetailView
  participant Hook as useCourseAssignmentSubmissionDetailPage
  participant Val as validator/lesson-assignment
  participant API as PUT .../grade

  Staff->>View: Buka jawaban siswa
  Staff->>View: Simpan nilai (inline)
  View->>Hook: onSubmitScore(draft)
  Hook->>Val: parseGradeStaffSubmissionPayload
  Hook->>API: PUT { score_percent, passed, feedback }
  Staff->>View: Kirim / perbarui feedback
  Hook->>API: PUT { feedback baru, score/passed existing }
  Note over API: Feedback menimpa field sebelumnya
```

**Profil penilai di feedback:** FE cocokkan `graded_by_uid` dengan user login; selain itu tampil label generik "Penilai".

---

## 14. Tab Kehadiran Admin (Partial)

**Actor:** Admin  
**Tab:** Detail course → **Kehadiran** (`adminOnly`)

```mermaid
sequenceDiagram
  actor Admin
  participant Tab as CourseDetailAttendanceTab
  participant Svc as lesson-attendance.ts
  participant API as GET/PUT/DELETE attendances

  Admin->>Tab: Pilih lesson
  Tab->>API: GET /lessons/attendances/lesson/:lesson_id
  Admin->>Tab: Ubah status / hapus record
  Tab->>Svc: parseUpdateAttendancePayload / parseAttendanceUidParam
  Svc->>API: PUT atau DELETE
```

**Belum:** `POST /lessons/attendances` (create manual), input **note** di UI, tab untuk mentor.

---

## 15. Siswa — Submit Tugas (Module Viewer)

**Actor:** Student  
**Route:** `/student/learning/course/:uid` → assignment work

```mermaid
flowchart LR
  A[LessonAssignmentWork] --> B[validateAssignmentSubmissionDraft]
  B --> C[sanitizeSubmissionPayload]
  C --> D[parseLessonAssignmentSubmissionInput]
  D --> E[POST atau PUT /assignment/submission]
```

Sudah live sebelum sesi tab staff; validator submission ditambahkan di Fase 12.

---

## 16. Arsitektur Layer (Dependency Flow)

```mermaid
flowchart TB
  subgraph presentation [Presentation Layer]
    P[pages/]
    C[components/]
  end

  subgraph application [Application Layer]
    H[hooks/]
  end

  subgraph domain [Domain Layer]
    L[lib/user-manage/]
    L2[lib/course-form/]
    L3[lib/course-master/]
    L4[lib/validator/]
  end

  subgraph infrastructure [Infrastructure Layer]
    S[services/]
    AX[axios + api-path]
  end

  P --> C
  P --> H
  C --> H
  H --> S
  H --> L
  S --> L4
  S --> AX
  L --> L4
```

**Aturan:** `services/` tidak import React. `pages/` tipis — komposisi saja.

---

## Workflow yang BELUM / PARTIAL (referensi QA)

| Workflow | Status | Lihat |
|----------|--------|-------|
| Reply review | console.log | [todo-backlog.md](./todo-backlog.md) B8 |
| Mentor list/detail course | mock | [todo-backlog.md](./todo-backlog.md) B16–B17 |
| Mentor `/assignments` route terpisah | mock | [todo-backlog.md](./todo-backlog.md) B19 |
| Siswa check-in absen | belum | [todo-backlog.md](./todo-backlog.md) C2 |
| Admin create absen manual | belum | [todo-backlog.md](./todo-backlog.md) C4 |
| Profil penilai lengkap (bukan user login) | partial | [todo-backlog.md](./todo-backlog.md) A12, D9 |
| Forgot/reset password | mock | page-coverage |
| Admin reviews & Q&A moderasi | mock | [todo-backlog.md](./todo-backlog.md) D12 |
