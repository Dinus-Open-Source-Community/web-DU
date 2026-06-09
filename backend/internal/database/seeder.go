package database

import (
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RunSeeder menjalankan semua seeder untuk database secara berurutan.
//
// Catatan terkait sistem enkripsi:
//   - Field sensitif (User.Name/Email/Description, Course.Title/Subtitle/Description,
//     Module/Lesson/LessonAssignment.Title, dst.) tidak perlu di-Encrypt manual karena
//     hook BeforeSave pada masing-masing entity akan mengenkripsi ciphertext sebelum
//     ditulis ke DB. Seeder cukup mengirim plaintext.
//   - Lookup idempotent menggunakan kolom yang TIDAK dienkripsi (uid, email_hash,
//     slug, name untuk CourseCategory/ClassType, atau order_index). Mencari berdasar
//     kolom terenkripsi seperti title atau email tidak akan pernah cocok karena
//     AES-GCM bersifat non-deterministik (ciphertext berbeda tiap enkripsi).
func RunSeeder(db *gorm.DB) {
	log.Println("[Seeder] Memulai proses seeding database...")

	seedUsers(db)
	seedCourseCategories(db)
	seedClassTypes(db)
	seedCourses(db)
	seedEnrollments(db)
	seedPayments(db)
	seedCourseReviews(db)
	seedCourseQaThreads(db)
	seedModules(db)
	seedLessons(db)
	seedLessonAssignments(db)
	seedLessonReadings(db)
	seedLessonAttendances(db)
	seedLessonAssignmentSubmissions(db)

	log.Println("[Seeder] Seeding database selesai!")
}

func seedCourseCategories(db *gorm.DB) {
	log.Println("[Seeder] Seeding Course Categories...")

	categories := []entity.CourseCategory{
		{Name: "Web Development", Description: "Kategori untuk course pengembangan web", IsActive: true},
		{Name: "Backend", Description: "Kategori untuk course backend development", IsActive: true},
		{Name: "DevOps", Description: "Kategori untuk course devops dan deployment", IsActive: true},
	}

	for _, category := range categories {
		var existing entity.CourseCategory
		err := db.Where("name = ?", category.Name).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&category).Error; err != nil {
				log.Printf("[Error] Gagal membuat category %s: %v", category.Name, err)
				continue
			}
			log.Printf("[Success] Category %s berhasil dibuat", category.Name)
		} else if err != nil {
			log.Printf("[Error] Gagal cek category %s: %v", category.Name, err)
		}
	}
}

func seedClassTypes(db *gorm.DB) {
	log.Println("[Seeder] Seeding Class Types...")

	classTypes := []entity.ClassType{
		{Name: "Bootcamp", Description: "Kelas intensif dengan project", IsActive: true},
		{Name: "Self-paced", Description: "Kelas mandiri sesuai kecepatan belajar", IsActive: true},
		{Name: "Workshop", Description: "Kelas singkat berbasis praktik", IsActive: true},
	}

	for _, classType := range classTypes {
		var existing entity.ClassType
		err := db.Where("name = ?", classType.Name).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&classType).Error; err != nil {
				log.Printf("[Error] Gagal membuat class type %s: %v", classType.Name, err)
				continue
			}
			log.Printf("[Success] Class type %s berhasil dibuat", classType.Name)
		} else if err != nil {
			log.Printf("[Error] Gagal cek class type %s: %v", classType.Name, err)
		}
	}
}

// seedUsers membuat user data default (super admin, admin, mentor, dan student).
// Idempoten: lookup memakai email_hash (HMAC deterministik) sehingga tetap berfungsi
// meskipun kolom email pada DB sudah berisi ciphertext AES-GCM yang non-deterministik.
func seedUsers(db *gorm.DB) {
	log.Println("[Seeder] Seeding Users...")

	type seedUser struct {
		Name        string
		Email       string
		Password    string
		Role        entity.UserRole
		IsVerified  bool
		AvatarURL   string
		Description string
	}

	users := []seedUser{
		{
			Name:        "Super Admin User",
			Email:       "superadmin@doscom.id",
			Password:    "superadmin123",
			Role:        entity.SuperAdminRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=12",
			Description: "Super administrator dari platform DU",
		},
		{
			Name:        "Admin User",
			Email:       "admin@doscom.id",
			Password:    "admin123",
			Role:        entity.AdminRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=32",
			Description: "Administrator dari platform DU",
		},
		{
			Name:        "Budi Santoso",
			Email:       "budi@doscom.id",
			Password:    "student123",
			Role:        entity.StudentRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=14",
			Description: "Mahasiswa Dinus yang aktif belajar",
		},
		{
			Name:        "Siti Nurhaliza",
			Email:       "siti@doscom.id",
			Password:    "student123",
			Role:        entity.StudentRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=47",
			Description: "Mahasiswa berprestasi di bidang teknologi",
		},
		{
			Name:        "Andi Pratama",
			Email:       "andi.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=15",
			Description: "Mentor backend dan arsitektur sistem",
		},
		{
			Name:        "Rina Kurnia",
			Email:       "rina.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=44",
			Description: "Mentor frontend dan UI engineering",
		},
		{
			Name:        "Dimas Saputra",
			Email:       "dimas.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=11",
			Description: "Mentor DevOps dan cloud deployment",
		},
		{
			Name:        "Nadia Putri",
			Email:       "nadia.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://i.pravatar.cc/150?img=49",
			Description: "Mentor database dan data engineering",
		},
	}

	for _, u := range users {
		emailHash := utils.GenerateBlindIndex(u.Email)

		hashedPassword, err := utils.HashPassword(u.Password)
		if err != nil {
			log.Printf("[Error] Gagal hash password user %s: %v", u.Name, err)
			continue
		}

		var existing entity.User
		err = db.Where("email_hash = ?", emailHash).First(&existing).Error
		if err == nil {
			// User sudah ada — sinkronkan field penting menggunakan db.Save agar
			// hook BeforeSave pada User mengenkripsi ulang Name/Email/Description
			// secara konsisten. AfterFind sudah men-dekripsi field saat First()
			// di atas sehingga existing.Name/Email/Description berbentuk plaintext;
			// kita timpa langsung dengan plaintext baru lalu Save.
			existing.Name = u.Name
			existing.Email = u.Email
			existing.EmailHash = emailHash
			existing.Password = hashedPassword
			existing.Role = u.Role
			existing.IsVerified = u.IsVerified
			existing.AvatarURL = u.AvatarURL
			existing.Description = u.Description

			if err := db.Save(&existing).Error; err != nil {
				log.Printf("[Warning] Gagal update user seed %s: %v", u.Name, err)
				continue
			}
			log.Printf("[Info] User seed %s diperbarui (termasuk role)", u.Name)
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek user %s: %v", u.Name, err)
			continue
		}

		// User belum ada — buat baru. Hook BeforeSave akan mengenkripsi
		// Name/Email/Description sebelum data ditulis ke DB; kita cukup
		// mengirim plaintext.
		user := entity.User{
			Name:        u.Name,
			Email:       u.Email,
			EmailHash:   emailHash,
			Password:    hashedPassword,
			Role:        u.Role,
			IsVerified:  u.IsVerified,
			AvatarURL:   u.AvatarURL,
			Description: u.Description,
		}

		if err := db.Create(&user).Error; err != nil {
			log.Printf("[Error] Gagal membuat user %s: %v", u.Name, err)
		} else {
			log.Printf("[Success] User %s berhasil dibuat", u.Name)
		}
	}
}

