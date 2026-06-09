# Laporan Penutupan Route Gap API

Dokumen ini merangkum hasil audit dan implementasi route backend berdasarkan `frontend-react/src/docs/api-route-gaps.md` (poin 1–7), dilakukan pada sesi pengembangan backend Web-DU.

**Base URL default:** `http://localhost:8080`  
**Envelope respons:** `{ success, message, data, error }`  
**Prasyarat testing:** `SEED=true` di `.env` agar data dummy tersedia.

Dokumen cURL terkait batch sebelumnya: [`gap-route.md`](./gap-route.md).

---

## Ringkasan Eksekutif

| Area | Sebelum | Sesudah |
|------|---------|---------|
| Update metadata kursus | 🔴 | ✅ `PUT /courses/:id` |
| Hapus kursus | 🔴 | ✅ `DELETE /courses/:id` (soft-delete) |
| Unassign mentor | 🔴 | ✅ `POST /courses/:id/mentors/unassign` |
| Filter kursus by kategori | 🟡 | ✅ Query `course_category_id` / `category_uid` |
| Assignment aggregate per course | 🔴 | ✅ `GET /courses/:id/assignments` |
| Assignment aggregate siswa | 🔴 | ✅ `GET /students/me/assignments` |
| Admin transactions list | 🟡 | ✅ `GET /admin/transactions` + summary |
| Admin financial | 🔴 | ✅ `GET /admin/financial/summary` |
| Admin dashboard KPI | 🔴 | ✅ `GET /admin/dashboard/kpis` |
| Mentor dashboard KPI | 🔴 | ✅ `GET /mentor/dashboard/kpis` |
| Mentor jadwal kelas | 🔴 | ✅ `GET /mentor/dashboard/schedules` |

**Total route baru pada batch ini (handler baru):** 7 endpoint utama + perbaikan filter yang sudah ada.

---

## 1. Course (Kursus)

### Status akhir

| Kebutuhan FE | Method | Path | Status |
|--------------|--------|------|--------|
| Update metadata kursus | `PUT` | `/courses/:id` | ✅ |
| Hapus kursus | `DELETE` | `/courses/:id` | ✅ |
| List / detail / create / status / assign / unassign | — | — | ✅ |
| List peserta + attendance fields | `GET` | `/courses/:id/students` | ✅ |
| Filter by kategori / tipe / status | `GET` | `/courses?...` | ✅ |
| Assignment per course | `GET` | `/courses/:id/assignments` | ✅ |

### Route yang ditambahkan

#### `PUT /courses/:id` — Update course

- **Auth:** Super Admin / Admin
- **Content-Type:** `multipart/form-data` (partial update)
- **Handler:** `UpdateAdminCourseFunc` → `internal/service/course.go`
- **Catatan:** `status` dan `is_published` tidak diubah lewat endpoint ini; publish lewat `PATCH /courses/:id/status`

#### `DELETE /courses/:id` — Soft-delete course

- **Auth:** Super Admin / Admin
- **Handler:** `DeleteAdminCourseFunc` → `internal/service/course.go`
- **Perilaku:** `status → TIDAK ACTIVE`, `is_published → false` (bukan hard delete)

#### `GET /courses/:id/assignments` — List assignment dalam kursus

- **Auth:** Admin / Mentor (assigned)
- **Handler:** `GetCourseAssignmentsFunc` → `internal/service/course_assignments.go`
- **Query:** `page`, `per_page`, `status` (DRAFT | TERBIT | DITUTUP)

### Perbaikan existing (sudah ada sebelum batch terakhir)

- `POST /courses/:id/mentors/unassign` — body `{ "mentor_uids": ["..."] }`
- `GET /courses` — filter `course_category_id`, `category_uid`, `course_type_id`, `class_type_id`, `status`, `sort_by`, `sort_order`

### Contoh cURL

```bash
# Update course (multipart)
curl -s -X PUT "$BASE_URL/courses/$COURSE_UID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "title=Judul Baru" \
  -F "description=Deskripsi baru" | jq

# Soft-delete course
curl -s -X DELETE "$BASE_URL/courses/$COURSE_UID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# List assignments dalam kursus (mentor/admin)
curl -s "$BASE_URL/courses/$COURSE_UID/assignments?per_page=20" \
  -H "Authorization: Bearer $MENTOR_TOKEN" | jq
```

---

## 2. User Management

### Status akhir

| Kebutuhan FE | Status | Catatan |
|--------------|--------|---------|
| `GET /user/manage/all` | ✅ | Tidak diubah |
| `PATCH /user/role/:id` | ✅ | Tidak diubah |
| `DELETE /user/manage/:id` | ✅ | Tidak diubah |
| `GET /user/:id` | ✅ | Tidak diubah |
| Filter `role=admin` include `super_admin` | ✅ | Sudah diperbaiki di `GetAllUsersService` |
| Invite / create user | 🔴 | **Belum** — tidak ada kontrak API di FE |

