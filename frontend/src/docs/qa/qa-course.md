# Bug Report — Course Feature (QA Session)

> **Catatan QA:** Dokumen ini berisi temuan bug dari sesi QA untuk fitur Course pada role **Student**. Kata-kata di bawah ini merupakan komentar dari QA yang telah disusun ulang agar lebih jelas dan profesional.

---

## Role: Student

### 1. Course dengan Status DRAFT Masih Bisa Diakses Student

> **Status FE:** 🟢 Fixed (QA-C-18, sesi 6 — 19 Jun 2026) · **Tunggu retest QA**

> **Komentar QA:** *Fatal — Course yang masih berstatus draft seharusnya tidak bisa diakses atau didaftarkan oleh student.*

**Screenshots:**

| Dashboard Admin/Mentor (Status Draft) | Dashboard Student (Bisa Mendaftar) |
|--------------------------------------|-----------------------------------|
| ![Course draft di admin](assets/qa-course/3.png) | ![Course draft di student](assets/qa-course/4.png) |

**Deskripsi Bug:**
Course yang masih memiliki status "DRAFT" masih bisa diakses oleh student. Student bahkan dapat melihat course tersebut di katalog dan mendaftarnya.

**Behavior Saat Ini:**
- Admin/Mentor membuat course dengan status "DRAFT"
- Course tersebut tetap muncul di katalog student
- Student bisa klik "Daftar" pada course draft
- Course draft bisa diakses untuk pembelajaran

**Behavior yang Diharapkan:**
- Course dengan status "DRAFT" tidak boleh muncul di katalog student
- Student tidak bisa mendaftar course yang masih draft
- Hanya course dengan status "PUBLISH" yang boleh terlihat student

**Analisis Teknis:**
- Filter status publish mungkin belum diterapkan pada endpoint list course untuk student
- Perlu menambahkan condition: `WHERE status = 'PUBLISH'` pada query student
- Atau tambahkan middleware/guard untuk cek status sebelum render di frontend

---

### 2. Tugas dari Lesson 2 Tidak Tampil di Halaman Learning Course

> **Status FE:** 🟢 Fixed (QA-C-16, sesi 5 — 19 Jun 2026) · **Tunggu retest QA**

> **Komentar QA:** *Fatal — Saat student membaca lesson pada module, tugas yang ditampilkan tidak semua. Pada gambar admin terlihat ada 2 tugas (lesson 1 dan lesson 2), namun saat student membaca materi hanya tugas dari lesson 1 yang muncul.*

**Screenshots:**

| Tab Tugas di Admin (2 Tugas) | Student di Lesson 1 | Student di Lesson 2 |
|------------------------------|---------------------|---------------------|
| ![Tugas admin](assets/qa-course/5.png) | ![Student lesson 1](assets/qa-course/6.png) | ![Student lesson 2](assets/qa-course/7.png) |

**Deskripsi Bug:**
Pada halaman `/student/learning/course/{courseUid}`, hanya tugas dari lesson 1 yang ditampilkan. Tugas yang seharusnya ada di lesson 2 tidak muncul.

**Behavior Saat Ini (sebelum fix):**
- Admin membuat 2 tugas: "Coba Tugas L1" (lesson 1) dan "Coba Tugas L2" (lesson 2)
- Saat student membaca lesson 1 → tugas L1 muncul
- Saat student membaca lesson 2 → tugas L2 TIDAK muncul (hanya konten materi)

**Behavior yang Diharapkan:**
- Setiap lesson menampilkan tugas yang terkait dengan lesson tersebut
- Lesson 2 harus menampilkan tugas "Coba Tugas L2"
- Semua tugas dari semua lesson harus bisa dibaca student

**Analisis Teknis (akar masalah):**
- Backend **sengaja mengosongkan** field `assignment` pada `GET /lessons` (list lesson per modul)
- Data tugas lengkap **hanya ada** di `GET /lessons/:uid` (detail lesson)
- FE sebelumnya memakai data dari list lesson sebagai fallback → lesson 2+ tidak punya info tugas
- Normalisasi status assignment case-sensitive: status selain `'TERBIT'` / `'DITUTUP'` persis bisa di-map ke `DRAFT` dan disembunyikan dari student

