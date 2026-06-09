package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartStudentRoutes)
}

func StartStudentRoutes(r *gin.Engine) {
	studentGroup := r.Group("/students")
	studentGroup.Use(middleware.AuthMiddleware())
	{
		studentGroup.GET("/me/assignments", service.GetStudentMyAssignmentsFunc) // Students only
	}
}
