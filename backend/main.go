// @title Web DU Backend
// @version 1.0
// @description Documentation for Web DU Backend API.

// @host localhost:8080
// @BasePath /
package main

import (
	"backend/internal/handler/routes"
	"backend/internal/database"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	// Swagger import
	_ "backend/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Setiap ada perubahan pada dokumentasi swagger, jalankan perintah berikut di terminal:
// go run github.com/swaggo/swag/cmd/swag@latest init -g main.go -o ./docs

// Fungsi init() akan dijalankan pertama kali sebelum fungsi main()
// Di sini digunakan untuk memuat file .env agar variabel lingkungan dapat digunakan di seluruh aplikasi
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("[Error] Gagal memuat file .env:", err)
	}
}

func main() {
	r := gin.Default()
	r.Use(gin.Recovery())
	database.ConnectDB()

	// Register all routes
	routes.StartRegisterRoutes(r)
	routes.StartLoginRoutes(r)
	routes.StartDataRoutes(r)

	// Swagger endpoint
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}
