package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartLessonsRoutes)
}

func StartLessonsRoutes(r *gin.Engine) {
	lessonsGroup := r.Group("/lessons")
	lessonsGroup.Use(middleware.AuthMiddleware())
	{
		lessonsGroup.POST("/", service.CreateLessonFunc)      // Admin only - Create lesson
		lessonsGroup.GET("/", service.GetAllLessonsFunc)      // Admin only - Get all lessons by module id
		lessonsGroup.GET("/:id", service.GetLessonByIDFunc)   // Admin only - Get lesson by ID
		lessonsGroup.PUT("/:id", service.UpdateLessonFunc)    // Admin only - Update lesson
		lessonsGroup.DELETE("/:id", service.DeleteLessonFunc) // Admin only - Delete lesson
	}
}
