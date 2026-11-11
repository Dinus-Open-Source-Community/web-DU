// Digunakan untuk melakukan insert ENUM pada database PostgreSQL
// Dikarenakan GORM tidak mendukung pembuatan tipe data ENUM secara langsung.

package database

import (
	"log"

	"gorm.io/gorm"
)

// CreateAllEnums digunakan untuk membuat seluruh tipe ENUM yang dibutuhkan oleh aplikasi.
// Fungsi ini menjadi pusat inisialisasi ENUM agar semua tipe ENUM hanya dibuat di satu tempat,
// sehingga mudah dikelola dan di-maintain.
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang terhubung dengan database PostgreSQL.
func CreateAllEnums(db *gorm.DB) {
	// Selalu gunakan migrasi enum yang idempotent, jangan drop enum karena bisa
	// menghapus dependency kolom/tabel dan menyebabkan data tidak konsisten.
	createUserRoleEnum(db)
	createEnrollmentStatusEnum(db)
	createCourseLevelEnum(db)
	createCourseStatusEnum(db)

	// Log bahwa seluruh ENUM berhasil diinisialisasi
	log.Println("[Success] All ENUMs have been created")
}

func ensureEnumType(db *gorm.DB, typeName string, values []string) {
	createQuery := `DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '` + typeName + `') THEN
		EXECUTE 'CREATE TYPE ` + typeName + ` AS ENUM (' || `

	for i, v := range values {
		if i > 0 {
			createQuery += ` || ',' || `
		}
		createQuery += `quote_literal('` + v + `')`
	}

	createQuery += ` || ')';
	END IF;
END $$;`

	if err := db.Exec(createQuery).Error; err != nil {
		log.Printf("[Warning] Failed to create ENUM %s: %v\n", typeName, err)
		return
	}

	for _, v := range values {
		alterQuery := `ALTER TYPE ` + typeName + ` ADD VALUE IF NOT EXISTS '` + v + `';`
		if err := db.Exec(alterQuery).Error; err != nil {
			log.Printf("[Warning] Failed to ensure ENUM value %s.%s: %v\n", typeName, v, err)
		}
	}
}

// createUserRoleEnum digunakan untuk membuat ENUM bernama `user_role`
// di database PostgreSQL.
//
// ENUM ini berisi tiga nilai tetap:
// - 'super_admin' → untuk pengguna dengan hak akses tertinggi
// - 'admin'   → untuk pengguna dengan hak akses penuh
// - 'mentor'  → untuk pengguna pengajar atau pembimbing
// - 'student' → untuk pengguna pelajar
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createUserRoleEnum(db *gorm.DB) {
	ensureEnumType(db, "user_role", []string{"super_admin", "admin", "mentor", "student"})

	log.Println("[Success] ENUM user_role is ready for use")
}

// createEnrollmentStatusEnum digunakan untuk membuat ENUM bernama `enrollment_status`
// di database PostgreSQL.
//
// ENUM ini berisi dua nilai tetap:
// - 'active'    → untuk status pendaftaran yang sedang aktif
// - 'completed' → untuk status pendaftaran yang telah selesai
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createEnrollmentStatusEnum(db *gorm.DB) {
	ensureEnumType(db, "enrollment_status", []string{"active", "completed"})

	// Pastikan data lama yang berstatus pending atau cancelled diubah menjadi active
	_ = db.Exec("UPDATE enrollments SET status = 'active' WHERE status::text IN ('pending', 'cancelled')").Error

	log.Println("[Success] ENUM enrollment_status is ready for use")
}

func createCourseLevelEnum(db *gorm.DB) {
	ensureEnumType(db, "course_level", []string{"PEMULA", "MENENGAH", "LANJUTAN"})

	log.Println("[Success] ENUM course_level is ready for use")
}

func createCourseStatusEnum(db *gorm.DB) {
	ensureEnumType(db, "course_status", []string{"DRAFT", "ACTIVE", "TIDAK ACTIVE"})

	log.Println("[Success] ENUM course_status is ready for use")
}
