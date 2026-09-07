# DOSCOM University — Playful Landing Redesign (Spec)

> Status: **DRAFT Revisi 1 — menunggu review & revisi kamu sebelum eksekusi.**
> Cara review: baca §16 (pertanyaan review), tulis revisi per nomor bagian (§1–§15).
> Pendamping: `frontend/src/docs/design/design.md` + `canvas-design-tokens.json` (referensi visual, bukan source of truth untuk konten).
> Riwayat: draf awal 2026-09-06 → Revisi 1 2026-09-06 (konten statis penuh, anti-slop, budget ikon).

Tanggal: 2026-09-06 · Approach: **A — Token-first, bertahap** · Scope: **global (seluruh aplikasi)**

---

## §1. Keputusan terkunci (hasil grill + revisi)

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
| 11 | **(Revisi 1) Konten landing statis penuh** — "statis" artinya DATA (tanpa fetch API/hook/react-query di layer landing); motion/interaksi tetap jalan. Alasan: deterministik, tahan后端 mati, cepat, dan anti skeleton-loading yang murahan |
| 12 | **(Revisi 1) Anti AI-slop** — daftar larangan konkret copy + desain (§9); ditegakkan otomatis via gate `rg` (plan T21) |
| 13 | **(Revisi 1) Ikon secukupnya** — budget ikon per section (§9); ikon hanya bila fungsional (navigasi, rating, identitas teknologi, kontak). `CursorDoodle` **dihapus total** (gimmick), sticky notes hero **tanpa ikon**, `MentorCard` **tanpa ikon** |
| 14 | **(Revisi 2) Pengganti whiteboard = Terminal interaktif** — jendela terminal statis (perintah preset yang bisa diklik/diketik + efek stagger) di slot Product Preview antara Course dan HowItWorks; suara lowercase kering, nol ikon |
| 15 | **(Revisi 3) Paket maksimal**: splash preloader + hero playground + ilustrasi penuh + galeri horizontal + cerita bercabang. Magnetik/tilt, kapsul, PR sim, dinding, slider, bedah kode, peta, FAQ, tap sprint, 404/favicon masuk backlog |

---

## §2. Goal & non-goal

**Goal (satu kalimat):** Mengganti fondasi design token menjadi sistem playful ala Canvas (kertas, tinta, electric blue, pastel, grid navy) dan membangun ulang landing page sebagai SPA satu halaman yang **statis, hidup, dan interaktif** tanpa merusak dashboard yang sudah berjalan.

**Non-goal (tegas di luar scope):**
- Membuat halaman baru (`/community`, `/about`, `/pricing`, `/blog`, dll. yang link-nya mati hari ini) — link mati dipetakan ulang ke rute/anchor yang ada (§8, §13).
- Mengubah skema API/backend, auth flow, atau logika bisnis dashboard.
- Menghapus Lottie dari dashboard/auth (tetap dipakai di sana; larangan Lottie hanya untuk dekorasi landing baru).
- Menambah test runner baru (repo tidak punya; verifikasi = `tsc` + `eslint` + `vite build` + QA visual).
- **(Revisi 1)** Menghubungkan landing ke API — landing tidak import apa pun dari `@/hooks` atau `@/services`. Data kursus/mentor/testimoni/galeri/kontak hidup di `lib/landing/*.ts`.

---

## §3. Scope rute & file

