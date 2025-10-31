package database

import (
	"backend/internal/model"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/driver/postgres"
	"gorm.io/gorm/logger"
	"gorm.io/gorm"
)

var (
	DB                                          *gorm.DB
	host, port, user, dbname, password, sslmode string
)

func ConnectDB() {
	host = os.Getenv("DB_HOST")
	port = os.Getenv("DB_PORT")
	user = os.Getenv("DB_USER")
	dbname = os.Getenv("DB_NAME")
	password = os.Getenv("DB_PASSWORD")
	sslmode = os.Getenv("DB_SSLMODE")

	openOrFatal := func(dsn string) *gorm.DB {
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info), // For Development
			// Logger: logger.Default.LogMode(logger.Silent), // For Production
		})
		if err != nil {
			log.Fatal("[Error] Failed connect to database:", err)
		}
		return db
	}

	createDatabase(openOrFatal)

	// Koneksi ke database yang sudah dibuat
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&search_path=public", user, password, host, port, dbname, sslmode)

	DB = openOrFatal(dsn)

	CreateAllEnums(DB)
	DB.AutoMigrate(&model.User{})

	log.Println("[Success] Successfully connected to the database")
}

func createDatabase(openOrFatal func(dsn string) *gorm.DB) {
	// Koneksi ke database "postgres" untuk membuat database baru jika belum ada
	adminDsn := fmt.Sprintf("postgres://%s:%s@%s:%s?sslmode=%s&search_path=public", user, password, host, port, sslmode)

	adminDB := openOrFatal(adminDsn)

	if err := adminDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname)).Error; err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "42P04" {
			// database already exists; ignore
		} else {
			log.Fatalf("[Error] Failed to create database: %v", err)
		}
	} else {
		log.Println("[Success] Database '" + dbname + "' created.")
	}

	sqlDB, err := adminDB.DB()
	if err != nil {
		log.Fatal("[Error] Failed to get database instance:", err)
	}
	sqlDB.Close()
	// End Prosess koneksi ke database "postgres"
}
