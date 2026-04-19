# API route map (backend Web DU)

**Konvensi:** semua path relatif terhadap host server (mis. `http://localhost:8080`).  
**Envelope:** lihat [response-envelope.md](./response-envelope.md).

---

## Ringkasan cepat

| Grup | Base path | Auth |
|------|-----------|------|
| Login / register | `/login`, `/register` | Tidak |
| OAuth Google | `/oauth/google/*` | Tidak (redirect) |
| User | `/user/*` | JWT |
| Avatar | `/avatar` | JWT |
| Courses | `/courses/*` | JWT |
| Invoices | `/invoices/*` | JWT |
| Modules | `/modules/*` | JWT |
| Lessons | `/lessons/*` | JWT |
| Lesson attendances | `/lessons/attendances/*` | JWT |
| Payment | `/payment/*` | JWT (kecuali callback) |
| Payment callback | `/payment/callback` | Tidak (webhook Tripay) |

---

## 1. Autentikasi (publik)

### `POST /login`

| | |
|--|--|
| **Auth** | Tidak |
| **Content-Type** | `application/json` |

**Request body** (`dto.LoginRequest`)

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Response 200** — sukses

```json
{
  "success": true,
  "message": "User logged in successfully!",
  "data": {
    "token": "<JWT>",
    "expires_at": "2026-04-20T12:00:00+07:00"
  },
  "error": null
}
```

**Status lain**

| HTTP | Kondisi | `message` (contoh) |
|------|---------|---------------------|
| 400 | JSON invalid | `Invalid request data` |
| 401 | Email tidak ada atau password salah | `Invalid credentials` |
| 500 | Gagal generate JWT | `Failed to generate token` |

---

### `POST /register`

| | |
|--|--|
| **Auth** | Tidak |
| **Content-Type** | `application/json` |

**Request body** (`dto.RegisterRequest`)

```json
{
  "name": "User DU",
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Response 200** — sama bentuknya dengan login (`data.token`, `data.expires_at`).

**Status lain**

| HTTP | Kondisi | `message` |
|------|---------|-----------|
| 400 | Validasi gagal | `Invalid request data` |
| 409 | Email duplikat (PostgreSQL `23505`) | `Email already registered` — **`error`: null** |
| 500 | Hash/register/gagal token | pesan sesuai handler |

---

### `GET /oauth/google/login` · `GET /oauth/google/callback`

Alur OAuth2 Google (redirect browser). Detail response mengikuti [`service` OAuth](../../../backend/internal/service/) — tidak berbentuk envelope JSON di redirect.

---

## 2. User & avatar (JWT)

Header: `Authorization: Bearer <token>`

### `GET /user/data`

| | |
|--|--|
| **Auth** | JWT |
| **Response 200** | `data` berisi profil + `enrollments` (preload course) |

```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "id": 1,
    "name": "<decrypted>",
    "email": "<decrypted>",
    "avatar_url": "",
    "role": "student",
    "is_verified": false,
    "description": "<decrypted>",
    "enrollments": [],
    "created_at": "...",
    "updated_at": "..."
  },
  "error": null
}
```

| HTTP | Kondisi |
|------|---------|
| 401 | Middleware |
| 500 | Gagal query user |

---

### `PATCH /user/profile`

**Content-Type:** `application/json`

**Body** (`dto.UpdateUserProfileRequest`) — semua field opsional, minimal satu harus dikirim:

```json
{
  "name": "Nama Baru",
  "email": "baru@example.com",
  "description": "Bio"
}
```

**Response 200** — `data` berisi profil terbaru (tanpa `enrollments` di cuplikan sukses; lihat handler untuk field lengkap).

**Status:** 400 (validasi / tidak ada field / nama-email kosong / format email), 409 (email dipakai user lain), 404 (user), 500.

---

### `PATCH /user/password`

**Body** (`dto.ChangePasswordRequest`)

```json
{
  "old_password": "lama",
  "new_password": "baruKuat1!"
}
```

**Response 200**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "error": null
}
```

| HTTP | Kondisi |
|------|---------|
| 401 | Password lama salah (`Invalid old password`) |

---

### `GET /user/manage/all` — Admin only

**Response 200** — daftar user (lihat [`GetAllUsersService`](../../../backend/internal/service/user.go) untuk pagination/filter di query).

**403** jika bukan admin.

---

### `PATCH /user/manage/:id` — Admin only

**Body**

```json
{
  "role": "mentor"
}
```

---

### `DELETE /user/manage/:id` — Admin only

**Response** sesuai handler (404 jika user tidak ada, dll.).

---

