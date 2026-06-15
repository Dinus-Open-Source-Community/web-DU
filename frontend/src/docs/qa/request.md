# QA Request — Feature & Enhancement Log

> **Catatan QA:** Dokumen ini berisi request / permintaan penambahan fitur dari sesi QA untuk meningkatkan UX, keterlacakan navigasi, dan feedback visual pada aplikasi frontend.

---

## 1. Integrasi `nuqs` untuk Query State (URL-based Tab Navigation)

> **Komentar QA:** *Tambahkan package `nuqs` agar ketika user berpindah tab itu tercatat. Contoh pada course menu tugas akan tercatat pada URL `?tab=tugas&view=quiz`. Digunakan untuk jaga-jaga jika user ingin melakukan share link, jadi langsung tertuju pada poin yang dimaksud.*

### Deskripsi Request
Saat user berpindah antar tab (misal: Overview, Kurikulum, Tugas, Review, Mentor) di halaman detail course, state tab yang aktif harus tercatat di URL sebagai query parameter. Sehingga ketika user melakukan refresh atau share link ke orang lain, halaman akan langsung membuka tab yang sama dengan yang terakhir kali dibuka.

### Analisis Teknis
- Saat ini project menggunakan **React Router v7** (`react-router-dom`).
- Library **`nuqs`** adalah utility untuk mengelola URL search params dengan typed-parsers yang bisa digunakan bersama React Router (`useSearchParams`).
- `nuqs` bukan Next.js exclusive — library ini bisa diintegrasikan ke React Router dengan cara menggunakan `useSearchParams` dari `react-router-dom` sebagai hook `router` atau `adapter` custom.
- Alternatif lain: React Router sendiri sudah menyediakan `useSearchParams` yang cukup untuk case sederhana, namun `nuqs` memberikan value parsing yang lebih kaya (string, number, array, enum) dan shallow routing.

### Contoh Perilaku yang Diharapkan

| Aksi User | URL yang Terbentuk |
|-----------|-------------------|
| Buka tab **Tugas** | `/admin/courses/xxx?tab=tugas` |
| Buka sub-view **Quiz** di dalam tab Tugas | `/admin/courses/xxx?tab=tugas&view=quiz` |
| Buka tab **Kurikulum** | `/admin/courses/xxx?tab=kurikulum` |
| Buka tab **Review** | `/admin/courses/xxx?tab=review` |
| Share link | Penerima langsung masuk ke tab yang sama |

### Panduan Implementasi (Frontend)

#### Langkah 1: Install `nuqs`

```bash
cd frontend
npm install nuqs
# atau
bun add nuqs
```

#### Langkah 2: Buat `nuqs` adapter untuk React Router

Karena `nuqs` secara default menggunakan Next.js `useSearchParams`, buat adapter untuk React Router v7:

```tsx
// frontend/src/lib/nuqs-react-router.ts
import { useSearchParams, useNavigate } from 'react-router-dom'
import { parseAsString, createSearchParamsCache } from 'nuqs'

export function useQueryState(key: string, defaultValue?: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(key) ?? defaultValue ?? null

  const setValue = (next: string | null) => {
    setSearchParams((prev) => {
      const draft = new URLSearchParams(prev)
      if (next === null || next === defaultValue) {
        draft.delete(key)
      } else {
        draft.set(key, next)
      }
      return draft
    }, { replace: true })
  }

  return [value, setValue] as const
}

// Untuk typed enum (tab values)
export function useQueryStateEnum<T extends string>(
  key: string,
  options: T[],
  defaultValue?: T,
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(key)
  const value = options.includes(raw as T) ? (raw as T) : (defaultValue ?? null)

  const setValue = (next: T | null) => {
    setSearchParams((prev) => {
      const draft = new URLSearchParams(prev)
      if (next === null || next === defaultValue) {
        draft.delete(key)
      } else {
        draft.set(key, next)
      }
      return draft
    }, { replace: true })
  }

  return [value, setValue] as const
}
```

