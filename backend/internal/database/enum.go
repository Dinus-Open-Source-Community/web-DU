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
	// 1️⃣ Hapus ENUM lama jika ada (untuk update ke versi terbaru)
	dropAllEnums(db)

	// 2️⃣ Buat ENUM baru dengan nilai-nilai terbaru
	createUserRoleEnum(db)
	createEnrollmentStatusEnum(db)
	createPaymentMethodEnum(db)
	createPaymentStatusEnum(db)

	// 3️⃣ Log bahwa seluruh ENUM berhasil diinisialisasi
	log.Println("[Success] All ENUMs have been created")
}

// dropAllEnums digunakan untuk menghapus seluruh ENUM lama dari database.
// Ini diperlukan karena ENUM di PostgreSQL tidak bisa dimodifikasi langsung,
// harus dihapus terlebih dahulu sebelum dibuat ulang dengan nilai-nilai baru.
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func dropAllEnums(db *gorm.DB) {
	// Urutkan drop berdasarkan dependency (payment_status dan payment_method tidak ada dependency)
	enums := []string{"payment_status", "payment_method", "enrollment_status", "user_role"}

	for _, enumName := range enums {
		query := `DROP TYPE IF EXISTS ` + enumName + ` CASCADE;`
		if err := db.Exec(query).Error; err != nil {
			log.Printf("[Warning] Failed to drop ENUM %s: %v\n", enumName, err)
		}
	}

	log.Println("[Success] All old ENUMs have been dropped")
}

// createUserRoleEnum digunakan untuk membuat ENUM bernama `user_role`
// di database PostgreSQL.
//
// ENUM ini berisi tiga nilai tetap:
// - 'admin'   → untuk pengguna dengan hak akses penuh
// - 'mentor'  → untuk pengguna pengajar atau pembimbing
// - 'student' → untuk pengguna pelajar
//
// Parameter:
//   - db: instance koneksi *gorm.DB yang digunakan untuk menjalankan query.
func createUserRoleEnum(db *gorm.DB) {
	query := `CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');`
	db.Exec(query)

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
	query := `CREATE TYPE enrollment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');`
	db.Exec(query)

	log.Println("[Success] ENUM enrollment_status is ready for use")
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
	query := `CREATE TYPE payment_method AS ENUM ('PERMATAVA', 'BNIVA', 'BRIVA', 'MANDIRIVA', 'BCAVA', 'MUAMALATVA', 'CIMBVA', 'BSIVA', 'OCBCVA', 'DANAMONVA', 'OVO', 'DANA', 'QRIS2');`
	db.Exec(query)

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
	query := `CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');`
	db.Exec(query)

	log.Println("[Success] ENUM payment_status is ready for use")
}
