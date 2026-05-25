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
	publicCourseGroup := r.Group("/courses")
	{
		publicCourseGroup.GET("/", service.GetAllCoursesFunc)                        // Public
		publicCourseGroup.GET("/:id", service.GetCourseByIDFunc)                     // Public
		publicCourseGroup.GET("/:id/mentor", service.GetCourseMentorsByCourseIDFunc) // Public
		publicCourseGroup.GET("/:id/students", service.GetCourseStudentsFunc)        // Public
	}

	authCourseGroup := r.Group("/courses")
	authCourseGroup.Use(middleware.AuthMiddleware())
	{
		authCourseGroup.POST("/:id/join", service.JoinCourseFunc)                                 // Students only
		authCourseGroup.POST("/:id/review", service.CreateCourseReviewFunc)                       // Enrolled students only
		authCourseGroup.POST("/:id/review/:review_id/reply", service.CreateCourseReviewReplyFunc) // Mentor+ only
		authCourseGroup.PATCH("/:id/status", service.ActivateCourseStatusFunc)                    // Super Admin / Admin
		authCourseGroup.POST("/:id/mentors/assign", service.AssignMentorsToCourseFunc)            // Super Admin / Admin

		authCourseGroup.POST("/", service.PostAdminCourseFunc) // Super Admin / Admin
	}

	// Invoice routes
	invoiceGroup := r.Group("/invoices")
	invoiceGroup.Use(middleware.AuthMiddleware())
	{
		invoiceGroup.GET("/url", service.GetInvoiceURLFunc)                   // Query params: enrollment_id, user_id, course_id
		invoiceGroup.GET("/:enrollment_id", service.GetEnrollmentInvoiceFunc) // Path param: enrollment_id
	}
}
