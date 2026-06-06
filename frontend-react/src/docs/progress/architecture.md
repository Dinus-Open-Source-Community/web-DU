# Architecture — Pola & Struktur Kode

Dokumen untuk **code reviewer**: bagaimana fitur baru diorganisir agar konsisten dengan clean architecture ringan di project ini.

---

## Prinsip yang Diterapkan

1. **Pages tipis** — `pages/admin/*.tsx` hanya komposisi shell + panel; tidak ada logic API langsung.
2. **Service = gateway API** — semua HTTP call di `services/`; validasi payload sebelum request.
3. **Domain di `lib/`** — types, mappers, view-models, validator; tanpa dependency React.
4. **Hooks = orchestration** — TanStack Query + mutations; toast & cache invalidation.
5. **Components = presentasi** — terima props/callbacks; tidak fetch langsung (kecuali shared hooks di composite components yang sudah established).

---

## Peta Folder per Fitur

### User Management

```
pages/admin/
  Student.tsx          ← root halaman siswa
  Mentors.tsx          ← root halaman mentor (+ promote)
  Admin.tsx            ← root halaman administrator (+ promote)

components/admin/user-manage/
  UserManagePageShell.tsx    ← layout + header
  UserManagePanel.tsx        ← tabel + toolbar search
  UserManageRoleDialog.tsx   ← ubah role + konfirmasi
  UserPromoteDialog.tsx      ← promote antar role
  user-manage-columns.tsx    ← definisi kolom per kind
  UserIdentityCell.tsx
  UserStatusBadge.tsx

lib/user-manage/
  types.ts             ← ManagedUserListParams, UpdateUserRolePayload, dll.
  mappers.ts           ← ManagedUserItem → AdminStudent/Mentor/Administrator
  view-models.ts       ← row shape untuk tabel + promote candidates
  page-config.ts       ← copy, label, role targets per halaman
  layout.ts            ← token spacing/typography

hooks/
  use-managed-users.ts
  use-user-manage-mutations.ts
  use-admin-user-page.ts

services/
  user-manage.ts

lib/validator/
  user-manage.schema.ts
  user-manage/index.ts
```

### Course Master (Kategori & Tipe)

```
pages/admin/
  CourseCategories.tsx
  CourseTypes.tsx

components/shared/course-master/
  CourseMasterManagementPanel.tsx
  CourseMasterFormDialog.tsx

lib/course-master/
  types.ts, mappers.ts, validation.ts → delegasi validator

hooks/
  use-course-master-list.ts
  use-course-master-mutations.ts

services/
  course-master.ts

lib/validator/
  course-master.schema.ts
```

### Course Form & Mentor Assign

```
components/shared/course-form/
  CourseFormDialog.tsx, EditCourseDialog.tsx, CreateCourse.tsx

components/shared/
  AssignCourseMentorDialog.tsx
  DetailCourseComponents.tsx
  CourseMentorTable.tsx

lib/course-form/
  types.ts, mappers.ts, build-form-data.ts, level.ts

lib/course-mentor/
  types.ts

hooks/
  use-course-mutations.ts

services/
  course.ts

lib/validator/
  course-form.schema.ts
  course-mentor.schema.ts
```

### Course Edit (Kurikulum)

```
pages/admin/CourseEdit.tsx
pages/mentor/CourseEdit.tsx

components/courses/(authorized)/
  editCourse.tsx
  curriculum/*          ← shell, outline, workspace, dialogs

hooks/
  use-course-edit-controller.ts
  use-course-edit-back-navigation.ts
  use-compact-course-edit-navigation.ts

lib/course-edit/
  types.ts, mappers.ts, persist-lesson.ts, persist-module.ts, navigation-state.ts, ...

services/
  module.ts, lessons.ts
```

---

## Data Flow Standar

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│   Page      │────▶│    Hook      │────▶│   Service   │────▶│   API    │
│  (compose)  │     │ useQuery /   │     │ + validator │     │  (BE)    │
│             │◀────│ useMutation  │◀────│             │◀────│          │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│  Component  │     │ lib/mappers  │
│  (render)   │     │ view-models  │
└─────────────┘     └──────────────┘
```

---

## Query Keys & Cache Invalidation

| Domain | Query key | Invalidate on |
|--------|-----------|---------------|
| User manage | `userManageKeys.list(params)` | update role, delete user |
| User manage | `userManageKeys.all` | semua mutation user |
| Auth session | `authKeys.session` | update role (role di sidebar bisa berubah) |
| Course | `courseKeys.detail(uid)` | assign mentor, update status |
| Course master | `courseMasterKeys.*` | create/update/delete |

---

## Validator Strategy

| Tahap | Lokasi | Kapan |
|-------|--------|-------|
| Form UX | `get*ValidationMessage()` | Sebelum submit dialog — feedback cepat |
| API boundary | `parse*()` di service | Sebelum `api.*` — hard gate |
| Batch | `validateLessonPayloadInputs()` | Multiple items — aggregate errors |

**Shared primitives** (`lib/validator/common.ts`):

- `beResolvableUidSchema` — UUID full atau prefix hex ≥4 (selaras `database.ResolveUID`)
- `paginationPageSchema`, `paginationPerPageSchema`
- `imageUploadFileSchema` — JPEG/PNG/WebP/GIF max 5MB

---

## UI Patterns yang Dipakai Ulang

| Pattern | Komponen | Dipakai di |
|---------|----------|------------|
| Data table + pagination footer | `AdminDataTable` | User manage, course master |
| Person picker | `PersonSelectionDialog` | Assign mentor, promote |
| Confirm destructive | `ConfirmDialog` | Hapus user, publish course |
| Form dialog | `*FormDialog` | Course, course master |
| Page shell + sidebar | `AppSidebarProvider` | Semua halaman authorized |

---

## Keputusan Arsitektur Penting

| Keputusan | Alasan |
|-----------|--------|
| Satu `UserManagePanel` dengan `kind` prop | Hindari duplikasi 3 tabel hampir identik |
| `page-config.ts` untuk copy/label | PM bisa review teks tanpa baca JSX |
| Mapper terpisah dari view-model | Domain shape BE ≠ kolom tabel UI |
| Validator terpisah per domain | Selaras pola `lessons/` yang sudah ada |
| Hapus `UserManageNav` | Single navigation via sidebar — kurangi confusion |
| `services/` panggil validator | Satu pintu validasi — hooks tidak duplikasi parse |

---

## Yang Sengaja Belum Di-refactor

| Area | Alasan |
|------|--------|
| `components/Admin/Student/Table.tsx` (lama) | Deprecated, tidak dipakai — bisa dihapus di cleanup |
| `mentor/DetailCourse.tsx` mock | Belum masuk scope sesi — dokumentasi di gap |
| `profile` password tanpa `old_password` | Bug/ gap terdokumentasi di payload-gaps |
