// Example penggunaan token jwt dengan middleware AuthMiddleware
package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

func init() {
	RegisterRoute(StartAvatarRoutes)
}

// StartAvatarRoutes godoc
// @Summary Protected data route
// @Description Get user data using JWT authentication
// @Tags Protected
// @Security BearerAuth
// @Router /avatar [post]
// @Produce  multipart/form-data
// @Success 200 {object} map[string]any "Success response"
// @Failure 401 {object} map[string]any "Unauthorized - Invalid or missing token"
// @Failure 500 {object} map[string]any "Internal server error"
//
// @Example curl -X POST "http://localhost:8080/avatar" \
// -H "Authorization: Bearer <TOKEN_KAMU>" \
// -F "avatar=@/path/to/avatar.jpg"
func StartAvatarRoutes(r *gin.Engine) {
	avatarGroup := r.Group("/avatar")
	avatarGroup.Use(middleware.AuthMiddleware())
	{
		avatarGroup.POST("/", services.PostAvatarFunc)
	}
}
