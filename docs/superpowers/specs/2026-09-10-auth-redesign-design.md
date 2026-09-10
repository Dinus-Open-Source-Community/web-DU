# Auth Redesign — Pinguin Hidup (Neobrutal Playful-Paper)

Tanggal: 2026-09-10
Status: Approved (3/3 sections) — menunggu review spec tertulis
Scope: `frontend/src/pages/auth/*` (Login, Register, ForgotPass, ResetPass, Oauth) via komponen shared
Pendekatan terpilih: A — Pinguin Hidup (opsi B Adegan Kertas & C Minimal ditolak user)

## 1. Tujuan

Redesign halaman auth mengikuti tema web saat ini (playful-paper neobrutalism:
kertas, border ink-900 2px, hard shadow, aksen note-yellow, font-display) dan
mengganti slot Lottie yang dihapus dengan animasi SVG tangan (skill
svg-animations, tanpa library/dep baru).

Non-tujuan: mengubah alur auth, validasi, copy, routing, provider, atau API.

## 2. Section 1 — Panel kiri (approved)

- Gradient biru (`#075e9c → #0a84dc → #3aa0e8`) diganti permukaan kertas
  (`bg-paper-white` / `bg-paper-panel`).
- Slot Lottie diisi kartu pinguin: `border-2 border-ink-900`,
  `rounded-[10px]`, `shadow-paper`, badge `note-yellow`.
- Pinguin = `PenguinMascot` (inline SVG, viewBox 200×230) yang dianimasikan:
  kedip (SMIL `animate` pada pupil), bob (kelas `animate-bob` existing),
  flipper melambai (SMIL `animateTransform rotate`), blush pulse,
  bubble "Halo!" + doodle melayang (pesawat kertas, sparkle — CSS float).
- Heading/subheading AuthLayout menjadi teks ink di bawah kartu (bukan putih).
- Mobile: pola kartu kecil di atas form dipertahankan; animasi tetap jalan
  (SMIL murah).
- Semua animasi mati saat `prefers-reduced-motion` (CSS + `motion-reduce`).

## 3. Section 2 — Form kanan (approved)

- `AuthFormPanel` menjadi kartu kertas neobrutal
  (`border-2 border-ink-900`, `rounded`, `shadow-paper`).
- `authInputClassName` naik ke `border-2 border-ink-900` + focus ring brand;
  tinggi & perilaku input tetap.
- Submit tetap `variant="neobrutalism"`; `OauthButton` tetap `outline`;
  link & divider tetap.
- Validasi (Zod), error toast, `resolveSafeRedirectPath`, OAuth flow: TAK tersentuh.

## 4. Section 3 — Teknik & file (approved)

- SMIL dalam SVG (kedip, wave) + keyframes CSS di `index.css` (float doodle).
- Aksesibilitas: `role="img"` + `<title>`/`<desc>` pada SVG scene.
- File baru: `frontend/src/components/auth/AuthPenguinScene.tsx`
  (kartu + pinguin animasi + doodle + bubble).
- Diubah: `components/layouts/AuthLayouts.tsx` (panel kiri),
  `components/auth/AuthFormPanel.tsx`, `components/auth/constants.ts`
  (`authInputClassName`), minor `AuthPageHeader.tsx` / `AuthDivider.tsx`.
- TIDAK disentuh: `pages/auth/*` logic, `lib/validator/*`, `providers/*`,
  `lib/routes.ts`, copy Bahasa Indonesia.

## 5. Acceptance

- `npx tsc -b` exit 0; `npx vite build` exit 0.
- Cek visual 5 halaman auth (desktop + mobile) + mode reduced-motion.
- Tidak ada referensi Lottie/dotlottie baru; tidak ada dep baru.

## 6. Self-review

- Placeholder: tidak ada (semua section konkret).
- Konsistensi: panel kertas + form kartu + tombol neobrutalism selaras dengan
  keputusan sebelumnya (press-effect hanya di button; scene SVG dekoratif,
  bukan kontrol).
- Scope: satu surface (auth) — layak satu plan implementasi.
- Ambiguitas: bubble "Halo!" — teks final Bahasa Indonesia, non-faktual,
  aman sebagai copy dekoratif maskot.
