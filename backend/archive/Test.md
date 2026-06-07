Let's design a step-by-step test plan using curl.

We will have:

1. **AUTHENTICATION**: Log in as Admin/Superadmin to perform administrative changes (create course, module, lesson, and assignment) and as Student to join and submit assignments.
2. **COURSE CREATION & SETUP (Admin)**:
   - Get categories to fetch a valid `category_uid`.
   - Get course types to fetch a valid `course_type_uid`.
   - Create a course (`POST /courses/` with cover file/mock, slug, title, category, course_type).
   - Activate course status (`PATCH /courses/:id/status`).
3. **MODULE CREATION (Admin/Mentor)**:
   - Create a module for the course (`POST /modules/`).
4. **LESSON CREATION with WYSIWYG Content (Admin/Mentor)**:
   - Create a lesson in that module (`POST /lessons/` with content_type `text` and WYSIWYG `content`).
5. **ASSIGNMENT CREATION (Admin/Mentor)**:
   - **Tipe Text**: Create an assignment for the lesson (`POST /lessons/:id/assignment` with `task_type: "text"` and WYSIWYG `task_description`).
   - **Tipe Quiz**: Create a quiz assignment for the lesson (`POST /lessons/:id/assignment` with `task_type: "quiz"`, WYSIWYG `prompt` inside `quiz` payload).
6. **STUDENT INTERACTION (Student)**:
   - Join/enroll in the course (`POST /courses/:id/join`).
   - Submit text homework (`POST /lessons/:id/assignment/submission` with WYSIWYG `rich_text`).
   - Submit quiz answers (`POST /lessons/:id/assignment/submission` with `quiz_answers` mapping question IDs to answer option IDs).

This is a comprehensive, sequential testing guide. Let's write it down cleanly in Markdown. No edits are needed, only providing a well-structured response with the sequence of curl commands.

Let's refine the curl commands:

### 1. Login to get Access Tokens

#### As Admin/Super Admin (to configure Course, Module, Lesson, Assignment)

```bash
curl -X POST http://localhost:8080/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@doscom.id",
    "password": "superadmin123"
  }'
```

*(Save the returned `data.token` as `ADMIN_TOKEN`)*

#### As Student (to join course and submit assignments)

```bash
curl -X POST http://localhost:8080/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi@doscom.id",
    "password": "student123"
  }'
```

*(Save the returned `data.token` as `STUDENT_TOKEN`)*

---

### 2. Course Setup & Creation (Admin)

#### A. Get Categories list

```bash
curl -X GET http://localhost:8080/course-categories/
```

*(Identify a `category_uid` from the list, e.g., `"web-development-uid"`)*

#### B. Get Course Types list

```bash
curl -X GET http://localhost:8080/course-types/
```

*(Identify a `course_type_uid` from the list, e.g., `"bootcamp-uid"`)*

#### C. Create a New Course (Admin)

Since this requires `multipart/form-data`:

```bash
curl -X POST http://localhost:8080/courses/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "title=Belajar Go Lang Premium" \
  -F "description=Belajar dasar-dasar Go hingga advanced" \
  -F "category_uid=web-development-uid" \
  -F "course_type_uid=bootcamp-uid" \
  -F "level=PEMULA" \
  -F "price=150000" \
  -F "is_published=true" \
  -F "what_you_learn=[\"Sintaks Dasar Go\", \"Goroutine & Channels\"]"
```

*(Save the returned `data.uid` as `COURSE_UID`)*

#### D. Activate/Publish Course Status (Admin)

```bash
curl -X PATCH http://localhost:8080/courses/$COURSE_UID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 3. Module Creation (Admin/Mentor)

Create module for the course:

```bash
curl -X POST http://localhost:8080/modules/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_uid": "COURSE_UID",
    "title": "Module 1: Pengenalan Sintaks Go",
    "order_index": 1
  }'
```

*(Save the returned `data.uid` as `MODULE_UID`)*

---

### 4. Lesson Creation with WYSIWYG Content (Admin/Mentor)

Create a text lesson with the standardized WYSIWYG `content` envelope:

```bash
curl -X POST http://localhost:8080/lessons/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_uid": "MODULE_UID",
    "title": "Lesson 1: Hello World Go",
    "content_type": "text",
    "content": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<h3>Selamat Datang di Go!</h3><p>Mari belajar menulis <strong>Hello World</strong>.</p>"
    },
    "order_index": 1
  }'
