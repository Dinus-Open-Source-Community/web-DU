package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartRegisterRoutes)
}

func StartRegisterRoutes(r *gin.Engine) {
	// Didaftarkan di "/register" (tanpa slash) + varian dengan slash biar
	// aman dari 307 redirect yang memblokir preflight CORS.
	// Lihat catatan lebih lengkap di login.go.
	r.POST("/register", service.PostRegisterFunc)
	r.POST("/register/", service.PostRegisterFunc)
}
