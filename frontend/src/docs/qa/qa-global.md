# Bug Report — Global Issues (QA Session)

> **Catatan QA:** Dokumen ini berisi temuan bug dan permintaan fitur yang berlaku secara global di seluruh halaman aplikasi.

---

## Perintah

### 1. Revalidate Data Secara Otomatis Setelah Update

> **Status FE:** 🟢 Fixed (QA-G-01, sesi 5) · **Tunggu retest QA**

- Jika bisa, lakukan pembuatan setiap data melakukan revalidate setiap ada data yang update sehingga ketika user kembali ke halaman A dari halaman B, data sudah ter-update sehingga tidak perlu melakukan refresh.
- Tolong berlakukan ke **semua halaman**.

**Deskripsi:**
Perubahan data (create, update, delete) yang dilakukan di satu halaman tidak otomatis ter-refresh di halaman lain yang menampilkan data sejenis. User harus melakukan refresh manual untuk melihat data terbaru.

**Behavior Saat Ini:**
- User membuat/mengubah data di halaman B
- User kembali ke halaman A
- Data di halaman A masih menampilkan data lama
- User harus refresh manual

**Behavior yang Diharapkan:**
- Setelah user kembali ke halaman A, data sudah otomatis ter-update
- Tidak perlu refresh manual untuk melihat perubahan
- Gunakan mekanisme revalidate pada query (React Query) atau server-side revalidation (SWR/TanStack Query) setelah setiap mutation

**Implementasi FE (QA-G-01):**

Konfigurasi global TanStack Query di `src/providers/query-providers.tsx`:

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 5,       // cache 5 menit; mutation invalidate → stale lebih cepat
      gcTime: 60 * 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,    // tidak refetch saat tab browser difokuskan
      refetchOnMount: true,           // refetch query stale saat halaman di-mount ulang (A ← B)
    },
    mutations: { retry: 0 },
  },
})
```

**Alur revalidate:**

1. **Saat mutation sukses** — hook terkait memanggil `queryClient.invalidateQueries()` (mis. `courseKeys`, `lessonKeys`, `paymentKeys`, `moduleKeys`, dll.) sehingga cache ditandai stale.
2. **Saat user kembali ke halaman A** — komponen mount ulang → TanStack Query refetch query yang stale (`refetchOnMount: true`).
3. **Profil / enrollment** — setelah checkout/pembayaran sukses, invalidate `paymentKeys` + refresh profil auth agar `joined_courses` terbaru.

Contoh invalidate setelah mutation (sudah dipakai di hooks):

```tsx
const queryClient = useQueryClient()

useMutation({
  mutationFn: updateCourse,
  onSuccess: (_data, variables) => {
    void queryClient.invalidateQueries({ queryKey: courseKeys.all })
    void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.uid) })
  },
})
```

Query key terpusat: `src/hooks/query-keys.ts` (`courses`, `modules`, `lessons`, `payment`, `student-assignments`, dll.).

**Checklist retest QA:**

1. Ubah data di halaman B (create/update/delete — mis. edit kursus, submit tugas, bayar kursus)
2. Navigasi kembali ke halaman A tanpa hard refresh browser
3. Data di halaman A harus sudah terbaru

---

## Ringkasan

| No | Deskripsi | Prioritas | ID Board | Status |
|----|-----------|-----------|----------|--------|
| 1 | Revalidate otomatis setelah update di semua halaman | High | QA-G-01 | 🟢 Fixed |