**Struktur dibangun ulang:** `/` (Home + 9 section baru), Navbar + Footer (dipakai juga oleh `/course`).
**Hanya ikut token (tanpa perubahan struktur):** `/course`, `/course/:uid`, semua `/auth/*`, seluruh dashboard student/mentor/admin, `/profile`.
**Disentuh untuk migrasi:** `index.css`, `ui/sonner.tsx` (cabut next-themes), 19 file bervarian `dark:` (strip saja), `index.html` (lang/judul/meta).
**(Revisi 1) Dihapus karena tak terpakai lagi:** `hooks/landing/use-featured-courses.ts`, `hooks/landing/use-landing-community-stats.ts` (landing baru statis; diverifikasi tak diimport tempat lain sebelum hapus).

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
`StickyNote` (draggable opsional, ikon opsional — hero tanpa ikon), `HandUnderline` (SVG + prop `draw` untuk path-draw on scroll), `DoodleArrow` (3 varian path), `SectionHeader` (eyebrow+title+copy), `Reveal` (motion whileInView + stagger), `PenguinMascot` (SVG geometris + stroke ink), `TickerTape` (marquee CSS, konten diduplikasi + aria-hidden), `DoodleDivider` (squiggle antar-section), `Stickers` (set doodle resmi: Star/Sparkle/Squiggle/CircleScribble/Tape/Pin + varian twinkle), `Footprints` (jejak pinguin SVG), `SplashScreen` (overlay ≤1s, sekali per sesi), `MentorCard` (tanpa ikon — avatar inisial + teks), `StaticCourseCard` (cover pastel + numeral display, tanpa gambar), section: `Hero` (playground: parallax + drag + draw + easter egg), `StackSection`, `MentorsSection`, `CourseSection`, `TerminalSection` (pengganti whiteboard — terminal statis interaktif), `StorySection` (cerita bercabang 9 node, 3 ending), `HowItWorksSection`, `GallerySection` (grid now, horizontal-scroll saat foto ada), `TestimonialSection`, `FinalCTASection` (gabung Get in Touch).
**Data statis (`lib/landing/`):** `copy.ts` (seluruh copy landing — satu sumber, termasuk item ticker), `stack.ts`, `mentors.ts` (array statis + helper inisial), `courses.ts` (array statis + tipe), `terminal.ts` (peta perintah + output), `story.ts` (9 node + 3 ending), `gallery.ts`, `contact.ts`, `testimonial.ts`.
**Provider:** `providers/motion-provider.tsx` (`ReactLenis root` + sync ScrollTrigger + `ScrollManager` reset per route + hash scroll).
**Dirombak:** `pages/landing/Home.tsx` (tanpa hook), `components/shared/Navbar.tsx`, `components/shared/Footer.tsx`, `components/ui/button.tsx` (varian playful), `index.css`, `index.html`.
**Reuse tanpa ubah:** `navLinks` (ditambah anchor), `socialLinks` (dipindah ke `contact.ts`), logika subscribe Footer, auth dropdown Navbar. (`CardCourse`, `useFeaturedCourses`, `useLandingCommunityStats` **tidak dipakai** landing baru — dua hook dihapus.)
**Dihapus dari rencana (Revisi 1):** `CursorDoodle` — gimmick follower menambah noise tanpa fungsi; playfulness sudah dibawa notes/drag/doodle/pin.

---

## §8. Susunan section & ritme

Splash overlay (sekali per sesi, ≤1s, skippable) → Navbar (paper, fixed, 88px) → **Hero** (paper, playground: parallax + drag + draw + easter egg) → **TickerTape** (marquee) → **Our Stack** (dark navy grid) → **Our Mentors** (paper, statis) → **Footprints** → **Course** (panel tipis, statis) → **Terminal** (paper, interaktif — pengganti whiteboard) → **Story** (panel, naratif interaktif) → **How It Works** (dark, pin desktop) → **Gallery** (paper; grid now, horizontal-scroll saat foto ada) → **Testimonial** (dark + kartu paper) → **Final CTA + Get in Touch** (paper, digabung agar tidak ada dua CTA kertas berurutan) → Footer (ink-800, newsletter dipertahankan). Grain overlay menutupi seluruh landing (statis, 6%).

Pemetaan konten: Stack = React 19, TypeScript, Tailwind CSS, Go (Gin), PostgreSQL, MinIO, Docker (faktual dari repo). Mentors = array statis (`mentors.ts`; sampel bertanda, gate §14). Course = array statis (`courses.ts`; 3 kartu + link `/course` ke katalog dinamis). Terminal = perintah preset + output statis (`terminal.ts`; detail §9.4). Story = 9 node bercabang, 3 ending ke `/#kursus` (`story.ts`; detail §9.5). HowItWorks = 01 Gabung & daftar → 02 Sprint belajar bareng mentor → 03 Kontribusi OSS & portofolio. Splash = wordmark + bar doodle + "menyiapkan kertas dan tinta…" (teks kecil, bukan janji fitur). Gallery = bingkai doodle + empty state "dokumentasi segera hadir" (tanpa picsum — picsum mati bersama section lama). Testimonial = 1 kutipan sampel (launch gate §14). Get in Touch = kartu kontak dari `contact.ts` (nilai awal = `socialLinks` existing apa adanya).

Nav anchor: `#stack #mentor #kursus #galeri #kontak` (format `/#stack` agar work dari `/course`), plus link `Course /course`, CTA Daftar/Masuk. Scroll hash ditangani `ScrollManager`.

---

## §9. Arah copy + anti-slop + budget ikon (draf — pilih/sunting saat review)