// seedCourses membuat 5 course awal. Lookup idempotent menggunakan slug yang
// disimpan plaintext (slug dipakai untuk routing dan tidak dienkripsi).
func seedCourses(db *gorm.DB) {
	log.Println("[Seeder] Seeding Courses...")

	var mentor entity.User
	if err := db.Where("role != ?", entity.StudentRole).First(&mentor).Error; err != nil {
		log.Printf("[Error] Mentor tidak ditemukan: %v", err)
		return
	}

	admin, err := findSeedUserByEmail(db, "admin@doscom.id")
	if err != nil {
		log.Printf("[Error] Admin seed tidak ditemukan untuk created_by_uid: %v", err)
		return
	}
	createdByUID := admin.Uid

	var categories []entity.CourseCategory
	if err := db.Order("name ASC").Find(&categories).Error; err != nil || len(categories) == 0 {
		log.Printf("[Error] Category tidak ditemukan: %v", err)
		return
	}

	var classTypes []entity.ClassType
	if err := db.Order("name ASC").Find(&classTypes).Error; err != nil || len(classTypes) == 0 {
		log.Printf("[Error] Class type tidak ditemukan: %v", err)
		return
	}

	learningPoints, _ := json.Marshal([]string{"Pengenalan konsep utama", "Studi kasus dunia nyata"})

	courses := []entity.Course{
		{
			MentorUid:     &mentor.Uid,
			CreatedByUid:  &createdByUID,
			CategoryUid:   &categories[0].Uid,
			ClassTypeUid: &classTypes[0].Uid,
			Title:        "Golang Fundamentals",
			Subtitle:     "Belajar Go dari dasar hingga siap produksi",
			Slug:         "golang-fundamentals",
			Description:  "Pelajari dasar-dasar bahasa pemrograman Go dari nol hingga mahir",
			Level:        entity.CourseLevelPemula,
			WhatYouLearn: learningPoints,
			CoverURL:     "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&h=300&q=80",
			ThumbnailURL: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&h=300&q=80",
			Price:        299000,
			PriceStrike:  399000,
			IsPremium:    true,
			IsPublished:  true,
			Status:       entity.CourseStatusActive,
			Slot:         30,
		},
		{
			MentorUid:     &mentor.Uid,
			CreatedByUid:  &createdByUID,
			CategoryUid:   &categories[0].Uid,
			ClassTypeUid:  &classTypes[1].Uid,
			Title:         "Web Development dengan Next.js",
			Subtitle:     "Bangun aplikasi modern dengan Next.js",
			Slug:         "web-development-nextjs",
			Description:  "Buat aplikasi web modern menggunakan Next.js dan React",
			Level:        entity.CourseLevelMenengah,
			WhatYouLearn: learningPoints,
			CoverURL:     "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&h=300&q=80",
			ThumbnailURL: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&h=300&q=80",
			Price:        349000,
			PriceStrike:  449000,
			IsPremium:    true,
			IsPublished:  true,
			Status:       entity.CourseStatusActive,
			Slot:         25,
		},
		{
			MentorUid:     &mentor.Uid,
			CreatedByUid:  &createdByUID,
			CategoryUid:   &categories[1].Uid,
			ClassTypeUid:  &classTypes[1].Uid,
			Title:         "Database Design dan SQL",
			Subtitle:     "Rancang skema DB yang scalable",
			Slug:         "database-design-sql",
			Description:  "Desain database yang efisien dan kuasai SQL untuk berbagai kebutuhan",
			Level:        entity.CourseLevelPemula,
			WhatYouLearn: learningPoints,
			CoverURL:     "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&h=300&q=80",
			ThumbnailURL: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&h=300&q=80",
			Price:        279000,
			PriceStrike:  329000,
			IsPremium:    false,
			IsPublished:  true,
			Status:       entity.CourseStatusActive,
			Slot:         40,
		},
		{
			MentorUid:     &mentor.Uid,
			CreatedByUid:  &createdByUID,
			CategoryUid:   &categories[1].Uid,
			ClassTypeUid:  &classTypes[2].Uid,
			Title:         "REST API Development",
			Subtitle:     "Bangun API robust dan aman",
			Slug:         "rest-api-development",
			Description:  "Buat REST API yang robust dan scalable menggunakan best practices",
			Level:        entity.CourseLevelMenengah,
			WhatYouLearn: learningPoints,
			CoverURL:     "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&h=300&q=80",
			ThumbnailURL: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&h=300&q=80",
			Price:        299000,
			PriceStrike:  379000,
			IsPremium:    true,
			IsPublished:  true,
			Status:       entity.CourseStatusActive,
			Slot:         35,
		},
		{
			MentorUid:     &mentor.Uid,
			CreatedByUid:  &createdByUID,
			CategoryUid:   &categories[2].Uid,
			ClassTypeUid:  &classTypes[0].Uid,
			Title:         "DevOps Essentials",
			Subtitle:     "Deploy aplikasi dengan pipeline modern",
			Slug:         "devops-essentials",
			Description:  "Pelajari deployment, Docker, dan CI/CD pipeline untuk production",
			Level:        entity.CourseLevelLanjutan,
			WhatYouLearn: learningPoints,
			CoverURL:     "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&h=300&q=80",
			ThumbnailURL: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&h=300&q=80",
			Price:        329000,
			PriceStrike:  429000,
			IsPremium:    true,
			IsPublished:  true,
			Status:       entity.CourseStatusActive,
			Slot:         20,
		},
	}

	for _, course := range courses {
		var existing entity.Course
		err := db.Where("slug = ?", course.Slug).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&course).Error; err != nil {
				log.Printf("[Error] Gagal membuat course %s: %v", course.Title, err)
				continue
			}
			log.Printf("[Success] Course %s berhasil dibuat", course.Title)
		} else if err != nil {
			log.Printf("[Error] Gagal cek course %s: %v", course.Slug, err)
		} else {
			patch := map[string]any{}
			if existing.CreatedByUid == nil {
				patch["created_by_uid"] = createdByUID
			}
			if existing.Status != entity.CourseStatusActive {
				patch["status"] = entity.CourseStatusActive
			}
			if len(patch) > 0 {
				if err := db.Model(&existing).Updates(patch).Error; err != nil {
					log.Printf("[Warning] Gagal patch course %s: %v", course.Slug, err)
				} else {
					log.Printf("[Info] course %s diperbarui (%v)", course.Slug, patch)
				}
			}
		}
	}
}

// seedEnrollments membuat enrollment awal untuk student seed.
// Idempoten: lookup (user_uid, course_uid) — tidak menimpa enrollment yang sudah ada.
// Hanya student yang sudah punya enrollment active/completed yang boleh memberikan
// review (seedCourseReviews memvalidasi hal ini).
func seedEnrollments(db *gorm.DB) {
	log.Println("[Seeder] Seeding Enrollments...")

	type seedEnrollment struct {
		StudentEmail string
		CourseSlug   string
		Progress     float64
		Status       entity.EnrollmentStatus
	}

	// Budi di-enroll ke 3 course aktif, Siti ke 4 course aktif + 1 pending checkout.
	enrollments := []seedEnrollment{
		{StudentEmail: "budi@doscom.id", CourseSlug: "golang-fundamentals", Progress: 75, Status: entity.EnrollmentActive},
		{StudentEmail: "budi@doscom.id", CourseSlug: "web-development-nextjs", Progress: 40, Status: entity.EnrollmentActive},
		{StudentEmail: "budi@doscom.id", CourseSlug: "database-design-sql", Progress: 55, Status: entity.EnrollmentActive},
		{StudentEmail: "budi@doscom.id", CourseSlug: "rest-api-development", Progress: 0, Status: entity.EnrollmentPending},
		{StudentEmail: "siti@doscom.id", CourseSlug: "golang-fundamentals", Progress: 90, Status: entity.EnrollmentActive},
		{StudentEmail: "siti@doscom.id", CourseSlug: "web-development-nextjs", Progress: 65, Status: entity.EnrollmentActive},
		{StudentEmail: "siti@doscom.id", CourseSlug: "rest-api-development", Progress: 30, Status: entity.EnrollmentActive},
		{StudentEmail: "siti@doscom.id", CourseSlug: "devops-essentials", Progress: 15, Status: entity.EnrollmentActive},
		{StudentEmail: "siti@doscom.id", CourseSlug: "database-design-sql", Progress: 0, Status: entity.EnrollmentPending},
	}

	for _, item := range enrollments {
		student, err := findSeedUserByEmail(db, item.StudentEmail)
		if err != nil {
			log.Printf("[Error] Siswa seed %s tidak ditemukan untuk enrollment: %v", item.StudentEmail, err)
			continue
		}

		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course slug %s tidak ditemukan untuk enrollment: %v", item.CourseSlug, err)
			continue
		}

		status := item.Status
		if status == "" {
			status = entity.EnrollmentActive
		}

		var existing entity.Enrollment
		err = db.Where("user_uid = ? AND course_uid = ?", student.Uid, course.Uid).First(&existing).Error
		if err == nil {
			updates := map[string]any{
				"progress": item.Progress,
				"status":   status,
			}
			if err := db.Model(&existing).Updates(updates).Error; err != nil {
				log.Printf("[Warning] Gagal update enrollment %s / %s: %v", item.StudentEmail, item.CourseSlug, err)
			}
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek enrollment %s / %s: %v", item.StudentEmail, item.CourseSlug, err)
			continue
		}

		enrollment := entity.Enrollment{
			UserUid:   student.Uid,
			CourseUid: course.Uid,
			Status:    status,
			Progress:  item.Progress,
		}
		if err := db.Create(&enrollment).Error; err != nil {
			log.Printf("[Error] Gagal membuat enrollment %s / %s: %v", item.StudentEmail, item.CourseSlug, err)
		} else {
			log.Printf("[Success] Enrollment %s untuk course %s berhasil dibuat", item.StudentEmail, item.CourseSlug)
		}
	}
}

