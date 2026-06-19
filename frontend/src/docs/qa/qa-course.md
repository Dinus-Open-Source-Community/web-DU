# Bug Report — Course Feature (QA Session)

> **Catatan QA:** Dokumen ini berisi temuan bug dari sesi QA untuk fitur Course pada role **Student**. Kata-kata di bawah ini merupakan komentar dari QA yang telah disusun ulang agar lebih jelas dan profesional.

---

## Role: Student

### 1. Hilangkan Pop-up "Pilih Mode Membaca" Saat Akses Lessons

> **Komentar QA:** *Hilangkan pop up yang muncul ketika ingin mengakses lessons, dikareanakan ini sangat menggangu.*

**Screenshots:**

| Pop-up Pilih Mode Membaca |
|---------------------------|
| ![Pop-up mode membaca](assets/qa-course/1.png) |

**Deskripsi Bug:**
Setiap kali student ingin mengakses lesson, muncul pop-up "Pilih mode membaca" yang mengharuskan memilih dark mode atau light mode terlebih dahulu. Pop-up ini terasa mengganggu dan mengurangi kenyamanan saat belajar.

**Behavior Saat Ini:**
- Student klik lesson pada course
- Muncul pop-up "Pilih mode membaca"
- Student harus klik "Mulai membaca" untuk melanjutkan

**Behavior yang Diharapkan:**
- Pop-up tidak lagi muncul saat student mengakses lesson
- Mode membaca bisa langsung menggunakan default setting (dark mode) atau diatur melalui tombol setting di kanan atas
- Pengalaman akses lesson menjadi lebih cepat dan lancar

**Analisis Teknis:**
- Cari komponen dialog/modal yang di-trigger saat membuka halaman lesson
- Pertimbangkan untuk menyimpan preferensi mode di localStorage dan hanya tampilkan dialog saat pertama kali pengguna menggunakan fitur
- Atau hilangkan dialog sama sekali dan gunakan default mode

---

### 2. Kursus Populer Tidak Menampilkan Course yang Sudah Enroll atau Sedang Dilihat

> **Komentar QA:** *Pada saat melihat detail course, buat section "Kursus populer" tidak menampilkan course yang sudah di daftar/enroll dan tidak menampilkan course yang sedang dilihat di detail. Bila kosong pikiran sendiri dikasih apa. Ini berlaku juga ke halaman Home dikareanakan pada home bila aku melakukan pendaftaran lagi (padahal sudah terdaftar) itu bisa dan masuk ke menu detail course.*

**Deskripsi Bug:**
Section "Kursus Populer" di halaman detail course menampilkan course yang sedang dibuka atau course yang sudah student enroll. Selain itu, di halaman Home, course yang sudah didaftarkan masih bisa didaftarkan lagi dan malah masuk ke detail course.

**Behavior Saat Ini:**
- Di halaman detail course, section "Kursus Populer" bisa menampilkan course yang sama atau sudah di-enroll
- Di halaman Home, student bisa mendaftar ulang course yang sudah terdaftar
- Setelah mendaftar ulang, student diarahkan ke halaman detail course

**Behavior yang Diharapkan:**
- **Detail Course:** Section "Kursus Populer" tidak menampilkan:
  - Course yang sedang dibuka
  - Course yang sudah di-enroll oleh student
- **Home:** Course yang sudah di-enroll tidak bisa didaftarkan ulang
- Jika setelah difilter tidak ada course yang tersedia, tampilkan alternatif sesuai kebijakan (misal: sembunyikan section, tampilkan course terbaru, atau tampilkan pesan)

**Analisis Teknis:**
- Tambahkan filter pada endpoint/API "Kursus Populer" untuk exclude course aktif dan course yang sudah di-enroll
- Tambahkan pengecekan status enroll sebelum menampilkan tombol "Daftar" di halaman Home
- Redirect course yang sudah di-enroll ke halaman learning, bukan detail course

---

### 3. Perbaiki Spacing/Layout Modal Checkout yang Terlalu Longgar

> **Komentar QA:** *Pada saat ingin checkout modal yang diberikan memiliki gap yang sangat tidak baik atau JELEK BANGET ANJING.*

**Screenshots:**

| Modal Checkout |
|----------------|
| ![Modal checkout](assets/qa-course/2.png) |

