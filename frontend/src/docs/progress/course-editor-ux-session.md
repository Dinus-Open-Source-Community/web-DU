# Progress — Course Editor UX, Tugas Lesson & Student Viewer

Dokumentasi kemajuan sesi implementasi pada branch `features/frontend-sapto`, fokus **editor kurikulum (admin/mentor)**, **panel tugas lesson**, dan **perbaikan UX terkait**.

**Tanggal:** 7 Juni 2026  
**Audiens:** PM · QA · Code Reviewer

---

## Ringkasan Eksekutif

| Area | Status | Dampak |
|------|--------|--------|
| Panel tugas lesson (admin CRUD assignment) | ✅ Done | Mentor/admin bisa konfigurasi instruksi, aturan, deadline, attachment |
| Save/delete kontekstual per tab (Konten vs Tugas) | ✅ Done | Tombol aksi mengikuti tab aktif + endpoint masing-masing |
| Guard unsaved saat pindah tab Konten ↔ Tugas | ✅ Done | Modal konfirmasi dengan Batal / Simpan |
| Perbaikan konten hilang setelah simpan + pindah tab | ✅ Fixed | Hydration stale & unmount panel diperbaiki |
| Inline rename judul lesson + save langsung ke API | ✅ Done | Input + tombol ✓ in-place; `PUT /lessons/:uid` |
| TipTap toolbar redesign (grouping lama dipertahankan) | ✅ Done | Layout dua baris, komponen menu diekstrak |
| Sticky bar mobile (Simpan/Hapus kontekstual) | ✅ Done | Lesson vs tugas sesuai tab |
| Student module viewer — assignment & reading | ✅ Done | Halaman kerja tugas, riwayat submit, mark-as-read |

---

## Fase A — Admin Assignment (Tugas Lesson)

**Tujuan:** Mentor/admin mengelola tugas per lesson dari tab **Tugas** di course editor.

**Yang dibuat:**

| Layer | Path |
|-------|------|
| Rules & validation | `lib/course-edit/homework-rules.ts`, `lib/course-edit/persist-assignment.ts` |
| Types & mapper | `lib/types/lesson.ts`, `lib/course-edit/homework.ts` |
| Service | `services/lesson-assignment-admin.ts` |
| Hooks | `hooks/use-lesson-assignment-admin.ts`, `hooks/use-homework-panel-controller.ts` |
| UI | `editor/LessonHomeworkPanel.tsx`, `editor/AssignmentRulesSection.tsx`, `editor/homework/*` |

**API yang dipakai:**

```
GET    /lessons/:uid/assignment
POST   /lessons/:uid/assignment
PUT    /lessons/:uid/assignment
DELETE /lessons/:uid/assignment
```

**Hasil:** Tab Tugas menampilkan instruksi (teks/quiz), aturan pengumpulan, deadline, attachment, dan status assignment.

---

## Fase B — Save/Delete Kontekstual per Tab

**Tujuan:** Tombol **Simpan lesson / Hapus lesson** hanya relevan di tab Konten; **Simpan tugas / Hapus tugas** di tab Tugas.

**Perubahan utama:**

- Split dirty state di `use-course-edit-controller.ts`:
  - `modifiedLessons` → perubahan konten
  - `modifiedAssignmentLessons` → perubahan tugas (`patchAssignmentLesson`)
- Handler baru: `handleSaveCurrentAssignment`, `handleDeleteCurrentAssignment`
- `CourseEditStickySaveBar` (mobile) dan `CourseEditChrome` (desktop toolbar) membaca `editorTab`
- `HomeworkPanelActionBar` disederhanakan → hanya badge status (aksi dipusatkan ke toolbar/sticky bar)

**Hasil:** Satu set aksi konsisten di toolbar/sticky bar; tidak ada duplikasi tombol simpan di panel tugas.

---

## Fase C — Modal Unsaved saat Pindah Tab

**Tujuan:** Mencegah kehilangan draft saat pindah **Konten ↔ Tugas** tanpa simpan.

**Komponen baru:** `UnsavedEditorTabDialog.tsx`

