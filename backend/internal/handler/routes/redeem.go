package routes

import (
	"backend/internal/handler/middleware"
	"backend/internal/handler/routes/setup"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func init() {
	setup.RegisterRoute(StartRedeemRoutes)
}

func StartRedeemRoutes(r *gin.Engine) {
	// Endpoint penukaran kode redeem (Khusus role student)
	redeemStudentGroup := r.Group("/redeem")
	redeemStudentGroup.Use(middleware.AuthMiddleware(), middleware.StudentOnlyMiddleware())
	{
		redeemStudentGroup.POST("", service.RedeemCourseCodeFunc)
	}

	// Endpoint pembuatan & manajemen kode redeem (Khusus Admin / Mentor)
	adminRedeemGroup := r.Group("/admin/redeem-codes")
	adminRedeemGroup.Use(middleware.AuthMiddleware())
	{
		adminRedeemGroup.POST("", service.GenerateRedeemCodeFunc)
		adminRedeemGroup.GET("", service.ListRedeemCodesFunc)
	}

	// Alias route alternatif untuk generate
	authRedeemGroup := r.Group("/redeem")
	authRedeemGroup.Use(middleware.AuthMiddleware())
	{
		authRedeemGroup.POST("/generate", service.GenerateRedeemCodeFunc)
	}
}
