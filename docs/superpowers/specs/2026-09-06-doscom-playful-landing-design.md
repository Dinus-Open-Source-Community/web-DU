# DOSCOM University — Playful Landing Redesign (Spec)

> Status: **DRAFT — menunggu review & revisi kamu sebelum eksekusi.**
> Cara review: baca §16 (pertanyaan review), tulis revisi per nomor bagian (§1–§15).
> Pendamping: `frontend/src/docs/design/design.md` + `canvas-design-tokens.json` (referensi visual, bukan source of truth untuk konten).

Tanggal: 2026-09-06 · Approach: **A — Token-first, bertahap** · Scope: **global (seluruh aplikasi)**

---

## §1. Keputusan terkunci (hasil grill, 10 butir)

| # | Keputusan |
|---|---|
| 1 | Rebrand penuh ala struktur Canvas; konten & identitas tetap DOSCOM |
| 2 | Scope global — token baru berlaku ke seluruh app (landing, auth, dashboard student/mentor/admin) |
| 3 | Display **DynaPuff**, body/reading **Plus Jakarta Sans** |
| 4 | Maskot pinguin **redesign total** gaya hand-drawn |
| 5 | Interaktivitas **gabungan**: ambient loops + micro-interaction + showpiece |
| 6 | Stack motion: **`motion` + `gsap`/`@gsap/react` + `lenis`** (tanpa `framer-motion` ganda — itu nama lama dari `motion`); versi sudah diverifikasi via Context7 (lihat §10) |
| 7 | Section wajib: Hero (hook non-generik) → Our Stack → Our Mentors → Course → Gallery → Get in Touch + tambahan dari design.md |
| 8 | Dwi-audiens (maba Udinus + publik umum), CTA ganda |
| 9 | **Dark mode dihapus**, single light playful theme |
| 10 | Maskot = **SVG doodle di kode** (bukan file gambar) |

---

## §2. Goal & non-goal

**Goal (satu kalimat):** Mengganti fondasi design token menjadi sistem playful ala Canvas (kertas, tinta, electric blue, pastel, grid navy) dan membangun ulang landing page sebagai SPA satu halaman yang hidup dan interaktif tanpa merusak dashboard yang sudah berjalan.

**Non-goal (tegas di luar scope):**
- Membuat halaman baru (`/community`, `/about`, `/pricing`, `/blog`, dll. yang link-nya mati hari ini) — link mati dipetakan ulang ke rute/anchor yang ada (§8, §13).
- Mengubah skema API/backend, auth flow, atau logika bisnis dashboard.
- Menghapus Lottie dari dashboard/auth (tetap dipakai di sana; larangan Lottie hanya untuk dekorasi landing baru).
- Menambah test runner baru (repo tidak punya; verifikasi = `tsc` + `eslint` + `vite build` + QA visual).

---

## §3. Scope rute & file

**Struktur dibangun ulang:** `/` (Home + 9 section baru), Navbar + Footer (dipakai juga oleh `/course`).
**Hanya ikut token (tanpa perubahan struktur):** `/course`, `/course/:uid`, semua `/auth/*`, seluruh dashboard student/mentor/admin, `/profile`.
**Disentuh untuk migrasi:** `index.css`, `ui/sonner.tsx` (cabut next-themes), 19 file bervarian `dark:` (strip saja), `index.html` (lang/judul/meta).

---

## §4. Sistem token v2

Source of truth: `frontend/src/docs/design/canvas-design-tokens.json` → naik **v2.0.0** (catat: font diganti, kontrak light-only).

### 4.1 Token semantik (re-point — dashboard ikut otomatis, tanpa rewrite massal)

