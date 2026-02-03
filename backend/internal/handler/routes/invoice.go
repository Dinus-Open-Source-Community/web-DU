package routes

import (
	"backend/internal/handler/middleware"

	"github.com/gin-gonic/gin"
)

func InvoiceRoutes(router *gin.Engine) {
	handler := middleware.NewInvoiceHandler()

	invoice := router.Group("/invoice")
	{
		invoice.POST("/generate", handler.CreateInvoice)
	}
}