---

## 3. Course Master (Kategori & Tipe)

Semua route CRUD sudah tersedia di `/course-categories` dan `/course-types`. **Tidak ada perubahan** pada batch ini.

---

## 4. Module & Lesson (Kurikulum)

Semua route CRUD module, lesson, read, attendance sudah tersedia. **Tidak ada perubahan** pada batch ini.

---

## 5. Assignment & Submission

### Status akhir

| Kebutuhan FE | Method | Path | Status |
|--------------|--------|------|--------|
| CRUD assignment per lesson | — | `/lessons/:id/assignment` | ✅ |
| Submission siswa | — | `/lessons/:id/assignment/submission` | ✅ |
| List / grade submission (staff) | — | `.../submissions` | ✅ |
| List assignment per course | `GET` | `/courses/:id/assignments` | ✅ **baru** |
| List assignment lintas kursus (siswa) | `GET` | `/students/me/assignments` | ✅ **baru** |

### Route yang ditambahkan

#### `GET /students/me/assignments`

- **Auth:** Student only
- **Handler:** `GetStudentMyAssignmentsFunc` → `internal/service/course_assignments.go`
- **Route file:** `internal/handler/routes/student.go` (**file baru**)
- **Data:** Assignment berstatus `TERBIT` dari kursus yang di-enroll + `latest_submission` jika ada

### Contoh cURL

```bash
export STUDENT_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@doscom.id","password":"student123"}' | jq -r '.data.token')

curl -s "$BASE_URL/students/me/assignments?per_page=20" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

---

## 6. Payment & Transaksi

### Status akhir

| Kebutuhan FE | Method | Path | Status |
|--------------|--------|------|--------|
| List transaksi admin | `GET` | `/admin/transactions` | ✅ |
| Summary transaksi | `GET` | `/admin/transactions/summary` | ✅ **baru** |
| Financial analytics | `GET` | `/admin/financial/summary` | ✅ |
| Detail payment user | `GET` | `/payment?reference=` | ✅ |
| `GET /payment` sebagai list admin | — | — | 🟡 **Tidak diubah** — FE admin harus pakai `/admin/transactions` |

### Route yang ditambahkan

#### `GET /admin/transactions/summary`

- **Auth:** Admin / Super Admin
- **Handler:** `GetAdminTransactionsSummaryFunc` → `internal/service/admin_transactions.go`
- **Response `data`:**

```json
{
  "grossRevenue": 2500000,
  "paidCount": 9,
  "pendingCount": 1,
  "failedCount": 1
}
```

### Contoh cURL

```bash
curl -s "$BASE_URL/admin/transactions?per_page=10&status=success" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.summary'

curl -s "$BASE_URL/admin/transactions/summary" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

curl -s "$BASE_URL/admin/financial/summary" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

---

## 7. Dashboard & Analytics

### Status akhir — Admin

| Kebutuhan FE | Path | Status |
|--------------|------|--------|
| KPI admin | `GET /admin/dashboard/kpis` | ✅ |
| Recent transactions | `GET /admin/dashboard/recent-transactions` | ✅ |
| Financial charts | `GET /admin/financial/summary` | ✅ |
| Support tickets | `GET /admin/dashboard/support-tickets` | 🔴 **Belum** (sengaja di-skip) |

### Status akhir — Mentor

| Kebutuhan FE | Path | Status |
|--------------|------|--------|
| KPI mentor | `GET /mentor/dashboard/kpis` | ✅ **baru** |
| Jadwal mentor | `GET /mentor/dashboard/schedules` | ✅ **baru** |

### Route mentor dashboard (baru)

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| `GET` | `/mentor/dashboard/kpis` | JWT (mentor+) | `GetMentorDashboardKPIsFunc` |
| `GET` | `/mentor/dashboard/schedules` | JWT (mentor+) | `GetMentorDashboardSchedulesFunc` |

**File:** `internal/service/mentor_dashboard.go`  
**Route:** `internal/handler/routes/mentor.go` — `/dashboard/*` didaftarkan **sebelum** `GET /mentor/:id`

#### Response KPI (`data`)

```json
{
  "pendingGrading": 3,
  "unansweredQA": 2,
  "activeStudents": 45,
  "totalCourses": 4
}
```

| Field | Sumber data |
|-------|-------------|
| `totalCourses` | Kursus aktif di-assign ke mentor (`mentor_uid` atau `course_mentors`) |
| `activeStudents` | Enrollment berstatus `ACTIVE` |
| `pendingGrading` | Submission tugas teks belum dinilai (`graded_at` null, bukan auto-grade) |
| `unansweredQA` | Thread Q&A tanpa balasan staff |

#### Response jadwal (`data` — array)

```json
[
  {
    "uid": "<lesson_uid>",
    "courseId": "<course_uid>",
    "courseName": "Golang Fundamentals",
    "scheduleDate": "2026-06-10",
    "scheduleTime": "09:00",
    "endTime": "11:00",
    "location": "Online",
    "classType": "online",
    "studentCount": 28
  }
]
```