```

*(Save the returned `data.uid` as `LESSON_UID`)*

---

### 5. Create Lesson Assignment

#### Opsi A: Tipe Tugas Teks (WYSIWYG Task Description)

```bash
curl -X POST http://localhost:8080/lessons/$LESSON_UID/assignment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tugas Menulis Hello World Go",
    "task_type": "text",
    "task_description": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<h3>Tugas Praktik</h3><p>Buat program <strong>Hello World</strong> lalu submit di kolom Rich Text.</p>"
    },
    "allow_rich_text_submission": true,
    "allow_file_submission": false,
    "allow_plain_text_submission": false,
    "deadline_at": "2026-12-31T23:59:59Z",
    "status": "TERBIT"
  }'
```

#### Opsi B: Tipe Kuis (WYSIWYG Prompts in Quiz questions)

Create a quiz where the questions' `prompt` is a WYSIWYG richTextEnvelope:

```bash
curl -X POST http://localhost:8080/lessons/$LESSON_UID/assignment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kuis Sintaks Go",
    "task_type": "quiz",
    "quiz": {
      "passingScore": 70,
      "questions": [
        {
          "id": "q1",
          "prompt": {
            "version": 2,
            "contentType": "tiptap",
            "contentHtml": "<p>Apakah <strong>Go (Golang)</strong> dikompilasi (compiled)?</p>"
          },
          "correctOptionId": "a",
          "explanation": "Ya, Go langsung dikompilasi ke machine code.",
          "options": [
            {"id": "a", "label": "Ya, benar"},
            {"id": "b", "label": "Tidak"}
          ]
        },
        {
          "id": "q2",
          "prompt": {
            "version": 2,
            "contentType": "tiptap",
            "contentHtml": "<p>Manakah keyword untuk menjalankan <strong>goroutine</strong>?</p>"
          },
          "correctOptionId": "b",
          "explanation": "Cukup gunakan keyword go.",
          "options": [
            {"id": "a", "label": "thread"},
            {"id": "b", "label": "go"},
            {"id": "c", "label": "async"}
          ]
        }
      ]
    },
    "allow_rich_text_submission": false,
    "allow_file_submission": false,
    "allow_plain_text_submission": false,
    "deadline_at": "2026-12-31T23:59:59Z",
    "status": "TERBIT"
  }'
```

*(Note: If updating an existing assignment, use `PUT http://localhost:8080/lessons/$LESSON_UID/assignment` with the same payload structure).*

---

### 6. Student Actions (Join & Submit Assignment)

#### A. Student Joins the Course

```bash
curl -X POST http://localhost:8080/courses/$COURSE_UID/join \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

*(Wait/Verify enrollment status is active in DB, or join a free/public course to submit).*

#### B. Submit Rich Text Homework (for Opsi A)

```bash
curl -X POST http://localhost:8080/lessons/$LESSON_UID/assignment/submission \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rich_text": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Berikut kode saya:</p><pre><code>package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello World\")\n}</code></pre>"
    }
  }'
```

#### C. Submit Quiz Answers (for Opsi B)

```bash
curl -X POST http://localhost:8080/lessons/$LESSON_UID/assignment/submission \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_answers": {
      "q1": "a",
      "q2": "b"
    }
  }'
```

This is incredibly clean, comprehensive, and perfectly targets the WYSIWYG enhancements. I will present this guide clearly to the user.Berikut adalah panduan pengujian menggunakan perintah `curl` yang disusun secara berurutan, mulai dari proses autentikasi, setup materi pembelajaran, hingga pengumpulan tugas (baik tipe Teks WYSIWYG maupun Kuis WYSIWYG).

---

### 1. Autentikasi (Mendapatkan Token)

Dapatkan token JWT untuk admin (untuk mengelola konten) dan student (untuk mendaftar & mengumpulkan tugas).

**Sebagai Admin / Super Admin:**

```bash
curl -X POST http://localhost:8080/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@doscom.id",
    "password": "superadmin123"
  }'
```

*(Simpan token dari response sebagai variabel `ADMIN_TOKEN`)*

**Sebagai Student:**

```bash
curl -X POST http://localhost:8080/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi@doscom.id",
    "password": "student123"
  }'
