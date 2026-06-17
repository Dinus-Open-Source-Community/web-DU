# Performance Audit Report

Audit performa frontend berdasarkan framework **Performance Budget**, **Critical Rendering Path**, dan **Core Web Vitals**.

**Build reference:** `npm run build` · 17 Juni 2026 · Vite 8 + React 19

---

## Performance Budget

| Resource | Budget | Rationale |
|----------|--------|-----------|
| Total page weight | < 1,5 MB | 3G ~4s load |
| JavaScript (gzip) | < 300 KB | Parse + execute |
| CSS (gzip) | < 100 KB | Render blocking |
| Images above-fold | < 500 KB | LCP |
| Fonts | < 100 KB | FOIT/FOUT |
| Third-party | < 200 KB | Latency |

### Hasil build (chunk terbesar)

| Chunk | Raw | Gzip | Halaman pemicu |
|-------|-----|------|----------------|
| `index-*.js` | 635,6 KB | 137,4 KB | Semua route (entry) |
| `TipTapEditor-*.js` | 542,1 KB | 165,7 KB | Course edit, assignment rich text |
| `CartesianChart-*.js` | 299,3 KB | 91,3 KB | Admin/Mentor dashboard charts |
| `editCourse-*.js` | 135,2 KB | 38,8 KB | Curriculum editor shell |
| `auth-provider-*.js` | 118,7 KB | 40,4 KB | Session + profile resolve |
| `view-*.js` | 74,9 KB | 19,1 KB | Module viewer |
| `index-*.css` | 220,9 KB | 32,5 KB | Global Tailwind + theme |

**Total `dist/assets`:** ~3,8 MB (semua chunk lazy).

**Temuan:** Entry JS uncompressed **2× lipat** praktik ideal; gzip masih dalam kategori "acceptable" untuk SPA modern, tapi parse time di mobile mid-range tetap risiko TBT.

---

## Critical Rendering Path

### Server / TTFB

| Item | Status | Catatan |
|------|--------|---------|
| TTFB < 800 ms | ⚠️ Belum diukur | Bergantung deploy Go backend + CDN |
| Brotli/Gzip | ⚠️ Verifikasi nginx/CDN | Vite emit hash asset — cocok `immutable` |
| HTTP/2+ | ⚠️ Verifikasi infra | — |
| Early Hints (103) | 🔴 Tidak ada | Pertimbangkan preload LCP di edge |

### `index.html`

File saat ini minimal — **tidak ada** preconnect/preload:

```html
<!-- frontend/index.html — tidak ada resource hints -->
<link rel="icon" ... />
<meta name="viewport" ... />
<script type="module" src="/src/main.tsx"></script>
```

**Rekomendasi:**

```html
<link rel="preconnect" href="{VITE_BACKEND_URL}" crossorigin>
<!-- Setelah identifikasi LCP di Home: -->
<link rel="preload" as="image" href="..." fetchpriority="high">
```

### JavaScript loading

| Pola | Status | Lokasi |
|------|--------|--------|
| Route code splitting | ✅ | `App.tsx` — 40+ `React.lazy` |
| TipTap isolated | ✅ | Chunk terpisah ~542 KB |
| Recharts isolated | ✅ | `CartesianChart-*.js` terpisah |
| Main bundle lean | 🔴 | `index-*.js` masih besar |
| Devtools prod | 🟡 | `ReactQueryDevtools` di-import tanpa guard env |
| Lottie split | 🔴 | Warning Vite: static + dynamic import |

**Vite build warning:**

```
@lottiefiles/dotlottie-react dynamically imported by lottie.tsx
but also statically imported by Lottie.tsx
→ chunk tidak ter-split efektif
```

---

## Image Optimization

### Pola saat ini

| Komponen | Strategi | Lazy | Ratio |
|----------|----------|------|-------|
| `CourseCardCover` | `useProtectedFile` + `object-cover` | ✅ `loading="lazy"` default | ✅ 16:9 frame |
| `UserAvatarImage` | `useProtectedFile` per avatar | ✅ | ✅ circle cover |
| List kursus (hooks) | `useProtectedFileMap` batch POST | — | — |
| Profil auth | `useResolveProtectedFiles` single GET avatar | — | — |

### Temuan

