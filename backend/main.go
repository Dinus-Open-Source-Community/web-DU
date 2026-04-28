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
	"backend/internal/utils"
	"log"
	"net/http"
	"os"
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

	// Initialize MinIO
	if err := utils.InitMinio(); err != nil {
		log.Fatalf("MinIO initialization failed: %v", err)
	}
}

func main() {
	r := gin.Default()
	
	r.RedirectTrailingSlash = false

	// CORS harus didaftarkan paling awal supaya ikut jalan pada semua
	// request, termasuk preflight OPTIONS sebelum handler mana pun.
	r.Use(middleware.CORSMiddleware())
	r.Use(gin.Recovery())

	// Connect to the database
	database.ConnectDB()

	// Run seeder jika SEED=true di environment variable
	if os.Getenv("SEED") == "true" {
		database.RunSeeder(database.DB)
	}

	// Setup all routes
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

	// Karena RedirectTrailingSlash dimatikan, kita lakukan normalisasi path
	// tanpa redirect agar frontend (CORS) tidak terganggu.
	// Kumpulkan semua route terdaftar untuk cek cepat (hanya path yang terdaftar)
	routeSet := make(map[string]struct{})
	for _, ri := range r.Routes() {
		routeSet[ri.Path] = struct{}{}
	}

	// Wrapper handler yang menormalisasi trailing slash tanpa mengembalikan 301/302
	handler := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if _, ok := routeSet[req.URL.Path]; ok {
			r.ServeHTTP(w, req)
			return
		}
		alt := req.URL.Path
		if strings.HasSuffix(alt, "/") {
			alt = strings.TrimSuffix(alt, "/")
		} else {
			alt = alt + "/"
		}
		if _, ok := routeSet[alt]; ok {
			req2 := req.Clone(req.Context())
			req2.URL.Path = alt
			r.ServeHTTP(w, req2)
			return
		}
		r.ServeHTTP(w, req)
	})

	log.Println("Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
