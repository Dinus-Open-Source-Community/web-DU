package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

func StartUserRoutes(r *gin.Engine) {
	userGroup := r.Group("/user")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.GET("/", services.GetUserService)
	}
}