#### Langkah 3: Modifikasi `CourseDetailNavTabs` agar sinkron dengan URL

```tsx
// frontend/src/components/shared/course-detail-manage/CourseDetailNavTabs.tsx
import { useQueryStateEnum } from '@/lib/nuqs-react-router'

export function CourseDetailNavTabs({ isAdmin }: CourseDetailNavTabsProps) {
  const tabs = getCourseDetailTabs(isAdmin)
  const tabValues = tabs.map((t) => t.value) as CourseDetailTabValue[]

  const [activeTab, setActiveTab] = useQueryStateEnum('tab', tabValues, 'overview')

  return (
    <div className={manageDetailLayout.tabScroll}>
      <TabsList
        variant="line"
        value={activeTab ?? 'overview'}
        onValueChange={(val) => setActiveTab(val as CourseDetailTabValue)}
        aria-label="Navigasi detail course"
        className={manageDetailLayout.tabList}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={manageDetailLayout.tabTrigger}
          >
            <tab.icon className="size-4 opacity-70" aria-hidden />
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
```

#### Langkah 4: Modifikasi `CourseDetailManageView` agar Tabs wrapper membaca URL

```tsx
// Di komponen parent yang menggunakan <Tabs>
import { useQueryStateEnum } from '@/lib/nuqs-react-router'

const [activeTab, setActiveTab] = useQueryStateEnum('tab', ALL_TAB_VALUES, 'overview')

<Tabs value={activeTab ?? 'overview'} onValueChange={setActiveTab}>
  ...
</Tabs>
```

#### Langkah 5: Tambahkan sub-view query (opsional)

Jika di dalam tab Tugas ada sub-view seperti Quiz, Assignment, atau Exam:

```tsx
const [subView, setSubView] = useQueryStateEnum('view', ['quiz', 'assignment', 'exam'])
```

### File yang Perlu Diubah

| File | Perubahan |
|------|-----------|
| `frontend/src/lib/nuqs-react-router.ts` | **(NEW)** Adapter `useQueryState` / `useQueryStateEnum` untuk React Router |
| `frontend/src/components/shared/course-detail-manage/CourseDetailNavTabs.tsx` | Sinkron tab aktif ke URL query |
| `frontend/src/components/shared/course-detail-manage/CourseDetailManageView.tsx` | Sinkron `Tabs` wrapper ke URL query |
| `frontend/src/pages/mentor/CourseDetailMentor.tsx` | Jika ada, sinkron juga |
| `frontend/src/pages/admin/CourseDetailAdmin.tsx` | Jika ada, sinkron juga |

---

## 2. Dashboard Period Switch — Tidak Ada Loading State (Jeda Component)

> **Komentar QA:** *Saat pindah 7 hari, 30 hari, 90 hari, dan 12 bulan itu tidak ada jeda component.*

### Deskripsi Request
Pada halaman **Admin Dashboard**, saat user mengubah filter period (7 Hari → 30 Hari → 90 Hari → 12 Bulan) melalui `PeriodSelector`, komponen-komponen di bawahnya (KPI, chart, transaksi) tidak menampilkan **loading state** (skeleton / spinner). Data lama langsung tertimpa data baru tanpa transisi visual, sehingga terasa "patah-patah" dan user tidak mendapat feedback bahwa proses fetch sedang berlangsung.

### Analisis Teknis

**Root cause ada di 2 level:**

#### A. `isLoading` vs `isFetching` — React Query v5

- Di `Dashboard.tsx` baris 77, `KpiGrid` hanya menggunakan `kpis.isLoading`:
  ```tsx
  <KpiGrid adminKpis={kpis.data} isLoading={kpis.isLoading} />
  ```
