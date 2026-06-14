# Gap Payload Request & Response

Ketidakselarasan antara **apa yang dikirim/diharapkan FE** vs **kontrak aktual BE**.

Validator FE terbaru ada di `lib/validator/` — dokumen ini fokus pada gap yang masih menyebabkan error runtime atau data kosong di UI.

---

## Legenda Severity

| Level | Arti |
|-------|------|
| **P0** | Menyebabkan API gagal / fitur tidak jalan |
| **P1** | API sukses tapi UI salah/kosong |
| **P2** | Field opsional / UX degraded |

---

## 1. Course — Update Metadata

### Request FE

```ts
// services/course.ts → PUT /courses/:uid
// multipart/form-data via buildUpdateCourseFormData()
{
  title, subtitle, description, category_uid, course_type_uid,
  level, price, price_strike?, what_you_learn, slot?, is_premium?, cover?
}
```

| Field | Validator FE | Validator BE (create) | Gap |
|-------|--------------|----------------------|-----|
| `title` | wajib, max 200 | wajib | — |
| `subtitle` | opsional, max 255 | opsional (fallback `header`) | — |
| `description` | wajib | wajib | — |
| `level` | `PEMULA\|MENENGAH\|LANJUTAN` | sama | FE mock mentor kadang kirim `Beginner` — salah |
| `what_you_learn` | array string JSON | boleh kosong `[]` | FE lebih strict (item tidak boleh string kosong) |
| `is_published` | tidak dikirim saat update | — | Benar — status lewat endpoint terpisah |

**P0:** Endpoint `PUT /courses/:id` **belum ada** — seluruh payload update tidak sampai ke BE.

---

## 2. Course — Assign Mentor

### Request

```json
{ "mentor_uids": ["abc12345", "def67890"] }
```

| Aturan | BE (`dto.AssignMentorsToCourseRequest`) | FE (`course-mentor.schema`) | Status |
|--------|----------------------------------------|----------------------------|--------|
| Min 1 UID | ✅ `binding:"required,min=1"` | ✅ | Selaras |
| UID format | `ResolveUID` — UUID atau hex prefix ≥4 | ✅ `beResolvableUidSchema` | Selaras |
| Role assignee | Harus `mentor` atau `admin` di DB | Tidak divalidasi di FE | BE yang menolak |
| Duplikat | BE dedupe silently | FE tolak duplikat | FE lebih strict — OK |

### Response error BE

```json
{
  "message": "Some assignees are invalid...",
  "data": { "invalid_mentor_uids": ["..."] }
}
```

FE belum mem-parse `invalid_mentor_uids` untuk pesan spesifik per UID.

---

## 3. Course — Peserta (Students)

### Response BE (`GET /courses/:id/students`)

```json
{
  "enrollments": [{
    "enrollment_uid": "...",
    "student_uid": "...",
    "student_name": "...",
    "student_avatar_url": "...",
    "enrolled_at": "...",
    "progress": 75,
    "status": "active"
  }],
  "meta": { "page", "per_page", "total", "total_pages" }
}
```

### Yang diharapkan komponen UI

| Field UI | Sumber | Gap |
|----------|--------|-----|
| `student_name`, `progress`, `status` | ✅ dari BE | — |
| `student_attendance_present` | `AttendanceBar` | **P1** — tidak ada di BE |
| `student_attendance_total` | `AttendanceBar` | **P1** — tidak ada di BE |
| `progressPercent` | Mock mentor page | **P1** — field lama, diganti `progress` |
| `lastActiveLabel` | Mock mentor page | **P1** — tidak ada di BE |
| `email` | Mock mentor page | **P2** — BE tidak expose email di endpoint students |

**Dampak:** Tab "Peserta" di admin menampilkan progress, tetapi **bar kehadiran selalu salah** (membaca field undefined → fallback `0/1`).

**Rekomendasi BE:** Tambahkan ke response enrollment:

```json
{
  "attendance_present": 10,
  "attendance_total": 12,
  "last_active_at": "2026-06-01T10:00:00Z"
}
```

---

## 4. User Management

### `GET /user/manage/all` — Query params

| Param FE | Validator FE | BE | Gap |
|----------|--------------|-----|-----|
| `page` | int ≥1 | default 1 jika invalid | Selaras |
| `per_page` | int 1–100 | cap 100 | Selaras |
| `role` | `student\|mentor\|admin\|super_admin` | filter SQL `role = ?` | **P1** `super_admin` ≠ `admin` |
| `search` | max 200 char | trim, in-memory jika ada search | Selaras |
| `sort` | `created_at\|name` | `name` fallback ke `created_at` | **P2** sort by name tidak meaningful di BE |
| `order` | `asc\|desc` | default `desc` | Selaras |

### `PATCH /user/role/:id` — Body

```json
{ "role": "mentor" }
```

| Aturan BE | Dampak FE |
|-----------|-----------|
| Hanya `super_admin` boleh set `admin` | Admin biasa klik "Jadikan admin" → 403 |
| Tidak bisa assign `super_admin` | Tidak ada opsi di UI — OK |
| Target admin/super_admin hanya bisa diubah oleh super_admin | — |

### Response mapping — field yang di-zero di FE