```

*(Simpan token dari response sebagai variabel `STUDENT_TOKEN`)*

---

### 2. Setup Kelas Baru (Admin)

#### A. Dapatkan Category UID & Course Type UID

```bash
# Dapatkan Category UID (misal: Web Development / Backend)
curl -X GET http://localhost:8080/course-categories/

# Dapatkan Course Type UID (misal: Bootcamp / Workshop)
curl -X GET http://localhost:8080/course-types/
```

#### B. Buat Kelas Baru (Multipart Form-Data)

```bash
curl -X POST http://localhost:8080/courses/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "title=Dasar Pemrograman Go Premium" \
  -F "description=Belajar dasar-dasar Go hingga advanced" \
  -F "category_uid=MASUKKAN_CATEGORY_UID_DI_SINI" \
  -F "course_type_uid=MASUKKAN_COURSE_TYPE_UID_DI_SINI" \
  -F "level=PEMULA" \
  -F "price=100000" \
  -F "is_published=true" \
  -F "what_you_learn=[\"Sintaks Go\", \"Goroutine\"]"
```

*(Simpan `uid` kelas dari response sebagai `COURSE_UID`)*

#### C. Aktifkan Kelas

```bash
curl -X PATCH http://localhost:8080/courses/COURSE_UID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 3. Pembuatan Modul (Admin/Mentor)

```bash
curl -X POST http://localhost:8080/modules/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_uid": "COURSE_UID",
    "title": "Modul 1: Sintaks dan Concurrency",
    "order_index": 1
  }'
```

*(Simpan `uid` modul sebagai `MODULE_UID`)*

---

### 4. Pembuatan Lesson dengan WYSIWYG Content (Admin/Mentor)

Buat lesson bertipe `text` dengan payload `content` terbungkus standard WYSIWYG envelope:

```bash
curl -X POST http://localhost:8080/lessons/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_uid": "MODULE_UID",
    "title": "Lesson 1: Dasar Sintaks Go",
    "content_type": "text",
    "content": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<h3>Pengenalan Go</h3><p>Go adalah bahasa pemrograman yang <strong>cepat dan terkompilasi</strong>.</p>"
    },
    "order_index": 1
  }'
```

*(Simpan `uid` lesson sebagai `LESSON_UID`)*

---

### 5. Pembuatan Tugas (Lesson Assignment)

Setiap lesson hanya dapat memiliki **satu** penugasan aktif (bisa bertipe `text` atau `quiz`).

#### Opsi A: Membuat Tugas Teks (Mendukung WYSIWYG Task Description)

```bash
curl -X POST http://localhost:8080/lessons/LESSON_UID/assignment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tugas Praktik Penulisan Go",
    "task_type": "text",
    "task_description": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<h3>Instruksi Tugas</h3><p>Tulis program sederhana dan lampirkan di kolom <em>Rich Text</em>.</p>"
    },
    "allow_rich_text_submission": true,
    "allow_file_submission": false,
    "allow_plain_text_submission": false,
    "deadline_at": "2026-12-31T23:59:59Z",
    "status": "TERBIT"
  }'
```

#### Opsi B: Membuat Tugas Kuis (Soal/Prompt mendukung WYSIWYG)

Jika ingin mengujinya sebagai kuis (hapus penugasan sebelumnya terlebih dahulu atau gunakan metode `PUT` pada endpoint yang sama):

```bash
curl -X POST http://localhost:8080/lessons/LESSON_UID/assignment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kuis Evaluasi Sintaks Go",
    "task_type": "quiz",
    "quiz": {
      "passingScore": 70,
      "questions": [
        {
          "id": "q1",
          "prompt": {
            "version": 2,
            "contentType": "tiptap",
            "contentHtml": "<p>Apakah <strong>Go</strong> dikompilasi (compiled)?</p>"
          },
          "correctOptionId": "a",
          "explanation": "Ya, Go langsung dikompilasi ke machine code.",
          "options": [
            {"id": "a", "label": "Ya, benar"},
            {"id": "b", "label": "Tidak"}
          ]
        },
        {
          "id": "q2",
          "prompt": {
            "version": 2,
            "contentType": "tiptap",
            "contentHtml": "<p>Keyword apa untuk menjalankan <strong>goroutine</strong>?</p>"
          },
          "correctOptionId": "b",
          "explanation": "Cukup gunakan keyword go.",
          "options": [
            {"id": "a", "label": "thread"},
            {"id": "b", "label": "go"},
            {"id": "c", "label": "async"}
          ]
        }
      ]
    },
    "allow_rich_text_submission": true, 
    "allow_file_submission": false,
    "allow_plain_text_submission": false,
    "deadline_at": "2026-12-31T23:59:59Z",
    "status": "TERBIT"
  }'
```

