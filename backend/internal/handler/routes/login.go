package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartLoginRoutes)
}

func StartLoginRoutes(r *gin.Engine) {
	// Didaftarkan di "/login" (tanpa trailing slash) supaya cocok dengan
	// URL yang dipanggil FE (API_ROUTES.auth.login -> `${API_BASE_URL}/login`).
	// Versi dengan slash juga didaftarkan biar aman kalau ada client lama
	// yang meng-hit `/login/`. Kombinasi ini + `RedirectTrailingSlash = false`
	// di main.go memastikan TIDAK ada 301/307 redirect yang bikin preflight
	// CORS diblokir browser.
	r.POST("/login", service.PostLoginFunc)
	r.POST("/login/", service.PostLoginFunc)
}
