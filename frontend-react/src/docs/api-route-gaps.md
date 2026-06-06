# Gap Route & Endpoint API

Dokumen ini memetakan **endpoint yang dibutuhkan halaman FE** vs **route yang benar-benar ada di backend** (`backend/internal/handler/routes/`).

Format: `🔴` = belum ada di BE · `🟡` = ada tapi kontrak tidak cocok · `✅` = tersedia

---

## 1. Course (Kursus)

| Kebutuhan FE | Method | Path FE (`api-path.ts`) | Status BE | Halaman terdampak |
|--------------|--------|-------------------------|-----------|-------------------|
| Update metadata kursus | `PUT` | `/courses/:uid` | 🔴 **Tidak ada route** | `CourseFormDialog` edit, `admin/DetailCourse`, `mentor/DetailCourse` |
| Hapus kursus | `DELETE` | — (belum dideklarasikan) | 🔴 | `ManageCourse` — tidak ada tombol delete, tapi kebutuhan admin umum |
| List kursus | `GET` | `/courses` | ✅ | `admin/Courses`, `landing/Course`, `student/Browse` |
| Detail kursus | `GET` | `/courses/:uid` | ✅ | Semua detail page |
| Buat kursus | `POST` | `/courses` | ✅ (admin only) | `CreateCourseDialog` |
| Publish / aktifkan | `PATCH` | `/courses/:uid/status` | ✅ | `DetailCourseComponents` |
| Assign mentor | `POST` | `/courses/:uid/mentors/assign` | ✅ | `AssignCourseMentorDialog` |
| **Unassign mentor** | — | — | 🔴 | `CourseMentorTable` tombol "Lepas" tanpa handler |
| List peserta | `GET` | `/courses/:uid/students` | ✅ | `admin/DetailCourse` |
| Progress enrollment | `GET` | `/courses/:uid/progress` | ✅ (ada di BE) | Belum dipakai halaman manapun |
| Join kursus | `POST` | `/courses/:uid/join` | ✅ | Public detail (belum diverifikasi di semua flow) |
| Buat review | `POST` | `/courses/:uid/review` | ✅ | Public detail review form |
| Reply review | `POST` | `/courses/:uid/review/:reviewUid/reply` | ✅ (ada) | `DetailCourseComponents` — **handler masih `console.log`** |
| List mentor kursus | `GET` | `/courses/:uid/mentor` | ✅ | — |
| Filter by kategori | query `course_category_id` | `/courses?...` | 🟡 BE **tidak baca** param ini | `courses/detail.tsx` popular courses |

### Rekomendasi endpoint baru (Course)

```
PUT    /courses/:id              — multipart, mirror PostAdminCourseFunc (partial update)
DELETE /courses/:id              — soft/hard delete, admin only
POST   /courses/:id/mentors/unassign  — body: { mentor_uids: string[] }
GET    /courses?category_uid=...  — filter by category (atau dokumentasikan param yang benar)
```

---

## 2. User Management

| Kebutuhan FE | Method | Path | Status BE | Catatan |
|--------------|--------|------|-----------|---------|
| List user terkelola | `GET` | `/user/manage/all` | ✅ | `admin/Student`, `Mentors`, `Admin` |
| Ubah role | `PATCH` | `/user/role/:id` | ✅ | Body: `{ role: admin\|mentor\|student }` |
| Hapus user | `DELETE` | `/user/manage/:id` | ✅ | Tidak bisa hapus diri sendiri |
| Detail user by uid | `GET` | `/user/:id` | ✅ | Belum dipakai halaman (bisa untuk detail drawer) |
| **Invite / create user** | — | — | 🔴 | UI promote hanya ubah role user existing |
| **List super_admin** | `GET` | `?role=super_admin` | 🟡 | FE kirim filter ini di types, tapi halaman admin pakai `role=admin` |

### Keterbatasan BE yang mempengaruhi FE

- Hanya `super_admin` yang boleh assign role `admin` → admin biasa akan dapat 403 saat promote ke admin
- `super_admin` tidak bisa di-assign via `PATCH /user/role/:id`
- Filter `role=admin` di SQL tidak mencakup `super_admin` → halaman Administrator tidak lengkap