---

### 6. Aksi Student (Join Kelas & Pengumpulan Tugas)

#### A. Student Join Kelas

```bash
curl -X POST http://localhost:8080/courses/COURSE_UID/join \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

#### B. Pengumpulan Tugas Teks (Opsi A)

Mengirimkan jawaban teks kaya (WYSIWYG `rich_text`):

```bash
curl -X POST http://localhost:8080/lessons/LESSON_UID/assignment/submission \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rich_text": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Saya berhasil menulis:</p><pre><code>fmt.Println(\"Hello World\")</code></pre>"
    }
  }'
```

#### C. Pengumpulan Tugas Kuis (Opsi B)

Mengirimkan pilihan jawaban kuis:

```bash
curl -X POST http://localhost:8080/lessons/LESSON_UID/assignment/submission \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_answers": {
      "q1": "a",
      "q2": "b"
    }
  }'
```

---

### 7. Lesson Reading — Tandai Lesson Sudah Dibaca (Student)

Setelah student join kelas dan membuka lesson, tandai lesson tersebut sebagai **sudah dibaca**.  
Endpoint ini bersifat **idempotent** — memanggil berulang kali tidak membuat record duplikat.

#### A. Mark Lesson as Read (`POST /lessons/:id/read`)

```bash
curl -X POST http://localhost:8080/lessons/$LESSON_UID/read \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Response sukses (pertama kali):** `201 Created`
```json
{
  "success": true,
  "message": "Lesson marked as read successfully",
  "data": {
    "uid": "...",
    "lesson_uid": "LESSON_UID",
    "enrollment_uid": "...",
    "read_at": "2026-06-05T14:00:00Z",
    "created_at": "...",
    "updated_at": "..."
  },
  "error": null
}
```

**Response jika sudah pernah dibaca:** `200 OK`
```json
{
  "success": true,
  "message": "Lesson already marked as read",
  "data": { ... },
  "error": null
}
```

#### B. Cek Status Reading Lesson (`GET /lessons/:id/read`)

Cek apakah lesson sudah dibaca oleh user yang sedang login:

```bash
curl -X GET http://localhost:8080/lessons/$LESSON_UID/read \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Response jika sudah dibaca:**
```json
{
  "success": true,
  "message": "Lesson reading status retrieved",
  "data": {
    "is_read": true,
    "reading": {
      "uid": "...",
      "lesson_uid": "LESSON_UID",
      "enrollment_uid": "...",
      "read_at": "2026-06-05T14:00:00Z"
    }
  },
  "error": null
}
```

**Response jika belum dibaca:**
```json
{
  "success": true,
  "message": "Lesson reading status retrieved",
  "data": {
    "is_read": false,
    "reading": null
  },
  "error": null
}
```

> **Catatan:** Untuk mengecek dengan enrollment spesifik, tambahkan query param:
> ```bash
> curl -X GET "http://localhost:8080/lessons/$LESSON_UID/read?enrollment_id=ENROLLMENT_UID" \
>   -H "Authorization: Bearer $STUDENT_TOKEN"
> ```

---

### 8. Lesson Reading — History & Data Admin

#### A. Riwayat Semua Lesson yang Sudah Dibaca Student (`GET /lessons/readings/my-history`)

```bash
curl -X GET http://localhost:8080/lessons/readings/my-history \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

Filter berdasarkan enrollment tertentu (opsional):

