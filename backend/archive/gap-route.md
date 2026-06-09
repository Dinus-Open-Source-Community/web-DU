# Dokumentasi cURL — Route Gap (Fase 1–3 + Q&A)

Panduan manual testing untuk route backend yang ditambahkan/diperkaya pada batch **Admin Analytics**, **Operasional Course**, dan **Domain Q&A**.

**Base URL default:** `http://localhost:8080`

**Prasyarat data dummy:** jalankan backend dengan `SEED=true` (lihat `.env.example`) agar transaksi, review, dan Q&A terisi.

---

## 1. Persiapan token

Semua route `/admin/*` dan sebagian besar route `/courses/*` (auth) membutuhkan JWT.

### Login admin

```bash
export BASE_URL="http://localhost:8080"

export ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@doscom.id",
    "password": "admin123"
  }' | jq -r '.data.token')

echo "$ADMIN_TOKEN"
```

### Login super admin (opsional)

```bash
export SUPERADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@doscom.id",
    "password": "superadmin123"
  }' | jq -r '.data.token')
```

### Login student (untuk Q&A thread)

```bash
export STUDENT_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi@doscom.id",
    "password": "student123"
  }' | jq -r '.data.token')
```

### Login mentor (untuk Q&A reply)

```bash
export MENTOR_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "andi.mentor@doscom.id",
    "password": "mentor123"
  }' | jq -r '.data.token')
```

### Header auth (dipakai di semua contoh di bawah)

```bash
# Bearer atau token langsung — keduanya valid
export AUTH_HEADER="Authorization: Bearer $ADMIN_TOKEN"
```

### Ambil UID resource dari API

UID di response dipotong menjadi **8 karakter pertama** (middleware `ShortenUIDs`). Prefix itu cukup untuk path parameter.

```bash
# Course UID (contoh: golang-fundamentals)
export COURSE_UID=$(curl -s "$BASE_URL/courses?per_page=5" | jq -r '.data.courses[] | select(.slug=="golang-fundamentals") | .uid')
echo "COURSE_UID=$COURSE_UID"

# Mentor UID
export MENTOR_UID=$(curl -s "$BASE_URL/mentor/all?per_page=1" | jq -r '.data.mentors[0].uid')
echo "MENTOR_UID=$MENTOR_UID"
```

---

## 2. Route operasional (perbaikan existing)

### 2.1 `POST /courses/:id/mentors/unassign`

Lepas mentor dari kursus. **Auth:** Admin / Super Admin.

```bash
curl -s -X POST "$BASE_URL/courses/$COURSE_UID/mentors/unassign" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{
    \"mentor_uids\": [\"$MENTOR_UID\"]
  }" | jq
```

**Response sukses (contoh):**

```json
{
  "success": true,
  "message": "Mentors unassigned successfully",
  "data": {
    "course_uid": "a1b2c3d4",
    "removed_mentor_uids": ["e5f6g7h8"]
  },
  "error": null
}
```

Assign kembali untuk restore data:

```bash
curl -s -X POST "$BASE_URL/courses/$COURSE_UID/mentors/assign" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{
    \"mentor_uids\": [\"$MENTOR_UID\"]
  }" | jq
```

---

### 2.2 `GET /courses` — filter baru

**Public** (tanpa token).

```bash
# Filter kategori (FE: course_category_id)
export CATEGORY_UID=$(curl -s "$BASE_URL/course-categories?per_page=1" | jq -r '.data.categories[0].uid')

curl -s "$BASE_URL/courses?course_category_id=$CATEGORY_UID&per_page=5" | jq

# Filter tipe kelas (FE: course_type_id)
export CLASS_TYPE_UID=$(curl -s "$BASE_URL/course-types?per_page=1" | jq -r '.data.class_types[0].uid')

curl -s "$BASE_URL/courses?course_type_id=$CLASS_TYPE_UID&per_page=5" | jq

# Filter status + sort
curl -s "$BASE_URL/courses?status=ACTIVE&sort_by=price&sort_order=asc&per_page=10" | jq
```

---

### 2.3 `GET /courses/:id/students` — attendance fields

**Public.** Response enrollment kini menyertakan `attendance_present`, `attendance_total`, `last_active_at`.

