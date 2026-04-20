# Katalog fitur aplikasi Web DU (frontend)

Dokumen ini merangkum **seluruh area fitur** yang tercermin di codebase [`frontend/src/`](../../src/), termasuk lesson (TipTap, video, quiz), beserta status umum (**mock / localStorage / siap API**).

**Detail API:** [api/route-map.md](../api/route-map.md) · **Lesson:** [lesson/README.md](../lesson/README.md).

---

## 1. Autentikasi & sesi

| Fitur                   | Lokasi                                       | Catatan                       |
| ----------------------- | -------------------------------------------- | ----------------------------- |
| Login email/password    | `app/auth/login`                             | Backend `POST /login`         |
| Register                | `app/auth/register`                          | Backend `POST /register`      |
| Forgot / reset password | `app/auth/forgot-password`, `reset-password` | UI; endpoint backend opsional |
| OAuth Google            | Backend `/oauth/google/*`                    | Redirect                      |
| Guest session           | `lib/auth/guest-session.ts`                  | Hanya `localStorage` + event  |

---

## 2. Peran: Student (`/student/*`)

| Area         | Fitur                                      | Data                                           |
| ------------ | ------------------------------------------ | ---------------------------------------------- |
| Dashboard    | Ringkasan belajar                          | Mock repository                                |
| My Learning  | Daftar kursus diikuti, detail modul/lesson | Mock + API target `GET /courses`, `/user/data` |
| Assignments  | Daftar tugas, submit                       | Mock + [types assignment](../../src/lib/types) |
| Browse       | Katalog                                    | `GET /courses`                                 |
| Certificates | Daftar sertifikat                          | Mock                                           |
| Transactions | Riwayat bayar                              | `GET /payment`                                 |

---

## 3. Peran: Mentor (`/mentor/*`)

| Area              | Fitur                                             | Data                                                                                                           |
| ----------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Dashboard         | Jadwal, stat                                      | Mock                                                                                                           |
| Courses           | Daftar, buat kursus, hub per kursus               | Seed + `mentorCourseStorage`                                                                                   |
| **Course editor** | Modul & **lesson** tipe **TipTap / video / quiz** | **localStorage** `mentor_course_modules_v2_*` — lihat [lesson/02](../lesson/02-frontend-wysiwyg-quiz-video.md) |
| Attendance        | Monitoring (UI)                                   | Mock + API admin attendance                                                                                    |
| Assignments       | Kelola tugas (UI)                                 | Mock                                                                                                           |

---

## 4. Peran: Admin (`/admin/*`)

| Area         | Fitur                                |
| ------------ | ------------------------------------ |
| Dashboard    | KPI, chart (mock)                    |
| Users        | Students, mentors, administrators    |
| Courses      | Katalog, **Reviews & Q&A** (mock QA) |
| Transactions | Pembayaran (mock agregat)            |
| Financial    | Laporan (mock)                       |

---

## 5. Publik & shared

| Fitur          | Rute                                  | Catatan             |
| -------------- | ------------------------------------- | ------------------- |
| Landing kursus | `/course/[uid]`, `/course/[uid]/view` | Detail + preview    |
| Checkout       | `/checkout/[slug]`, invoice           | Payment API         |
| Profil         | `/profile`                            | `GET/PATCH /user/*` |
| Not found      | `not-found`                           | 404 Next            |

---

## 6. Lesson — ringkasan kemampuan produk

| Kemampuan         | Frontend                                              | Backend DB                                           |
| ----------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Teks kaya WYSIWYG | TipTap — HTML / bisa diserialisasi ke `content` jsonb | Kolom `content` JSONB                                |
| Video             | URL + deskripsi opsional                              | `video_url` + `content`                              |
| Quiz              | Soal pilihan ganda + passing score                    | Hanya di JSON `content` (atau tabel terpisah usulan) |
| Jadwal sesi       | —                                                     | `start_time`, `end_time`                             |
| Absensi           | —                                                     | `lesson_attendances`                                 |

---

## 7. Diagram fitur tinggi

```mermaid
flowchart TB
  subgraph auth [Auth]
    L[Login]
    R[Register]
    O[OAuth]
  end
  subgraph roles [Peran]
    S[Student]
    M[Mentor]
    A[Admin]
  end
  subgraph core [Inti pembelajaran]
    C[Courses]
    Mod[Modules]
    Les[Lessons TipTap Video Quiz]
    En[Enrollments]
    Pay[Payments]
  auth --> roles
  roles --> core
  Les --> Att[Attendance]
```

---

## 8. Referensi dokumen per folder

| Folder                            | README                                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Lesson                            | [lesson/README.md](../lesson/README.md)                                                                                    |
| API                               | [api/README.md](../api/README.md)                                                                                          |
| Database                          | [database/README.md](../database/README.md)                                                                                |
| Student / Admin / Mentor / Shared | [student](../student/README.md), [admin](../admin/README.md), [mentor](../mentor/README.md), [shared](../shared/README.md) |
