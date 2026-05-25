package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartLessonAssignmentRoutes)
}

func StartLessonAssignmentRoutes(r *gin.Engine) {
	lessonAssignmentGroup := r.Group("/lessons")
	lessonAssignmentGroup.Use(middleware.AuthMiddleware())
	{
		lessonAssignmentGroup.POST("/:id/assignment", service.CreateLessonAssignmentFunc)
		lessonAssignmentGroup.GET("/:id/assignment", service.GetLessonAssignmentFunc)
		lessonAssignmentGroup.PUT("/:id/assignment", service.UpdateLessonAssignmentFunc)
		lessonAssignmentGroup.DELETE("/:id/assignment", service.DeleteLessonAssignmentFunc)
	}
}
