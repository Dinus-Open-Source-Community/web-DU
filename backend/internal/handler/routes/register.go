package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartRegisterRoutes)
}

func StartRegisterRoutes(r *gin.Engine) {
	registerGroup := r.Group("/register")
	{
		registerGroup.POST("/", service.PostRegisterFunc) // user registration
	}
}
