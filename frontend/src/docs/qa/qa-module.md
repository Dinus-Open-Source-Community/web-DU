# Bug Report — Module Feature (QA Session)

> **Catatan QA:** Dokumen ini berisi temuan bug dari sesi QA untuk fitur Module / Kurikulum pada halaman detail course. Kata-kata di bawah ini merupakan komentar dari QA yang telah disusun ulang agar lebih jelas dan profesional.

---

## Role: Admin

### 1. Modul Duplikat Saat Disimpan

> **Komentar QA:** *Bug menyimpan modul, sama seperti sebelumnya yang ketika menyimpan modul yang tersimpan langsung 4.*

**Screenshot:**

| 4 modul duplikat setelah menyimpan 1 modul |
|---|
| ![4 modul duplikat](assets/qa-course/8.png) |

**Deskripsi Bug:**
Admin membuat satu modul baru pada kurikulum course. Setelah proses penyimpanan selesai, sistem menampilkan **4 modul** dengan nama yang sama ("Minggu 1") pada tab **Kurikulum**. Counter di atas juga menunjukkan **"4 Modul | 1 Lesson"**, padahal yang di-input hanya satu modul saja.

**Analisis Teknis:**

1. **State initialization tanpa deduplikasi:**
   - Di `frontend/src/hooks/use-course-edit-controller.ts` baris 204–209, saat state `modules` diinisialisasi dari data API (`sourceModules`), data langsung di-map tanpa pengecekan duplikat berdasarkan `uid`:
     ```tsx
     const nextModules = sourceModules.map((module, index) =>
       toModuleShell(module, index + 1),
     );
     setModules(nextModules);
     ```
   - Jika `sourceModules` mengandung data duplikat (UID yang sama muncul > 1 kali), state lokal akan langsung menampilkan duplikat.

2. **Race condition / cache invalidation:**
   - Setelah modul berhasil dibuat via API, `createPersistedModule` menambahkan modul ke state lokal dan meng-invalidate cache QueryClient (baris 828).
   - Namun, jika komponen parent atau hook lain yang menggunakan `useCourseDetail` melakukan re-fetch dan data baru digabung dengan data lama, bisa terjadi duplikasi.

3. **Fallback module tidak di-replace dengan benar:**
   - Di `handleCreateModule` (baris 787), ada logic `replacesFallback` untuk mengganti modul fallback yang belum tersimpan. Jika logic ini tidak berjalan dengan benar (misal: `isOnlyUnpersistedFallbackModule` mengembalikan `false` padahal seharusnya `true`), modul fallback tetap ada dan modul baru ditambahkan, menghasilkan duplikat visual.

> **Verifikasi Backend (sudah dicek & aman):** Backend `POST /modules` hanya membuat **satu row** module per request (`backend/internal/service/module.go:326-340`). Endpoint `GET /modules/course/{id}` juga mengembalikan data unik langsung dari DB, tanpa duplikat. Tidak ditemukan trigger, loop, atau cache di backend yang menghasilkan 4 modul. Root cause kemungkinan besar ada di frontend state / cache invalidation.

**Panduan Fix (Frontend):**

#### A. Deduplikasi saat inisialisasi state

```tsx
// frontend/src/hooks/use-course-edit-controller.ts
useEffect(() => {
  if (isInitialized || !courseData || typeof courseData !== 'object') return;

  // ...

  const uniqueModules = sourceModules.filter(
    (m, i, arr) => arr.findIndex((t) => t.uid === m.uid) === i
  );

  const nextModules = uniqueModules.map((module, index) =>
    toModuleShell(module, index + 1)
  );

  setModules(nextModules);
  // ...
}, [isInitialized, sourceModules, initialModuleId, courseData, hasCourseModules]);
```

#### B. Deduplikasi saat merge dari API