- Dalam **React Query v5**, `isLoading` = `isPending && isFetching`. Artinya `isLoading` **hanya true** saat query **belum pernah** memiliki data sukses (cache kosong).
- Saat user switch dari 30d → 7d, jika 7d pernah di-load sebelumnya (cache hit), `isLoading` = `false`, tapi `isFetching` = `true`. Karena hanya dicek `isLoading`, skeleton **tidak muncul** — data lama/placeholder langsung ditampilkan.
- Hal yang sama terjadi pada chart dan transaction summary yang juga hanya memeriksa `isLoading`.

#### B. `queryKey` Chart & Transaction Summary Tidak Mengandung `period`

- Di `use-admin-dashboard.ts` baris 44–54:
  ```tsx
  const transactionSummary = useQuery({
    queryKey: adminDashboardKeys.transactionSummary, // ← tidak ada period
    queryFn: fetchTransactionSummary,
    staleTime: 60_000,
  })

  const financialCharts = useQuery({
    queryKey: adminDashboardKeys.financialCharts,   // ← tidak ada period
    queryFn: fetchFinancialSummary,
    staleTime: 120_000,
  })
  ```
- `transactionSummary` dan `financialCharts` **tidak di-fetch ulang** saat period berubah. Query key-nya statis, jadi React Query menganggap data masih valid. User tidak pernah melihat skeleton pada chart dan donut saat switch period.

### Panduan Implementasi (Frontend)

#### Langkah 1: Gunakan `isFetching` untuk KPI & Chart

Ubah pengecekan loading di `Dashboard.tsx` agar menampilkan skeleton baik saat **initial load** maupun saat **background refetch** (switch period):

```tsx
// Dashboard.tsx
<KpiGrid
  adminKpis={kpis.data}
  isLoading={kpis.isLoading || kpis.isFetching}   // ← tambah isFetching
/>

// ChartCard — Tren Revenue Bulanan
{financialCharts.isError ? (...) : (financialCharts.isLoading || financialCharts.isFetching) ? (
  <ChartSkeleton />
) : (
  <CategoryBarChart ... />
)}

// ChartCard — Status Transaksi
{transactionSummary.isError ? (...) : (transactionSummary.isLoading || transactionSummary.isFetching) ? (
  <DonutSkeleton />
) : (
  <TransactionRatioChart ... />
)}
```

#### Langkah 2: Tambahkan `period` ke QueryKey Chart & Transaction Summary

Jika **backend mendukung** filter period untuk endpoint `transaction-summary` dan `financial-summary`, update hook:

```tsx
// use-admin-dashboard.ts
const transactionSummary = useQuery({
  queryKey: adminDashboardKeys.transactionSummary(period), // ← tambah period
  queryFn: () => fetchTransactionSummary(period),          // ← tambah period
  staleTime: 60_000,
})

const financialCharts = useQuery({
  queryKey: adminDashboardKeys.financialCharts(period),    // ← tambah period
  queryFn: () => fetchFinancialSummary(period),            // ← tambah period
  staleTime: 120_000,
})
```

```tsx
// query-keys.ts
export const adminDashboardKeys = {
  ...
  transactionSummary: (period: string) =>
    ['admin-dashboard', 'transaction-summary', period] as const,
  financialCharts: (period: string) =>
    ['admin-dashboard', 'financial-charts', period] as const,
}
```

```tsx
// services/admin-dashboard.ts
export async function fetchTransactionSummary(period: DashboardPeriod = '30d') {
  const response = await api.get<IResponse<TransactionSummary>>(
    API_ROUTES.admin.transactions.summary({ period }), // ← kirim period
  )
  return unwrapApiResponse(...)
}

export async function fetchFinancialSummary(period: DashboardPeriod = '30d') {
  const response = await api.get<IResponse<FinancialSummary>>(
    API_ROUTES.admin.financial.summary + `?period=${period}`, // ← atau via withQuery
  )
  return unwrapApiResponse(...)
}
```

> **Catatan:** Endpoint `financial-summary` saat ini (`/admin/financial/summary`) tidak menerima query param. Jika backend belum support filter period, maka **skip Langkah 2** dan cukup pasang Langkah 1 (`isFetching`). Jika memang data financial summary bersifat global (tidak tergantung period), maka queryKey boleh tetap statis.

