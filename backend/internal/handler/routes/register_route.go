package routes

import (
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func StartRegisterRoutes(r *gin.Engine) {
	register := r.Group("/register")
	{
		register.POST("", services.PostRegisterFunc)
	}
}