```tsx
// frontend/src/hooks/use-course-edit-controller.ts
useEffect(() => {
  if (!activeModuleId || !moduleLessonsQuery.data) return;

  const apiLessons = moduleLessonsQuery.data.lessons ?? [];

  setModules((previous) => {
    const merged = mergeModuleLessonsFromApi(
      previous,
      activeModuleId,
      apiLessons,
    );

    // Deduplikasi berdasarkan UID untuk jaga-jaga
    const seen = new Set<string>();
    const deduped = merged.filter((module) => {
      if (!module.uid) return true; // unpersisted fallback tetap diizinkan
      if (seen.has(module.uid)) return false;
      seen.add(module.uid);
      return true;
    });

    // ...
    return deduped;
  });

  // ...
}, [activeModuleId, moduleLessonsQuery.data]);
```

#### C. Pastikan replace fallback berjalan dengan benar

```tsx
// frontend/src/hooks/use-course-edit-controller.ts
const handleCreateModule = useCallback(async (title: string) => {
  // ...
  const replacesFallback = isOnlyUnpersistedFallbackModule(
    modules,
    persistedModuleUidsRef.current,
  );

  // Debug: log untuk memastikan logic benar
  console.log('replacesFallback', replacesFallback, modules);

  const orderIndex = replacesFallback ? 1 : outlineModules.length + 1;
  const moduleTitle = normalizeModuleTitle(title, `Modul ${orderIndex}`);

  // ...
  setModules((previous) => {
    // Jika replacesFallback, pastikan fallback benar-benar dihapus
    if (replacesFallback) {
      const filtered = previous.filter(
        (m) => m.uid && persistedModuleUidsRef.current.has(m.uid)
      );
      return [createdModule, ...filtered];
    }
    return [...previous, createdModule];
  });
  // ...
}, [...]);
```

#### D. Tambahkan invalidasi cache yang lebih agresif

```tsx
// Setelah create module berhasil
await Promise.all([
  queryClient.invalidateQueries({ queryKey: moduleKeys.all }),
  queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) }),
  queryClient.invalidateQueries({ queryKey: lessonKeys.byModule(createdModule.uid) }),
]);
```

### File yang Perlu Diubah

| File | Perubahan |
|------|-----------|
| `frontend/src/hooks/use-course-edit-controller.ts` | Deduplikasi saat init + merge + create module |
| `frontend/src/lib/course-edit/persist-module.ts` | (Opsional) Cek apakah `createPersistedModule` mengembalikan data duplikat dari backend |
| `frontend/src/lib/course-edit/merge-module-lessons.ts` | (Opsional) Tambahkan deduplikasi di `mergeModuleLessonsFromApi` |

### Catatan Implementasi

1. **Root cause kemungkinan besar ada di state management**, bukan di backend. Jika backend memang mengembalikan 4 modul, cek endpoint `fetchModulesByCourseUid`.
2. **Setelah fix, lakukan langkah reproduksi:**
   - Buka course yang belum memiliki modul
   - Tambahkan 1 modul baru
   - Periksa apakah jumlah modul tetap 1 (bukan 4)
   - Refresh halaman, pastikan data tetap konsisten
3. **Tambahkan unit test** untuk `mergeModuleLessonsFromApi` dan `use-course-edit-controller` agar duplikasi tidak terjadi lagi di masa depan.

---

## Ringkasan Bug

| Bug | Status | Prioritas | Verifikasi Backend |
|-----|--------|-----------|--------------------|
| Modul duplikat saat disimpan | **Open** | **High** | Sudah dicek & aman — backend hanya insert 1 row, bukan backend issue |

---

## Rekomendasi QA

> Selain fix teknis, pertimbangkan untuk menambahkan **toast notifikasi** yang lebih spesifik saat modul berhasil dibuat:  
> *"Modul 'Minggu 1' berhasil dibuat. Total modul: 1."*  
> Sehingga jika angka yang muncul tidak sesuai, admin langsung menyadari adanya bug.