**Deskripsi Bug:**
Modal checkout "Selesaikan Pendaftaran" memiliki gap/spacing yang tidak rapi antar elemen. Tampilan modal terasa longgar dan kurang profesional.

**Behavior Saat Ini:**
- Modal checkout muncul saat student klik daftar course berbayar
- Terdapat banyak ruang kosong yang tidak proporsional
- Layout metode pembayaran dan informasi course kurang rapat

**Behavior yang Diharapkan:**
- Spacing antar elemen lebih rapat dan konsisten
- Informasi course, metode pembayaran, dan tombol bayar memiliki hierarki visual yang jelas
- Modal terlihat lebih rapi dan enak dilihat

**Analisis Teknis:**
- Periksa class Tailwind/CSS yang mengatur padding, margin, dan gap pada modal
- Sesuaikan jarak antar section (info course, metode pembayaran, tombol)
- Pastikan modal tetap responsif di berbagai ukuran layar

---

### 4. Perkecil Gap Antar Kategori di Halaman `/course`

> **Komentar QA:** *Pada `/course`, perkecil gap antar category.*

**Screenshots:**

| Gap Kategori |
|--------------|
| ![Gap kategori](assets/qa-course/3.png) |

**Deskripsi Bug:**
Pada halaman `/course`, jarak antar item kategori di sidebar terlalu besar sehingga terlihat renggang.

**Behavior Saat Ini:**
- Sidebar kategori menampilkan item dengan gap yang besar
- Tampilan terasa tidak kompak

**Behavior yang Diharapkan:**
- Gap antar item kategori diperkecil
- Tampilan kategori lebih rapat dan nyaman dibaca

**Analisis Teknis:**
- Sesuaikan nilai `gap` atau `margin-bottom` pada list kategori
- Pastikan ukuran touch target tetap nyaman untuk klik

---

### 5. Hilangkan Text Lorem Ipsum di Halaman `/course`

> **Komentar QA:** *Pada `/course`, hilangkan text lorem impsum tidak jelas.*

**Screenshots:**

| Text Lorem Ipsum |
|------------------|
| ![Text lorem ipsum](assets/qa-course/4.png) |

**Deskripsi Bug:**
Pada halaman `/course` terdapat text placeholder "Lorem ipsum dolor sit amet..." di bawah heading "Explore Open Source Course". Text ini tidak jelas dan terlihat tidak profesional.

**Behavior Saat Ini:**
- Halaman `/course` menampilkan text lorem ipsum
- Text tidak memberikan informasi yang berguna bagi user

**Behavior yang Diharapkan:**
- Ganti text lorem ipsum dengan deskripsi yang relevan
- Atau hapus text tersebut jika tidak diperlukan
- Jika belum ada copy final, bisa gunakan deskripsi singkat tentang katalog course

**Analisis Teknis:**
- Cari heading/subheading di halaman `/course`
- Ganti text lorem ipsum dengan copy yang sesuai konteks

---

## Ringkasan Bug

| No | Lokasi | Deskripsi | Prioritas |
|----|--------|-----------|-----------|
| 1 | Halaman Learning | Hilangkan pop-up mode membaca | Medium |
| 2 | Detail Course & Home | Filter kursus populer dan cegah daftar ulang | Medium |
| 3 | Modal Checkout | Perbaiki spacing modal | Medium |
| 4 | Halaman `/course` | Perkecil gap kategori | Low |
| 5 | Halaman `/course` | Hapus/ganti text lorem ipsum | Low |

---

## File yang Perlu Diperiksa

### Bug #1 - Pop-up Mode Membaca
- Komponen modal pemilihan mode membaca
- Logic trigger saat membuka lesson
- LocalStorage preference mode

### Bug #2 - Kursus Populer & Daftar Ulang
- Komponen section "Kursus Populer"
- Endpoint/API course populer
- Logic pengecekan status enroll
- Tombol daftar di halaman Home

### Bug #3 - Modal Checkout
- Komponen modal checkout
- Styling Tailwind/CSS (padding, gap, margin)

### Bug #4 - Gap Kategori
- Komponen sidebar kategori di halaman `/course`
- Styling list kategori

### Bug #5 - Text Lorem Ipsum
- Halaman `/course`
- Komponen hero/heading section