// seedPayments membuat riwayat transaksi dummy untuk halaman admin (transactions,
// financial, dashboard). Idempoten: lookup transaction_id.
func seedPayments(db *gorm.DB) {
	log.Println("[Seeder] Seeding Payments...")

	now := time.Now()

	type seedPayment struct {
		StudentEmail  string
		CourseSlug    string
		TransactionID string
		Method        entity.PaymentMethod
		Status        entity.PaymentStatus
		DaysAgo       int
	}

	payments := []seedPayment{
		// Transaksi sukses tersebar 12 bulan terakhir untuk chart financial
		{StudentEmail: "budi@doscom.id", CourseSlug: "golang-fundamentals", TransactionID: "TRX-SEED-20250108-001", Method: "OVO", Status: entity.PaymentSuccess, DaysAgo: 330},
		{StudentEmail: "siti@doscom.id", CourseSlug: "golang-fundamentals", TransactionID: "TRX-SEED-20250215-002", Method: "DANA", Status: entity.PaymentSuccess, DaysAgo: 290},
		{StudentEmail: "budi@doscom.id", CourseSlug: "web-development-nextjs", TransactionID: "TRX-SEED-20250320-003", Method: "QRIS2", Status: entity.PaymentSuccess, DaysAgo: 250},
		{StudentEmail: "siti@doscom.id", CourseSlug: "web-development-nextjs", TransactionID: "TRX-SEED-20250405-004", Method: "BRIVA", Status: entity.PaymentSuccess, DaysAgo: 210},
		{StudentEmail: "budi@doscom.id", CourseSlug: "database-design-sql", TransactionID: "TRX-SEED-20250510-005", Method: "PERMATAVA", Status: entity.PaymentSuccess, DaysAgo: 170},
		{StudentEmail: "siti@doscom.id", CourseSlug: "rest-api-development", TransactionID: "TRX-SEED-20250601-006", Method: "OVO", Status: entity.PaymentSuccess, DaysAgo: 120},
		{StudentEmail: "siti@doscom.id", CourseSlug: "devops-essentials", TransactionID: "TRX-SEED-20250718-007", Method: "QRIS2", Status: entity.PaymentSuccess, DaysAgo: 75},
		// Transaksi terbaru untuk dashboard recent-transactions
		{StudentEmail: "budi@doscom.id", CourseSlug: "golang-fundamentals", TransactionID: "TRX-SEED-20250820-008", Method: "BNIVA", Status: entity.PaymentSuccess, DaysAgo: 14},
		{StudentEmail: "siti@doscom.id", CourseSlug: "web-development-nextjs", TransactionID: "TRX-SEED-20250902-009", Method: "DANA", Status: entity.PaymentSuccess, DaysAgo: 7},
		{StudentEmail: "siti@doscom.id", CourseSlug: "devops-essentials", TransactionID: "TRX-SEED-20250910-010", Method: "OVO", Status: entity.PaymentSuccess, DaysAgo: 3},
		// Pending & failed untuk ratio chart admin transactions
		{StudentEmail: "siti@doscom.id", CourseSlug: "database-design-sql", TransactionID: "TRX-SEED-20250915-011", Method: "PERMATAVA", Status: entity.PaymentPending, DaysAgo: 2},
		{StudentEmail: "budi@doscom.id", CourseSlug: "rest-api-development", TransactionID: "TRX-SEED-20250916-012", Method: "BCAVA", Status: entity.PaymentFailed, DaysAgo: 1},
	}

	for _, item := range payments {
		var existing entity.Payment
		if err := db.Where("transaction_id = ?", item.TransactionID).First(&existing).Error; err == nil {
			continue
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek payment %s: %v", item.TransactionID, err)
			continue
		}

		enrollment, err := findSeedEnrollment(db, item.StudentEmail, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Enrollment tidak ditemukan untuk payment %s: %v", item.TransactionID, err)
			continue
		}

		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course tidak ditemukan untuk payment %s: %v", item.TransactionID, err)
			continue
		}

		createdAt := now.AddDate(0, 0, -item.DaysAgo)
		enrollmentUID := enrollment.Uid
		payment := entity.Payment{
			EnrollmentUid: &enrollmentUID,
			Amount:        course.Price,
			Method:        item.Method,
			Status:        item.Status,
			TransactionID: item.TransactionID,
			CheckoutURL:   "https://tripay.co.id/checkout/seed-" + item.TransactionID,
			CreatedAt:     createdAt,
		}
		if item.Status == entity.PaymentSuccess {
			paidAt := createdAt.Add(2 * time.Hour)
			payment.PaidAt = &paidAt
		}

		if err := db.Create(&payment).Error; err != nil {
			log.Printf("[Error] Gagal membuat payment %s: %v", item.TransactionID, err)
			continue
		}
		// Pastikan timestamp historis tidak ditimpa autoCreateTime.
		updates := map[string]any{"created_at": createdAt}
		if payment.PaidAt != nil {
			updates["paid_at"] = *payment.PaidAt
		}
		if err := db.Model(&payment).Updates(updates).Error; err != nil {
			log.Printf("[Warning] Gagal set timestamp payment %s: %v", item.TransactionID, err)
		}
		log.Printf("[Success] Payment %s (%s) berhasil dibuat", item.TransactionID, item.Status)
	}
}

// terisi di API publik. Idempoten: lookup (user_uid, course_uid) — tidak menimpa
// review yang sudah ada.
func seedCourseReviews(db *gorm.DB) {
	log.Println("[Seeder] Seeding Course Reviews...")

	type seedReview struct {
		StudentEmail string
		CourseSlug   string
		Rating       int
		Comment      string
	}

	reviews := []seedReview{
		{
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "golang-fundamentals",
			Rating:       5,
			Comment:      "Materi Golang dijelaskan bertahap dan sangat mudah diikuti.",
		},
		{
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "golang-fundamentals",
			Rating:       4,
			Comment:      "Contoh kodenya membantu, tinggal ditambah latihan mandiri lagi.",
		},
		{
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "web-development-nextjs",
			Rating:       5,
			Comment:      "Struktur modul Next.js-nya rapi, cocok untuk yang sudah kenal React.",
		},
		{
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "web-development-nextjs",
			Rating:       5,
			Comment:      "Penjelasan SSR dan routing App Router sangat jelas.",
		},
		{
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "database-design-sql",
			Rating:       4,
			Comment:      "Konsep normalisasi dan query SQL-nya praktis untuk proyek nyata.",
		},
		{
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "rest-api-development",
			Rating:       3,
			Comment:      "Bagian autentikasi agak cepat, perlu dipelajari ulang beberapa kali.",
		},
		{
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "devops-essentials",
			Rating:       5,
			Comment:      "Pipeline CI/CD dan Docker dijelaskan dengan contoh yang bisa langsung dicoba.",
		},
	}


	for _, item := range reviews {
		student, err := findSeedUserByEmail(db, item.StudentEmail)
		if err != nil {
			log.Printf("[Error] Siswa seed %s tidak ditemukan untuk review: %v", item.StudentEmail, err)
			continue
		}
		if student.Role != entity.StudentRole {
			log.Printf("[Error] User %s bukan student, review dilewati", item.StudentEmail)
			continue
		}

		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course slug %s tidak ditemukan untuk review: %v", item.CourseSlug, err)
			continue
		}

		// Validasi: user harus memiliki enrollment yang bukan pending untuk course ini.
		// Hanya user dengan enrollment active/completed/cancelled yang boleh memberikan review
		// (status pending berarti pembayaran belum selesai diverifikasi).
		var activeEnrollment entity.Enrollment
		enrollErr := db.Where("user_uid = ? AND course_uid = ? AND status != ?",
			student.Uid, course.Uid, entity.EnrollmentPending).
			First(&activeEnrollment).Error
		if errors.Is(enrollErr, gorm.ErrRecordNotFound) {
			log.Printf("[Seeder] User %s tidak memiliki enrollment aktif untuk course %s, review dilewati", item.StudentEmail, item.CourseSlug)
			continue
		}
		if enrollErr != nil {
			log.Printf("[Error] Gagal cek enrollment %s / %s: %v", item.StudentEmail, item.CourseSlug, enrollErr)
			continue
		}

		var existing entity.CourseReview
		err = db.Where("user_uid = ? AND course_uid = ?", student.Uid, course.Uid).First(&existing).Error
		if err == nil {
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek review %s / %s: %v", item.StudentEmail, item.CourseSlug, err)
			continue
		}

		review := entity.CourseReview{
			UserUid:   student.Uid,
			CourseUid: course.Uid,
			Rating:    item.Rating,
			Comment:   item.Comment,
		}
		if err := db.Create(&review).Error; err != nil {
			log.Printf("[Error] Gagal membuat review %s / %s: %v", item.StudentEmail, item.CourseSlug, err)
			continue
		}
		log.Printf("[Success] Review %s untuk course %s berhasil dibuat", item.StudentEmail, item.CourseSlug)
	}

	seedCourseReviewReplies(db)
}

