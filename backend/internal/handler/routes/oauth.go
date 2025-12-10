package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartOauth2Routes)
}

func StartOauth2Routes(r *gin.Engine) {
	oAuthGroup := r.Group("/oauth")
	{
		oAuthGroup.GET("/google/login", service.LoginOAuth)
		oAuthGroup.GET("/google/callback", service.CallbackHandler)
	}
}
