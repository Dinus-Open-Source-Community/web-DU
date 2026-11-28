package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// Route DOSCOM SSO (/auth/sso/*). Sengaja terpisah dari /oauth/google/*
// supaya konfigurasi & cookie keduanya tidak saling mengganggu.
func init() {
	setup.RegisterRoute(StartSSORoutes)
}

func StartSSORoutes(r *gin.Engine) {
	ssoGroup := r.Group("/auth/sso")
	{
		ssoGroup.GET("/login", service.SSOLoginHandler)       // titik awal: redirect browser ke /authorize milik SSO
		ssoGroup.GET("/callback", service.SSOCallbackHandler) // callback SSO: tukar code → token → JWT lokal → redirect ke frontend

		// Bind akun lokal ke akun DOSCOM (Settings).
		ssoGroup.POST("/bind", middleware.AuthMiddleware(), service.SSOBindStartHandler) // minta URL form bind
		ssoGroup.GET("/bind/status", middleware.AuthMiddleware(), service.SSOBindStatusHandler)
		ssoGroup.GET("/bind/callback", service.SSOBindCallbackHandler) // redirect balik dari sso-auth + bind_token
	}
}
