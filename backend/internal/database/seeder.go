package database

import (
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RunSeeder menjalankan semua seeder untuk database
func RunSeeder(db *gorm.DB) {
	log.Println("[Seeder] Memulai proses seeding database...")

	// Jalankan seeder secara berurutan
	seedUsers(db)
	seedCourseCategories(db)
	seedClassTypes(db)
	seedCourses(db)
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
		if err := db.Where("name = ?", category.Name).First(&entity.CourseCategory{}).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&category).Error; err != nil {
				log.Printf("[Error] Gagal membuat category %s: %v", category.Name, err)
			} else {
				log.Printf("[Success] Category %s berhasil dibuat", category.Name)
			}
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
		if err := db.Where("name = ?", classType.Name).First(&entity.ClassType{}).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&classType).Error; err != nil {
				log.Printf("[Error] Gagal membuat class type %s: %v", classType.Name, err)
			} else {
				log.Printf("[Success] Class type %s berhasil dibuat", classType.Name)
			}
		}
	}
}

// seedUsers membuat user data (1 admin dan 2 student)
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
	}

	for _, u := range users {
		emailHash := utils.GenerateBlindIndex(u.Email)

		var existing entity.User
		err := db.Where("email_hash = ? OR email_hash = ? OR email = ?", emailHash, u.Email, u.Email).First(&existing).Error
		if err == nil {
			if existing.EmailHash != emailHash {
				if err := db.Model(&existing).Update("email_hash", emailHash).Error; err != nil {
					log.Printf("[Warning] Gagal migrasi email_hash user %s: %v", u.Name, err)
				} else {
					log.Printf("[Info] email_hash user %s diperbarui ke blind index", u.Name)
				}
			}
			continue
		}
		if err != gorm.ErrRecordNotFound {
			log.Printf("[Error] Gagal cek user %s: %v", u.Name, err)
			continue
		}

		hashedPassword, err := utils.HashPassword(u.Password)
		if err != nil {
			log.Printf("[Error] Gagal hash password user %s: %v", u.Name, err)
			continue
		}

		encryptedName, err := utils.Encrypt(u.Name)
		if err != nil {
			log.Printf("[Error] Gagal encrypt name user %s: %v", u.Name, err)
			continue
		}

		encryptedEmail, err := utils.Encrypt(u.Email)
		if err != nil {
			log.Printf("[Error] Gagal encrypt email user %s: %v", u.Name, err)
			continue
		}

		user := entity.User{
			Name:        encryptedName,
			Email:       encryptedEmail,
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

// seedCourses membuat 5 course
func seedCourses(db *gorm.DB) {
	log.Println("[Seeder] Seeding Courses...")

	// Ambil mentor dari database (yang bukan student)
	var mentor entity.User
	if err := db.Where("role != ?", entity.StudentRole).First(&mentor).Error; err != nil {
		log.Printf("[Error] Mentor tidak ditemukan: %v", err)
		return
	}

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
			MentorUid:    &mentor.Uid,
			CategoryUid:  &categories[0].Uid,
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
			MentorUid:    &mentor.Uid,
			CategoryUid:  &categories[0].Uid,
			ClassTypeUid: &classTypes[1].Uid,
			Title:        "Web Development dengan Next.js",
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
			MentorUid:    &mentor.Uid,
			CategoryUid:  &categories[1].Uid,
			ClassTypeUid: &classTypes[1].Uid,
			Title:        "Database Design dan SQL",
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
			MentorUid:    &mentor.Uid,
			CategoryUid:  &categories[1].Uid,
			ClassTypeUid: &classTypes[2].Uid,
			Title:        "REST API Development",
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
			MentorUid:    &mentor.Uid,
			CategoryUid:  &categories[2].Uid,
			ClassTypeUid: &classTypes[0].Uid,
			Title:        "DevOps Essentials",
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
		// Cek apakah course sudah ada
		if err := db.Where("slug = ?", course.Slug).First(&entity.Course{}).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&course).Error; err != nil {
				log.Printf("[Error] Gagal membuat course %s: %v", course.Title, err)
			} else {
				log.Printf("[Success] Course %s berhasil dibuat", course.Title)
			}
		}
	}
}

// seedModules membuat modules untuk setiap course (2-3 modules per course)
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

	// Data modules untuk masing-masing course (urutan sama dengan seedCourses)
	moduleData := map[uuid.UUID][]string{
		courses[0].Uid: {"Pengenalan Go", "Syntax dan Tipe Data", "Control Flow dan Functions"},
		courses[1].Uid: {"React Basics", "Next.js Introduction", "Server Side Rendering"},
		courses[2].Uid: {"SQL Basics", "Database Normalization", "Advanced Queries"},
		courses[3].Uid: {"API Principles", "Authentication dan Authorization", "Error Handling"},
		courses[4].Uid: {"Docker Fundamentals", "CI/CD Pipeline", "Kubernetes Basics"},
	}

	for courseUid, moduleNames := range moduleData {
		for idx, name := range moduleNames {
			module := entity.Module{
				CourseUid:  courseUid,
				Title:      name,
				OrderIndex: idx + 1,
			}

			// Cek apakah module sudah ada
			if err := db.Where("course_uid = ? AND title = ?", courseUid, name).First(&entity.Module{}).Error; err == gorm.ErrRecordNotFound {
				if err := db.Create(&module).Error; err != nil {
					log.Printf("[Error] Gagal membuat module %s: %v", name, err)
				} else {
					log.Printf("[Success] Module %s berhasil dibuat", name)
				}
			}
		}
	}
}

// seedLessons membuat lessons untuk setiap module (2-3 lessons per module)
func seedLessons(db *gorm.DB) {
	log.Println("[Seeder] Seeding Lessons...")

	var modules []entity.Module
	if err := db.Find(&modules).Error; err != nil {
		log.Printf("[Error] Gagal mengambil modules: %v", err)
		return
	}

	now := time.Now()

	// Data lessons untuk masing-masing module
	for _, module := range modules {
		var lessonCount int
		if module.OrderIndex == 1 {
			lessonCount = 3 // 3 lessons untuk module pertama
		} else {
			lessonCount = 2 // 2 lessons untuk module lainnya
		}

		for i := 1; i <= lessonCount; i++ {
			lessonNo := strconv.Itoa(i)
			isVideoLesson := i%2 == 0

			// Buat sample content JSON
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

			// Cek apakah lesson sudah ada
			if err := db.Where("module_uid = ? AND title = ?", module.Uid, lesson.Title).First(&entity.Lesson{}).Error; err == gorm.ErrRecordNotFound {
				if err := db.Create(&lesson).Error; err != nil {
					log.Printf("[Error] Gagal membuat lesson %s: %v", lesson.Title, err)
				} else {
					log.Printf("[Success] Lesson %s berhasil dibuat", lesson.Title)
				}
			}
		}
	}
}

// seedLessonAssignments membuat assignment dasar untuk lesson pertama di setiap module.
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

		if err := db.Where("lesson_uid = ?", lesson.Uid).First(&entity.LessonAssignment{}).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&assignment).Error; err != nil {
				log.Printf("[Error] Gagal membuat assignment untuk lesson %s: %v", lesson.Title, err)
			} else {
				log.Printf("[Success] Assignment untuk lesson %s berhasil dibuat", lesson.Title)
			}
		}
	}
}
