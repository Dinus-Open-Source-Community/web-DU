package routes

import (
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

func StartLoginRoutes(r *gin.Engine) {
	login := r.Group("/login")
	{
		login.POST("", services.PostLoginFunc)
	}
}
