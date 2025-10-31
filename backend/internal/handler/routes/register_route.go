package routes

import (
	"backend/internal/handler/services"

	"github.com/gin-gonic/gin"
)

// StartRegisterRoutes godoc
// @Summary Register route initialization
// @Description Group of routes used for user registration
// @Tags Auth
// @Router /register [post]
// @Accept  json
// @Produce  json
// @Param request body model.RegisterRequest true "User registration data"
// @Success 200 {object} map[string]any "User registered successfully"
// @Failure 400 {object} map[string]any "Invalid request data"
// @Failure 409 {object} map[string]any "Email already registered"
// @Failure 500 {object} map[string]any "Internal server error"
func StartRegisterRoutes(r *gin.Engine) {
	register := r.Group("/register")
	{
		register.POST("", services.PostRegisterFunc)
	}
}
