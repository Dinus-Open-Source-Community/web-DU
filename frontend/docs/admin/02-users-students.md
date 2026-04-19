# Admin — Users — Students

## Ringkasan

Daftar dan detail siswa. Mock: `AdminStudent`, [`StudentsTable`](../../src/app/(authorized)/admin/users/students/_components/StudentsTable.tsx).

**Envelope:** [response-envelope.md](../api/response-envelope.md).

---

## Backend — `GET /user/manage/all`

Filter **`role=student`** di klien setelah fetch (atau perluas query di backend).

**Response sukses** — lihat contoh struktur di [01-dashboard admin](./01-dashboard.md#backend--data-yang-bisa-dipakai-untuk-widget-ada).

---

## Backend — `PATCH /user/manage/:id`

**Content-Type:** `application/json`

**Request**

```json
{
  "role": "student"
}
```

**Response 200** — user terupdate (lihat [`UpdateUserRoleService`](../../../backend/internal/service/user.go)).

**403**

```json
{
  "success": false,
  "message": "Access denied: Admins only",
  "data": null,
  "error": null
}
```

---

## Backend — `DELETE /user/manage/:id`

**Response 200** — penghapusan berhasil (struktur `data` mengikuti handler).

**404** — user target tidak ditemukan.

---

## Gap mock

- Mock memakai **`uid` string**; API memakai **`id` uint**.

---

## Detail siswa (usulan)

**GET** `/api/v1/admin/students/:id`

**Response 200**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "user": {
      "id": 3,
      "name": "...",
      "email": "...",
      "role": "student"
    },
    "enrollments": [],
    "stats": {
      "courses_enrolled": 4,
      "completed": 1
    }
  },
  "error": null
}
```
