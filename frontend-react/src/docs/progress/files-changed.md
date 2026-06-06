# Files Changed — Peta Perubahan

Referensi cepat untuk reviewer: file apa saja yang **ditambah** atau **dimodifikasi signifikan** selama sesi integrasi.

> Catatan: branch juga memuat perubahan course-edit besar dari sebelum sesi. Bagian bawah merangkum file **khusus sesi integrasi admin/validator/docs**.

---

## File Baru

### User Management

| File | Peran |
|------|-------|
| `lib/user-manage/types.ts` | Kontrak API & domain types |
| `lib/user-manage/mappers.ts` | Map response → AdminStudent/Mentor/Administrator |
| `lib/user-manage/view-models.ts` | Row tabel & promote candidates |
| `lib/user-manage/page-config.ts` | Konfigurasi per halaman (copy, role targets) |
| `lib/user-manage/layout.ts` | Design tokens layout |
| `services/user-manage.ts` | HTTP gateway + validator |
| `hooks/use-managed-users.ts` | Query list users |
| `hooks/use-user-manage-mutations.ts` | Mutations role & delete |
| `hooks/use-admin-user-page.ts` | State pagination + search per halaman |
| `components/admin/user-manage/UserManagePageShell.tsx` | Shell halaman |
| `components/admin/user-manage/UserManagePanel.tsx` | Panel tabel utama |
| `components/admin/user-manage/UserManageRoleDialog.tsx` | Dialog ubah role |
| `components/admin/user-manage/UserPromoteDialog.tsx` | Dialog promote |
| `components/admin/user-manage/user-manage-columns.tsx` | Kolom tabel |
| `components/admin/user-manage/UserIdentityCell.tsx` | Sel identitas user |
| `components/admin/user-manage/UserStatusBadge.tsx` | Badge status |

### Course Mentor

| File | Peran |
|------|-------|
| `lib/course-mentor/types.ts` | Payload assign mentor |
| `components/shared/AssignCourseMentorDialog.tsx` | UI assign |

### Validator (domain baru)

| File | Peran |
|------|-------|
| `lib/validator/user-manage.schema.ts` | Schema Zod user manage |
| `lib/validator/user-manage/index.ts` | Parse helpers |
| `lib/validator/course-master.schema.ts` | Schema kategori/tipe |
| `lib/validator/course-master/index.ts` | Parse helpers |
| `lib/validator/course-mentor.schema.ts` | Schema assign mentor |
| `lib/validator/course-mentor/index.ts` | Parse helpers |
| `lib/validator/course-form.schema.ts` | Schema create/update course |
| `lib/validator/course-form/index.ts` | Parse helpers |

### Dokumentasi

| File | Peran |
|------|-------|
| `docs/README.md` | Indeks gap |
| `docs/page-coverage.md` | Matriks halaman |
| `docs/api-route-gaps.md` | Gap endpoint |
| `docs/payload-gaps.md` | Gap payload |
| `docs/priority-backlog.md` | Backlog PM |
| `docs/progress/*` | Progress report (folder ini) |

---

## File Dimodifikasi Signifikan

### Pages

| File | Perubahan |
|------|-----------|
| `pages/admin/Student.tsx` | Mock → `useAdminUserPage` + `UserManagePanel` |
| `pages/admin/Mentors.tsx` | Mock → live + promote dialog |
| `pages/admin/Admin.tsx` | Mock → live + promote ke admin |
| `pages/admin/DetailCourse.tsx` | Sudah live — wired assign mentor via child components |
| `pages/admin/Courses.tsx` | `useCourses()` live |
| `pages/admin/CourseCategories.tsx` | Course master panel live |
| `pages/admin/CourseTypes.tsx` | Course master panel live |

### Services

| File | Perubahan |
|------|-----------|
| `services/user-manage.ts` | Baru — fetch, update role, delete |
| `services/course.ts` | + assignMentors, + validator pada create/update/status |
| `services/course-master.ts` | + validator pada CRUD |

### Components

| File | Perubahan |
|------|-----------|
| `components/shared/DetailCourseComponents.tsx` | Assign mentor dialog, publish status |
| `components/shared/CourseMentorTable.tsx` | Tabel mentor + tombol Lepas (belum wired) |
| `components/shared/AdminDataTable.tsx` | Footer pagination terintegrasi |
| `components/shared/Pagination.tsx` | + `className` prop |
| `components/shared/course-form/CourseFormDialog.tsx` | Validator Zod menggantikan inline validate |
| `components/shared/Sidebar.tsx` | SidebarInset, min-w-0 |
| `components/ui/sidebar.tsx` | Breakpoint md → lg |

### Hooks & Config

| File | Perubahan |
|------|-----------|
| `hooks/use-course-mutations.ts` | + `useAssignMentorsToCourse` |
| `hooks/query-keys.ts` | + userManageKeys |
| `hooks/use-mobile.ts` | Breakpoint 768 → 1024 |
| `lib/course-master/validation.ts` | Delegasi ke Zod validator |
| `lib/validator/common.ts` | + UID, pagination, image schemas |
| `lib/validator/index.ts` | Export domain baru |
| `tsconfig.app.json` | Hapus baseUrl & ignoreDeprecations |
| `.vscode/settings.json` | + typescript.tsdk |

---

## File Dihapus

| File | Alasan |
|------|--------|
| `components/admin/user-manage/UserManageNav.tsx` | Redundan dengan sidebar navigation |

---

## File Legacy (masih ada, tidak dipakai)

Reviewer boleh flag untuk cleanup di PR terpisah:

| File |
|------|
| `components/Admin/Student/Table.tsx` |
| `components/Admin/Mentors/Table.tsx` |
| `components/Admin/Administrators/table.tsx` |
| `components/Admin/shared/UserManageActions.tsx` |

---

## Statistik Diff (perkiraan branch)

| Kategori | Perkiraan |
|----------|-----------|
| File staged (seluruh branch) | ~85 files |
| Lines added | ~3500+ |
| Lines removed | ~750+ |
| Domain baru (lib/) | user-manage, course-mentor, validator domains |
| Pages admin live | 7 |

*Angka dari snapshot git di awal sesi — berubah seiring commit berikutnya.*
