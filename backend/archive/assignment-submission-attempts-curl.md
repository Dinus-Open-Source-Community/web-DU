# Dokumentasi cURL — Riwayat Submission Assignment (Multi-Attempt)

Panduan manual testing untuk fitur **riwayat jawaban** pada route submission siswa.

**Perubahan utama:** `GET /lessons/:id/assignment/submission` kini mengembalikan **array** `data.submissions` (satu item per attempt), bukan object tunggal `submission` + `grading`.

**Base URL default:** `http://localhost:8080`

**Prasyarat:** jalankan backend dengan `SEED=true` agar course, assignment, dan enrollment terisi.

---

## 1. Persiapan token & variabel

```bash
export BASE_URL="http://localhost:8080"
```

### Login student (Budi — sudah punya beberapa submission)

```bash
export STUDENT_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi@doscom.id",
    "password": "student123"
  }' | jq -r '.data.token')

echo "STUDENT_TOKEN=${STUDENT_TOKEN:0:20}..."
```

### Login student alternatif (Siti — untuk uji resubmit dari attempt 1)

```bash
export SITI_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "siti@doscom.id",
    "password": "student123"
  }' | jq -r '.data.token')
```

### Login mentor (penilaian manual + lihat submission staff)

```bash
export MENTOR_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "andi.mentor@doscom.id",
    "password": "mentor123"
  }' | jq -r '.data.token')
```

### Header auth

```bash
export STUDENT_AUTH="Authorization: Bearer $STUDENT_TOKEN"
export SITI_AUTH="Authorization: Bearer $SITI_TOKEN"
export MENTOR_AUTH="Authorization: Bearer $MENTOR_TOKEN"
```

---

## 2. Ambil UID lesson & assignment dari API

UID di response dipotong menjadi **8 karakter pertama** — cukup untuk path parameter.

### Daftar assignment milik student

```bash
curl -s "$BASE_URL/students/me/assignments?per_page=20" \
  -H "$STUDENT_AUTH" | jq '.data.assignments[] | {lesson_uid, assignment_uid, task_type, attempt_count, lesson_title, course_title}'
```

### Pilih lesson quiz (golang-fundamentals, module genap = quiz)

```bash
export QUIZ_LESSON_UID=$(curl -s "$BASE_URL/students/me/assignments?per_page=50" \
  -H "$STUDENT_AUTH" | jq -r '.data.assignments[] | select(.task_type=="quiz" and (.course_title | test("Go|Golang";"i"))) | .lesson_uid' | head -1)

echo "QUIZ_LESSON_UID=$QUIZ_LESSON_UID"
```

### Pilih lesson text (golang-fundamentals, module ganjil = text)

```bash
export TEXT_LESSON_UID=$(curl -s "$BASE_URL/students/me/assignments?per_page=50" \
  -H "$STUDENT_AUTH" | jq -r '.data.assignments[] | select(.task_type=="text" and (.course_title | test("Go|Golang";"i"))) | .lesson_uid' | head -1)

echo "TEXT_LESSON_UID=$TEXT_LESSON_UID"
```

**Fallback UID seed** (jika query di atas kosong):

| Lesson | UID (prefix) | Tipe | Catatan |
|--------|--------------|------|---------|
| Pengenalan Go — Lesson 1 | `fda62f5d` | text | Budi sudah submit + dinilai mentor |
| Syntax dan Tipe Data — Lesson 1 | *(ambil dari API)* | quiz | Budi skor 100% |
| Control Flow — Lesson 1 | *(ambil dari API)* | quiz | Budi `attempt_count=2` di seed |

```bash
# Contoh fallback manual
export TEXT_LESSON_UID="${TEXT_LESSON_UID:-fda62f5d}"
```

---

## 3. `GET /lessons/:id/assignment/submission` — baca riwayat attempt

### 3.1 Submission yang sudah ada (harapan: array `submissions`)

```bash
curl -s "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submission" \
  -H "$STUDENT_AUTH" | jq
```

**Verifikasi cepat:**