**Alur:**

1. User edit di tab aktif (konten atau tugas)
2. Klik tab lain → modal muncul
3. **Batal** → tetap di tab saat ini
4. **Simpan lesson** / **Simpan tugas** → hit endpoint sesuai tab → pindah tab

**Navigasi lesson/modul:** `UnsavedLessonDialog` juga mempertimbangkan dirty konten **dan** tugas; **Simpan & lanjut** menyimpan keduanya jika perlu.

---

## Fase D — Bugfix: Konten Hilang Setelah Simpan dari Modal Tab

**Gejala:** Setelah konfirmasi simpan dari alert tab, konten lesson tampak kosong saat kembali ke tab Konten.

**Penyebab:**

1. Setelah `saveLesson`, `lastHydratedLessonRef` di-reset ke `null` sehingga effect hydration menimpa state dengan **cache API stale**
2. Panel Konten di-unmount saat pindah tab → TipTap remount dengan state yang salah

**Perbaikan:**

| File | Perubahan |
|------|-----------|
| `use-course-edit-controller.ts` | Set `lastHydratedLessonRef = result.nextLessonId` setelah save sukses |
| `lib/course-edit/mappers.ts` | `mergeLessonDetailFromApi()` — preserve field tugas saat hydrate detail |
| `CourseLessonWorkspace.tsx` | Panel Konten & Tugas tetap mounted (`hidden`), tidak conditional unmount |

---

## Fase E — Inline Rename Judul Lesson

**Tujuan:** UX rename lebih ringkas — klik pensil / **Ubah nama** → judul jadi input dengan tombol ✓ di dalam field.

**Komponen baru:** `editor/LessonTitleRenameField.tsx`

**Perilaku:**

| Platform | Trigger | UI |
|----------|---------|-----|
| Mobile | Ikon pensil di `CourseEditCompactHeader` | Title row → input inline + ✓ |
| Desktop | Tombol **Ubah nama** di `LessonEditorHeader` | Title row → input inline + ✓ |
| Keduanya | Enter / ✓ | Simpan; Escape | Batal |

**Tidak ada lagi:** section rename terpisah di bawah header (mobile) atau bar Simpan/Batal ekstra (desktop).

---

## Fase F — Rename Langsung Hit API

**Tujuan:** Tombol ✓ rename langsung persist ke backend, bukan hanya update lokal + tandai dirty.

**Implementasi (`handleRenameLesson`):**

- Lesson **sudah persisted** → `PUT /lessons/:uid` dengan `{ title }`
- Lesson **belum persisted** → `saveLesson()` dengan override title
- Gagal → revert title lokal + toast error
- Tombol ✓ menampilkan spinner saat request berjalan
- Rename **tidak** masuk `modifiedLessons`

---

## Fase G — TipTap Toolbar (Sesi Terkait)

**Tujuan:** Toolbar editor lebih rapi tanpa mengubah grouping fungsi yang sudah familiar.

**Perubahan:**

- Layout dua baris (block type + undo/redo; baris kedua grup list/block/insert/table/more)
- Ekstraksi: `TipTapInsertMenu`, `TipTapMoreMenu`, `TipTapTableControls`, `toolbar-primitives`
- Mark inline dipindah ke bubble menu (bukan bar utama)

**File:** `components/shared/TipTapToolbar.tsx`, `components/shared/tiptap/*`, `styles/tiptap-editor.css`

---

## Fase H — Student Module Viewer (Konteks Branch)

Perubahan paralel pada branch yang mendukung alur belajar siswa:

| Area | Path utama |
|------|------------|
| Assignment overview & work | `module-viewer/assignment/*` |
| Sidebar & footer lesson | `LessonSidebar.tsx`, `LessonSidebarPanel.tsx`, `LessonFooter.tsx` |
| Reading progress | `hooks/use-course-lesson-reading.ts`, `services/lesson-reading.ts` |
| Learning dashboard cards | `components/student/LearningSection.tsx`, `lib/learning/progress.ts` |

---

## File Utama yang Disentuh (Course Editor UX)

