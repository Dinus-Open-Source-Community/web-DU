package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StartRegisterRoutes(r *gin.Engine) {
	register := r.Group("/register")
	{
		register.POST("", postRegisterFunc)
	}
}

func postRegisterFunc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully!",
	})
}
