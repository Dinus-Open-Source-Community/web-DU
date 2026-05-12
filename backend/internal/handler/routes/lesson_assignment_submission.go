package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartLessonAssignmentSubmissionRoutes)
}

func StartLessonAssignmentSubmissionRoutes(r *gin.Engine) {
	g := r.Group("/lessons")
	g.Use(middleware.AuthMiddleware())
	{
		g.GET("/:id/assignment/submissions", service.ListLessonAssignmentSubmissionsForStaffFunc)
		g.PUT("/:id/assignment/submissions/:submissionUid/grade", service.GradeLessonAssignmentSubmissionForStaffFunc)
		g.GET("/:id/assignment/submissions/:submissionUid", service.GetLessonAssignmentSubmissionForStaffFunc)

		g.GET("/:id/assignment/submission", service.GetMyLessonAssignmentSubmissionFunc)
		g.POST("/:id/assignment/submission", service.CreateLessonAssignmentSubmissionFunc)
		g.PUT("/:id/assignment/submission", service.UpdateLessonAssignmentSubmissionFunc)
	}
}
