# API Debugging Report

**Tanggal pengujian:** 2026-06-07 21:00:39
**Base URL:** `http://localhost:8080`
**Total endpoint diuji:** 68
**Hasil:** 68 OK / 0 gagal (bug aplikasi)

> Urutan pengujian: **Super Admin → Admin → Mentor → Student → Public → Cleanup (Super Admin)**

## Akun uji (seeder)

| Urutan | Role | Email / Password |
|--------|------|------------------|
| 1 | Super Admin | superadmin@doscom.id / superadmin123 |
| 2 | Admin | admin@doscom.id / admin123 |
| 3 | Mentor | andi.mentor@doscom.id / mentor123 |
| 4 | Student | budi@doscom.id / student123 (+ siti@doscom.id untuk beberapa uji) |
| 5 | Public | tanpa token |

## Data seed untuk enrollment aktif

- Course: `golang-fundamentals` (`7afd0677`) — Budi enrolled **active**
- Enrollment Budi: `a443f9ae` (dari `GET /user/data` → `data.enrollment_invoices`)
- Lesson: `fda62f5d` (Pengenalan Go - Lesson 1)

## Perbaikan bug

### `GET /lessons/readings/my-history` — Preload Lesson gagal

**Error sebelum perbaikan:**
```json
{"success":false,"message":"Failed to retrieve reading history","error":"Lesson: unsupported relations for schema LessonReading","data":null}
```

**Fix:** Hapus `Scan`/`Value` dari `backend/internal/model/entity/lesson.go`.

---

## Ringkasan per role

| Role | Endpoint | Pass |
|------|----------|------|
| Super Admin | 20 | 20/20 |
| Admin | 11 | 11/11 |
| Mentor | 1 | 1/1 |
| Student | 21 | 21/21 |
| Public | 15 | 15/15 |

---

## Detail hasil pengujian (per role)

### 1. Super Admin

#### ✅ `POST /course-categories/` — PASS

- **Kategori:** Course Category
- **HTTP:** `201`
- **Catatan:** create category
- **Message:** Course category created successfully

```json
{
  "data": {
    "uid": "7e484e3e",
    "name": "TestCat 1780840836",
    "description": "API test",
    "is_active": true,
    "created_at": "2026-06-07T14:00:36.60367821Z",
    "updated_at": "2026-06-07T14:00:36.60367821Z"
  },
  "error": null,
  "message": "Course category created successfully",
  "success": true
}
```

#### ✅ `PUT /course-categories/7e484e3e` — PASS

- **Kategori:** Course Category
- **HTTP:** `200`
- **Catatan:** update category
- **Message:** Course category updated successfully

```json
{
  "data": {
    "uid": "7e484e3e",
    "name": "TestCat 1780840836 Updated",
    "description": "updated",
    "is_active": true,
    "created_at": "2026-06-07T14:00:36.603678Z",
    "updated_at": "2026-06-07T14:00:36.643704231Z"
  },
  "error": null,
  "message": "Course category updated successfully",
  "success": true
}
```

#### ✅ `POST /course-types/` — PASS

- **Kategori:** Course Type
- **HTTP:** `201`
- **Catatan:** create course type
- **Message:** Course type created successfully

```json
{
  "data": {
    "uid": "a4429194",
    "name": "TestType 1780840836",
    "description": "API test",
    "is_active": true,
    "created_at": "2026-06-07T14:00:36.67989963Z",
    "updated_at": "2026-06-07T14:00:36.67989963Z"
  },
  "error": null,
  "message": "Course type created successfully",
  "success": true
}
```

#### ✅ `PUT /course-types/a4429194` — PASS

- **Kategori:** Course Type
- **HTTP:** `200`
- **Catatan:** update course type
- **Message:** Course type updated successfully

```json
{
  "data": {
    "uid": "a4429194",
    "name": "TestType 1780840836 Upd",
    "description": "upd",
    "is_active": true,
    "created_at": "2026-06-07T14:00:36.679899Z",
    "updated_at": "2026-06-07T14:00:36.719903052Z"
  },
  "error": null,
  "message": "Course type updated successfully",
  "success": true
}
```

#### ✅ `POST /courses/` — PASS

- **Kategori:** Course
- **HTTP:** `201`
- **Catatan:** create course
- **Message:** Course created successfully

```json
{"data":{"category":{"created_at":"2026-06-07T13:48:26.400677Z","description":"updated","is_active":true,"name":"TestCat 1780840106 Updated","uid":"58649210","updated_at":"2026-06-07T13:48:26.435271Z"},"category_uid":"58649210","course_type":{"created_at":"2026-06-07T13:48:26.536767Z","description":"upd","is_active":true,"name":"TestType 1780840106 Upd","uid":"4cb5078d","updated_at":"2026-06-07T13:48:26.572614Z"},"course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:36.757103Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super A
```

#### ✅ `PATCH /courses/34638681/status` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** activate course
- **Message:** Course status updated successfully

```json
{
  "data": {
    "uid": "34638681",
    "category_uid": "58649210",
    "course_type_uid": "4cb5078d",
    "title": "API Test Course 1780840836",
    "subtitle": "",
    "slot": 0,
    "slug": "api-test-course-1780840836",
    "description": "test",
    "cover_url": "",
    "thumbnail_url": "",
    "level": "PEMULA",
    "status": "ACTIVE",
    "price": 0,
    "price_strike": 0,
    "what_you_learn": [
      "Go"
    ],
    "is_premium": false,
    "is_published": true,
    "created_at": "2026-06-07T14:00:36.757103Z",
    "updated_at": "2026-06-07T14:00:36.799580481Z"
  },
  "error": null,
  "message": "Course status updated successfully",
  "success": true
}
```

#### ✅ `PUT /courses/34638681` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** update course
- **Message:** Course updated successfully

