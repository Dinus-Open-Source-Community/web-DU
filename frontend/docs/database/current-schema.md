# Skema database backend (referensi singkat)

Dokumentasi **lengkap** kolom, tipe, relasi, dan ERD untuk **skema saat ini** dipindahkan ke:

**[current-schema-full.md](./current-schema-full.md)**

Isi file tersebut mencakup:

- ERD Mermaid 10 tabel hasil `AutoMigrate`
- Daftar kolom per tabel (`users`, `events`, `courses`, `modules`, `lessons`, `enrollments`, `payments`, `course_reviews`, `course_announcements`, `lesson_attendances`)
- Catatan relasi (`payments` hanya lewat `enrollment_id`)

Untuk **perbandingan skema lama vs target** (tambahan untuk frontend), lihat **[evolution-old-vs-new.md](./evolution-old-vs-new.md)** dan **[proposed-schema-target.md](./proposed-schema-target.md)**.