**Sumber:** `lessons.start_time` / `end_time` dari kursus mentor.

**Query params jadwal:**

| Param | Default | Keterangan |
|-------|---------|------------|
| `from` | — | Filter tanggal awal (`YYYY-MM-DD` atau RFC3339) |
| `to` | — | Filter tanggal akhir |
| `include_past` | `false` | Sertakan jadwal lampau |
| `limit` | `50` | Maks 100 |

### Contoh cURL mentor dashboard

```bash
export MENTOR_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"andi.mentor@doscom.id","password":"mentor123"}' | jq -r '.data.token')

curl -s "$BASE_URL/mentor/dashboard/kpis" \
  -H "Authorization: Bearer $MENTOR_TOKEN" | jq

curl -s "$BASE_URL/mentor/dashboard/schedules?limit=10" \
  -H "Authorization: Bearer $MENTOR_TOKEN" | jq
```

---

## Daftar File yang Diubah / Ditambahkan

| File | Perubahan |
|------|-----------|
| `internal/service/course.go` | `UpdateAdminCourseFunc`, `DeleteAdminCourseFunc`, `applyCourseListFilters` |
| `internal/service/course_assignments.go` | **Baru** — `GetCourseAssignmentsFunc`, `GetStudentMyAssignmentsFunc` |
| `internal/service/admin_transactions.go` | `GetAdminTransactionsSummaryFunc` |
| `internal/service/mentor_dashboard.go` | **Baru** — `GetMentorDashboardKPIsFunc`, `GetMentorDashboardSchedulesFunc` |
| `internal/handler/routes/course.go` | `PUT`, `DELETE`, `GET /:id/assignments` |
| `internal/handler/routes/student.go` | **Baru** — `GET /students/me/assignments` |
| `internal/handler/routes/admin.go` | `GET /transactions/summary` |
| `internal/handler/routes/mentor.go` | `GET /dashboard/kpis`, `GET /dashboard/schedules` |

---

## Checklist Verifikasi Manual

Jalankan setelah `SEED=true` dan backend running:

| # | Endpoint | Harapan |
|---|----------|---------|
| 1 | `PUT /courses/:id` (admin token, multipart) | `200`, `data.title` terupdate |
| 2 | `DELETE /courses/:id` (admin token) | `200`, `data.status` = `TIDAK ACTIVE` |
| 3 | `GET /courses/:id/assignments` (mentor token) | `data.assignments` array |
| 4 | `GET /students/me/assignments` (student token) | `200`; non-student → `403` |
| 5 | `GET /admin/transactions/summary` (admin token) | `data.paidCount` ≥ 0 |
| 6 | `GET /mentor/dashboard/kpis` (mentor token) | 4 field KPI |
| 7 | `GET /mentor/dashboard/schedules` (mentor token) | Array jadwal dari `lessons.start_time` |
| 8 | `GET /courses?course_category_id=...` | Hanya kursus kategori tersebut |

---

## Gap yang Masih Terbuka (di luar scope batch ini)

| Area | Item | Alasan |
|------|------|--------|
| User | Invite / create user | Tidak ada kontrak API di FE |
| Admin | Support tickets | Domain belum ada di schema |
| Payment | `GET /payment` sebagai list | FE admin sudah diarahkan ke `/admin/transactions` |
| Poin 8+ | Reviews moderation, forgot password, certificates, Q&A forum | Diabaikan sesuai instruksi |

---

## Integrasi Frontend (belum di-wire)

Halaman FE yang masih mock dan perlu dihubungkan ke endpoint baru:

| Halaman | Endpoint yang dibutuhkan |
|---------|--------------------------|
| `mentor/Dashboard.tsx` | `GET /mentor/dashboard/kpis`, `GET /mentor/dashboard/schedules` |
| `mentor/CourseAssignments.tsx` | `GET /courses/:uid/assignments` |
| `student/Assignments.tsx` | `GET /students/me/assignments` |
| `admin/Transactions.tsx` | `GET /admin/transactions` |
| `admin/Financial.tsx` | `GET /admin/financial/summary` |
| `admin/Dashboard.tsx` | `GET /admin/dashboard/kpis`, `GET /admin/dashboard/recent-transactions` |
| `EditCourseDialog` | `PUT /courses/:uid` |

---

## Kredensial Seed (referensi)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@doscom.id` | `superadmin123` |
| Admin | `admin@doscom.id` | `admin123` |
| Student | `budi@doscom.id` | `student123` |
| Mentor | `andi.mentor@doscom.id` | `mentor123` |

**Course slug contoh:** `golang-fundamentals`, `web-development-nextjs`, `database-design-sql`

---

*Dibuat: Juni 2026 — batch penutupan route gap API (poin 1–7 `api-route-gaps.md`)*
