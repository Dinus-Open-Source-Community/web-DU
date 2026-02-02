// @title Web DU Backend
// @version 1.0
// @description Documentation for Web DU Backend API.

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
package main

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	// Swagger import
	"backend/docs"

	_ "backend/internal/handler/routes"

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

	database.ConnectDB()

	// Static file server untuk mengakses file upload (avatar, dll)
	uploads := r.Group("/uploads")
	uploads.Use(middleware.AuthMiddleware())
	uploads.Static("/", "./public/uploads")

	setup.SetupAllRoutes(r)

	// Swagger endpoint (dynamic host/scheme for devtunnels/https)
	r.GET("/swagger/*any", func(c *gin.Context) {
		forwardedProto := strings.ToLower(c.GetHeader("X-Forwarded-Proto"))
		if forwardedProto == "https" || c.Request.TLS != nil {
			docs.SwaggerInfo.Schemes = []string{"https"}
		} else {
			docs.SwaggerInfo.Schemes = []string{"http"}
		}

		forwardedHost := c.GetHeader("X-Forwarded-Host")
		if forwardedHost == "" {
			forwardedHost = c.GetHeader("X-Original-Host")
		}
		if forwardedHost != "" {
			docs.SwaggerInfo.Host = forwardedHost
		} else {
			docs.SwaggerInfo.Host = c.Request.Host
		}
		ginSwagger.WrapHandler(swaggerFiles.Handler)(c)
	})

	log.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}
