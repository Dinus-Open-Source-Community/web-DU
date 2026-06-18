# Bug Report — Global Issues (QA Session)

> **Catatan QA:** Dokumen ini berisi temuan bug dan permintaan fitur yang berlaku secara global di seluruh halaman aplikasi.

---

## Perintah

### 1. Revalidate Data Secara Otomatis Setelah Update
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

**Implementasi yang Direkomendasikan:**
```tsx
// Setelah mutation sukses, invalidate query terkait
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    // Invalidate semua query yang terkait
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    queryClient.invalidateQueries({ queryKey: ['assignments'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    // dst...
  }
})
```

Atau dengan cara lain sesuai stack yang digunakan:
- **TanStack Query:** `queryClient.invalidateQueries()`
- **SWR:** `mutate()` dengan option `revalidate: true`
- **React Query:** Sama dengan TanStack Query
- **Server Components:** Gunakan `revalidatePath()` atau `revalidateTag()`

---

## Ringkasan

| No | Deskripsi | Prioritas |
|----|-----------|-----------|
| 1 | Revalidate otomatis setelah update di semua halaman | High |