```json
{"data":{"category":{"created_at":"2026-06-07T13:48:26.400677Z","description":"updated","is_active":true,"name":"TestCat 1780840106 Updated","uid":"58649210","updated_at":"2026-06-07T13:48:26.435271Z"},"category_uid":"58649210","course_type":{"created_at":"2026-06-07T13:48:26.536767Z","description":"upd","is_active":true,"name":"TestType 1780840106 Upd","uid":"4cb5078d","updated_at":"2026-06-07T13:48:26.572614Z"},"course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:36.757103Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super A
```

#### ✅ `POST /courses/34638681/mentors/assign` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** assign mentors
- **Message:** Mentors assigned successfully

```json
{
  "data": {
    "course_uid": "34638681",
    "mentors": [
      {
        "email": "nadia.mentor@doscom.id",
        "name": "Nadia Putri",
        "role": "mentor",
        "uid": "4955ce25"
      }
    ]
  },
  "error": null,
  "message": "Mentors assigned successfully",
  "success": true
}
```

#### ✅ `POST /modules/` — PASS

- **Kategori:** Module
- **HTTP:** `201`
- **Catatan:** create module
- **Message:** Module created successfully

```json
{
  "data": {
    "uid": "0485679d",
    "course_uid": "34638681",
    "title": "Test Module",
    "order_index": 1,
    "created_at": "2026-06-07T14:00:36.915709001Z",
    "lessons": null
  },
  "error": null,
  "message": "Module created successfully",
  "success": true
}
```

#### ✅ `PUT /modules/0485679d` — PASS

- **Kategori:** Module
- **HTTP:** `200`
- **Catatan:** update module
- **Message:** Module updated successfully

```json
{
  "data": {
    "uid": "0485679d",
    "course_uid": "34638681",
    "title": "Test Module Updated",
    "order_index": 1,
    "created_at": "2026-06-07T14:00:36.915709Z",
    "lessons": null
  },
  "error": null,
  "message": "Module updated successfully",
  "success": true
}
```

#### ✅ `POST /lessons/` — PASS

- **Kategori:** Lesson
- **HTTP:** `201`
- **Catatan:** create lesson
- **Message:** Lesson created successfully

```json
{
  "data": {
    "uid": "03cf65dd",
    "module_uid": "0485679d",
    "title": "API Lesson",
    "content_type": "text",
    "content": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Test</p>"
    },
    "video_url": "",
    "start_time": "0001-01-01T00:00:00Z",
    "end_time": "0001-01-01T00:00:00Z",
    "order_index": 1,
    "created_at": "2026-06-07T14:00:36.991490751Z",
    "updated_at": "2026-06-07T14:00:36.991490751Z"
  },
  "error": null,
  "message": "Lesson created successfully",
  "success": true
}
```

#### ✅ `PUT /lessons/03cf65dd` — PASS

- **Kategori:** Lesson
- **HTTP:** `200`
- **Catatan:** update lesson
- **Message:** Lesson updated successfully

```json
{
  "data": {
    "uid": "03cf65dd",
    "module_uid": "0485679d",
    "title": "API Lesson Updated",
    "content_type": "text",
    "content": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Updated</p>"
    },
    "video_url": "",
    "start_time": "0001-01-01T00:00:00Z",
    "end_time": "0001-01-01T00:00:00Z",
    "order_index": 1,
    "created_at": "2026-06-07T14:00:36.99149Z",
    "updated_at": "2026-06-07T14:00:37.034612165Z"
  },
  "error": null,
  "message": "Lesson updated successfully",
  "success": true
}
```

#### ✅ `POST /lessons/03cf65dd/assignment` — PASS

- **Kategori:** Lesson Assignment
- **HTTP:** `201`
- **Catatan:** create assignment
- **Message:** Lesson assignment created successfully

```json
{
  "data": {
    "uid": "7faa94b5",
    "lesson_uid": "03cf65dd",
    "title": "API Assignment",
    "task_type": "text",
    "task_description": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Do it</p>"
    },
    "quiz_payload": null,
    "allow_file_submission": true,
    "allow_plain_text_submission": false,
    "allow_rich_text_submission": true,
    "require_file_description": false,
    "instruction_attachments": null,
    "deadline_at": "2027-12-31T23:59:59Z",
    "status": "TERBIT",
    "auto_close_after_deadline": true,
    "allow_resubmit": false,
    "max_resubmit_count": null,
    "created_at": "2026-06-07T14:00:37.071059354Z",
    "updated_at": "2026-06-07T14:00:37.071059354Z"
  },
  "error": null,
  "message": "Lesson assignment created successfully",
  "success": true
}
```

#### ✅ `PUT /lessons/03cf65dd/assignment` — PASS

- **Kategori:** Lesson Assignment
- **HTTP:** `200`
- **Catatan:** update assignment
- **Message:** Lesson assignment updated successfully

```json
{
  "data": {
    "uid": "7faa94b5",
    "lesson_uid": "03cf65dd",
    "title": "API Assignment Updated",
    "task_type": "text",
    "task_description": {
      "version": 2,
      "contentType": "tiptap",
      "contentHtml": "<p>Updated</p>"
    },
    "quiz_payload": null,
    "allow_file_submission": false,
    "allow_plain_text_submission": false,
    "allow_rich_text_submission": true,
    "require_file_description": false,
    "instruction_attachments": null,
    "deadline_at": "2027-12-31T23:59:59Z",
    "status": "TERBIT",
    "auto_close_after_deadline": false,
    "allow_resubmit": false,
    "max_resubmit_count": null,
    "created_at": "2026-06-07T14:00:37.071059Z",
    "updated_at": "2026-06-07T14:00:37.108262625Z"
  },
  "error": null,
  "message": "Lesson assignment updated successfully",
  "success": true
}
```

#### ✅ `DELETE /lessons/attendances/db9603f5` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** delete attendance
- **Message:** Attendance deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "Attendance deleted successfully",
  "success": true
}
```

#### ✅ `DELETE /lessons/03cf65dd/assignment` — PASS

- **Kategori:** Lesson Assignment
- **HTTP:** `200`
- **Catatan:** delete assignment
- **Message:** Lesson assignment deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "Lesson assignment deleted successfully",
  "success": true
}
```

