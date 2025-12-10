package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartRegisterRoutes)
}

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
	registerGroup := r.Group("/register")
	{
		registerGroup.POST("/", service.PostRegisterFunc)
	}
}
