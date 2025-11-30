package routes

import (
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

// StartLoginRoutes godoc
// @Summary Login route initialization
// @Description Group of routes used for user authentication (login)
// @Tags Auth
// @Router /login [post]
// @Accept  json
// @Produce  json
// @Param request body model.LoginRequest true "User login data"
// @Success 200 {object} map[string]any "User logged in successfully"
// @Failure 400 {object} map[string]any "Invalid request data"
// @Failure 401 {object} map[string]any "Invalid credentials"
// @Failure 500 {object} map[string]any "Failed to generate token"
func StartLoginRoutes(r *gin.Engine) {
	loginGroup := r.Group("/login")
	{
		loginGroup.POST("/", services.PostLoginFunc)
	}
}
