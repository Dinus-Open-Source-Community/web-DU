# Matriks Keamanan Halaman

Audit attack surface per halaman di `src/pages/` — Juni 2026, branch `features/frontend-sapto`.

**Legenda route guard:** `Public` = tanpa `RouteGuard` · `Role:X` = `RouteGuard` dengan role tertentu

---

## Public & Landing

| Route | Page | Guard | User Input | API / External | Risiko Utama |
|-------|------|-------|------------|----------------|--------------|
| `/` | `landing/Home.tsx` | Public | — | Featured courses API | Rendah — read-only |
| `/course` | `landing/Course.tsx` | Public | Search, filter kategori | `GET /courses` | Rendah |
| `/course/:courseUid` | `courses/detail.tsx` | Public | Tab query (`nuqs`) | `GET /courses/:uid` | Rendah — konten publik katalog |
| `/course/:courseUid/view` | `courses/view.tsx` | **Role: student, mentor, admin** | `?lesson=`, `?pane=` | Course + modules + lessons | **Medium** — konten lesson HTML; BE wajib enforce enrollment |

---

## Auth

| Route | Page | Guard | User Input | API / External | Risiko Utama |
|-------|------|-------|------------|----------------|--------------|
| `/auth/login` | `auth/Login.tsx` | Public | email, password | `POST /login` | Rendah — redirect divalidasi `isSafeInternalPath()` |
| `/auth/register` | `auth/Register.tsx` | Public | name, email, password | `POST /register` | Rendah — Zod validation |
| `/auth/oauth/callback` | `auth/Oauth.tsx` | Public | `?token=`, `?expires_at=`, `?error=` | `GET /user/data` | **High** — JWT di URL query (partial: query di-strip FE; full fix butuh BE) |
| `/auth/forgot-password` | `auth/ForgotPass.tsx` | Public | email | **Tidak ada API** | **Medium** — UX palsu (success tanpa kirim email) |
| `/auth/reset-password` | `auth/ResetPass.tsx` | Public | password, `?token=` | **Tidak ada API** | **Medium** — reset tidak fungsional; token tidak divalidasi |

---

## Profile

| Route | Page | Guard | User Input | API / External | Risiko Utama |
|-------|------|-------|------------|----------------|--------------|
| `/profile` | `profile/Profile.tsx` | Role: student, mentor, admin | nama, email, deskripsi, avatar file, password | `PATCH /user/profile`, `POST /avatar`, change password | Rendah–Medium — avatar validated (type/size); password schema OK |

---

## Admin

| Route | Page | Guard | User Input | API / External | Risiko Utama |
|-------|------|-------|------------|----------------|--------------|
| `/admin/dashboard` | `admin/Dashboard.tsx` | Role: admin | — | Mock / partial API | Rendah — data mock |
| `/admin/users/students` | `admin/Student.tsx` | Role: admin | search, pagination, role change, delete | `GET/PATCH/DELETE /user/manage/*` | **Medium** — aksi destruktif; proteksi BE wajib |
| `/admin/users/students/:userUid` | `admin/StudentDetail.tsx` | Role: admin | — | User detail API | **Medium** — IDOR jika BE tidak cek admin |
| `/admin/users/mentors` | `admin/Mentors.tsx` | Role: admin | sama | User manage API | Medium |
| `/admin/users/mentors/:userUid` | `admin/MentorDetail.tsx` | Role: admin | — | User detail | Medium |
| `/admin/users/administrators` | `admin/Admin.tsx` | Role: admin | filter role | `?role=admin` | Medium — `super_admin` tidak tampil |
| `/admin/users/administrators/:userUid` | `admin/AdministratorDetail.tsx` | Role: admin | — | User detail | Medium |
| `/admin/courses` | `admin/Courses.tsx` | Role: admin | filter, search | `GET /courses` | Rendah |
| `/admin/courses/:courseUid` | `admin/DetailCourse.tsx` | Role: admin | tab, moderasi | course, students, modules | Medium — rich HTML preview |
| `/admin/courses/:courseUid/edit` | `admin/CourseEdit.tsx` | Role: admin | TipTap HTML, file upload | modules/lessons CRUD | **Medium** — stored XSS jika tidak sanitize saat render |
| `/admin/courses/.../submissions/*` | `admin/AssignmentSubmissions.tsx`, `AssignmentSubmissionDetail.tsx` | Role: admin | grade, feedback | submission API | Medium — submission HTML render |
| `/admin/course-categories` | `admin/CourseCategories.tsx` | Role: admin | CRUD form | categories API | Rendah |
| `/admin/course-types` | `admin/CourseTypes.tsx` | Role: admin | CRUD form | types API | Rendah |
| `/admin/transactions` | `admin/Transactions.tsx` | Role: admin | filter | Mock | Rendah — belum live |
| `/admin/financial` | `admin/Financial.tsx` | Role: admin | — | Mock | Rendah |
| `/admin/reviews-and-qa` | `admin/ReviewsQA.tsx` | Role: admin | `?courseUid=`, reply text | `GET/POST /admin/reviews`, `/admin/qna` | Medium — UGC review/Q&A; XSS stored |

---

## Mentor

