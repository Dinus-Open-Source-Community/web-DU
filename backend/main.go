// @title Web DU Backend
// @version 1.0
// @description Documentation for Web DU Backend API.

// @host localhost:8080
// @BasePath /
package main

import (
	"backend/internal/database"
	// "backend/internal/handler/middleware"
	"backend/internal/handler/routes"
	"log"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"

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
	// Load .env file (hanya untuk development lokal tanpa docker)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}
}

func main() {
	r := gin.Default()
	r.Use(gin.Recovery())

	// session
	store := cookie.NewStore([]byte("iniperluditaruhenv?"))
	r.Use(sessions.Sessions("inijuga", store))

	database.ConnectDB()

	// Static file server untuk mengakses file upload (avatar, dll)
	// uploads := r.Group("/uploads")
	// uploads.Use(middleware.AuthMiddleware())
	// uploads.Static("/", "./public/uploads")
	r.Static("/uploads", "./public/uploads")

	// Register all routes
	routes.StartRegisterRoutes(r)
	routes.StartLoginRoutes(r)
	routes.StartUserRoutes(r)
	routes.StartAvatarRoutes(r)
	routes.StartCourseRoutes(r)

	//OAuth2 routes
	routes.StartOauth2Routes(r)

	// Swagger endpoint
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}
