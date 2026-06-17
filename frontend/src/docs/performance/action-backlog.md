# Performance Action Backlog

Backlog prioritas hasil audit performa. Format mengikuti kalibrasi **performance-review**: jelas, actionable, dengan evidence.

**Branch:** `features/frontend-sapto` · **Review date:** 17 Juni 2026 · **Implemented:** 17 Juni 2026

---

## Rating Distribution (temuan)

| Severity | Count | Target setelah sprint |
|----------|-------|------------------------|
| 🔴 P0 Blocker | 3 | 0 |
| 🟠 P1 High | 6 | ≤ 2 |
| 🟡 P2 Medium | 7 | Backlog |
| 🟢 P3 Polish | 5 | Optional |

**Post-sprint:** P0 = 1 open (Lighthouse baseline); P1 = 0 open; P2 = 1 open (CSS audit); P3 = 3 deferred.

---

## P0 — Blocker (Core UX / Budget)

| ID | Task | Evidence | Aksi | Owner | Status |
|----|------|----------|------|-------|--------|
| PERF-01 | Kurangi fetch featured Home | `useFeaturedCourses` → `per_page: 100` untuk 3 kartu | Ubah ke `per_page: 12` + sort rating di BE atau client slice lebih awal | FE | 🟢 Fixed |
| PERF-02 | Audit isi `index-*.js` (636 KB) | Build report | `manualChunks` vendor/query/radix/tiptap/recharts/lottie | FE | 🟢 Fixed |
| PERF-03 | Ukur Lighthouse baseline | Belum ada angka LCP/TBT | Jalankan 6 halaman kritis; isi tabel di bawah | FE/QA | 🔴 Open |

---

## P1 — High Impact

| ID | Task | Evidence | Aksi | Owner | Status |
|----|------|----------|------|-------|--------|
| PERF-04 | ReactQueryDevtools prod | Import unconditional di `query-providers.tsx` | Lazy import + `import.meta.env.DEV` | FE | 🟢 Fixed |
| PERF-05 | Lottie chunk split | Vite INEFFECTIVE_DYNAMIC_IMPORT warning | Lazy import di `Lottie.tsx` (Auth layout) | FE | 🟢 Fixed |
| PERF-06 | N+1 avatar admin QA | `UserAvatarImage` + `useProtectedFile` per row | Batch via `useProtectedFileMap` di `useAdminReviews` / `useAdminQnaThreads` | FE | 🟢 Fixed |
| PERF-07 | Memori data URL gambar | `blobToDataUrl` + RQ cache 30 min | `URL.createObjectURL` + revoke on cache remove | FE | 🟢 Fixed |
| PERF-08 | Auth boot image batch | `useResolvedAuthProfile` resolve all joined courses | Avatar-only saat boot; cover di Learning/Dashboard | FE | 🟢 Fixed |
| PERF-09 | Preconnect API | `index.html` tanpa hints | `transformIndexHtml` preconnect + dns-prefetch | FE | 🟢 Fixed |

---

## P2 — Medium

| ID | Task | Evidence | Aksi | Owner | Status |
|----|------|----------|------|-------|--------|
| PERF-10 | Font subset | 4× Poppins `@fontsource` global | Hanya weight 400 + 600 | FE | 🟢 Fixed |
| PERF-11 | CSS purge audit | 221 KB raw CSS | Review `@source` Tailwind 4 scope | FE | 🟡 Partial |
| PERF-12 | Admin table virtualization | Full DOM render per page | `content-visibility` + `contain-intrinsic-size` | FE | 🟢 Fixed |
| PERF-13 | LCP priority cover #1 | Featured grid | `fetchpriority="high"` + `loading="eager"` kartu pertama | FE | 🟢 Fixed |
| PERF-14 | Skip hook if resolved | `CourseCardCover` always calls `useProtectedFile` | `isPassThroughDisplayUrl` + `enabled: false` | FE | 🟢 Fixed |
| PERF-15 | Recharts tree-shake | Import full chart types | Lazy `CategoryBarChart` / `TransactionRatioChart` di admin Dashboard | FE | 🟢 Fixed |
| PERF-16 | `useDeferredValue` browse search | Filter sync di browse | Defer filtered list render | FE | 🟢 Fixed |

---

## P3 — Polish

| ID | Task | Aksi | Status |
|----|------|------|--------|
| PERF-17 | Speculation Rules prerender | `@view-transition` + rules untuk `/courses` | 🟢 Fixed (prerender `/courses*`) |
| PERF-18 | web-vitals RUM | Kirim LCP/INP/CLS ke analytics | 🔴 Open |
| PERF-19 | Service worker cache static | PWA optional — cache `/assets/*` | ⏸️ Won't fix |
| PERF-20 | Responsive images | BE/CDN multi-size + `srcset` | ⏸️ Won't fix |
| PERF-21 | Memo `CardCourse` | Hanya setelah Profiler bukti re-render | ⏸️ Won't fix |

---

## Build After (17 Jun 2026)

| Chunk | Raw | Gzip |
|-------|-----|------|
| `index-*.js` | 90.6 KB | 33.1 KB |
| `vendor-*.js` | 443.6 KB | 136.2 KB |
| `tiptap-*.js` | 508.7 KB | 155.3 KB |
| `recharts-*.js` | 380.4 KB | 109.8 KB |
| `lottie-*.js` | 331.2 KB | 36.3 KB |
| CSS | 218.8 KB | 32.4 KB |

---

## Lighthouse Baseline (isi setelah ukur)

| Halaman | LCP | INP | CLS | TBT | Score | Date |
|---------|-----|-----|-----|-----|-------|------|
| `/` Home | — | — | — | — | — | — |
| `/courses` | — | — | — | — | — | — |
| `/student/dashboard` | — | — | — | — | — | — |
| `/admin/dashboard` | — | — | — | — | — | — |
| Course edit | — | — | — | — | — | — |
| Module viewer | — | — | — | — | — | — |

---

## Verification Checklist (per task)

Setelah menutup task PERF-xx:

- [x] `npm run build` sukses (no Lottie chunk warning)
- [ ] Lighthouse halaman terdampak ≥ +5 poin atau metric target tercapai (PERF-03)
- [x] Tidak regresi fungsi (gambar masih tampil, auth OK)
- [x] Update status kolom di tabel ini → 🟢 Fixed
- [x] Update ringkasan di [README.md](./README.md)

---

## Quick Wins (< 1 hari)

1. **PERF-01** — ✅ `per_page: 12` di `use-featured-courses.ts`
2. **PERF-04** — ✅ DEV guard + lazy devtools
3. **PERF-09** — ✅ preconnect via `vite.config.ts`
4. **PERF-14** — ✅ pass-through URL di `useProtectedFile`

---

## Calibration Notes (for team review)

**Strengths (keep):**

- Route lazy loading matang — investasi arsitektur sudah benar sejak awal.
- TanStack Query defaults menghindari refetch storm.
- Cover frame `aspect-video` menutup CLS regression setelah fix gambar 401.
- Vendor manual chunks memecah entry 636 KB → ~91 KB.

**Development focus:**

- Jalankan Lighthouse baseline (PERF-03) di staging dengan auth mock.
- Gambar terproteksi: batch-first, object URL + revoke on GC.

**Out of scope (Won't fix sekarang):**

- Full PWA / offline (PERF-19)
- AVIF pipeline (PERF-20 — butuh BE)
- SSR/SSG (SPA Vite tetap client-render)
- Memo komponen tanpa bukti Profiler (PERF-21)
