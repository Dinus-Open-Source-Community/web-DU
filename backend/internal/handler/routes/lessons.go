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
		lessonsGroup.POST("/", service.CreateLessonFunc)      // Admin/Mentor - Create lesson
		lessonsGroup.GET("/", service.GetAllLessonsFunc)      // super admin/admin/mentor/enrollment user
		lessonsGroup.GET("/:id", service.GetLessonByIDFunc)   // super admin/admin/mentor/enrollment user
		lessonsGroup.PUT("/:id", service.UpdateLessonFunc)    // Admin/Mentor - Update lesson
		lessonsGroup.DELETE("/:id", service.DeleteLessonFunc) // Admin/Mentor - Delete lesson

		// Reading — tandai lesson sudah dibaca oleh user yang enroll
		lessonsGroup.POST("/:id/read", service.MarkLessonAsReadFunc)      // Student - Mark lesson as read
		lessonsGroup.GET("/:id/read", service.GetLessonReadingStatusFunc) // Student - Check if lesson has been read

		readingGroup := lessonsGroup.Group("/readings")
		{
			readingGroup.GET("/my-history", service.GetMyLessonReadingHistoryFunc)        // Student - Get own reading history
			readingGroup.GET("/lesson/:lesson_id", service.GetLessonReadingsByLessonFunc) // Admin/Mentor - Get all readers for a lesson
		}

	}
}