Bahasa Indonesia, dwi-audiens, hierarki CTA: primer **Gabung Komunitas** (`/auth/register`), sekunder **Jelajahi Kursus** (`/course`).

### 9.1 Aturan anti-slop copy (mengikat, gate otomatis plan T21)

- Angka hanya bila terverifikasi (tidak ada angka klaim di landing statis — tidak ada stats hook).
- Kata benda konkret (sprint, code review, repo, sertifikat, Udinus). Larangan frasa generik — daftar pasti (case-insensitive): `jelajahi dunia`, `unlock`, `cutting-edge`, `revolution`, `delve`, `vibrant`, `seamless`, `elevate`, `supercharge`, `gateway`, `game-changer`, `Lorem`, `cutting edge`, `dunia digital tanpa batas`, `membuka potensi`.
- Tanpa emoji di copy. Tanpa testimoni/nama/angka palsu yang tidak bertanda SAMPEL.
- Satu suara: akrab kampus, kalimat pendek, tanpa jargon startup.

Draf hook hero (pilih satu):
- **A.** Eyebrow: `KOMUNITAS OPEN SOURCE UDINUS` · H1: "Ngoding sendirian itu sepi." · Sub: "Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source."
- **B.** H1: "Teori dari kampus. Pengalaman dari sini." · Sub: sama pola A.
- **C.** H1: "Belajar IT yang pulangnya bawa portofolio." · Sub: sama pola A.

Sticky notes hero (tanpa ikon): "Proyek OSS Nyata", "Mentor Praktisi", "Sprint & Code Review", "Sertifikat", "Komunitas Udinus".

### 9.2 Aturan anti-slop desain (mengikat)

- Tanpa gradient dekoratif (satu-satunya gradient = grid 24px subtil). Tanpa gambar stok/eksternal di landing baru (nol `picsum`, nol `unsplash`).
- Pastel deterministik per index (array tetap, bukan random render). Maksimal satu keluarga doodle per viewport (arrow + underline + tape = satu bahasa, bukan tiga gaya).
- Skeleton loading **dilarang** di landing (konten statis = langsung render). Empty state hanya untuk galeri (konten foto memang belum ada).
- Maskot muncul tepat sekali (hero). Testimoni satu kartu, bukan carousel.

### 9.3 Budget ikon (maksimal, mengikat — semua ikon lucide, stroke ink, tanpa gradient)

| Section | Ikon | Fungsi |
|---|---|---|
| Navbar | Menu, ChevronDown, + ikon akun existing | navigasi (existing, dipertahankan) |
| Hero | 1 ArrowRight di CTA primer | arah aksi |
| Stack | 7 chip teknologi | identitas teknologi (ini kontennya) |
| Mentors | 0 | inisial avatar + teks cukup |
| Course | 1 ArrowRight "Lihat semua" | arah aksi |
| Terminal | 0 | titik header = lingkaran CSS, sisanya teks |
| Story | 1 ArrowRight ending | arah aksi |
| HowItWorks | 0 | numeral display cukup |
| Gallery empty | 1 ImagePlus | ilustrasi empty state |
| Testimonial | 5 Star | rating (fungsional) |
| FinalCTA | 1 ArrowRight + 5 glyph kontak | aksi + rekognisi sosial |
| Footer | socials existing | rekognisi (existing) |
| **Total baru** | **±22, semua fungsional** | **nol ikon dekoratif** |

### 9.4 Terminal: suara + perintah (draf)

Suara terminal: lowercase, kering, akrab — beda dari copy marketing (disengaja: ini "mesin", bukan brosur). Perintah preset (klik chip atau ketik + Enter, riwayat dengan ArrowUp/Down):

| Perintah | Respons |
|---|---|
| `help` | daftar perintah + deskripsi satu baris |
| `whoami` | "calon kontributor open source. status: belum merge PR pertama." |
| `join` | 3 langkah gabung + tombol "Daftar sekarang" → `/auth/register` |
| `sprint` | "belajar → build → review → launch." + satu baris mentor/review |
| `stack` | "react 19 · typescript · tailwind · go + gin · postgresql · minio · docker" |
| tak dikenal | "'x': perintah tidak dikenal. coba 'help'." |
| `sudo ...` | "kamu belum jadi maintainer. ikut sprint dulu." |

Boot (sekali saat masuk viewport): "doscomOS v2.0 — terminal komunitas." + "ketik 'help' atau klik perintah di bawah." Output `role="log"` + `aria-live="polite"`; area output tinggi tetap + scroll internal + auto-scroll ke bawah.

