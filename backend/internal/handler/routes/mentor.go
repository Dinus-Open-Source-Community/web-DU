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
	mentorGroup.Use(middleware.AuthMiddleware())
	{
		mentorGroup.GET("/all", service.GetAllMentorsFunc)                                 // All roles
		mentorGroup.GET("/:id", service.GetMentorDetailFunc)                               // All roles
	}
}
