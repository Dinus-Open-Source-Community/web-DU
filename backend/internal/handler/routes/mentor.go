package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartMentorRoutes)
}

func StartMentorRoutes(r *gin.Engine) {
	publicMentorGroup := r.Group("/mentor")
	{
		publicMentorGroup.GET("/all", service.GetAllMentorsFunc)   // all roles - anonymous user
		publicMentorGroup.GET("/:id", service.GetMentorDetailFunc) // all roles - anonymous user
	}
}
