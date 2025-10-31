package services

import (
	"backend/internal/handler/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetServicefunc(c *gin.Context) {
	Name, _ := c.Get(middleware.NameCK)
	Email, _ := c.Get(middleware.EmailCK)
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Hello from Golang Backend!",
		"data": gin.H{
			"name":  Name,
			"email": Email,
		},
		"error": nil,
	})
}
