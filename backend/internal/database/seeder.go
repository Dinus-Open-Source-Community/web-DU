package database

import (
	"backend/internal/model/entity"
	"encoding/json"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// RunSeeder menjalankan semua seeder untuk database
func RunSeeder(db *gorm.DB) {
	log.Println("[Seeder] Memulai proses seeding database...")

	// Jalankan seeder secara berurutan
	seedUsers(db)
	seedCourses(db)
	seedModules(db)
	seedLessons(db)

	log.Println("[Seeder] Seeding database selesai!")
}

// seedUsers membuat user data (1 admin dan 2 student)
func seedUsers(db *gorm.DB) {
	log.Println("[Seeder] Seeding Users...")

	users := []entity.User{
		{
			Name:        "Admin User",
			Email:       "admin@doscom.id",
			EmailHash:   "admin@doscom.id",
			Password:    hashPassword("admin123"),
			Role:        entity.AdminRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Admin",
			Description: "Administrator dari platform DU",
		},
		{
			Name:        "Budi Santoso",
			Email:       "budi@doscom.id",
			EmailHash:   "budi@doscom.id",
			Password:    hashPassword("student123"),
			Role:        entity.StudentRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Budi",
			Description: "Mahasiswa Dinus yang aktif belajar",
		},
		{
			Name:        "Siti Nurhaliza",
			Email:       "siti@doscom.id",
			EmailHash:   "siti@doscom.id",
			Password:    hashPassword("student123"),
			Role:        entity.StudentRole,
			IsVerified:  true,
			AvatarURL:   "https://via.placeholder.com/150?text=Siti",
			Description: "Mahasiswa berprestasi di bidang teknologi",
		},
	}

	for _, user := range users {
		// Cek apakah user sudah ada
		if err := db.Where("email = ?", user.Email).First(&entity.User{}).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&user).Error; err != nil {
				log.Printf("[Error] Gagal membuat user %s: %v", user.Name, err)
			} else {
				log.Printf("[Success] User %s berhasil dibuat", user.Name)
			}
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

	courses := []entity.Course{
		{
			MentorID:     &mentor.ID,
			Title:        "Golang Fundamentals",
			Slug:         "golang-fundamentals",
			Description:  "Pelajari dasar-dasar bahasa pemrograman Go dari nol hingga mahir",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=Golang",
			Price:        299000,
			IsPremium:    true,
			IsPublished:  true,
			Slot:         30,
		},
		{
			MentorID:     &mentor.ID,
			Title:        "Web Development dengan Next.js",
			Slug:         "web-development-nextjs",
			Description:  "Buat aplikasi web modern menggunakan Next.js dan React",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=NextJS",
			Price:        349000,
			IsPremium:    true,
			IsPublished:  true,
			Slot:         25,
		},
		{
			MentorID:     &mentor.ID,
			Title:        "Database Design dan SQL",
			Slug:         "database-design-sql",
			Description:  "Desain database yang efisien dan kuasai SQL untuk berbagai kebutuhan",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=Database",
			Price:        279000,
			IsPremium:    false,
			IsPublished:  true,
			Slot:         40,
		},
		{
			MentorID:     &mentor.ID,
			Title:        "REST API Development",
			Slug:         "rest-api-development",
			Description:  "Buat REST API yang robust dan scalable menggunakan best practices",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=RestAPI",
			Price:        299000,
			IsPremium:    true,
			IsPublished:  true,
			Slot:         35,
		},
		{
			MentorID:     &mentor.ID,
			Title:        "DevOps Essentials",
			Slug:         "devops-essentials",
			Description:  "Pelajari deployment, Docker, dan CI/CD pipeline untuk production",
			ThumbnailURL: "https://via.placeholder.com/400x300?text=DevOps",
			Price:        329000,
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
	if err := db.Find(&courses).Error; err != nil {
		log.Printf("[Error] Gagal mengambil courses: %v", err)
		return
	}

	// Data modules untuk masing-masing course
	moduleData := map[uint][]string{
		courses[0].ID: {"Pengenalan Go", "Syntax dan Tipe Data", "Control Flow dan Functions"},
		courses[1].ID: {"React Basics", "Next.js Introduction", "Server Side Rendering"},
		courses[2].ID: {"SQL Basics", "Database Normalization", "Advanced Queries"},
		courses[3].ID: {"API Principles", "Authentication dan Authorization", "Error Handling"},
		courses[4].ID: {"Docker Fundamentals", "CI/CD Pipeline", "Kubernetes Basics"},
	}

	for courseID, moduleNames := range moduleData {
		for idx, name := range moduleNames {
			module := entity.Module{
				CourseID:   courseID,
				Title:      name,
				OrderIndex: idx + 1,
			}

			// Cek apakah module sudah ada
			if err := db.Where("course_id = ? AND title = ?", courseID, name).First(&entity.Module{}).Error; err == gorm.ErrRecordNotFound {
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
			// Buat sample content JSON
			content := map[string]string{
				"intro":    "Pengenalan materi " + module.Title,
				"learning": "Konten pembelajaran untuk poin " + string(rune(i)),
				"summary":  "Ringkasan materi yang telah dipelajari",
			}
			contentJSON, _ := json.Marshal(content)

			lesson := entity.Lesson{
				ModuleID:   module.ID,
				Title:      module.Title + " - Lesson " + string(rune(i)),
				Content:    contentJSON,
				VideoURL:   "https://via.placeholder.com/640x360?text=Lesson+Video",
				StartTime:  now.AddDate(0, 0, i),
				EndTime:    now.AddDate(0, 0, i).Add(2 * time.Hour),
				OrderIndex: i,
			}

			// Cek apakah lesson sudah ada
			if err := db.Where("module_id = ? AND title = ?", module.ID, lesson.Title).First(&entity.Lesson{}).Error; err == gorm.ErrRecordNotFound {
				if err := db.Create(&lesson).Error; err != nil {
					log.Printf("[Error] Gagal membuat lesson %s: %v", lesson.Title, err)
				} else {
					log.Printf("[Success] Lesson %s berhasil dibuat", lesson.Title)
				}
			}
		}
	}
}

// hashPassword menggunakan bcrypt untuk hash password
func hashPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[Error] Gagal hash password: %v", err)
		return ""
	}
	return string(hashedPassword)
}