1. **Data URL di cache React Query** — `fetchProtectedFileDataUrl` → `data:image/...;base64,...` disimpan 30 menit (`gcTime`). Grid 20 kartu × ~100 KB ≈ 2 MB RAM hanya untuk cover.
2. **Featured Home over-fetch** — `useFeaturedCourses` memanggil `useCourses({ per_page: 100 })` padahal UI menampilkan 3 kartu (`pickTopRatedCourses`).
3. **Potensi double hook** — `CourseCardCover` selalu mount `useProtectedFile`; aman jika parent sudah pass data URL, tapi overhead hook × N kartu tetap ada.
4. **Tidak ada responsive srcset** — satu URL/data URL per cover; OK untuk MVP, kurang optimal bandwidth mobile.
5. **LCP landing** — belum `fetchpriority="high"` pada cover pertama featured course.

### Rekomendasi gambar

| Prioritas | Aksi |
|-----------|------|
| P0 | Turunkan `per_page` featured ke 12–20; jangan fetch 100 kursus di Home |
| P1 | Pertimbangkan `blob:` URL + `URL.revokeObjectURL` vs data URL permanen |
| P1 | Batch-only di list; matikan `useProtectedFile` di `CourseCardCover` jika `src` sudah resolved |
| P2 | `fetchpriority="high"` + `loading="eager"` pada kartu pertama visible |
| P3 | `<picture>` / WebP dari BE jika CDN mendukung transform |

---

## Font Optimization

**File:** `src/index.css`

```css
@import '@fontsource/poppins/400.css';
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';
```

| Item | Status |
|------|--------|
| 4 weight loaded globally | 🟡 ~80–120 KB font total (estimasi) |
| `font-display` | ✅ Fontsource default swap |
| Variable font | 🔴 Belum — bisa 1 file vs 4 |
| Preload heading font | 🔴 Tidak ada |

---

## CSS

| Item | Nilai | Status |
|------|-------|--------|
| `index-*.css` | 220,9 KB raw / 32,5 KB gzip | Gzip ✅, raw besar (Tailwind 4) |
| TipTap CSS | 7,2 KB | ✅ Lazy dengan editor |
| Critical CSS inline | 🔴 Tidak ada | Full CSS blocking |

Tailwind 4 + `@tailwindcss/vite` — pertimbangkan `@source` ketat agar purge maksimal.

---

## Caching Strategy

### Static assets (Vite)

```
# Rekomendasi header deploy
Cache-Control: public, max-age=31536000, immutable   # /assets/*
```

Hash filename sudah ada (`index-DwDxCXXd.js`) — siap immutable.

### HTML

```
Cache-Control: no-cache, must-revalidate
```

### API (React Query)

**File:** `providers/query-providers.tsx`

| Option | Value | Assessment |
|--------|-------|--------------|
| `staleTime` | 5 menit | ✅ Mengurangi refetch |
| `gcTime` | 30 menit | ✅ |
| `refetchOnWindowFocus` | false | ✅ |
| `refetchOnMount` | false | ✅ |
| Protected file `staleTime` | 5 menit | ✅ Konsisten |

### Protected files HTTP

Backend: `Cache-Control: public, max-age=300` pada GET `/files/...` — browser bisa cache blob **jika** tidak di-convert ke data URL unik setiap sesi.

---

## Core Web Vitals (estimasi / risiko)

| Metric | Target | Risiko di codebase | Halaman terdampak |
|--------|--------|-------------------|-------------------|
| **LCP** | < 2,5 s | 🟡 Medium | Home (hero + cover fetch), Course detail |
| **INP** | < 200 ms | 🟡 Medium | Admin tables tanpa virtualisasi, TipTap edit |
| **CLS** | < 0,1 | 🟢 Low | `CourseCardCoverFrame` aspect-video ✅ |
| **FCP** | < 1,8 s | 🟡 Medium | Entry JS + font CSS |
| **TBT** | < 200 ms | 🔴 High | index bundle parse + Recharts di dashboard |

> **Catatan:** Angka CLS rendah karena frame cover sudah dipatenkan (`aspect-video` + `object-cover`). LCP/TBT perlu konfirmasi Lighthouse di staging.

---

## Third-Party & Network

| Dependency | Loaded | Concern |
|------------|--------|---------|
| Google OAuth | On click | ✅ Tidak blocking |
| Tripay checkout | Route lazy | ✅ |
| Axios → BE | Global | Preconnect direkomendasikan |
| Recharts | Dashboard routes | ✅ Lazy chunk |
| TipTap + ProseMirror | Edit routes | ✅ Lazy chunk |
| Sonner toast | Main bundle | 🟡 Kecil |

---

## Measurement Checklist

```bash
# Baseline sebelum optimasi
npx lighthouse http://localhost:4173 --only-categories=performance

# Web Vitals di production (opsional)
# npm i web-vitals
# onLCP, onINP, onCLS → analytics
```

Catat hasil di [action-backlog.md](./action-backlog.md).