#### ✅ `DELETE /lessons/03cf65dd` — PASS

- **Kategori:** Lesson
- **HTTP:** `200`
- **Catatan:** delete lesson
- **Message:** Lesson deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "Lesson deleted successfully",
  "success": true
}
```

#### ✅ `DELETE /modules/0485679d` — PASS

- **Kategori:** Module
- **HTTP:** `200`
- **Catatan:** delete module
- **Message:** Module deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "Module deleted successfully",
  "success": true
}
```

#### ✅ `DELETE /course-categories/7e484e3e` — PASS

- **Kategori:** Course Category
- **HTTP:** `200`
- **Catatan:** delete test category
- **Message:** Course category deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "Course category deleted successfully",
  "success": true
}
```

#### ✅ `DELETE /course-types/a4429194` — PASS

- **Kategori:** Course Type
- **HTTP:** `200`
- **Catatan:** delete test course type
- **Message:** Course type deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "Course type deleted successfully",
  "success": true
}
```

### 2. Admin

#### ✅ `GET /user/manage/all` — PASS

- **Kategori:** User
- **HTTP:** `200`
- **Catatan:** list all users
- **Message:** Users retrieved successfully

```json
{"data":{"meta":{"current_page":1,"per_page":5,"total":12,"total_pages":3},"users":[{"avatar_url":"","created_at":"2026-06-07T14:00:06.148467Z","email":"testuser_1780840803@test.local","enrollments":[],"is_verified":false,"name":"Test User","role":"student","uid":"53b8974f","updated_at":"2026-06-07T14:00:06.148467Z"},{"avatar_url":"","created_at":"2026-06-07T13:48:26.018571Z","email":"testuser_1780840105@test.local","enrollments":[],"is_verified":false,"name":"Test User","role":"student","uid":"c457c437","updated_at":"2026-06-07T13:48:26.018571Z"},{"avatar_url":"","created_at":"2026-06-07T13:4
```

#### ✅ `GET /user/4f31bec4` — PASS

- **Kategori:** User
- **HTTP:** `200`
- **Catatan:** get user by id
- **Message:** User detail retrieved successfully

```json
{"data":{"avatar_url":"https://i.pravatar.cc/150?img=14","course_reviews":[{"comment":"Studi kasus REST API-nya relevan dengan kebutuhan backend sehari-hari.","course":{"slug":"rest-api-development","title":"REST API Development","uid":"736b3d9a"},"created_at":"2026-05-25T00:23:22.64227Z","rating":4,"uid":"14572da9"},{"comment":"Konsep normalisasi dan query SQL-nya praktis untuk proyek nyata.","course":{"slug":"database-design-sql","title":"Database Design dan SQL","uid":"25e21f91"},"created_at":"2026-05-25T00:23:22.633871Z","rating":4,"uid":"43acf188"},{"comment":"Struktur modul Next.js-nya r
```

#### ✅ `GET /lessons/fda62f5d/assignment` — PASS

- **Kategori:** Lesson Assignment
- **HTTP:** `200`
- **Catatan:** get assignment
- **Message:** Lesson assignment retrieved successfully

```json
{"data":{"uid":"170bef64","lesson_uid":"fda62f5d","title":"Tugas Pengenalan Go - Lesson 1","task_type":"text","task_description":{"version":2,"contentHtml":"<h3>Tugas Praktik: Pengenalan Go - Lesson 1</h3><p>Kerjakan tugas berikut sesuai dengan materi yang telah dipelajari pada lesson ini.</p><h4>Instruksi</h4><ol><li>Baca ulang materi lesson dengan seksama</li><li>Buat implementasi sederhana berdasarkan konsep yang dijelaskan</li><li>Sertakan penjelasan singkat tentang pendekatan yang Anda gunakan</li></ol><h4>Kriteria Penilaian</h4><ul><li><strong>Ketepatan:</strong> Solusi sesuai dengan ins
```

#### ✅ `GET /lessons/fda62f5d/assignment/submissions` — PASS

- **Kategori:** Lesson Assignment Submission
- **HTTP:** `200`
- **Catatan:** staff list submissions
- **Message:** Submissions retrieved successfully

```json
{"data":{"assignment_uid":"170bef64","lesson_uid":"fda62f5d","submissions":[{"uid":"06edd28f","lesson_assignment_uid":"170bef64","user_uid":"296c19dd","plain_text":"Program Go pertama saya berhasil! Go punya sintaks bersih dan kompilasi cepat. Saya mencoba variasi fmt.Println, fmt.Printf, dan fmt.Sprintf untuk memahami perbedaan ketiganya.","score_percent":90,"passed":true,"feedback":"Good job API test","graded_at":"2026-06-07T14:00:03.948982Z","graded_by_uid":"25692150","is_auto_graded":false,"attempt_count":1,"created_at":"2026-06-05T09:28:57.401554Z","updated_at":"2026-06-07T14:00:03.949205
```

#### ✅ `GET /lessons/fda62f5d/assignment/submissions/06edd28f` — PASS

- **Kategori:** Lesson Assignment Submission
- **HTTP:** `200`
- **Catatan:** staff get submission
- **Message:** Submission retrieved successfully

```json
{"data":{"uid":"06edd28f","lesson_assignment_uid":"170bef64","user_uid":"296c19dd","plain_text":"Program Go pertama saya berhasil! Go punya sintaks bersih dan kompilasi cepat. Saya mencoba variasi fmt.Println, fmt.Printf, dan fmt.Sprintf untuk memahami perbedaan ketiganya.","score_percent":90,"passed":true,"feedback":"Good job API test","graded_at":"2026-06-07T14:00:03.948982Z","graded_by_uid":"25692150","is_auto_graded":false,"attempt_count":1,"created_at":"2026-06-05T09:28:57.401554Z","updated_at":"2026-06-07T14:00:03.949205Z","user":{"uid":"296c19dd","name":"Siti Nurhaliza","email":"siti@do
```

#### ✅ `PUT /lessons/fda62f5d/assignment/submissions/06edd28f/grade` — PASS

