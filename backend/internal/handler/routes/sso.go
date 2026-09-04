package routes

import (
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
	}
}