// seedCourseReviewReplies menambah balasan mentor pada review seed yang sudah ada.
// Idempoten: lookup (course_review_uid, replier_uid).
func seedCourseReviewReplies(db *gorm.DB) {
	log.Println("[Seeder] Seeding Course Review Replies...")

	type seedReply struct {
		StudentEmail string
		CourseSlug   string
		MentorEmail  string
		Comment      string
	}

	replies := []seedReply{
		{
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "golang-fundamentals",
			MentorEmail:  "andi.mentor@doscom.id",
			Comment:      "Terima kasih Budi! Senang materinya membantu perjalanan belajarmu.",
		},
		{
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "golang-fundamentals",
			MentorEmail:  "andi.mentor@doscom.id",
			Comment:      "Terima kasih Siti, saran latihan mandirinya akan kami pertimbangkan di update berikutnya.",
		},
		{
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "rest-api-development",
			MentorEmail:  "admin@doscom.id",
			Comment:      "Terima kasih feedbacknya Siti. Kami akan menambah modul latihan autentikasi di update berikutnya.",
		},
	}

	for _, item := range replies {
		student, err := findSeedUserByEmail(db, item.StudentEmail)
		if err != nil {
			log.Printf("[Error] Siswa seed %s tidak ditemukan untuk balasan review: %v", item.StudentEmail, err)
			continue
		}

		mentor, err := findSeedUserByEmail(db, item.MentorEmail)
		if err != nil {
			log.Printf("[Error] Mentor seed %s tidak ditemukan untuk balasan review: %v", item.MentorEmail, err)
			continue
		}

		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course slug %s tidak ditemukan untuk balasan review: %v", item.CourseSlug, err)
			continue
		}

		var review entity.CourseReview
		if err := db.Where("user_uid = ? AND course_uid = ?", student.Uid, course.Uid).First(&review).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Seeder] Review %s / %s belum ada, balasan dilewati", item.StudentEmail, item.CourseSlug)
			} else {
				log.Printf("[Error] Gagal mengambil review untuk balasan: %v", err)
			}
			continue
		}

		var existing entity.CourseReviewReply
		err = db.Where("course_review_uid = ? AND replier_uid = ?", review.Uid, mentor.Uid).First(&existing).Error
		if err == nil {
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek balasan review: %v", err)
			continue
		}

		reply := entity.CourseReviewReply{
			CourseReviewUid: review.Uid,
			ReplierUid:      mentor.Uid,
			Comment:         item.Comment,
		}
		if err := db.Create(&reply).Error; err != nil {
			log.Printf("[Error] Gagal membuat balasan review: %v", err)
			continue
		}
		log.Printf("[Success] Balasan mentor %s pada review %s / %s berhasil dibuat", item.MentorEmail, item.StudentEmail, item.CourseSlug)
	}
}

func seedCourseQaThreads(db *gorm.DB) {
	log.Println("[Seeder] Seeding Course Q&A Threads...")

	type seedQaReply struct {
		AuthorEmail string
		Body        string
	}

	type seedThread struct {
		SeedKey      string
		StudentEmail string
		CourseSlug   string
		Title        string
		Body         string
		Replies      []seedQaReply
	}

	threads := []seedThread{
		{
			SeedKey:      "qa-go-error-handling",
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "golang-fundamentals",
			Title:        "Bagaimana cara menangani error di Go?",
			Body:         "Saya bingung kapan pakai panic vs return error. Ada contoh praktisnya?",
			Replies: []seedQaReply{
				{
					AuthorEmail: "andi.mentor@doscom.id",
					Body:        "Untuk aplikasi production, lebih baik return error. Panic hanya untuk kondisi yang benar-benar tidak terduga.",
				},
			},
		},
		{
			SeedKey:      "qa-nextjs-rsc",
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "web-development-nextjs",
			Title:        "Perbedaan Server Component dan Client Component",
			Body:         "Kapan sebaiknya memakai masing-masing di Next.js App Router?",
			Replies: []seedQaReply{
				{
					AuthorEmail: "rina.mentor@doscom.id",
					Body:        "Gunakan Server Component untuk data fetching dan konten statis. Client Component untuk interaksi seperti form dan state.",
				},
			},
		},
		{
			SeedKey:      "qa-sql-index",
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "database-design-sql",
			Title:        "Kapan perlu menambahkan index di tabel?",
			Body:         "Apakah semua kolom foreign key wajib di-index?",
		},
		{
			SeedKey:      "qa-rest-jwt",
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "rest-api-development",
			Title:        "Best practice menyimpan JWT di frontend",
			Body:         "Lebih aman di httpOnly cookie atau localStorage?",
			Replies: []seedQaReply{
				{
					AuthorEmail: "admin@doscom.id",
					Body:        "Disarankan httpOnly cookie dengan SameSite=Lax/Strict. Hindari localStorage untuk token sensitif.",
				},
			},
		},
		{
			SeedKey:      "qa-devops-docker",
			StudentEmail: "siti@doscom.id",
			CourseSlug:   "devops-essentials",
			Title:        "Perbedaan Docker image dan container",
			Body:         "Saya masih bingung konsep image vs container saat deploy.",
		},
	}

	for _, item := range threads {
		student, err := findSeedUserByEmail(db, item.StudentEmail)
		if err != nil {
			log.Printf("[Error] Siswa seed %s tidak ditemukan untuk Q&A: %v", item.StudentEmail, err)
			continue
		}
		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course seed %s tidak ditemukan untuk Q&A: %v", item.CourseSlug, err)
			continue
		}

		if seedQaThreadExists(db, student.Uid, course.Uid, item.SeedKey) {
			continue
		}

		bodyWithMarker := item.Body + "\n\n<!-- seed:" + item.SeedKey + " -->"
		thread := entity.CourseQaThread{
			AuthorUid: student.Uid,
			CourseUid: course.Uid,
			Title:     item.Title,
			Body:      bodyWithMarker,
		}
		if err := db.Create(&thread).Error; err != nil {
			log.Printf("[Error] Gagal membuat Q&A thread: %v", err)
			continue
		}
		log.Printf("[Success] Q&A thread %s untuk course %s berhasil dibuat", item.Title, item.CourseSlug)

		for _, replySeed := range item.Replies {
			author, err := findSeedUserByEmail(db, replySeed.AuthorEmail)
			if err != nil {
				log.Printf("[Error] Author %s tidak ditemukan untuk balasan Q&A: %v", replySeed.AuthorEmail, err)
				continue
			}

			reply := entity.CourseQaReply{
				ThreadUid: thread.Uid,
				AuthorUid: author.Uid,
				Body:      replySeed.Body,
			}
			if err := db.Create(&reply).Error; err != nil {
				log.Printf("[Error] Gagal membuat balasan Q&A: %v", err)
			}
		}
	}
}

func seedQaThreadExists(db *gorm.DB, authorUID, courseUID uuid.UUID, seedKey string) bool {
	var threads []entity.CourseQaThread
	if err := db.Where("author_uid = ? AND course_uid = ?", authorUID, courseUID).Find(&threads).Error; err != nil {
		return false
	}
	marker := "<!-- seed:" + seedKey + " -->"
	for _, thread := range threads {
		if strings.Contains(thread.Body, marker) {
			return true
		}
	}
	return false
}

func findSeedEnrollment(db *gorm.DB, studentEmail, courseSlug string) (entity.Enrollment, error) {
	student, err := findSeedUserByEmail(db, studentEmail)
	if err != nil {
		return entity.Enrollment{}, err
	}
	course, err := findSeedCourseBySlug(db, courseSlug)
	if err != nil {
		return entity.Enrollment{}, err
	}
	var enrollment entity.Enrollment
	err = db.Where("user_uid = ? AND course_uid = ?", student.Uid, course.Uid).First(&enrollment).Error
	return enrollment, err
}

