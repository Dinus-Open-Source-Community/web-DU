package routes

import (
	// "backend/internal/handler/middleware"
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

func StartRegisterRoutes(r *gin.Engine) {
	register := r.Group("/register")
	{
		register.POST("", services.PostRegisterFunc)
	}
}