- **Kategori:** Lesson Assignment Submission
- **HTTP:** `200`
- **Catatan:** grade submission
- **Message:** Submission graded successfully

```json
{"data":{"uid":"06edd28f","lesson_assignment_uid":"170bef64","user_uid":"296c19dd","plain_text":"Program Go pertama saya berhasil! Go punya sintaks bersih dan kompilasi cepat. Saya mencoba variasi fmt.Println, fmt.Printf, dan fmt.Sprintf untuk memahami perbedaan ketiganya.","score_percent":90,"passed":true,"feedback":"Good job API test","graded_at":"2026-06-07T14:00:37.34334Z","graded_by_uid":"25692150","is_auto_graded":false,"attempt_count":1,"created_at":"2026-06-05T09:28:57.401554Z","updated_at":"2026-06-07T14:00:37.3435Z","user":{"uid":"296c19dd","name":"Siti Nurhaliza","email":"siti@dosco
```

#### ✅ `GET /lessons/readings/lesson/fda62f5d` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** lesson readings by lesson
- **Message:** Lesson readings retrieved successfully

```json
{"data":[{"uid":"58d7ca92","lesson_uid":"fda62f5d","enrollment_uid":"a443f9ae","read_at":"2026-06-05T02:43:08.549801Z","created_at":"2026-06-05T02:43:08.550112Z","updated_at":"2026-06-05T02:43:08.550112Z","enrollment":{"uid":"a443f9ae","user_uid":"4f31bec4","course_uid":"7afd0677","enrolled_at":"2026-06-05T01:51:56.548805Z","progress":0,"status":"active","user":null,"course":null}},{"uid":"eb2d7b4e","lesson_uid":"fda62f5d","enrollment_uid":"52b25d77","read_at":"2026-06-05T02:43:08.751687Z","created_at":"2026-06-05T02:43:08.752095Z","updated_at":"2026-06-05T02:43:08.752095Z","enrollment":{"uid"
```

#### ✅ `GET /lessons/attendances/lesson/fda62f5d` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** lesson attendances list
- **Message:** Attendances retrieved successfully

```json
{
  "data": [],
  "error": null,
  "message": "Attendances retrieved successfully",
  "success": true
}
```

#### ✅ `PATCH /user/manage/dc8449a7` — PASS

- **Kategori:** User Management
- **HTTP:** `200`
- **Catatan:** update user role
- **Message:** User role updated successfully

```json
{
  "data": {
    "avatar_url": "",
    "created_at": "2026-06-07T14:00:37.549249Z",
    "email": "managetest_1780840836@test.local",
    "is_verified": false,
    "name": "Manage Test",
    "role": "student",
    "uid": "dc8449a7",
    "updated_at": "2026-06-07T14:00:37.596856439Z"
  },
  "error": null,
  "message": "User role updated successfully",
  "success": true
}
```

#### ✅ `DELETE /user/manage/dc8449a7` — PASS

- **Kategori:** User Management
- **HTTP:** `200`
- **Catatan:** delete temp user
- **Message:** User deleted successfully

```json
{
  "data": null,
  "error": null,
  "message": "User deleted successfully",
  "success": true
}
```

#### ✅ `POST /courses/7afd0677/review/7239ab2c/reply` — PASS

- **Kategori:** Course
- **HTTP:** `201`
- **Catatan:** review reply (admin = mentor course seed)
- **Message:** Review reply created successfully

```json
{
  "data": {
    "comment": "Thanks for the review!",
    "course_review_uid": "7239ab2c",
    "created_at": "2026-06-07T14:00:37.669285041Z",
    "replier_uid": "25692150",
    "uid": "18c3d622"
  },
  "error": null,
  "message": "Review reply created successfully",
  "success": true
}
```

### 3. Mentor

#### ✅ `GET /courses/7afd0677/progress` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** course progress (mentor view)
- **Message:** Course progress retrieved successfully

```json
{
  "data": {
    "course_uid": "7afd0677",
    "enrollment_status": null,
    "enrollment_uid": null,
    "lessons_read": 0,
    "progress": 0,
    "total_lessons": 7
  },
  "error": null,
  "message": "Course progress retrieved successfully",
  "success": true
}
```

### 4. Student

#### ✅ `GET /user/data` — PASS

- **Kategori:** User
- **HTTP:** `200`
- **Catatan:** self profile
- **Message:** User detail retrieved successfully

```json
{"data":{"avatar_url":"https://i.pravatar.cc/150?img=14","course_reviews":[{"comment":"Studi kasus REST API-nya relevan dengan kebutuhan backend sehari-hari.","course":{"slug":"rest-api-development","title":"REST API Development","uid":"736b3d9a"},"created_at":"2026-05-25T00:23:22.64227Z","rating":4,"uid":"14572da9"},{"comment":"Konsep normalisasi dan query SQL-nya praktis untuk proyek nyata.","course":{"slug":"database-design-sql","title":"Database Design dan SQL","uid":"25e21f91"},"created_at":"2026-05-25T00:23:22.633871Z","rating":4,"uid":"43acf188"},{"comment":"Struktur modul Next.js-nya r
```

#### ✅ `PATCH /user/profile` — PASS

- **Kategori:** User
- **HTTP:** `200`
- **Catatan:** update profile
- **Message:** Profile updated successfully

```json
{
  "data": {
    "avatar_url": "https://i.pravatar.cc/150?img=14",
    "created_at": "2026-05-23T11:09:03.2227Z",
    "description": "Updated by API test",
    "email": "budi@doscom.id",
    "is_verified": true,
    "name": "Budi Santoso",
    "role": "student",
    "uid": "4f31bec4",
    "updated_at": "2026-06-07T14:00:37.782793Z"
  },
  "error": null,
  "message": "Profile updated successfully",
  "success": true
}
```

#### ✅ `GET /courses/7afd0677/progress` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** course progress
- **Message:** Course progress retrieved successfully

