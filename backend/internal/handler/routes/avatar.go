package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartAvatarRoutes)
}

func StartAvatarRoutes(r *gin.Engine) {
	avatarGroup := r.Group("/avatar")
	avatarGroup.Use(middleware.AuthMiddleware())
	{
		avatarGroup.POST("", service.PostAvatarFunc)
	}
}
