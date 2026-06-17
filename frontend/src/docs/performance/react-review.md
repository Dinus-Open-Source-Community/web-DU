# React Performance Review

Review pola React berdasarkan **React Performance Optimization** guidelines: memoization, code splitting, virtualization, state structure, dan profiling.

**Scope:** `frontend/src/` · React 19 · React Router 7 · TanStack Query 5

---

## Overall Assessment

| Kategori | Score | Notes |
|----------|-------|-------|
| Code splitting | **A** | Route-level lazy di `App.tsx` konsisten |
| Data layer | **B+** | Query hooks + memo apply pattern baik |
| Component memo | **C+** | Sedikit `React.memo`; hooks memo di container |
| List rendering | **C** | Admin tables full render, no virtualization |
| Image hooks | **B−** | Per-card `useProtectedFile` — scale concern |
| Context | **B** | Auth + Query provider; tidak over-split |
| Concurrent features | **D** | Tidak ada `useTransition` / `useDeferredValue` |

---

## Code Splitting ✅

### Yang sudah benar

`App.tsx` memuat hampir semua halaman via `React.lazy` + `Suspense`:

```tsx
const Home = React.lazy(() => import("./pages/landing/Home.tsx"));
const CourseEditAdmin = React.lazy(() => import("./pages/admin/CourseEdit.tsx"));
// ... 40+ routes
```

Chunk berat terisolasi:

| Feature | Chunk ~size | Trigger route |
|---------|-------------|---------------|
| TipTap editor | 542 KB | `/admin/courses/:id/edit`, mentor edit |
| Recharts | 299 KB | Dashboard, financial charts |
| Module viewer | 75 KB | `/courses/:id/view` |

### Gap

1. **`ReactQueryDevtools` always imported** (`query-providers.tsx`) — wrap dengan `import.meta.env.DEV`.
2. **Lottie ineffective split** — unify ke dynamic import saja.
3. **`index` bundle 636 KB** — audit isi: kemungkinan Radix UI barrel, lucide, router, axios, banyak shared UI.

**Rekomendasi:**

```tsx
// query-providers.tsx
{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
```

```tsx
// vite.config.ts — manualChunks (opsional)
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        query: ['@tanstack/react-query'],
      },
    },
  },
},
```

---

## State & Data Fetching

### TanStack Query — pola baik

| Hook | Pattern | Memo |
|------|---------|------|
| `useCourses` | fetch + `useProtectedFileMap` + `applyResolvedImages` | ✅ |
| `useCourseDetail` | sama | ✅ |
| `useManagedUsers` | batch avatar | ✅ |
| `useResolvedAuthProfile` | single avatar + batch courses | ✅ |
| `useFeaturedCourses` | **`per_page: 100`** | ⚠️ Over-fetch |

### Auth provider

`auth-provider.tsx` memuat profil penuh + image resolve di root — **setiap user login** memicu batch gambar joined/mentored courses.

| Impact | Detail |
|--------|--------|
| Network | Batch POST avatars + covers saat app mount |
| Memory | Data URL di query cache 30 min |
| Re-render | `resolvedProfile` update → subtree auth-aware re-render |

**Rekomendasi:** Lazy-resolve `joined_courses` images hanya saat halaman Learning/Dashboard dibuka, bukan di auth boot.

---

## Protected File Hooks & `CourseCardCover`

### Arsitektur

```
API list → useProtectedFileMap (batch) → applyResolvedImages → data URL di props
                ↓
         CourseCardCover → useProtectedFile (single GET jika masih raw URL)
```

### Masalah skala

| Skenario | Perilaku | Masalah |
|----------|----------|---------|
| Grid 12 kartu, batch resolved | 12× hook mount, query disabled | Overhead hook ringan |
| Grid 12 kartu, **tanpa** batch | 12× parallel GET single | 🔴 N+1 network |
| Admin QA avatars | 1× `UserAvatarImage` = 1× GET per row | 🔴 N+1 di tabel panjang |
| Reviews list 50 rows | 50 avatar GET | 🔴 |

**Rekomendasi React:**

1. **`CourseCardCover` — mode `resolved`:** skip `useProtectedFile` jika `src` starts with `data:` atau `blob:`.
2. **List pages:** wajib batch di parent hook; jangan andalkan child fetch.
3. **Pertimbangkan `useProtectedFileMap` di `ReviewsQaTabs`** untuk avatar reviewer.

```tsx
// Pola aman untuk kartu
<CourseCardCoverFrame>
  <CourseCardCover src={resolvedCoverUrl} alt={title} fill />
</CourseCardCoverFrame>
// resolvedCoverUrl dari useCourses().data — BUKAN raw /files/ URL
```

