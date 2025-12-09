package routes

import (
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

func init() {
	RegisterRoute(StartOauth2Routes)
}

func StartOauth2Routes(r *gin.Engine) {
	oAuthGroup := r.Group("/oauth")
	{
		oAuthGroup.GET("/", services.Home)
		oAuthGroup.GET("/google/login", services.LoginOAuth)
		oAuthGroup.GET("/google/callback", services.CallbackHandler)
	}
}
