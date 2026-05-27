package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartPaymentRoutes)
}

func StartPaymentRoutes(r *gin.Engine) {
	paymentGroup := r.Group("/payment")
	paymentGroup.Use(middleware.AuthMiddleware())
	{
		paymentGroup.POST("/create", service.CreatePaymentFunc) // user
		paymentGroup.GET("", service.GetPaymentFunc)                  // user
		paymentGroup.GET("/tripay", service.GetPaymentTripayFunc)      // user
	}

	// Tidak masuk dalam grup payment karena tidak perlu autentikasi
	// Callback route without authentication (for Tripay webhook)
	r.POST("/payment/callback", service.PaymentCallbackFunc)
}