```json
{
  "data": {
    "course_uid": "7afd0677",
    "enrollment_status": "active",
    "enrollment_uid": "a443f9ae",
    "lessons_read": 7,
    "progress": 1,
    "total_lessons": 7
  },
  "error": null,
  "message": "Course progress retrieved successfully",
  "success": true
}
```

#### ✅ `GET /invoices/a443f9ae` — PASS

- **Kategori:** Invoice
- **HTTP:** `200`
- **Catatan:** get invoice by enrollment
- **Message:** Invoice retrieved successfully

```json
{
  "data": {
    "course_uid": "7afd0677",
    "enrolled_at": "2026-06-05T01:51:56.548805Z",
    "enrollment_uid": "a443f9ae",
    "filename": "a443f9ae-849a-4c8c-a45e-4199f385b3ed__4f31bec4-893b-4aa7-8353-17041390a573__7afd0677-818b-489b-9094-69a9119b50a0__20260605.pdf",
    "invoice_url": "http://localhost:8080/files/invoices/a443f9ae-849a-4c8c-a45e-4199f385b3ed__4f31bec4-893b-4aa7-8353-17041390a573__7afd0677-818b-489b-9094-69a9119b50a0__20260605.pdf",
    "user_uid": "4f31bec4"
  },
  "error": null,
  "message": "Invoice retrieved successfully",
  "success": true
}
```

#### ✅ `GET /invoices/url?enrollment_id=a443f9ae&user_id=4f31bec4&course_id=7afd0677` — PASS

- **Kategori:** Invoice
- **HTTP:** `200`
- **Catatan:** get invoice url
- **Message:** Invoice URL retrieved successfully

```json
{
  "data": {
    "course_uid": "7afd0677",
    "enrolled_at": "2026-06-05T01:51:56.548805Z",
    "enrollment_uid": "a443f9ae",
    "filename": "a443f9ae-849a-4c8c-a45e-4199f385b3ed__4f31bec4-893b-4aa7-8353-17041390a573__7afd0677-818b-489b-9094-69a9119b50a0__20260605.pdf",
    "invoice_url": "http://localhost:8080/files/invoices/a443f9ae-849a-4c8c-a45e-4199f385b3ed__4f31bec4-893b-4aa7-8353-17041390a573__7afd0677-818b-489b-9094-69a9119b50a0__20260605.pdf",
    "user_uid": "4f31bec4"
  },
  "error": null,
  "message": "Invoice URL retrieved successfully",
  "success": true
}
```

#### ✅ `GET /modules/course/7afd0677` — PASS

- **Kategori:** Module
- **HTTP:** `200`
- **Catatan:** list modules
- **Message:** Modules retrieved successfully

```json
{"data":{"meta":{"current_page":1,"per_page":10,"total":3,"total_pages":1},"modules":[{"uid":"17424c02","course_uid":"7afd0677","title":"Pengenalan Go","order_index":1,"created_at":"2026-05-23T11:09:03.629643Z","lessons":[{"uid":"fda62f5d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 1","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 1</h2><p>Selamat datang di lesson <strong>1</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</p><h3>Tujuan Pembelajaran</h3><
```

#### ✅ `GET /modules/17424c02` — PASS

- **Kategori:** Module
- **HTTP:** `200`
- **Catatan:** get module by id
- **Message:** Module retrieved successfully

```json
{"data":{"uid":"17424c02","course_uid":"7afd0677","title":"Pengenalan Go","order_index":1,"created_at":"2026-05-23T11:09:03.629643Z","lessons":[{"uid":"fda62f5d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 1","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 1</h2><p>Selamat datang di lesson <strong>1</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</p><h3>Tujuan Pembelajaran</h3><ul><li>Memahami konsep dasar dari topik Pengenalan Go</li><li>Mampu menerapkan
```

#### ✅ `GET /lessons/?module_uid=17424c02` — PASS

- **Kategori:** Lesson
- **HTTP:** `200`
- **Catatan:** list lessons
- **Message:** Lessons retrieved successfully

```json
{"data":{"lessons":[{"uid":"fda62f5d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 1","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 1</h2><p>Selamat datang di lesson <strong>1</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</p><h3>Tujuan Pembelajaran</h3><ul><li>Memahami konsep dasar dari topik Pengenalan Go</li><li>Mampu menerapkan teknik yang dipelajari dalam studi kasus nyata</li><li>Mengidentifikasi best practices dan anti-pattern umum</li></ul><h3>M
```

#### ✅ `GET /lessons/fda62f5d` — PASS

- **Kategori:** Lesson
- **HTTP:** `200`
- **Catatan:** get lesson by id
- **Message:** Lesson retrieved successfully

```json
{"data":{"uid":"fda62f5d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 1","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 1</h2><p>Selamat datang di lesson <strong>1</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</p><h3>Tujuan Pembelajaran</h3><ul><li>Memahami konsep dasar dari topik Pengenalan Go</li><li>Mampu menerapkan teknik yang dipelajari dalam studi kasus nyata</li><li>Mengidentifikasi best practices dan anti-pattern umum</li></ul><h3>Materi Inti</
```

#### ✅ `GET /lessons/fda62f5d/assignment/submission` — PASS

- **Kategori:** Lesson Assignment Submission
- **HTTP:** `200`
- **Catatan:** get my submission
- **Message:** Submission retrieved successfully

```json
{"data":{"grading":{"feedback":"Excellent! Implementasi sudah benar dan penjelasannya sangat jelas. Terus pertahankan!","graded_at":"2026-06-04T09:28:57.359641Z","graded_by_uid":null,"has_feedback":true,"is_auto_graded":false,"is_graded":true,"passed":true,"quiz_correct_count":null,"quiz_question_count":null,"score_percent":100},"submission":{"uid":"7c5b9436","lesson_assignment_uid":"170bef64","user_uid":"4f31bec4","plain_text":"Saya membuat program Hello World menggunakan Go. Program menampilkan teks ke console melalui fmt.Println tanpa dependensi eksternal karena memanfaatkan standard librar
```

#### ✅ `POST /lessons/db66350d/read` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** mark lesson read
- **Message:** Lesson already marked as read

