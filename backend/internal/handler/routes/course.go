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
		publicCourseGroup.GET("/", service.GetAllCoursesFunc)                        // all roles - anonymous user
		publicCourseGroup.GET("/:id", service.GetCourseByIDFunc)                     // all roles - anonymous user
		publicCourseGroup.GET("/:id/mentor", service.GetCourseMentorsByCourseIDFunc) // all roles - anonymous user
		publicCourseGroup.GET("/:id/students", service.GetCourseStudentsFunc)        // all roles - anonymous user
	}

	authCourseGroup := r.Group("/courses")
	authCourseGroup.Use(middleware.AuthMiddleware())
	{
		authCourseGroup.POST("/:id/join", service.JoinCourseFunc)                                 // Students only
		authCourseGroup.POST("/:id/review", service.CreateCourseReviewFunc)                       // Enrolled students only
		authCourseGroup.POST("/:id/review/:review_id/reply", service.CreateCourseReviewReplyFunc) // Mentor+ only
		authCourseGroup.PATCH("/:id/status", service.ActivateCourseStatusFunc)                    // Admin only
		authCourseGroup.POST("/:id/mentors/assign", service.AssignMentorsToCourseFunc)            // Admin only

		authCourseGroup.POST("/", service.PostAdminCourseFunc) // Admin only
	}

	// Invoice routes
	invoiceGroup := r.Group("/invoices")
	invoiceGroup.Use(middleware.AuthMiddleware())
	{
		invoiceGroup.GET("/url", service.GetInvoiceURLFunc)                   // Query params: enrollment_id, user_id, course_id
		invoiceGroup.GET("/:enrollment_id", service.GetEnrollmentInvoiceFunc) // Path param: enrollment_id
	}
}