#### Langkah 3: Tambahkan Delay / Debounce (Opsional — UX Polish)

Jika network terlalu cepat sehingga skeleton hanya muncul sekilas (flash), tambahkan minimum delay skeleton menggunakan custom hook:

```tsx
// hooks/use-minimum-loading.ts
import { useState, useEffect } from 'react'

export function useMinimumLoading(isFetching: boolean, minMs = 400) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isFetching) {
      setShow(true)
    } else {
      const t = setTimeout(() => setShow(false), minMs)
      return () => clearTimeout(t)
    }
  }, [isFetching])

  return show
}
```

```tsx
// Dashboard.tsx
const showKpiLoading = useMinimumLoading(kpis.isLoading || kpis.isFetching, 400)
<KpiGrid adminKpis={kpis.data} isLoading={showKpiLoading} />
```

### File yang Perlu Diubah

| File | Perubahan |
|------|-----------|
| `frontend/src/pages/admin/Dashboard.tsx` | Ubah `isLoading` → `isLoading \|\| isFetching` pada KPI, chart, dan transaction summary |
| `frontend/src/hooks/use-admin-dashboard.ts` | (Opsional) Tambahkan `period` ke queryKey & queryFn `transactionSummary` dan `financialCharts` jika backend support |
| `frontend/src/hooks/query-keys.ts` | (Opsional) Update `adminDashboardKeys.transactionSummary` dan `financialCharts` agar menerima `period` |
| `frontend/src/services/admin-dashboard.ts` | (Opsional) Tambahkan param `period` ke `fetchTransactionSummary` dan `fetchFinancialSummary` |
| `frontend/src/hooks/use-minimum-loading.ts` | (Opsional, NEW) Custom hook untuk minimum delay skeleton |

---

## 3. Penambahan Loading Indicator (Top Progress Bar)

> **Komentar QA:** *Tambahkan `nextjs-toploader`.*

### Deskripsi Request
Tambahkan progress bar yang muncul di bagian atas layar setiap kali navigasi antar halaman atau saat data sedang di-fetch, agar user mendapatkan feedback visual bahwa proses sedang berlangsung.

### Analisis Teknis
- **`nextjs-toploader`** adalah library yang dirancang khusus untuk **Next.js** (`App Router` / `Pages Router`). Library ini menggantikan `next/router` events untuk menampilkan progress bar saat route change.
- **Namun**, project ini adalah **Vite + React Router** (bukan Next.js), sehingga `nextjs-toploader` **tidak bisa langsung di-install** karena memiliki dependency ke `next` package.
- **Alternatif untuk React Router / Vite:**
  - `react-top-loading-bar` — library murni React, tidak bergantung pada Next.js, API sangat mirip.
  - `nprogress` — library vanilla JS yang populer, diintegrasikan via custom React hook.

### Panduan Implementasi — Menggunakan `react-top-loading-bar` (Rekomendasi)

#### Langkah 1: Install

```bash
cd frontend
npm install react-top-loading-bar
# atau
bun add react-top-loading-bar
```

#### Langkah 2: Buat context / provider untuk progress bar global

```tsx
// frontend/src/components/shared/TopLoadingBar.tsx
import { useRef, createContext, useContext, useCallback } from 'react'
import LoadingBar from 'react-top-loading-bar'

const TopLoadingBarContext = createContext<{
  start: () => void
  complete: () => void
}>({ start: () => {}, complete: () => {} })

export function TopLoadingBarProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<any>(null)

  const start = useCallback(() => {
    ref.current?.continuousStart()
  }, [])

  const complete = useCallback(() => {
    ref.current?.complete()
  }, [])

  return (
    <TopLoadingBarContext.Provider value={{ start, complete }}>
      <LoadingBar
        ref={ref}
        color="#2563eb"
        height={3}
        shadow
        transitionDuration={300}
        waitingTime={400}
      />
      {children}
    </TopLoadingBarContext.Provider>
  )
}

export function useTopLoadingBar() {
  return useContext(TopLoadingBarContext)
}
```

