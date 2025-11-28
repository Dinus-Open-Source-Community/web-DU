package database

import (
	"backend/internal/model"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB                                          *gorm.DB
	host, port, user, dbname, password, sslmode string
)

// ConnectDB bertugas untuk melakukan koneksi ke database PostgreSQL
// menggunakan konfigurasi dari environment (.env). Jika database belum ada,
// fungsi ini akan otomatis membuatnya.
func ConnectDB() {
	// Ambil konfigurasi database dari file .env
	host = os.Getenv("DB_HOST")
	port = os.Getenv("DB_PORT")
	user = os.Getenv("DB_USER")
	dbname = os.Getenv("DB_NAME")
	password = os.Getenv("DB_PASSWORD")
	sslmode = os.Getenv("DB_SSLMODE")

	// Fungsi pembantu untuk membuka koneksi ke database dengan error handling otomatis
	openOrFatal := func(dsn string) *gorm.DB {
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info), // Mode logging Info cocok untuk Development
			// Logger: logger.Default.LogMode(logger.Silent), // Gunakan untuk production agar log tidak bising
		})
		if err != nil {
			log.Fatal("[Error] Gagal terhubung ke database:", err)
		}
		return db
	}

	// Buat database jika belum ada
	createDatabase(openOrFatal)

	// Koneksi ulang ke database utama yang sudah dibuat
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&search_path=public", user, password, host, port, dbname, sslmode)
	DB = openOrFatal(dsn)

	// Buat semua enum (jika ada) dan lakukan migrasi tabel model
	CreateAllEnums(DB)
	DB.AutoMigrate(
		&model.User{},
		&model.Event{},
		&model.Course{},
		&model.Module{},
		&model.Lesson{},
		&model.Enrollment{},
		&model.Payment{},
		&model.CourseReview{},
		&model.CourseAnnouncement{},
	)

	log.Println("[Success] Berhasil terhubung ke database")
}

// createDatabase digunakan untuk membuat database PostgreSQL baru jika belum ada.
// Fungsi ini akan melakukan koneksi ke database "postgres" (default admin database),
// kemudian menjalankan query CREATE DATABASE. Jika database sudah ada (kode error 42P04),
// maka proses dilewati tanpa error.
//
// Parameter:
//   - openOrFatal: fungsi pembuka koneksi yang akan menutup program jika terjadi error.
func createDatabase(openOrFatal func(dsn string) *gorm.DB) {
	// Koneksi ke database "postgres" untuk hak akses pembuatan database baru
	// --- PERBAIKAN DI SINI: Menambahkan "/postgres" ke DSN ---
	adminDsn := fmt.Sprintf("postgres://%s:%s@%s:%s/postgres?sslmode=%s&search_path=public", user, password, host, port, sslmode)
	adminDB := openOrFatal(adminDsn)

	// Jalankan query CREATE DATABASE jika belum ada
	if err := adminDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname)).Error; err != nil {
		// Tangani jika database sudah ada (kode error PostgreSQL: 42P04)
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "42P04" {
			// Database sudah ada — abaikan
			log.Println("[Info] Database '" + dbname + "' sudah ada.")
		} else {
			log.Fatalf("[Error] Gagal membuat database: %v", err)
		}
	} else {
		log.Println("[Success] Database '" + dbname + "' berhasil dibuat.")
	}

	// Tutup koneksi ke database admin setelah selesai
	sqlDB, err := adminDB.DB()
	if err != nil {
		log.Fatal("[Error] Gagal mendapatkan instance koneksi database:", err)
	}
	sqlDB.Close()
}
