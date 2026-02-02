package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartCourseRoutes)
}

func StartCourseRoutes(r *gin.Engine) {
	courseGroup := r.Group("/courses")
	courseGroup.Use(middleware.AuthMiddleware())
	{
		courseGroup.GET("/:id", service.GetCourseByIDFunc) // users - all roles
		courseGroup.GET("/", service.GetAllCoursesFunc)    // users - all roles
		courseGroup.POST("/", service.PostAdminCourseFunc) // Admin only
		courseGroup.GET("/:id/students", service.GetCourseStudentsFunc) // Admin only
		courseGroup.POST("/:id/join", service.JoinCourseFunc)           // Students only
	}
}