### 9.5 Cerita bercabang: struktur + suara (naskah lengkap di plan)

"Hari Pertamamu di DOSCOM" — mini visual-novel orang kedua, present tense, konkret (nama tempat, benda, rasa). 9 node: `mulai → {kumpul, laptop} → {repo, tanya, sprint} → {ending-oss, ending-jelajah, ending-web}`. Node tengah (repo/tanya/sprint) memakai satu ketukan "Lanjutkan →" yang jujur (transisi beat, bukan pilihan palsu). Setiap ending: judul + 2 kalimat + CTA ke `/#kursus` ("Lihat jalur kontribusi" / "Lihat jalur web" / "Lihat semua kursus") + tombol "Ulangi cerita" + recap pilihan sebagai chips. Suara sama dengan copy utama (akrab kampus, tanpa jargon startup); satu-satunya fiksi yang diizinkan adalah bingkai "hari pertama" — semua janji (sprint, review, repo) faktual.

### 9.6 Splash + ticker (copy)

Splash: wordmark "DOSCOM" (DynaPuff) + bar doodle + teks kecil "menyiapkan kertas dan tinta…". Ticker (sumber `copy.ts`, dipisah `✦`): open source · sprint · code review · mentoring · portofolio · komunitas udinus · ngoding bareng.

---

## §10. Arsitektur motion (versi terverifikasi Context7, Sept 2026)

| Lapisan | Pemilik | Dipakai untuk |
|---|---|---|
| CSS keyframes | — | float/wiggle/drift/bob, transisi hover/tap |
| `motion@13.2.0` (`import from "motion/react"`) | interaksi komponen | `Reveal` (whileInView+stagger), sticky-note **drag** (`drag`, `dragConstraints`, `dragElastic`), hover/tap fisik, mobile menu, `useReducedMotion` gate |
| `gsap@3.15.0` + `@gsap/react@2.1.2` | showpiece selektif | **satu** pin desktop (HowItWorks ≥1024px); selalu via `useGSAP({scope})`, `gsap.registerPlugin(ScrollTrigger)` |
| `lenis@1.3.26` (`lenis/react`, `<ReactLenis root>`) | smooth scroll | lerp default; `respectReducedMotion` default true (jangan dioverride); sinkron `lenis.on('scroll', ScrollTrigger.update)`; `ScrollTrigger.refresh()` setelah `document.fonts.ready` + tiap ganti route; **dilarang** ScrollSmoother (konflik) |
| CSS `marquee` + `twinkle` | ambient | ticker (translateX −50%, 22s linear, pause on hover, konten diduplikasi + aria-hidden); twinkle bintang (opacity, 2–3s) |
| `motion` `pathLength` | draw | underline/headline/divider ke-draw sekali via `whileInView` (0.9s); fallback statis saat reduced-motion |
| `motion` values + spring | parallax hero | dekor 2 lapis ikut mouse (±20px/±12px, stiffness 60); hanya `pointer:fine`, mati saat reduced-motion/touch |
| React state + `AnimatePresence` | splash/easter/story | splash ≤1s + klik-skip + sekali per sesi (`sessionStorage`) + absen total saat reduced-motion; easter egg klik-5x → spin + bubble `role="status"`; story = state machine node + recap |

Batasan keras: hanya properti `transform`/`opacity` yang dianimasikan; efek terminal = stagger per baris (120ms, instan saat reduced-motion), bukan per karakter; pin hanya desktop (HowItWorks + Galeri, koordinasi refresh sudah di provider); splash tidak boleh menunda konten (render di bawah overlay, dismiss on load atau 1200ms); parallax/easter kosong saat reduced-motion; grain statis (bukan animasi) sehingga selalu aman; drag notes jadi float statis di touch/reduced-motion; konten tidak boleh bergantung pada animasi (konten langsung visible — apalagi kini statis, tanpa skeleton).

---

## §11. Responsif

≥1024: penuh (3 kolom grid, pin aktif, notes lengkap). 768–1023: 2 kolom, pin mati, notes dikurangi. <768: 1 kolom, nav hamburger (logika existing), CTA stack, notes max 2 + kecil, gallery horizontal scroll snap, heading DynaPuff mengecil via clamp. Dekorasi tidak boleh menutupi teks/CTA di layar 360px.

---

## §12. Deviasi sadar dari design.md

