package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func init() {
	RegisterRoute(StartUserRoutes)
}

func StartUserRoutes(r *gin.Engine) {
	userGroup := r.Group("/user")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.GET("/data", services.GetUserDataService)
		userGroup.GET("/all", services.GetUserDataService)
	}
}