```bash
curl -X GET "http://localhost:8080/lessons/readings/my-history?enrollment_id=ENROLLMENT_UID" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Contoh response:**
```json
{
  "success": true,
  "message": "Reading history retrieved successfully",
  "data": [
    {
      "uid": "...",
      "lesson_uid": "LESSON_UID",
      "enrollment_uid": "...",
      "read_at": "2026-06-05T14:00:00Z",
      "lesson": {
        "uid": "LESSON_UID",
        "title": "Lesson 1: Dasar Sintaks Go",
        ...
      }
    }
  ],
  "error": null
}
```

#### B. Daftar Semua Pembaca Lesson Tertentu (Admin/Mentor) (`GET /lessons/readings/lesson/:lesson_id`)

Hanya dapat diakses oleh admin atau mentor yang ditugaskan ke course:

```bash
curl -X GET http://localhost:8080/lessons/readings/lesson/$LESSON_UID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Contoh response:**
```json
{
  "success": true,
  "message": "Lesson readings retrieved successfully",
  "data": [
    {
      "uid": "...",
      "lesson_uid": "LESSON_UID",
      "enrollment_uid": "...",
      "read_at": "2026-06-05T14:00:00Z",
      "enrollment": {
        "uid": "...",
        "user_uid": "...",
        "course_uid": "..."
      }
    }
  ],
  "error": null
}
```

---

### 9. Course Progress — Lihat Progress Belajar di Suatu Kelas

#### `GET /courses/:id/progress`

Menampilkan berapa lesson yang sudah dibaca dari total lesson yang tersedia di course ini.  
Nilai `progress` berupa **desimal 0.0 – 1.0** (contoh: `0.33` = 1 dari 3 lesson sudah dibaca).

```bash
curl -X GET http://localhost:8080/courses/$COURSE_UID/progress \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Contoh response (student yang sudah membaca 2 dari 7 lesson):**
```json
{
  "success": true,
  "message": "Course progress retrieved successfully",
  "data": {
    "course_uid": "COURSE_UID",
    "total_lessons": 7,
    "lessons_read": 2,
    "progress": 0.2857142857142857,
    "enrollment_uid": "...",
    "enrollment_status": "active"
  },
  "error": null
}
```

**Contoh response (admin/mentor — tidak punya enrollment):**
```json
{
  "success": true,
  "message": "Course progress retrieved successfully",
  "data": {
    "course_uid": "COURSE_UID",
    "total_lessons": 7,
    "lessons_read": 0,
    "progress": 0.0,
    "enrollment_uid": null,
    "enrollment_status": null
  },
  "error": null
}
```

> **Aturan akses:**
> - **Student enrolled** (active/completed): mendapatkan progress nyata berdasarkan `lesson_readings`.
> - **Student tidak enrolled**: `403 Forbidden`.
> - **Admin / Mentor**: mendapat akses, `progress` selalu `0.0`.

---

### 10. Verifikasi `is_reading` di Response Lesson (Otomatis)

Setelah step 7A dilakukan, field `is_reading` pada response list/detail lesson akan berubah otomatis.

#### A. Cek `is_reading` di List Lesson (`GET /lessons?module_uid=...`)

```bash
curl -X GET "http://localhost:8080/lessons/?module_uid=$MODULE_UID" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Contoh response (lesson yang sudah dibaca akan `is_reading: true`):**
```json
{
  "success": true,
  "message": "Lessons retrieved successfully",
  "data": {
    "lessons": [
      {
        "uid": "LESSON_UID",
        "title": "Lesson 1: Dasar Sintaks Go",
        "content_type": "text",
        "order_index": 1,
        "is_reading": true,
        ...
      },
      {
        "uid": "LESSON_UID_2",
        "title": "Lesson 2: Variable & Type",
        "order_index": 2,
        "is_reading": false,
        ...
      }
    ],
    "meta": {
      "total": 2,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 1
    }
  },
  "error": null
}
```

#### B. Cek `is_reading` di Detail Lesson (`GET /lessons/:id`)

```bash
curl -X GET http://localhost:8080/lessons/$LESSON_UID \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Contoh response:**
```json
{
  "success": true,
  "message": "Lesson retrieved successfully",
  "data": {
    "uid": "LESSON_UID",
    "title": "Lesson 1: Dasar Sintaks Go",
    "is_reading": true,
    ...
  },
  "error": null
}
```

#### C. Cek `progress` di `GET /user/data`

Field `progress` di `joined_courses` juga dihitung otomatis dari `lesson_readings`:

```bash
curl -X GET http://localhost:8080/user/data \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Potongan response `joined_courses`:**
```json
{
  "joined_courses": [
    {
      "uid": "COURSE_UID",
      "title": "Dasar Pemrograman Go Premium",
      "progress": 0.14285714285714285,
      "enrollment_status": "active",
      "enrolled_at": "2026-06-05T12:00:00Z",
      ...
    }
  ]
}
```

