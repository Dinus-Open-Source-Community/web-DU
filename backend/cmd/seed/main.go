// Command incremental seeder — menambah/memperbarui data seed tanpa menghapus DB.
//
// Usage (dari folder backend):
//
//	go run ./cmd/seed
//
// Pastikan .env sudah berisi kredensial DB yang sama dengan environment dev kamu.
package main

import (
	"backend/internal/database"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("[Seed CLI] .env tidak ditemukan, memakai environment variable sistem")
	}

	database.ConnectDB()

	log.Println("[Seed CLI] Mode incremental — data yang sudah ada TIDAK dihapus")
	log.Println("[Seed CLI] Hanya record baru / patch ringan yang diterapkan")

	database.RunSeeder(database.DB)

	log.Println("[Seed CLI] Selesai")
	os.Exit(0)
}
