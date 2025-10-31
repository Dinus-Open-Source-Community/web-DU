// Example penggunaan token jwt dengan middleware AuthMiddleware
package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

// StartDataRoutes godoc
// @Summary Protected data route
// @Description Get user data using JWT authentication
// @Tags Protected
// @Security BearerAuth
// @Router /data [get]
// @Produce  json
// @Success 200 {object} map[string]any "Success response"
// @Failure 401 {object} map[string]any "Unauthorized - Invalid or missing token"
// @Failure 500 {object} map[string]any "Internal server error"
//
// @Example curl -X GET "http://localhost:8080/data" \
// -H "Authorization: Bearer <TOKEN_KAMU>"
func StartDataRoutes(r *gin.Engine) {
	data := r.Group("/data")
	data.Use(middleware.AuthMiddleware())
	{
		data.GET("", services.GetServicefunc)
	}
}
