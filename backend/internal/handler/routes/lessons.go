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

		attendanceGroup := lessonsGroup.Group("/attendances")
		{
			attendanceGroup.POST("/", service.CreateAttendanceFunc)                     // Student - Check in for lesson
			attendanceGroup.GET("/check-status", service.CheckAttendanceStatusFunc)     // Student - Check if already attended
			attendanceGroup.GET("/my-history", service.GetMyAttendanceHistoryFunc)      // Student - Get own attendance history
			attendanceGroup.GET("/:id", service.GetAttendanceByIDFunc)                  // Super Admin / Admin — Get attendance by ID
			attendanceGroup.PUT("/:id", service.UpdateAttendanceFunc)                   // Super Admin / Admin — Update attendance
			attendanceGroup.DELETE("/:id", service.DeleteAttendanceFunc)                // Super Admin / Admin — Delete attendance
			attendanceGroup.GET("/lesson/:lesson_id", service.GetLessonAttendancesFunc) // Super Admin / Admin — Get all attendances for lesson
		}
	}
}
