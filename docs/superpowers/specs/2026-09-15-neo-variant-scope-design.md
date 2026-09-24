# Design Spec: Neobrutalism jadi variant baru, sisanya revert ke default

- Tanggal: 2026-09-15
- Status: Disetujui user (opsi A), menunggu review spec
- Scope: `frontend/` saja. Backend & `docker-compose` tidak tersentuh.

## 1. Konteks & temuan investigasi

- Neobrutalism masuk lewat commit `4756cd0 feat(ui): tactile playful button variants`.
  File yang diubah commit itu: **hanya `frontend/src/components/ui/button.tsx`**
  (base: `border`→`border-2`, `font-medium`→`font-extrabold`,
  `rounded-4xl`→`rounded-[10px]`, tambah `active:translate-y-[3px]`;
  variant `default`/`outline`/`secondary`/`neobrutalism` memakai
  `border-ink-900` + `shadow-button`). Bukti: `git show 4756cd0^:.../button.tsx`
  vs versi sekarang, dan `git diff 4756cd0^ HEAD -- frontend/src/components/ui/`
  = 1 file, 4 baris.
- 31 komponen lain di `components/ui/` (input, card, dialog, badge, select,
  tabs, table, sheet, dsb.) tidak pernah diubah — masih default shadcn
  `radix-luma`. Tidak ada revert yang diperlukan untuk file-file itu.
- Token CSS (`--color-ink-900`, `--color-paper-*`, `--shadow-button*`,
  `--font-display` DynaPuff) dipakai landing/auth/Navbar/Footer — **dipertahankan**.
- Dashboard (`pages/admin|mentor|student`) tidak mengandung token neo dan tidak
  import dari `components/ui`, kecuali tidak langsung via `Sidebar`/`combobox`/
  `pagination` yang memakai `Button` secara internal. Dashboard otomatis kembali
  ke tampilan lama begitu `button.tsx` di-revert.
- Area freeze memakai `Button` dengan variant neo secara eksplisit:
  `Hero.tsx` (CTA primer `neobrutalism`, CTA sekunder `outline`),
  `Login/Register/ForgotPass/ResetPass` (tombol submit `neobrutalism` +
  `authSubmitButtonClassName`), `OauthButton` (`outline` ×2),
  `Navbar.tsx` (`outline` ×2 + `default` ×2).
- `components/shared` lain yang memakai `Button outline/default`
  (Error, DynamicField, dialog-dialog admin, tiptap, CardCourse, CardMentor, dsb.)
  melayani area dashboard/editor — ikut revert (kembali ke gaya lama), kecuali
  yang terbukti render di area freeze (lihat §4).

## 2. Goal & non-goal

- Goal: landing (`/`, `/course*`) dan auth (`/auth/*`) pixel-identical (tetap neo);
  dashboard dan seluruh permukaan lain kembali ke gaya default pra-neo;
  gaya neo tetap tersedia sebagai variant eksplisit.
- Non-goal: menambah variant neo ke input/card/komponen lain; mengubah token CSS;
  mengubah backend; mengubah rute/layout.

## 3. Keputusan desain (opsi A — disetujui)

Revert-in-place + pin variant eksplisit. Opsi B (komponen `NeoButton` terpisah)
ditolak karena mengubah belasan file di area freeze. Opsi C (scoping tema
per-area) ditolak karena over-engineering untuk masalah 1 file.

## 4. Spesifikasi perubahan

### 4.1 `frontend/src/components/ui/button.tsx` (satu-satunya edit gaya)

- Base `cva` dikembalikan persis ke versi `4756cd0^`: `rounded-4xl`,
  `border` (bukan `border-2`), `font-medium`,
  `active:not-aria-[haspopup]:translate-y-px` (bukan `active:translate-y-[3px]`).
- `variant.default`, `variant.outline`, `variant.secondary` dikembalikan persis
  ke definisi `4756cd0^` (soft shadcn, tanpa token `ink-900`/`shadow-button`).
- `variant.neobrutalism` **tidak diubah** (gaya neo tombol primer: `bg-primary`,
  `text-ink-900`, `border-ink-900`, `shadow-button`, efek tekan).
- `variant.ghost/destructive/link` dan seluruh `size.*` **tidak diubah**.
- Hasil akhir: 6 variant default + 1 variant neo. Diff berbanding HEAD ≈ 8 baris.

### 4.2 Pin eksplisit di area freeze (edit props, nol perubahan visual)

Setiap pemakaian di bawah dipin ke visual neo yang identik dengan tampilan kini:

- `components/landing/Hero.tsx` CTA sekunder: `variant="outline"` →
  `variant="neobrutalism"` + tambah `bg-paper-white hover:bg-paper-paper` di
  `className` (tailwind-merge menimpa `bg-primary`; sisa properti neo identik:
  border, shadow, efek tekan).
- `components/shared/Navbar.tsx` (4 tombol Masuk/Daftar desktop+mobile):
  pin ke `variant="neobrutalism"` dengan override `className` yang
  mempertahankan tampilan kini per tombol (diverifikasi visual).
- `components/shared/OauthButton.tsx` (2 tombol): pin ke visual neo kini.
- `pages/auth/*`: tidak diubah (sudah `variant="neobrutalism"` eksplisit).
- `Hero.tsx` CTA primer: tidak diubah (sudah `variant="neobrutalism"`).
- Aturan umum: pemakaian `Button` di file yang render di rute freeze
  (`/`, `/course*`, `/auth/*`, termasuk `CardCourse`, `CardMentor`,
  `JoinedCourseCard`, `CourseReviewSection` bila tampil di rute tersebut)
  diaudit satu per satu saat implementasi; yang visualnya kini neo dipin
  eksplisit, yang kini sudah default dibiarkan.

### 4.3 Yang tidak diubah

- Seluruh `components/ui/*.tsx` selain `button.tsx`; `index.css` (token);
  `components/playful/*`; `components/landing/*` (selain pin §4.2);
  `components/auth/*`; `layouts/GuestLayouts+AuthLayouts`;
  seluruh `pages/admin|mentor|student` dan komponen dashboard lokal.

## 5. Acceptance criteria

1. `tsc -b` lolos; tidak ada import/variant yang merujuk gaya yang dihapus.
2. Screenshot before/after identik untuk: `/`, `/course`, `/auth/login`,
   `/auth/register` (desktop + mobile).
3. Screenshot dashboard (`/admin/dashboard`, 1 halaman mentor, 1 halaman
   student) menunjukkan button gaya lama (soft, tanpa hard shadow).
4. `grep -rn "ink-900\|shadow-button" pages/admin pages/mentor pages/student
   components/Admin` kosong (kecuali bila ada pin freeze yang disengaja).
5. Tidak ada file backend / compose / env yang berubah.

## 6. Risiko & mitigasi

- Ada pemakaian `outline/default` di shared-component yang ternyata render di
  rute freeze dan terlewat audit → mitigasi: checklist audit per rute freeze
  dengan dev-server + screenshot diff sebelum merge.
- `tailwind-merge` tidak menimpa properti seperti dugaan pada pin Hero →
  mitigasi: verifikasi visual CTA sekunder Hero sebagai item acceptance
  tersendiri; fallback = className literal penuh gaya neo-kini.