1. Lottie tetap untuk loader/empty-state/payment/auth lama (cabut total = risiko tanpa nilai).
2. Mono tetap JetBrains Mono; `--radius` tetap `1rem` (stabilitas shadcn).
3. Section Templates → Course statis (DOSCOM bukan whiteboard tool); Product Preview → tidak ada (diganti HowItWorks pin + Gallery).
4. Copy Indonesia + section pesanan user (Stack/Mentors/Gallery/GetInTouch).
5. Footer newsletter + footerLinks dipertahankan (href mati dipetakan ulang, halaman baru tidak dibuat).
6. Cursor follower tidak diimplementasikan (gimmick melanggar budget ikon).
7. **(Revisi 1)** Landing statis penuh — design.md berasumsi konten dinamis; di sini determinisme + kecepatan + anti-slop lebih penting.

---

## §13. Migrasi global (ringkas; detail di plan)

Re-point semantik (§4.1) otomatis mengubah dashboard — itu **tujuan**, bukan efek samping. Strip `dark:` (19 file), `sonner.tsx` hardcode `theme="light"`, `npm remove next-themes`. Hardcoded `slate-*` (mis. CardMentor) tidak tersentuh token — dibiarkan kecuali kontras jebol (regression pass). `/course` ikut token tanpa refactor struktur. **(Revisi 1)** Hapus `use-featured-courses.ts` + `use-landing-community-stats.ts` setelah verifikasi tak diimport (landing baru statis).

---

## §14. Utang konten milikmu (launch gate — bukan placeholder kode)

1. URL sosial asli + email kontak (`contact.ts` berangkat dari nilai existing, termasuk `mailto: ` kosong).
2. Foto galeri (`public/gallery/` + `gallery.ts`).
3. Kutipan testimoni asli (ganti 1 sampel).
4. Pilih hook A/B/C (§9) + konfirmasi list stack (§8).
5. Putuskan pemetaan footer link mati (usulan di plan).
6. **(Revisi 1)** Daftar mentor asli (nama + peran, ganti 4 sampel di `mentors.ts`) + daftar kursus unggulan asli (judul + deskripsi + level, ganti 3 sampel di `courses.ts`). Kirim sebagai teks biasa — penggantian 5 menit karena terisolasi di data file.

---

## §15. Acceptance checklist

Visual: nav paper + active blue; hero DynaPuff dominan + 5 notes tanpa ikon + penguin sekali + arrows; section gelap grid 24px subtil; kartu taktil (border ink + offset shadow); CTA primer selalu obvious; nol gambar eksternal; pastel deterministik.
Motion: loops ambient jalan; reveal+stagger; drag notes desktop; pin HowItWorks desktop; tanpa layout shift; reduced-motion mematikan semua dekorasi (Lenis otomatis, sisanya gate manual).
UX: CTA ganda tidak berebut (primer > sekunder); anchor dari `/course` mendarat benar; menu mobile; form newsletter tetap fungsi; footer disembunyikan di `/course/:uid` (perilaku lama); tanpa skeleton di landing; empty state hanya galeri; terminal: chips menjalankan perintah, perintah tak dikenal + `sudo` punya respons, boot sekali, `aria-live` polite, riwayat panah jalan; splash ≤1s + skippable + absen saat reduced-motion + sekali per sesi; marquee duplikat aria-hidden + pause on hover; horizontal hanya desktop + ada foto + reduced-motion mati; story: semua ending tercapai dari start, restart + recap jalan; easter egg: 5 klik → spin + bubble, bisa diulang.
Teknis: `npm run build` + `lint` hijau; nol `dark:` tersisa; nol Lottie di landing baru; nol import Poppins/next-themes; **nol import `@/hooks`/`@/services` di layer landing**; gate frasa generik bersih; budget ikon dipatuhi.

---

## §16. Pertanyaan review (jawab per nomor)

1. Hook hero: A / B / C / usulanmu?
2. Urutan section §8 OK, atau Stack–Mentors ditukar?
3. Pin GSAP di HowItWorks (usulanku) atau di Hero?
4. Testimoni sampel + gallery empty-state boleh tampil sementara?
5. Pemetaan footer link mati (detail di plan Task 9) disetujui?
6. Penghapusan CursorDoodle + ikon di notes/MentorCard disetujui? (Budget §9.3.)
7. Daftar mentor + kursus asli: kirim sekarang (langsung masuk dokumen) atau tetap sampel bertanda + launch gate?
8. Setuju daftar perintah + output terminal (§9.4)?
9. Setuju paket maksimal + naskah cerita (lengkap di plan)? Yang tak dipilih resmi jadi backlog.
