# Admin Backend Gaps (Legacy)

> **Dokumen ini sudah digantikan.** Gunakan dokumentasi terbaru di:
>
> - [../README.md](../README.md) — indeks & ringkasan eksekutif
> - [../page-coverage.md](../page-coverage.md) — status per halaman
> - [../api-route-gaps.md](../api-route-gaps.md) — endpoint yang belum ada
> - [../payload-gaps.md](../payload-gaps.md) — ketidakselarasan request/response
> - [../priority-backlog.md](../priority-backlog.md) — urutan prioritas untuk PM

---

## Perubahan sejak versi lama dokumen ini

| Topik | Status lama (salah/ketinggalan) | Status sekarang |
|-------|-----------------------------------|-----------------|
| User management (`/admin/users/*`) | "masih mock" | ✅ **Live** — `GET /user/manage/all`, PATCH role, DELETE |
| Course categories/types admin | "belum ada halaman" | ✅ **Live** — `/admin/course-categories`, `/admin/course-types` |
| Admin courses list | "masih mock" | ✅ **Live** — `GET /courses` |
| Admin course detail | "masih mock" | 🟡 **Partial** — API live, gap attendance & unassign mentor |
| Assign mentor | belum disebut | ✅ **Live** — `POST /courses/:id/mentors/assign` |

Gap yang **masih valid** dari dokumen lama:

- Dashboard KPI, tickets, recent transactions — mock
- Financial analytics — mock
- Admin transactions — mock (`GET /payment` bukan list)
- Reviews & Q&A — mock + route unregistered
- `PUT /courses/:id` — belum ada di BE
- Audit logs — belum ada