| Field UI (`AdminStudent`, dll.) | Sumber BE | Gap |
|--------------------------------|-----------|-----|
| `totalSpent` | — | **P2** selalu `0` di mapper |
| `totalCourses` (mentor) | — | **P2** selalu `0` |
| `rating`, `totalReviews` | — | **P2** selalu `0` |
| `enrolledCourses` | `enrollments.length` dari list | ✅ jika BE preload enrollments di list |

**Konfirmasi BE:** `GET /user/manage/all` sudah `Preload("Enrollments")` — kolom `enrolledCourses` dan `averageProgress` di FE bisa terisi. Field `totalSpent` tetap tidak ada di response.

---

## 5. Profile — Ganti Password

### BE (`dto.ChangePasswordRequest`)

```json
{
  "old_password": "required",
  "new_password": "required"
}
```

### FE (`profile/Section.tsx` + `changePasswordPayloadSchema`)

```json
{
  "new_password": "..."
}
```

| Gap | Severity |
|-----|----------|
| `old_password` tidak dikirim | **P0** — BE akan reject 400 |
| Form tidak punya input password lama | **P0** — UX belum lengkap |

---

## 6. Course List — Query Params

### FE (`IQueryParamsPayload` / hooks)

```ts
// useCourseDetailWithCategories — popular courses
{ course_category_id: categoryUid, per_page: 5 }

// Potensi param lain di api-path
{ sort_by, sort_order, course_type_id, class_type_id, status }
```

### BE (`GetAllCoursesFunc`) — hanya membaca:

```
page, per_page, mentor_id, title, price, is_premium
```

| Param FE | Dibaca BE? | Severity |
|----------|------------|----------|
| `course_category_id` | ❌ | **P1** — popular courses tidak terfilter kategori |
| `course_type_id` / `class_type_id` | ❌ | **P2** |
| `sort_by` / `sort_order` | ❌ | **P2** |
| `status` | ❌ | **P2** — filter Aktif/Draf di admin purely client-side |

---

## 7. Payment

### FE `fetchPayments()` — `GET /payment` tanpa query

### BE `GetPaymentFunc` — wajib salah satu:

```
?reference=TRX-xxx
?enrollmentId=uuid-prefix
```

**P0:** Panggilan FE akan selalu **400 Bad Request** jika dipakai sebagai list endpoint.

### Student transactions — sumber alternatif

`GET /user/data` → `transaction_history[]` — **ini yang benar-benar dipakai** `student/Transactions.tsx`.

Field yang diharapkan UI:

```ts
{
  uid, reference, payment_status, payment_method,
  course: { title, uid, cover_url },
  amount?, created_at?
}
```

Perlu audit apakah bentuk `transaction_history` di BE match `TransactionHistory` type di FE.

---

## 8. Course Master (Kategori / Tipe)

### Create — selaras ✅

```json
{ "name": "Web Development", "description": "...", "is_active": true }
```

### Update — selaras ✅

```json
{ "name": "...", "description": "...", "is_active": false }
```

BE menolak `name: ""` jika field name dikirim.

---

## 9. Lesson / Module — Editor Kurikulum

Validator FE: `lib/validator/lessons/`

| Payload | Status integrasi |
|---------|------------------|
| Create lesson | ✅ wired di `services/lessons.ts` |
| Update lesson | ✅ |
| Rich text content | ✅ strict schema |
| YouTube URL | ✅ regex selaras BE |

Tidak ada gap payload signifikan — yang kurang adalah **halaman mentor assignments** belum memanggil API.

---

## 10. Level & Status — Inkonsistensi Enum

| Konteks | Nilai dipakai | Seharusnya (BE) |
|---------|---------------|-----------------|
| API create/update | `PEMULA`, `MENENGAH`, `LANJUTAN` | ✅ |
| Mock mentor detail | `Beginner`, `active` | ❌ salah |
| `CourseStatus` type FE | `DRAFT`, `PUBLISHED` | BE pakai `DRAFT`, `ACTIVE`, `TIDAK ACTIVE` |
| Publish check UI | `isCoursePublished()` baca `status` + `is_published` | Perlu dokumentasi single source of truth |

---

## 11. Reviews

### Create review (student)

Endpoint: `POST /courses/:id/review` — perlu audit body di BE (rating, comment).

### Reply (mentor/admin)

Endpoint: `POST /courses/:id/review/:reviewUid/reply`

FE `DetailCourseComponents.tsx`:

```ts
const handleReplyReview = (reviewUid, comment) => {
  console.log(...) // P0 — belum memanggil API
}
```

---

## 12. Auth Register/Login

Sudah selaras dengan `lib/validator/auth.schema.ts`. Tidak ada gap signifikan.

---

## Ringkasan Tabel Prioritas Payload

| # | Gap | Severity | Owner saran |
|---|-----|----------|-------------|
| 1 | `PUT /courses/:id` tidak ada | P0 | BE |
| 2 | Password change tanpa `old_password` | P0 | FE + BE (sudah benar di BE) |
| 3 | `GET /payment` bukan list | P0 | BE + FE |
| 4 | Attendance fields di students response | P1 | BE |
| 5 | `course_category_id` query diabaikan BE | P1 | BE |
| 6 | Reply review tidak di-wire | P1 | FE |
| 7 | `super_admin` tidak di list administrator | P1 | BE atau FE filter |
| 8 | User list tanpa aggregate mentor/student stats | P2 | BE |
| 9 | Level/status enum mock pages | P2 | FE |