func findSeedUserByEmail(db *gorm.DB, email string) (entity.User, error) {
	var user entity.User
	err := db.Where("email_hash = ?", utils.GenerateBlindIndex(email)).First(&user).Error
	return user, err
}

func findSeedCourseBySlug(db *gorm.DB, slug string) (entity.Course, error) {
	var course entity.Course
	err := db.Where("slug = ?", slug).First(&course).Error
	return course, err
}

// seedModules membuat modules untuk setiap course (2-3 modules per course).
// Lookup idempotent menggunakan kombinasi (course_uid, order_index) karena
// title sudah dienkripsi non-deterministik dan tidak bisa dipakai sebagai
// kunci pencarian.
func seedModules(db *gorm.DB) {
	log.Println("[Seeder] Seeding Modules...")

	var courses []entity.Course
	if err := db.Order("created_at ASC").Find(&courses).Error; err != nil {
		log.Printf("[Error] Gagal mengambil courses: %v", err)
		return
	}
	if len(courses) < 5 {
		log.Printf("[Seeder] Kurang dari 5 course di DB, modul dilewati")
		return
	}

	moduleData := map[uuid.UUID][]string{
		courses[0].Uid: {"Pengenalan Go", "Syntax dan Tipe Data", "Control Flow dan Functions"},
		courses[1].Uid: {"React Basics", "Next.js Introduction", "Server Side Rendering"},
		courses[2].Uid: {"SQL Basics", "Database Normalization", "Advanced Queries"},
		courses[3].Uid: {"API Principles", "Authentication dan Authorization", "Error Handling"},
		courses[4].Uid: {"Docker Fundamentals", "CI/CD Pipeline", "Kubernetes Basics"},
	}

	for courseUid, moduleNames := range moduleData {
		for idx, name := range moduleNames {
			orderIndex := idx + 1
			module := entity.Module{
				CourseUid:  courseUid,
				Title:      name,
				OrderIndex: orderIndex,
			}

			var existing entity.Module
			err := db.Where("course_uid = ? AND order_index = ?", courseUid, orderIndex).First(&existing).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := db.Create(&module).Error; err != nil {
					log.Printf("[Error] Gagal membuat module %s: %v", name, err)
					continue
				}
				log.Printf("[Success] Module %s berhasil dibuat", name)
			} else if err != nil {
				log.Printf("[Error] Gagal cek module course=%s order=%d: %v", courseUid, orderIndex, err)
			}
		}
	}
}

// seedLessons membuat lessons untuk setiap module (2-3 lessons per module).
// Lookup idempotent menggunakan kombinasi (module_uid, order_index) untuk
// alasan yang sama dengan seedModules.
func seedLessons(db *gorm.DB) {
	log.Println("[Seeder] Seeding Lessons...")

	var modules []entity.Module
	if err := db.Find(&modules).Error; err != nil {
		log.Printf("[Error] Gagal mengambil modules: %v", err)
		return
	}

	now := time.Now()

	for _, module := range modules {
		var lessonCount int
		if module.OrderIndex == 1 {
			lessonCount = 3
		} else {
			lessonCount = 2
		}

		for i := 1; i <= lessonCount; i++ {
			lessonNo := strconv.Itoa(i)
			isVideoLesson := i%2 == 0

			// Konten lesson menggunakan format richTextEnvelope yang sama
			// dengan output normalizeRichTextPayload di service/rich_text.go.
			// Frontend TiptapRichTextEditor membaca field contentHtml.
			contentHTML := "<h2>" + module.Title + " — Lesson " + lessonNo + "</h2>" +
				"<p>Selamat datang di lesson <strong>" + lessonNo + "</strong> dari modul <em>" + module.Title + "</em>. " +
				"Di sesi ini kita akan membahas konsep-konsep penting yang menjadi fondasi materi selanjutnya.</p>" +
				"<h3>Tujuan Pembelajaran</h3>" +
				"<ul>" +
				"<li>Memahami konsep dasar dari topik " + module.Title + "</li>" +
				"<li>Mampu menerapkan teknik yang dipelajari dalam studi kasus nyata</li>" +
				"<li>Mengidentifikasi best practices dan anti-pattern umum</li>" +
				"</ul>" +
				"<h3>Materi Inti</h3>" +
				"<p>Materi pada lesson ini mencakup teori dasar serta contoh kode yang bisa langsung dicoba. " +
				"Pastikan Anda mengikuti setiap langkah dan mencoba variasi latihan di akhir bagian.</p>" +
				"<blockquote><p><strong>Tips:</strong> Gunakan playground yang disediakan untuk bereksperimen " +
				"dengan kode tanpa perlu setup lingkungan lokal.</p></blockquote>" +
				"<h3>Ringkasan</h3>" +
				"<p>Setelah menyelesaikan lesson ini, Anda diharapkan mampu menjelaskan ulang konsep utama " +
				"dan siap melanjutkan ke lesson berikutnya.</p>"

			contentEnvelope := map[string]interface{}{
				"version":     2,
				"contentType": "tiptap",
				"contentHtml": contentHTML,
			}
			contentJSON, _ := json.Marshal(contentEnvelope)

			contentType := entity.LessonContentTypeText
			videoURL := ""
			if isVideoLesson {
				contentType = entity.LessonContentTypeVideo
				videoURL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			}

			lesson := entity.Lesson{
				ModuleUid:   module.Uid,
				Title:       module.Title + " - Lesson " + lessonNo,
				ContentType: contentType,
				Content:     contentJSON,
				VideoURL:    videoURL,
				StartTime:   now.AddDate(0, 0, i),
				EndTime:     now.AddDate(0, 0, i).Add(2 * time.Hour),
				OrderIndex:  i,
			}

			var existing entity.Lesson
			err := db.Where("module_uid = ? AND order_index = ?", module.Uid, i).First(&existing).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := db.Create(&lesson).Error; err != nil {
					log.Printf("[Error] Gagal membuat lesson %s: %v", lesson.Title, err)
					continue
				}
				log.Printf("[Success] Lesson %s berhasil dibuat", lesson.Title)
			} else if err != nil {
				log.Printf("[Error] Gagal cek lesson module=%s order=%d: %v", module.Uid, i, err)
			} else {
				// Lesson sudah ada — update content ke format richTextEnvelope
				// agar data lama (format {"intro":...}) diganti dengan format tiptap.
				updates := map[string]interface{}{"content": lesson.Content}
				if contentType == entity.LessonContentTypeVideo {
					updates["video_url"] = videoURL
					updates["content"] = nil
				}
				if err := db.Model(&existing).Updates(updates).Error; err != nil {
					log.Printf("[Warning] Gagal update content lesson %s: %v", existing.Uid, err)
				} else {
					log.Printf("[Info] Content lesson %s diperbarui ke format tiptap", existing.Uid)
				}
			}
		}
	}
}