```bash
curl -s "$BASE_URL/courses/$COURSE_UID/students?per_page=10" | jq '.data.enrollments[0]'
```

**Field baru yang diharapkan:**

```json
{
  "enrollment_uid": "...",
  "student_uid": "...",
  "student_name": "Budi Santoso",
  "progress": 75,
  "status": "active",
  "attendance_present": 2,
  "attendance_total": 9,
  "last_active_at": "2026-06-08T10:00:00Z"
}
```

---

### 2.4 `GET /user/manage/all` — include super_admin

**Auth:** Admin. Filter `role=admin` sekarang mencakup `super_admin`.

```bash
curl -s "$BASE_URL/user/manage/all?role=admin&per_page=20" \
  -H "$AUTH_HEADER" | jq '.data.users[] | {name, email, role}'
```

---

## 3. Route admin — Transactions & Financial

Semua membutuhkan **Admin / Super Admin**.

### 3.1 `GET /admin/transactions`

```bash
curl -s "$BASE_URL/admin/transactions?per_page=10&page=1" \
  -H "$AUTH_HEADER" | jq
```

**Filter opsional:**

```bash
# Status: pending | success | failed
curl -s "$BASE_URL/admin/transactions?status=success&per_page=20" \
  -H "$AUTH_HEADER" | jq '.data.summary'

# Pencarian + rentang tanggal
curl -s "$BASE_URL/admin/transactions?search=golang&date_from=2025-01-01&date_to=2026-12-31" \
  -H "$AUTH_HEADER" | jq
```

**Response shape:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "uid": "...",
        "transactionId": "TRX-SEED-20250108-001",
        "courseUid": "...",
        "studentUid": "...",
        "courseName": "Golang Fundamentals",
        "classType": "Premium",
        "price": 299000,
        "paymentStatus": "success",
        "paymentMethod": "E-Wallet",
        "studentName": "Budi Santoso"
      }
    ],
    "meta": { "current_page": 1, "per_page": 10, "total": 12, "total_pages": 2 },
    "summary": {
      "grossRevenue": 2500000,
      "paidCount": 9,
      "pendingCount": 1,
      "failedCount": 1
    }
  }
}
```

---

### 3.2 `GET /admin/financial/summary`

```bash
curl -s "$BASE_URL/admin/financial/summary" \
  -H "$AUTH_HEADER" | jq
```

**Response shape:**

```json
{
  "success": true,
  "data": {
    "kpis": [ "...AdminKpi[]" ],
    "monthlyRevenue": [{ "label": "Jan 2025", "value": 598000 }],
    "revenueByCategory": [{ "label": "Web Development", "value": 1200000 }],
    "revenueSource": [{ "label": "Website", "value": 100, "color": "#4F46E5" }]
  }
}
```

> `revenueSource` masih placeholder (100% Website) karena belum ada kolom sumber penjualan di schema.

---

## 4. Route admin — Dashboard

### 4.1 `GET /admin/dashboard/kpis`

```bash
# period: 7d | 30d | 90d | 12m (default 30d)
curl -s "$BASE_URL/admin/dashboard/kpis?period=30d" \
  -H "$AUTH_HEADER" | jq
```

```bash
curl -s "$BASE_URL/admin/dashboard/kpis?period=12m" \
  -H "$AUTH_HEADER" | jq '.data[] | {id, label, value, trendValue, trendDirection}'
```

---

### 4.2 `GET /admin/dashboard/recent-transactions`

```bash
curl -s "$BASE_URL/admin/dashboard/recent-transactions?limit=5" \
  -H "$AUTH_HEADER" | jq
```

---

## 5. Route admin — Reviews

### 5.1 `GET /admin/reviews`

```bash
curl -s "$BASE_URL/admin/reviews?per_page=10&page=1" \
  -H "$AUTH_HEADER" | jq
```

**Filter:**

```bash
curl -s "$BASE_URL/admin/reviews?courseUid=$COURSE_UID&rating=5&has_reply=true" \
  -H "$AUTH_HEADER" | jq '.data.reviews'
```

```bash
export REVIEW_UID=$(curl -s "$BASE_URL/admin/reviews?per_page=1" \
  -H "$AUTH_HEADER" | jq -r '.data.reviews[0].uid')