```bash
curl -s "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submission" \
  -H "$STUDENT_AUTH" | jq '{
    success,
    total_attempts: .data.total_attempts,
    latest_attempt_number: .data.latest_attempt_number,
    max_attempts: .data.max_attempts,
    submission_count: (.data.submissions | length),
    attempts: [.data.submissions[] | {attempt_number, submitted_at, has_plain_text: (.plain_text != ""), grading: .grading}]
  }'
```

**Harapan:**

| Field | Keterangan |
|-------|------------|
| `data.submissions` | **Array** (bukan object tunggal) |
| `data.total_attempts` | Sama dengan `length` array `submissions` |
| `data.latest_attempt_number` | Nomor attempt terakhir (= `attempt_count` di DB) |
| `data.max_attempts` | `1 + max_resubmit_count` jika `allow_resubmit=true` |
| Tiap item | Punya `attempt_number`, `submitted_at`, konten jawaban, dan objek `grading` |

### 3.2 Contoh struktur response (ringkas)

```json
{
  "success": true,
  "message": "Submissions retrieved successfully",
  "data": {
    "lesson_uid": "fda62f5d",
    "assignment_uid": "170bef64",
    "submission_uid": "7c5b9436",
    "total_attempts": 1,
    "latest_attempt_number": 1,
    "max_attempts": 4,
    "submissions": [
      {
        "uid": "a1b2c3d4",
        "attempt_number": 1,
        "submitted_at": "2026-06-04T09:00:00Z",
        "plain_text": "...",
        "rich_text": null,
        "file_url": "",
        "quiz_answers": null,
        "grading": {
          "score_percent": 100,
          "passed": true,
          "feedback": "Excellent! ...",
          "has_feedback": true,
          "is_graded": true,
          "graded_at": "2026-06-04T09:28:57Z",
          "is_auto_graded": false,
          "quiz_correct_count": null,
          "quiz_question_count": null
        }
      }
    ]
  },
  "error": null
}
```

### 3.3 Belum pernah submit → `404`

Gunakan lesson yang belum ada submission-nya (ganti `LESSON_UID`):

```bash
# Cari assignment tanpa submission_uid
curl -s "$BASE_URL/students/me/assignments?per_page=50" \
  -H "$SITI_AUTH" | jq '.data.assignments[] | select(.submission_uid == null) | {lesson_uid, lesson_title, task_type}'

export EMPTY_LESSON_UID="<lesson_uid_dari_query_di_atas>"

curl -s -w "\nHTTP %{http_code}\n" \
  "$BASE_URL/lessons/$EMPTY_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" | jq
```

**Harapan:** HTTP `404`, `message`: `"No submission yet"`.

### 3.4 Tanpa token → `401`

```bash
curl -s -w "\nHTTP %{http_code}\n" \
  "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submission" | jq
```

---

## 4. Alur lengkap: submit → resubmit → verifikasi array bertambah

Skenario ini membuktikan bahwa setiap POST/PUT menambah item baru di `data.submissions`.

> **Catatan:** Gunakan akun **Siti** pada assignment quiz yang `attempt_count` masih 1 dan `allow_resubmit=true`, agar PUT tidak ditolak karena batas attempt.

### 4.1 Cari lesson quiz Siti yang bisa di-resubmit

```bash
export SITI_QUIZ_LESSON_UID=$(curl -s "$BASE_URL/students/me/assignments?per_page=50" \
  -H "$SITI_AUTH" | jq -r '.data.assignments[] | select(.task_type=="quiz" and .allow_resubmit==true and .attempt_count==1) | .lesson_uid' | head -1)

echo "SITI_QUIZ_LESSON_UID=$SITI_QUIZ_LESSON_UID"
```

### 4.2 GET — baseline (1 attempt)

```bash
curl -s "$BASE_URL/lessons/$SITI_QUIZ_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" | jq '{
    total_attempts: .data.total_attempts,
    submissions: [.data.submissions[] | {attempt_number, score: .grading.score_percent, passed: .grading.passed}]
  }'
```

### 4.3 PUT — resubmit jawaban quiz (attempt ke-2)