### Baru

```
curriculum/UnsavedEditorTabDialog.tsx
curriculum/editor/LessonTitleRenameField.tsx
curriculum/editor/AssignmentRulesSection.tsx
curriculum/editor/homework/*
hooks/use-homework-panel-controller.ts
hooks/use-lesson-assignment-admin.ts
lib/course-edit/homework-rules.ts
lib/course-edit/persist-assignment.ts
lib/course-edit/instruction-attachments.ts
lib/course-edit/datetime-local.ts
services/lesson-assignment-admin.ts
```

### Dimodifikasi signifikan

```
hooks/use-course-edit-controller.ts
curriculum/CourseEditShell.tsx
curriculum/CourseEditChrome.tsx
curriculum/CourseLessonWorkspace.tsx
curriculum/compact/CourseEditStickySaveBar.tsx
curriculum/compact/CourseEditCompactHeader.tsx
curriculum/editor/LessonEditorHeader.tsx
curriculum/editor/LessonHomeworkPanel.tsx
curriculum/UnsavedLessonDialog.tsx
editCourse.tsx
lib/course-edit/mappers.ts
lib/course-edit/types.ts
```

---

## QA Checklist Singkat (Course Editor)

### Q1 — Save kontekstual tab Konten

| | |
|---|---|
| **Langkah** | Buka lesson → tab Konten → edit teks → perhatikan sticky bar (mobile) / toolbar (desktop) |
| **Expected** | Tombol **Simpan lesson** + **Hapus lesson**; disabled jika belum ada perubahan |

### Q2 — Save kontekstual tab Tugas

| | |
|---|---|
| **Langkah** | Pindah ke tab Tugas → edit instruksi/aturan |
| **Expected** | Tombol berubah jadi **Simpan tugas** + **Hapus tugas** |

### Q3 — Modal unsaved pindah tab

| | |
|---|---|
| **Langkah** | Edit konten → klik tab Tugas tanpa simpan |
| **Expected** | Modal muncul; Batal = tetap Konten; Simpan lesson = API save + pindah tab |

### Q4 — Konten tidak hilang setelah simpan dari modal

| | |
|---|---|
| **Langkah** | Edit konten → pindah tab via modal → simpan → kembali ke Konten |
| **Expected** | Konten lesson tetap tampil lengkap |

### Q5 — Rename inline + API

| | |
|---|---|
| **Langkah** | Klik pensil (mobile) atau Ubah nama (desktop) → ubah judul → ✓ |
| **Expected** | Spinner di ✓; toast sukses; `PUT /lessons/:uid`; judul terupdate di outline |

### Q6 — Lesson belum persisted

| | |
|---|---|
| **Langkah** | Buat lesson baru → rename sebelum simpan konten |
| **Expected** | Lesson di-create/persist dengan title baru (bukan hanya lokal) |

---

## Known Issues / Catatan

- Lesson baru tanpa `uid` tidak bisa simpan tugas sebelum lesson pertama kali di-persist (badge **Simpan lesson dulu** di panel tugas).
- Publish course & navigasi modul/lesson tetap memakai flow unsaved dialog terpisah dari tab dialog.
- Branch memuat perubahan student viewer & assignment yang luas di luar scope checklist editor di atas.

---

## Draft Commit Message

```
feat(course-editor): tab-aware save, assignment panel, and inline lesson rename

Split lesson vs assignment dirty state so Konten/Tugas tabs show the correct
save and delete actions. Add unsaved tab guard, fix post-save content loss on
tab switch, and persist lesson title immediately on inline rename via API.
Includes admin homework CRUD, TipTap toolbar cleanup, and student assignment
viewer foundations on the same branch.
```

### Alternatif (scope lebih sempit — hanya UX editor sesi ini)

```
feat(course-editor): contextual tab save, unsaved guard, and inline rename API

Wire Simpan/Hapus lesson vs tugas by editor tab, block tab switches with
unsaved changes, fix stale hydration wiping content after save, and save
lesson titles inline through PUT /lessons/:uid.
```