// seedLessonAssignments membuat assignment dasar untuk lesson pertama di
// setiap module. Lookup idempotent memakai lesson_uid (unique constraint
// pada tabel lesson_assignments).
func seedLessonAssignments(db *gorm.DB) {
	log.Println("[Seeder] Seeding Lesson Assignments...")

	var lessons []entity.Lesson
	if err := db.Where("order_index = ?", 1).Order("created_at ASC").Find(&lessons).Error; err != nil {
		log.Printf("[Error] Gagal mengambil lesson untuk assignment: %v", err)
		return
	}

	if len(lessons) == 0 {
		log.Println("[Seeder] Tidak ada lesson untuk dibuatkan assignment")
		return
	}

	maxResubmit := 3
	for i, lesson := range lessons {
		taskType := entity.LessonAssignmentTaskTypeText
		var quizPayload json.RawMessage

		if i%2 == 1 {
			taskType = entity.LessonAssignmentTaskTypeQuiz
			qp := map[string]interface{}{
				"passingScore": 70,
				"questions": []map[string]interface{}{
					{
						"id": "q1",
						// prompt menggunakan format richTextEnvelope agar frontend dapat
						// merender soal via TiptapRichTextEditor (mendukung bold, code, dst.)
						// options.label dan explanation tetap plain text (tidak perlu WYSIWYG).
						"prompt": map[string]interface{}{
							"version":     2,
							"contentType": "tiptap",
							"contentHtml": "<p>Apakah <strong>Go (Golang)</strong> merupakan bahasa pemrograman yang <em>dikompilasi</em> (compiled)?</p>",
						},
						"correctOptionId": "a",
						"explanation":     "Ya, Go dikompilasi langsung ke bahasa mesin (machine code).",
						"options": []map[string]interface{}{
							{"id": "a", "label": "Ya, benar"},
							{"id": "b", "label": "Tidak, Go adalah interpreted language"},
						},
					},
					{
						"id": "q2",
						"prompt": map[string]interface{}{
							"version":     2,
							"contentType": "tiptap",
							"contentHtml": "<p>Keyword apa yang digunakan untuk menjalankan <strong>goroutine</strong>?</p>",
						},
						"correctOptionId": "b",
						"explanation":     "Keyword 'go' digunakan sebelum memanggil fungsi untuk mengeksekusinya secara concurrent di goroutine.",
						"options": []map[string]interface{}{
							{"id": "a", "label": "goroutine"},
							{"id": "b", "label": "go"},
							{"id": "c", "label": "async"},
							{"id": "d", "label": "defer"},
						},
					},
					{
						"id": "q3",
						"prompt": map[string]interface{}{
							"version":     2,
							"contentType": "tiptap",
							"contentHtml": "<p>Apa output dari kode berikut?</p><pre><code>fmt.Println(10 / 3)</code></pre>",
						},
						"correctOptionId": "b",
						"explanation":     "Dalam Go, pembagian dua integer menghasilkan integer (bukan float), sehingga 10/3 = 3.",
						"options": []map[string]interface{}{
							{"id": "a", "label": "3.333"},
							{"id": "b", "label": "3"},
							{"id": "c", "label": "4"},
							{"id": "d", "label": "Error"},
						},
					},
				},
			}
			quizPayload, _ = json.Marshal(qp)
		}

		// task_description menggunakan format richTextEnvelope yang sama
		// dengan konten lesson agar frontend bisa membaca via TiptapRichTextEditor.
		var taskDescriptionHTML string
		if taskType == entity.LessonAssignmentTaskTypeQuiz {
			taskDescriptionHTML = "<h3>Kuis Pemahaman: " + lesson.Title + "</h3>" +
				"<p>Selesaikan kuis pilihan ganda berikut untuk menguji pemahaman Anda setelah mempelajari materi lesson.</p>" +
				"<blockquote><p><strong>Ketentuan:</strong> Kuis ini memiliki skor kelulusan minimal sebesar 70%.</p></blockquote>"
		} else {
			taskDescriptionHTML = "<h3>Tugas Praktik: " + lesson.Title + "</h3>" +
				"<p>Kerjakan tugas berikut sesuai dengan materi yang telah dipelajari pada lesson ini.</p>" +
				"<h4>Instruksi</h4>" +
				"<ol>" +
				"<li>Baca ulang materi lesson dengan seksama</li>" +
				"<li>Buat implementasi sederhana berdasarkan konsep yang dijelaskan</li>" +
				"<li>Sertakan penjelasan singkat tentang pendekatan yang Anda gunakan</li>" +
				"</ol>" +
				"<h4>Kriteria Penilaian</h4>" +
				"<ul>" +
				"<li><strong>Ketepatan:</strong> Solusi sesuai dengan instruksi</li>" +
				"<li><strong>Pemahaman:</strong> Penjelasan menunjukkan pemahaman konsep</li>" +
				"<li><strong>Kerapian:</strong> Kode bersih dan terstruktur</li>" +
				"</ul>" +
				"<blockquote><p>Deadline pengumpulan tertera di atas. Gunakan fitur WYSIWYG atau unggah file sesuai kebutuhan.</p></blockquote>"
		}

		taskDescription, _ := json.Marshal(map[string]interface{}{
			"version":     2,
			"contentType": "tiptap",
			"contentHtml": taskDescriptionHTML,
		})

		instructionAttachments, _ := json.Marshal([]map[string]string{
			{"name": "Panduan Tugas", "url": "https://example.com/instruksi-tugas.pdf"},
		})

		assignment := entity.LessonAssignment{
			LessonUid:                lesson.Uid,
			Title:                    "Tugas " + lesson.Title,
			TaskType:                 taskType,
			TaskDescription:          taskDescription,
			QuizPayload:              quizPayload,
			AllowFileSubmission:      taskType == entity.LessonAssignmentTaskTypeText,
			AllowPlainTextSubmission: false,
			AllowRichTextSubmission:  taskType == entity.LessonAssignmentTaskTypeText,
			RequireFileDescription:   taskType == entity.LessonAssignmentTaskTypeText,
			InstructionAttachments:   instructionAttachments,
			DeadlineAt:               time.Now().AddDate(0, 0, 7+i),
			Status:                   entity.LessonAssignmentStatusTerbit,
			AutoCloseAfterDeadline:   true,
			AllowResubmit:            true,
			MaxResubmitCount:         &maxResubmit,
		}

		var existing entity.LessonAssignment
		err := db.Where("lesson_uid = ?", lesson.Uid).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&assignment).Error; err != nil {
				log.Printf("[Error] Gagal membuat assignment untuk lesson %s: %v", lesson.Title, err)
				continue
			}
			log.Printf("[Success] Assignment untuk lesson %s berhasil dibuat", lesson.Title)
		} else if err != nil {
			log.Printf("[Error] Gagal cek assignment lesson=%s: %v", lesson.Uid, err)
		} else {
			// Assignment sudah ada — update fields ke format/data terbaru
			updates := map[string]interface{}{
				"task_type":                  assignment.TaskType,
				"task_description":           assignment.TaskDescription,
				"quiz_payload":               assignment.QuizPayload,
				"allow_file_submission":      assignment.AllowFileSubmission,
				"allow_rich_text_submission": assignment.AllowRichTextSubmission,
				"require_file_description":   assignment.RequireFileDescription,
			}
			if err := db.Model(&existing).Updates(updates).Error; err != nil {
				log.Printf("[Warning] Gagal update assignment lesson=%s: %v", lesson.Uid, err)
			} else {
				log.Printf("[Info] assignment lesson=%s diperbarui ke format tiptap (task_type=%s)", lesson.Uid, assignment.TaskType)
			}
		}
	}
}

// seedLessonReadings mensimulasikan beberapa student yang sudah membaca lesson
// dari course yang mereka ikuti. Lookup idempotent menggunakan (lesson_uid,
// enrollment_uid) sehingga aman dijalankan berulang kali.
func seedLessonReadings(db *gorm.DB) {
	log.Println("[Seeder] Seeding Lesson Readings...")

	type seedReading struct {
		StudentEmail string
		CourseSlug   string
		// LessonOrderIndexes adalah order_index lesson yang sudah dibaca student.
		LessonOrderIndexes []int
	}

	// Budi sudah membaca lesson ber-order_index 1 dan 2 dari setiap course-nya.
	// Siti baru membaca lesson pertama saja (sedang baru mulai).
	readings := []seedReading{
		// Budi — golang-fundamentals
		{StudentEmail: "budi@doscom.id", CourseSlug: "golang-fundamentals", LessonOrderIndexes: []int{1, 2}},
		// Budi — web-development-nextjs
		{StudentEmail: "budi@doscom.id", CourseSlug: "web-development-nextjs", LessonOrderIndexes: []int{1}},
		// Budi — database-design-sql
		{StudentEmail: "budi@doscom.id", CourseSlug: "database-design-sql", LessonOrderIndexes: []int{1, 2}},
		// Siti — golang-fundamentals
		{StudentEmail: "siti@doscom.id", CourseSlug: "golang-fundamentals", LessonOrderIndexes: []int{1}},
		// Siti — web-development-nextjs
		{StudentEmail: "siti@doscom.id", CourseSlug: "web-development-nextjs", LessonOrderIndexes: []int{1}},
		// Siti — rest-api-development
		{StudentEmail: "siti@doscom.id", CourseSlug: "rest-api-development", LessonOrderIndexes: []int{1}},
		// Siti — devops-essentials
		{StudentEmail: "siti@doscom.id", CourseSlug: "devops-essentials", LessonOrderIndexes: []int{1}},
	}

	for _, item := range readings {
		student, err := findSeedUserByEmail(db, item.StudentEmail)
		if err != nil {
			log.Printf("[Error] Siswa seed %s tidak ditemukan untuk lesson reading: %v", item.StudentEmail, err)
			continue
		}

		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course slug %s tidak ditemukan untuk lesson reading: %v", item.CourseSlug, err)
			continue
		}

		// Cari enrollment aktif milik student pada course ini
		var enrollment entity.Enrollment
		enrollErr := db.Where("user_uid = ? AND course_uid = ? AND status IN ?",
			student.Uid, course.Uid,
			[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
		).First(&enrollment).Error
		if errors.Is(enrollErr, gorm.ErrRecordNotFound) {
			log.Printf("[Seeder] User %s tidak punya enrollment aktif di course %s, reading dilewati", item.StudentEmail, item.CourseSlug)
			continue
		}
		if enrollErr != nil {
			log.Printf("[Error] Gagal cek enrollment %s / %s: %v", item.StudentEmail, item.CourseSlug, enrollErr)
			continue
		}

		// Ambil lesson dari course ini yang sesuai order_index yang diminta
		var lessons []entity.Lesson
		db.Table("lessons l").
			Joins("JOIN modules m ON m.uid = l.module_uid").
			Where("m.course_uid = ? AND l.order_index IN ?", course.Uid, item.LessonOrderIndexes).
			Order("l.order_index ASC").
			Find(&lessons)

		if len(lessons) == 0 {
			log.Printf("[Seeder] Tidak ada lesson ditemukan untuk course %s dengan order_index %v", item.CourseSlug, item.LessonOrderIndexes)
			continue
		}

		for _, lesson := range lessons {
			var existing entity.LessonReading
			err := db.Where("lesson_uid = ? AND enrollment_uid = ?", lesson.Uid, enrollment.Uid).First(&existing).Error
			if err == nil {
				continue // sudah ada, lewati
			}
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Error] Gagal cek lesson reading %s / lesson=%s: %v", item.StudentEmail, lesson.Uid, err)
				continue
			}

			reading := entity.LessonReading{
				LessonUid:     lesson.Uid,
				EnrollmentUid: enrollment.Uid,
				ReadAt:        time.Now(),
			}
			if err := db.Create(&reading).Error; err != nil {
				log.Printf("[Error] Gagal membuat lesson reading %s / lesson order_index=%d (course %s): %v", item.StudentEmail, lesson.OrderIndex, item.CourseSlug, err)
				continue
			}
			log.Printf("[Success] Lesson reading %s / lesson order_index=%d (course %s) berhasil dibuat", item.StudentEmail, lesson.OrderIndex, item.CourseSlug)
		}
	}
}