Jawaban benar seed quiz: `q1=a`, `q2=b`, `q3=b`.

```bash
curl -s -X PUT "$BASE_URL/lessons/$SITI_QUIZ_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_answers": {
      "q1": "a",
      "q2": "b",
      "q3": "b"
    }
  }' | jq '{success, message, attempt_count: .data.attempt_count, score: .data.score_percent, passed: .data.passed}'
```

**Harapan:** HTTP `200`, `data.attempt_count` = `2`, skor quiz ter-update (auto-grade).

### 4.4 GET — verifikasi 2 item di array

```bash
curl -s "$BASE_URL/lessons/$SITI_QUIZ_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" | jq '{
    total_attempts: .data.total_attempts,
    latest_attempt_number: .data.latest_attempt_number,
    submissions: [.data.submissions[] | {
      attempt_number,
      submitted_at,
      score: .grading.score_percent,
      passed: .grading.passed,
      quiz_answers
    }]
  }'
```

**Harapan:**

- `total_attempts` = `2`
- `submissions[0].attempt_number` = `1` (jawaban lama)
- `submissions[1].attempt_number` = `2` (jawaban baru)
- Skor attempt 1 ≠ skor attempt 2 (jika jawaban berbeda)

### 4.5 Resubmit assignment text (rich_text)

```bash
curl -s -X PUT "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submission" \
  -H "$STUDENT_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "rich_text": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p><strong>Revisi attempt 2:</strong> Saya memperbarui penjelasan Hello World dengan menambahkan komentar di kode.</p><pre><code>package main\n\nimport \"fmt\"\n\nfunc main() {\n    // Menampilkan pesan ke stdout\n    fmt.Println(\"Hello World\")\n}</code></pre>"
    }
  }' | jq '{success, attempt_count: .data.attempt_count}'
```

Lalu GET lagi dan pastikan `submissions` berisi attempt lama + attempt baru dengan `rich_text` berbeda.

---

## 5. `POST /lessons/:id/assignment/submission` — submit pertama

Hanya untuk lesson yang **belum** punya submission (lihat §3.3).

### Text (rich_text WYSIWYG)

```bash
curl -s -X POST "$BASE_URL/lessons/$EMPTY_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "rich_text": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Jawaban tugas pertama saya.</p>"
    }
  }' | jq '{success, uid: .data.uid, attempt_count: .data.attempt_count}'
```

**Harapan:** HTTP `201`, `attempt_count` = `1`.

### Quiz (JSON)

```bash
curl -s -X POST "$BASE_URL/lessons/$EMPTY_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_answers": {
      "q1": "a",
      "q2": "b",
      "q3": "b"
    }
  }' | jq '{success, attempt_count: .data.attempt_count, score: .data.score_percent}'
```

GET setelah POST harus menampilkan `submissions` dengan **1 elemen**.

### Submit ulang ke lesson yang sama → `409`

```bash
curl -s -w "\nHTTP %{http_code}\n" \
  -X POST "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submission" \
  -H "$STUDENT_AUTH" \
  -H "Content-Type: application/json" \
  -d '{"rich_text": {"version":2,"contentType":"tiptap","contentHtml":"<p>duplikat</p>"}}' | jq
```

**Harapan:** HTTP `409` — gunakan `PUT` untuk resubmit.

---

## 6. Route staff (mentor) — terkait submission

### 6.1 List semua submission peserta di satu lesson

```bash
curl -s "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submissions" \
  -H "$MENTOR_AUTH" | jq '.data | {lesson_uid, assignment_uid, count: (.submissions | length)}'
```

### 6.2 Detail satu submission (mentor)

```bash
export SUBMISSION_UID=$(curl -s "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submissions" \
  -H "$MENTOR_AUTH" | jq -r '.data.submissions[0].uid')

curl -s "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submissions/$SUBMISSION_UID" \
  -H "$MENTOR_AUTH" | jq '{uid: .data.uid, attempt_count: .data.attempt_count, score: .data.score_percent}'
```

### 6.3 Grade text assignment — sinkron ke attempt terbaru

