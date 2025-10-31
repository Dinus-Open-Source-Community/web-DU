package main

import (
	"backend/internal/handler/routes"
	"log"

	"backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Fungsi init() akan dijalankan pertama kali sebelum fungsi main()
// Di sini digunakan untuk memuat file .env agar variabel lingkungan dapat digunakan di seluruh aplikasi
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("[Error] Gagal memuat file .env:", err)
	}
}

func main() {
	// Membuat instance default dari Gin
	// Secara default sudah termasuk middleware Logger dan Recovery
	r := gin.Default()

	// Menambahkan middleware Recovery untuk menangani panic agar server tidak langsung berhenti
	r.Use(gin.Recovery())

	// Melakukan koneksi ke database menggunakan fungsi dari internal/database
	database.ConnectDB()

	// Inisialisasi route untuk registrasi, login, dan data
	routes.StartRegisterRoutes(r)
	routes.StartLoginRoutes(r)
	routes.StartDataRoutes(r)

	// Menjalankan server Gin pada port 8080
	r.Run(":8080")
}
