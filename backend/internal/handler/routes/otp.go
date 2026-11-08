package routes

import (
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartOTPRoutes)
}

func StartOTPRoutes(r *gin.Engine) {
	// Root paths
	r.POST("/verify-otp", service.VerifyOTPFunc)
	r.POST("/resend-otp", service.ResendOTPFunc)

	// /auth aliases
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/verify-otp", service.VerifyOTPFunc)
		authGroup.POST("/resend-otp", service.ResendOTPFunc)
	}
}
