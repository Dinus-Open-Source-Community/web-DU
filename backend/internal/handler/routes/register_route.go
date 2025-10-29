package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func StartRegisterRoutes(r *gin.Engine) {
	// iki gen di cek nk middleware sek 
	r.Use(middleware.ErrorHandlerMiddleware())
	r.Use(middleware.AuthForMiddleware())

	// iki nembe reng route e
	register := r.Group("/register")
	{
		register.POST("", services.PostRegisterFunc)
	}
}