| Token | Lama | Baru (Canvas) | Efek |
|---|---|---|---|
| `--background` | `#fdfdfb` | `#FBFCFD` (offWhite) | — |
| `--foreground` | `#232323` | `#050914` (ink 900) | teks app jadi tinta pekat |
| `--card` | `#ffffff` | `#FFFFFF` | tetap |
| `--primary` | `#0a84dc` | `#13A8FF` (brand blue) | — |
| `--primary-foreground` | `#ffffff` | `#050914` | tombol primer = teks tinta di atas biru elektrik (sesuai design.md) |
| `--secondary` | `#dcdcdc` | `#F1F3F5` (panel) | — |
| `--secondary-foreground` | `#232323` | `#050914` | — |
| `--muted` | `#f2f2f2` | `#F1F3F5` | — |
| `--muted-foreground` | `#545454` | `#56657A` (ink 500) | — |
| `--accent` | `#e7f3fc` | `#BCEEFF` (blueSoft) | — |
| `--accent-foreground` | `#0a84dc` | `#008EFF` (blueInk) | — |
| `--destructive` | `#e33127` | `#E34D59` | foreground tetap putih |
| `--border` / `--input` | `#dcdcdc` | `#E5E8EC` (line light) | — |
| `--ring` | `#0a84dc` | `#13A8FF` | — |
| `--chart-1..5` | biru/merah/kuning campur | `#13A8FF, #E34D59, #F2A900, #BCEEFF, #A991FF` | — |
| sidebar `*` | abu/biru lama | paper/ink/blue ekuivalen | — |
| `--font-sans` | Poppins | Plus Jakarta Sans | import fontsource diganti |
| `--radius` | `1rem` | **tetap `1rem`** | skala shadcn dipertahankan (deviasi sadar §12) |
| mono | JetBrains Mono | **tetap** | keterbacaan dashboard (deviasi §12) |

### 4.2 Token playful aditif (namespaced, hanya komponen baru)

`--color-ink-900/800/700/600/500/400`, `--color-paper-white/offwhite/paper/panel`,
`--color-brand-blue/hover/soft/ink`, `--color-note-mint/yellow/peach/pink/sky/lavender` (+`pinkSoft`, `mintStrong`, `lavenderStrong`, `green`, `orange` sesuai JSON),
`--color-line-light/medium`, `--shadow-paper`, `--shadow-button (0 3px 0 #0B1018)`, `--shadow-button-hover (0 5px 0 #0B1018)`,
`--animate-float/wiggle/drift/bob` + keyframes dari design.md §14, `--font-display` (DynaPuff).
Plus: `::selection { background: #BCEEFF }`, focus ring tetap memakai `--ring`.

### 4.3 Yang mati

Blok `.dark` utuh, varian `dark:` di 19 file (daftar pasti di plan), `@custom-variant dark`, dependensi `next-themes`, import Poppins.

---

## §5. Tipografi

- Display: DynaPuff 700 (hero clamp ~4rem–8rem, `line-height .9`, `letter-spacing -.02em`), 600–700 untuk heading section. DynaPuff hanya punya weight 400–700 — **800 tidak ada**, jadi hero memakai 700.
- Body/UI: Plus Jakarta Sans 400–700; eyebrow/nav/button 800 uppercase; italic didukung (untuk eyebrow italic ala design.md).
- Aturan: DynaPuff **hanya** display/heading/angka besar; tidak pernah untuk body, dashboard dense, atau teks kecil (<14px).

---

## §6. Aturan pakai warna (disiplin aksen)

Biru elektrik = aksen interaksi (CTA primer, active nav, underline, link). **Bukan** background section (hanya section navy `#07111F` + kertas). Pastel = sticky notes, icon chips, thumbnail, avatar fallback — rotasi acak semu dari set tetap (deterministik per index, bukan `Math.random` saat render). Ink border 2px + offset shadow hanya untuk elemen taktil (button primer/sekunder, sticky note, preview frame, testimonial). Radius besar (20–28px) hanya kartu major; button playful `rounded-[10px]`.

---

## §7. Inventaris komponen

