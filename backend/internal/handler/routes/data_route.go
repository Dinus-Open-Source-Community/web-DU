// Example penggunaan token jwt dengan middleware AuthMiddleware

package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

// CLI untuk nguji route ini:
// curl -X GET http://localhost:8080/data \
//   -H "Authorization: Bearer <TOKEN_KAMU>"

func StartDataRoutes(r *gin.Engine) {
	data := r.Group("/data")
	data.Use(middleware.AuthMiddleware())
	{
		data.GET("", services.GetServicefunc)
	}
}

