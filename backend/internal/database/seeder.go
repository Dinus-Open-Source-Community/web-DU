package database

import (
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"log"
	"strconv"
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
	seedCourseReviews(db)
	seedModules(db)
	seedLessons(db)
	seedLessonAssignments(db)

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
			AvatarURL:   "https://via.placeholder.com/150?text=SuperAdmin",
			Description: "Super administrator dari platform DU",
		},
		{
			Name:        "Admin User",
			Email:       "admin@doscom.id",
			Password:    "admin123",
			Role:        entity.AdminRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Admin",
			Description: "Administrator dari platform DU",
		},
		{
			Name:        "Budi Santoso",
			Email:       "budi@doscom.id",
			Password:    "student123",
			Role:        entity.StudentRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Budi",
			Description: "Mahasiswa Dinus yang aktif belajar",
		},
		{
			Name:        "Siti Nurhaliza",
			Email:       "siti@doscom.id",
			Password:    "student123",
			Role:        entity.StudentRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Siti",
			Description: "Mahasiswa berprestasi di bidang teknologi",
		},
		{
			Name:        "Andi Pratama",
			Email:       "andi.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Andi",
			Description: "Mentor backend dan arsitektur sistem",
		},
		{
			Name:        "Rina Kurnia",
			Email:       "rina.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Rina",
			Description: "Mentor frontend dan UI engineering",
		},
		{
			Name:        "Dimas Saputra",
			Email:       "dimas.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Dimas",
			Description: "Mentor DevOps dan cloud deployment",
		},
		{
			Name:        "Nadia Putri",
			Email:       "nadia.mentor@doscom.id",
			Password:    "mentor123",
			Role:        entity.MentorRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Nadia",
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
			CoverURL:     "https://via.placeholder.com/400x300?text=Golang",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=Golang",
			Price:        299000,
			PriceStrike:  399000,
			IsPremium:    true,
			IsPublished:  true,
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
			CoverURL:     "https://via.placeholder.com/400x300?text=NextJS",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=NextJS",
			Price:        349000,
			PriceStrike:  449000,
			IsPremium:    true,
			IsPublished:  true,
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
			CoverURL:     "https://via.placeholder.com/400x300?text=Database",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=Database",
			Price:        279000,
			PriceStrike:  329000,
			IsPremium:    false,
			IsPublished:  true,
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
			CoverURL:     "https://via.placeholder.com/400x300?text=RestAPI",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=RestAPI",
			Price:        299000,
			PriceStrike:  379000,
			IsPremium:    true,
			IsPublished:  true,
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
			CoverURL:     "https://via.placeholder.com/400x300?text=DevOps",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=DevOps",
			Price:        329000,
			PriceStrike:  429000,
			IsPremium:    true,
			IsPublished:  true,
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
		} else if existing.CreatedByUid == nil {
			if err := db.Model(&existing).Update("created_by_uid", createdByUID).Error; err != nil {
				log.Printf("[Warning] Gagal set created_by_uid course %s: %v", course.Slug, err)
			} else {
				log.Printf("[Info] created_by_uid course %s diperbarui", course.Slug)
			}
		}
	}
}

// seedCourseReviews membuat ulasan kursus dari siswa seed agar rating & total_reviews
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
			StudentEmail: "budi@doscom.id",
			CourseSlug:   "rest-api-development",
			Rating:       4,
			Comment:      "Studi kasus REST API-nya relevan dengan kebutuhan backend sehari-hari.",
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

			content := map[string]string{
				"intro":    "Pengenalan materi " + module.Title,
				"learning": "Konten pembelajaran untuk poin " + lessonNo,
				"summary":  "Ringkasan materi yang telah dipelajari",
			}
			contentJSON, _ := json.Marshal(content)

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
		taskDescription, _ := json.Marshal(map[string]any{
			"type": "doc",
			"content": []map[string]any{
				{"type": "paragraph", "content": []map[string]any{{"type": "text", "text": "Kerjakan tugas sesuai instruksi lesson ini."}}},
			},
		})

		instructionAttachments, _ := json.Marshal([]map[string]string{
			{"name": "Panduan Tugas", "url": "https://example.com/instruksi-tugas.pdf"},
		})

		assignment := entity.LessonAssignment{
			LessonUid:                lesson.Uid,
			Title:                    "Tugas " + lesson.Title,
			TaskType:                 entity.LessonAssignmentTaskTypeText,
			TaskDescription:          taskDescription,
			AllowFileSubmission:      true,
			AllowPlainTextSubmission: false,
			AllowRichTextSubmission:  true,
			RequireFileDescription:   true,
			InstructionAttachments:   instructionAttachments,
			DeadlineAt:               time.Now().AddDate(0, 0, 7+i),
			Status:                   entity.LessonAssignmentStatusDraft,
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
		}
	}
}
