package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterHelloRoutes(r *gin.Engine) {
	hello := r.Group("/hello")
	{
		hello.GET("", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Hello from Golang Backend!",
			})
		})
	}
}