// seedLessonAttendances mensimulasikan kehadiran siswa pada lesson yang sudah
// mereka baca. Dipakai oleh GET /courses/:id/students (attendance_present).
// Idempoten: lookup (lesson_uid, enrollment_uid).
func seedLessonAttendances(db *gorm.DB) {
	log.Println("[Seeder] Seeding Lesson Attendances...")

	var readings []entity.LessonReading
	if err := db.Find(&readings).Error; err != nil {
		log.Printf("[Error] Gagal mengambil lesson readings untuk attendance: %v", err)
		return
	}

	for _, reading := range readings {
		var existing entity.LessonAttendance
		err := db.Where("lesson_uid = ? AND enrollment_uid = ?", reading.LessonUid, reading.EnrollmentUid).First(&existing).Error
		if err == nil {
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek lesson attendance: %v", err)
			continue
		}

		attendance := entity.LessonAttendance{
			LessonUid:     reading.LessonUid,
			EnrollmentUid: reading.EnrollmentUid,
			Status:        entity.AttendancePresent,
			CheckedInAt:   reading.ReadAt,
		}
		if err := db.Create(&attendance).Error; err != nil {
			log.Printf("[Error] Gagal membuat lesson attendance: %v", err)
			continue
		}
	}
	log.Printf("[Success] Lesson attendances disinkronkan dari %d lesson readings", len(readings))
}