---

## Component Re-render Patterns

### `useMemo` / `useCallback` usage

~90+ file menggunakan memo hooks — terutama di:

- `hooks/use-course-edit-controller.ts` (29 usages)
- `hooks/course-module-viewer/use-course-module-viewer.ts` (17)
- Admin transaction hooks

**Assessment:** Memo di **container hooks** ✅ — bukan over-memo di leaf UI.

### Missing `React.memo` candidates (profil dulu)

| Component | Alasan |
|-----------|--------|
| `CardCourse` | Re-render saat parent list update |
| `JoinedCourseCard` | Grid learning page |
| `AdminDataTable` rows | Large admin lists |
| `CourseCardProfiles` | Avatar stack di setiap kartu |

**Jangan memo dulu tanpa Profiler** — ukur apakah list re-render menjadi bottleneck.

---

## List & Table Performance

| Surface | Rows typical | Virtualized? |
|---------|--------------|--------------|
| `AdminDataTable` | 10–50/page | 🔴 No |
| Browse courses grid | 12–24 | 🔴 No (OK < 30) |
| Transactions table | 10/page | 🔴 No |
| Module sidebar lessons | 20–100 | 🔴 No |

**Rekomendasi** (list > 100 item):

```tsx
// react-window — jika admin table > 100 rows tanpa pagination ketat
import { FixedSizeList } from 'react-window';
```

Atau CSS:

```css
.admin-table-row {
  content-visibility: auto;
  contain-intrinsic-size: 0 56px;
}
```

---

## Concurrent Features (React 18+)

Belum dipakai di codebase:

| Feature | Use case di app ini |
|---------|---------------------|
| `useTransition` | Filter/search admin tables — keep input responsive |
| `useDeferredValue` | Browse course search debounce + defer heavy grid |
| `Suspense` boundaries | Nested suspense per section dashboard |

Contoh untuk browse:

```tsx
const deferredSearch = useDeferredValue(search);
const filtered = useMemo(
  () => filterCourses(courses, deferredSearch),
  [courses, deferredSearch],
);
```

---

## Layout & CLS

### Cover cards — ✅ fixed

`CourseCardCoverFrame` + `fill` + `aspect-video` mencegah layout shift saat gambar load.

### Skeleton loading

`Feature.tsx` landing — skeleton `aspect-video` ✅ konsisten dengan kartu asli.

### TipTap editor

Editor mount bisa shift toolbar — sudah ada dedicated CSS chunk; pantau CLS saat buka lesson edit.

---

## Anti-patterns ditemukan

| # | Anti-pattern | Lokasi | Fix |
|---|--------------|--------|-----|
| 1 | Fetch 100 courses untuk 3 featured | `use-featured-courses.ts` | Kurangi `per_page` |
| 2 | Devtools in prod bundle | `query-providers.tsx` | DEV guard |
| 3 | N+1 single file GET di tables | `UserAvatarImage` di QA | Batch map |
| 4 | Data URL memory retention | `use-protected-file*.ts` | Blob URL + revoke |
| 5 | Static+dynamic Lottie | `Lottie.tsx` / `lottie.tsx` | Satu strategi import |
| 6 | Inline object props ke memo children | Sparse — audit with Profiler | — |

---

## Profiling Workflow

### 1. Identifikasi bottleneck

1. Buka React DevTools → **Profiler**
2. Rekam: Home load, Browse filter, Admin dashboard, Course edit typing
3. Cari komponen yellow/red + re-render same props

### 2. Target optimasi

| Gejala | Solusi |
|--------|--------|
| List item re-render all | `React.memo` + stable callbacks |
| Expensive filter every keystroke | `useDeferredValue` |
| Chart jank on dashboard | Lazy mount chart tab |
| TipTap lag | Sudah isolated; cek extension count |

### 3. Verifikasi

Profiler before/after + Lighthouse TBT comparison.

---

## React Performance Checklist

### Sudah ✅

- [x] Route-based code splitting (`App.tsx`)
- [x] Heavy editor/chart di lazy chunk
- [x] Query staleTime / gcTime configured
- [x] Cover aspect ratio fixed (CLS)
- [x] Memo di data hooks (apply resolved images)
- [x] `refetchOnWindowFocus: false`

### Belum ⬜

- [ ] Guard ReactQueryDevtools prod
- [ ] Fix Lottie chunk split
- [ ] Reduce featured courses fetch size
- [ ] Batch avatars di admin QA/forum
- [ ] Virtualize atau content-visibility admin tables
- [ ] `useTransition` pada search/filter berat
- [ ] Profiler session terdokumentasi (before metrics)
