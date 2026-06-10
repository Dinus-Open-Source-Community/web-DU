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
| `lib/validator/lesson-assignment/*.ts` | Schema upsert, submission, grade |
| `lib/validator/lesson-attendance/*.ts` | Schema update/create attendance |

### Publish & Hapus Kursus (Fase 16)

| File | Peran |
|------|-------|
| `lib/course-detail/publish-state.ts` | `isCoursePublished()` — logika status selaras BE |
| `services/course.ts` | + `deleteCourse()`, dokumentasi `updateCourseStatus` |
| `services/api-path.ts` | + `courses.deleteByUid` |
| `hooks/use-course-mutations.ts` | + `useDeleteCourse()` |
| `hooks/course-detail/use-course-detail-manage-view.ts` | Flow publish + hapus + dialog |
| `lib/course-detail/course-detail-manage-view-model.ts` | Props delete di view model |
| `components/shared/DetailCourseComponents.tsx` | Dialog hapus + wire header/mobile |
| `components/shared/course-detail-manage/CourseDetailManageHeader.tsx` | Tombol Terbit (draft) + Hapus |
| `components/shared/course-detail-manage/CourseDetailMobileActions.tsx` | Menu Terbit/Hapus mobile |
| `lib/landing/featured-courses.ts` | Filter kursus terbit via `isCoursePublished()` |
| `backend/internal/service/course.go` | `ActivateCourseStatusFunc` set `is_published=true` |

### Detail User Admin (Fase 14)

| File | Peran |
|------|-------|
| `lib/user-manage/user-detail-*.ts` | Types, mapper, presenter, navigation, layout |
| `hooks/use-managed-user-detail.ts`, `use-admin-user-detail-page.ts` | Data + page controller |
| `hooks/use-user-detail-section.ts` | Navigasi section SegmentedFilter |
| `components/admin/user-manage/UserDetailView.tsx` | Shell halaman detail |
| `components/admin/user-manage/user-detail/*` | Header, stats, filter, cards, progress bar |
| `pages/admin/*Detail.tsx` | Route detail siswa/mentor/administrator |

### Tab Tugas Staff & Penilaian (sesi Juni 2026)

| File | Peran |
|------|-------|
| `pages/admin/AssignmentSubmissions.tsx` | Roster pengumpulan |
| `pages/admin/AssignmentSubmissionDetail.tsx` | Detail jawaban + penilaian |
| `pages/mentor/AssignmentSubmissions.tsx` | Sama untuk mentor |
| `pages/mentor/AssignmentSubmissionDetail.tsx` | Sama untuk mentor |
| `components/shared/course-detail-manage/CourseDetailAssignmentsTab.tsx` | Tab Tugas |
| `components/shared/course-detail-manage/CourseAssignmentRosterView.tsx` | Roster tabel |
| `components/shared/course-detail-manage/CourseAssignmentSubmissionDetailView.tsx` | Layout detail |
| `components/shared/course-detail-manage/StaffSubmissionInlineGradePanel.tsx` | Penilaian inline |
| `components/shared/course-detail-manage/StaffSubmissionFeedbackSection.tsx` | Feedback timpa |
| `components/shared/course-detail-manage/CourseDetailAttendanceTab.tsx` | Tab Kehadiran admin |
| `hooks/course-detail/use-course-*-assignment*.ts` | View-model hooks |
| `lib/course-detail/course-assignment-*.ts` | Presenter, navigation, mapper |
| `services/lesson-assignment-submission.ts` | List submission + grade |
| `services/lesson-attendance.ts` | Attendance CRUD partial |

### Detail Pembayaran Siswa / Tripay (Fase 17)

