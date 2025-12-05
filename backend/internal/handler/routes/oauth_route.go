package routes

import (
	"backend/internal/handler/middleware"

	"github.com/gin-gonic/gin"
)

func StartOauth2Routes(oauth *gin.Engine) {
	group := oauth.Group("/oauth")
	{
		group.GET("/", middleware.Home)
		group.GET("/auth/:provider", middleware.SignInWithProvider)
		group.GET("/auth/:provider/callback", middleware.CallbackHandler)
		group.GET("/success", middleware.Success)
	}
}

