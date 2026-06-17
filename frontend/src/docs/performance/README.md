# Performance Review — Frontend DOSCOM

Living document hasil audit performa web **frontend-react** (branch `features/frontend-sapto`).

**Terakhir diperbarui:** 17 Juni 2026  
**Metode:** `npm run build` + analisis statis codebase (Lighthouse baseline belum diisi)

---

## Ringkasan Eksekutif

| Area | Rating | Ringkasan |
|------|--------|-----------|
| **Bundle & loading** | 🟢 Baik | Entry `index-*.js` ~91 KB raw / 33 KB gzip; vendor terpisah |
| **Code splitting** | 🟢 Baik | Route lazy + manualChunks (tiptap, recharts, lottie, query, radix) |
| **Data fetching** | 🟢 Baik | Featured `per_page: 12`; auth boot hanya avatar |
| **Gambar terproteksi** | 🟢 Baik | Batch + object URL + revoke; admin QA batch avatar |
| **React runtime** | 🟢 Baik | `useDeferredValue` browse; `content-visibility` admin table |
| **Font & CSS** | 🟡 Cukup | Poppins 2 weight (400/600); CSS ~219 KB uncompressed |
| **Caching / CDN** | 🟡 Cukup | Preconnect API; hash asset Vite ✅ |

**Estimasi dampak UX:** First load jauh lebih ringan setelah split vendor. Lighthouse runtime (PERF-03) masih perlu diukur di staging.

---

## Performance Budget (target vs aktual)

| Resource | Budget | Aktual (build 17 Jun 2026 post-fix) | Status |
|----------|--------|-------------------------------------|--------|
| JS entry (gzip) | < 300 KB | **~33 KB** (`index-*.js`) | ✅ |
| JS entry (raw) | — | **~91 KB** | ✅ |
| JS vendor (gzip) | — | **~136 KB** (lazy shared) | ℹ️ |
| CSS (gzip) | < 100 KB | **~32 KB** | ✅ |
| CSS (uncompressed) | — | **~219 KB** | 🟡 Tailwind + theme |
| TipTap chunk | Isolate | **509 KB** / gzip 155 KB | ✅ Hanya route edit |
| Recharts chunk | Isolate | **380 KB** / gzip 110 KB | ✅ Lazy di dashboard |
| Lottie chunk | Isolate | **331 KB** / gzip 36 KB | ✅ Lazy |
| Total page weight (3G) | < 1,5 MB | Belum di-Lighthouse | 🔴 PERF-03 |

---

## Daftar Isi

| Dokumen | Isi |
|---------|-----|
| [**audit-report.md**](./audit-report.md) | Audit lengkap: CRP, bundle, gambar, font, caching, Core Web Vitals |
| [**react-review.md**](./react-review.md) | Pola React: splitting, memo, list, protected files, anti-pattern |
| [**action-backlog.md**](./action-backlog.md) | Backlog prioritas P0–P3 + checklist verifikasi |

---

## Halaman Kritis (prioritas audit runtime)

1. **`/` (Home)** — LCP featured cover #1 + 3 kartu + fetch `per_page: 12`
2. **`/courses` (Browse)** — Grid + deferred search + batch gambar
3. **`/student/dashboard`** — Joined courses resolve on page (bukan auth boot)
4. **`/admin/dashboard`** — Lazy Recharts chunks
5. **`/admin/courses/:id/edit`** — TipTap chunk
6. **`/courses/:id/view`** — Module viewer

---

## Cara Mengukur Ulang

```bash
cd frontend
npm run build
npm run preview   # http://localhost:4173

npx lighthouse http://localhost:4173 --only-categories=performance --output html --output-path ./lighthouse-home.html
npx lighthouse http://localhost:4173/courses --output html --output-path ./lighthouse-courses.html
```

Catat metrik di [action-backlog.md](./action-backlog.md) (PERF-03).

---

## Sinkronisasi

| Dokumen terkait | Path |
|-----------------|------|
| QA status | [../qa/qa-status-board.md](../qa/qa-status-board.md) |
| Revisi gambar 401 | [../progress/files-to-revise.md](../progress/files-to-revise.md) |
| Arsitektur FE | [../progress/architecture.md](../progress/architecture.md) |
