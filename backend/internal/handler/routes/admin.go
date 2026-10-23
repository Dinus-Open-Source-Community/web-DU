package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartAdminRoutes)
}

func StartAdminRoutes(r *gin.Engine) {
	adminGroup := r.Group("/admin")
	adminGroup.Use(middleware.AuthMiddleware())
	{
		adminGroup.GET("/dashboard/kpis", service.GetAdminDashboardKPIsFunc)
		adminGroup.GET("/dashboard/analytics", service.GetAdminDashboardAnalyticsFunc)
		adminGroup.GET("/reviews", service.GetAdminReviewsFunc)
		adminGroup.POST("/reviews/:review_id/reply", service.CreateAdminReviewReplyFunc)
		adminGroup.GET("/qna", service.GetAdminQnaFunc)
		adminGroup.POST("/qna/:thread_id/replies", service.CreateAdminQnaReplyFunc)
	}
}
