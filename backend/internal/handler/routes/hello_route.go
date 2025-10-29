package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func StartHelloRoutes(r *gin.Engine) {
	// iki reng middleware sek ya 
	r.Use(middleware.ErrorHandlerMiddleware())
	r.Use(middleware.AuthForMiddleware())

	// lha iki lagi lanjut ng route e 
	hello := r.Group("/hello")
	{
		hello.GET("", services.GetServicefunc)
	}
}

