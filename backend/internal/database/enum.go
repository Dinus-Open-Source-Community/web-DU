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
	createAttendanceStatusEnum(db)
	createPaymentMethodEnum(db)
	createPaymentStatusEnum(db)
	createCourseLevelEnum(db)
	createCourseStatusEnum(db)
	migrateLessonAttendanceStatusEnum(db)

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
// ENUM ini berisi empat nilai tetap:
// - 'pending'   → untuk status pendaftaran yang menunggu konfirmasi
// - 'active'    → untuk status pendaftaran yang sedang aktif
// - 'completed' → untuk status pendaftaran yang telah selesai
// - 'cancelled' → untuk status pendaftaran yang dibatalkan
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createEnrollmentStatusEnum(db *gorm.DB) {
	ensureEnumType(db, "enrollment_status", []string{"pending", "active", "completed", "cancelled"})

	log.Println("[Success] ENUM enrollment_status is ready for use")
}

// createAttendanceStatusEnum digunakan untuk membuat ENUM bernama `attendance_status`
// di database PostgreSQL.
//
// ENUM ini berisi empat nilai tetap:
// - 'present' → untuk status kehadiran tepat waktu
// - 'late'    → untuk status kehadiran terlambat
// - 'absent'  → untuk status tidak hadir
// - 'excused' → untuk status izin
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createAttendanceStatusEnum(db *gorm.DB) {
	ensureEnumType(db, "attendance_status", []string{"present", "late", "absent", "excused"})

	log.Println("[Success] ENUM attendance_status is ready for use")
}

// migrateLessonAttendanceStatusEnum memastikan kolom status pada lesson_attendances
// menggunakan tipe attendance_status dan default 'present' tanpa error casting.
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func migrateLessonAttendanceStatusEnum(db *gorm.DB) {
	query := `DO $$
DECLARE
	current_type text;
BEGIN
	SELECT udt_name INTO current_type
	FROM information_schema.columns
	WHERE table_name = 'lesson_attendances' AND column_name = 'status';

	IF current_type IS NULL THEN
		RETURN;
	END IF;

	IF current_type <> 'attendance_status' THEN
		EXECUTE 'ALTER TABLE lesson_attendances ALTER COLUMN status DROP DEFAULT';
		EXECUTE 'ALTER TABLE lesson_attendances ALTER COLUMN status TYPE attendance_status USING status::attendance_status';
	END IF;

	EXECUTE 'ALTER TABLE lesson_attendances ALTER COLUMN status SET DEFAULT ''present''';
END $$;`

	if err := db.Exec(query).Error; err != nil {
		log.Printf("[Warning] Failed to migrate lesson_attendances.status: %v\n", err)
		return
	}

	log.Println("[Success] lesson_attendances.status migrated to attendance_status")
}

// createPaymentMethodEnum digunakan untuk membuat ENUM bernama `payment_method`
// di database PostgreSQL.
//
// ENUM ini berisi tiga nilai tetap:
// - 'credit_card'   → untuk metode pembayaran menggunakan kartu kredit
// - 'bank_transfer' → untuk metode pembayaran melalui transfer bank
// - 'ewallet'       → untuk metode pembayaran menggunakan dompet digital
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createPaymentMethodEnum(db *gorm.DB) {
	ensureEnumType(db, "payment_method", []string{"PERMATAVA", "BNIVA", "BRIVA", "MANDIRIVA", "BCAVA", "MUAMALATVA", "CIMBVA", "BSIVA", "OCBCVA", "DANAMONVA", "OVO", "DANA", "QRIS2"})

	log.Println("[Success] ENUM payment_method is ready for use")
}

// createPaymentStatusEnum digunakan untuk membuat ENUM bernama `payment_status`
// di database PostgreSQL.
//
// ENUM ini berisi tiga nilai tetap:
// - 'pending' → untuk status pembayaran yang sedang diproses
// - 'success' → untuk status pembayaran yang berhasil
// - 'failed'  → untuk status pembayaran yang gagal
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createPaymentStatusEnum(db *gorm.DB) {
	ensureEnumType(db, "payment_status", []string{"pending", "success", "failed"})

	log.Println("[Success] ENUM payment_status is ready for use")
}

func createCourseLevelEnum(db *gorm.DB) {
	ensureEnumType(db, "course_level", []string{"PEMULA", "MENENGAH", "LANJUTAN"})

	log.Println("[Success] ENUM course_level is ready for use")
}

func createCourseStatusEnum(db *gorm.DB) {
	ensureEnumType(db, "course_status", []string{"DRAFT", "ACTIVE", "TIDAK ACTIVE"})

	log.Println("[Success] ENUM course_status is ready for use")
}