### `POST /avatar`

| | |
|--|--|
| **Content-Type** | `multipart/form-data` |
| **Field** | `avatar` — file (wajib jika upload; max **5MB**) |

**Response 200**

```json
{
  "success": true,
  "message": "Updated avatar successfully!",
  "data": {
    "avatar_url": "https://..."
  },
  "error": null
}
```

| HTTP | Kondisi |
|------|---------|
| 413 | File > 5MB — `message`: `Avatar file size exceeds 5MB limit` |

---

## 3. Courses & invoices (JWT)

### `GET /courses`

**Query (opsional):** `page`, `per_page` (max 100), `mentor_id`, `title`, `price`, `is_premium`

**Response 200**

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [],
    "meta": {
      "total": 0,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 0
    }
  },
  "error": null
}
```

---

### `GET /courses/:id`

**Response 200** — `data` = object `Course` dengan preload **`Modules`** (bukan lessons di dalam course pada handler ini — modul terpisah).

---

### `POST /courses`

| | |
|--|--|
| **Peran** | Admin only |
| **Content-Type** | `multipart/form-data` |

**Form fields** (implementasi [`PostAdminCourseFunc`](../../../backend/internal/service/course.go)):

| Field | Wajib | Keterangan |
|-------|--------|------------|
| `title` | ya | |
| `slug` | ya | |
| `description` | ya | |
| `thumbnail` | tidak | file gambar → MinIO |
| `price` | ya | string integer (diparse ke float) |
| `slot` | ya | kapasitas; `0` = tidak dibatasi di logika quota |
| `is_premium` | ya | string `"true"` / `"false"` |
| `is_published` | ya | string `"true"` / `"false"` |

**Response 201** — `data` = record `Course` yang dibuat.

**403** jika bukan admin.

---

### `POST /courses/:id/join`

**Body:** kosong.

**Response 201**

```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": {},
    "invoice_url": "https://..."
  },
  "error": null
}
```

| HTTP | Kondisi |
|------|---------|
| 403 | Bukan `student` |
| 400 | Sudah enroll / kelas penuh (`Class is full`) |
| 404 | Course/user tidak ditemukan |

---

### `POST /courses/:id/review`

**Content-Type:** `application/json`

```json
{
  "rating": 5,
  "comment": "Kursus sangat membantu"
}
```

**Response 201** — `data` = `CourseReview` (komentar sudah didekripsi untuk response).

| HTTP | Kondisi |
|------|---------|
| 403 | Bukan enrollment **active** |
| 409 | Sudah pernah review |

---

### `GET /courses/:id/students`

Admin only — `data.enrollments` + `meta` pagination (sama pola dengan list).

---

### `GET /invoices/:enrollment_id`

**Response 200** — `data`: `enrollment_id`, `user_id`, `course_id`, `filename`, `invoice_url`, `enrolled_at`.

**403** jika bukan admin, bukan pemilik enrollment, bukan mentor pemilik course.

---

### `GET /invoices/url`

**Query wajib:** `enrollment_id`, `user_id`, `course_id`

**Response 200** — struktur mirip invoice (lihat handler).

---

## 4. Modules (JWT)

| Method | Path | Admin | Body / catatan |
|--------|------|-------|------------------|
| GET | `/modules/:id` | Tidak | — |
| GET | `/modules/course/:course_id` | Tidak | Preload `Lessons` |
| POST | `/modules/` | Ya | JSON `CreateModuleRequest` |
| PUT | `/modules/:id` | Ya | JSON `UpdateModuleRequest` |
| DELETE | `/modules/:id` | Ya | — |

**CreateModuleRequest**

```json
{
  "course_id": 1,
  "title": "Modul 1",
  "order_index": 1
}
```

---

## 5. Lessons & attendances (JWT)

**CRUD lesson (contoh JSON, envelope, status HTTP):** [lesson/03-rest-api-complete.md](../lesson/03-rest-api-complete.md) · [lesson/04-http-status-matrix.md](../lesson/04-http-status-matrix.md).

| Method | Path | Catatan |
|--------|------|---------|
| POST | `/lessons/` | Admin — JSON `LessonCreateRequest` |
| GET | `/lessons/` | Admin — query: `page`, `per_page`, **`module_id`** (filter lesson per modul) |
| GET | `/lessons/:id` | Admin |
| PUT | `/lessons/:id` | Admin — `LessonUpdateRequest` |
| DELETE | `/lessons/:id` | Admin |

**Lesson group:** `/lessons/attendances`

| Method | Path | Peran | Keterangan |
|--------|------|-------|------------|
| POST | `/lessons/attendances/` | Student | [`LessonAttendanceCreateRequest`](#attendance-create) |
| GET | `/lessons/attendances/check-status` | Student | Query lesson + enrollment |
| GET | `/lessons/attendances/my-history` | Student | |
| GET | `/lessons/attendances/:id` | Admin | |
| PUT | `/lessons/attendances/:id` | Admin | `LessonAttendanceUpdateRequest` |
| DELETE | `/lessons/attendances/:id` | Admin | |
| GET | `/lessons/attendances/lesson/:lesson_id` | Admin | Daftar absensi per lesson |

### Attendance create

**POST `/lessons/attendances/`**

```json
{
  "lesson_id": 1,
  "enrollment_id": 2,
  "status": "present",
  "note": "opsional"
}
```

Validasi Gin memakai `oneof=present late absent excused` untuk `status` — kirim salah satu nilai tersebut. Setelah itu, **handler mengatur ulang** status menjadi `present` atau `late` berdasarkan perbandingan waktu sekarang dengan `lesson.StartTime` ([`CreateAttendanceFunc`](../../../backend/internal/service/lesson_attendance.go)); jadi nilai `status` di body bisa di-override oleh server.

### `GET /lessons/attendances/check-status`

**Query wajib:** `lesson_id`, `enrollment_id`

**Response 200** — `data` = satu `LessonAttendance` (preload Lesson, Enrollment).  
**404** — belum ada record absensi untuk pasangan tersebut (`message`: `No attendance record found for this lesson`).

### `GET /lessons/attendances/my-history`

**Query opsional:** `enrollment_id` — filter satu enrollment.

**Response 200** — daftar attendance milik user (melalui enrollment user).

**Response 201** — `data` = record `LessonAttendance`.

**409** — sudah absen untuk pasangan lesson+enrollment.

---

## 6. Payment

### `POST /payment/create` (JWT)

**Content-Type:** `application/json`

**Body** (`dto.CreatePaymentRequest`)

```json
{
  "enrollment_id": 1,
  "method": "OVO",
  "amount": 199000,
  "order_items": [
    {
      "sku": "CRS-1",
      "name": "Kursus A",
      "price": 199000,
      "quantity": 1,
      "product_url": "",
      "image_url": ""
    }
  ],
  "callback_url": "https://api.example.com/payment/callback",
  "return_url": "https://app.example.com/payment/success"
}
```

- `enrollment_id` **opsional** pointer; jika enrollment sudah **active**, create gagal dengan pesan error di **400**.
- `method` harus salah satu enum: `PERMATAVA`, `BNIVA`, `BRIVA`, `MANDIRIVA`, `BCAVA`, `MUAMALATVA`, `CIMBVA`, `BSIVA`, `OCBCVA`, `DANAMONVA`, `OVO`, `DANA`, `QRIS2`.

**Response 200** — `data` berisi field Tripay (`reference`, `checkout_url`, `amount`, `customer_*`, `instructions`, `qr_string`, dll.) sesuai [`CreatePaymentResponse`](../../../backend/internal/model/dto/payment.go).

**400** — bind gagal, Tripay error, enrollment tidak ditemukan, dll. (`error` berisi string).

---

### `GET /payment` (JWT)

**Query:** salah satu wajib — `reference` **atau** `enrollmentId`

**Response 200** — `data` = entity `Payment` (struct GORM).

**400** — parameter kurang / `enrollmentId` bukan angka.

**404** — pembayaran tidak ditemukan.

---

### `POST /payment/callback` (publik — Tripay)

**Content-Type:** `application/json`

**Body** (`dto.PaymentCallbackRequest`) — lihat struct di [`payment.go` DTO](../../../backend/internal/model/dto/payment.go): `reference`, `status`, `signature`, `total_amount`, dll.

**Response 200** — sukses update DB + aktifkan enrollment jika `PAID`.

**400** — body invalid, signature salah, gagal update.

**500** — `TRIPAY_PRIVATE_KEY` tidak diset.

---

## Diagram routing (ringkas)

```mermaid
flowchart LR
  subgraph public [Public]
    L[POST /login]
    R[POST /register]
    CB[POST /payment/callback]
  end
  subgraph jwt [JWT]
    U[/user/*]
    C[/courses/*]
    P[/payment/create]
    M[/modules/*]
    LS[/lessons/*]
  end
  L --> JWT_issue[JWT]
  JWT_issue --> jwt
```

---

*Terakhir diselaraskan dengan handler di `backend/internal/service` — jika route atau body berubah, perbarui file ini bersama PR.*
