package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StartHelloRoutes(r *gin.Engine) {
	hello := r.Group("/hello")
	{
		hello.GET("", getServicefunc)
	}
}

func getServicefunc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Hello from Golang Backend!",
	})
}