---

## 3. Course Master (Kategori & Tipe)

| Kebutuhan FE | Method | Path | Status BE | Halaman |
|--------------|--------|------|-----------|---------|
| CRUD kategori | `GET/POST/PUT/DELETE` | `/course-categories` | ✅ | `admin/CourseCategories` |
| CRUD tipe | `GET/POST/PUT/DELETE` | `/course-types` | ✅ | `admin/CourseTypes` |

Tidak ada gap route signifikan. Validasi FE sudah di `lib/validator/course-master/`.

---

## 4. Module & Lesson (Kurikulum)

| Kebutuhan FE | Method | Path | Status BE | Halaman |
|--------------|--------|------|-----------|---------|
| CRUD module | `POST/PUT/DELETE/GET` | `/modules`, `/modules/course/:id` | ✅ | `admin/CourseEdit`, `mentor/CourseEdit` |
| CRUD lesson | `POST/PUT/DELETE/GET` | `/lessons` | ✅ | Editor kurikulum |
| Mark lesson read | `POST` | `/lessons/:id/read` | ✅ | `courses/view.tsx` (perlu verifikasi wire) |
| Attendance | `POST/GET` | `/lessons/attendances/*` | ✅ | Belum ada halaman khusus |

---

## 5. Assignment & Submission

| Kebutuhan FE | Method | Path | Status BE | Halaman |
|--------------|--------|------|-----------|---------|
| CRUD assignment per lesson | `POST/PUT/DELETE/GET` | `/lessons/:id/assignment` | ✅ | `mentor/CourseAssignments` — **belum di-wire** |
| Submission siswa | `POST/PUT/GET` | `/lessons/:id/assignment/submission` | ✅ | `student/Assignments` — **mock** |
| List submission (staff) | `GET` | `/lessons/:id/assignment/submissions` | ✅ | Mentor assignments — **mock** |
| Grade submission | `PUT` | `.../submissions/:uid/grade` | ✅ | Mentor assignments — **mock** |
| **List assignment per course** | — | — | 🔴 | FE butuh aggregate per course, BE hanya per lesson |

### Rekomendasi endpoint baru (Assignment)

```
GET /courses/:courseUid/assignments           — semua assignment dalam kursus (denormalized untuk halaman mentor)
GET /students/me/assignments                — semua tugas siswa lintas kursus (halaman student/Assignments)
```

---

## 6. Payment & Transaksi

| Kebutuhan FE | Method | Path FE | Status BE | Masalah |
|--------------|--------|---------|-----------|---------|
| List semua transaksi (admin) | `GET` | `/payment` | 🟡 **Bukan list** | BE `GetPaymentFunc` wajib `?reference=` atau `?enrollmentId=` |
| Detail payment | `GET` | `/payment?reference=` | ✅ | — |
| Buat payment | `POST` | `/payment/create` | ✅ | — |
| Tripay detail | `GET` | `/payment/tripay` | ✅ | — |
| Callback webhook | `POST` | `/payment/callback` | ✅ | Tanpa auth (webhook) |
| Metode pembayaran | `GET/POST` | `/payment/method` | ✅ | Admin set method |

### Halaman terdampak

- `admin/Transactions.tsx` — mock penuh
- `admin/Dashboard.tsx` — recent transactions kosong
- `admin/Financial.tsx` — tidak terkait payment service
- `student/Transactions.tsx` — pakai `transaction_history` dari `GET /user/data` (bukan `/payment`)

### Rekomendasi endpoint baru (Payment)

```
GET /admin/transactions?page=&per_page=&status=&search=
GET /admin/transactions/summary          — KPI + ratio paid/pending/failed + timeline
GET /admin/financial/summary             — revenue 12 bulan, by category, by source
```

---

## 7. Dashboard & Analytics

| Kebutuhan FE | Endpoint | Status BE | Halaman |
|--------------|----------|-----------|---------|
| KPI admin | — | 🔴 | `admin/Dashboard` |
| Support tickets | — | 🔴 | `UnresolvedTickets` |
| KPI mentor | — | 🔴 | `mentor/Dashboard` |
| Jadwal mentor | — | 🔴 | `mentor/Dashboard` CalendarView |
| Financial charts | — | 🔴 | `admin/Financial` |