echo "REVIEW_UID=$REVIEW_UID"
```

---

### 5.2 `POST /admin/reviews/:review_id/reply`

```bash
curl -s -X POST "$BASE_URL/admin/reviews/$REVIEW_UID/reply" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Terima kasih atas ulasannya! Kami akan terus meningkatkan materi."
  }' | jq
```

---

## 6. Route admin — Q&A

### 6.1 `GET /admin/qna`

```bash
curl -s "$BASE_URL/admin/qna?per_page=10&page=1" \
  -H "$AUTH_HEADER" | jq
```

**Filter:**

```bash
# status: answered | unanswered
curl -s "$BASE_URL/admin/qna?status=unanswered&courseUid=$COURSE_UID" \
  -H "$AUTH_HEADER" | jq '.data.threads'
```

```bash
export THREAD_UID=$(curl -s "$BASE_URL/admin/qna?per_page=1" \
  -H "$AUTH_HEADER" | jq -r '.data.threads[0].uid')
echo "THREAD_UID=$THREAD_UID"
```

---

### 6.2 `POST /admin/qna/:thread_id/replies`

```bash
curl -s -X POST "$BASE_URL/admin/qna/$THREAD_UID/replies" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Halo, terima kasih sudah bertanya. Berikut penjelasan dari tim admin."
  }' | jq
```

---

## 7. Route pendukung Q&A (course-scoped)

### 7.1 `POST /courses/:id/qna` — buat thread (student terdaftar)

```bash
curl -s -X POST "$BASE_URL/courses/$COURSE_UID/qna" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apakah goroutine aman untuk pemula?",
    "body": "Saya ingin tahu best practice memakai goroutine di project kecil."
  }' | jq
```

---

### 7.2 `POST /courses/:id/qna/:thread_id/replies` — balasan student/mentor

**Sebagai mentor:**

```bash
curl -s -X POST "$BASE_URL/courses/$COURSE_UID/qna/$THREAD_UID/replies" \
  -H "Authorization: Bearer $MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Mulai dari goroutine sederhana dengan sync.WaitGroup, hindari shared state tanpa mutex."
  }' | jq
```

---

## 8. Checklist uji cepat

Jalankan berurutan setelah `SEED=true`:

| # | Endpoint | Harapan |
|---|----------|---------|
| 1 | `POST /login` (admin) | `data.token` terisi |
| 2 | `GET /admin/transactions` | `summary.paidCount` ≥ 1 |
| 3 | `GET /admin/dashboard/kpis` | Array 4 KPI |
| 4 | `GET /admin/dashboard/recent-transactions` | Array ≤ 5 item |
| 5 | `GET /admin/financial/summary` | `monthlyRevenue` tidak kosong |
| 6 | `GET /admin/reviews` | ≥ 7 review dari seeder |
| 7 | `GET /admin/qna` | ≥ 5 thread dari seeder |
| 8 | `GET /courses/:id/students` | Field `attendance_present` ada |
| 9 | `GET /user/manage/all?role=admin` | Ada user `super_admin` |
| 10 | `POST /courses/:id/mentors/unassign` | `removed_mentor_uids` terisi |

---

## 9. Kredensial seed (referensi)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@doscom.id` | `superadmin123` |
| Admin | `admin@doscom.id` | `admin123` |
| Student | `budi@doscom.id` / `siti@doscom.id` | `student123` |
| Mentor | `andi.mentor@doscom.id` | `mentor123` |

**Course slug contoh:** `golang-fundamentals`, `web-development-nextjs`, `database-design-sql`, `rest-api-development`, `devops-essentials`

**Transaction ID contoh (seeder):** `TRX-SEED-20250108-001` … `TRX-SEED-20250916-012`

---

## 10. Catatan

- **Support tickets** (`GET /admin/dashboard/support-tickets`) sengaja **tidak** diimplementasikan pada batch ini.
- **`PUT /courses/:id`** sudah ada sebelumnya — tidak masuk scope dokumen gap, tetapi bisa diuji dengan multipart form + token admin.
- Response envelope konsisten: `{ success, message, data, error }`.
- Tanpa `jq`: hapus `| jq` dari perintah; gunakan browser/Postman untuk membaca JSON mentah.
- Jika `401`: pastikan token belum expired (masa berlaku 24 jam) dan header `Authorization` terkirim.
