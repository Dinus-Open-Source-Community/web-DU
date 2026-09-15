# Addendum Spec: Input neo khusus auth (bahasa landing)

- Tanggal: 2026-09-15
- Induk: `2026-09-15-neo-variant-scope-design.md` (opsi A, sudah diimplementasi + hijau TDD)
- Status: Draft, menunggu review user
- Scope: `frontend/` saja. Backend & compose tidak tersentuh.

## 1. Latar & keputusan yang diubah

- Tombol auth **sudah** berbahasa landing (`variant="neobrutalism"` di semua
  tombol submit + pin Navbar/OauthButton). Yang tertinggal: **input auth masih
  soft** (`authInputClassName`: `rounded-xl border-input bg-card shadow-none`).
- Atas permintaan user, freeze visual auth **dicabut sebagian**: input (dan
  tombol OAuth, §4.4) auth sengaja diubah mengikuti bahasa landing.
  Freeze landing (`/`, `/course*` di luar file yang disebut §4) tetap berlaku.
- Rekomendasi penulis (minta persetujuan review): `OauthButton` ikut di-neo-kan
  (§4.4). Alternatif yang ditolak: biarkan soft — meninggalkan dua bahasa tombol
  di satu halaman, bertentangan dengan goal addendum ini.

## 2. Fakta kode (hasil audit)

- `components/ui/input.tsx`: fungsi biasa, kelas inline, **bukan cva**.
- `components/shared/Input.tsx` (`GlobalInput`): dipakai **hanya** oleh 4 halaman
  auth (Login ×2, Register ×4, ForgotPass ×1, ResetPass ×2 = 9 pemakaian).
  Punya lapisan className sendiri
  (`rounded-xl border-input bg-card py-3 text-sm ...` + `pr-10` bila rightIcon)
  yang akan menetralkan variant neo bila tidak dibuat variant-aware (§4.2).
- Halaman auth mengoper `className={authInputClassName}` (plus ` pr-12` di field
  password). `authInputClassName` tidak dipakai di luar auth.
- `AuthPasswordToggleButton`: tombol soft standalone, file khusus auth.
- `PasswordStrengthIndicator`: segmen berwarna netral — tidak perlu diubah.
- `input-group.tsx`/`search.tsx`: gaya input sendiri — tidak tersentuh.

## 3. Spesifikasi perubahan

### 3.1 `components/ui/input.tsx` — ekstrak cva + variant `auth`

- Bentuk baru: `inputVariants = cva(base, { variants: { variant: { default, auth } } })`,
  diekspor bersama `Input` (yang meneruskan prop `variant`, default `"default"`).
- `base`: hanya struktural — layout (`h-9 w-full min-w-0 px-3 py-1 text-base`),
  `file:*`, `disabled:*`, `outline-none`, `aria-invalid:*` (error merah berlaku
  untuk kedua variant), `md:text-sm`.
- `variant.default`: **verbatim** isi kelas warna/border/shadow/hover/focus/
  placeholder/radius dari literal sekarang (`border border-input bg-card ...
  rounded-xl ... hover:border-line-medium focus-visible:border-ring
  focus-visible:ring-ring/30 ... placeholder:text-muted-foreground`). Nol dampak
  ke konsumen lama.
- `variant.auth` (neo): `rounded-xl border-2 border-ink-900 bg-paper-white
  text-foreground shadow-button transition-all placeholder:text-muted-foreground
  hover:shadow-button-pressed focus:border-ink-900 focus:shadow-button focus:ring-4
  focus:ring-brand-blue/50`.
  Disengaja: tanpa efek translate dan tanpa collapse `active:shadow-none` (input
  bukan tombol); radius tetap `rounded-xl` (kontinuitas auth), teks tetap
  `foreground` (keterbacaan). Focus memakai `focus:` (bukan `focus-visible:`)
  agar selalu menyala termasuk saat klik mouse; `focus:shadow-button` mengalahkan
  shadow hover-pressed (urutan variant Tailwind); ring biru `ring-4` memberi
  outline yang jelas. Revisi atas keluhan focus terlihat seperti hover/pressed
  terus.

### 3.2 `components/shared/Input.tsx` — prop `variant` variant-aware

- `GlobalInputProps` tambah `variant?: 'default' | 'auth'` (default `'default'`,
  diteruskan ke ui `Input`).
- Lapisan className dalam dibuat variant-aware: `default` = literal sekarang
  verbatim; `auth` = `w-full rounded-xl py-3 text-sm text-foreground
  placeholder:text-muted-foreground` (+ `pr-10` bila rightIcon) — tanpa warna
  border/bg agar tidak melawan variant neo. Label tidak diubah.

### 3.3 Halaman auth — pakai `variant="auth"`, pensiunkan `authInputClassName`

- `Login.tsx`, `Register.tsx`, `ForgotPass.tsx`, `ResetPass.tsx`: setiap
  `GlobalInput` ganti `className={authInputClassName}` → `variant="auth"`;
  tambahan ` pr-12` di field password dipertahankan.
- Hapus import `authInputClassName` di 4 file + hapus ekspornya dari
  `components/auth/constants.ts` (`authSubmitButtonClassName` tetap).

### 3.4 `components/shared/OauthButton.tsx` — ikut neo (butuh ACC review)

- Kedua tombol: `variant="outline"` → `variant="neobrutalism"`, className menjadi
  `h-12 rounded-[10px] border-2 bg-paper-white px-5 font-extrabold
  hover:bg-paper-paper active:translate-y-[3px]` (ikon `size-5` tetap).
  Hasil: sejajar dengan tombol Login Navbar. Pin hover trio sebelumnya dilepas
  karena sudah tercakup variant.

### 3.5 `components/auth/AuthPasswordToggleButton.tsx` — tetap soft (keputusan user)

- Dibatalkan dari rencana neo: ikon mata kembali persis ke versi soft semula
  (tanpa border). Guard T17 dikunci ke versi soft. Alasan: permintaan eksplisit
  user pasca-implementasi.

## 4. Acceptance criteria (TDD, ekstensi `tests/neo-scope.test.mjs`)

1. T12: `variant.default` input memuat token soft kini (`border-input`,
   `bg-card`) dan bebas `ink-900`/`shadow-button`.
2. T13: `variant.auth` memuat `border-ink-900`, `bg-paper-white`,
   `shadow-button`; tanpa `translate`.
3. T14: pemakai `variant="auth"` di seluruh `src` ⊆ {4 halaman auth,
   definisi `GlobalInput`/`inputVariants`}.
4. T15: tidak ada lagi import `authInputClassName` di mana pun.
5. T16: `OauthButton` memakai `variant="neobrutalism"` + `bg-paper-white`.
6. T17: toggle password kembali soft tanpa border (keputusan user §3.5).
7. T18: `variant.auth` fokus jelas — `focus:shadow-button` +
   `focus:ring-4 focus:ring-brand-blue/50`, tanpa `focus-visible` saja dan
   tanpa `active:shadow-none`.
8. Regresi: seluruh test lama (T1–T11) tetap hijau; `tsc -b` + `eslint` bersih;
   smoke `200` untuk `/auth/login`, `/auth/register`, `/`, dan 1 dashboard.

## 5. Risiko & batasan

- Visual auth **berubah dengan sengaja** — bukan bug. Verifikasi visual auth
  adalah eyeball (tidak ada baseline screenshot).
- Kartu course (`CardCourse` dkk.) tetap pada keputusan spec induk (resting
  identik, hover-lift ikut revert) — tidak dibuka kembali di addendum ini.
