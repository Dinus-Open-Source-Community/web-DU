package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartFileProxyRoutes)
}

// StartFileProxyRoutes mendaftarkan endpoint proxy unduh file. Route ini
// menerima path bertipe wildcard agar object key yang mengandung slash
// (subfolder) tetap dapat dilayani. Wajib Bearer JWT (semua role); anonymous
// tidak diizinkan.
func StartFileProxyRoutes(r *gin.Engine) {
	fileGroup := r.Group("/files")
	fileGroup.Use(middleware.AuthMiddleware())
	{
		fileGroup.GET("/:bucket/*object", service.ServeFileProxyFunc)
	}
}
