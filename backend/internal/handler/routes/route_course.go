package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func init() {
	RegisterRoute(StartCourseRoutes)
}

func StartCourseRoutes(r *gin.Engine) {
	courseGroup := r.Group("/courses")
	courseGroup.Use(middleware.AuthMiddleware())
	{
		courseGroup.GET("/:id", services.GetCourseByIDFunc) // Authenticated users - all roles
		courseGroup.GET("/", services.GetAllCoursesFunc)    // Admin only
		courseGroup.POST("/", services.PostAdminCourseFunc) // Admin only
	}
}