| File | Peran |
|------|-------|
| `lib/transactions/payment-types.ts` | Domain types (`PaymentDetail`, `PaymentInstruction`, dll.) |
| `lib/transactions/payment-api-types.ts` | Kontrak API Tripay (`TripayPaymentApiEnvelope`, `PaymentDetailQuery`) |
| `lib/transactions/map-tripay-payment-detail.ts` | Mapper response Tripay → `PaymentDetail` |
| `lib/transactions/map-tripay-status.ts` | Map status string Tripay → `PaymentStatus` |
| `lib/transactions/format-payment-method.ts` | Format label metode pembayaran |
| `lib/transactions/parse-tripay-timestamp.ts` | Parse Unix/ISO timestamp dari Tripay |
| `lib/transactions/unwrap-tripay-response.ts` | Unwrap envelope Tripay |
| `lib/transactions/build-payment-detail-query.ts` | Build query params dari URL search params |
| `lib/transactions/present-transaction-payment-detail.ts` | Presenter detail + enrichment dari profil |
| `lib/transactions/present-payment-invoice-view.ts` | Invoice view model untuk UI |
| `lib/transactions/to-tripay-merchant-ref.ts` | Konversi enrollment UID → merchant ref |
| `lib/transactions/filter-transactions.ts` | Filter + paginate transaksi (diekstrak dari TransactionsSection) |
| `lib/transactions/build-course-image-map.ts` | Map course images dari profil user |
| `lib/transactions/find-transaction-by-reference.ts` | Cari transaksi dari `reference` |
| `lib/transactions/find-transaction-by-enrollment.ts` | Cari transaksi dari `enrollment_uid` |
| `hooks/use-payment-detail.ts` | Query Tripay payment detail |
| `hooks/use-student-transactions-view-model.ts` | View model TransactionsSection (diekstrak) |
| `components/student/transactions/TransactionPaymentDetailView.tsx` | UI detail pembayaran lengkap |
| `components/student/transactions/TransactionPaymentLink.tsx` | Link "Detail" di tabel transaksi |
| `components/student/transactions/PaymentDetailSkeleton.tsx` | Loading skeleton |
| `pages/student/TransactionPayment.tsx` | Route page halaman detail pembayaran |

### Profil Penilai (refactor)

| File | Peran |
|------|-------|
| `lib/course-detail/staff-grader-directory.ts` | Diekstrak sebagai modul terpisah |
| `hooks/course-detail/use-submission-grader-profile.ts` | Hook resolve profil penilai dari directory |

### Admin Dashboard, Transaksi & Financial (Fase 18)

| File | Peran |
|------|-------|
| `services/admin-dashboard.ts` | KPI, recent transactions, financial summary, popular courses |
| `services/admin-transactions.ts` | List transaksi admin + meta pagination |
| `hooks/use-admin-dashboard.ts` | Query bundle dashboard admin |
| `hooks/use-admin-transactions.ts` | View model halaman transaksi (filter, pagination, chart) |
| `hooks/use-admin-financial.ts` | Query financial summary |
| `components/Admin/Dashboard/DashboardError.tsx` | Error state + retry (shared admin & mentor) |
| `components/Admin/Dashboard/PeriodSelector.tsx` | Filter periode KPI |
| `components/Admin/Dashboard/QuickLinks.tsx` | Shortcut navigasi admin |
| `pages/admin/Dashboard.tsx` | Mock → live API |
| `pages/admin/Transactions.tsx` | Mock → live API |
| `pages/admin/Financial.tsx` | Mock → live API |
| `components/Admin/Dashboard/Kpi.tsx` | Wire props loading dari hook |
| `components/Admin/Dashboard/RecentTransactions.tsx` | Wire props loading dari hook |
| `components/Admin/Transactions/TransDashboard.tsx` | Terima data dari `useAdminTransactions` |

### Mentor Dashboard (Fase 19)

| File | Peran |
|------|-------|
| `services/mentor-dashboard.ts` | `fetchMentorDashboardKpis`, `fetchMentorDashboardSchedules` + mapper |
| `hooks/use-mentor-dashboard.ts` | React Query KPI + jadwal |
| `pages/mentor/Dashboard.tsx` | Mock → live API; skeleton + error retry |

### Dokumentasi

