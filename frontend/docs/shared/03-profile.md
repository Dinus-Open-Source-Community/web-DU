# Shared — Profile

## Endpoint backend (bukan `/users`)

Grup route: **`/user`** dengan JWT — lihat [`routes/user.go`](../../../backend/internal/handler/routes/user.go).

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/user/data` | Profil + enrollments |
| PATCH | `/user/profile` | Update nama / email / deskripsi |
| PATCH | `/user/password` | Ganti password |
| GET | `/user/manage/all` | Admin — daftar user |
| PATCH | `/user/manage/:id` | Admin — ubah role |
| DELETE | `/user/manage/:id` | Admin — hapus user |

Avatar terpisah: **`POST /avatar`** (multipart).

Envelope: [response-envelope.md](../api/response-envelope.md).

## Rute frontend

| Path | File |
|------|------|
| `/profile` | [`(authorized)/profile/page.tsx`](../../src/app/(authorized)/profile/page.tsx) |

---

## `GET /user/data`

**Headers:** `Authorization: Bearer <token>`

### Response sukses — **200 OK**

```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "id": 1,
    "name": "<plaintext>",
    "email": "<plaintext>",
    "avatar_url": "",
    "role": "student",
    "is_verified": false,
    "description": "<plaintext>",
    "enrollments": [],
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-01T00:00:00Z"
  },
  "error": null
}
```

`enrollments` di-preload dengan relasi **`Course`** (urut `enrolled_at` DESC).

### Response error

| HTTP | Kondisi |
|------|---------|
| **401** | Middleware — header hilang / token invalid |
| **500** | Gagal query (bukan 404 jika user dari JWT tidak ada — handler saat ini mengembalikan 500 untuk error DB) |

---

## `PATCH /user/profile`

**Content-Type:** `application/json`

### Request body (`dto.UpdateUserProfileRequest`)

Semua field **opsional**; minimal **satu** field harus dikirim (jika semua `null` → **400** `No profile fields provided`).

```json
{
  "name": "Nama Baru",
  "email": "baru@example.com",
  "description": "Bio singkat"
}
```

### Response sukses — **200 OK**

`data` berisi user terbaru (tanpa list enrollments penuh di cuplikan sukses — lihat handler untuk field pasti): `id`, `name`, `email`, `avatar_url`, `role`, `is_verified`, `description`, `created_at`, `updated_at`.

### Response error (contoh)

| HTTP | `message` |
|------|-----------|
| **400** | `Invalid request data` / `No profile fields provided` / `Name cannot be empty` / `Invalid email format` |
| **404** | `User not found` |
| **409** | `Email already registered` |
| **500** | Enkripsi / update gagal |

---

## `PATCH /user/password`

### Request body

```json
{
  "old_password": "lama",
  "new_password": "baruKuat1!"
}
```

### Response sukses — **200 OK**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "error": null
}
```

### Response error

| HTTP | Kondisi |
|------|---------|
| **400** | Bind gagal / password kosong |
| **401** | Password lama salah (`Invalid old password`) |
| **404** | User tidak ditemukan |
| **500** | Hash / update gagal |

---

## `POST /avatar`

| Properti | Nilai |
|----------|--------|
| **Content-Type** | `multipart/form-data` |
| **Field** | `avatar` — file (max **5 MB**) |

### Response sukses — **200 OK**

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

### Response error

| HTTP | Kondisi |
|------|---------|
| **413** | File > 5MB |
| **400** | Proses file gagal |
| **500** | Upload MinIO / update DB gagal |

---

## Referensi

- [Route map — User & avatar](../api/route-map.md#2-user--avatar-jwt)
- [`user.go` service](../../../backend/internal/service/user.go), [`avatar.go` service](../../../backend/internal/service/avatar.go)