---

## 8. Reviews & Q&A Moderation

| Kebutuhan FE | Endpoint | Status BE | Halaman |
|--------------|----------|-----------|---------|
| List reviews lintas kursus | — | 🔴 | `admin/ReviewsQA` (unregistered) |
| List Q&A threads | — | 🔴 | `admin/ReviewsQA` |
| Moderasi hide/delete | — | 🔴 | — |
| Reply review (admin) | `POST` | `/courses/:id/review/:reviewUid/reply` | ✅ ada, FE belum wire |
| Buat review | `POST` | `/courses/:id/review` | ✅ | Public course detail |

**Catatan PM:** Domain Q&A (forum/thread) **belum ada sama sekali** di backend. Yang ada hanya course review + reply.

---

## 9. Auth — Password Recovery

| Kebutuhan FE | Endpoint | Status BE | Halaman |
|--------------|----------|-----------|---------|
| Forgot password (kirim email) | — | 🔴 | `auth/ForgotPass.tsx` |
| Reset password (token) | — | 🔴 | `auth/ResetPass.tsx` |

---

## 10. Certificates

| Kebutuhan FE | Endpoint | Status BE | Halaman |
|--------------|----------|-----------|---------|
| List sertifikat user | — | 🔴 | `student/Certificates.tsx` |
| Download / share sertifikat | — | 🔴 | UI share ke `/certificate/:uid` — route public juga tidak ada |

---

## 11. Route Frontend yang Tidak Terdaftar

| Path (`lib/routes.ts`) | File page | Masalah |
|------------------------|-----------|---------|
| `/admin/reviews-and-qa` | `admin/ReviewsQA.tsx` | Di-**comment** di `App.tsx` baris 30 |
| `/certificate/:uid` | — | Direferensikan `CertificatesSection` tapi tidak ada di `App.tsx` |
| `/admin/security/audit-logs` | — | Link dari dashboard, tidak ada page maupun route |

---

## 12. Endpoint FE Sudah Dideklarasikan tapi Jarang/Tidak Dipakai

| Path | Keterangan |
|------|------------|
| `GET /mentor/all` | Public list mentor — landing belum konsumsi |
| `GET /mentor/:id` | Detail mentor publik |
| `GET /user/:uid` | Detail user — admin belum buka drawer detail |
| `GET /courses/:uid/progress` | Progress enrollment |
| `GET /lessons/readings/my-history` | Riwayat baca siswa |
| `GET /lessons/attendances/my-history` | Riwayat absensi siswa |
| `GET /invoices/:enrollmentUid` | Invoice enrollment |

---

## Diagram Relasi (ringkas)

```mermaid
flowchart LR
  subgraph fePages [Halaman FE]
    AdminTx[admin/Transactions]
    AdminFin[admin/Financial]
    MentorDetail[mentor/DetailCourse]
    StudentAssign[student/Assignments]
    Certs[student/Certificates]
    Forgot[auth/ForgotPass]
  end

  subgraph beExists [BE Sudah Ada]
    UserManage[GET /user/manage/all]
    CourseCRUD[GET POST /courses]
    LessonAssign[/lessons/:id/assignment]
    UserData[GET /user/data]
  end

  subgraph beMissing [BE Belum Ada]
    PutCourse[PUT /courses/:id]
    Unassign[POST mentors/unassign]
    AdminTxAPI[GET /admin/transactions]
    FinancialAPI[GET /admin/financial]
    CertAPI[Certificate API]
    ForgotAPI[Forgot/Reset Password]
    QnAAPI[Q&A Threads API]
  end

  AdminTx -.->|butuh| AdminTxAPI
  AdminFin -.->|butuh| FinancialAPI
  MentorDetail -.->|seharusnya| CourseCRUD
  StudentAssign -.->|butuh aggregate| LessonAssign
  Certs -.->|butuh| CertAPI
  Forgot -.->|butuh| ForgotAPI
```
