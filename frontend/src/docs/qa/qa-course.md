# Bug Report — Course Feature (QA Session)

> **Catatan QA:** Dokumen ini berisi temuan bug dari sesi QA untuk fitur Course pada role **Student**. Kata-kata di bawah ini merupakan komentar dari QA yang telah disusun ulang agar lebih jelas dan profesional.

---

## Role: Student

### 1. Section Kursus Populer Menampilkan Course yang Sama di Halaman Detail

> **Komentar QA:** *Saat student mencari course dan klik detail course, pada section kursus populer masih menampilkan course yang sedang dibuka.*

**Deskripsi Bug:**
Ketika student mencari course dan membuka halaman detail course tertentu, pada bagian "Kursus Populer" (atau section serupa) masih menampilkan course yang sedang dilihat oleh student. Seharusnya section tersebut menampilkan course lain yang berbeda dari course detail yang sedang dibuka.

**Behavior Saat Ini:**
- Student mencari "React"
- Student mengklik salah satu course React
- Di halaman detail course tersebut, section "Kursus Populer" masih menampilkan course yang sama

**Behavior yang Diharapkan:**
- Section "Kursus Populer" harus menampilkan course yang berbeda dari course detail yang sedang dibuka
- Hindari duplikasi atau menampilkan course yang sedang aktif

---

### 2. Halaman Checkout (Payment) Menampilkan Placeholder Image React dan Text "Kursus"

> **Komentar QA:** *Saat masuk ke halaman checkout `http://localhost:3000/student/transactions/payment?reference=DEV-T37673378999AEEIK&merchant_ref=INV13`, pada ringkasan pesanan masih terdapat image react dan text "Kursus". Jika di-refresh baru muncul detail nama kursus dan metode pembayaran.*

**Screenshots:**

| Halaman payment sebelum refresh | Halaman payment setelah refresh |
|--------------------------------|--------------------------------|
| ![Payment sebelum refresh](assets/qa-course/1.png) | ![Ringkasan pesanan](assets/qa-course/2.png) |

> **Catatan:** Untuk tombol "Unduh Invoice" itu dikarenkana malas untuk memberikan contoh lebih jelas.

**Deskripsi Bug:**
Pada halaman checkout/payment (`/student/transactions/payment`), ringkasan pesanan menampilkan placeholder berupa image React dan text "Kursus" yang tidak informatif. Data nama kursus dan metode pembayaran baru muncul setelah halaman di-refresh manual.

**Behavior Saat Ini:**
- Student membuka halaman payment
- Ringkasan pesanan menampilkan: image React + text "Kursus" (placeholder)
- Data detail tidak termuat saat pertama kali load

**Behavior yang Diharapkan:**
- Ringkasan pesanan langsung menampilkan nama kursus dan detail dengan benar saat halaman pertama kali load
- Tidak perlu refresh manual untuk melihat data

**Analisis Teknis:**
- Kemungkinan penyebab: race condition saat mengambil data transaction/order
- Data course detail mungkin belum tersedia saat komponen di-render
- Perlu memastikan data di-fetch dan di-resolve sebelum rendering

---

### 3. Tugas dari Lesson 2 Tidak Tampil di Halaman Learning Course

> **Komentar QA:** *Saat masuk ke course untuk belajar, tugas dari lessons 2 tidak ter-show. Studi kasus: modul 1 memiliki 2 lesson, dimana satu lesson memiliki satu tugas. Pada saat membaca di `http://localhost:3000/student/learning/course/{id}`, tugas yang ter-show hanya milik lesson 1 dan untuk lesson 2 tidak tampil (hanya materinya saja yang shown).*

**Deskripsi Bug:**
Pada halaman learning course (`/student/learning/course/{id}`), hanya tugas dari lesson 1 yang ditampilkan. Tugas dari lesson 2 tidak muncul meskipun lesson tersebut memiliki tugas.

**Behavior Saat Ini:**
- Student membuka course dengan modul yang memiliki 2 lessons
- Lesson 1 memiliki tugas → tugas tampil
- Lesson 2 memiliki tugas → tugas TIDAK tampil (hanya materi yang shown)

**Behavior yang Diharapkan:**
- Semua tugas dari setiap lesson harus tampil di halaman learning course
- Task dari lesson 2 harus terlihat dan bisa diakses

**Analisis Teknis:**
- Kemungkinan penyebab: filtering atau mapping data tugas yang hanya mengambil tugas dari lesson pertama
- Perlu dicek bagaimana data assignment di-fetch dan di-group per lesson
- Mungkin ada issue dengan indexing atau key yang duplikat

---

### 4. Halaman Assignments Tidak Menampilkan Tugas yang Ada

> **Komentar QA:** *Untuk halaman `http://localhost:3000/student/assignments`, tugas masih tidak muncul padahal lesson 2 masih memiliki tugas dan belum expired.*

**Deskripsi Bug:**
Di halaman daftar tugas student (`/student/assignments`), tugas yang seharusnya masih aktif dan belum expired tidak ditampilkan sama sekali.

**Behavior Saat Ini:**
- Student membuka halaman `/student/assignments`
- Daftar tugas kosong/tidak ada yang tampil
- Padahal student masih memiliki tugas aktif dari lesson 2

**Behavior yang Diharapkan:**
- Halaman assignments menampilkan semua tugas student yang masih aktif dan belum expired
- Tugas dari lesson 2 yang belum expired harus terlihat

**Analisis Teknis:**
- Kemungkinan penyebab: query assignments yang salah atau filter yang terlalu strict
- Perlu dicek apakah API query sudah benar
- Mungkin ada issue dengan filtering berdasarkan `course_id` atau `lesson_id`

---

## Ringkasan Bug

| No | Lokasi | Deskripsi | Prioritas |
|----|--------|-----------|-----------|
| 1 | Halaman Detail Course | Kursus Populer menampilkan course yang sama | Medium |
| 2 | Halaman Payment | Placeholder image/text sebelum refresh | High |
| 3 | Halaman Learning Course | Tugas lesson 2 tidak tampil | High |
| 4 | Halaman Assignments | Daftar tugas kosong | High |

---

## File yang Perlu Diperiksa

### Bug #1 - Kursus Populer
- Komponen yang menampilkan section kursus populer di halaman detail course
- Logika filtering untuk menampilkan course berbeda

### Bug #2 - Halaman Payment
- Endpoint/API yang mengambil data transaction
- Komponen ringkasan pesanan di halaman payment
- Handling loading state

### Bug #3 - Learning Course
- `frontend/src/pages/student/learning/...`
- Logika fetch dan render tugas per lesson

### Bug #4 - Halaman Assignments
- `frontend/src/pages/student/assignments/...`
- Query/fetch assignments student
- Filter dan validasi data tugas

---

## Pertanyaan

### 1. Tempat Meletakkan Reviews
- Dimanakah letak user dapat meletakkan sebuah reviews?

---

## Perintah

### 1. Tampilan Balasan Review dari Admin/Mentor
- Berikan tampilan untuk balasan review dari admin/mentor untuk review yang diberikan user

