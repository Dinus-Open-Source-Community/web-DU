package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StartLoginRoutes(r *gin.Engine) {
	login := r.Group("/login")
	{
		login.POST("", postLoginFunc)
	}
}

func postLoginFunc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "User logged in successfully!",
	})
}
