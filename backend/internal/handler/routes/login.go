package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartLoginRoutes)
}

func StartLoginRoutes(r *gin.Engine) {
	r.POST("/login", service.PostLoginFunc)
}
