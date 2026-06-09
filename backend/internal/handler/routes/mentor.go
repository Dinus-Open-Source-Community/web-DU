package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartMentorRoutes)
}

func StartMentorRoutes(r *gin.Engine) {
	mentorGroup := r.Group("/mentor")
	{
		mentorGroup.GET("/all", service.GetAllMentorsFunc) // Public

		dashboardGroup := mentorGroup.Group("/dashboard")
		dashboardGroup.Use(middleware.AuthMiddleware())
		{
			dashboardGroup.GET("/kpis", service.GetMentorDashboardKPIsFunc)           // Mentor / Admin
			dashboardGroup.GET("/schedules", service.GetMentorDashboardSchedulesFunc) // Mentor / Admin
		}

		mentorGroup.GET("/:id", service.GetMentorDetailFunc) // Public — register after /dashboard/*
	}
}
