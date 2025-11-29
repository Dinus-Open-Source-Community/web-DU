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
	// 1️⃣ Buat ENUM untuk role user (admin, mentor, student)
	createUserRoleEnum(db)
	createEnrollmentStatusEnum(db)
	createPaymentMethodEnum(db)
	createPaymentStatusEnum(db)

	// 2️⃣ Log bahwa seluruh ENUM berhasil diinisialisasi
	log.Println("[Success] All ENUMs have been created")
}

// createUserRoleEnum digunakan untuk membuat ENUM bernama `user_role`
// di database PostgreSQL jika belum ada sebelumnya.
//
// ENUM ini berisi tiga nilai tetap:
// - 'admin'   → untuk pengguna dengan hak akses penuh
// - 'mentor'  → untuk pengguna pengajar atau pembimbing
// - 'student' → untuk pengguna pelajar
//
// Fungsi ini menjalankan query SQL menggunakan blok DO $$ BEGIN ... END $$
// untuk membuat ENUM hanya jika belum terdaftar di sistem PostgreSQL.
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createUserRoleEnum(db *gorm.DB) {
	query := `
	DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
			CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');
		END IF;
	END $$;
	`
	db.Exec(query)

	log.Println("[Success] ENUM user_role is ready for use")
}

func createEnrollmentStatusEnum(db *gorm.DB) {
	query := `
	DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
			CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'cancelled');
		END IF;
	END $$;
	`
	db.Exec(query)

	log.Println("[Success] ENUM enrollment_status is ready for use")
}

func createPaymentMethodEnum(db *gorm.DB) {
	query := `
	DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
			CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'ewallet');
		END IF;
	END $$;
	`
	db.Exec(query)

	log.Println("[Success] ENUM payment_method is ready for use")
}

func createPaymentStatusEnum(db *gorm.DB) {
	query := `
	DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
			CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');
		END IF;
	END $$;
	`
	db.Exec(query)

	log.Println("[Success] ENUM payment_status is ready for use")
}