| Route | Page | Guard | User Input | API / External | Risiko Utama |
|-------|------|-------|------------|----------------|--------------|
| `/mentor/dashboard` | `mentor/Dashboard.tsx` | Role: mentor, **admin** | — | Mock | Rendah |
| `/mentor/courses` | `mentor/Courses.tsx` | Role: mentor, admin | — | Mock | Rendah |
| `/mentor/courses/:courseUid` | `mentor/DetailCourse.tsx` | Role: mentor, admin | tab | Mock (belum live) | Medium — admin bisa akses semua mentor route |
| `/mentor/courses/:courseUid/edit` | `mentor/CourseEdit.tsx` | Role: mentor, admin | TipTap, upload | CRUD | Medium — sama admin edit |
| `/mentor/courses/.../submissions/*` | `mentor/AssignmentSubmissions.tsx`, `AssignmentSubmissionDetail.tsx` | Role: mentor, admin | grade | submission API | Medium — ownership course harus di BE |
| `/mentor/courses/:courseUid/assignments` | `mentor/CourseAssignments.tsx` | Role: mentor, admin | — | Mock | Rendah |

---

## Student

| Route | Page | Guard | User Input | API / External | Risiko Utama |
|-------|------|-------|------------|----------------|--------------|
| `/student/dashboard` | `student/Dashboard.tsx` | Role: student | — | `GET /user/data` | Rendah |
| `/student/learning` | `student/Learning.tsx` | Role: student | — | joined courses | Rendah |
| `/student/learning/course/:courseUid` | `courses/view.tsx` | Role: student | lesson nav | course + modules | Medium — lesson HTML XSS |
| `/student/browse` | `student/BrowseCourse.tsx` | Role: student | search (deferred) | `GET /courses` | Rendah |
| `/student/assignments` | `student/Assignments.tsx` | Role: student | — | Mock | Rendah |
| `/student/certificates` | `student/Certificates.tsx` | Role: student | — | Mock | Rendah |
| `/student/transactions` | `student/Transactions.tsx` | Role: student | filter | `transaction_history` | Rendah |
| `/student/transactions/payment` | `student/TransactionPayment.tsx` | Role: student | `?reference=`, `?merchant_ref=` | `GET /payment/tripay` | **Medium** — IDOR jika BE tidak cek ownership |
| `/checkout/:courseUid` | `checkout/Checkout.tsx` | Role: student | payment method | join + `POST /payment` | **High** — amount dari client |

---

## Attack Surface per Kategori

### Autentikasi / Session

| Komponen | File | Catatan |
|----------|------|---------|
| Token storage | `providers/auth-provider.tsx`, `services/axios.ts` | Cookie `du_access_token` via `js-cookie` — **bukan httpOnly** |
| Role storage | `auth-provider.tsx` | Cookie `du_auth_role` terpisah dari token |
| Route guard | `providers/route-guard.tsx` | Cek token expiry + role whitelist |
| OAuth | `pages/auth/Oauth.tsx` | Token dari query string |

### File terproteksi

| Komponen | File | Catatan |
|----------|------|---------|
| Parse URL | `lib/files/parse-protected-file-reference.ts` | Whitelist origin backend ✅ |
| Batch fetch | `services/file-proxy.ts` | Max 50 objek ✅ |
| Download | `lib/files/download-protected-file.ts` | Reject jika parse null ✅ |
| Invoice | `use-invoice-download.ts` | `user_id` di query params |

### Rich content (XSS surface)

| Komponen | File |
|----------|------|
| Lesson reader | `components/courses/module-viewer/LessonContent.tsx` |
| Assignment instructions | `AssignmentWorkInstructions.tsx`, `LessonAssignmentOverview.tsx` |
| Submission view | `SubmissionContent.tsx`, `AssignmentTextSubmissionView.tsx` |
| Payment steps | `PaymentInstructions.tsx` |
| Course overview | `CourseDetailOverviewTab.tsx` |
| Sanitizer | `lib/security/sanitize-html.ts`, `components/shared/SanitizedHtml.tsx` |

---

## Halaman yang Sudah Diverifikasi Bersih (temuan rendah/none)

- `Register.tsx` — Zod + tidak ada redirect bebas
- `BrowseCourse.tsx` — read-only, deferred search
- `CourseCategories.tsx` / `CourseTypes.tsx` — CRUD dengan validasi form
- `Certificates.tsx` — mock kosong, tidak ada input

---

## Area yang Perlu Verifikasi Runtime / BE

| Skenario | Halaman | Mengapa FE tidak cukup |
|----------|---------|------------------------|
| Akses lesson tanpa enrollment | `/course/:uid/view` | Route publik; BE harus return 403 |
| Lihat payment orang lain | `/student/transactions/payment?reference=` | BE harus filter by user |
| Download invoice user lain | Transactions → download | BE harus abaikan `user_id` mismatch |
| Mentor edit course bukan miliknya | `/mentor/courses/:uid/edit` | BE harus cek assignment mentor |
| Payment amount manipulation | `/checkout/:uid` | BE harus hitung ulang dari course price |

---

*Matriks ini melengkapi [integration-status.md](../progress/integration-status.md) (status integrasi) dengan lensa keamanan.*