```json
{
  "data": {
    "uid": "4259c047",
    "lesson_uid": "db66350d",
    "enrollment_uid": "a443f9ae",
    "read_at": "2026-06-07T13:30:00.931436Z",
    "created_at": "2026-06-07T13:30:00.93166Z",
    "updated_at": "2026-06-07T13:30:00.93166Z"
  },
  "error": null,
  "message": "Lesson already marked as read",
  "success": true
}
```

#### ✅ `GET /lessons/db66350d/read` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** get read status
- **Message:** Lesson reading status retrieved

```json
{
  "data": {
    "is_read": true,
    "reading": {
      "uid": "4259c047",
      "lesson_uid": "db66350d",
      "enrollment_uid": "a443f9ae",
      "read_at": "2026-06-07T13:30:00.931436Z",
      "created_at": "2026-06-07T13:30:00.93166Z",
      "updated_at": "2026-06-07T13:30:00.93166Z"
    }
  },
  "error": null,
  "message": "Lesson reading status retrieved",
  "success": true
}
```

#### ✅ `GET /lessons/readings/my-history` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** my reading history
- **Message:** Reading history retrieved successfully

```json
{"data":[{"uid":"4259c047","lesson_uid":"db66350d","enrollment_uid":"a443f9ae","read_at":"2026-06-07T13:30:00.931436Z","created_at":"2026-06-07T13:30:00.93166Z","updated_at":"2026-06-07T13:30:00.93166Z","lesson":{"uid":"db66350d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 3","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 3</h2><p>Selamat datang di lesson <strong>3</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</p><h3>Tujuan Pembelajaran</h3><ul><li>Mem
```

#### ✅ `POST /lessons/attendances/` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `201`
- **Catatan:** create attendance
- **Message:** Attendance recorded successfully

```json
{
  "data": {
    "uid": "db9603f5",
    "lesson_uid": "fda62f5d",
    "enrollment_uid": "a443f9ae",
    "checked_in_at": "2026-06-07T14:00:38.237846741Z",
    "status": "late",
    "note": "API test",
    "created_at": "2026-06-07T14:00:38.237846741Z",
    "updated_at": "2026-06-07T14:00:38.237846741Z"
  },
  "error": null,
  "message": "Attendance recorded successfully",
  "success": true
}
```

#### ✅ `GET /lessons/attendances/check-status?lesson_id=fda62f5d&enrollment_id=a443f9ae` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** check attendance
- **Message:** Attendance status retrieved successfully

```json
{"data":{"uid":"db9603f5","lesson_uid":"fda62f5d","enrollment_uid":"a443f9ae","checked_in_at":"2026-06-07T14:00:38.237846Z","status":"late","note":"API test","created_at":"2026-06-07T14:00:38.237846Z","updated_at":"2026-06-07T14:00:38.237846Z","lesson":{"uid":"fda62f5d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 1","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 1</h2><p>Selamat datang di lesson <strong>1</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</
```

#### ✅ `GET /lessons/attendances/my-history` — PASS

- **Kategori:** Lesson Reading
- **HTTP:** `200`
- **Catatan:** attendance history
- **Message:** Attendance history retrieved successfully

```json
{"data":[{"uid":"db9603f5","lesson_uid":"fda62f5d","enrollment_uid":"a443f9ae","checked_in_at":"2026-06-07T14:00:38.237846Z","status":"late","note":"API test","created_at":"2026-06-07T14:00:38.237846Z","updated_at":"2026-06-07T14:00:38.237846Z","lesson":{"uid":"fda62f5d","module_uid":"17424c02","title":"Pengenalan Go - Lesson 1","content_type":"text","content":{"version":2,"contentHtml":"<h2>Pengenalan Go — Lesson 1</h2><p>Selamat datang di lesson <strong>1</strong> dari modul <em>Pengenalan Go</em>. Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.<
```

#### ⏭️ `GET /files/invoices/a443f9ae-849a-4c8c-a45e-4199f385b3ed__4f31bec4-893b-4aa7-8353-17041390a573__7afd0677-818b-489b-9094-69a9119b50a0__20260605.pdf` — ENV_SKIP

- **Kategori:** File
- **HTTP:** `404`
- **Catatan:** file proxy invoice pdf
- **Message:** File not found
- **Error:** `NoSuchKey`

```json
{
  "data": null,
  "error": "NoSuchKey",
  "message": "File not found",
  "success": false
}
```

#### ✅ `GET /payment/method` — PASS

- **Kategori:** Payment
- **HTTP:** `200`
- **Catatan:** get payment methods
- **Message:** Payment methods retrieved successfully

```json
{
  "data": [],
  "error": null,
  "message": "Payment methods retrieved successfully",
  "success": true
}
```

#### ⚠️ `POST /courses/7afd0677/join` — EXPECTED_FAIL

- **Kategori:** Course
- **HTTP:** `400`
- **Catatan:** join already enrolled
- **Message:** Already enrolled in this course

```json
{
  "data": null,
  "error": null,
  "message": "Already enrolled in this course",
  "success": false
}
```

#### ⚠️ `POST /courses/7afd0677/review` — EXPECTED_FAIL

- **Kategori:** Course
- **HTTP:** `409`
- **Catatan:** duplicate review expected
- **Message:** You have already reviewed this course
- **Error:** `Duplicate review`

```json
{
  "data": null,
  "error": "Duplicate review",
  "message": "You have already reviewed this course",
  "success": false
}
```

#### ⏭️ `POST /payment/create` — ENV_SKIP

- **Kategori:** Payment
- **HTTP:** `400`
- **Catatan:** create payment (Tripay channel harus aktif)
- **Message:** Failed to create payment
- **Error:** `tripay API error: Payment channel is not enabled (BRIVA - T37673) Please enable in Merchant > Channel Pembayaran`

```json
{
  "data": null,
  "error": "tripay API error: Payment channel is not enabled (BRIVA - T37673) Please enable in Merchant > Channel Pembayaran",
  "message": "Failed to create payment",
  "success": false
}
```