**Baru (`components/landing/` + `components/playful/`):**
`StickyNote` (draggable opsional), `HandUnderline` (SVG), `DoodleArrow` (3 varian path), `SectionHeader` (eyebrow+title+copy), `Reveal` (motion whileInView + stagger), `PenguinMascot` (SVG geometris + stroke ink), `MentorCard`, section: `Hero`, `StackSection`, `MentorsSection`, `CourseSection`, `HowItWorksSection`, `GallerySection`, `TestimonialSection`, `FinalCTASection` (gabung Get in Touch).
**Data (`lib/landing/`):** `copy.ts` (seluruh copy landing — satu sumber), `stack.ts`, `mentors.ts` (derivasi), `gallery.ts`, `contact.ts`, `testimonial.ts`.
**Provider:** `providers/motion-provider.tsx` (`ReactLenis root` + sync ScrollTrigger + `ScrollManager` reset per route + hash scroll).
**Dirombak:** `pages/landing/Home.tsx`, `components/shared/Navbar.tsx`, `components/shared/Footer.tsx`, `components/ui/button.tsx` (varian playful), `index.css`, `index.html`.
**Reuse tanpa ubah:** `CardCourse`, `useFeaturedCourses`, `useLandingCommunityStats`, `navLinks` (ditambah anchor), `socialLinks` (dipindah ke `contact.ts`), logika subscribe Footer, auth dropdown Navbar.

---

## §8. Susunan section & ritme

Navbar (paper, fixed, 88px) → **Hero** (paper, center stack) → **Our Stack** (dark navy grid) → **Our Mentors** (paper) → **Course** (panel tipis) → **How It Works** (dark, pin desktop) → **Gallery** (paper) → **Testimonial** (dark + kartu paper) → **Final CTA + Get in Touch** (paper, digabung agar tidak ada dua CTA kertas berurutan) → Footer (ink-800, newsletter dipertahankan).

Pemetaan konten: Stack = React 19, TypeScript, Tailwind v4, Go (Gin), PostgreSQL, MinIO, Docker (faktual dari repo). Mentors = dedupe `course.mentors` (nama, role, jumlah kursus, avatar inisial pastel). Course = `useFeaturedCourses` + `CardCourse` + link `/course`. HowItWorks = 01 Gabung & daftar → 02 Sprint belajar bareng mentor → 03 Kontribusi OSS & portofolio. Gallery = bingkai doodle + empty state "dokumentasi segera hadir". Testimonial = 1 kutipan sampel (launch gate §14). Get in Touch = kartu kontak dari `contact.ts` (nilai awal = `socialLinks` existing apa adanya).

Nav anchor: `#stack #mentor #kursus #galeri #kontak` (format `/#stack` agar work dari `/course`), plus link `Course /course`, CTA Daftar/Masuk. Scroll hash ditangani `ScrollManager`.

---

## §9. Arah copy (draf — pilih/sunting saat review)

Bahasa Indonesia, dwi-audiens, hierarki CTA: primer **Gabung Komunitas** (`/auth/register`), sekunder **Jelajahi Kursus** (`/course`). Aturan anti-slop: angka harus dari `useLandingCommunityStats`, kata benda konkret (sprint, code review, repo, sertifikat), larangan frasa generik ("jelajahi dunia", "unlock your potential", "cutting-edge") dan emoji di copy.

Draf hook hero (pilih satu):
- **A.** Eyebrow: `KOMUNITAS OPEN SOURCE UDINUS` · H1: "Ngoding sendirian itu sepi." · Sub: "Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source."
- **B.** H1: "Teori dari kampus. Pengalaman dari sini." · Sub: sama pola A.
- **C.** H1: "Belajar IT yang pulangnya bawa portofolio." · Sub: sama pola A.

Sticky notes hero: "Proyek OSS Nyata", "Mentor Praktisi", "Sprint & Code Review", "Sertifikat", "Komunitas Udinus".

---

## §10. Arsitektur motion (versi terverifikasi Context7, Sept 2026)

| Lapisan | Pemilik | Dipakai untuk |
|---|---|---|
| CSS keyframes | — | float/wiggle/drift/bob, transisi hover/tap |
| `motion@13.2.0` (`import from "motion/react"`) | interaksi komponen | `Reveal` (whileInView+stagger), sticky-note **drag** (`drag`, `dragConstraints`, `dragElastic`), hover/tap fisik, mobile menu, `useReducedMotion` gate |
| `gsap@3.15.0` + `@gsap/react@2.1.2` | showpiece selektif | **satu** pin desktop (HowItWorks ≥1024px) + SVG path-draw; selalu via `useGSAP({scope})`, `gsap.registerPlugin(ScrollTrigger)` |
| `lenis@1.3.26` (`lenis/react`, `<ReactLenis root>`) | smooth scroll | lerp default; `respectReducedMotion` default true (jangan dioverride); sinkron `lenis.on('scroll', ScrollTrigger.update)`; `ScrollTrigger.refresh()` setelah `document.fonts.ready` + tiap ganti route; **dilarang** ScrollSmoother (konflik) |