Hanya untuk `task_type=text`. Setelah grade, GET siswa pada attempt terakhir harus menampilkan `grading` yang sama.

```bash
curl -s -X PUT "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submissions/$SUBMISSION_UID/grade" \
  -H "$MENTOR_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "score_percent": 92,
    "passed": true,
    "feedback": "Revisi terbaru sudah lebih rapi. Pertahankan struktur kodenya."
  }' | jq '{success, score: .data.score_percent, feedback: .data.feedback}'
```

Verifikasi dari sisi student (attempt terakhir):

```bash
curl -s "$BASE_URL/lessons/$TEXT_LESSON_UID/assignment/submission" \
  -H "$STUDENT_AUTH" | jq '.data.submissions[-1].grading'
```

---

## 7. Uji batas attempt

Assignment seed memakai `allow_resubmit=true` dan `max_resubmit_count=3` → **maksimal 4 attempt** (`1 + 3`).

Setelah mencapai batas, PUT ditolak:

```bash
curl -s -w "\nHTTP %{http_code}\n" \
  -X PUT "$BASE_URL/lessons/$SITI_QUIZ_LESSON_UID/assignment/submission" \
  -H "$SITI_AUTH" \
  -H "Content-Type: application/json" \
  -d '{"quiz_answers":{"q1":"a","q2":"b","q3":"b"}}' | jq '{success, message}'
```

Ulangi PUT hingga `attempt_count` = `max_attempts`, lalu harapan berikutnya: HTTP `403`, `message`: `"Maximum submission attempts reached"`.

---

## 8. Checklist uji cepat

Jalankan berurutan setelah `SEED=true` dan backend sudah di-restart (agar tabel `lesson_assignment_submission_attempts` termigrasi):

| # | Endpoint | Peran | Harapan |
|---|----------|-------|---------|
| 1 | `POST /login` | Student | `data.token` terisi |
| 2 | `GET /students/me/assignments` | Student | Ada `lesson_uid` + `task_type` |
| 3 | `GET /lessons/:id/assignment/submission` | Student | `data.submissions` adalah **array** |
| 4 | `PUT /lessons/:id/assignment/submission` | Student | `attempt_count` naik + HTTP 200 |
| 5 | `GET /lessons/:id/assignment/submission` | Student | `total_attempts` naik; tiap attempt punya konten & `grading` sendiri |
| 6 | `POST /lessons/:id/assignment/submission` | Student | `409` jika sudah pernah submit |
| 7 | `GET /lessons/:id/assignment/submission` | Tanpa token | HTTP `401` |
| 8 | `GET /lessons/:id/assignment/submissions` | Mentor | List submission peserta |
| 9 | `PUT .../submissions/:uid/grade` | Mentor | Grade tersimpan; attempt terakhir siswa ikut ter-update |

---

## 9. Kredensial seed (referensi)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@doscom.id` | `superadmin123` |
| Admin | `admin@doscom.id` | `admin123` |
| Mentor | `andi.mentor@doscom.id` | `mentor123` |
| Student | `budi@doscom.id` / `siti@doscom.id` | `student123` |

**Course slug contoh:** `golang-fundamentals`, `web-development-nextjs`, `database-design-sql`

---

## 10. Catatan

- **Breaking change frontend:** ganti pembacaan `data.submission` + `data.grading` menjadi `data.submissions[]` (array).
- **Data lama** (sebelum fitur attempt history): saat GET pertama kali, sistem **backfill** minimal 1 attempt dari submission terakhir yang tersimpan.
- **Legacy `attempt_count > 1` tanpa riwayat:** hanya konten terakhir yang tersedia; riwayat penuh hanya tercatat untuk submit/resubmit **setelah** deploy fitur ini.
- Response envelope konsisten: `{ success, message, data, error }`.
- Tanpa `jq`: hapus `| jq` dari perintah; gunakan Postman atau pretty-print manual.
- Jika `401`: pastikan token belum expired (masa berlaku 24 jam) dan header `Authorization: Bearer ...` terkirim.
- Tabel baru: `lesson_assignment_submission_attempts` (AutoMigrate saat backend start).
