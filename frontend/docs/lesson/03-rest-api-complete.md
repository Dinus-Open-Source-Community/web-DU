# Lesson — REST API lengkap

**Base path:** `/lessons`  
**Auth:** `Authorization: Bearer <JWT>` pada semua route di bawah.  
**Peran:** handler memeriksa **`admin`** untuk CRUD lesson — lihat [`lessons.go` service](../../../backend/internal/service/lessons.go).

**Envelope:** [response-envelope.md](../api/response-envelope.md).

---

## Ringkasan endpoint

| Method | Path           | Fungsi                                          |
| ------ | -------------- | ----------------------------------------------- |
| POST   | `/lessons/`    | Buat lesson                                     |
| GET    | `/lessons/`    | Daftar lesson (pagination + filter `module_id`) |
| GET    | `/lessons/:id` | Detail satu lesson                              |
| PUT    | `/lessons/:id` | Update lesson                                   |
| DELETE | `/lessons/:id` | Hapus lesson                                    |

---

## DTO — request

### `LessonCreateRequest`

| Field         | JSON   | Wajib | Keterangan                                    |
| ------------- | ------ | ----- | --------------------------------------------- |
| `module_id`   | number | Ya    | FK modul                                      |
| `title`       | string | Ya    |                                               |
| `content`     | any    | Tidak | JSON → disimpan `jsonb`                       |
| `video_url`   | string | Tidak |                                               |
| `start_time`  | string | Tidak | **RFC3339**, mis. `2026-04-20T10:00:00+07:00` |
| `end_time`    | string | Tidak | RFC3339                                       |
| `order_index` | number | Tidak |                                               |

### `LessonUpdateRequest`

Semua field **opsional** di JSON; perilaku [`UpdateLessonFunc`](../../../backend/internal/service/lessons.go):

- `module_id`, `title`, `content`, `video_url`, `start_time`, `end_time` hanya mengubah kolom jika nilai “terisi” (mis. `module_id != 0`, `title != ""`, `content != nil`, `video_url != ""`, string waktu tidak kosong).
- **`order_index` selalu ditulis** dari body: `lesson.OrderIndex = req.OrderIndex`. Jika field tidak dikirim, unmarshaling Go mengisi **0** — bisa mengubah urutan menjadi 0. Untuk partial update yang aman, selalu kirim `order_index` yang diinginkan atau perbaikan backend (pointer / patch) diperlukan.

---

## `POST /lessons/`

### Request — `application/json`

```json
{
  "module_id": 1,
  "title": "Pengenalan komponen",
  "content": {
    "version": 2,
    "contentType": "tiptap",
    "contentHtml": "<p>Halo</p>"
  },
  "video_url": "",
  "start_time": "2026-04-20T10:00:00+07:00",
  "end_time": "2026-04-20T11:00:00+07:00",
  "order_index": 1
}
```

### Response 201 — sukses

```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": {
    "id": 42,
    "module_id": 1,
    "title": "Pengenalan komponen",
    "content": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Halo</p>"
    },
    "video_url": "",
    "start_time": "2026-04-20T10:00:00+07:00",
    "end_time": "2026-04-20T11:00:00+07:00",
    "order_index": 1,
    "created_at": "2026-04-19T08:00:00Z",
    "updated_at": "2026-04-19T08:00:00Z"
  },
  "error": null
}
```

_Field tanggal di JSON response mengikuti serialisasi Go (`time.Time`)._

### Response error (ringkas)

| HTTP | Kapan                                                                          |
| ---- | ------------------------------------------------------------------------------ |
| 400  | `ShouldBindJSON` gagal                                                         |
| 403  | Bukan admin                                                                    |
| 404  | User dari token tidak ditemukan                                                |
| 500  | Gagal insert (termasuk **violasi FK** jika `module_id` tidak ada di `modules`) |

Handler **tidak** memvalidasi keberadaan modul sebelum `Create`; error database biasanya muncul sebagai **500** dengan `error` berisi pesan PG/GORM.

**Contoh 400**

```json
{
  "success": false,
  "message": "Invalid request data",
  "data": null,
  "error": "Key: 'LessonCreateRequest.ModuleID' Error:Field validation for 'ModuleID' failed on the 'required' tag"
}
```

**Contoh 403**

```json
{
  "success": false,
  "message": "Access denied: Admins only",
  "data": null,
  "error": null
}
```

---

## `GET /lessons/`

### Query

| Param       | Default | Max | Keterangan         |
| ----------- | ------- | --- | ------------------ |
| `page`      | 1       | —   |                    |
| `per_page`  | 10      | 100 |                    |
| `module_id` | —       | —   | Filter `module_id` |

### Response 200

```json
{
  "success": true,
  "message": "Lessons retrieved successfully",
  "data": {
    "lessons": [],
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

## `GET /lessons/:id`

### Response 200

```json
{
  "success": true,
  "message": "Lesson retrieved successfully",
  "data": {
    "id": 42,
    "module_id": 1,
    "title": "...",
    "content": {},
    "video_url": "",
    "start_time": "0001-01-01T00:00:00Z",
    "end_time": "0001-01-01T00:00:00Z",
    "order_index": 1,
    "created_at": "...",
    "updated_at": "..."
  },
  "error": null
}
```

### Response 404

```json
{
  "success": false,
  "message": "Lesson not found",
  "data": null,
  "error": "<pesan dari GORM, mis. record not found>"
}
```

---

## `PUT /lessons/:id`

### Request (partial)

```json
{
  "title": "Judul baru",
  "content": { "html": "<p>Updated</p>" },
  "video_url": "https://example.com/video.mp4",
  "order_index": 2
}
```

### Response 200

Sama bentuk dengan GET — `data` berisi lesson terbaru.

### Response 400 / 404 / 500

Sesuai validasi, lesson tidak ditemukan, atau error DB.

---

## `DELETE /lessons/:id`

### Response 200

```json
{
  "success": true,
  "message": "Lesson deleted successfully",
  "data": null,
  "error": null
}
```

### Response 404 / 500

Lesson tidak ada atau gagal hapus.

---

## Modul (parent lesson)

| Method | Path                         |
| ------ | ---------------------------- |
| GET    | `/modules/course/:course_id` |
| GET    | `/modules/:id`               |
| POST   | `/modules/`                  |
| PUT    | `/modules/:id`               |
| DELETE | `/modules/:id`               |

Detail: [api/route-map.md](../api/route-map.md).
