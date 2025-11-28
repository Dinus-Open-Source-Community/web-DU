package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

func StartUserRoutes(r *gin.Engine) {
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware())
	{
		user.GET("", services.GetUserService)
	}
}