| File | Peran |
|------|-------|
| `docs/README.md` | Indeks gap |
| `docs/page-coverage.md` | Matriks halaman |
| `docs/api-route-gaps.md` | Gap endpoint |
| `docs/payload-gaps.md` | Gap payload |
| `docs/priority-backlog.md` | Backlog PM |
| `docs/progress/*` | Progress report (folder ini) |
| `docs/progress/todo-backlog.md` | TODO & gap FE vs BE |
| `docs/progress/assignment-staff-session.md` | Sesi tab Tugas staff |

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
| `pages/admin/Dashboard.tsx` | Mock → `useAdminDashboard` (Fase 18) |
| `pages/admin/Transactions.tsx` | Mock → `useAdminTransactions` (Fase 18) |
| `pages/admin/Financial.tsx` | Mock → `useAdminFinancial` (Fase 18) |
| `pages/mentor/Dashboard.tsx` | Mock → `useMentorDashboard` (Fase 19) |

### Services

| File | Perubahan |
|------|-----------|
| `services/user-manage.ts` | Baru — fetch, update role, delete |
| `services/course.ts` | + assignMentors, + validator pada create/update/status |
| `services/course-master.ts` | + validator pada CRUD |
| `services/payment.ts` | + `fetchTripayPaymentDetail()` via `GET /payment/tripay` |
| `services/admin-dashboard.ts` | Baru — admin KPI, financial, recent transactions |
| `services/admin-transactions.ts` | Baru — list transaksi admin |
| `services/mentor-dashboard.ts` | Baru — mentor KPI + jadwal |

### Components

| File | Perubahan |
|------|-----------|
| `components/shared/DetailCourseComponents.tsx` | Assign mentor, publish, dialog hapus kursus |
| `components/shared/CourseMentorTable.tsx` | Tabel mentor + unassign live |
| `components/shared/CardMentor.tsx` | Badge Terbit/Draft via `isCoursePublished()` |
| `components/courses/(authorized)/curriculum/CourseEditChrome.tsx` | Tombol Terbit hanya draft |
| `components/shared/AdminDataTable.tsx` | Footer pagination terintegrasi |
| `components/shared/Pagination.tsx` | + `className` prop |
| `components/shared/course-form/CourseFormDialog.tsx` | Validator Zod menggantikan inline validate |
| `components/shared/Sidebar.tsx` | SidebarInset, min-w-0 |
| `components/ui/sidebar.tsx` | Breakpoint md → lg |
| `components/student/TransactionsSection.tsx` | Refactor ke view model hook; label UI bahasa Indonesia; tombol Invoice → TransactionPaymentLink |
| `components/admin/user-manage/UserDetailPageShell.tsx` | `children` prop opsional |

### Hooks & Config

| File | Perubahan |
|------|-----------|
| `hooks/use-course-mutations.ts` | + assign/unassign, `useDeleteCourse`, publish toast |
| `hooks/query-keys.ts` | + userManageKeys, paymentKeys, adminDashboardKeys, adminTransactionsKeys, mentorDashboardKeys |
| `hooks/use-mobile.ts` | Breakpoint 768 → 1024 |
| `hooks/course-detail/use-course-assignments-overview.ts` | `assignments` dibungkus `useMemo` |
| `hooks/course-detail/use-course-assignment-submission-detail-page.ts` | Hapus import `buildStaffGraderDirectory` tidak terpakai |
| `lib/course-master/validation.ts` | Delegasi ke Zod validator |
| `lib/validator/common.ts` | + UID, pagination, image schemas |
| `lib/validator/index.ts` | Export domain baru |
| `lib/variant.tsx` | + varian badge `outline` |
| `lib/routes.ts` | + `ROUTES.student.transactionPayment()` dengan query builder |
| `tsconfig.app.json` | Hapus baseUrl & ignoreDeprecations |
| `.vscode/settings.json` | + typescript.tsdk |

---

## File Dihapus

| File | Alasan |
|------|--------|
| `components/admin/user-manage/UserManageNav.tsx` | Redundan dengan sidebar navigation |
| `services/invoice.ts` | File kosong — tidak terpakai; diganti `fetchTripayPaymentDetail` di `services/payment.ts` |

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
| File staged (seluruh branch) | ~100+ files |
| Lines added | ~4000+ |
| Lines removed | ~850+ |
| Domain baru (lib/) | user-manage, course-mentor, validator, transactions |
| Pages admin live | 10 |
| Pages mentor live (baru) | `Dashboard` +1 |
| Pages student live (baru) | `TransactionPayment` +1 |

*Angka dari snapshot git di awal sesi — berubah seiring commit berikutnya.*