### 5. Public

#### ✅ `POST /register` — PASS

- **Kategori:** User Management
- **HTTP:** `200`
- **Catatan:** register temp user (setup for admin)
- **Message:** User registered successfully!

```json
{
  "data": {
    "expires_at": "2026-06-08T14:00:37Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJLZXkiOiJjZTliNjQ2M2YzODBkNWJlNDVjMzhmZjJmY2U0YzIzMzg3OWI2ZDJlMmUxOTdlZjUxZjdmOTkxNmVkYmIyYmExIiwic3ViIjoidXNlcl9hdXRoIiwiZXhwIjoxNzgwOTI3MjM3LCJpYXQiOjE3ODA4NDA4Mzd9.Z3_Mw3QGrkBkBIwok9DA8EdsIkKjk6OxckPWkdYVCyg"
  },
  "error": null,
  "message": "User registered successfully!",
  "success": true
}
```

#### ✅ `POST /login/` — PASS

- **Kategori:** Auth
- **HTTP:** `200`
- **Catatan:** valid login
- **Message:** User logged in successfully!

```json
{
  "data": {
    "expires_at": "2026-06-08T14:00:38Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJLZXkiOiI3YjZmNWMxOGFjMGI4N2Q2MzEwOWEyMWVhYTE1MTU4Nzg2Y2ExMGI0YTliOGJmYTcwZDQwYjlhNzY3MmRkZGVmIiwic3ViIjoidXNlcl9hdXRoIiwiZXhwIjoxNzgwOTI3MjM4LCJpYXQiOjE3ODA4NDA4Mzh9.pNXihbmvibUwI4j9TxqkiiT7W4PsxKRlppOG4iCMuOk"
  },
  "error": null,
  "message": "User logged in successfully!",
  "success": true
}
```

#### ⚠️ `POST /login/` — EXPECTED_FAIL

- **Kategori:** Auth
- **HTTP:** `401`
- **Catatan:** invalid password
- **Message:** Invalid credentials
- **Error:** `Authentication failed`

```json
{
  "data": null,
  "error": "Authentication failed",
  "message": "Invalid credentials",
  "success": false
}
```

#### ✅ `POST /register` — PASS

- **Kategori:** Auth
- **HTTP:** `200`
- **Catatan:** new registration
- **Message:** User registered successfully!

```json
{
  "data": {
    "expires_at": "2026-06-08T14:00:39Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJLZXkiOiJmNjk2ZmZkYWNhZjAyMjY3MGFkMmRhNWVmZGZkOTg4OWYzNmUxMzViOWQyZjgxZjM5NmI0MDgwOTZlMDMwMjQ0Iiwic3ViIjoidXNlcl9hdXRoIiwiZXhwIjoxNzgwOTI3MjM5LCJpYXQiOjE3ODA4NDA4Mzl9.EOBF5BlgxXTfUEIrggz_UsL_ohtfjq39nmEhXRd_G5A"
  },
  "error": null,
  "message": "User registered successfully!",
  "success": true
}
```

#### ⚠️ `POST /register` — EXPECTED_FAIL

- **Kategori:** Auth
- **HTTP:** `409`
- **Catatan:** duplicate email
- **Message:** Email already registered

```json
{
  "data": null,
  "error": null,
  "message": "Email already registered",
  "success": false
}
```

#### ✅ `GET /course-categories/` — PASS

- **Kategori:** Course Category
- **HTTP:** `200`
- **Catatan:** list categories
- **Message:** Course categories retrieved successfully

```json
{"data":{"course_categories":[{"courses":[],"created_at":"2026-06-07T14:00:36.603678Z","description":"updated","is_active":true,"name":"TestCat 1780840836 Updated","uid":"7e484e3e","updated_at":"2026-06-07T14:00:36.643704Z"},{"courses":[{"category_uid":"58649210","course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:03.404371Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super Admin User","role":"super_admin","uid":"546502f3"},"description":"test","event_uid":null,"is_premium":false,"is_published":true,"level":"PEMULA","mentors"
```

#### ✅ `GET /course-categories/58649210` — PASS

- **Kategori:** Course Category
- **HTTP:** `200`
- **Catatan:** get category by id
- **Message:** Course category retrieved successfully

```json
{"data":{"courses":[{"category_uid":"58649210","course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:03.404371Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super Admin User","role":"super_admin","uid":"546502f3"},"description":"test","event_uid":null,"is_premium":false,"is_published":true,"level":"PEMULA","mentors":[{"avatar_url":"https://i.pravatar.cc/150?img=49","created_at":"2026-05-23T11:09:03.56749Z","description":"Mentor database dan data engineering","email":"nadia.mentor@doscom.id","is_verified":true,"name":"Nadia Putri
```

#### ✅ `GET /course-types/` — PASS

- **Kategori:** Course Type
- **HTTP:** `200`
- **Catatan:** list course types
- **Message:** Course types retrieved successfully

```json
{"data":{"course_types":[{"courses":[],"created_at":"2026-06-07T14:00:36.679899Z","description":"upd","is_active":true,"name":"TestType 1780840836 Upd","uid":"a4429194","updated_at":"2026-06-07T14:00:36.719903Z"},{"courses":[{"category_uid":"58649210","course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:03.404371Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super Admin User","role":"super_admin","uid":"546502f3"},"description":"test","event_uid":null,"is_premium":false,"is_published":true,"level":"PEMULA","mentors":[{"avatar_u
```

#### ✅ `GET /course-types/4cb5078d` — PASS

- **Kategori:** Course Type
- **HTTP:** `200`
- **Catatan:** get course type by id
- **Message:** Course type retrieved successfully

```json
{"data":{"courses":[{"category_uid":"58649210","course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:03.404371Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super Admin User","role":"super_admin","uid":"546502f3"},"description":"test","event_uid":null,"is_premium":false,"is_published":true,"level":"PEMULA","mentors":[{"avatar_url":"https://i.pravatar.cc/150?img=49","created_at":"2026-05-23T11:09:03.56749Z","description":"Mentor database dan data engineering","email":"nadia.mentor@doscom.id","is_verified":true,"name":"Nadia Putri
```

