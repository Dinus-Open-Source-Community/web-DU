package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func StartLoginRoutes(r *gin.Engine) {
	// reng middleware sek
	r.Use(middleware.ErrorHandlerMiddleware())
	r.Use(middleware.LogginForMiddleware())

	// nembe ng route e
	login := r.Group("/login")
	{
		login.POST("", services.PostLoginFunc)
	}
}