// seedLessonAssignmentSubmissions membuat contoh submission assignment dari
// student seed (Budi dan Siti) untuk beberapa assignment yang sudah ada di
// course yang mereka ikuti. Submission mencakup:
//   - Text submission sudah dinilai mentor (scored + feedback)
//   - Quiz submission auto-graded
//   - Submission yang masih pending penilaian
//
// Lookup idempotent menggunakan unique constraint (lesson_assignment_uid, user_uid).
func seedLessonAssignmentSubmissions(db *gorm.DB) {
	log.Println("[Seeder] Seeding Lesson Assignment Submissions...")

	// Pastikan status semua assignment seed menjadi TERBIT agar submission masuk akal.
	if err := db.Model(&entity.LessonAssignment{}).
		Where("status = ?", entity.LessonAssignmentStatusDraft).
		Update("status", entity.LessonAssignmentStatusTerbit).Error; err != nil {
		log.Printf("[Warning] Gagal publish assignment seed: %v", err)
	}

	type seedSubmission struct {
		StudentEmail     string
		CourseSlug       string
		// ModuleOrderIndex dan LessonOrderIndex dipakai untuk mencari lesson spesifik.
		ModuleOrderIndex int
		LessonOrderIndex int
		// Jika IsQuiz true, submission dikirim sebagai quiz answers.
		IsQuiz      bool
		PlainText   string
		// QuizAnswers: map[questionId]selectedOptionId
		QuizAnswers  map[string]string
		AttemptCount int
		// Grading (nil jika belum dinilai)
		ScorePercent *float64
		Passed       *bool
		IsAutoGraded bool
		Feedback     string
		// Quiz scoring helpers
		QuizCorrect *int
		QuizTotal   *int
	}

	boolTrue  := true
	boolFalse := false

	score100 := 100.0
	score85  := 85.0
	score70  := 70.0
	score66  := 66.67
	score33  := 33.33

	correct3 := 3
	correct2 := 2
	correct1 := 1
	total3   := 3

	submissions := []seedSubmission{
		// ── BUDI ──────────────────────────────────────────────────────────────
		// golang-fundamentals, Module 1 (Pengenalan Go), Lesson 1 — text assignment, dinilai sempurna
		{
			StudentEmail:     "budi@doscom.id",
			CourseSlug:       "golang-fundamentals",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Saya membuat program Hello World menggunakan Go. Program menampilkan teks ke console melalui fmt.Println tanpa dependensi eksternal karena memanfaatkan standard library bawaan Go.",
			AttemptCount:     1,
			ScorePercent:     &score100,
			Passed:           &boolTrue,
			IsAutoGraded:     false,
			Feedback:         "Excellent! Implementasi sudah benar dan penjelasannya sangat jelas. Terus pertahankan!",
		},
		// golang-fundamentals, Module 2 (Syntax dan Tipe Data), Lesson 1 — quiz, auto-graded sempurna
		{
			StudentEmail:     "budi@doscom.id",
			CourseSlug:       "golang-fundamentals",
			ModuleOrderIndex: 2,
			LessonOrderIndex: 1,
			IsQuiz:           true,
			QuizAnswers:      map[string]string{"q1": "a", "q2": "b", "q3": "b"},
			AttemptCount:     1,
			ScorePercent:     &score100,
			Passed:           &boolTrue,
			IsAutoGraded:     true,
			QuizCorrect:      &correct3,
			QuizTotal:        &total3,
		},
		// golang-fundamentals, Module 3 (Control Flow dan Functions), Lesson 1 — quiz, auto-graded tidak lulus
		{
			StudentEmail:     "budi@doscom.id",
			CourseSlug:       "golang-fundamentals",
			ModuleOrderIndex: 3,
			LessonOrderIndex: 1,
			IsQuiz:           true,
			QuizAnswers:      map[string]string{"q1": "a", "q2": "a", "q3": "b"},
			AttemptCount:     2,
			ScorePercent:     &score66,
			Passed:           &boolFalse,
			IsAutoGraded:     true,
			QuizCorrect:      &correct2,
			QuizTotal:        &total3,
		},
		// web-development-nextjs, Module 1 (React Basics), Lesson 1 — text, dinilai baik
		{
			StudentEmail:     "budi@doscom.id",
			CourseSlug:       "web-development-nextjs",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Saya membuat komponen React yang menampilkan daftar item menggunakan useState dan map. Setiap item memiliki key unik untuk performa optimal. Komponen menerima props berupa array dan merender elemen li untuk tiap item.",
			AttemptCount:     1,
			ScorePercent:     &score85,
			Passed:           &boolTrue,
			IsAutoGraded:     false,
			Feedback:         "Bagus! Penggunaan key prop sudah benar. Coba tambahkan PropTypes untuk type checking yang lebih baik.",
		},
		// database-design-sql, Module 1 (SQL Basics), Lesson 1 — text, pending penilaian
		{
			StudentEmail:     "budi@doscom.id",
			CourseSlug:       "database-design-sql",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Saya merancang skema database toko online dengan tabel: users, products, orders, dan order_items. Relasi antar tabel menggunakan foreign key, dan primary key setiap tabel menggunakan UUID untuk menghindari sequential ID exposure.",
			AttemptCount:     1,
			ScorePercent:     nil,
			Passed:           nil,
			IsAutoGraded:     false,
		},

		// ── SITI ──────────────────────────────────────────────────────────────
		// golang-fundamentals, Module 1 (Pengenalan Go), Lesson 1 — text, dinilai baik
		{
			StudentEmail:     "siti@doscom.id",
			CourseSlug:       "golang-fundamentals",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Program Go pertama saya berhasil! Go punya sintaks bersih dan kompilasi cepat. Saya mencoba variasi fmt.Println, fmt.Printf, dan fmt.Sprintf untuk memahami perbedaan ketiganya.",
			AttemptCount:     1,
			ScorePercent:     &score85,
			Passed:           &boolTrue,
			IsAutoGraded:     false,
			Feedback:         "Eksplorasi yang baik! Senang kamu mencoba berbagai fungsi fmt. Selanjutnya coba eksplorasi error handling di Go.",
		},
		// golang-fundamentals, Module 2 (Syntax dan Tipe Data), Lesson 1 — quiz, auto-graded skor rendah
		{
			StudentEmail:     "siti@doscom.id",
			CourseSlug:       "golang-fundamentals",
			ModuleOrderIndex: 2,
			LessonOrderIndex: 1,
			IsQuiz:           true,
			QuizAnswers:      map[string]string{"q1": "a", "q2": "c", "q3": "a"},
			AttemptCount:     1,
			ScorePercent:     &score33,
			Passed:           &boolFalse,
			IsAutoGraded:     true,
			QuizCorrect:      &correct1,
			QuizTotal:        &total3,
		},
		// web-development-nextjs, Module 1 (React Basics), Lesson 1 — text, pending penilaian
		{
			StudentEmail:     "siti@doscom.id",
			CourseSlug:       "web-development-nextjs",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Saya membuat komponen React untuk menampilkan profil pengguna dengan props nama, email, dan avatar. Saya menggunakan conditional rendering untuk fallback avatar jika URL gambar tidak tersedia.",
			AttemptCount:     1,
			ScorePercent:     nil,
			Passed:           nil,
			IsAutoGraded:     false,
		},
		// rest-api-development, Module 1 (API Principles), Lesson 1 — text, sudah dinilai
		{
			StudentEmail:     "siti@doscom.id",
			CourseSlug:       "rest-api-development",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Saya mendokumentasikan perbedaan REST vs GraphQL. REST pakai endpoint berbeda per resource, GraphQL satu endpoint dengan query fleksibel. Untuk project kecil-menengah, REST lebih mudah di-debug.",
			AttemptCount:     1,
			ScorePercent:     &score70,
			Passed:           &boolTrue,
			IsAutoGraded:     false,
			Feedback:         "Analisis sudah cukup baik. Coba tambahkan contoh konkret penggunaan masing-masing untuk memperkuat argumenmu.",
		},
		// devops-essentials, Module 1 (Docker Fundamentals), Lesson 1 — text, pending penilaian
		{
			StudentEmail:     "siti@doscom.id",
			CourseSlug:       "devops-essentials",
			ModuleOrderIndex: 1,
			LessonOrderIndex: 1,
			IsQuiz:           false,
			PlainText:        "Saya membuat Dockerfile untuk aplikasi Node.js menggunakan multi-stage build agar ukuran image final minimal. Base image node:20-alpine dipilih karena ringan. Build menghasilkan image ~45MB.",
			AttemptCount:     1,
			ScorePercent:     nil,
			Passed:           nil,
			IsAutoGraded:     false,
		},
	}

	for _, item := range submissions {
		student, err := findSeedUserByEmail(db, item.StudentEmail)
		if err != nil {
			log.Printf("[Error] Siswa seed %s tidak ditemukan untuk submission: %v", item.StudentEmail, err)
			continue
		}

		course, err := findSeedCourseBySlug(db, item.CourseSlug)
		if err != nil {
			log.Printf("[Error] Course slug %s tidak ditemukan untuk submission: %v", item.CourseSlug, err)
			continue
		}

		// Pastikan student punya enrollment aktif di course ini
		var enrollment entity.Enrollment
		if err := db.Where("user_uid = ? AND course_uid = ? AND status IN ?",
			student.Uid, course.Uid,
			[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
		).First(&enrollment).Error; err != nil {
			log.Printf("[Seeder] User %s tidak punya enrollment aktif di course %s, submission dilewati", item.StudentEmail, item.CourseSlug)
			continue
		}

		// Cari module spesifik berdasarkan order_index
		var module entity.Module
		if err := db.Where("course_uid = ? AND order_index = ?", course.Uid, item.ModuleOrderIndex).First(&module).Error; err != nil {
			log.Printf("[Seeder] Module order_index=%d di course %s tidak ditemukan: %v", item.ModuleOrderIndex, item.CourseSlug, err)
			continue
		}

		// Cari lesson spesifik berdasarkan order_index dalam module
		var lesson entity.Lesson
		if err := db.Where("module_uid = ? AND order_index = ?", module.Uid, item.LessonOrderIndex).First(&lesson).Error; err != nil {
			log.Printf("[Seeder] Lesson order_index=%d di module=%s tidak ditemukan: %v", item.LessonOrderIndex, module.Uid, err)
			continue
		}

		// Cari assignment yang terpasang pada lesson ini
		var assignment entity.LessonAssignment
		if err := db.Where("lesson_uid = ?", lesson.Uid).First(&assignment).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Seeder] Lesson %s (module=%d, lesson=%d, course=%s) tidak punya assignment, submission dilewati",
					lesson.Uid, item.ModuleOrderIndex, item.LessonOrderIndex, item.CourseSlug)
			} else {
				log.Printf("[Error] Gagal cek assignment lesson=%s: %v", lesson.Uid, err)
			}
			continue
		}

		// Idempoten: cek apakah submission sudah ada
		var existing entity.LessonAssignmentSubmission
		if err := db.Where("lesson_assignment_uid = ? AND user_uid = ?", assignment.Uid, student.Uid).First(&existing).Error; err == nil {
			continue // sudah ada
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Error] Gagal cek submission %s / assignment=%s: %v", item.StudentEmail, assignment.Uid, err)
			continue
		}

		// Susun submission
		sub := entity.LessonAssignmentSubmission{
			LessonAssignmentUid: assignment.Uid,
			UserUid:             student.Uid,
			AttemptCount:        item.AttemptCount,
			ScorePercent:        item.ScorePercent,
			Passed:              item.Passed,
			IsAutoGraded:        item.IsAutoGraded,
			QuizCorrectCount:    item.QuizCorrect,
			QuizQuestionCount:   item.QuizTotal,
		}

		if item.IsQuiz {
			quizAnswersJSON, _ := json.Marshal(item.QuizAnswers)
			sub.QuizAnswers = quizAnswersJSON
		} else {
			sub.PlainText = item.PlainText
			if item.Feedback != "" {
				sub.Feedback = item.Feedback
				gradedAt := time.Now().Add(-24 * time.Hour)
				sub.GradedAt = &gradedAt
			}
		}

		if err := db.Create(&sub).Error; err != nil {
			log.Printf("[Error] Gagal membuat submission %s / assignment=%s: %v", item.StudentEmail, assignment.Uid, err)
			continue
		}
		attempt := entity.LessonAssignmentSubmissionAttempt{
			LessonAssignmentSubmissionUid: sub.Uid,
			AttemptNumber:                 sub.AttemptCount,
			PlainText:                     sub.PlainText,
			RichText:                      sub.RichText,
			FileURL:                       sub.FileURL,
			FileOriginalFilename:          sub.FileOriginalFilename,
			FileDescription:               sub.FileDescription,
			QuizAnswers:                   sub.QuizAnswers,
			ScorePercent:                  sub.ScorePercent,
			Passed:                        sub.Passed,
			QuizCorrectCount:              sub.QuizCorrectCount,
			QuizQuestionCount:             sub.QuizQuestionCount,
			Feedback:                      sub.Feedback,
			GradedAt:                      sub.GradedAt,
			IsAutoGraded:                  sub.IsAutoGraded,
		}
		if err := db.Create(&attempt).Error; err != nil {
			log.Printf("[Error] Gagal membuat submission attempt %s / assignment=%s: %v", item.StudentEmail, assignment.Uid, err)
			continue
		}
		log.Printf("[Success] Submission %s untuk assignment di course=%s (module=%d, lesson=%d) berhasil dibuat",
			item.StudentEmail, item.CourseSlug, item.ModuleOrderIndex, item.LessonOrderIndex)
	}
}
