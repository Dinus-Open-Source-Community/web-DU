# Laporan Audit Arsitektur Data & Alur Caching Redis — Platform DKelas

**Status:** Selesai (Analisis Statis & Alur Data Lengkap Berbasis Kode Sumber)  
**Target Aplikasi:** DKelas (Arsitektur Monolith: Go Gin Backend + React TypeScript Frontend + PostgreSQL + Garage S3 Storage)  
**Fokus Audit:** Integrasi Caching Layer Redis, Analisis Volatilitas Data, Rekomendasi TTL Individual, Pola Penamaan Key, dan Strategi Invalidation.

---

## DAFTAR ISI

1. [A. Project Architecture Overview](#a-project-architecture-overview)
2. [B. Data Inventory](#b-data-inventory)
3. [C. Data Flow Mapping (End-to-End dengan Bukti Source Code)](#c-data-flow-mapping)
4. [D. Cacheability Assessment](#d-cacheability-assessment)
5. [E. TTL Recommendation Matrix](#e-ttl-recommendation-matrix)
6. [F. Cache Invalidation Strategy](#f-cache-invalidation-strategy)
7. [G. Redis Key Naming Recommendation & Schema Security](#g-redis-key-naming-recommendation--schema-security)
8. [H. Implementation Priority & Roadmap](#h-implementation-priority--roadmap)
9. [I. Findings, Architectural Risks & Next Steps](#i-findings-architectural-risks--next-steps)

---

## A. PROJECT ARCHITECTURE OVERVIEW

### 1. Frontend Architecture
- **Framework & Runtime:** React 19 (`react@19.2.5`, `react-dom@19.2.5`) dengan TypeScript (`typescript@6.0.2`), di-bundle menggunakan Vite 8 (`vite@8.0.10`).
- **Routing:** React Router DOM v7 (`react-router-dom@7.14.2`), konfigurasi declaratif di `frontend/src/App.tsx` (L1-L555) dengan lazy loading (`React.lazy`) dan rute fallback suspense khusus per domain fitur.
- **State Management & Data Fetching:**
  - Client-side cache & remote state: `@tanstack/react-query@5.100.14` (`frontend/src/providers/query-providers.tsx` L1-L51).
  - Konfigurasi default React Query: `staleTime: 5 menit (300.000 ms)`, `gcTime: 30 menit`, `refetchOnWindowFocus: false`, `refetchOnMount: true`, `retry: 1`.
  - Beberapa hook menerapkan `staleTime` manual (30s s/d 120s) untuk data operasional/dasbor dinamis.
  - State lokal & context: Auth Context (`frontend/src/providers/auth-provider.tsx`), Theme Provider, Motion Provider. Catatan: Package `react-redux` terpasang di `package.json` L60 namun seluruh alur data aplikasi aktif sepenuhnya menggunakan React Query dan React Context.
- **HTTP Client:** Axios v1.16.1 (`frontend/src/services/axios.ts` L1-L39) dengan interceptor bearer token Authorization dari cookie `du_access_token` (`js-cookie@3.0.5`), `withCredentials: true`, dan basis URL dari env `VITE_BACKEND_URL`.
- **UI & Rich Text:** Tailwind CSS v4 (`@tailwindcss/vite@4.2.4`), komponen berbasis Radix UI / Shadcn, dan TipTap v3 (`@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`) untuk rich text editor materi kursus dan deskripsi tugas.

### 2. Backend Architecture
- **Bahasa & Framework:** Go 1.25.1 (`backend/go.mod` L1-L81) dengan Gin Web Framework v1.11.0 (`backend/main.go` L1-L139).
- **Database & Driver:** PostgreSQL 15 (`postgres:15` di Docker) dengan ORM GORM v1.31.0 dan driver `gorm.io/driver/postgres` v1.6.0 (`pgx/v5` pooling).
- **Arsitektur Backend:** Monolith layered architecture yang ringkas:
  - `main.go`: Entry point, setup CORS, normalisasi URL trailing slash, recovery, global middleware UID truncation, inisialisasi MinIO/Garage S3, database connection, dan registrasi routing via `setup.SetupAllRoutes(r)`.
  - `internal/database/`: Koneksi GORM (`connection.go`), Enum PostgreSQL idempotent (`enum.go`), resolver UID prefix hex (`uid.go`), database seeder (`seeder.go`).
  - `internal/handler/middleware/`: CORS middleware (`cors.go`), Auth JWT (`jwt.go`), RBAC (`middleware.go`), API Key external (`external_api_key.go`), UID shortener response rewriter (`uid_truncate.go`).
  - `internal/handler/routes/`: Router registration modular menggunakan pattern `init() -> setup.RegisterRoute(handler)`.
  - `internal/service/`: Business logic, database query via `database.DB`, enkripsi/dekripsi, DTO mapping, dan HTTP response handling.
  - `internal/model/entity/`: Definisi struct tabel GORM dengan hook `AfterFind`, `BeforeSave`, dan `AfterSave`.
  - `internal/model/dto/`: Data Transfer Objects untuk payload JSON binding request.
  - `internal/utils/`: AES-256-GCM cipher & HMAC blind index (`bycrpt.go`), Garage S3 Storage client (`minio.go`), UID helper regex (`uid.go`).

### 3. Object Storage
- **Garage S3 Storage** (`dxflrs/garage:v2.4.1`) dikelola via MinIO Go SDK (`minio-go/v7` v7.0.98 di `backend/internal/utils/minio.go`).
- Memiliki 4 bucket utama: `avatars`, `courses`, `lesson-assignments`, dan `galleries`.

### 4. Mekanisme Keamanan Khusus (Sangat Krusial untuk Redis)
1. **Application-Level Envelope Encryption (AES-256-GCM + HMAC Blind Index):**
   - Kolom teks sensitif (`User.Name`, `User.Email`, `Course.Title`, `Course.Subtitle`, `Course.Description`, `Module.Title`, `Lesson.Title`, `LessonAssignment.Title`, `LessonAssignmentSubmission.PlainText`, `CourseReview.Comment`, `CourseQaThread.Title`, `CourseQaThread.Body`, dll.) **dienkripsi menggunakan AES-GCM dengan random nonce per enkripsi**.
   - Kolom yang dienkripsi tidak deterministik, sehingga SQL `ILIKE` tidak dapat mencari isi teks di tingkat database. Akibatnya, beberapa fitur pencarian (Search User, Search Course, Search Candidate Student, Search QA) **memuat semua record dari database lalu mendekripsi satu per satu di memori backend (O(N) CPU cost)** sebelum memfilter!
   - Untuk login/lookup user via email, sistem menggunakan HMAC-SHA256 blind index (`email_hash`) yang deterministik (`internal/utils/bycrpt.go` L43-L56).
2. **ShortenUIDs Response Interceptor Middleware:**
   - Di `backend/internal/handler/middleware/uid_truncate.go` (L72-L110), Gin membungkus ResponseWriter dengan `shortenUIDsBodyWriter`. Seluruh respons bertipe `application/json` dipindai menggunakan regex `uidJSONRegex` dan UUID 36-karakter dipotong menjadi 8-karakter hex pertama sebelum dikirim ke frontend.
   - Resolver di `backend/internal/database/uid.go` (`ResolveUID`) menangani lookup input baik yang berupa 8-karakter hex maupun UUID 36-karakter via `WHERE uid::text LIKE '<prefix>%'`.
   - **Implikasi Redis:** Redis cache key **WAJIB** menggunakan Canonical Full UUID (`36 karakter`), bukan shortened UID, untuk mencegah ambiguitas atau collision key.
3. **Mekanisme Autentikasi Stateless JWT tapi State-Bound:**
   - JWT (`golang-jwt/jwt/v5`) menyimpan claims `Key: user.email_hash` dengan masa aktif 24 jam (`internal/handler/middleware/jwt.go` L39-L55).
   - Namun di `AuthMiddleware` (`internal/handler/middleware/middleware.go` L72-L88), **setiap request berotentikasi selalu melakukan query database**:
     `database.DB.Model(&entity.User{}).Where("email_hash = ?", claims.Key).First(&userData)`
     serta memverifikasi `userData.IsVerified`.
   - Query ini dieksekusi terus-menerus di hot-path middleware.

---

## B. DATA INVENTORY

Berikut adalah seluruh entitas data dan dataset operasional yang ada pada aplikasi DKelas:

| No | Entitas / Jenis Data | Sumber Tabel / Storage | Endpoint / Akses Utama | Controller / Service | Karakteristik Akses & Relasi |
|---|---|---|---|---|---|
| 1 | **User Identity & Credential** | Tabel `users` | `POST /login`, `POST /register`, `GET /oauth/*`, `GET /auth/sso/*` | `service/login.go`, `service/register.go`, `service/oauth.go`, `service/sso.go` | Private, sensitif (Password bcrypt, Email/Name terenkripsi AES, blind index `email_hash`). Dibaca saat autentikasi. |
| 2 | **User Auth Session State** | Tabel `users` via `email_hash` | Seluruh endpoint dengan `middleware.AuthMiddleware()` | `middleware/middleware.go` (L72-L88) | Global hot-path, private per token JWT. Query single row `WHERE email_hash = ?` di setiap HTTP request berotentikasi. |
| 3 | **Self User Profile & Joined Courses** | Tabel `users`, `enrollments`, `courses`, `course_reviews` | `GET /user/data` | `service/user.go` (`GetSelfUserDetailService` L36-L548) | Private per user. Multi-table agregasi: profil user, kursus yang diikuti, progres belajar, review yang diberikan, ringkasan enrollment, dan kursus yang dimentori. |
| 4 | **Managed User Directory** | Tabel `users`, `enrollments` | `GET /user/manage/all`, `GET /user/:id` | `service/user.go` (`GetAllUsersService` L1269, `GetUserDetailByIDService` L66) | Admin/Super Admin only. Paginasi, filter role, pencarian in-memory dengan dekripsi seluruh data user. |
| 5 | **Public Course Catalog & Filter** | Tabel `courses`, `users`, `course_mentors`, `course_reviews` | `GET /courses` | `service/course.go` (`GetAllCoursesFunc` L734-L864) | Public. Menampilkan kursus berstatus `ACTIVE`. Melibatkan preloading mentor, kategori, tipe kelas, dan kalkulasi ringkasan ulasan (rating rata-rata & jumlah ulasan). Jika ada query `title`, memuat seluruh kursus dan didekripsi di memori. |
| 6 | **Course Detail with Curriculum & Reviews** | Tabel `courses`, `modules`, `lessons`, `course_categories`, `class_types`, `users`, `course_reviews`, `course_review_replies`, `enrollments` | `GET /courses/:id` | `service/course.go` (`GetCourseByIDFunc` L876-L926) | Public. Query kompleks: preloads modules (order_index ASC), category, class_type, primary mentor, course_mentors m2m, review list beserta replies dan author, serta count total enrollments aktif. |
| 7 | **Course Mentors List** | Tabel `course_mentors`, `courses`, `users` | `GET /courses/:id/mentor` | `service/mentor.go` (`GetCourseMentorsByCourseIDFunc` L379-L540) | Public. Mengambil mentor yang ditugaskan ke kursus beserta fallback mentor legacy. |
| 8 | **Course Students Enrolled Roster** | Tabel `enrollments`, `users`, `lesson_readings`, `lesson_assignments`, `lesson_assignment_submissions` | `GET /courses/:id/students` | `service/course.go` (`GetCourseStudentsFunc` L1254-L1386) | Public / Staff. Menampilkan daftar siswa terdaftar, progress aktual (dihitung dinamis dari lesson_readings + submissions), dan waktu aktivitas terakhir (`MAX(read_at)`). |
| 9 | **Course Candidate Students (Roster & Redeem)** | Tabel `users`, `enrollments` | `GET /courses/:id/candidate-students`, `GET /admin/redeem-codes/candidate-students` | `service/course_participants.go` (L87-L220), `service/redeem_code.go` (L993-L1148) | Admin/Mentor. Subquery `WHERE uid NOT IN (SELECT user_uid FROM enrollments WHERE course_uid = ?)`. Memuat candidate user dan didekripsi di memori saat ada pencarian nama/email. |
| 10 | **Student Course Progress Calculation** | Tabel `lessons`, `modules`, `lesson_assignments`, `enrollments`, `lesson_readings`, `lesson_assignment_submissions` | `GET /courses/:id/progress` | `service/course.go` (`GetCourseProgressFunc` L1408-L1564) | Private per user. Menghitung formula dinamis: `(lessons_read + assignments_submitted) / (total_lessons + total_assignments)`. Melibatkan 4 query agregasi terpisah. |
| 11 | **Course Categories** | Tabel `course_categories` | `GET /course-categories`, `GET /course-categories/:id` | `service/course_master.go` (`GetAllCourseCategoriesFunc` L52-L127, L138) | Public & Admin. Master data kategori kursus berserta preload daftar kursusnya. Jarang berubah. |
| 12 | **Course Types (Class Types)** | Tabel `class_types` | `GET /course-types`, `GET /course-types/:id` | `service/course_master.go` (`GetAllClassTypesFunc` L385-L460, L471) | Public & Admin. Master data tipe pelaksanaan kelas (online/offline/dsb). Jarang berubah. |
| 13 | **Curriculum Modules** | Tabel `modules`, `lessons` | `GET /modules/course/:course_id`, `GET /modules/:id` | `service/module.go` (`GetAllModulesFunc` L41-L193, L207) | Enrolled Student / Staff. Daftar modul per kursus terurut `order_index ASC`, dengan preloading metadata ringkas lesson. |
| 14 | **Lessons Content & Viewer Data** | Tabel `lessons`, `modules`, `lesson_assignments` | `GET /lessons`, `GET /lessons/:id` | `service/lessons.go` (`GetAllLessonsFunc` L182-L359, `GetLessonByIDFunc` L377-L424) | Enrolled Student / Staff. Memuat judul, tipe konten (text/video), video URL, TipTap Rich Text JSON/HTML, dan assignment terlampir. Pada endpoint list, menjalankan batch lookup status baca `is_reading`. |
| 15 | **Lesson Reading Status & History** | Tabel `lesson_readings`, `enrollments`, `lessons` | `GET /lessons/:id/read`, `GET /lessons/readings/my-history`, `GET /lessons/readings/lesson/:lesson_id` | `service/lesson_reading.go` (L228-L343, L358-L447, L460-L534) | Private Student / Staff. Mencatat dan memeriksa pembacaan materi. Idempotent per pasangan lesson + enrollment. |
| 16 | **Lesson Assignment Configuration** | Tabel `lesson_assignments`, `lessons`, `modules` | `GET /lessons/:id/assignment` | `service/lesson_assignment.go` (`GetLessonAssignmentFunc` L121-L153) | Staff / Student. Aturan tugas, deadline, jenis penyerahan (file, text, rich text), auto-close, kuis JSON. |
| 17 | **Course Assignments Overview (Bulk)** | Tabel `lesson_assignments`, `lessons`, `modules`, `courses`, `lesson_assignment_submissions` | `GET /courses/:id/assignments` | `service/course_assignments.go` (`GetCourseAssignmentsFunc` L115-L238) | Admin / Mentor. Join 4 tabel: `lesson_assignments` + `lessons` + `modules` + `courses` dengan subquery penghitungan submission per tugas. |
| 18 | **Student Personal Assignment List** | Tabel `lesson_assignments`, `lessons`, `modules`, `courses`, `enrollments`, `lesson_assignment_submissions` | `GET /students/me/assignments` | `service/course_assignments.go` (`GetStudentMyAssignmentsFunc` L334-L583) | Private Student. Join 5 tabel untuk menghasilkan daftar tugas yang harus dikerjakan siswa di seluruh kursus yang diikutinya beserta status pengumpulan dan penilaian. |
| 19 | **Student Assignment Submissions & Attempts** | Tabel `lesson_assignment_submissions`, `lesson_assignment_submission_attempts` | `GET /lessons/:id/assignment/submission` | `service/lesson_assignment_submission.go` (`GetMyLessonAssignmentSubmissionFunc` L362-L445) | Private Student. Memuat riwayat pengumpulan, draf teks/file, skor kuis, dan feedback penilaian mentor. |
| 20 | **Staff Assignment Submissions Roster & Grading** | Tabel `lesson_assignment_submissions`, `users` | `GET /lessons/:id/assignment/submissions`, `GET /lessons/:id/assignment/submissions/:submissionUid` | `service/lesson_assignment_submission.go` (L458-L507, L521-L570) | Staff only. Mengambil seluruh jawaban siswa untuk tugas tertentu untuk diperiksa dan dinilai. |
| 21 | **Admin Moderation: Reviews** | Tabel `course_reviews`, `course_review_replies`, `users`, `courses` | `GET /admin/reviews` | `service/admin_reviews.go` (`GetAdminReviewsFunc` L73-L174) | Admin & Assigned Mentor. Paginasi review seluruh kursus dengan replier info dan filter status reply. |
| 22 | **Admin Moderation: Q&A Threads & Replies** | Tabel `course_qa_threads`, `course_qa_replies`, `users`, `courses` | `GET /admin/qna` | `service/admin_qna.go` (`GetAdminQnaFunc` L31-L133) | Admin & Assigned Mentor. Forum tanya-jawab kursus, mendeteksi thread terjawab vs belum dijawab oleh staf. |
| 23 | **Mentor Dashboard KPIs & Schedules** | Tabel `courses`, `course_mentors`, `enrollments`, `lesson_assignment_submissions`, `course_qa_threads`, `lessons`, `class_types`, `events` | `GET /mentor/dashboard/kpis`, `GET /mentor/dashboard/schedules` | `service/mentor_dashboard.go` (`GetMentorDashboardKPIsFunc` L185-L213, `GetMentorDashboardSchedulesFunc` L230-L333) | Mentor & Admin. Agregasi multi-tabel: pending grading tugas teks, unanswered QA threads, active students terdaftar, total courses dibimbing, dan kalender jadwal mengajar. |
| 24 | **Admin Dashboard KPIs & Analytics** | Tabel `users`, `courses`, `enrollments` | `GET /admin/dashboard/kpis`, `GET /admin/dashboard/analytics` | `service/admin_dashboard.go` (`GetAdminDashboardKPIsFunc` L299-L334, `GetAdminDashboardAnalyticsFunc` L347-L376) | Admin/Super Admin only. Agregasi statistik platform: active users per period (7d/30d/90d/12m), total students, active courses, completion rate, top enrolled courses, enrollment trend harian, distribusi progres, dan aktivitas mentor. |
| 25 | **Public Mentors Directory** | Tabel `users`, `courses`, `course_mentors` | `GET /mentor/all`, `GET /mentor/:id` | `service/mentor.go` (`GetAllMentorsFunc` L618-L723, `GetMentorDetailFunc` L736-L885) | Public. Direktori mentor publik beserta daftar kelas yang diampu dan ringkasan ulasan kelas. |
| 26 | **Public & Admin Galleries** | Tabel `galleries` | `GET /galleries`, `GET /galleries/:id` | `service/gallery.go` (`GetAllGalleriesFunc` L93-L174, `GetGalleryByIDFunc` L185-L208) | Public & Admin. Foto dokumentasi kegiatan, URL gambar Garage S3, caption, dan scrapbook variant (0-5). |
| 27 | **Redeem Codes Directory** | Tabel `redeem_codes`, `courses`, `redeem_code_usages`, `users` | `GET /admin/redeem-codes` | `service/redeem_code.go` (`ListRedeemCodesFunc` L755-L883) | Admin / Mentor. Pengelolaan voucher pendaftaran kursus (kuota, target email, expiration, usage stats). |
| 28 | **Transient Auth State (OTP & Email Confirmation)** | Tabel `otps`, `email_change_requests` | `POST /verify-otp`, `POST /resend-otp`, `POST /user/email/confirm` | `service/otp.go`, `service/email_change.go` | Private & Public. Token verifikasi dengan TTL masa berlaku 10-30 menit, rate limit cooldown 60 detik. |

---

## C. DATA FLOW MAPPING

Berikut pemetaan aliran data lengkap dari antarmuka pengguna frontend, router, handler/controller backend, query database, hingga respon balik ke client:

```
[ Frontend View / Hook ] 
       │ (Axios GET/POST/PUT/PATCH/DELETE)
       ▼
[ Backend Route Engine ] 
       │ (CORS -> ShortenUIDs -> AuthMiddleware / RoleGuard)
       ▼
[ Backend Service Handler ] 
       │ (GORM ORM Query / Transactions / S3 API)
       ▼
[ PostgreSQL / Garage S3 Storage ]
```

### 1. Alur Autentikasi Pengguna & Sesi (User Session Flow)
- **Frontend Pemicu:** `frontend/src/providers/auth-provider.tsx` (L185-L204 `refreshProfile`) memanggil `getAuthenticatedUser()` di `frontend/src/services/auth.ts` (L50-L55).
- **Frontend Interceptor:** `frontend/src/services/axios.ts` (L27-L38) menyuntikkan header `Authorization: Bearer <du_access_token>`.
- **Backend Entry Middleware:** `backend/internal/handler/middleware/middleware.go` (L21-L91 `AuthMiddleware`):
  - L59: `ParseToken(tokenStr)` memvalidasi HMAC-SHA256 signature dan expiry JWT (`jwt.go` L57-L92).
  - L73-L74: `database.DB.Model(&entity.User{}).Where("email_hash = ?", claims.Key).First(&userData)`.
  - L86-L87: `c.Set("uid", userData.Uid)` dan `c.Set("role", userData.Role)`.
- **Backend Route & Controller:** `backend/internal/handler/routes/user.go` (L24) merutekan `GET /user/data` ke `service.GetSelfUserDetailService` di `backend/internal/service/user.go` (L36-L548).
- **Database Query:**
  - `user.go` L110: `database.DB.Select(...).First(&userData, targetUID)` (mengambil profil user, `AfterFind` hook mendekripsi Name dan Email).
  - `user.go` L124-L130: `database.DB.Where("user_uid = ?", targetUID).Preload("Course.Mentor").Find(&enrollments)`.
  - `user.go` L178-L184: `SELECT m.course_uid, COUNT(l.uid) FROM lessons l JOIN modules m ... GROUP BY m.course_uid`.
  - `user.go` L197-L203: `SELECT enrollment_uid, COUNT(uid) FROM lesson_readings WHERE enrollment_uid IN ... GROUP BY enrollment_uid`.
  - `user.go` L215-L222: `SELECT m.course_uid, COUNT(la.uid) FROM lesson_assignments la ... GROUP BY m.course_uid`.
  - `user.go` L236-L242: `SELECT m.course_uid, COUNT(DISTINCT sub.lesson_assignment_uid) FROM lesson_assignment_submissions sub ... GROUP BY m.course_uid`.
  - `user.go` L297-L324: Query tugas dan status pengerjaan siswa pada seluruh kursus yang diikutinya.
  - `user.go` L410-L422: `SELECT cr.uid, cr.rating, cr.comment, c.uid, c.title FROM course_reviews cr ...`.
  - `user.go` L487-L501: Query kursus yang dimentori jika user adalah mentor.

### 2. Alur Katalog Kursus Publik (Public Course Catalog Flow)
- **Frontend Pemicu:** Halaman `frontend/src/pages/landing/Course.tsx` (L79-L85) memanggil hook `useCourses(params)` di `frontend/src/hooks/use-course.ts` (L37-L70) yang mengeksekusi `fetchCourses(params)` di `frontend/src/services/course.ts` (L55-L61).
- **Backend Route:** `backend/internal/handler/routes/course.go` (L18) `GET /courses` menuju `service.GetAllCoursesFunc` di `backend/internal/service/course.go` (L734-L864).
- **Backend Controller & Service Logic:**
  - `course.go` L755-L757: `db := database.DB.Model(&entity.Course{}).Where("status = ?", entity.CourseStatusActive)`. Filter kategori, tipe kelas, level diaplikasikan via `applyCourseListFilters` (L687-L717).
  - Kasus Filter Title (`course.go` L769-L820): Jika `title` terisi, backend **wajib memuat seluruh baris kursus aktif** via `db.Preload("Mentor").Find(&allCourses)`, menjalankan hook GORM `AfterFind` untuk dekripsi AES, lalu memfilter dengan `strings.Contains(strings.ToLower(course.Title), needle)` dan melakukan slicing pagination manual di memori.
  - Kasus Tanpa Filter Title (`course.go` L823-L845): Backend menjalankan `db.Count(&total)` lalu query berpaginasi `Limit(perPage).Offset(offset).Find(&courses)`.
  - Kalkulasi Rating Agregat (`course.go` L848 & `course_review_response.go` L34-L63): Menjalankan query agregasi `SELECT course_uid, AVG(rating), COUNT(*) FROM course_reviews WHERE course_uid IN ? GROUP BY course_uid` untuk menyematkan skor ulasan ke setiap kursus dalam daftar.
- **Response Filter:** Diproses oleh `ShortenUIDsMiddleware` (`uid_truncate.go` L98-L101) untuk memotong UUID menjadi 8 char hex.

### 3. Alur Detail Kursus & Kurikulum (Course Detail & Curriculum Flow)
- **Frontend Pemicu:** `frontend/src/pages/courses/detail.tsx` (L20) dan `frontend/src/hooks/use-course.ts` (L121-L147 `useCourseDetail`) memanggil `fetchCourseByUid(uid)` di `frontend/src/services/course.ts` (L63-L70).
- **Backend Route:** `backend/internal/handler/routes/course.go` (L19) `GET /courses/:id` menuju `service.GetCourseByIDFunc` di `backend/internal/service/course.go` (L876-L926).
- **Backend Query Execution:**
  - `course.go` L877: `resolveUIDParam(c, "courses", "id", "course")` menerjemahkan prefix hex 8-char menjadi UUID 36-karakter (`uid.go` L36-L76).
  - `course.go` L883-L886: GORM query dengan multi-preloading: `Modules` (order_index ASC), `Category`, `ClassType`, `Mentor`, `Mentors` (m2m `course_mentors`), `CreatedBy`, dan `CourseMentors`.
  - `course.go` L895 & `course_review_response.go` L64-L76: `fetchCourseReviewsByCourseUID` memuat semua review beserta relasi user replier dan author review terurut `created_at DESC`.
  - `course.go` L907-L910: Query count enrollment siswa aktif: `SELECT COUNT(*) FROM enrollments e JOIN users u ON u.uid = e.user_uid WHERE e.course_uid = ? AND u.role = 'student'`.

### 4. Alur Pembacaan Materi & Pelacakan Progres Belajar (Lesson Reading & Progress Flow)
- **Frontend Pemicu:** `frontend/src/pages/courses/view.tsx` (L9-L13) melalui hook `useCourseLessonReading` di `frontend/src/hooks/use-course-lesson-reading.ts` (L49-L62 dan L94-L134).
- **Backend Route & Controller:**
  - Status baca: `GET /lessons/:id/read` -> `service.GetLessonReadingStatusFunc` di `backend/internal/service/lesson_reading.go` (L228-L343).
  - Tandai baca: `POST /lessons/:id/read` -> `service.MarkLessonAsReadFunc` di `backend/internal/service/lesson_reading.go` (L77-L207).
  - Progres kursus: `GET /courses/:id/progress` -> `service.GetCourseProgressFunc` di `backend/internal/service/course.go` (L1408-L1564).
- **Database Operations:**
  - `lesson_reading.go` L127-L133: Query enrollment user untuk kursus dari modul lesson tersebut.
  - `lesson_reading.go` L156-L160: Query pengecekan idempoten record `lesson_readings WHERE lesson_uid = ? AND enrollment_uid = ?`.
  - `lesson_reading.go` L172-L179: Insert record baru ke `lesson_readings`.
  - `course.go` L1433-L1532: Query agregasi total lesson, total assignment terbit, total lesson terbaca oleh siswa, dan total assignment yang telah dikumpulkan untuk menghitung rasio progres `0.0 - 1.0`.

### 5. Alur Pengumpulan & Penilaian Tugas (Lesson Assignment Submission Flow)
- **Frontend Pemicu:** `frontend/src/hooks/use-lesson-assignment.ts` (L35-L40 dan L80-L99) memanggil `submitLessonAssignment` di `frontend/src/services/lesson-assignment.ts` (L117-L142).
- **Backend Route & Controller:**
  - Get submission: `GET /lessons/:id/assignment/submission` -> `service.GetMyLessonAssignmentSubmissionFunc` di `backend/internal/service/lesson_assignment_submission.go` (L362-L445).
  - Create submission: `POST /lessons/:id/assignment/submission` -> `service.CreateLessonAssignmentSubmissionFunc` (L53-L181).
  - Update/resubmit: `PUT /lessons/:id/assignment/submission` -> `service.UpdateLessonAssignmentSubmissionFunc` (L197-L349).
- **Database & Storage Operations:**
  - Jika tugas kuis (`task_type = 'quiz'`), `applyQuizAutoGradeToSubmission` (`lesson_assignment_grading.go` L24-L105) mencocokkan `quiz_answers` dengan `correctOptionId` di `quiz_payload` dan menghitung skor otomatis secara real-time.
  - Jika tugas teks (`task_type = 'text'`), lampiran file diunggah ke Garage S3 (`utils.UploadFile`), teks dienkripsi AES, dan record dibuat di `lesson_assignment_submissions`.
  - Menyimpan snapshot historis ke `lesson_assignment_submission_attempts` (`lesson_assignment_submission_attempt.go` L38-L41).

### 6. Alur Penukaran Kode Redeem Kursus (Course Redeem Flow)
- **Frontend Pemicu:** `frontend/src/pages/student/Redeem.tsx` (L40-L48) memanggil `redeemCourseCode({ code })` di `frontend/src/services/redeem.ts` (L86-L94).
- **Backend Route & Controller:** `POST /students/redeem` (dan `/redeem`) -> `service.RedeemCourseCodeFunc` di `backend/internal/service/redeem_code.go` (L75-L413).
- **Database Operations:**
  - `redeem_code.go` L135: Query `redeem_codes WHERE UPPER(code) = UPPER(?)`.
  - `redeem_code.go` L147-L247: Validasi status aktif, waktu kedaluwarsa, kuota `used_count < max_uses`, target email, dan verifikasi status kursus.
  - `redeem_code.go` L248-L387: **Transaksi Atomic Kritis**:
    - `tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&lockedCourse)` untuk mencegah race condition kuota slot kursus.
    - `tx.Model(&entity.RedeemCode{}).Where("uid = ? AND (max_uses <= 0 OR used_count < max_uses)", ...).Update("used_count", gorm.Expr("used_count + 1"))`.
    - Insert riwayat penggunaan ke `redeem_code_usages`.
    - Upsert status pendaftaran siswa ke `enrollments` menjadi `active`.

### 7. Alur Dashboard Statistik & Analitik (Dashboard & Analytics Flow)
- **Frontend Pemicu:**
  - Admin: `frontend/src/pages/admin/Dashboard.tsx` via `frontend/src/hooks/use-admin-dashboard.ts` (L17-L28).
  - Mentor: `frontend/src/pages/mentor/Dashboard.tsx` via `frontend/src/hooks/use-mentor-dashboard.ts` (L75-L91).
- **Backend Route & Controller:**
  - Admin KPIs: `GET /admin/dashboard/kpis` -> `service.GetAdminDashboardKPIsFunc` (`admin_dashboard.go` L299-L334).
  - Admin Analytics: `GET /admin/dashboard/analytics` -> `service.GetAdminDashboardAnalyticsFunc` (`admin_dashboard.go` L347-L376).
  - Mentor KPIs: `GET /mentor/dashboard/kpis` -> `service.GetMentorDashboardKPIsFunc` (`mentor_dashboard.go` L185-L213).
  - Mentor Schedules: `GET /mentor/dashboard/schedules` -> `service.GetMentorDashboardSchedulesFunc` (`mentor_dashboard.go` L230-L333).
- **Database Queries (Sangat Berat / CPU-Intensive):**
  - `admin_dashboard.go` L91-L100: Subquery distinct enrollments per range waktu untuk active users.
  - `admin_dashboard.go` L124-L137: Count enrollments dengan progress = 1.0 untuk completion rate.
  - `admin_dashboard.go` L146-L171: Top enrolled courses dengan `LEFT JOIN enrollments GROUP BY c.uid, c.title`.
  - `admin_dashboard.go` L178-L195: Enrollment trend harian `DATE(enrolled_at), COUNT(*) GROUP BY DATE(enrolled_at)`.
  - `admin_dashboard.go` L202-L218: Distribusi siswa berbasis CASE expression progress (Belum mulai, Sedang berjalan, Hampir selesai, Selesai).
  - `admin_dashboard.go` L226-L247: Top active mentors join courses & enrollments.
  - `mentor_dashboard.go` L85-L115: Count pending grading tugas teks dan unanswered QA threads menggunakan subquery `NOT EXISTS (SELECT 1 FROM course_qa_replies r JOIN users u ... WHERE u.role IN ('mentor', 'admin', 'super_admin'))`.

---

## D. CACHEABILITY ASSESSMENT

Evaluasi kelayakan Redis didasarkan pada rasio baca/tulis (*read-to-write ratio*), biaya komputasi/query (*query cost*), tingkat sensitivitas data, serta risiko *stale data* dan isolasi multi-tenant.

| Kategori | Definisi & Kriteria Evaluasi |
|---|---|
| **RECOMMENDED** | Data sering dibaca (high read), jarang berubah, query database melibatkan kalkulasi/JOIN/dekripsi memori, atau data referensi publik/global yang aman disimpan di Redis. Manfaat performa sangat tinggi dengan risiko minimal. |
| **CONDITIONAL** | Data layak di-cache HANYA jika dipartisi dengan identitas user/role (`user_id`), atau memerlukan invalidation trigger yang ketat dan presisi pada setiap mutasi data agar tidak menampilkan data usang. |
| **NOT RECOMMENDED** | Data transaksional murni yang membutuhkan konsistensi ACID 100%, data autentikasi sementara bervolume rendah (OTP, password hash), data sensitif yang berisiko kebocoran jika di-cache, atau operasi tulis cepat yang tidak pernah dibaca berulang. |

### Tabel Evaluasi Kelayakan Redis Seluruh Data DKelas:

| No | Dataset / Entitas | Read Pattern | Write Pattern | Biaya Query & Komputasi | Kebutuhan Konsistensi | Risiko Stale Data | Kelayakan Redis | Alasan & Kondisi Utama |
|---|---|---|---|---|---|---|---|---|
| 1 | **User Auth State by Email Hash** (`AuthMiddleware`) | Sangat Tinggi (Setiap HTTP Request masuk) | Sangat Jarang (Hanya saat update status verifikasi / profil) | Medium (1 query SQL per request masuk ke seluruh endpoint) | Tinggi | Rendah (Role/Verifikasi jarang berubah) | **RECOMMENDED** | Menghilangkan beban query SQL berulang pada middleware autentikasi global untuk setiap request. |
| 2 | **Course Categories List & Detail** | Tinggi (Katalog, Header, Form, Detail) | Sangat Jarang (Hanya admin via master data) | Rendah-Medium (Preload daftar kursus) | Sedang | Sangat Rendah | **RECOMMENDED** | Master data referensi statis publik. Ideal untuk caching TTL panjang. |
| 3 | **Class Types (Course Types) List & Detail** | Tinggi (Katalog, Form filter, Detail) | Sangat Jarang (Hanya admin via master data) | Rendah-Medium (Preload daftar kursus) | Sedang | Sangat Rendah | **RECOMMENDED** | Master data referensi statis publik. Ideal untuk caching TTL panjang. |
| 4 | **Public Course Catalog (`/courses` list)** | Sangat Tinggi (Halaman utama & katalog publik) | Rendah (Hanya saat admin tambah/edit/ubah status kursus) | Sangat Tinggi (Jika ada query title, backend mendekripsi seluruh tabel kursus di memori!) | Sedang | Rendah | **RECOMMENDED** | Beban komputasi dekripsi in-memory dan query agregasi review sangat berat. Caching berbasis query parameter filter akan meningkatkan throughput hingga 10x+. |
| 5 | **Public Course Detail (`/courses/:id`)** | Tinggi (Pengunjung melihat detail kelas) | Rendah (Edit kursus, update kurikulum) | Sangat Tinggi (JOIN 8 relasi: modules, category, type, mentors, reviews, replies, enrollment count) | Sedang | Rendah | **RECOMMENDED** | Salah satu query paling berat di aplikasi. Wajib di-cache per course UID. |
| 6 | **Course Mentors (`/courses/:id/mentor`)** | Sedang-Tinggi (Detail kursus & modal) | Rendah (Assign/unassign mentor oleh admin) | Medium (Lookup tabel pivot & user detail) | Sedang | Rendah | **RECOMMENDED** | Data pendukung kursus publik yang stabil. |
| 7 | **Public Mentors Directory (`/mentor/all`, `/mentor/:id`)** | Sedang-Tinggi (Halaman landing mentor) | Rendah (Update profil mentor atau kursus yang diampu) | Tinggi (Agregasi count course, student, dan review untuk tiap mentor) | Sedang | Rendah | **RECOMMENDED** | Menghindari perhitungan berulang agregat kelas mengajar pada direktori publik. |
| 8 | **Public Galleries (`/galleries`)** | Sedang-Tinggi (Landing page & halaman galeri) | Rendah (Admin mengunggah/menghapus foto) | Rendah-Medium (Paginasi foto dan sorting) | Rendah | Sangat Rendah | **RECOMMENDED** | Data konten display statis publik. |
| 9 | **Curriculum Modules per Course (`/modules/course/:id`)** | Tinggi (Viewer materi & manajemen kursus) | Rendah (Tambah/rename/hapus modul) | Medium (Daftar modul terurut beserta lesson metadata) | Sedang | Rendah | **RECOMMENDED** | Dibaca berulang kali saat siswa atau instruktur menjelajahi modul kursus. |
| 10 | **Lesson Metadata & Content (`/lessons/:id`)** | Tinggi (Siswa belajar membaca materi) | Rendah (Instruktur memperbarui teks/video) | Medium (Memuat konten TipTap JSON besar & validasi) | Sedang | Sedang | **RECOMMENDED** | Konten materi relatif stabil setelah diterbitkan instruktur. Mengurangi transfer payload besar dari DB. |
| 11 | **Lesson Assignment Config (`/lessons/:id/assignment`)** | Sedang-Tinggi (Siswa membuka tugas, kuis, atau instruksi) | Rendah (Hanya saat guru mengubah deadline/soal) | Medium (Memuat quiz payload JSONB dan aturan tugas) | Sedang | Sedang | **RECOMMENDED** | Konfigurasi tugas stabil selama masa pengerjaan siswa. |
| 12 | **Admin Dashboard KPIs & Analytics** | Sedang (Admin membuka dasbor) | Tinggi (Mengikuti aktivitas seluruh platform) | Sangat Tinggi (Query agregasi tabel besar: count active users, completion rate, grouping 30 hari) | Rendah-Sedang | Sangat Rendah (Dasbor analitik tidak menuntut data sub-detik) | **RECOMMENDED** | Menyelamatkan database dari query analitik berulang yang dapat menyebabkan spike CPU. |
| 13 | **Mentor Dashboard KPIs & Schedules** | Sedang (Mentor memantau jadwal & tugas) | Sedang (Siswa submit tugas, QA baru) | Tinggi (Subquery `NOT EXISTS` QA replies & pending grading text tugas) | Sedang | Rendah | **CONDITIONAL** | Layak di-cache namun **wajib dipartisi per mentor UID** (`dkelas:mentor:{uid}:dashboard:kpis`). |
| 14 | **Course Assignments Bulk Overview** | Sedang (Staf kursus melihat matriks tugas) | Sedang (Tugas baru atau siswa submit) | Tinggi (Join 4 tabel + count subquery) | Sedang | Sedang | **CONDITIONAL** | Wajib di-cache per course UID dan diinvalidasi saat tugas diterbitkan atau ada pengumpulan baru. |
| 15 | **Course Students Enrolled Roster** | Sedang (Staf melihat siswa kursus) | Sedang (Siswa baru bergabung via redeem) | Sangat Tinggi (Menghitung formula progress belajar dan `MAX(read_at)` per siswa) | Sedang | Sedang | **CONDITIONAL** | Kalkulasi progress on-the-fly sangat mahal. Perlu caching roster per course UID. |
| 16 | **Candidate Students List** | Rendah-Sedang (Modal invite siswa atau generate redeem) | Sedang (User baru mendaftar atau terdaftar ke kursus) | Sangat Tinggi (Subquery NOT IN enrollments + dekripsi seluruh user jika search aktif) | Sedang | Rendah | **CONDITIONAL** | Layak di-cache dengan TTL pendek khusus saat admin/mentor aktif di panel kelola peserta. |
| 17 | **Self User Detail / Profile (`/user/data`)** | Tinggi (Setiap buka halaman profil/dasbor siswa) | Rendah-Sedang (Edit profil, redeem kursus, selesaikan lesson) | Sangat Tinggi (Agregasi joined courses, progress per enrollment, reviews, dan assignments) | Tinggi | Sedang | **CONDITIONAL** | Wajib dipartisi ketat per user ID (`dkelas:user:{uid}:profile`). Harus diinvalidasi setiap kali user menyelesaikan lesson, submit tugas, atau redeem kode. |
| 18 | **Student Course Progress (`/courses/:id/progress`)** | Tinggi (Di-poll / dicek setiap lesson dibuka) | Sedang (Setiap lesson ditandai selesai atau tugas disubmit) | Tinggi (4 query agregasi: count lesson, assignment, read, submit) | Tinggi | Sedang | **CONDITIONAL** | Partisi per pasangan `{course_uid}:{user_uid}` dengan TTL pendek-menengah. |
| 19 | **Student Personal Assignment List (`/students/me/assignments`)** | Tinggi (Siswa membuka tab tugas) | Sedang (Deadline berubah, tugas baru terbit, siswa submit) | Sangat Tinggi (Join 5 tabel + kalkulasi status keterlambatan & grading) | Tinggi | Sedang | **CONDITIONAL** | Partisi per student UID (`dkelas:student:{uid}:assignments:{hash}`). |
| 20 | **Student Assignment Submissions (`/lessons/:id/assignment/submission`)** | Sedang (Siswa melihat hasil submit & nilai) | Rendah-Sedang (Submit / grading) | Medium (Memuat riwayat attempts dan grading feedback) | Tinggi | Rendah | **CONDITIONAL** | Partisi per pasangan `{lesson_uid}:{user_uid}`. |
| 21 | **Admin Moderation: Reviews & Q&A** | Sedang (Staf moderasi forum & ulasan) | Sedang (Review baru, thread baru, reply baru) | Medium-Tinggi (Preload replies & author) | Sedang | Rendah | **CONDITIONAL** | Caching per filter dan partisi role/course scoping. |
| 22 | **Redeem Codes Directory (`/admin/redeem-codes`)** | Rendah-Sedang (Admin melihat voucher) | Sedang (Generate kode atau kode digunakan) | Medium (Preload course & target user) | Sedang | Sedang | **CONDITIONAL** | Caching list per page/filter. |
| 23 | **Redeem Code Execution / Validation (`/students/redeem`)** | Kritis / Transaksional | Tulis Sekali Pakai (Klaim kuota) | Sedang (Transaksi DB atomic dengan row locking) | Sangat Tinggi (ACID) | Bahaya Overbooking | **NOT RECOMMENDED** | **JANGAN MENGGUNAKAN REDIS CACHING BIASA.** Eksekusi penukaran kode redeem melibatkan pengurangan kuota `used_count` dan locking `lockedCourse.Slot` via SQL row locking (`SELECT FOR UPDATE`). Caching data redeem code dapat menyebabkan race condition double-claim voucher atau overbooking kuota kelas. |
| 24 | **Password, Password Reset & Plain Credentials** | Sekuritas Ekstrem | Update | Hashing bcrypt | Kritis | Bahaya Kebocoran Kredensial | **NOT RECOMMENDED** | Password hash hanya disimpan di PostgreSQL dan tidak boleh diekspos ke cache Redis. |
| 25 | **OTP Code Verification (`otps`)** | Sangat Dinamis (TTL 10m) | Tulis & Hapus | Single row | Sangat Tinggi | Kadaluwarsa Cepat | **NOT RECOMMENDED** | Meskipun Redis sering dipakai untuk OTP, pada DKelas tabel `otps` memiliki tracking `attempts`, `max_attempts`, dan audit trail yang saat ini terikat ke relational schema. Memindahkan ke Redis memerlukan migrasi data layer yang di luar scope audit read-only. |
| 26 | **Email Change Tokens (`email_change_requests`)** | Dinamis (TTL 30m) | Tulis & Verifikasi | Single row | Sangat Tinggi | Token Sekali Pakai | **NOT RECOMMENDED** | Sama seperti OTP, penanganan token konfirmasi pergantian email terikat audit trail di PostgreSQL. |
| 27 | **Protected File Binary Streams / Object URLs (`/files/...`)** | Ekstrem | Upload S3 | Garage S3 Network I/O | Rendah | Objek immutable | **NOT RECOMMENDED** | File binary dan gambar sudah disimpan dan di-serve secara efisien via Garage S3 Object Storage dan dicache oleh browser/CDN. Menyimpan binary besar di Redis memboroskan RAM cache secara sia-sia. |

---

## E. TTL RECOMMENDATION MATRIX

Tabel matriks rekomendasi TTL individual untuk setiap jenis data pada platform DKelas:

| No | Data / Entity | Fitur Terkait | Read Pattern | Write Pattern | Volatility | Cacheability | Recommended TTL | Invalidation Trigger (Event / Operasi) | Confidence |
|:---:|---|---|---|---|---|:---:|:---:|---|:---:|
| 1 | **Master Course Categories** | Katalog, filter dropdown, form buat/edit kursus | High | Sangat Rendah | Static | RECOMMENDED | **6 jam** (21.600 dtk) | `POST /course-categories`, `PUT /course-categories/:id`, `DELETE /course-categories/:id` | HIGH |
| 2 | **Master Course Types (Class Types)** | Katalog, form kursus, jadwal mentor | High | Sangat Rendah | Static | RECOMMENDED | **6 jam** (21.600 dtk) | `POST /course-types`, `PUT /course-types/:id`, `DELETE /course-types/:id` | HIGH |
| 3 | **Public Documentation Gallery** | Beranda (`#galeri`) & Halaman `/gallery` | High | Sangat Rendah | Semi Static | RECOMMENDED | **1 jam** (3.600 dtk) | `POST /galleries`, `PUT /galleries/:id`, `DELETE /galleries/:id` | HIGH |
| 4 | **Public Mentors Directory** | Beranda (`#mentor`) & Halaman `/mentors` | High | Rendah | Semi Static | RECOMMENDED | **30 menit** (1.800 dtk) | Update profil mentor, update role mentor, perubahan penugasan mentor kursus | HIGH |
| 5 | **Public Course Catalog (`/courses`)** | Katalog kursus, pencarian, landing page | Sangat High | Rendah | Semi Static | RECOMMENDED | **15 menit** (900 dtk) | Buat kursus baru, update metadata kursus, aktivasi status kursus, hapus kursus, review baru masuk | HIGH |
| 6 | **Public Course Detail (`/courses/:id`)** | Halaman detail kursus (`/courses/:id`) | High | Rendah | Semi Static | RECOMMENDED | **15 menit** (900 dtk) | Update kursus, aktivasi status, tambah modul/lesson, assign/unassign mentor, review/reply baru | HIGH |
| 7 | **Course Mentors List** | Tab mentor pada detail kursus publik | High | Rendah | Semi Static | RECOMMENDED | **15 menit** (900 dtk) | `POST /courses/:id/mentors/assign`, `POST /courses/:id/mentors/unassign` | HIGH |
| 8 | **Curriculum Module Structure** | Halaman viewer materi (`/view`), edit kurikulum | High | Rendah | Semi Static | RECOMMENDED | **10 menit** (600 dtk) | `POST /modules`, `PUT /modules/:id`, `DELETE /modules/:id`, urutan lesson berubah | HIGH |
| 9 | **Lesson Content & Video URL** | Viewer materi pelajaran siswa (`/view`) | High | Rendah | Semi Static | RECOMMENDED | **10 menit** (600 dtk) | `PUT /lessons/:id`, `DELETE /lessons/:id` | HIGH |
| 10 | **Lesson Assignment Configuration** | Tab tugas di viewer materi & panel tugas | High | Rendah | Semi Static | RECOMMENDED | **10 menit** (600 dtk) | `POST /lessons/:id/assignment`, `PUT /lessons/:id/assignment`, `DELETE /lessons/:id/assignment` | HIGH |
| 11 | **Admin Dashboard KPIs** | Dasbor Admin (`/admin/dashboard`) | Sedang | Agregat Dinamis | Dynamic | RECOMMENDED | **60 detik** | Perubahan period filter, mutasi enrollment baru, kursus baru terbit | HIGH |
| 12 | **Admin Dashboard Analytics** | Analitik Grafik Dasbor Admin | Sedang | Agregat Dinamis | Dynamic | RECOMMENDED | **2 menit** (120 dtk) | Perubahan rentang hari analitik (default 30 hari) | HIGH |
| 13 | **Auth Claims Session Cache** | Global AuthMiddleware di setiap API request | Ekstrem High | Sangat Rendah | Semi Static | RECOMMENDED | **5 menit** (300 dtk) | Update user profile, ganti password, perubahan role admin, verifikasi OTP sukses | HIGH |
| 14 | **Mentor Dashboard KPIs** | Dasbor Mentor (`/mentor/dashboard`) | Sedang | Dynamic | Dynamic | CONDITIONAL | **30 detik** | Siswa submit tugas teks baru, penambahan thread QA baru, penilaian tugas selesai | MEDIUM |
| 15 | **Mentor Teaching Schedules** | Kalender Mengajar Mentor | Sedang | Semi Static | Semi Static | CONDITIONAL | **5 menit** (300 dtk) | Perubahan start/end time lesson, perubahan assign mentor pada kursus | HIGH |
| 16 | **Course Assignments Bulk Matrix** | Tab Penugasan Staf Kursus | Sedang | Dynamic | Dynamic | CONDITIONAL | **1 menit** (60 dtk) | Publikasi tugas baru, perubahan deadline, submission baru dari siswa | MEDIUM |
| 17 | **Course Enrolled Students Roster** | Tab Siswa pada Detail Kursus Staf | Sedang | Dynamic | Dynamic | CONDITIONAL | **2 menit** (120 dtk) | Pendaftaran siswa baru (redeem/invite), siswa menyelesaikan lesson/tugas | MEDIUM |
| 18 | **Course Candidate Students** | Dialog Invite Siswa & Modal Generate Kode | Sedang | Dynamic | Dynamic | CONDITIONAL | **1 menit** (60 dtk) | Pendaftaran siswa baru ke kursus yang dipilih | MEDIUM |
| 19 | **Self User Detail & Profile (`/user/data`)** | High | Dynamic per User | Dynamic | CONDITIONAL | **2 menit** (120 dtk) | `PATCH /user/profile`, `POST /user/email/confirm`, siswa selesai baca materi, redeem kode | HIGH |
| 20 | **Student Course Progress (`/progress`)** | High | Dynamic per User-Course | Dynamic | CONDITIONAL | **30 detik** | `POST /lessons/:id/read`, `POST /lessons/:id/assignment/submission` | HIGH |
| 21 | **Student Personal Assignment List** | High | Dynamic per Student | Dynamic | CONDITIONAL | **1 menit** (60 dtk) | Siswa mengumpulkan tugas/kuis, mentor memberikan nilai/feedback, tugas baru terbit | HIGH |
| 22 | **Student Assignment Submissions & Score** | Sedang | Dynamic per Student-Lesson | Dynamic | CONDITIONAL | **2 menit** (120 dtk) | Siswa submit/resubmit tugas, penilaian oleh staf (`/grade`) | HIGH |
| 23 | **Staff Assignment Submissions List** | Sedang | Dynamic per Lesson | Dynamic | CONDITIONAL | **1 menit** (60 dtk) | Siswa mengumpulkan tugas baru, mentor memperbarui penilaian | MEDIUM |
| 24 | **Admin Moderation Reviews List** | Sedang | Dynamic | Dynamic | CONDITIONAL | **1 menit** (60 dtk) | Review baru masuk dari siswa, reply baru dibuat admin/mentor | MEDIUM |
| 25 | **Admin Moderation Q&A Threads** | Sedang | Dynamic | Dynamic | CONDITIONAL | **30 detik** | Thread baru dibuat siswa, balasan baru dibuat oleh staf/siswa | MEDIUM |
| 26 | **Redeem Codes Directory List** | Sedang | Dynamic | Dynamic | CONDITIONAL | **1 menit** (60 dtk) | Pembuatan kode baru, penukaran kode oleh siswa, penghapusan kode | MEDIUM |
| 27 | **Redeem Execution (`POST /redeem`)** | Transaksional | Write / Mutasi ACID | Highly Dynamic | NOT RECOMMENDED | **NO CACHE** | Wajib langsung dieksekusi di database PostgreSQL dengan row-level lock (`SELECT FOR UPDATE`) | HIGH |
| 28 | **Password, OTP & Email Confirmation Tokens** | Keamanan Kritis | One-Time / Transient | Critical | NOT RECOMMENDED | **NO CACHE** | Dikelola melalui database/hashing PostgreSQL. Tidak diekspos ke caching layer biasa. | HIGH |

---

## F. CACHE INVALIDATION STRATEGY

Prinsip dasar cache invalidation pada DKelas: **Cache-Aside Pattern dengan Proactive Write-Invalidation**. Setiap operasi CREATE, UPDATE, DELETE (CUD) yang mengubah data primer harus menghapus (*evict*) cache terkait secara deterministik agar tidak terjadi *stale data*.

### Matriks Pemetaan Operasi Mutasi ke Invalidation Target:

```
[ Operasi CUD pada Entitas ] ───► [ Deteksi ID & Relasi Terkait ] ───► [ Hapus Key / Pattern di Redis ]
```

| Operasi / Endpoint Backend | Data yang Berubah | Cache Key yang Harus Diinvalidasi di Redis | Pola / Mekanisme Invalidation |
|---|---|---|---|
| **`POST /courses`** (`PostAdminCourseFunc`) | Entitas Kursus Baru | - `dkelas:course:list:*`<br>- `dkelas:admin:dashboard:kpis:*`<br>- `dkelas:admin:dashboard:analytics:*` | Hapus seluruh cache list katalog dan perbarui KPI platform. |
| **`PUT /courses/:id`** (`UpdateAdminCourseFunc`) | Metadata Kursus, Judul, Kategori, Tipe | - `dkelas:course:detail:{course_uid}`<br>- `dkelas:course:list:*`<br>- `dkelas:course:categories:*`<br>- `dkelas:course:types:*`<br>- `dkelas:user:*:profile` (jika judul berubah di riwayat belajar) | Hapus detail spesifik dan wildcard seluruh katalog kursus. |
| **`PATCH /courses/:id/status`** (`ActivateCourseStatusFunc`) | Status Kursus (`ACTIVE`, `is_published: true`) | - `dkelas:course:detail:{course_uid}`<br>- `dkelas:course:list:*`<br>- `dkelas:admin:dashboard:kpis:*` | Invalidate detail kursus dan katalog publik. |
| **`DELETE /courses/:id`** (`DeleteAdminCourseFunc`) | Status Kursus (`TIDAK ACTIVE`) | - `dkelas:course:detail:{course_uid}`<br>- `dkelas:course:list:*`<br>- `dkelas:admin:dashboard:kpis:*`<br>- `dkelas:admin:dashboard:analytics:*` | Invalidate detail kursus dan katalog publik. |
| **`POST /courses/:id/mentors/assign`** & **`unassign`** | Penugasan Mentor Kursus | - `dkelas:course:detail:{course_uid}`<br>- `dkelas:course:{course_uid}:mentors`<br>- `dkelas:course:list:*`<br>- `dkelas:mentor:{mentor_uid}:*`<br>- `dkelas:mentor:all:*` | Hapus relasi mentor kursus, detail, dan metrik dasbor mentor. |
| **`POST /courses/:id/participants`** (`AddCourseParticipantsFunc`) | Peserta Kursus Ditambahkan (Enrollment Active) | - `dkelas:course:{course_uid}:students:*`<br>- `dkelas:course:{course_uid}:candidate_students:*`<br>- `dkelas:course:detail:{course_uid}` (jumlah enrolled_count)<br>- `dkelas:user:{student_uid}:profile` (untuk setiap siswa yang diundang)<br>- `dkelas:mentor:{mentor_uid}:dashboard:*` | Invalidate roster peserta kursus, slot kapasitas, dan profil masing-masing siswa. |
| **`POST /courses/:id/review`** & **`reply`** | Ulasan Kursus / Balasan Review | - `dkelas:course:detail:{course_uid}` (rating & ulasan terlampir)<br>- `dkelas:course:list:*` (rating agregat kursus)<br>- `dkelas:admin:reviews:*`<br>- `dkelas:user:{student_uid}:profile` | Invalidate detail kursus, rating ringkasan katalog, dan panel review admin. |
| **`POST /courses/:id/qna`** & **`replies`** | Diskusi Forum Tanya Jawab | - `dkelas:admin:qna:*`<br>- `dkelas:mentor:{mentor_uid}:dashboard:kpis` (jumlah unanswered QA berkurang/bertambah) | Invalidate forum Q&A admin dan counter unread QA mentor. |
| **`POST /course-categories`**, **`PUT`**, **`DELETE`** | Master Kategori Kursus | - `dkelas:course:categories:*`<br>- `dkelas:course:category:{category_uid}`<br>- `dkelas:course:list:*` | Invalidate seluruh cache kategori dan filter katalog. |
| **`POST /course-types`**, **`PUT`**, **`DELETE`** | Master Tipe Kelas | - `dkelas:course:types:*`<br>- `dkelas:course:type:{type_uid}`<br>- `dkelas:course:list:*` | Invalidate seluruh cache tipe kelas dan filter katalog. |
| **`POST /modules`**, **`PUT`**, **`DELETE`** | Modul Kurikulum Kursus | - `dkelas:course:{course_uid}:modules:*`<br>- `dkelas:module:{module_uid}`<br>- `dkelas:course:detail:{course_uid}`<br>- `dkelas:course:{course_uid}:progress:*` | Invalidate struktur kurikulum kursus dan perhitungan progres siswa. |
| **`POST /lessons`**, **`PUT`**, **`DELETE`** | Materi Pelajaran (Teks/Video) | - `dkelas:lesson:{lesson_uid}`<br>- `dkelas:course:{course_uid}:modules:*`<br>- `dkelas:course:{course_uid}:lessons:*`<br>- `dkelas:course:detail:{course_uid}`<br>- `dkelas:course:{course_uid}:progress:*`<br>- `dkelas:mentor:{mentor_uid}:dashboard:schedules:*` | Invalidate konten materi, modul induk, kalender mengajar mentor, dan progres. |
| **`POST /lessons/:id/read`** (`MarkLessonAsReadFunc`) | Siswa Menandai Materi Selesai Dibaca | - `dkelas:lesson:{lesson_uid}:reading:{user_uid}`<br>- `dkelas:course:{course_uid}:progress:{user_uid}`<br>- `dkelas:user:{user_uid}:profile`<br>- `dkelas:course:{course_uid}:students:*` (progress siswa berubah) | Invalidate status baca personal, progres persentase, dan roster pengajar. |
| **`POST /lessons/:id/assignment`**, **`PUT`**, **`DELETE`** | Konfigurasi Tugas/Kuis | - `dkelas:lesson:{lesson_uid}:assignment`<br>- `dkelas:course:{course_uid}:assignments:*`<br>- `dkelas:student:*:assignments:*`<br>- `dkelas:course:{course_uid}:progress:*` | Invalidate tugas lesson, bulk overview tugas, daftar tugas siswa, dan rumus progres. |
| **`POST /lessons/:id/assignment/submission`** & **`PUT`** | Siswa Mengumpulkan / Mengedit Tugas | - `dkelas:lesson:{lesson_uid}:submission:{user_uid}`<br>- `dkelas:lesson:{lesson_uid}:staff_submissions:*`<br>- `dkelas:student:{user_uid}:assignments:*`<br>- `dkelas:course:{course_uid}:progress:{user_uid}`<br>- `dkelas:course:{course_uid}:assignments:*` (submission count bertambah)<br>- `dkelas:mentor:{mentor_uid}:dashboard:kpis` (pending grading bertambah jika tugas teks) | Invalidate submission siswa, daftar koreksi staf, counter pending grading mentor, dan matriks tugas. |
| **`PUT /lessons/:id/assignment/submissions/:uid/grade`** | Penilaian Tugas Siswa oleh Staf | - `dkelas:lesson:{lesson_uid}:submission:{target_student_uid}`<br>- `dkelas:lesson:{lesson_uid}:staff_submissions:*`<br>- `dkelas:student:{target_student_uid}:assignments:*`<br>- `dkelas:mentor:{mentor_uid}:dashboard:kpis` (pending grading berkurang) | Invalidate hasil penilaian di sisi siswa dan antrian grading di sisi mentor. |
| **`POST /students/redeem`** & **`POST /redeem`** | Siswa Menukarkan Voucher Kursus | - `dkelas:user:{student_uid}:profile`<br>- `dkelas:course:{course_uid}:students:*`<br>- `dkelas:course:{course_uid}:candidate_students:*`<br>- `dkelas:course:detail:{course_uid}` (kapasitas slot)<br>- `dkelas:admin:redeem_codes:*`<br>- `dkelas:admin:dashboard:analytics:*` | Invalidate profil siswa, pendaftaran kursus, slot kapasitas, dan daftar kode redeem. |
| **`POST /admin/redeem-codes`** & **`DELETE`** | Generate / Hapus Kode Redeem | - `dkelas:admin:redeem_codes:*`<br>- `dkelas:admin:redeem_candidate_students:{course_uid}:*` | Invalidate daftar voucher admin. |
| **`PATCH /user/profile`** | Update Nama / Profil Pengguna | - `dkelas:auth:session:{email_hash}`<br>- `dkelas:user:{user_uid}:profile`<br>- `dkelas:user:managed:*` | Invalidate auth session cache dan detail profil user. |
| **`PATCH /user/password`** | Ubah Password Pengguna | - `dkelas:auth:session:{email_hash}` (memaksa reload auth) | Hapus auth session cache agar credential lama tidak aktif. |
| **`POST /user/email/confirm`** | Konfirmasi Pergantian Email | - `dkelas:auth:session:{old_email_hash}`<br>- `dkelas:user:{user_uid}:profile`<br>- `dkelas:user:managed:*` | Invalidate auth session lama dan profil user. |
| **`POST /avatar/`** | Ganti Foto Profil / Avatar | - `dkelas:auth:session:{email_hash}`<br>- `dkelas:user:{user_uid}:profile`<br>- `dkelas:user:managed:*` | Invalidate avatar profil di cache. |
| **`PATCH /user/role/:id`** & **`batch`** | Update Role Pengguna | - `dkelas:auth:session:{target_email_hash}`<br>- `dkelas:user:{target_user_uid}:profile`<br>- `dkelas:user:managed:*`<br>- `dkelas:mentor:all:*` (jika diubah ke/dari mentor) | Invalidate sesi user target (agar hak akses RBAC segera ter-update) dan direktori user/mentor. |
| **`DELETE /user/manage/:id`** | Hapus Akun Pengguna | - `dkelas:auth:session:{target_email_hash}`<br>- `dkelas:user:{target_user_uid}:*`<br>- `dkelas:user:managed:*` | Invalidate seluruh cache milik pengguna target. |

---

## G. REDIS KEY NAMING RECOMMENDATION & SCHEMA SECURITY

Untuk menjamin isolasi multi-tenant antar pengguna, konsistensi lintas modul, dan kemudahan invalidasi menggunakan Redis Pattern Deletion / Tags, skema penamaan key harus mengikuti spesifikasi berikut:

### 1. Standar Konvensi Namespace
`dkelas:{domain}:{entitas_id atau scope}:{fitur}:{parameter_hash}`

- Seluruh key diawali prefix project: `dkelas:`.
- Selalu gunakan Canonical Full UUID (36 karakter), **dilarang menggunakan shortened UID (8 karakter)** dalam penamaan key Redis untuk mencegah *cache key collision*.
- Gunakan SHA-256 hash 8-karakter pertama untuk parameter filter dinamis: `hash(query_params)`.

### 2. Katalog Skema Kunci Redis Resmi:

```
# A. Sesi & Autentikasi (Hot-Path Middleware)
dkelas:auth:session:{email_hash}
Contoh: dkelas:auth:session:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

# B. Master Data (Global / Public Static)
dkelas:course:categories:all
dkelas:course:category:{category_uid}
dkelas:course:types:all
dkelas:course:type:{type_uid}
dkelas:gallery:list:{page}:{per_page}:{filter_hash}
dkelas:gallery:detail:{gallery_uid}
dkelas:mentor:public:list:{page}:{per_page}
dkelas:mentor:public:detail:{mentor_uid}

# C. Kursus Publik & Katalog
dkelas:course:list:{filter_hash}
Contoh: dkelas:course:list:page1_limit10_levelPEMULA
dkelas:course:detail:{course_uid}
dkelas:course:{course_uid}:mentors

# D. Kurikulum Kursus (Modul & Materi)
dkelas:course:{course_uid}:modules
dkelas:module:{module_uid}
dkelas:lesson:{lesson_uid}
dkelas:lesson:{lesson_uid}:assignment

# E. Progres & Pembacaan Siswa (Private per User-Course)
dkelas:course:{course_uid}:progress:{user_uid}
dkelas:lesson:{lesson_uid}:reading:{user_uid}

# F. Profil & Data Pribadi Siswa
dkelas:user:{user_uid}:profile
dkelas:student:{user_uid}:assignments:{filter_hash}
dkelas:lesson:{lesson_uid}:submission:{user_uid}

# G. Staf, Roster & Penugasan Kursus (Admin / Mentor)
dkelas:course:{course_uid}:assignments:overview:{params_hash}
dkelas:course:{course_uid}:students:roster:{params_hash}
dkelas:course:{course_uid}:candidate_students:{params_hash}
dkelas:lesson:{lesson_uid}:staff_submissions:{params_hash}

# H. Dasbor Analitik & KPI
dkelas:admin:dashboard:kpis:{period}
Contoh: dkelas:admin:dashboard:kpis:30d
dkelas:admin:dashboard:analytics:{days}
Contoh: dkelas:admin:dashboard:analytics:30
dkelas:mentor:{mentor_uid}:dashboard:kpis
dkelas:mentor:{mentor_uid}:dashboard:schedules:{range_hash}

# I. Moderasi Forum & Kode Redeem
dkelas:admin:reviews:list:{params_hash}
dkelas:admin:qna:list:{params_hash}
dkelas:admin:redeem_codes:list:{params_hash}
dkelas:admin:redeem_candidate_students:{course_uid}:{params_hash}
dkelas:user:managed:list:{params_hash}
```

### 3. Keamanan Cache & Isolasi Role
1. **Pencegahan Data Leakage Antar Pengguna:**
   - Data private (`user profile`, `progress`, `assignments list`, `submissions`) **WAJIB** menyertakan `{user_uid}` pada key.
   - Tidak boleh meng-cache endpoint privat menggunakan key generik seperti `dkelas:user:me` atau `dkelas:student:assignments`.
2. **Penanganan Data Terenkripsi:**
   - Ketika objek yang dimuat dari database didekripsi oleh GORM `AfterFind` (Name, Email, Title, Description), data yang disimpan ke Redis adalah **plaintext DTO yang siap dikonsumsi**.
   - **Konsekuensi Keamanan:** Redis instance **WAJIB** dilindungi dengan otentikasi password yang kuat (`requirepass`), tidak dibuka ke jaringan publik (hanya diakses via internal Docker network / private bridge), dan jika diperlukan di-encrypt in-transit (TLS).
3. **Pencegahan Cache Stampede:**
   - Untuk data bertrafik tinggi dengan TTL singkat (seperti `dkelas:admin:dashboard:kpis:*` dan `dkelas:course:list:*`), gunakan teknik **TTL Jitter** (variasi acak ±10% dari durasi TTL) untuk menghindari ratusan key habis bersamaan.

---

## H. IMPLEMENTATION PRIORITY

Strategi adopsi Redis caching pada DKelas dibagi ke dalam tiga tahap prioritas:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TAHAP 1 (Priority 1): Quick Wins, High ROI, Low Risk                   │
│ - AuthMiddleware Session Cache                                         │
│ - Master Categories & Course Types                                     │
│ - Public Course Catalog & Course Detail                                │
│ - Public Mentors Directory & Galleries                                 │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TAHAP 2 (Priority 2): High Computation Savings, Moderate Complexity    │
│ - Admin & Mentor Dashboard KPIs / Analytics                            │
│ - Curriculum Modules & Lesson Content                                  │
│ - Course Assignments Bulk Overview                                     │
│ - Student Course Reading Progress & Personal Profile                   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TAHAP 3 (Priority 3): Complex Dependency & High Consistency Reqs       │
│ - Enrolled Students Roster Calculation                                 │
│ - Student Personal Assignments Dynamic List                            │
│ - Staff Moderation (Reviews & Q&A)                                     │
│ - Candidate Students Lookup                                            │
└────────────────────────────────────────────────────────────────────────┘
```

### Priority 1: High Return on Investment (ROI), Low Complexity & Low Risk
1. **Auth Session Cache (`dkelas:auth:session:{email_hash}`):**
   - *Manfaat:* Memangkas query `SELECT * FROM users WHERE email_hash = ?` pada 100% request berotentikasi.
   - *TTL:* 5 menit.
   - *Kompleksitas Invalidation:* Sangat rendah (hanya dihapus saat user update profil/password/role).
2. **Master Data Course Categories & Types (`dkelas:course:categories:*`, `dkelas:course:types:*`):**
   - *Manfaat:* Data referensi yang digunakan hampir di semua form dan filter katalog.
   - *TTL:* 6 jam.
   - *Kompleksitas Invalidation:* Sangat rendah (hanya disentuh admin di panel master data).
3. **Public Course Catalog & Course Detail (`dkelas:course:list:*`, `dkelas:course:detail:{uid}`):**
   - *Manfaat:* Menghilangkan beban query 8 tabel JOIN dan komputasi CPU untuk dekripsi in-memory seluruh kursus saat pencarian aktif.
   - *TTL:* 15 menit.
   - *Kompleksitas Invalidation:* Rendah (invalidation terpusat di `course.go`).
4. **Public Galleries & Mentors Directory (`dkelas:gallery:*`, `dkelas:mentor:public:*`):**
   - *Manfaat:* Menghilangkan query agregat di landing page publik.
   - *TTL:* 30 - 60 menit.

### Priority 2: Moderate Invalidation Complexity, Significant DB Load Reduction
1. **Admin & Mentor Dashboard KPIs and Analytics:**
   - *Manfaat:* Menghilangkan subquery berat (`NOT EXISTS`, group date, completion rate) yang dijalankan saat admin/mentor membuka dasbor.
   - *TTL:* 30 - 120 detik.
   - *Kompleksitas Invalidation:* Menggunakan short TTL dengan optional proactive invalidation.
2. **Curriculum Modules & Lesson Content (`dkelas:course:{id}:modules`, `dkelas:lesson:{id}`):**
   - *Manfaat:* Mempercepat loading materi pelajaran di viewer dan mengurangi transfer data besar TipTap JSON dari PostgreSQL.
   - *TTL:* 10 menit.
   - *Kompleksitas Invalidation:* Terikat pada operasi CUD di `service/module.go` dan `service/lessons.go`.
3. **Self User Profile & Learning Status (`dkelas:user:{uid}:profile`):**
   - *Manfaat:* Mempercepat rendering halaman utama profil dan navigasi dashboard siswa.
   - *TTL:* 2 menit.
   - *Kompleksitas Invalidation:* Terikat pada event pengerjaan materi dan update profil.

### Priority 3: High Consistency Requirements & Complex Invalidation Cascades
1. **Course Enrolled Students Roster (`dkelas:course:{id}:students:*`):**
   - *Tantangan:* Melibatkan kalkulasi progres dinamis per siswa dari tabel pembacaan dan pengumpulan tugas.
2. **Student My Assignments View (`dkelas:student:{uid}:assignments:*`):**
   - *Tantangan:* Melibatkan 5 tabel relasi, deadline timer, status review tugas, dan filter kategori.
3. **Staff Moderation Forum & Reviews (`dkelas:admin:reviews:*`, `dkelas:admin:qna:*`):**
   - *Tantangan:* Data terus berinteraksi antara siswa dan mentor dengan thread replies.

---

## I. FINDINGS, ARCHITECTURAL RISKS & NEXT STEPS

### 1. Ringkasan Temuan Audit Data DKelas
- **Jumlah Jenis Data yang Diidentifikasi:** 28 dataset / entitas fungsional.
- **Kategori Rekomendasi Caching:**
  - **RECOMMENDED:** 12 jenis data (~43%) — Mayoritas katalog publik, master data referensi, detail materi, sesi autentikasi, dan statistik dasbor admin.
  - **CONDITIONAL:** 11 jenis data (~39%) — Data dinamis per-pengguna, roster siswa, penugasan tugas, dan forum tanya jawab yang memerlukan pemisahan key ID serta invalidasi presisi.
  - **NOT RECOMMENDED:** 5 jenis data (~18%) — Transaksi penukaran kode redeem (`POST /redeem`), transient token (OTP, reset password, email change), dan streaming objek binary S3.
- **TTL Paling Banyak Direkomendasikan:** Rentang **10–15 menit** untuk data kursus/kurikulum/materi, dan **1–2 menit** untuk data operasional siswa dan analitik dinamis.

### 2. Risiko Utama Implementasi Redis pada DKelas
1. **Risiko Ambiguitas Akibat Shortened UID (8 Karakter):**
   - *Kondisi Kode:* Middleware `ShortenUIDsMiddleware` memotong UUID menjadi 8 karakter saat merespons client, dan resolver database `database.ResolveUID` mendukung pencarian prefix 8 karakter.
   - *Risiko:* Jika backend menyimpan cache key menggunakan prefix 8 karakter (misal `dkelas:course:detail:3f7a1b2c`), potensi collision di Redis sangat besar ketika volume data membesar.
   - *Solusi:* Semua key Redis **wajib dinormalisasi menggunakan Canonical UUID 36-karakter** (`uuid.UUID.String()`).
2. **Risiko CPU Spike Akibat In-Memory Decryption Fallback:**
   - *Kondisi Kode:* Kolom judul kursus, nama user, dsb. terenkripsi AES-GCM non-deterministik di database, sehingga query pencarian (search) membaca seluruh isi tabel ke memori untuk didekripsi.
   - *Risiko:* Setiap cache miss pada query pencarian akan membebani CPU server secara drastis.
   - *Solusi:* Redis cache untuk query pencarian publik (`dkelas:course:list:{filter_hash}`) sangat mendesak untuk meredam frekuensi dekripsi massal ini.
3. **Risiko Inconsistency pada Struktur Monolith Tanpa Repository Layer:**
   - *Kondisi Kode:* Saat ini seluruh query GORM dieksekusi langsung di dalam handler `internal/service/*.go` tanpa abstraksi repository terpusat.
   - *Risiko:* Kode invalidasi cache yang disisipkan secara manual di banyak fungsi handler berpotensi terlewat (*forgotten invalidation*) saat ada developer yang menambahkan handler mutasi baru.
   - *Solusi:* Buat modul helper invalidation terpusat (misal `internal/cache/invalidation.go`) yang mendefinisikan method seperti `InvalidateCourse(courseUID)` yang secara otomatis membersihkan semua key turunan kursus tersebut.
4. **Risiko Double-Claim pada Redeem Code:**
   - Penukaran kode redeem (`RedeemCourseCodeFunc`) memiliki logika pengecekan kuota `used_count` dan locking baris kursus `SELECT FOR UPDATE`.
   - Menaruh status kode redeem ke dalam Redis tanpa distributed lock Redlock dapat membuka celah eksploitasi kuota (*race condition*). Penukaran voucher harus tetap dihandle langsung oleh transaksi PostgreSQL.

### 3. Informasi Tambahan yang Diperlukan Sebelum Implementasi
1. **Topologi Redis yang Direncanakan:** Apakah Redis akan di-deploy sebagai standalone container di `docker-compose.yml` (misal `redis:7-alpine`) atau menggunakan managed Redis service (misal AWS ElastiCache / Upstash).
2. **Estimasi Beban Trafik (RPS):** Estimasi Concurrent Users aktif saat jam puncak kelas online dan perkiraan alokasi RAM server untuk `maxmemory` Redis (misal 256MB atau 512MB dengan eviction policy `allkeys-lru`).
3. **Go Redis Driver Choice:** Memastikan kesepakatan library client Go yang akan digunakan (sangat disarankan `github.com/redis/go-redis/v9`).

---

**Kesimpulan Audit:**  
Platform DKelas memiliki karakteristik arsitektur yang **sangat diuntungkan oleh kehadiran Redis caching layer**. Keberadaan enkripsi AES-GCM pada level data dan query agregasi multi-tabel pada modul kursus, kurikulum, serta dasbor menjadikan database PostgreSQL rentan terhadap bottleneck I/O dan CPU. Dengan menerapkan caching layer sesuai rekomendasi matriks dan strategi invalidasi di atas, performa read response platform DKelas diproyeksikan meningkat secara signifikan tanpa mengorbankan integritas data transaksional.