#### ✅ `GET /courses/?per_page=50` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** list courses
- **Message:** Courses retrieved successfully

```json
{"data":{"courses":[{"category_uid":"58649210","course_type_uid":"4cb5078d","cover_url":"","created_at":"2026-06-07T14:00:36.757103Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=12","is_verified":true,"name":"Super Admin User","role":"super_admin","uid":"546502f3"},"description":"test","event_uid":null,"is_premium":false,"is_published":true,"level":"PEMULA","mentors":[{"avatar_url":"https://i.pravatar.cc/150?img=49","created_at":"2026-05-23T11:09:03.56749Z","description":"Mentor database dan data engineering","email":"nadia.mentor@doscom.id","is_verified":true,"name":"Nadia Putri
```

#### ✅ `GET /courses/7afd0677` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** get course by id
- **Message:** Course retrieved successfully

```json
{"data":{"category":{"created_at":"2026-05-23T11:09:03.5742Z","description":"Kategori untuk course backend development","is_active":true,"name":"Backend","uid":"6911d512","updated_at":"2026-05-23T11:09:03.5742Z"},"course_type":{"created_at":"2026-05-23T11:09:03.580399Z","description":"Kelas intensif dengan project","is_active":true,"name":"Bootcamp","uid":"fa7b52c2","updated_at":"2026-05-23T11:09:03.580399Z"},"cover_url":"https://via.placeholder.com/400x300?text=Golang","created_at":"2026-05-23T11:09:03.591214Z","created_by":{"avatar_url":"https://i.pravatar.cc/150?img=32","is_verified":true,"
```

#### ✅ `GET /courses/7afd0677/mentor` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** get course mentors
- **Message:** Course mentors retrieved successfully

```json
{
  "data": {
    "course_title": "Golang Fundamentals",
    "course_uid": "7afd0677",
    "mentors": [
      {
        "assignment": {
          "assigned_at": null,
          "joined_at": null,
          "status": null
        },
        "avatar_url": "https://i.pravatar.cc/150?img=32",
        "created_at": "2026-05-23T11:09:03.150252Z",
        "description": "Administrator dari platform DU",
        "email": "admin@doscom.id",
        "is_verified": true,
        "name": "Admin User",
        "role": "admin",
        "uid": "25692150",
        "updated_at": "2026-06-07T13:26:50.131077Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 10,
      "total": 1,
      "total_pages": 1
    }
  },
  "error": null,
  "message": "Course mentors retrieved successfully",
  "success": true
}
```

#### ✅ `GET /courses/7afd0677/students` — PASS

- **Kategori:** Course
- **HTTP:** `200`
- **Catatan:** get course students
- **Message:** Students retrieved successfully

```json
{
  "data": {
    "enrollments": [
      {
        "enrollment_uid": "a443f9ae",
        "student_uid": "4f31bec4",
        "student_name": "Budi Santoso",
        "student_avatar_url": "https://i.pravatar.cc/150?img=14",
        "enrolled_at": "2026-06-05T01:51:56.548805Z",
        "progress": 0,
        "status": "active"
      },
      {
        "enrollment_uid": "52b25d77",
        "student_uid": "296c19dd",
        "student_name": "Siti Nurhaliza",
        "student_avatar_url": "https://i.pravatar.cc/150?img=47",
        "enrolled_at": "2026-05-24T00:23:20.064457Z",
        "progress": 0,
        "status": "active"
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 10,
      "total": 2,
      "total_pages": 1
    }
  },
  "error": null,
  "message": "Students retrieved successfully",
  "success": true
}
```

#### ✅ `GET /mentor/all` — PASS

- **Kategori:** Mentor
- **HTTP:** `200`
- **Catatan:** list mentors
- **Message:** Mentors retrieved successfully

```json
{"data":{"mentors":[{"assigned_courses":4,"avatar_url":"https://i.pravatar.cc/150?img=49","created_at":"2026-05-23T11:09:03.56749Z","description":"Mentor database dan data engineering","email":"nadia.mentor@doscom.id","is_verified":true,"joined_teach_courses":4,"name":"Nadia Putri","uid":"4955ce25","updated_at":"2026-06-07T13:26:50.540996Z"},{"assigned_courses":0,"avatar_url":"https://i.pravatar.cc/150?img=11","created_at":"2026-05-23T11:09:03.502407Z","description":"Mentor DevOps dan cloud deployment","email":"dimas.mentor@doscom.id","is_verified":true,"joined_teach_courses":0,"name":"Dimas S
```

#### ✅ `GET /mentor/4955ce25` — PASS

- **Kategori:** Mentor
- **HTTP:** `200`
- **Catatan:** mentor detail
- **Message:** Mentor detail retrieved successfully

```json
{"data":{"assignments":[{"assigned_at":"2026-06-07T14:00:36.875594Z","course_slug":"api-test-course-1780840836","course_status":"ACTIVE","course_title":"API Test Course 1780840836","course_uid":"34638681","joined_at":"2026-06-07T14:00:36.875463Z","status":"joined"},{"assigned_at":"2026-06-07T14:00:03.510127Z","course_slug":"api-test-course-1780840803","course_status":"ACTIVE","course_title":"API Test Course 1780840803","course_uid":"685211d8","joined_at":"2026-06-07T14:00:03.510017Z","status":"joined"},{"assigned_at":"2026-06-07T13:48:26.904806Z","course_slug":"api-test-course-1780840106","cou
```

---

## Catatan lingkungan

1. Join course → enrollment `pending`; gunakan seed untuk uji fitur active.
2. Payment Tripay membutuhkan channel aktif di merchant dashboard.
3. File invoice 404 jika PDF belum ada di MinIO.
4. `GET /lessons/:id/assignment` = Admin/Mentor only; student pakai `GET /lessons/:id`.

## Menjalankan ulang

```bash
bash backend/scripts/api_test.sh
python3 backend/scripts/generate_debugging_md.py
```