**Perbaikan FE (QA-C-16):**
- Prefetch detail **semua lesson** saat student membuka halaman learning (`use-student-lesson-details.ts` → `GET /lessons/:uid` per lesson)
- **Student tidak lagi fallback** ke data list lesson (tanpa assignment) — resolver menunggu detail lesson (`resolve-active-lesson.ts`, `allowListFallback: false`)
- Jika detail lesson aktif belum ada di cache prefetch, fetch on-demand `GET /lessons/:uid` via `useLessonByUid` (dedupe React Query)
- State loading lesson/tugas menunggu detail lesson selesai (`isActiveLessonDetailPending`)
- Normalisasi status assignment case-insensitive; status kosong/tak dikenal tidak lagi di-map ke `DRAFT` (`assignment-mapper.ts`)

**File terkait:**
- `frontend/src/hooks/course-module-viewer/use-student-lesson-details.ts`
- `frontend/src/lib/course-module-viewer/resolve-active-lesson.ts`
- `frontend/src/hooks/course-module-viewer/use-course-module-viewer.ts`
- `frontend/src/lib/lesson-assignment/assignment-mapper.ts`

**Checklist retest QA:**
1. Login sebagai student yang sudah enroll course dengan ≥2 lesson ber-tugas terbit
2. Buka `/student/learning/course/{courseUid}`
3. Pilih lesson 1 → panel tugas muncul sesuai lesson 1
4. Pindah ke lesson 2 → panel tugas lesson 2 muncul (bukan kosong / hanya materi)
5. Ulangi untuk lesson berikutnya jika ada

---

### 3. Halaman Assignments Tidak Menampilkan List Tugas

> **Status FE:** 🟢 Fixed (QA-C-17, sesi 5) · **Tunggu retest QA**

> **Komentar QA:** *Fatal — Untuk halaman `/student/assignments`, list tugas dari semua course yang ada belum muncul sama sekali.*

**Screenshots:**

| Halaman Assignments |
|--------------------|
| ![Assignments kosong](assets/qa-course/8.png) |

**Deskripsi Bug:**
Di halaman daftar tugas student (`/student/assignments`), tidak ada tugas yang ditampilkan sama sekali. Semua card statistik menunjukkan angka 0.

**Behavior Saat Ini:**
- Student membuka halaman `/student/assignments`
- Card "Total tugas" menunjukkan 0
- Card "Perlu aksi" menunjukkan 0
- Card "Menunggu review" menunjukkan 0
- Card "Mendesak" menunjukkan 0
- Pesan: "Belum ada tugas yang bisa ditampilkan"

**Behavior yang Diharapkan:**
- Halaman menampilkan semua tugas dari course yang telah student enroll
- Statistik sesuai dengan jumlah tugas yang ada
- Student bisa melihat dan mengerjakan tugas

**Analisis Teknis:**
- Query assignments student mungkin mengembalikan array kosong
- Perlu dicek apakah relasi antara student dan assignment sudah benar
- Filter atau join query mungkin bermasalah

---

## Ringkasan Bug

| No | Lokasi | Deskripsi | Prioritas | ID Board | Status |
|----|--------|-----------|-----------|----------|--------|
| 1 | Katalog Course | Course draft bisa diakses student | Fatal | QA-C-18 | 🟢 Fixed |
| 2 | Halaman Learning | Tugas lesson 2 tidak tampil | Fatal | QA-C-16 | 🟢 Fixed |
| 3 | Halaman Assignments | Daftar tugas kosong | Fatal | QA-C-17 | 🟢 Fixed |

---

## File yang Perlu Diperiksa

### Bug #1 - Course Draft
- Endpoint API list course untuk student
- Filter status publish pada query
- Middleware/guard di frontend

### Bug #2 - Tugas Lesson 2
- `frontend/src/pages/student/learning/...`
- Logika fetch assignment per lesson
- Mapping tugas dengan lesson_id

### Bug #3 - Halaman Assignments
- `frontend/src/pages/student/assignments/...`
- Query assignments student
- Relasi student-course-assignment

---

## Pertanyaan

### 1. Tempat Memberikan Review
- Belum jelas dimanakah letak student dapat memberikan sebuah review untuk course yang telah didaftarkan/enroll