#### Langkah 3: Hubungkan ke React Router events

```tsx
// frontend/src/components/shared/RouteLoadingBar.tsx
import { useEffect } from 'react'
import { useNavigation } from 'react-router-dom'
import { useTopLoadingBar } from './TopLoadingBar'

export function RouteLoadingBar() {
  const navigation = useNavigation()
  const { start, complete } = useTopLoadingBar()

  useEffect(() => {
    if (navigation.state === 'loading') {
      start()
    } else {
      complete()
    }
  }, [navigation.state, start, complete])

  return null
}
```

#### Langkah 4: Tambahkan ke root layout

```tsx
// frontend/src/main.tsx (atau root layout component)
import { TopLoadingBarProvider } from './components/shared/TopLoadingBar'
import { RouteLoadingBar } from './components/shared/RouteLoadingBar'

<BrowserRouter>
  <TopLoadingBarProvider>
    <RouteLoadingBar />
    <App />
  </TopLoadingBarProvider>
</BrowserRouter>
```

#### Langkah 5: Trigger manual pada fetch data (opsional)

```tsx
const { start, complete } = useTopLoadingBar()

useEffect(() => {
  start()
  fetchData().then(() => complete())
}, [])
```

### Alternatif: Menggunakan `nprogress` (jika lebih ringan)

```bash
npm install nprogress
npm install -D @types/nprogress
```

```tsx
// Di root layout
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useNavigation } from 'react-router-dom'

useEffect(() => {
  if (navigation.state === 'loading') NProgress.start()
  else NProgress.done()
}, [navigation.state])
```

### Catatan Penting

> **Project ini bukan Next.js.** Library `nextjs-toploader` tidak cocok untuk Vite + React Router.  
> **Gunakan `react-top-loading-bar`** sebagai pengganti yang memiliki API dan visual yang hampir identik (progress bar biru di atas layar).  
> Jika di masa depan project bermigrasi ke Next.js, baru bisa menggunakan `nextjs-toploader` secara native.

---

## Ringkasan Package & File

| Request | Package | File yang Diubah / Dibuat |
|---------|---------|---------------------------|
| URL Tab State | `nuqs` | `frontend/src/lib/nuqs-react-router.ts` (NEW) |
| URL Tab State | `nuqs` | `frontend/src/components/shared/course-detail-manage/CourseDetailNavTabs.tsx` |
| URL Tab State | `nuqs` | `frontend/src/components/shared/DetailCourseComponents.tsx` / `CourseDetailManageView.tsx` |
| Top Loading Bar | `react-top-loading-bar` | `frontend/src/components/shared/TopLoadingBar.tsx` (NEW) |
| Top Loading Bar | `react-top-loading-bar` | `frontend/src/components/shared/RouteLoadingBar.tsx` (NEW) |
| Top Loading Bar | `react-top-loading-bar` | `frontend/src/main.tsx` atau root layout |

---

## Catatan Implementasi

1. **Prioritas:** `nuqs` (URL tab state) lebih krusial karena langsung berdampak pada UX dan shareability link.
2. **Top loader:** Gunakan `react-top-loading-bar` sebagai stand-in untuk `nextjs-toploader`. Warnanya bisa disesuaikan dengan brand primary color.
3. **Testing:** Setelah integrasi `nuqs`, pastikan:
   - Share URL `?tab=tugas` langsung membuka tab Tugas
   - Refresh halaman tidak reset tab ke default
   - Back/Forward browser history tetap bekerja dengan baik
4. **Scope:** Saat ini terapkan pada halaman detail course terlebih dahulu. Jika berhasil, bisa di-extend ke halaman lain (misal: user profile tabs, settings tabs).
