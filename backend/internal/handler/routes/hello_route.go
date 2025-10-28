package routes

import (
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

func StartHelloRoutes(r *gin.Engine) {
	hello := r.Group("/hello")
	{
		hello.GET("", services.GetServicefunc)
	}
}

