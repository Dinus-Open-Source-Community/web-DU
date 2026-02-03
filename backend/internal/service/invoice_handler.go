package service

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	invoiceService *InvoiceService
}

func NewInvoiceHandler() *InvoiceHandler {
	return &InvoiceHandler{
		invoiceService: NewInvoiceService(),
	}
}

func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var req struct {
		Email  string  `json:"email"`
		Amount float64 `json:"amount"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	path, err := h.invoiceService.GenerateAndSendInvoice(req.Email, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "invoice generated and sent",
		"path":    path,
	})
}