Batasan keras: hanya properti `transform`/`opacity` yang dianimasikan; pin hanya desktop; drag notes jadi float statis di touch/reduced-motion; cursor-doodle follower **hanya** di hero, hanya `pointer:fine`, mati saat reduced-motion; konten tidak boleh bergantung pada animasi (konten langsung visible, animasi progresif).

---

## §11. Responsif

≥1024: penuh (3 kolom grid, pin aktif, notes lengkap). 768–1023: 2 kolom, pin mati, notes dikurangi. <768: 1 kolom, nav hamburger (logika existing), CTA stack, notes max 2 + kecil, preview/gallery horizontal scroll snap, heading DynaPuff mengecil via clamp. Dekorasi tidak boleh menutupi teks/CTA di layar 360px.

---

## §12. Deviasi sadar dari design.md

1. Lottie tetap untuk loader/empty-state/payment/auth lama (cabut total = risiko tanpa nilai).
2. Mono tetap JetBrains Mono; `--radius` tetap `1rem` (stabilitas shadcn).
3. Section Templates → Course (DOSCOM bukan whiteboard tool); Product Preview → tidak ada (diganti HowItWorks pin + Gallery).
4. Copy Indonesia + section pesanan user (Stack/Mentors/Gallery/GetInTouch).
5. Footer newsletter + footerLinks dipertahankan (href mati dipetakan ulang, halaman baru tidak dibuat).
6. Cursor follower dibatasi (§10).

---

## §13. Migrasi global (ringkas; detail di plan)

Re-point semantik (§4.1) otomatis mengubah dashboard — itu **tujuan**, bukan efek samping. Strip `dark:` (19 file), `sonner.tsx` hardcode `theme="light"`, `npm remove next-themes`. Hardcoded `slate-*` (mis. CardMentor) tidak tersentuh token — dibiarkan kecuali kontras jebol (regression pass). `/course` ikut token tanpa refactor struktur.

---

## §14. Utang konten milikmu (launch gate — bukan placeholder kode)

1. URL sosial asli + email kontak (`contact.ts` berangkat dari nilai existing, termasuk `mailto: ` kosong).
2. Foto galeri (`public/gallery/` + `gallery.ts`).
3. Kutipan testimoni asli (ganti 1 sampel).
4. Pilih hook A/B/C (§9) + konfirmasi list stack (§8).
5. Putuskan pemetaan footer link mati (usulan di plan).

---

## §15. Acceptance checklist

Visual: nav paper + active blue; hero DynaPuff dominan + 5 notes + penguin + arrows; section gelap grid 24px subtil; kartu taktil (border ink + offset shadow); CTA primer selalu obvious. Motion: loops ambient jalan; reveal+stagger; drag notes desktop; pin HowItWorks desktop; tanpa layout shift; reduced-motion mematikan semua dekorasi (Lenis otomatis, sisanya gate manual). UX: CTA ganda tidak berebut (primer > sekunder); anchor dari `/course` mendarat benar; menu mobile; form newsletter tetap fungsi; footer disembunyikan di `/course/:uid` (perilaku lama). Teknis: `npm run build` + `lint` hijau; nol `dark:` tersisa; nol Lottie di landing baru; nol import Poppins/next-themes.

---

## §16. Pertanyaan review (jawab per nomor)

1. Hook hero: A / B / C / usulanmu?
2. Urutan section §8 OK, atau Stack–Mentors ditukar?
3. Pin GSAP di HowItWorks (usulanku) atau di Hero?
4. Testimoni sampel + gallery empty-state boleh tampil sementara?
5. Pemetaan footer link mati (detail di plan Task 9) disetujui?
6. Cursor-doodle hero: pertahankan versi terbatas, atau buang sekalian?
