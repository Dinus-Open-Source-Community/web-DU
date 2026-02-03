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

		attendanceGroup := lessonsGroup.Group("/attendances")
		{
			attendanceGroup.POST("/", service.CreateAttendanceFunc)                     // Student - Check in for lesson
			attendanceGroup.GET("/check-status", service.CheckAttendanceStatusFunc)     // Student - Check if already attended
			attendanceGroup.GET("/my-history", service.GetMyAttendanceHistoryFunc)      // Student - Get own attendance history
			attendanceGroup.GET("/:id", service.GetAttendanceByIDFunc)                  // Admin only - Get attendance by ID
			attendanceGroup.PUT("/:id", service.UpdateAttendanceFunc)                   // Admin only - Update attendance
			attendanceGroup.DELETE("/:id", service.DeleteAttendanceFunc)                // Admin only - Delete attendance
			attendanceGroup.GET("/lesson/:lesson_id", service.GetLessonAttendancesFunc) // Admin only - Get all attendances for lesson
		}
	}
}
