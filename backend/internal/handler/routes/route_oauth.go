package routes

import (
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func init() {
	RegisterRoute(StartOauth2Routes)
}

func StartOauth2Routes(r *gin.Engine) {
	oAuthGroup := r.Group("/oauth")
	{
		oAuthGroup.GET("/google/login", services.LoginOAuth)
		oAuthGroup.GET("/google/callback", services.CallbackHandler)
	}
}
