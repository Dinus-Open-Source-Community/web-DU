# Analisis Menyeluruh Design Token DOSCOM University (`web-DU`)
**Tanggal**: 20 Oktober 2026  
**Cakupan**: `frontend/` (Landing, Shell, Dashboard Admin, Super Admin, Mentor, Student)

---

## 1. Filosofi & Arah Desain ("Playful Canvas / Editorial")

Frontend DOSCOM University dibangun di atas bahasa desain **"Playful Editorial Canvas"** yang diadaptasi dari spesifikasi Canvas (`canvas-design-tokens.json` & `design.md`). Karakteristik intinya:
- **Paper & Ink Surface**: Permukaan bernuansa kertas (`paper-white`, `paper-offwhite`, `paper-paper`) dengan garis tepi tinta hitam tegas berbobot 2px dengan transparansi 10% (`border-2 border-ink-900/10`).
- **Tactile Depth & Shadows**: Menggunakan bayangan kertas fisik `shadow-paper` (`0 12px 26px rgba(5, 9, 20, 0.10)`) dan `shadow-button` (`0 3px 0 #0B1018`) tanpa efek blur berlebihan (menolak glassmorphism dan gradien berlebih).
- **Sticky-Note Pastels**: Palet warna aksen bertema memo tempel (`note-mint`, `note-yellow`, `note-peach`, `note-sky`, `note-lavender`, `note-pink`) untuk tag, status progres, dan strip aksen border.
- **Electric Brand Blue**: Warna biru elektrik (`brand-blue` #13A8FF, `brand-hover` #0798EE, `brand-soft` #BCEEFF, `brand-ink` #0061C8) untuk interaksi utama, fokus, dan tautan aktif.
- **Tipografi Berjenjang**:
  - `font-display` (*DynaPuff*, 700): Brand mark, judul display playful.
  - `font-sans` (*Plus Jakarta Sans*, 400–800): UI utama, angka metriks, tabel, teks kartu.
  - `font-hand` (*Shantell Sans*): Anotasi, kutipan informal.

---

## 2. Taksonomi & Pemetaan Design Tokens

### 2.1 Warna (Color Palette)
| Kategori Token | Nama Token Tailwind | Nilai Hex / HSL | Penggunaan Baku |
| :--- | :--- | :--- | :--- |
| **Ink (Tinta)** | `ink-900` | `#050914` | Teks judul utama, outline kartu (`border-ink-900/10`) |
| | `ink-800` | `#07111F` | Kontras tinggi |
| | `ink-700` | `#102039` | Teks body primer, isi tabel |
| | `ink-600` | `#2B3C55` | Teks pendukung |
| | `ink-500` | `#56657A` | Label KPI, meta-text, placeholder |
| | `ink-400` | `#7E8998` | Ikon pelengkap, divider lembut |
| **Paper (Permukaan)** | `paper-white` | `#FFFFFF` | Latar belakang kartu, modal, popover |
| | `paper-offwhite` | `#FBFCFD` | Latar belakang kanvas halaman / shell |
| | `paper-paper` | `#F6F7F8` | Latar baris tabel, hover state, segmented control |
| | `paper-panel` | `#F1F3F5` | Badge netral, status belum mulai |
| **Brand (DOSCOM)** | `brand-blue` | `#13A8FF` | Tombol primer, toggle aktif, highlight |
| | `brand-hover` | `#0798EE` | Hover state tombol primer |
| | `brand-soft` | `#BCEEFF` | Latar badge aktif, aksen terang |
| | `brand-ink` | `#0061C8` | Teks link aktif, teks badge di atas `brand-soft` |
| **Sticky Note (Aksen)**| `note-mint` | `#A8EFCF` | Status selesai, aksen KPI pengguna aktif |
| | `note-yellow` | `#FFEF9D` | Status hampir selesai, aksen KPI kursus aktif |
| | `note-sky` | `#BCEEFF` | Status sedang berjalan, pendaftaran |
| | `note-peach` | `#FFC4A6` | Transaksi, warning |
| | `note-lavender`| `#D7CBFF` | Status penyelesaian kursus |
| **Lines & Borders** | `line-light` | `#E5E8EC` | Garis pembatas internal, border tabel |
| | `line-medium` | `#CBD2DA` | Garis border kontrol input |

### 2.2 Komponen Shell & Layout Tokens (`app-shell-tokens.ts`)
- `appShellPageBgClassName`: `bg-paper-offwhite`
- `appShellGridOverlayClassName`: Grid blueprint tipis opacity 3.5%
- `appCardClassName`: `rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper`
- `appCardHeaderClassName`: `border-b border-line-light`
- `appKpiLabelClassName`: `truncate text-sm font-medium text-ink-500`
- `appKpiValueClassName`: `text-2xl font-bold tracking-tight text-ink-900`
- `dashboardPageStackClassName`: `relative z-[1] flex w-full min-w-0 flex-col gap-6`

---

## 3. Temuan Gap & Masalah pada Dasbor Superadmin & Admin

Berdasarkan audit menyeluruh terhadap `frontend/src/pages/admin/Dashboard.tsx` dan komponen terkait (`components/Admin/Dashboard/*`):

1. **Kebocoran Palet Generic Tailwind (Slate Leaks)**:
   - `StudentProgressCard.tsx`: Menggunakan `bg-slate-100`, `text-slate-700`, `bg-blue-100`, `bg-amber-100`, `bg-emerald-100`, serta `bg-slate-200` pada progress bar. Warna-warna ini tidak terikat pada design token kanvas dan membuat kontras visual terputus dari tema `note-*`.
   - `MentorActivityCard.tsx`: Menggunakan `bg-slate-50`, `hover:bg-slate-100`, dan `bg-slate-200` pada skeleton.
   - `TopCoursesCard.tsx` & `RecentEnrollmentsCard.tsx`: Menggunakan skeleton `bg-slate-200` bukan `bg-line-light` / `bg-paper-panel`.

2. **Hierarki Kontainer Bertingkat (Double-Card Nesting)**:
   - Pada `TopCoursesCard` dan `RecentEnrollmentsCard`, kontainer tabel dibungkus lagi oleh kartu kedua yang memiliki border tebal 2px dan bayangan `shadow-paper` yang sama persis dengan kartu pembungkus luarnya (`rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper`). Hal ini menghasilkan visual yang berantakan (border bertumpuk ganda).

3. **Hardcoded Hex String pada KPI Accent**:
   - `kpi-accent.ts` menggunakan nilai hardcoded `users: 'border-l-[#A8EFCF]'` alih-alih token Tailwind `border-l-note-mint`, serta belum memiliki varian warna untuk metrik kursus dan completion.

4. **Diferensiasi Role Super Admin vs Admin**:
   - Dasbor belum menampilkan indikator badge role yang jelas untuk membedakan konteks pengguna (Super Admin vs Admin).
   - Pintasan navigasi cepat (`QuickLinks`) belum terintegrasi di halaman utama dasbor. Super admin yang memiliki kewenangan manajemen Administrator (`ROUTES.admin.users.administrators`) belum memiliki tombol aksi langsung.

5. **Format Data & Tipografi**:
   - Teks nama dan angka masih menggunakan `text-foreground` generik alih-alih `text-ink-900` atau `text-ink-700`.

---

## 4. Matriks Perubahan & Penyesuaian

| Komponen | Elemen | Sebelum (Non-standar) | Sesudah (Standar Token) |
| :--- | :--- | :--- | :--- |
| **`Kpi.tsx` / `kpi-accent.ts`** | Border aksen | `'border-l-[#A8EFCF]'` | `border-l-note-mint`, `border-l-note-yellow`, `border-l-note-sky`, `border-l-note-lavender` |
| **`TopCoursesCard.tsx`** | Wrapper Tabel | Kartu kedua dengan `border-2` & `shadow-paper` | `overflow-hidden rounded-lg border border-line-light` tanpa bayangan ganda |
| | Header Tabel | `bg-paper-paper/80` | `bg-paper-paper text-ink-500 border-b border-line-light text-xs font-semibold` |
| | Nama Kursus | `text-foreground` | `text-ink-900 font-semibold` |
| | Pill Completion | Teks persentase polos | Badge `bg-paper-paper text-ink-700 font-bold border border-line-light` |
| **`StudentProgressCard.tsx`** | Badge Status | `bg-slate-100`, `bg-blue-100`, `bg-amber-100`, `bg-emerald-100` | `note-mint`, `note-yellow`, `note-sky`, `paper-panel` ber-border |
| | Progress Track | `bg-slate-200` | `bg-paper-paper border border-line-light` |
| | Progress Indicator | `bg-primary` monolitik | Aksen warna dinamis sesuai status (`bg-note-mint`, `bg-note-yellow`, `bg-brand-blue`, `bg-ink-400`) |
| **`MentorActivityCard.tsx`** | Baris Mentor | `bg-slate-50 hover:bg-slate-100` | `bg-paper-offwhite border border-line-light hover:bg-paper-paper` |
| | Badge Kursus | `bg-primary/10 text-primary` | `bg-brand-soft text-brand-ink border border-brand-blue/20` |
| **`RecentEnrollmentsCard.tsx`** | Wrapper Tabel | Kartu kedua ber-shadow ganda | `overflow-hidden rounded-lg border border-line-light` |
| | Tanggal | Raw ISO string | `d MMM yyyy` dengan `text-ink-500` |
| **`Dashboard.tsx`** | Header & Subtitle | Polos tanpa info role | Menampilkan badge role (`Super Admin` / `Admin`) & greeting dinamis |
| | Pintasan Cepat | Tidak ada | Menyertakan `QuickLinks` yang disesuaikan hak akses Super Admin vs Admin |
